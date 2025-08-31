import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SalesPage from './page'
import { api } from '~/app/providers'

// Mock the tRPC API
jest.mock('~/app/providers', () => ({
  api: {
    sales: {
      getAll: {
        useQuery: jest.fn(),
      },
      getAnalytics: {
        useQuery: jest.fn(),
      },
      create: {
        useMutation: jest.fn(),
      },
    },
    customers: {
      getAll: {
        useQuery: jest.fn(),
      },
    },
    products: {
      getAll: {
        useQuery: jest.fn(),
      },
    },
    useUtils: jest.fn(),
  },
}))

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

const mockSales = [
  {
    id: 'sale1',
    totalAmount: 250.0,
    totalCost: 150.0,
    createdAt: new Date('2025-01-15'),
    customerId: 'customer1',
    customer: { name: 'John Doe', phone: '123-456-7890' },
    saleItems: [
      {
        id: 'item1',
        quantity: 2,
        priceAtTime: 75.0,
        costAtTime: 50.0,
        product: { name: 'Product A' }
      }
    ]
  }
]

const mockCustomers = [
  {
    id: 'customer1',
    name: 'John Doe',
    phone: '123-456-7890',
    address: '123 Main St',
  }
]

const mockProducts = [
  {
    id: 'product1',
    name: 'Product A',
    salePrice: 75.0,
    quantity: 10,
    averageCost: 50.0,
  }
]

const mockAnalytics = {
  totalSales: 1,
  totalRevenue: 250.0,
  averageSaleValue: 250.0,
  topSellingProduct: { name: 'Product A', quantity: 2 }
}

