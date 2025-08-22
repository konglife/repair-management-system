"use client";

import { ArrowLeft, Receipt, User, Calendar, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "~/app/providers";
import { formatCurrency } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function SaleDetailPageContent({ saleId }: { saleId: string }) {
  const router = useRouter();
  const { data: sale, isLoading, error } = api.sales.getById.useQuery({ id: saleId });

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading sale details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Receipt className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Sale Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error.message || "The requested sale could not be found."}
            </p>
            <Button onClick={() => router.push("/sales")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sales
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!sale) {
    return null;
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/sales")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sales
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Sale Details</h2>
            <p className="text-muted-foreground">
              Sale #{sale.id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Sale Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sale.customer.name}</div>
            <p className="text-xs text-muted-foreground">
              Customer name
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sale Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(sale.createdAt).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDate(sale.createdAt)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(sale.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Sale amount
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(sale.grossProfit)}</div>
            <p className="text-xs text-muted-foreground">
              Revenue - Cost
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sale Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sale Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.saleItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(item.priceAtTime)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(item.priceAtTime * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Sale Summary */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center text-lg">
              <span className="font-medium">Total Items:</span>
              <span>{sale.saleItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between items-center text-lg mt-2">
              <span className="font-medium">Total Cost:</span>
              <span>{formatCurrency(sale.totalCost)}</span>
            </div>
            <div className="flex justify-between items-center text-xl mt-2 pt-2 border-t font-bold">
              <span>Net Total:</span>
              <span>{formatCurrency(sale.totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-lg mt-2 text-green-600">
              <span className="font-medium">Gross Profit:</span>
              <span className="font-bold">{formatCurrency(sale.grossProfit)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}