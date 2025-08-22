"use client";

import { ShoppingCart, Plus, Loader2, Eye, DollarSign, TrendingUp, Receipt } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/app/providers";
import { formatCurrency } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SaleItem {
  productId: string;
  quantity: number;
  productName?: string;
  unitPrice?: number;
  subtotal?: number;
}

export default function SalesPage() {
  const router = useRouter();
  
  // State for Create Sale form
  const [showCreateSaleForm, setShowCreateSaleForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productQuantity, setProductQuantity] = useState(1);

  // tRPC queries
  const { data: sales = [], refetch: refetchSales, isLoading: salesLoading } = api.sales.getAll.useQuery();
  const { data: customers = [] } = api.customers.getAll.useQuery();
  const { data: products = [] } = api.products.getAll.useQuery();

  // tRPC mutations
  const createSaleMutation = api.sales.create.useMutation({
    onSuccess: () => {
      refetchSales();
      setShowCreateSaleForm(false);
      resetForm();
    },
    onError: (error) => {
      alert(`Failed to create sale: ${error.message}`);
    },
  });

  const resetForm = () => {
    setSelectedCustomerId("");
    setSaleItems([]);
    setSelectedProductId("");
    setProductQuantity(1);
  };

  const addProductToSale = () => {
    if (!selectedProductId || productQuantity <= 0) return;

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    // Check if product is already in the sale
    const existingItemIndex = saleItems.findIndex(item => item.productId === selectedProductId);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...saleItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex]!,
        quantity: updatedItems[existingItemIndex]!.quantity + productQuantity,
        subtotal: (updatedItems[existingItemIndex]!.quantity + productQuantity) * product.salePrice,
      };
      setSaleItems(updatedItems);
    } else {
      // Add new item
      const newItem: SaleItem = {
        productId: selectedProductId,
        quantity: productQuantity,
        productName: product.name,
        unitPrice: product.salePrice,
        subtotal: productQuantity * product.salePrice,
      };
      setSaleItems([...saleItems, newItem]);
    }

    setSelectedProductId("");
    setProductQuantity(1);
  };

  const removeProductFromSale = (productId: string) => {
    setSaleItems(saleItems.filter(item => item.productId !== productId));
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProductFromSale(productId);
      return;
    }

    const updatedItems = saleItems.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity,
          subtotal: quantity * (item.unitPrice || 0),
        };
      }
      return item;
    });
    setSaleItems(updatedItems);
  };

  const calculateTotal = () => {
    return saleItems.reduce((total, item) => total + (item.subtotal || 0), 0);
  };

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || saleItems.length === 0) return;

    createSaleMutation.mutate({
      customerId: selectedCustomerId,
      items: saleItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });
  };

  const openCreateForm = () => {
    setShowCreateSaleForm(true);
  };

  const closeCreateForm = () => {
    setShowCreateSaleForm(false);
    resetForm();
  };

  // Calculate dashboard statistics
  const totalSalesAmount = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalSalesCount = sales.length;
  const averageSaleAmount = totalSalesCount > 0 ? totalSalesAmount / totalSalesCount : 0;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales</h2>
          <p className="text-muted-foreground">Manage sales transactions and view sales history</p>
        </div>
      </div>
      
      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSalesCount}</div>
            <p className="text-xs text-muted-foreground">
              Total transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSalesAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Total revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageSaleAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sales History</CardTitle>
            <Button onClick={openCreateForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Sale
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No sales found. Create your first sale to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{sale.customer.name}</TableCell>
                      <TableCell>{sale.saleItems.length} item(s)</TableCell>
                      <TableCell>{formatCurrency(sale.totalAmount)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="View Details"
                          onClick={() => router.push(`/sales/${sale.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Sale Dialog */}
      <Dialog open={showCreateSaleForm} onOpenChange={closeCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Create New Sale</DialogTitle>
            <DialogDescription>
              Select a customer and add products to create a new sale transaction.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSale}>
            <div className="space-y-6 py-4">
              {/* Customer Selection */}
              <div>
                <Label htmlFor="customer">Customer *</Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} {customer.phone && `(${customer.phone})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product Selection */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">Add Products</h4>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="product">Product</Label>
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products
                          .filter(product => product.quantity > 0) // Only show products with stock
                          .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {formatCurrency(product.salePrice)} (Stock: {product.quantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={productQuantity}
                      onChange={(e) => setProductQuantity(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={addProductToSale}
                    disabled={!selectedProductId || productQuantity <= 0}
                  >
                    Add to Sale
                  </Button>
                </div>
              </div>

              {/* Sale Items List */}
              {saleItems.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-4">Sale Items</h4>
                  <div className="space-y-2">
                    {saleItems.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <span className="font-medium">{item.productName}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {formatCurrency(item.unitPrice || 0)} each
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateProductQuantity(item.productId, Number(e.target.value))}
                            className="w-20"
                          />
                          <span className="w-20 text-right font-medium">
                            {formatCurrency(item.subtotal || 0)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProductFromSale(item.productId)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Total:</span>
                      <span className="text-lg font-bold">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeCreateForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createSaleMutation.isPending || 
                  !selectedCustomerId || 
                  saleItems.length === 0
                }
              >
                {createSaleMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="h-4 w-4 mr-2" />
                )}
                Create Sale
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}