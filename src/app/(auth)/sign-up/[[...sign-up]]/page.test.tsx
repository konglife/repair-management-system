import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SignUpPage from './page'

// Mock Clerk's SignUp component
jest.mock('@clerk/nextjs', () => ({
  SignUp: jest.fn(() => <div data-testid="clerk-signup">Mocked SignUp Component</div>),
}))

describe('SignUpPage', () => {
  it('renders the sign-up page with correct title and branding', () => {
    render(<SignUpPage />)
    
    expect(screen.getByText('Repair Management System')).toBeInTheDocument()
    expect(screen.getByText('Create your account to get started with repair shop management')).toBeInTheDocument()
    expect(screen.getByTestId('clerk-signup')).toBeInTheDocument()
  })

  it('has proper styling structure', () => {
    const { container } = render(<SignUpPage />)
    
    const mainContainer = container.firstChild as HTMLElement
    expect(mainContainer).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-screen', 'bg-gray-50')
  })
})