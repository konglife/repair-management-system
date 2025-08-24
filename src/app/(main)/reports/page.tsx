"use client";

import { FileText, Download, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "~/lib/api";

type ReportType = "sales" | "repairs" | "";

export default function ReportsPage() {
  // Form state
  const [reportType, setReportType] = useState<ReportType>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  
  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Loading and feedback states
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Set default values to current month/year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
  const currentYear = currentDate.getFullYear();

  // Initialize defaults if not set (using useEffect for proper initialization)
  useEffect(() => {
    if (!selectedMonth) setSelectedMonth(currentMonth.toString());
    if (!selectedYear) setSelectedYear(currentYear.toString());
  }, [selectedMonth, selectedYear, currentMonth, currentYear]); // Include all dependencies

  // Months for dropdown
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Years for dropdown (current year ± 5)
  const years = Array.from(
    { length: 11 }, 
    (_, i) => ({
      value: (currentYear - 5 + i).toString(),
      label: (currentYear - 5 + i).toString(),
    })
  );

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!reportType) {
      newErrors.reportType = "Please select a report type";
    }
    
    if (!selectedMonth) {
      newErrors.selectedMonth = "Please select a month";
    }
    
    if (!selectedYear) {
      newErrors.selectedYear = "Please select a year";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // PDF download helper function
  const downloadPDF = (base64Data: string, filename: string) => {
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download error:', error);
      throw new Error('Failed to download PDF file');
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Clear any previous messages and errors
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");
    setIsGenerating(true);

    try {
      const month = parseInt(selectedMonth);
      const year = parseInt(selectedYear);

      let result;
      
      if (reportType === "sales") {
        result = await api.reports.generateSalesReport.mutate({ month, year });
      } else if (reportType === "repairs") {
        result = await api.reports.generateRepairsReport.mutate({ month, year });
      } else {
        throw new Error('Invalid report type');
      }

      if (result.success && result.data) {
        // Download the PDF
        downloadPDF(result.data, result.filename);
        
        // Show success message with summary
        const monthName = months.find(m => m.value === selectedMonth)?.label;
        if (reportType === "sales" && 'totalTransactions' in result) {
          setSuccessMessage(
            `Sales report generated successfully! ${result.totalTransactions} transactions, $${result.totalRevenue.toFixed(2)} total revenue for ${monthName} ${year}.`
          );
        } else if (reportType === "repairs" && 'totalRepairs' in result) {
          setSuccessMessage(
            `Repairs report generated successfully! ${result.totalRepairs} repairs, $${result.totalRevenue.toFixed(2)} revenue, $${result.grossProfit.toFixed(2)} profit for ${monthName} ${year}.`
          );
        }
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      
      let errorMsg = 'An unexpected error occurred while generating the report. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('character encoding') || error.message.includes('business profile')) {
          errorMsg = `${error.message} This may happen when your business name or contact information contains special characters. You can try updating your business profile in Settings with ASCII characters only.`;
        } else {
          errorMsg = error.message;
        }
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    // Clear error for this field when user makes a selection
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    
    // Clear messages when user makes changes
    if (successMessage) setSuccessMessage("");
    if (errorMessage) setErrorMessage("");

    if (field === "reportType") {
      setReportType(value as ReportType);
    } else if (field === "selectedMonth") {
      setSelectedMonth(value);
    } else if (field === "selectedYear") {
      setSelectedYear(value);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">Generate monthly reports for business analysis</p>
        </div>
      </div>

      <form onSubmit={handleGenerateReport} className="space-y-6">
        {/* Report Generation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Report Generator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Select the type of report and date range to generate your monthly business analysis
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Report Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Report Type <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={reportType}
                onValueChange={(value) => handleFieldChange("reportType", value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sales" id="sales" />
                  <Label htmlFor="sales" className="font-normal cursor-pointer">
                    Sales Report
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  Monthly sales summary with revenue, transactions, and top products
                </p>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="repairs" id="repairs" />
                  <Label htmlFor="repairs" className="font-normal cursor-pointer">
                    Repairs Report
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  Monthly repairs summary with jobs completed, parts used, and revenue
                </p>
              </RadioGroup>
              {errors.reportType && (
                <p className="text-sm text-destructive">{errors.reportType}</p>
              )}
            </div>

            {/* Date Selection */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Month Selection */}
              <div className="space-y-2">
                <Label htmlFor="month">
                  Month <span className="text-destructive">*</span>
                </Label>
                <Select value={selectedMonth} onValueChange={(value) => handleFieldChange("selectedMonth", value)}>
                  <SelectTrigger className={errors.selectedMonth ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.selectedMonth && (
                  <p className="text-sm text-destructive">{errors.selectedMonth}</p>
                )}
              </div>

              {/* Year Selection */}
              <div className="space-y-2">
                <Label htmlFor="year">
                  Year <span className="text-destructive">*</span>
                </Label>
                <Select value={selectedYear} onValueChange={(value) => handleFieldChange("selectedYear", value)}>
                  <SelectTrigger className={errors.selectedYear ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.selectedYear && (
                  <p className="text-sm text-destructive">{errors.selectedYear}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Messages */}
        {successMessage && (
          <div className="rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <Download className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Report Generated Successfully</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>{successMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Report Generation Failed</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errorMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Character encoding info */}
        <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">PDF Generation Notes</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  PDFs are generated with your business information from Settings. 
                  If your business name or contact details contain special characters (Thai, Arabic, etc.), 
                  the system will attempt to render them correctly or provide safe alternatives.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isGenerating || !reportType || !selectedMonth || !selectedYear}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}