import { render, screen } from '@testing-library/react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import type { UserResource } from '@clerk/types'
import HomePage from './page'

// Mock the Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
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

describe('HomePage', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue(createMockRouter())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state when auth is not loaded', () => {
    mockUseUser.mockReturnValue({
      isLoaded: false,
      isSignedIn: undefined,
      user: undefined,
    })

    render(<HomePage />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('redirects authenticated user to dashboard', () => {
    const mockUser = createMockUser()

    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockUser as UserResource,
    })

    render(<HomePage />)

    expect(mockPush).toHaveBeenCalledWith('/dashboard')
    expect(screen.getByText('Redirecting to dashboard...')).toBeInTheDocument()
  })

  it('redirects unauthenticated user to sign-in', () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      user: null,
    })

    render(<HomePage />)

    expect(mockPush).toHaveBeenCalledWith('/sign-in')
    expect(screen.getByText('Redirecting to sign in...')).toBeInTheDocument()
  })

  it('shows appropriate redirecting message for authenticated users', () => {
    const mockUser = createMockUser()

    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockUser as UserResource,
    })

    render(<HomePage />)

    expect(screen.getByText('Redirecting to dashboard...')).toBeInTheDocument()
    expect(screen.queryByText('Redirecting to sign in...')).not.toBeInTheDocument()
  })

  it('shows appropriate redirecting message for unauthenticated users', () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      user: null,
    })

    render(<HomePage />)

    expect(screen.getByText('Redirecting to sign in...')).toBeInTheDocument()
    expect(screen.queryByText('Redirecting to dashboard...')).not.toBeInTheDocument()
  })

  it('displays loading spinner in all states', () => {
    // Test loading state
    mockUseUser.mockReturnValue({
      isLoaded: false,
      isSignedIn: undefined,
      user: undefined,
    })

    const { rerender } = render(<HomePage />)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()

    // Test authenticated state
    const mockUser = createMockUser()
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockUser as UserResource,
    })

    rerender(<HomePage />)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()

    // Test unauthenticated state
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      user: null,
    })

    rerender(<HomePage />)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })
})