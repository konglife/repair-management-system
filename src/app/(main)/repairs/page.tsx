"use client";

import { Wrench, Plus, Loader2, Eye, DollarSign, TrendingUp, Receipt } from "lucide-react";
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

interface UsedPart {
  productId: string;
  quantity: number;
  productName?: string;
  costAtTime?: number;
  partCost?: number;
}

export default function RepairsPage() {
  const router = useRouter();
  
  // State for Create Repair form
  const [showCreateRepairForm, setShowCreateRepairForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [repairDescription, setRepairDescription] = useState("");
  const [totalCost, setTotalCost] = useState<number>(0);
  const [usedParts, setUsedParts] = useState<UsedPart[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [partQuantity, setPartQuantity] = useState(1);

  // tRPC queries
  const { data: repairs = [], refetch: refetchRepairs, isLoading: repairsLoading } = api.repairs.getAll.useQuery();
  const { data: customers = [] } = api.customers.getAll.useQuery();
  const { data: products = [] } = api.products.getAll.useQuery();

  // tRPC mutations
  const createRepairMutation = api.repairs.create.useMutation({
    onSuccess: () => {
      refetchRepairs();
      setShowCreateRepairForm(false);
      resetForm();
    },
    onError: (error) => {
      alert(`Failed to create repair: ${error.message}`);
    },
  });

  const resetForm = () => {
    setSelectedCustomerId("");
    setRepairDescription("");
    setTotalCost(0);
    setUsedParts([]);
    setSelectedProductId("");
    setPartQuantity(1);
  };

  const addPartToRepair = () => {
    if (!selectedProductId || partQuantity <= 0) return;

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    // Check if part is already in the repair
    const existingPartIndex = usedParts.findIndex(part => part.productId === selectedProductId);
    
    if (existingPartIndex >= 0) {
      // Update existing part quantity
      const updatedParts = [...usedParts];
      updatedParts[existingPartIndex] = {
        ...updatedParts[existingPartIndex]!,
        quantity: updatedParts[existingPartIndex]!.quantity + partQuantity,
        partCost: (updatedParts[existingPartIndex]!.quantity + partQuantity) * product.averageCost,
      };
      setUsedParts(updatedParts);
    } else {
      // Add new part
      const newPart: UsedPart = {
        productId: selectedProductId,
        quantity: partQuantity,
        productName: product.name,
        costAtTime: product.averageCost,
        partCost: partQuantity * product.averageCost,
      };
      setUsedParts([...usedParts, newPart]);
    }

    setSelectedProductId("");
    setPartQuantity(1);
  };

  const removePartFromRepair = (productId: string) => {
    setUsedParts(usedParts.filter(part => part.productId !== productId));
  };

  const updatePartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removePartFromRepair(productId);
      return;
    }

    const updatedParts = usedParts.map(part => {
      if (part.productId === productId) {
        return {
          ...part,
          quantity,
          partCost: quantity * (part.costAtTime || 0),
        };
      }
      return part;
    });
    setUsedParts(updatedParts);
  };

  const calculatePartsCost = () => {
    return usedParts.reduce((total, part) => total + (part.partCost || 0), 0);
  };

  const calculateLaborCost = () => {
    return totalCost - calculatePartsCost();
  };

  const handleCreateRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !repairDescription || totalCost <= 0 || usedParts.length === 0) return;

    createRepairMutation.mutate({
      customerId: selectedCustomerId,
      description: repairDescription,
      totalCost: totalCost,
      usedParts: usedParts.map(part => ({
        productId: part.productId,
        quantity: part.quantity,
      })),
    });
  };

  const openCreateForm = () => {
    setShowCreateRepairForm(true);
  };

  const closeCreateForm = () => {
    setShowCreateRepairForm(false);
    resetForm();
  };

  // Calculate dashboard statistics
  const totalRepairAmount = repairs.reduce((sum, repair) => sum + repair.totalCost, 0);
  const totalRepairsCount = repairs.length;
  const averageRepairCost = totalRepairsCount > 0 ? totalRepairAmount / totalRepairsCount : 0;
  const totalLaborAmount = repairs.reduce((sum, repair) => sum + repair.laborCost, 0);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Repairs</h2>
          <p className="text-muted-foreground">Manage repair jobs and view repair history</p>
        </div>
      </div>
      
      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Repairs</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRepairsCount}</div>
            <p className="text-xs text-muted-foreground">
              Total repair jobs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repair Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRepairAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Total revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Repair</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageRepairCost)}</div>
            <p className="text-xs text-muted-foreground">
              Per repair job
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Labor Revenue</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalLaborAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Total labor revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Repairs History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Repair History</CardTitle>
            <Button onClick={openCreateForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Repair Job
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
                  <TableHead>Description</TableHead>
                  <TableHead>Parts Used</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Labor Cost</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repairsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : repairs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No repairs found. Create your first repair job to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  repairs.map((repair) => (
                    <TableRow key={repair.id}>
                      <TableCell className="font-medium">
                        {new Date(repair.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{repair.customer.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{repair.description}</TableCell>
                      <TableCell>{repair.usedParts.length} part(s)</TableCell>
                      <TableCell>{formatCurrency(repair.totalCost)}</TableCell>
                      <TableCell>{formatCurrency(repair.laborCost)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="View Details"
                          onClick={() => router.push(`/repairs/${repair.id}`)}
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

      {/* Create Repair Dialog */}
      <Dialog open={showCreateRepairForm} onOpenChange={closeCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Create New Repair Job</DialogTitle>
            <DialogDescription>
              Select a customer, describe the job, add parts used, and set the total repair cost.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRepair}>
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

              {/* Job Description */}
              <div>
                <Label htmlFor="description">Job Description *</Label>
                <Input
                  id="description"
                  value={repairDescription}
                  onChange={(e) => setRepairDescription(e.target.value)}
                  placeholder="Describe the repair job..."
                  className="mt-1"
                />
              </div>

              {/* Parts Selection */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">Add Parts Used</h4>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="product">Product/Part</Label>
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a part" />
                      </SelectTrigger>
                      <SelectContent>
                        {products
                          .filter(product => product.quantity > 0) // Only show products with stock
                          .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {formatCurrency(product.averageCost)} (Stock: {product.quantity})
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
                      value={partQuantity}
                      onChange={(e) => setPartQuantity(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={addPartToRepair}
                    disabled={!selectedProductId || partQuantity <= 0}
                  >
                    Add Part
                  </Button>
                </div>
              </div>

              {/* Used Parts List */}
              {usedParts.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-4">Parts Used</h4>
                  <div className="space-y-2">
                    {usedParts.map((part) => (
                      <div key={part.productId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <span className="font-medium">{part.productName}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {formatCurrency(part.costAtTime || 0)} each
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            value={part.quantity}
                            onChange={(e) => updatePartQuantity(part.productId, Number(e.target.value))}
                            className="w-20"
                          />
                          <span className="w-20 text-right font-medium">
                            {formatCurrency(part.partCost || 0)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePartFromRepair(part.productId)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Parts Cost:</span>
                      <span className="text-lg font-medium">{formatCurrency(calculatePartsCost())}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Cost */}
              <div>
                <Label htmlFor="totalCost">Total Repair Cost *</Label>
                <Input
                  id="totalCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={totalCost}
                  onChange={(e) => setTotalCost(Number(e.target.value))}
                  placeholder="Enter total repair cost charged to customer"
                  className="mt-1"
                />
                {totalCost > 0 && usedParts.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Labor Cost: {formatCurrency(calculateLaborCost())}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeCreateForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createRepairMutation.isPending || 
                  !selectedCustomerId || 
                  !repairDescription ||
                  totalCost <= 0 ||
                  usedParts.length === 0
                }
              >
                {createRepairMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Wrench className="h-4 w-4 mr-2" />
                )}
                Create Repair Job
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}