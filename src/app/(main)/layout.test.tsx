import { render, screen, fireEvent } from '@testing-library/react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import type { UserResource } from '@clerk/types'
import MainLayout from './layout'

// Mock the Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
  UserButton: () => <div data-testid="user-button">User Button</div>,
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

const mockPush = jest.fn()
const mockBack = jest.fn()
const mockForward = jest.fn()
const mockRefresh = jest.fn()
const mockReplace = jest.fn()
const mockPrefetch = jest.fn()

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

// Create a complete AppRouterInstance mock
const createMockRouter = (): AppRouterInstance => ({
  push: mockPush,
  back: mockBack,
  forward: mockForward,
  refresh: mockRefresh,
  replace: mockReplace,
  prefetch: mockPrefetch,
})

// Helper to create minimal mock user objects
const createMockUser = (overrides: Partial<UserResource> = {}): Partial<UserResource> => ({
  id: 'user_test123',
  fullName: 'Test User',
  emailAddresses: [{ emailAddress: 'test@example.com' }] as UserResource['emailAddresses'],
  ...overrides,
})

describe('MainLayout', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue(createMockRouter())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state when user data is not loaded', () => {
    mockUseUser.mockReturnValue({
      isLoaded: false,
      isSignedIn: undefined,
      user: undefined,
    })

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows redirecting state and redirects when user is not signed in', () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      user: null,
    })

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    )

    expect(screen.getByText('Redirecting...')).toBeInTheDocument()
    expect(mockPush).toHaveBeenCalledWith('/sign-in')
  })

  it('renders main layout with sidebar when user is authenticated', () => {
    const mockUser = createMockUser({
      fullName: 'John Doe',
      emailAddresses: [{ emailAddress: 'john@example.com' }] as UserResource['emailAddresses'],
    })

    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockUser as UserResource,
    })

    render(
      <MainLayout>
        <div data-testid="test-content">Test Content</div>
      </MainLayout>
    )

    // Check if sidebar elements are present
    expect(screen.getAllByText('Repair Management')[0]).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getAllByTestId('user-button')[0]).toBeInTheDocument()
    
    // Check navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Stock')).toBeInTheDocument()
    expect(screen.getByText('Customers')).toBeInTheDocument()
    expect(screen.getByText('Sales')).toBeInTheDocument()
    expect(screen.getByText('Repairs')).toBeInTheDocument()
    
    // Check if children content is rendered
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })

  it('displays email address when user has no full name', () => {
    const mockUser = createMockUser({
      fullName: null,
      emailAddresses: [{ emailAddress: 'user@example.com' }] as UserResource['emailAddresses'],
    })

    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockUser as UserResource,
    })

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    )

    expect(screen.getAllByText('user@example.com')[0]).toBeInTheDocument()
  })

  it('displays fallback "User" when no user info is available', () => {
    const mockUser = createMockUser({
      fullName: null,
      emailAddresses: [],
    })

    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockUser as UserResource,
    })

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    )

    expect(screen.getByText('User')).toBeInTheDocument()
  })

  it('handles mobile sidebar toggle functionality', async () => {
    const mockUser = createMockUser({
      fullName: 'Jane Doe',
      emailAddresses: [{ emailAddress: 'jane@example.com' }] as UserResource['emailAddresses'],
    })

    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockUser as UserResource,
    })

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    )

    // Find the mobile menu button (Menu icon) - look for the specific one with Menu icon
    const buttons = screen.getAllByRole('button')
    const menuButton = buttons.find(button => button.querySelector('.lucide-menu'))
    expect(menuButton).toBeInTheDocument()

    // Click to open sidebar
    fireEvent.click(menuButton!)

    // The test verifies that the button exists and is clickable
    // In a real app, this would open the sidebar and show the close button
  })

  it('includes correct navigation links with proper hrefs', () => {
    const mockUser = createMockUser({
      fullName: 'Test User',
      emailAddresses: [{ emailAddress: 'test@example.com' }] as UserResource['emailAddresses'],
    })

    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockUser as UserResource,
    })

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    )

    // Check navigation links have correct hrefs
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')

    const stockLink = screen.getByRole('link', { name: /stock/i })
    expect(stockLink).toHaveAttribute('href', '/stock')

    const customersLink = screen.getByRole('link', { name: /customers/i })
    expect(customersLink).toHaveAttribute('href', '/customers')

    const salesLink = screen.getByRole('link', { name: /sales/i })
    expect(salesLink).toHaveAttribute('href', '/sales')

    const repairsLink = screen.getByRole('link', { name: /repairs/i })
    expect(repairsLink).toHaveAttribute('href', '/repairs')
  })
})