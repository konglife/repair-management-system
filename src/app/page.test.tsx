import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home page', () => {
  it('renders the page title', () => {
    render(<Home />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Repair Management System')
  })
  
  it('renders the welcome message', () => {
    render(<Home />)
    
    const welcomeText = screen.getByText('Welcome to your repair shop management application')
    expect(welcomeText).toBeInTheDocument()
  })
  
  it('has proper layout structure', () => {
    render(<Home />)
    
    const mainElement = screen.getByRole('main')
    expect(mainElement).toBeInTheDocument()
    expect(mainElement).toHaveClass('text-center')
  })
})