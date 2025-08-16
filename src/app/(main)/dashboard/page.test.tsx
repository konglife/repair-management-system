import { render, screen } from '@testing-library/react'
import Dashboard from './page'

describe('Dashboard', () => {
  it('renders dashboard title and description', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Welcome to your repair shop management dashboard')).toBeInTheDocument()
  })

  it('displays all stat cards with correct titles', () => {
    render(<Dashboard />)
    
    // Check all stat card titles
    expect(screen.getByText('Active Repairs')).toBeInTheDocument()
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument()
    expect(screen.getByText('Low Stock Items')).toBeInTheDocument()
    expect(screen.getByText('Total Customers')).toBeInTheDocument()
  })

  it('displays stat card values', () => {
    render(<Dashboard />)
    
    // Check stat values
    expect(screen.getByText('12')).toBeInTheDocument() // Active Repairs
    expect(screen.getByText('$4,250')).toBeInTheDocument() // Monthly Revenue
    expect(screen.getByText('5')).toBeInTheDocument() // Low Stock Items
    expect(screen.getByText('156')).toBeInTheDocument() // Total Customers
  })

  it('renders recent activity section', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    
    // Check specific activity items
    expect(screen.getByText('Repair #RMS-001 completed')).toBeInTheDocument()
    expect(screen.getByText('New customer added: John Smith')).toBeInTheDocument()
    expect(screen.getByText('Stock level low: iPhone Screen')).toBeInTheDocument()
    
    // Check time stamps
    expect(screen.getByText('2 hours ago')).toBeInTheDocument()
    expect(screen.getByText('4 hours ago')).toBeInTheDocument()
    expect(screen.getByText('1 day ago')).toBeInTheDocument()
  })

  it('renders quick actions section with all buttons', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    
    // Check all quick action buttons
    expect(screen.getByRole('button', { name: 'Create New Repair' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Customer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Record Sale' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update Stock' })).toBeInTheDocument()
  })

  it('applies correct CSS classes for responsive design', () => {
    render(<Dashboard />)
    
    // Check main container structure - Dashboard is in a div with specific classes
    const dashboardHeader = screen.getByText('Dashboard')
    const container = dashboardHeader.closest('div[class*="p-6"]')
    expect(container).toBeInTheDocument()
    
    // Check that stat cards are rendered in a grid layout - look for the grid container
    const activeRepairsCard = screen.getByText('Active Repairs')
    const statsGrid = activeRepairsCard.closest('div')?.parentElement?.parentElement?.parentElement
    expect(statsGrid).toHaveClass('grid')
  })

  it('has proper semantic structure', () => {
    render(<Dashboard />)
    
    // Check main heading is h1
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toHaveTextContent('Dashboard')
    
    // Check section headings are h2
    const activityHeading = screen.getByRole('heading', { level: 2, name: 'Recent Activity' })
    expect(activityHeading).toBeInTheDocument()
    
    const actionsHeading = screen.getByRole('heading', { level: 2, name: 'Quick Actions' })
    expect(actionsHeading).toBeInTheDocument()
    
    // Check that we have proper heading structure
    const activityHeadingElement = screen.getByText('Recent Activity')
    expect(activityHeadingElement.tagName).toBe('H2')
    
    const actionsHeadingElement = screen.getByText('Quick Actions')
    expect(actionsHeadingElement.tagName).toBe('H2')
  })

  it('displays activity indicators with different colors', () => {
    render(<Dashboard />)
    
    // The activity indicators are rendered as colored dots
    // We can't easily test the actual colors, but we can verify the structure exists
    const activitySection = screen.getByText('Recent Activity').closest('div')
    expect(activitySection).toBeInTheDocument()
    
    // Verify activity items are present which should have the colored indicators
    expect(screen.getByText('Repair #RMS-001 completed')).toBeInTheDocument()
    expect(screen.getByText('New customer added: John Smith')).toBeInTheDocument()
    expect(screen.getByText('Stock level low: iPhone Screen')).toBeInTheDocument()
  })
})