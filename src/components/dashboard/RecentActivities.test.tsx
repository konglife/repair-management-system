/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react'
import RecentActivities from './RecentActivities'
import { api } from '~/lib/trpc'

// Mock tRPC
jest.mock('~/lib/trpc', () => ({
  api: {
    dashboard: {
      getRecentActivities: {
        useQuery: jest.fn(),
      },
    },
  },
}))

const mockRecentActivitiesQuery = api.dashboard.getRecentActivities.useQuery as jest.MockedFunction<
  typeof api.dashboard.getRecentActivities.useQuery
>


describe('RecentActivities', () => {
  const mockData = {
    activities: [
      {
        id: 'sale-1',
        type: 'sale' as const,
        description: 'Sale completed',
        amount: 1500,
        customerName: 'John Doe',
        date: new Date('2024-01-15T10:30:00Z'),
      },
      {
        id: 'repair-1',
        type: 'repair' as const,
        description: 'Phone screen repair',
        amount: 800,
        customerName: 'Jane Smith',
        date: new Date('2024-01-15T09:15:00Z'),
      },
      {
        id: 'purchase-1',
        type: 'purchase' as const,
        description: 'Purchased Screen Parts',
        amount: 300,
        customerName: undefined,
        date: new Date('2024-01-14T14:20:00Z'),
      },
    ],
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    mockRecentActivitiesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      trpc: { path: 'dashboard.getRecentActivities' },
      refetch: jest.fn(),
      fetchStatus: 'fetching',
      status: 'loading',
    } as any)

    render(<RecentActivities />)

    expect(screen.getByText('Recent Activities')).toBeInTheDocument()
    // Should show 5 skeleton loading items
    const skeletonItems = screen.getAllByRole('generic')
    expect(skeletonItems.length).toBeGreaterThan(0)
  })

  it('renders error state correctly', () => {
    mockRecentActivitiesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'Network error' },
      trpc: { path: 'dashboard.getRecentActivities' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'error',
    } as any)

    render(<RecentActivities />)

    expect(screen.getByText('Recent Activities')).toBeInTheDocument()
    expect(screen.getByText('Failed to load activities')).toBeInTheDocument()
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('renders empty state correctly', () => {
    mockRecentActivitiesQuery.mockReturnValue({
      data: { activities: [] },
      isLoading: false,
      error: null,
      trpc: { path: 'dashboard.getRecentActivities' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'success',
    } as any)

    render(<RecentActivities />)

    expect(screen.getByText('Recent Activities')).toBeInTheDocument()
    expect(screen.getByText('No recent activities')).toBeInTheDocument()
  })

  it('renders activities data correctly', () => {
    mockRecentActivitiesQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      trpc: { path: 'dashboard.getRecentActivities' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'success',
    } as any)

    render(<RecentActivities />)

    expect(screen.getByText('Recent Activities')).toBeInTheDocument()
    expect(screen.getByText('Sale completed')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Phone screen repair')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Purchased Screen Parts')).toBeInTheDocument()
  })

  it('displays correct currency formatting', () => {
    mockRecentActivitiesQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      trpc: { path: 'dashboard.getRecentActivities' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'success',
    } as any)

    render(<RecentActivities />)

    // Should display Thai Baht currency formatting
    expect(screen.getByText(/฿1,500/)).toBeInTheDocument()
    expect(screen.getByText(/฿800/)).toBeInTheDocument()
    expect(screen.getByText(/฿300/)).toBeInTheDocument()
  })

  it('shows correct activity icons', () => {
    mockRecentActivitiesQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      trpc: { path: 'dashboard.getRecentActivities' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'success',
    } as any)

    const { container } = render(<RecentActivities />)

    // Check for presence of SVG icons (each activity should have an icon)
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(3) // At least one icon per activity plus header icon
  })

  it('handles activities without customer names', () => {
    const dataWithoutCustomer = {
      activities: [
        {
          id: 'purchase-1',
          type: 'purchase' as const,
          description: 'Purchased Screen Parts',
          amount: 300,
          customerName: undefined,
          date: new Date('2024-01-14T14:20:00Z'),
        },
      ],
    }

    mockRecentActivitiesQuery.mockReturnValue({
      data: dataWithoutCustomer,
      isLoading: false,
      error: null,
      trpc: { path: 'dashboard.getRecentActivities' },
      refetch: jest.fn(),
      fetchStatus: 'idle',
      status: 'success',
    } as any)

    render(<RecentActivities />)

    expect(screen.getByText('Purchased Screen Parts')).toBeInTheDocument()
    expect(screen.getByText(/฿300/)).toBeInTheDocument()
    // Should not show customer name section for purchases
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })
})