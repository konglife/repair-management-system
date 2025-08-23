/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react'
import LowStockAlerts from './LowStockAlerts'
import { api } from '~/lib/trpc'

// Mock tRPC
jest.mock('~/lib/trpc', () => ({
  api: {
    dashboard: {
      getLowStockAlerts: {
        useQuery: jest.fn(),
      },
    },
  },
}))

const mockLowStockQuery = api.dashboard.getLowStockAlerts.useQuery as jest.MockedFunction<
  typeof api.dashboard.getLowStockAlerts.useQuery
>


describe('LowStockAlerts', () => {
  const mockData = {
    lowStockProducts: [
      {
        id: 'product-1',
        name: 'iPhone Screen',
        currentStock: 5,
        category: 'Screens',
        unit: 'pieces',
      },
      {
        id: 'product-2',
        name: 'Battery Pack',
        currentStock: 3,
        category: 'Batteries',
        unit: 'pieces',
      },
      {
        id: 'product-3',
        name: 'Charging Cable',
        currentStock: 8,
        category: 'Accessories',
        unit: 'pieces',
      },
    ],
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    mockLowStockQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      trpc: { path: 'dashboard.getLowStockAlerts' },
      refetch: jest.fn(),
      fetchStatus: 'fetching',
      status: 'loading',
    } as any)

    render(<LowStockAlerts />)

    expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument()
    // Should show 4 skeleton loading items
    const skeletonItems = screen.getAllByRole('generic')
    expect(skeletonItems.length).toBeGreaterThan(0)
  })

  it('renders error state correctly', () => {
    mockLowStockQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'Database connection failed' },
      trpc: { path: 'dashboard.getLowStockAlerts' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'error',
    } as any)

    render(<LowStockAlerts />)

    expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument()
    expect(screen.getByText('Failed to load stock alerts')).toBeInTheDocument()
    expect(screen.getByText('Database connection failed')).toBeInTheDocument()
  })

  it('renders empty state (all products well-stocked)', () => {
    mockLowStockQuery.mockReturnValue({
      data: { lowStockProducts: [] },
      isLoading: false,
      error: null,
      trpc: { path: 'dashboard.getLowStockAlerts' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'success',
    } as any)

    const { container } = render(<LowStockAlerts />)

    expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument()
    expect(screen.getByText('All products well-stocked!')).toBeInTheDocument()
    expect(screen.getByText('No items below threshold')).toBeInTheDocument()
    // Should show green package icon in empty state
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('renders low stock products correctly', () => {
    mockLowStockQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      trpc: { path: 'dashboard.getLowStockAlerts' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'success',
    } as any)

    render(<LowStockAlerts />)

    expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument()
    expect(screen.getByText('iPhone Screen')).toBeInTheDocument()
    expect(screen.getByText('Screens')).toBeInTheDocument()
    expect(screen.getByText('Battery Pack')).toBeInTheDocument()
    expect(screen.getByText('Batteries')).toBeInTheDocument()
    expect(screen.getByText('Charging Cable')).toBeInTheDocument()
    expect(screen.getByText('Accessories')).toBeInTheDocument()
  })

  it('displays stock quantities correctly', () => {
    mockLowStockQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      trpc: { path: 'dashboard.getLowStockAlerts' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'success',
    } as any)

    render(<LowStockAlerts />)

    expect(screen.getAllByText('5')).toHaveLength(1)
    expect(screen.getAllByText('3')).toHaveLength(2) // Shows in header count and in stock quantity
    expect(screen.getAllByText('8')).toHaveLength(1)
  })

  it('displays units correctly', () => {
    mockLowStockQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      trpc: { path: 'dashboard.getLowStockAlerts' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'success',
    } as any)

    render(<LowStockAlerts />)

    // Should show 3 instances of "pieces" for the units
    const unitElements = screen.getAllByText('pieces')
    expect(unitElements).toHaveLength(3)
  })

  it('shows alert count in header', () => {
    mockLowStockQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      trpc: { path: 'dashboard.getLowStockAlerts' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'success',
    } as any)

    render(<LowStockAlerts />)

    // Should show count of 3 low stock items (appears in header and one product has stock of 3)
    expect(screen.getAllByText('3')).toHaveLength(2)
  })

  it('applies correct styling for low stock items', () => {
    mockLowStockQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      trpc: { path: 'dashboard.getLowStockAlerts' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'success',
    } as any)

    const { container } = render(<LowStockAlerts />)

    // Should have red-themed styling for low stock items
    const alertItems = container.querySelectorAll('.border-red-200')
    expect(alertItems.length).toBe(3)

    const bgRedItems = container.querySelectorAll('.bg-red-50')
    expect(bgRedItems.length).toBe(3)
  })

  it('shows alert triangle icons for low stock items', () => {
    mockLowStockQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      trpc: { path: 'dashboard.getLowStockAlerts' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'success',
    } as any)

    const { container } = render(<LowStockAlerts />)

    // Should show alert triangle icons (each product has one)
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(3) // At least one per item plus header icon
  })

  it('handles scrollable content for many items', () => {
    const manyItemsData = {
      lowStockProducts: Array.from({ length: 15 }, (_, i) => ({
        id: `product-${i}`,
        name: `Product ${i}`,
        currentStock: i + 1,
        category: `Category ${i}`,
        unit: 'pieces',
      })),
    }

    mockLowStockQuery.mockReturnValue({
      data: manyItemsData,
      isLoading: false,
      error: null,
      trpc: { path: 'dashboard.getLowStockAlerts' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'success',
    } as any)

    const { container } = render(<LowStockAlerts />)

    // Should have scrollable content container
    const scrollableContainer = container.querySelector('.overflow-y-auto')
    expect(scrollableContainer).toBeInTheDocument()
    expect(scrollableContainer).toHaveClass('max-h-[250px]')
  })
})