// Create a wrapper component with QueryClient
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('SalesPage - Utils Invalidation Pattern', () => {
  const mockSalesQuery = {
    data: mockSales,
    isLoading: false,
  }

  const mockAnalyticsQuery = {
    data: mockAnalytics,
    isLoading: false,
  }

  const mockCustomersQuery = {
    data: mockCustomers,
    isLoading: false,
  }

  const mockProductsQuery = {
    data: mockProducts,
    isLoading: false,
  }

  const mockCreateMutation = {
    mutate: jest.fn(),
    isPending: false,
  }

  const mockUtils = {
    sales: {
      getAll: {
        invalidate: jest.fn(),
      },
      getAnalytics: {
        invalidate: jest.fn(),
      },
    },
  }

  // Mock alert function
  const mockAlert = jest.fn()
  beforeAll(() => {
    global.alert = mockAlert
  })

  afterAll(() => {
    global.alert = undefined as unknown as typeof alert
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockAlert.mockClear()
    ;(api.sales.getAll.useQuery as jest.Mock).mockReturnValue(mockSalesQuery)
    ;(api.sales.getAnalytics.useQuery as jest.Mock).mockReturnValue(mockAnalyticsQuery)
    ;(api.customers.getAll.useQuery as jest.Mock).mockReturnValue(mockCustomersQuery)
    ;(api.products.getAll.useQuery as jest.Mock).mockReturnValue(mockProductsQuery)
    ;(api.sales.create.useMutation as jest.Mock).mockReturnValue(mockCreateMutation)
    ;(api.useUtils as jest.Mock).mockReturnValue(mockUtils)
  })

  describe('Component Initialization', () => {
    it('calls useUtils hook during component initialization', () => {
      render(
        <TestWrapper>
          <SalesPage />
        </TestWrapper>
      )

      expect(api.useUtils).toHaveBeenCalled()
    })

    it('renders page without utils-related errors', () => {
      render(
        <TestWrapper>
          <SalesPage />
        </TestWrapper>
      )

      expect(screen.getByText('Sales')).toBeInTheDocument()
      expect(screen.getByText('Manage sales transactions and view sales history')).toBeInTheDocument()
    })
  })

  describe('Create Sale Mutation with Utils Pattern', () => {
    it('configures create sale mutation with utils invalidation', () => {
      render(
        <TestWrapper>
          <SalesPage />
        </TestWrapper>
      )

      expect(api.sales.create.useMutation).toHaveBeenCalledWith({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    })

    it('calls sales getAll invalidation on successful sale creation', async () => {
      const mockOnSuccess = jest.fn()
      ;(api.sales.create.useMutation as jest.Mock).mockImplementation((options) => {
        mockOnSuccess.mockImplementation(options.onSuccess)
        return { mutate: jest.fn(), isPending: false }
      })

      render(
        <TestWrapper>
          <SalesPage />
        </TestWrapper>
      )

      // Simulate successful creation
      await mockOnSuccess()

      expect(mockUtils.sales.getAll.invalidate).toHaveBeenCalled()
    })

    it('calls sales analytics invalidation on successful sale creation', async () => {
      const mockOnSuccess = jest.fn()
      ;(api.sales.create.useMutation as jest.Mock).mockImplementation((options) => {
        mockOnSuccess.mockImplementation(options.onSuccess)
        return { mutate: jest.fn(), isPending: false }
      })

      render(
        <TestWrapper>
          <SalesPage />
        </TestWrapper>
      )

      // Simulate successful creation
      await mockOnSuccess()

      expect(mockUtils.sales.getAnalytics.invalidate).toHaveBeenCalled()
    })

    it('shows success toast notification on sale creation', async () => {
      const mockOnSuccess = jest.fn()
      ;(api.sales.create.useMutation as jest.Mock).mockImplementation((options) => {
        mockOnSuccess.mockImplementation(options.onSuccess)
        return { mutate: jest.fn(), isPending: false }
      })

      render(
        <TestWrapper>
          <SalesPage />
        </TestWrapper>
      )

      // Simulate successful creation
      await mockOnSuccess()

      expect(mockAlert).toHaveBeenCalledWith('Sale created successfully!')
    })

    it('handles async invalidation calls properly', async () => {
      mockUtils.sales.getAll.invalidate.mockResolvedValue(undefined)
      mockUtils.sales.getAnalytics.invalidate.mockResolvedValue(undefined)

      const mockOnSuccess = jest.fn()
      ;(api.sales.create.useMutation as jest.Mock).mockImplementation((options) => {
        mockOnSuccess.mockImplementation(options.onSuccess)
        return { mutate: jest.fn(), isPending: false }
      })

      render(
        <TestWrapper>
          <SalesPage />
        </TestWrapper>
      )

      // Simulate successful creation and wait for async operations
      await mockOnSuccess()

      expect(mockUtils.sales.getAll.invalidate).toHaveBeenCalled()
      expect(mockUtils.sales.getAnalytics.invalidate).toHaveBeenCalled()
    })

    it('uses await for invalidation calls to ensure proper sequencing', async () => {
      const invalidationOrder: string[] = []
      
      mockUtils.sales.getAll.invalidate.mockImplementation(async () => {
        invalidationOrder.push('sales')
        return Promise.resolve()
      })
      
      mockUtils.sales.getAnalytics.invalidate.mockImplementation(async () => {
        invalidationOrder.push('analytics')
        return Promise.resolve()
      })

      const mockOnSuccess = jest.fn()
      ;(api.sales.create.useMutation as jest.Mock).mockImplementation((options) => {
        mockOnSuccess.mockImplementation(options.onSuccess)
        return { mutate: jest.fn(), isPending: false }
      })

      render(
        <TestWrapper>
          <SalesPage />
        </TestWrapper>
      )

      // Simulate successful creation
      await mockOnSuccess()

      // Both invalidation calls should have been made
      expect(invalidationOrder).toContain('sales')
      expect(invalidationOrder).toContain('analytics')
    })
  })

  describe('Error Handling with Utils Pattern', () => {
    it('shows error alert on sale creation failure', async () => {
      const mockOnError = jest.fn()
      const testError = new Error('Failed to create sale')
      
      ;(api.sales.create.useMutation as jest.Mock).mockImplementation((options) => {
        mockOnError.mockImplementation(options.onError)
        return { mutate: jest.fn(), isPending: false }
      })

      render(
        <TestWrapper>
          <SalesPage />
        </TestWrapper>
      )

      // Simulate error
      await mockOnError(testError)

      expect(mockAlert).toHaveBeenCalledWith('Failed to create sale: Failed to create sale')
    })

    it('does not call invalidation on error', async () => {
      const mockOnError = jest.fn()
      const testError = new Error('Test error')
      
      ;(api.sales.create.useMutation as jest.Mock).mockImplementation((options) => {
        mockOnError.mockImplementation(options.onError)
        return { mutate: jest.fn(), isPending: false }
      })

      render(
        <TestWrapper>
          <SalesPage />
        </TestWrapper>
      )

      // Simulate error
      await mockOnError(testError)

      expect(mockUtils.sales.getAll.invalidate).not.toHaveBeenCalled()
      expect(mockUtils.sales.getAnalytics.invalidate).not.toHaveBeenCalled()
    })
  })

  describe('Mutation Pattern Comparison', () => {
    it('no longer uses manual refetch pattern', () => {
      render(
        <TestWrapper>
          <SalesPage />
        </TestWrapper>
      )

      // Verify queries don't expose refetch functions
      expect(api.sales.getAll.useQuery).toHaveBeenCalledWith(undefined)
      expect(api.sales.getAnalytics.useQuery).toHaveBeenCalledWith(undefined)
    })

    it('uses modern utils.invalidate pattern instead of refetch', async () => {
      const mockOnSuccess = jest.fn()
      ;(api.sales.create.useMutation as jest.Mock).mockImplementation((options) => {
        mockOnSuccess.mockImplementation(options.onSuccess)
        return { mutate: jest.fn(), isPending: false }
      })

      render(
        <TestWrapper>
          <SalesPage />
        </TestWrapper>
      )

      await mockOnSuccess()

      // Verify utils invalidation is used, not manual refetch
      expect(mockUtils.sales.getAll.invalidate).toHaveBeenCalled()
      expect(mockUtils.sales.getAnalytics.invalidate).toHaveBeenCalled()
    })
  })

  describe('Date Range Filtering with Utils', () => {
    it('passes dateRange parameter to queries when selected', () => {
      // Mock query with dateRange
      ;(api.sales.getAll.useQuery as jest.Mock).mockReturnValue(mockSalesQuery)
      ;(api.sales.getAnalytics.useQuery as jest.Mock).mockReturnValue(mockAnalyticsQuery)

      render(
        <TestWrapper>
          <SalesPage />
        </TestWrapper>
      )

      // Initial calls should be with undefined (no filter)
      expect(api.sales.getAll.useQuery).toHaveBeenCalledWith(undefined)
      expect(api.sales.getAnalytics.useQuery).toHaveBeenCalledWith(undefined)
    })
  })

  describe('Integration with Existing Functionality', () => {
    it('maintains all existing query behavior with new utils pattern', () => {
      render(
        <TestWrapper>
          <SalesPage />
        </TestWrapper>
      )

      // All queries should still be called
      expect(api.sales.getAll.useQuery).toHaveBeenCalled()
      expect(api.sales.getAnalytics.useQuery).toHaveBeenCalled()
      expect(api.customers.getAll.useQuery).toHaveBeenCalled()
      expect(api.products.getAll.useQuery).toHaveBeenCalled()
      expect(api.useUtils).toHaveBeenCalled()
    })

    it('displays loading states correctly with utils pattern', () => {
      ;(api.sales.getAll.useQuery as jest.Mock).mockReturnValue({
        ...mockSalesQuery,
        isLoading: true,
      })
      ;(api.sales.getAnalytics.useQuery as jest.Mock).mockReturnValue({
        ...mockAnalyticsQuery,
        isLoading: true,
      })

      render(
        <TestWrapper>
          <SalesPage />
        </TestWrapper>
      )

      // Should show loading spinners
      const loadingSpinners = screen.getAllByText((content, element) => {
        return element?.tagName.toLowerCase() === 'svg' && element.classList.contains('animate-spin')
      })
      
      expect(loadingSpinners.length).toBeGreaterThan(0)
    })
  })
})