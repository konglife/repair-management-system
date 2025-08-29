"use client";

import { useSearchParams } from "next/navigation";
import ReportView from "@/components/reports/ReportView";
import { api } from "~/lib/trpc";

export default function ReportSummaryPage() {
  const searchParams = useSearchParams();

  // Read query parameters
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  // Use tRPC query to fetch data when dates are available
  const { data, isLoading, error } = api.reports.getMonthlySummary.useQuery(
    {
      startDate: startDate || "",
      endDate: endDate || "",
    },
    {
      enabled: !!(startDate && endDate), // Only run query when both dates are present
    }
  );

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {!startDate || !endDate ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Summary Report</h2>
          <p className="text-gray-600">
            Date range not specified. Please provide startDate and endDate parameters.
          </p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-4">Loading Report...</h2>
          <p className="text-gray-600">
            Fetching data for {startDate} to {endDate}
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Error Loading Report</h2>
            <p className="text-red-600 mb-4">
              {error.message || "Failed to load report data. Please try again."}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : data ? (
        <ReportView data={data} />
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Data Available</h2>
          <p className="text-gray-600">
            No report data found for the specified date range.
          </p>
        </div>
      )}
    </div>
  );
}