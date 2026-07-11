"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, startOfMonth } from "date-fns";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/DatePicker";

interface FormErrors {
  startDate?: string;
  endDate?: string;
  general?: string;
}

function today() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default function ReportsPage() {
  const router = useRouter();
  // Default to the current month range so the user does not have to pick
  // dates on every visit (UX improvement, Q7).
  const [startDate, setStartDate] = useState<Date>(startOfMonth(today()));
  const [endDate, setEndDate] = useState<Date>(today());
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!endDate) {
      newErrors.endDate = "End date is required";
    }

    if (startDate && endDate && startDate > endDate) {
      newErrors.general = "Start date must be before end date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) setStartDate(date);
    setErrors((prev) => ({
      ...prev,
      startDate: undefined,
      general: undefined,
    }));
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) setEndDate(date);
    setErrors((prev) => ({ ...prev, endDate: undefined, general: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Serialize Date -> yyyy-MM-dd at the boundary so the URL contract
      // (startDate/endDate query params) stays unchanged.
      const params = new URLSearchParams({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      });

      router.push(`/reports/summary?${params.toString()}`);
    } catch (error) {
      console.error("Navigation error:", error);
      setErrors({ general: "Failed to navigate to report. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Generate monthly reports for business analysis
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Generation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <DatePicker
                  id="startDate"
                  label="Start Date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  required
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <DatePicker
                  id="endDate"
                  label="End Date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  required
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>

            {errors.general && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{errors.general}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
