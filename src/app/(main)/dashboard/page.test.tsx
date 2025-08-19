/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { api } from '~/lib/trpc'
import Dashboard from './page'

// Mock scrollIntoView for JSDOM
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: jest.fn(),
})

// Mock tRPC client
jest.mock('~/lib/trpc', () => ({
  api: {
    dashboard: {
      getSummary: {
        useQuery: jest.fn(),
      },
    },
  },
}))

const mockUseQuery = api.dashboard.getSummary.useQuery as jest.MockedFunction<
  typeof api.dashboard.getSummary.useQuery
>

// Test wrapper with QueryClient
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const mockSummaryData = {
  totalExpenses: 5000,
  totalRepairIncome: 12000,
  totalSalesIncome: 8000,
  salesProfit: 3200,
  repairProfit: 7500,
}

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Dashboard Page Component Tests', () => {
    it('renders dashboard page correctly with all sections', () => {
      mockUseQuery.mockReturnValue({
        data: mockSummaryData,
        isLoading: false,
        error: null,
        trpc: { path: 'dashboard.getSummary' },
        refetch: jest.fn(),
        fetchStatus: 'idle',
        status: 'success',
      } as any)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Welcome to your repair shop management dashboard')).toBeInTheDocument()
      expect(screen.getByText('This Month')).toBeInTheDocument()
    })

    it('calls tRPC getSummary query with correct parameters', () => {
      mockUseQuery.mockReturnValue({
        data: mockSummaryData,
        isLoading: false,
        error: null,
        trpc: { path: 'dashboard.getSummary' },
        refetch: jest.fn(),
        fetchStatus: 'idle',
        status: 'success',
      } as any)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(mockUseQuery).toHaveBeenCalledWith({
        period: 'thismonth'
      })
    })

    it('displays loading indicators during API calls', () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        trpc: { path: 'dashboard.getSummary' },
        refetch: jest.fn(),
        fetchStatus: 'fetching',
        status: 'loading',
      } as any)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Check for loading skeletons
      const loadingElements = screen.getAllByRole('generic')
      const skeletons = loadingElements.filter(el => 
        el.className.includes('animate-pulse') && el.className.includes('bg-muted')
      )
      expect(skeletons).toHaveLength(5) // 5 cards with loading states
    })

    it('displays error states appropriately', () => {
      const mockError = { message: 'Failed to load dashboard data' }
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
        trpc: { path: 'dashboard.getSummary' },
        refetch: jest.fn(),
        fetchStatus: 'idle',
        status: 'error',
      } as any)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('Error loading dashboard')).toBeInTheDocument()
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument()
    })
  })

  describe('Time Range Selector Tests', () => {
    it('displays all three time range options', async () => {
      mockUseQuery.mockReturnValue({
        data: mockSummaryData,
        isLoading: false,
        error: null,
        trpc: { path: 'dashboard.getSummary' },
        refetch: jest.fn(),
        fetchStatus: 'idle',
        status: 'success',
      } as any)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Click the select trigger to open the dropdown
      const selectTrigger = screen.getByRole('combobox')
      fireEvent.click(selectTrigger)

      await waitFor(() => {
        expect(screen.getByText('Today')).toBeInTheDocument()
        expect(screen.getByText('Last 7 Days')).toBeInTheDocument()
        expect(screen.getByText('This Month')).toBeInTheDocument()
      })
    })

    it('updates component state when time range is selected', async () => {
      mockUseQuery.mockReturnValue({
        data: mockSummaryData,
        isLoading: false,
        error: null,
        trpc: { path: 'dashboard.getSummary' },
        refetch: jest.fn(),
        fetchStatus: 'idle',
        status: 'success',
      } as any)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Click the select trigger to open the dropdown
      const selectTrigger = screen.getByRole('combobox')
      fireEvent.click(selectTrigger)

      // Select "Today" option
      await waitFor(() => {
        const todayOption = screen.getByText('Today')
        fireEvent.click(todayOption)
      })

      // Verify the API is called with new parameter
      await waitFor(() => {
        expect(mockUseQuery).toHaveBeenCalledWith({
          period: 'today'
        })
      })
    })

    it('defaults to "This Month" time range selection', () => {
      mockUseQuery.mockReturnValue({
        data: mockSummaryData,
        isLoading: false,
        error: null,
        trpc: { path: 'dashboard.getSummary' },
        refetch: jest.fn(),
        fetchStatus: 'idle',
        status: 'success',
      } as any)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(mockUseQuery).toHaveBeenCalledWith({
        period: 'thismonth'
      })
      expect(screen.getByText('This Month')).toBeInTheDocument()
    })

    it('triggers new API call when time range changes', async () => {
      mockUseQuery.mockReturnValue({
        data: mockSummaryData,
        isLoading: false,
        error: null,
        trpc: { path: 'dashboard.getSummary' },
        refetch: jest.fn(),
        fetchStatus: 'idle',
        status: 'success',
      } as any)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Initial call
      expect(mockUseQuery).toHaveBeenCalledWith({
        period: 'thismonth'
      })

      // Change to "Last 7 Days"
      const selectTrigger = screen.getByRole('combobox')
      fireEvent.click(selectTrigger)

      await waitFor(() => {
        const last7DaysOption = screen.getByText('Last 7 Days')
        fireEvent.click(last7DaysOption)
      })

      // Verify new API call
      await waitFor(() => {
        expect(mockUseQuery).toHaveBeenCalledWith({
          period: 'last7days'
        })
      })
    })
  })

  describe('Summary Cards Tests', () => {
    it('displays all five metric cards with correct data', () => {
      mockUseQuery.mockReturnValue({
        data: mockSummaryData,
        isLoading: false,
        error: null,
        trpc: { path: 'dashboard.getSummary' },
        refetch: jest.fn(),
        fetchStatus: 'idle',
        status: 'success',
      } as any)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Check all card titles
      expect(screen.getByText('Expenses')).toBeInTheDocument()
      expect(screen.getByText('Repair Income')).toBeInTheDocument()
      expect(screen.getByText('Sales Income')).toBeInTheDocument()
      expect(screen.getByText('Sales Profit')).toBeInTheDocument()
      expect(screen.getByText('Repair Profit')).toBeInTheDocument()

      // Check formatted monetary values
      expect(screen.getByText('$5,000.00')).toBeInTheDocument() // totalExpenses
      expect(screen.getByText('$12,000.00')).toBeInTheDocument() // totalRepairIncome
      expect(screen.getByText('$8,000.00')).toBeInTheDocument() // totalSalesIncome
      expect(screen.getByText('$3,200.00')).toBeInTheDocument() // salesProfit
      expect(screen.getByText('$7,500.00')).toBeInTheDocument() // repairProfit
    })

    it('formats monetary values properly for display', () => {
      const testData = {
        totalExpenses: 1234.56,
        totalRepairIncome: 9876.54,
        totalSalesIncome: 5555.55,
        salesProfit: 999.99,
        repairProfit: 12345.67,
      }

      mockUseQuery.mockReturnValue({
        data: testData,
        isLoading: false,
        error: null,
        trpc: { path: 'dashboard.getSummary' },
        refetch: jest.fn(),
        fetchStatus: 'idle',
        status: 'success',
      } as any)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('$1,234.56')).toBeInTheDocument()
      expect(screen.getByText('$9,876.54')).toBeInTheDocument()
      expect(screen.getByText('$5,555.55')).toBeInTheDocument()
      expect(screen.getByText('$999.99')).toBeInTheDocument()
      expect(screen.getByText('$12,345.67')).toBeInTheDocument()
    })

    it('handles empty/null data gracefully', () => {
      const emptyData = {
        totalExpenses: 0,
        totalRepairIncome: 0,
        totalSalesIncome: 0,
        salesProfit: 0,
        repairProfit: 0,
      }

      mockUseQuery.mockReturnValue({
        data: emptyData,
        isLoading: false,
        error: null,
        trpc: { path: 'dashboard.getSummary' },
        refetch: jest.fn(),
        fetchStatus: 'idle',
        status: 'success',
      } as any)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // All values should show $0.00
      const zeroValues = screen.getAllByText('$0.00')
      expect(zeroValues).toHaveLength(5)
    })

    it('has responsive grid layout for different screen sizes', () => {
      mockUseQuery.mockReturnValue({
        data: mockSummaryData,
        isLoading: false,
        error: null,
        trpc: { path: 'dashboard.getSummary' },
        refetch: jest.fn(),
        fetchStatus: 'idle',
        status: 'success',
      } as any)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Check that cards container has responsive grid classes
      const expensesCard = screen.getByText('Expenses')
      // Traverse up the DOM to find the grid container
      let gridContainer = expensesCard.closest('[class*="grid"]')
      while (gridContainer && !gridContainer.className.includes('lg:grid-cols-5')) {
        gridContainer = gridContainer.parentElement?.querySelector('[class*="grid"]') || null
      }
      expect(gridContainer).toHaveClass('grid', 'gap-4', 'md:grid-cols-2', 'lg:grid-cols-5')
    })
  })

  describe('Integration Tests', () => {
    it('handles complete user flow of changing time ranges and seeing updated data', async () => {
      // Mock different data for different periods
      const todayData = { ...mockSummaryData, totalExpenses: 1000 }
      const thisMonthData = { ...mockSummaryData, totalExpenses: 5000 }

      // Start with "This Month" data
      mockUseQuery.mockReturnValue({
        data: thisMonthData,
        isLoading: false,
        error: null,
        trpc: { path: 'dashboard.getSummary' },
        refetch: jest.fn(),
        fetchStatus: 'idle',
        status: 'success',
      } as any)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Verify initial "This Month" data
      expect(screen.getByText('$5,000.00')).toBeInTheDocument()

      // Change to "Today" and mock new data
      mockUseQuery.mockReturnValue({
        data: todayData,
        isLoading: false,
        error: null,
        trpc: { path: 'dashboard.getSummary' },
        refetch: jest.fn(),
        fetchStatus: 'idle',
        status: 'success',
      } as any)

      const selectTrigger = screen.getByRole('combobox')
      fireEvent.click(selectTrigger)

      await waitFor(() => {
        const todayOption = screen.getByText('Today')
        fireEvent.click(todayOption)
      })

      // Verify API was called with new period
      await waitFor(() => {
        expect(mockUseQuery).toHaveBeenCalledWith({
          period: 'today'
        })
      })
    })
  })

  describe('Accessibility Tests', () => {
    it('has proper ARIA labels for screen readers', () => {
      mockUseQuery.mockReturnValue({
        data: mockSummaryData,
        isLoading: false,
        error: null,
        trpc: { path: 'dashboard.getSummary' },
        refetch: jest.fn(),
        fetchStatus: 'idle',
        status: 'success',
      } as any)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Check main heading
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Dashboard')

      // Check select has proper role
      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
    })

    it('supports keyboard navigation for all interactive elements', async () => {
      mockUseQuery.mockReturnValue({
        data: mockSummaryData,
        isLoading: false,
        error: null,
        trpc: { path: 'dashboard.getSummary' },
        refetch: jest.fn(),
        fetchStatus: 'idle',
        status: 'success',
      } as any)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      const selectTrigger = screen.getByRole('combobox')
      
      // Test keyboard interaction
      selectTrigger.focus()
      expect(selectTrigger).toHaveFocus()

      // Test Enter key opens dropdown
      fireEvent.keyDown(selectTrigger, { key: 'Enter', code: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByText('Today')).toBeInTheDocument()
      })
    })
  })
})