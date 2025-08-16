import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from './page'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock Clerk components
jest.mock('@clerk/nextjs', () => ({
  UserButton: jest.fn(() => <div data-testid="user-button">Mocked UserButton</div>),
  useUser: jest.fn(),
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>
const mockPush = jest.fn()

describe('Home page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  })

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user: { id: 'test-user' } as any,
      })
    })

    it('renders the page title in header', () => {
      render(<Home />)
      
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Repair Management System')
    })
    
    it('renders the dashboard welcome message', () => {
      render(<Home />)
      
      const welcomeHeading = screen.getByText('Welcome to Your Dashboard')
      expect(welcomeHeading).toBeInTheDocument()
      
      const description = screen.getByText('Manage your repair shop operations efficiently')
      expect(description).toBeInTheDocument()
    })
    
    it('renders the UserButton component', () => {
      render(<Home />)
      
      const userButton = screen.getByTestId('user-button')
      expect(userButton).toBeInTheDocument()
    })
    
    it('renders the feature cards', () => {
      render(<Home />)
      
      expect(screen.getByText('Repairs')).toBeInTheDocument()
      expect(screen.getByText('Track and manage repair jobs')).toBeInTheDocument()
      
      expect(screen.getByText('Inventory')).toBeInTheDocument()
      expect(screen.getByText('Manage parts and stock levels')).toBeInTheDocument()
      
      expect(screen.getByText('Customers')).toBeInTheDocument()
      expect(screen.getByText('Customer information and history')).toBeInTheDocument()
    })
    
    it('has proper layout structure', () => {
      render(<Home />)
      
      const mainElement = screen.getByRole('main')
      expect(mainElement).toBeInTheDocument()
    })
  })

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        user: null,
      })
    })

    it('shows redirecting state', () => {
      render(<Home />)
      
      expect(screen.getByText('Redirecting...')).toBeInTheDocument()
    })
  })

  describe('when authentication is loading', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
        user: null,
      })
    })

    it('shows loading state', () => {
      render(<Home />)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })
})