"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, ShoppingCart, Wrench, Loader2 } from "lucide-react";
import { api } from "~/app/providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CustomerDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CustomerDetailsPage({ params }: CustomerDetailsPageProps) {
  const router = useRouter();
  const { id: customerId } = use(params);

  const { data: customer, isLoading, error } = api.customers.getTransactionHistory.useQuery({ 
    customerId 
  });

  const handleBackToCustomers = () => {
    router.push("/customers");
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBackToCustomers} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Customer Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              The customer you&apos;re looking for doesn&apos;t exist or has been deleted.
            </p>
            <Button onClick={handleBackToCustomers}>
              Return to Customer List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBackToCustomers}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{customer.name}</h2>
            <p className="text-muted-foreground">Customer transaction history and details</p>
          </div>
        </div>
      </div>

      {/* Customer Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-base font-semibold">{customer.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="text-base">{customer.phone || "—"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <p className="text-base">{customer.address || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.sales.length}</div>
            <p className="text-xs text-muted-foreground">
              Sales transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Repairs</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.repairs.length}</div>
            <p className="text-xs text-muted-foreground">
              Repair jobs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Sales History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No sales found for this customer
                    </TableCell>
                  </TableRow>
                ) : (
                  customer.sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {sale.saleItems.length} item{sale.saleItems.length !== 1 ? 's' : ''}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${sale.totalAmount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Repairs History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="h-5 w-5 mr-2" />
            Repairs History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.repairs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No repairs found for this customer
                    </TableCell>
                  </TableRow>
                ) : (
                  customer.repairs.map((repair) => (
                    <TableRow key={repair.id}>
                      <TableCell className="font-medium">
                        {new Date(repair.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{repair.description}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ${repair.totalCost.toFixed(2)}
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