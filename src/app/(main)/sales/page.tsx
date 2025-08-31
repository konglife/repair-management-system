"use client";

import { ShoppingCart, Plus, Loader2, Eye, DollarSign, TrendingUp, Receipt, Package, CalendarIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/app/providers";
import { formatCurrency, formatDisplayDate } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchInput } from "~/components/ui/SearchInput";
import { ProductAutocomplete } from "~/components/ui/ProductAutocomplete";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

// Type interfaces for tRPC query results
interface Product {
  id: string;
  name: string;
  salePrice: number;
  quantity: number;
  averageCost: number;
  categoryId: string;
  unitId: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  createdAt: Date;
}

interface SaleItemWithProduct {
  id: string;
  quantity: number;
  priceAtTime: number;
  costAtTime: number;
  saleId: string;
  productId: string;
  product: Product;
}

interface SaleWithRelations {
  id: string;
  totalAmount: number;
  totalCost: number;
  createdAt: Date;
  customerId: string;
  customer: Customer;
  saleItems: SaleItemWithProduct[];
}

interface SaleItem {
  productId: string;
  quantity: number;
  productName?: string;
  unitPrice?: number;
  subtotal?: number;
}

type DateRange = "today" | "7days" | "1month" | undefined;

export default function SalesPage() {
  const router = useRouter();
  
  // Search state
  const [salesSearchTerm, setSalesSearchTerm] = useState("");
  
  // Date range filter state
  const [dateRange, setDateRange] = useState<DateRange>(undefined);
  
  // State for Create Sale form
  const [showCreateSaleForm, setShowCreateSaleForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productQuantity, setProductQuantity] = useState(1);
  const [saleDate, setSaleDate] = useState<Date | undefined>(new Date());

  // tRPC queries
  const { data: sales = [], isLoading: salesLoading } = api.sales.getAll.useQuery(
    dateRange ? { dateRange } : undefined
  );
  const { data: analytics, isLoading: analyticsLoading } = api.sales.getAnalytics.useQuery(
    dateRange ? { dateRange } : undefined
  );
  const { data: customers = [] } = api.customers.getAll.useQuery();
  const { data: products = [] } = api.products.getAll.useQuery();
  
  // Utils for query invalidation
  const utils = api.useUtils();

  // Filtered data for search functionality
  const filteredSales = useMemo(() => {
    if (!salesSearchTerm.trim()) return sales;
    const searchTerm = salesSearchTerm.toLowerCase();
    return sales.filter((sale: { customer: { name: string }; totalAmount: number; createdAt: string | Date }) => {
      // Search by customer name
      const customerNameMatch = sale.customer.name.toLowerCase().includes(searchTerm);
      
      // Search by date (various formats)
      const dateString = formatDisplayDate(sale.createdAt).toLowerCase();
      const dateMatch = dateString.includes(searchTerm);
      
      // Search by total amount (both number and formatted currency)
      const totalAmountString = sale.totalAmount.toString();
      const formattedAmount = formatCurrency(sale.totalAmount).toLowerCase();
      const amountMatch = totalAmountString.includes(searchTerm) || formattedAmount.includes(searchTerm);
      
      return customerNameMatch || dateMatch || amountMatch;
    });
  }, [sales, salesSearchTerm]);

  // tRPC mutations
  const createSaleMutation = api.sales.create.useMutation({
    onSuccess: async () => {
      await utils.sales.getAll.invalidate();
      await utils.sales.getAnalytics.invalidate();
      setShowCreateSaleForm(false);
      resetForm();
      alert("Sale created successfully!");
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
    setSaleDate(new Date());
  };

  const addProductToSale = () => {
    if (!selectedProductId || productQuantity <= 0) return;

    const product = products.find((p: Product) => p.id === selectedProductId);
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
      saleDate: saleDate ? new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate(), 12, 0, 0) : undefined,
    });
  };

  const openCreateForm = () => {
    setShowCreateSaleForm(true);
  };

  const closeCreateForm = () => {
    setShowCreateSaleForm(false);
    resetForm();
  };

  // Note: displaySales removed as analytics now come from dedicated endpoint

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales</h2>
          <p className="text-muted-foreground">Manage sales transactions and view sales history</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="date-range" className="text-sm font-medium">Filter by:</Label>
          <Select value={dateRange || "all"} onValueChange={(value) => setDateRange(value === "all" ? undefined : value as DateRange)}>
            <SelectTrigger className="w-40" id="date-range">
              <SelectValue placeholder="All time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="1month">Last 1 Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="text-2xl font-bold">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="text-2xl font-bold">{analytics?.totalSales ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Number of sales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="text-2xl font-bold">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(analytics?.totalRevenue ?? 0)}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="text-2xl font-bold">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(analytics?.averageSaleValue ?? 0)}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Selling Product</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="text-2xl font-bold">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="text-lg font-bold truncate">{analytics?.topSellingProduct?.name ?? "None"}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {analytics?.topSellingProduct?.quantity ?? 0} sold
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
          {/* Create Sale Form - Inline */}
          {showCreateSaleForm && (
            <div className="mb-6 p-6 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create New Sale</h3>
                <Button type="button" variant="ghost" size="sm" onClick={closeCreateForm}>
                  ×
                </Button>
              </div>
              <form onSubmit={handleCreateSale}>
                <div className="space-y-6">
                  {/* Customer Selection */}
                  <div>
                    <Label htmlFor="customer">Customer *</Label>
                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer: Customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} {customer.phone && `(${customer.phone})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`mt-1 w-full justify-start text-left font-normal ${
                            !saleDate && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {saleDate ? format(saleDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={saleDate}
                          onSelect={setSaleDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Product Selection */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-medium">Add Products</h4>
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Label htmlFor="product">Product</Label>
                        <div className="mt-1">
                          <ProductAutocomplete
                            products={products}
                            value={selectedProductId}
                            onValueChange={setSelectedProductId}
                            placeholder="Search for a product..."
                          />
                        </div>
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
                          <div key={item.productId} className="flex items-center justify-between p-2 bg-white rounded">
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

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3">
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
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Search Input */}
          <div className="mb-4">
            <SearchInput
              placeholder="Search by customer name, date, or amount..."
              value={salesSearchTerm}
              onChange={setSalesSearchTerm}
              className="max-w-sm"
            />
          </div>
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
                ) : filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      {salesSearchTerm ? "No sales found matching your search." : "No sales found. Create your first sale to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale: SaleWithRelations) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {formatDisplayDate(sale.createdAt)}
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

    </div>
  );
}