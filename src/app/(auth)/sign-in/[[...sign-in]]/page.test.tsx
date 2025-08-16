import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SignInPage from './page'

// Mock Clerk's SignIn component
jest.mock('@clerk/nextjs', () => ({
  SignIn: jest.fn(() => <div data-testid="clerk-signin">Mocked SignIn Component</div>),
}))

describe('SignInPage', () => {
  it('renders the sign-in page with correct title and branding', () => {
    render(<SignInPage />)
    
    expect(screen.getByText('Repair Management System')).toBeInTheDocument()
    expect(screen.getByText('Sign in to access your repair shop dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('clerk-signin')).toBeInTheDocument()
  })

  it('has proper styling structure', () => {
    const { container } = render(<SignInPage />)
    
    const mainContainer = container.firstChild as HTMLElement
    expect(mainContainer).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-screen', 'bg-gray-50')
  })
})