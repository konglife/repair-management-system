import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReportSummaryPage from './page';
import { api } from '~/lib/trpc';

// Mock Next.js router
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

// Mock tRPC
jest.mock('~/lib/trpc', () => ({
  api: {
    reports: {
      getMonthlySummary: {
        useQuery: jest.fn(),
      },
    },
  },
}));

// Enhanced mock data with all new fields
const mockEnhancedApiResponse = {
  reportPeriod: {
    startDate: '2025-08-01',
    endDate: '2025-08-31'
  },
  shopInfo: {
    name: 'Test Shop',
    address: '123 Test Street',
    phone: '123-456-7890'
  },
  overview: {
    expenses: 50000,
    totalRepairs: 15,
    totalSales: 8,
    salesProfit: 25000,
    repairIncome: 30000,
    salesIncome: 40000,
    repairProfit: 20000,
    grossProfit: 45000
  },
  salesData: [
    {
      date: '2025-08-01',
      totalCost: 2500,
      netTotal: 5000,
      totalAmount: 10,
      grossProfit: 2500,
      saleItems: [{ name: 'Test Product 1' }, { name: 'Test Product 2' }]
    }
  ],
  repairsData: [
    {
      date: '2025-08-02',
      description: 'Test Repair',
      partsCost: 1200,
      laborCost: 500,
      totalCost: 1700,
      usedParts: [{ name: 'Test Part', costAtTime: 1200 }]
    }
  ],
  purchaseRecordsData: [
    {
      id: 'p1',
      quantity: 10,
      costPerUnit: 250,
      purchaseDate: '2025-08-01',
      product: { name: 'Test Purchase Product' }
    }
  ]
};

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ReportSummaryPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('startDate');
    mockSearchParams.delete('endDate');
  });

  describe('Complete data flow from API call to UI rendering', () => {
    it('should render enhanced data correctly when API returns complete response', async () => {
      // Setup mock with enhanced data
      mockSearchParams.set('startDate', '2025-08-01');
      mockSearchParams.set('endDate', '2025-08-31');
      
      (api.reports.getMonthlySummary.useQuery as jest.Mock).mockReturnValue({
        data: mockEnhancedApiResponse,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ReportSummaryPage />);

      // Wait for component to render
      await waitFor(() => {
        expect(screen.getByText('Test Shop')).toBeInTheDocument();
      });

      // Verify all enhanced data is displayed
      expect(screen.getByText('Test Product 1, Test Product 2')).toBeInTheDocument();
      expect(screen.getByText('Test Part (฿1,200)')).toBeInTheDocument();
      expect(screen.getByText('Test Purchase Product')).toBeInTheDocument();
    });

    it('should handle API response with purchaseRecordsData field name correctly', async () => {
      mockSearchParams.set('startDate', '2025-08-01');
      mockSearchParams.set('endDate', '2025-08-31');
      
      (api.reports.getMonthlySummary.useQuery as jest.Mock).mockReturnValue({
        data: mockEnhancedApiResponse,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ReportSummaryPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Purchase Product')).toBeInTheDocument();
      });
    });

    it('should display loading state correctly', () => {
      mockSearchParams.set('startDate', '2025-08-01');
      mockSearchParams.set('endDate', '2025-08-31');
      
      (api.reports.getMonthlySummary.useQuery as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<ReportSummaryPage />);

      expect(screen.getByText('Loading Report...')).toBeInTheDocument();
      expect(screen.getByText('Fetching data for 2025-08-01 to 2025-08-31')).toBeInTheDocument();
    });

    it('should display error state correctly', () => {
      mockSearchParams.set('startDate', '2025-08-01');
      mockSearchParams.set('endDate', '2025-08-31');
      
      (api.reports.getMonthlySummary.useQuery as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: { message: 'Test error message' },
      });

      renderWithProviders(<ReportSummaryPage />);

      expect(screen.getByText('Error Loading Report')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });
  });

  describe('Enhanced data structure compatibility', () => {
    it('should handle missing enhanced data arrays gracefully', async () => {
      const incompleteData = {
        ...mockEnhancedApiResponse,
        salesData: [
          {
            date: '2025-08-01',
            totalCost: 2500,
            netTotal: 5000,
            totalAmount: 10,
            grossProfit: 2500,
            // Missing saleItems array
          }
        ],
        repairsData: [
          {
            date: '2025-08-02',
            description: 'Test Repair',
            partsCost: 1200,
            laborCost: 500,
            totalCost: 1700,
            // Missing usedParts array
          }
        ],
        // Missing purchaseRecordsData entirely
      };

      mockSearchParams.set('startDate', '2025-08-01');
      mockSearchParams.set('endDate', '2025-08-31');
      
      (api.reports.getMonthlySummary.useQuery as jest.Mock).mockReturnValue({
        data: incompleteData,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ReportSummaryPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Shop')).toBeInTheDocument();
      });

      // Should display fallback values for missing data
      expect(screen.getAllByText('-')).toHaveLength(3); // One for each missing data array
    });

    it('should handle backward compatibility with old API response format', async () => {
      const legacyData = {
        ...mockEnhancedApiResponse,
        purchaseData: mockEnhancedApiResponse.purchaseRecordsData, // Old field name
        purchaseRecordsData: undefined, // New field name not present
      };

      mockSearchParams.set('startDate', '2025-08-01');
      mockSearchParams.set('endDate', '2025-08-31');
      
      (api.reports.getMonthlySummary.useQuery as jest.Mock).mockReturnValue({
        data: legacyData,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ReportSummaryPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Purchase Product')).toBeInTheDocument();
      });
    });
  });

  describe('Query parameter handling', () => {
    it('should display message when no date parameters provided', () => {
      (api.reports.getMonthlySummary.useQuery as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ReportSummaryPage />);

      expect(screen.getByText('Summary Report')).toBeInTheDocument();
      expect(screen.getByText('Date range not specified. Please provide startDate and endDate parameters.')).toBeInTheDocument();
    });

    it('should call API with correct parameters when dates are provided', () => {
      mockSearchParams.set('startDate', '2025-08-01');
      mockSearchParams.set('endDate', '2025-08-31');
      
      (api.reports.getMonthlySummary.useQuery as jest.Mock).mockReturnValue({
        data: mockEnhancedApiResponse,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ReportSummaryPage />);

      expect(api.reports.getMonthlySummary.useQuery).toHaveBeenCalledWith(
        {
          startDate: '2025-08-01',
          endDate: '2025-08-31',
        },
        {
          enabled: true,
        }
      );
    });
  });
});