"use client";

import { Wrench, Plus, Loader2, Eye, DollarSign, TrendingUp, Receipt, Package, CalendarIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { api } from "~/app/providers";
import { formatCurrency } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "~/components/ui/CurrencyInput";
import { SearchInput } from "~/components/ui/SearchInput";
import { PartsAutocomplete } from "~/components/ui/PartsAutocomplete";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "~/lib/utils";

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

interface UsedPartWithProduct {
  id: string;
  quantity: number;
  costAtTime: number;
  repairId: string;
  productId: string;
  product: Product;
}

interface RepairWithRelations {
  id: string;
  description: string;
  totalCost: number;
  partsCost: number;
  laborCost: number;
  createdAt: Date;
  customerId: string;
  customer: Customer;
  usedParts: UsedPartWithProduct[];
}

interface UsedPart {
  productId: string;
  quantity: number;
  productName?: string;
  costAtTime?: number;
  partCost?: number;
}

type DateRange = "today" | "7days" | "1month" | undefined;

export default function RepairsPage() {
  const router = useRouter();
  
  // Search state
  const [repairsSearchTerm, setRepairsSearchTerm] = useState("");
  
  // Date range filter state
  const [dateRange, setDateRange] = useState<DateRange>(undefined);
  
  // State for Create Repair form
  const [showCreateRepairForm, setShowCreateRepairForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [repairDescription, setRepairDescription] = useState("");
  const [totalCost, setTotalCost] = useState<number>(0);
  const [usedParts, setUsedParts] = useState<UsedPart[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [partQuantity, setPartQuantity] = useState(1);
  const [repairDate, setRepairDate] = useState<Date | undefined>(undefined);

  // tRPC queries
  const { data: repairs = [], refetch: refetchRepairs, isLoading: repairsLoading } = api.repairs.getAll.useQuery(
    dateRange ? { dateRange } : undefined
  );
  const { data: analytics, refetch: refetchAnalytics, isLoading: analyticsLoading } = api.repairs.getAnalytics.useQuery(
    dateRange ? { dateRange } : undefined
  );
  const { data: customers = [] } = api.customers.getAll.useQuery();
  const { data: products = [] } = api.products.getAll.useQuery();

  // Filtered data for search functionality
  const filteredRepairs = useMemo(() => {
    if (!repairsSearchTerm.trim()) return repairs;
    const searchTerm = repairsSearchTerm.toLowerCase();
    return repairs.filter((repair: { customer: { name: string }; description: string; status?: string }) => {
      // Search by customer name
      const customerNameMatch = repair.customer.name.toLowerCase().includes(searchTerm);
      
      // Search by device/description
      const descriptionMatch = repair.description.toLowerCase().includes(searchTerm);
      
      // Search by status if available (optional field)
      const statusMatch = repair.status?.toLowerCase().includes(searchTerm);
      
      return customerNameMatch || descriptionMatch || statusMatch;
    });
  }, [repairs, repairsSearchTerm]);

  // tRPC mutations
  const createRepairMutation = api.repairs.create.useMutation({
    onSuccess: () => {
      refetchRepairs();
      refetchAnalytics();
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
    setRepairDate(undefined);
  };

  const addPartToRepair = () => {
    if (!selectedProductId || partQuantity <= 0) return;

    const product = products.find((p: Product) => p.id === selectedProductId);
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
      repairDate: repairDate,
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

  // Note: displayRepairs calculation removed as analytics now come from dedicated endpoint

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Repairs</h2>
          <p className="text-muted-foreground">Manage repair jobs and view repair history</p>
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
            <CardTitle className="text-sm font-medium">Total Repairs</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="text-2xl font-bold">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="text-2xl font-bold">{analytics?.totalRepairs ?? 0}</div>
            )}
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
            <CardTitle className="text-sm font-medium">Average Repair</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="text-2xl font-bold">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(analytics?.averageRepairCost ?? 0)}</div>
            )}
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
            {analyticsLoading ? (
              <div className="text-2xl font-bold">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(analytics?.totalLaborRevenue ?? 0)}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total labor revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parts Cost</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="text-2xl font-bold">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(analytics?.totalPartsCost ?? 0)}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Parts used in repairs
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
          {/* Search Input */}
          <div className="mb-4">
            <SearchInput
              placeholder="Search by customer name, device, or status..."
              value={repairsSearchTerm}
              onChange={setRepairsSearchTerm}
              className="max-w-sm"
            />
          </div>
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
                ) : filteredRepairs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      {repairsSearchTerm ? "No repairs found matching your search." : "No repairs found. Create your first repair job to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRepairs.map((repair: RepairWithRelations) => (
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
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Create New Repair Job</DialogTitle>
            <DialogDescription>
              Select a customer, describe the job, add parts used, and set the total repair cost.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRepair}>
            <div className="space-y-8 py-4">
              {/* Basic Information Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
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
                  <div>
                    <Label>Repair Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full mt-1 justify-start text-left font-normal",
                            !repairDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {repairDate ? format(repairDate, "PPP") : <span>Pick a date (optional)</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={repairDate}
                          onSelect={setRepairDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Cost Information</h3>
                  <div>
                    <Label htmlFor="totalCost">Total Repair Cost *</Label>
                    <CurrencyInput
                      value={totalCost}
                      onChange={(value) => setTotalCost(value ?? 0)}
                      placeholder="Enter total repair cost charged to customer"
                      className="mt-1"
                      min={0}
                    />
                    {totalCost > 0 && usedParts.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Labor Cost: {formatCurrency(calculateLaborCost())}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Parts Management Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Parts Management</h3>
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium">Add Parts Used</h4>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="product">Product/Part</Label>
                    <div className="mt-1">
                      <PartsAutocomplete
                        products={products}
                        value={selectedProductId}
                        onValueChange={setSelectedProductId}
                        placeholder="Search for a part..."
                      />
                    </div>
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