"use client";

import { Users, Plus, Loader2, Edit, Eye, UserPlus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/app/providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "~/components/ui/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  createdAt: Date;
};

// Raw (trimmed, non-empty) term — DataTable handles the empty short-circuit.
const customerPredicate = (customer: Customer, term: string) => {
  const t = term.toLowerCase();
  return (
    customer.name.toLowerCase().includes(t) ||
    !!customer.phone?.toLowerCase().includes(t) ||
    !!customer.address?.toLowerCase().includes(t)
  );
};

export default function CustomersPage() {
  const router = useRouter();

  // State for Add Customer form
  const [showCreateCustomerForm, setShowCreateCustomerForm] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");

  // State for Edit Customer form
  const [showEditCustomerForm, setShowEditCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<{
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
  } | null>(null);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editCustomerPhone, setEditCustomerPhone] = useState("");
  const [editCustomerAddress, setEditCustomerAddress] = useState("");

  // tRPC queries and mutations for customers
  const { data: customers = [], isLoading: customersLoading } =
    api.customers.getAll.useQuery();

  // Analytics queries
  const {
    data: totalCustomers = 0,
    isLoading: totalCustomersLoading,
    error: totalCustomersError,
  } = api.customers.getTotalCount.useQuery();
  const {
    data: newCustomersThisMonth = 0,
    isLoading: newCustomersLoading,
    error: newCustomersError,
  } = api.customers.getNewCustomersThisMonth.useQuery();

  // Utils for query invalidation
  const utils = api.useUtils();

  const createCustomerMutation = api.customers.create.useMutation({
    onSuccess: async () => {
      await utils.customers.getAll.invalidate();
      await utils.customers.getTotalCount.invalidate();
      await utils.customers.getNewCustomersThisMonth.invalidate();
      setShowCreateCustomerForm(false);
      setNewCustomerName("");
      setNewCustomerPhone("");
      setNewCustomerAddress("");
      alert("Customer created successfully!");
    },
    onError: (error) => {
      alert(`Failed to create customer: ${error.message}`);
    },
  });

  const updateCustomerMutation = api.customers.update.useMutation({
    onSuccess: async () => {
      await utils.customers.getAll.invalidate();
      setShowEditCustomerForm(false);
      setEditingCustomer(null);
      setEditCustomerName("");
      setEditCustomerPhone("");
      setEditCustomerAddress("");
      alert("Customer updated successfully!");
    },
    onError: (error) => {
      alert(`Failed to update customer: ${error.message}`);
    },
  });

  // Customer handlers
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;

    createCustomerMutation.mutate({
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim() || undefined,
      address: newCustomerAddress.trim() || undefined,
    });
  };

  const openCreateForm = () => {
    setShowCreateCustomerForm(true);
  };

  const closeCreateForm = () => {
    setShowCreateCustomerForm(false);
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewCustomerAddress("");
  };

  const openEditForm = (customer: {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
  }) => {
    setEditingCustomer(customer);
    setEditCustomerName(customer.name);
    setEditCustomerPhone(customer.phone || "");
    setEditCustomerAddress(customer.address || "");
    setShowEditCustomerForm(true);
  };

  const closeEditForm = () => {
    setShowEditCustomerForm(false);
    setEditingCustomer(null);
    setEditCustomerName("");
    setEditCustomerPhone("");
    setEditCustomerAddress("");
  };

  const handleEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomerName.trim() || !editingCustomer) return;

    updateCustomerMutation.mutate({
      id: editingCustomer.id,
      name: editCustomerName.trim(),
      phone: editCustomerPhone.trim() || undefined,
      address: editCustomerAddress.trim() || undefined,
    });
  };

  const handleViewCustomerDetails = (customerId: string) => {
    router.push(`/customers/${customerId}`);
  };

  const customerColumns: Column<Customer>[] = [
    { header: "Name", className: "font-medium", cell: (c) => c.name },
    { header: "Phone", cell: (c) => c.phone || "—" },
    { header: "Address", cell: (c) => c.address || "—" },
    {
      header: "Created",
      className: "text-muted-foreground",
      cell: (c) => new Date(c.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (c) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewCustomerDetails(c.id)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditForm(c)}
            title="Edit Customer"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">
            Manage your customer database and contact information
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCustomersLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : totalCustomersError ? (
                <span className="text-destructive">Error</span>
              ) : (
                totalCustomers
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalCustomersError
                ? "Failed to load customer count"
                : "Registered customers"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Customers (This Month)
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {newCustomersLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : newCustomersError ? (
                <span className="text-destructive">Error</span>
              ) : (
                newCustomersThisMonth
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {newCustomersError
                ? "Failed to load new customers"
                : "Added this month"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customer List</CardTitle>
            <Button onClick={openCreateForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Customer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            rows={customers}
            columns={customerColumns}
            search={{
              placeholder: "Search by name, phone, or address...",
              predicate: customerPredicate,
            }}
            loading={customersLoading}
            emptyMessage="No customers found. Add your first customer to get started."
            emptySearchMessage="No customers found matching your search."
            pagination={{ pageSize: 25 }}
          />
        </CardContent>
      </Card>

      {/* Add Customer Dialog */}
      <Dialog open={showCreateCustomerForm} onOpenChange={closeCreateForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Enter the customer information. Name is required, phone and
              address are optional.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCustomer}>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="customerName" className="text-sm font-medium">
                  Name *
                </label>
                <Input
                  id="customerName"
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="mt-1"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label htmlFor="customerPhone" className="text-sm font-medium">
                  Phone
                </label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="Enter phone number (optional)"
                  className="mt-1"
                />
              </div>
              <div>
                <label
                  htmlFor="customerAddress"
                  className="text-sm font-medium"
                >
                  Address
                </label>
                <Input
                  id="customerAddress"
                  type="text"
                  value={newCustomerAddress}
                  onChange={(e) => setNewCustomerAddress(e.target.value)}
                  placeholder="Enter address (optional)"
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeCreateForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createCustomerMutation.isPending || !newCustomerName.trim()
                }
              >
                {createCustomerMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Customer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={showEditCustomerForm} onOpenChange={closeEditForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update the customer information. Name is required, phone and
              address are optional.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCustomer}>
            <div className="space-y-4 py-4">
              <div>
                <label
                  htmlFor="editCustomerName"
                  className="text-sm font-medium"
                >
                  Name *
                </label>
                <Input
                  id="editCustomerName"
                  type="text"
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="mt-1"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="editCustomerPhone"
                  className="text-sm font-medium"
                >
                  Phone
                </label>
                <Input
                  id="editCustomerPhone"
                  type="tel"
                  value={editCustomerPhone}
                  onChange={(e) => setEditCustomerPhone(e.target.value)}
                  placeholder="Enter phone number (optional)"
                  className="mt-1"
                />
              </div>
              <div>
                <label
                  htmlFor="editCustomerAddress"
                  className="text-sm font-medium"
                >
                  Address
                </label>
                <Input
                  id="editCustomerAddress"
                  type="text"
                  value={editCustomerAddress}
                  onChange={(e) => setEditCustomerAddress(e.target.value)}
                  placeholder="Enter address (optional)"
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEditForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  updateCustomerMutation.isPending || !editCustomerName.trim()
                }
              >
                {updateCustomerMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Edit className="h-4 w-4 mr-2" />
                )}
                Update Customer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
