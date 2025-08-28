"use client";

import { FileText, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportSummaryPage() {
  const searchParams = useSearchParams();
  
  // Read query parameters
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  
  // Show loading state while waiting for data
  const isLoading = true; // Will be connected to actual data fetching later
  
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Summary Report</h2>
          <p className="text-muted-foreground">
            {startDate && endDate 
              ? `Report for ${startDate} to ${endDate}`
              : "Date range not specified"
            }
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Loading report data...
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Report data will display here</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Data fetching implementation will be added in future stories
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}