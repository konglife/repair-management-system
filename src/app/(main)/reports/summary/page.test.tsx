import { render, screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import { ReadonlyURLSearchParams } from "next/navigation";
import ReportSummaryPage from "./page";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;

describe("ReportSummaryPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockSearchParams = (params: Record<string, string | null>) => {
    return {
      get: jest.fn((key: string) => params[key] || null),
      // Add other ReadonlyURLSearchParams methods if needed
    } as unknown as ReadonlyURLSearchParams;
  };

  it("renders with proper title", () => {
    mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

    render(<ReportSummaryPage />);

    expect(screen.getByRole("heading", { name: /summary report/i })).toBeInTheDocument();
  });

  it("displays date range when startDate and endDate are provided", () => {
    const startDate = "2024-01-01";
    const endDate = "2024-01-31";
    
    mockUseSearchParams.mockReturnValue(
      createMockSearchParams({ startDate, endDate })
    );

    render(<ReportSummaryPage />);

    expect(screen.getByText(`Report for ${startDate} to ${endDate}`)).toBeInTheDocument();
  });

  it("displays fallback message when date parameters are missing", () => {
    mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

    render(<ReportSummaryPage />);

    expect(screen.getByText("Date range not specified")).toBeInTheDocument();
  });

  it("displays fallback message when only one date parameter is provided", () => {
    mockUseSearchParams.mockReturnValue(
      createMockSearchParams({ startDate: "2024-01-01" })
    );

    render(<ReportSummaryPage />);

    expect(screen.getByText("Date range not specified")).toBeInTheDocument();
  });

  it("shows loading state by default", () => {
    mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

    render(<ReportSummaryPage />);

    // Loading spinner should be present
    expect(screen.getByText("Loading report data...")).toBeInTheDocument();
    
    // Check for the loading spinner with animate-spin class
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("animate-spin");
  });

  it("displays Report Data card header", () => {
    mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

    render(<ReportSummaryPage />);

    expect(screen.getByText("Report Data")).toBeInTheDocument();
  });

  it("reads query parameters correctly", () => {
    const startDate = "2024-03-01";
    const endDate = "2024-03-31";
    const mockGet = jest.fn()
      .mockReturnValueOnce(startDate) // First call for startDate
      .mockReturnValueOnce(endDate);   // Second call for endDate

    mockUseSearchParams.mockReturnValue({
      get: mockGet
    } as unknown as ReadonlyURLSearchParams);

    render(<ReportSummaryPage />);

    expect(mockGet).toHaveBeenCalledWith("startDate");
    expect(mockGet).toHaveBeenCalledWith("endDate");
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it("handles null date parameters gracefully", () => {
    const mockGet = jest.fn()
      .mockReturnValueOnce(null) // startDate is null
      .mockReturnValueOnce(null); // endDate is null

    mockUseSearchParams.mockReturnValue({
      get: mockGet
    } as unknown as ReadonlyURLSearchParams);

    render(<ReportSummaryPage />);

    expect(screen.getByText("Date range not specified")).toBeInTheDocument();
  });

  it("applies correct CSS classes for styling", () => {
    mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

    render(<ReportSummaryPage />);

    // Check main container classes
    const mainContainer = document.querySelector('.flex-1.space-y-6.p-8.pt-6');
    expect(mainContainer).toBeInTheDocument();
    
    // Check loading state styling
    expect(screen.getByText("Loading report data...")).toHaveClass("text-sm", "text-muted-foreground");
  });
});