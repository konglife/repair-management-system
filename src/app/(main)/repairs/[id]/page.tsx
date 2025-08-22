"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Wrench, User, Calendar, DollarSign, Package, Loader2 } from "lucide-react";
import { api } from "~/app/providers";
import { formatCurrency } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function RepairDetailPage() {
  const params = useParams();
  const router = useRouter();
  const repairId = params.id as string;

  // tRPC query for repair details
  const { 
    data: repair, 
    isLoading, 
    error 
  } = api.repairs.getById.useQuery({ id: repairId });

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !repair) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/repairs")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Repairs
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <h2 className="text-2xl font-semibold mb-2">Repair Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The repair job you&apos;re looking for could not be found.
            </p>
            <Button onClick={() => router.push("/repairs")}>
              Return to Repairs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header with back navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/repairs")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Repairs
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Repair Details</h2>
            <p className="text-muted-foreground">View detailed information about this repair job</p>
          </div>
        </div>
      </div>

      {/* Repair Information Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repair.customer.name}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(repair.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(repair.totalCost)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parts Used</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repair.usedParts.length}</div>
            <p className="text-xs text-muted-foreground">
              Total parts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Job Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{repair.description}</p>
        </CardContent>
      </Card>

      {/* Parts Used */}
      <Card>
        <CardHeader>
          <CardTitle>Parts Used</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Cost per Unit</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repair.usedParts.map((usedPart) => (
                  <TableRow key={usedPart.id}>
                    <TableCell className="font-medium">
                      {usedPart.product.name}
                    </TableCell>
                    <TableCell>{usedPart.quantity}</TableCell>
                    <TableCell>{formatCurrency(usedPart.costAtTime)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(usedPart.quantity * usedPart.costAtTime)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-lg">Parts Cost:</span>
              <span className="text-lg font-semibold">{formatCurrency(repair.partsCost)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-t">
              <span className="text-lg">Labor Cost:</span>
              <span className="text-lg font-semibold">{formatCurrency(repair.laborCost)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-t font-bold text-xl">
              <span>Total Cost:</span>
              <span>{formatCurrency(repair.totalCost)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}