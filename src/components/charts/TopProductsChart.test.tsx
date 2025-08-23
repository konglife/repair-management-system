/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react'
import TopProductsChart from './TopProductsChart'
import { api } from '~/lib/trpc'

// Mock tRPC
jest.mock('~/lib/trpc', () => ({
  api: {
    dashboard: {
      getTopProducts: {
        useQuery: jest.fn(),
      },
    },
  },
}))

const mockTopProductsQuery = api.dashboard.getTopProducts.useQuery as jest.MockedFunction<
  typeof api.dashboard.getTopProducts.useQuery
>


describe('TopProductsChart', () => {
  const mockData = {
    topProducts: [
      { productName: 'Product A', totalSales: 50, totalRevenue: 5000 },
      { productName: 'Product B', totalSales: 30, totalRevenue: 3000 },
      { productName: 'Product C', totalSales: 25, totalRevenue: 2500 },
    ],
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    mockTopProductsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      trpc: { path: 'dashboard.getTopProducts' },
      refetch: jest.fn(),
      fetchStatus: 'fetching',
      status: 'loading',
    } as any)

    const { container } = render(<TopProductsChart period="thismonth" />)

    expect(screen.getByText('Top 5 Selling Products')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders error state correctly', () => {
    mockTopProductsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'Failed to fetch data' },
      trpc: { path: 'dashboard.getTopProducts' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'error',
    } as any)

    render(<TopProductsChart period="thismonth" />)

    expect(screen.getByText('Top 5 Selling Products')).toBeInTheDocument()
    expect(screen.getByText('Failed to load top products data')).toBeInTheDocument()
    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument()
  })

  it('renders empty state correctly', () => {
    mockTopProductsQuery.mockReturnValue({
      data: { topProducts: [] },
      isLoading: false,
      error: null,
      trpc: { path: 'dashboard.getTopProducts' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'success',
    } as any)

    render(<TopProductsChart period="thismonth" />)

    expect(screen.getByText('Top 5 Selling Products')).toBeInTheDocument()
    expect(screen.getByText('No sales data available')).toBeInTheDocument()
  })

  it('renders chart with data correctly', () => {
    mockTopProductsQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      trpc: { path: 'dashboard.getTopProducts' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'success',
    } as any)

    const { container } = render(<TopProductsChart period="thismonth" />)

    expect(screen.getByText('Top 5 Selling Products')).toBeInTheDocument()
    // Chart container should be present
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })

  it('passes correct period to query', () => {
    mockTopProductsQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      trpc: { path: 'dashboard.getTopProducts' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'success',
    } as any)

    render(<TopProductsChart period="last7days" />)

    expect(mockTopProductsQuery).toHaveBeenCalledWith({
      period: 'last7days',
    })
  })

  it('handles different time periods', () => {
    // Test today period
    mockTopProductsQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      trpc: { path: 'dashboard.getTopProducts' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'success',
    } as any)

    const { rerender } = render(<TopProductsChart period="today" />)
    expect(mockTopProductsQuery).toHaveBeenCalledWith({ period: 'today' })

    // Test last7days period
    jest.clearAllMocks()
    rerender(<TopProductsChart period="last7days" />)
    expect(mockTopProductsQuery).toHaveBeenCalledWith({ period: 'last7days' })

    // Test thismonth period
    jest.clearAllMocks()
    rerender(<TopProductsChart period="thismonth" />)
    expect(mockTopProductsQuery).toHaveBeenCalledWith({ period: 'thismonth' })
  })
})