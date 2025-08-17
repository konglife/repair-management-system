import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CustomersPage from './page'
import { api } from '~/app/providers'

// Mock the tRPC API
jest.mock('~/app/providers', () => ({
  api: {
    customers: {
      getAll: {
        useQuery: jest.fn(),
      },
      create: {
        useMutation: jest.fn(),
      },
      update: {
        useMutation: jest.fn(),
      },
    },
  },
}))

const mockCustomers = [
  {
    id: '1',
    name: 'John Doe',
    phone: '123-456-7890',
    address: '123 Main St',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: null,
    address: null,
    createdAt: new Date('2025-01-02'),
  },
]

// Create a wrapper component with QueryClient
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('CustomersPage', () => {
  const mockGetAllQuery = {
    data: mockCustomers,
    refetch: jest.fn(),
    isLoading: false,
  }

  const mockCreateMutation = {
    mutate: jest.fn(),
    isPending: false,
  }

  const mockUpdateMutation = {
    mutate: jest.fn(),
    isPending: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(api.customers.getAll.useQuery as jest.Mock).mockReturnValue(mockGetAllQuery)
    ;(api.customers.create.useMutation as jest.Mock).mockReturnValue(mockCreateMutation)
    ;(api.customers.update.useMutation as jest.Mock).mockReturnValue(mockUpdateMutation)
  })

  describe('Page Structure', () => {
    it('renders page title and description', () => {
      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      expect(screen.getByText('Customers')).toBeInTheDocument()
      expect(screen.getByText('Manage your customer database and contact information')).toBeInTheDocument()
    })

    it('displays customer statistics card', () => {
      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      expect(screen.getByText('Total Customers')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument() // mockCustomers.length
      expect(screen.getByText('Registered customers')).toBeInTheDocument()
    })

    it('displays Add New Customer button', () => {
      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      expect(screen.getByRole('button', { name: /add new customer/i })).toBeInTheDocument()
    })
  })

  describe('Customer List Display', () => {
    it('displays customer list with all columns', () => {
      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      // Check table headers
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Phone')).toBeInTheDocument()
      expect(screen.getByText('Address')).toBeInTheDocument()
      expect(screen.getByText('Created')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('displays customer data correctly', () => {
      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      // Check first customer
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('123-456-7890')).toBeInTheDocument()
      expect(screen.getByText('123 Main St')).toBeInTheDocument()

      // Check second customer with null values
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getAllByText('—')).toHaveLength(2) // null phone and address display as "—"
    })

    it('displays formatted creation dates', () => {
      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      expect(screen.getByText('1/1/2025')).toBeInTheDocument()
      expect(screen.getByText('1/2/2025')).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('displays loading state when customers are loading', () => {
      ;(api.customers.getAll.useQuery as jest.Mock).mockReturnValue({
        ...mockGetAllQuery,
        data: [], // During loading, data should be empty array
        isLoading: true,
      })

      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      expect(screen.getByText('0')).toBeInTheDocument() // No customers count during loading
      // Loading spinner should be visible in the table
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })

    it('displays empty state when no customers exist', () => {
      ;(api.customers.getAll.useQuery as jest.Mock).mockReturnValue({
        ...mockGetAllQuery,
        data: [],
      })

      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      expect(screen.getByText('No customers found. Add your first customer to get started.')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument() // Customer count should be 0
    })
  })

  describe('Add Customer Dialog', () => {
    it('opens dialog when Add New Customer button is clicked', () => {
      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      const addButton = screen.getByRole('button', { name: /add new customer/i })
      fireEvent.click(addButton)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /add new customer/i })).toBeInTheDocument()
      expect(screen.getByText('Enter the customer information. Name is required, phone and address are optional.')).toBeInTheDocument()
    })

    it('displays form fields with correct labels and requirements', () => {
      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      fireEvent.click(screen.getByRole('button', { name: /add new customer/i }))

      expect(screen.getByLabelText(/name \*/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/address/i)).toBeInTheDocument()

      // Check placeholders
      expect(screen.getByPlaceholderText('Enter customer name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter phone number (optional)')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter address (optional)')).toBeInTheDocument()
    })

    it('has submit and cancel buttons', () => {
      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      fireEvent.click(screen.getByRole('button', { name: /add new customer/i }))

      expect(screen.getByRole('button', { name: /add customer/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('disables submit button when name is empty', () => {
      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      fireEvent.click(screen.getByRole('button', { name: /add new customer/i }))

      const submitButton = screen.getByRole('button', { name: /add customer/i })
      expect(submitButton).toBeDisabled()
    })

    it('enables submit button when name is provided', () => {
      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      fireEvent.click(screen.getByRole('button', { name: /add new customer/i }))

      const nameInput = screen.getByLabelText(/name \*/i)
      fireEvent.change(nameInput, { target: { value: 'Test Customer' } })

      const submitButton = screen.getByRole('button', { name: /add customer/i })
      expect(submitButton).not.toBeDisabled()
    })

    it('trims whitespace from name input', () => {
      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      fireEvent.click(screen.getByRole('button', { name: /add new customer/i }))

      const nameInput = screen.getByLabelText(/name \*/i)
      fireEvent.change(nameInput, { target: { value: '   ' } })

      const submitButton = screen.getByRole('button', { name: /add customer/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Form Submission', () => {
    it('calls create mutation with correct data when form is submitted', () => {
      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      fireEvent.click(screen.getByRole('button', { name: /add new customer/i }))

      // Fill form
      fireEvent.change(screen.getByLabelText(/name \*/i), { target: { value: 'New Customer' } })
      fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '555-1234' } })
      fireEvent.change(screen.getByLabelText(/address/i), { target: { value: '456 Oak St' } })

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /add customer/i }))

      expect(mockCreateMutation.mutate).toHaveBeenCalledWith({
        name: 'New Customer',
        phone: '555-1234',
        address: '456 Oak St',
      })
    })

    it('calls create mutation with undefined for empty optional fields', () => {
      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      fireEvent.click(screen.getByRole('button', { name: /add new customer/i }))

      // Fill only required field
      fireEvent.change(screen.getByLabelText(/name \*/i), { target: { value: 'Minimal Customer' } })

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /add customer/i }))

      expect(mockCreateMutation.mutate).toHaveBeenCalledWith({
        name: 'Minimal Customer',
        phone: undefined,
        address: undefined,
      })
    })

    it('shows loading state during submission', () => {
      ;(api.customers.create.useMutation as jest.Mock).mockReturnValue({
        ...mockCreateMutation,
        isPending: true,
      })

      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      fireEvent.click(screen.getByRole('button', { name: /add new customer/i }))
      fireEvent.change(screen.getByLabelText(/name \*/i), { target: { value: 'Test' } })

      const submitButton = screen.getByRole('button', { name: /add customer/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Dialog Management', () => {
    it('closes dialog when cancel button is clicked', () => {
      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      fireEvent.click(screen.getByRole('button', { name: /add new customer/i }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('clears form when dialog is closed', () => {
      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      // Open dialog and fill form
      fireEvent.click(screen.getByRole('button', { name: /add new customer/i }))
      fireEvent.change(screen.getByLabelText(/name \*/i), { target: { value: 'Test' } })
      fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '123' } })

      // Close dialog
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      // Reopen dialog and check fields are cleared
      fireEvent.click(screen.getByRole('button', { name: /add new customer/i }))
      expect(screen.getByLabelText(/name \*/i)).toHaveValue('')
      expect(screen.getByLabelText(/phone/i)).toHaveValue('')
      expect(screen.getByLabelText(/address/i)).toHaveValue('')
    })
  })

  describe('Success Handling', () => {
    it('calls mutation with correct parameters', () => {
      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      fireEvent.click(screen.getByRole('button', { name: /add new customer/i }))
      fireEvent.change(screen.getByLabelText(/name \*/i), { target: { value: 'Success Test' } })
      fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '123-456-7890' } })
      fireEvent.click(screen.getByRole('button', { name: /add customer/i }))

      expect(mockCreateMutation.mutate).toHaveBeenCalledWith({
        name: 'Success Test',
        phone: '123-456-7890',
        address: undefined,
      })
    })

    it('mutation receives correct data structure', () => {
      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      fireEvent.click(screen.getByRole('button', { name: /add new customer/i }))
      fireEvent.change(screen.getByLabelText(/name \*/i), { target: { value: 'Callback Test' } })
      fireEvent.click(screen.getByRole('button', { name: /add customer/i }))

      // Check that mutate was called with the customer data
      expect(mockCreateMutation.mutate).toHaveBeenCalledWith({
        name: 'Callback Test',
        phone: undefined,
        address: undefined,
      })
    })
  })

  describe('Mutation Configuration', () => {
    it('verifies mutation is configured correctly', () => {
      render(
        <TestWrapper>
          <CustomersPage />
        </TestWrapper>
      )

      // Verify that the mutation hook was called correctly
      expect(api.customers.create.useMutation).toHaveBeenCalledWith({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    })
  })

  describe('Edit Customer Functionality', () => {
    describe('Edit Button Display', () => {
      it('displays edit buttons for each customer row', () => {
        render(
          <TestWrapper>
            <CustomersPage />
          </TestWrapper>
        )

        // There should be edit buttons for each customer
        const editButtons = screen.getAllByRole('button', { name: '' }) // Edit buttons have no text, just icon
        // Filter out the "Add New Customer" button
        const editButtonsOnly = editButtons.filter(button => 
          button.querySelector('svg') && !button.textContent?.includes('Add')
        )
        expect(editButtonsOnly).toHaveLength(mockCustomers.length)
      })

      it('edit buttons are clickable', () => {
        render(
          <TestWrapper>
            <CustomersPage />
          </TestWrapper>
        )

        const editButtons = screen.getAllByRole('button', { name: '' })
        const editButtonsOnly = editButtons.filter(button => 
          button.querySelector('svg') && !button.textContent?.includes('Add')
        )
        
        editButtonsOnly.forEach(button => {
          expect(button).not.toBeDisabled()
        })
      })
    })

    describe('Edit Dialog Opening', () => {
      it('opens edit dialog when edit button is clicked', () => {
        render(
          <TestWrapper>
            <CustomersPage />
          </TestWrapper>
        )

        const editButtons = screen.getAllByRole('button', { name: '' })
        const firstEditButton = editButtons.find(button => 
          button.querySelector('svg') && !button.textContent?.includes('Add')
        )
        
        fireEvent.click(firstEditButton!)

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /edit customer/i })).toBeInTheDocument()
        expect(screen.getByText('Update the customer information. Name is required, phone and address are optional.')).toBeInTheDocument()
      })

      it('pre-populates form with customer data when edit is opened', () => {
        render(
          <TestWrapper>
            <CustomersPage />
          </TestWrapper>
        )

        const editButtons = screen.getAllByRole('button', { name: '' })
        const firstEditButton = editButtons.find(button => 
          button.querySelector('svg') && !button.textContent?.includes('Add')
        )
        
        fireEvent.click(firstEditButton!)

        // Form should be pre-populated with first customer's data
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
        expect(screen.getByDisplayValue('123-456-7890')).toBeInTheDocument()
        expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument()
      })

      it('pre-populates form correctly for customer with null values', () => {
        render(
          <TestWrapper>
            <CustomersPage />
          </TestWrapper>
        )

        const editButtons = screen.getAllByRole('button', { name: '' })
        const editButtonsOnly = editButtons.filter(button => 
          button.querySelector('svg') && !button.textContent?.includes('Add')
        )
        const secondEditButton = editButtonsOnly[1] // Jane Smith has null phone/address
        
        fireEvent.click(secondEditButton)

        // Form should be pre-populated with second customer's data
        expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument()
        // Phone and address inputs should be empty (not "null")
        const phoneInput = screen.getByLabelText(/phone/i)
        const addressInput = screen.getByLabelText(/address/i)
        expect(phoneInput).toHaveValue('')
        expect(addressInput).toHaveValue('')
      })
    })

    describe('Edit Form Fields', () => {
      beforeEach(() => {
        render(
          <TestWrapper>
            <CustomersPage />
          </TestWrapper>
        )

        const editButtons = screen.getAllByRole('button', { name: '' })
        const firstEditButton = editButtons.find(button => 
          button.querySelector('svg') && !button.textContent?.includes('Add')
        )
        fireEvent.click(firstEditButton!)
      })

      it('displays all form fields with correct labels', () => {
        expect(screen.getByLabelText(/name \*/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/address/i)).toBeInTheDocument()
      })

      it('has update and cancel buttons', () => {
        expect(screen.getByRole('button', { name: /update customer/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      })

      it('allows editing form fields', () => {
        const nameInput = screen.getByLabelText(/name \*/i)
        const phoneInput = screen.getByLabelText(/phone/i)
        const addressInput = screen.getByLabelText(/address/i)

        fireEvent.change(nameInput, { target: { value: 'Updated Name' } })
        fireEvent.change(phoneInput, { target: { value: '999-888-7777' } })
        fireEvent.change(addressInput, { target: { value: 'Updated Address' } })

        expect(nameInput).toHaveValue('Updated Name')
        expect(phoneInput).toHaveValue('999-888-7777')
        expect(addressInput).toHaveValue('Updated Address')
      })
    })

    describe('Edit Form Validation', () => {
      beforeEach(() => {
        render(
          <TestWrapper>
            <CustomersPage />
          </TestWrapper>
        )

        const editButtons = screen.getAllByRole('button', { name: '' })
        const firstEditButton = editButtons.find(button => 
          button.querySelector('svg') && !button.textContent?.includes('Add')
        )
        fireEvent.click(firstEditButton!)
      })

      it('disables submit button when name is empty', () => {
        const nameInput = screen.getByLabelText(/name \*/i)
        fireEvent.change(nameInput, { target: { value: '' } })

        const submitButton = screen.getByRole('button', { name: /update customer/i })
        expect(submitButton).toBeDisabled()
      })

      it('disables submit button when name is only whitespace', () => {
        const nameInput = screen.getByLabelText(/name \*/i)
        fireEvent.change(nameInput, { target: { value: '   ' } })

        const submitButton = screen.getByRole('button', { name: /update customer/i })
        expect(submitButton).toBeDisabled()
      })

      it('enables submit button when name has valid content', () => {
        const nameInput = screen.getByLabelText(/name \*/i)
        fireEvent.change(nameInput, { target: { value: 'Valid Name' } })

        const submitButton = screen.getByRole('button', { name: /update customer/i })
        expect(submitButton).not.toBeDisabled()
      })
    })

    describe('Edit Form Submission', () => {
      beforeEach(() => {
        render(
          <TestWrapper>
            <CustomersPage />
          </TestWrapper>
        )

        const editButtons = screen.getAllByRole('button', { name: '' })
        const firstEditButton = editButtons.find(button => 
          button.querySelector('svg') && !button.textContent?.includes('Add')
        )
        fireEvent.click(firstEditButton!)
      })

      it('calls update mutation with correct data when form is submitted', () => {
        const nameInput = screen.getByLabelText(/name \*/i)
        const phoneInput = screen.getByLabelText(/phone/i)
        const addressInput = screen.getByLabelText(/address/i)

        fireEvent.change(nameInput, { target: { value: 'Updated John' } })
        fireEvent.change(phoneInput, { target: { value: '555-0123' } })
        fireEvent.change(addressInput, { target: { value: '456 New St' } })

        fireEvent.click(screen.getByRole('button', { name: /update customer/i }))

        expect(mockUpdateMutation.mutate).toHaveBeenCalledWith({
          id: '1', // First customer's ID
          name: 'Updated John',
          phone: '555-0123',
          address: '456 New St',
        })
      })

      it('calls update mutation with undefined for empty optional fields', () => {
        const nameInput = screen.getByLabelText(/name \*/i)
        const phoneInput = screen.getByLabelText(/phone/i)
        const addressInput = screen.getByLabelText(/address/i)

        fireEvent.change(nameInput, { target: { value: 'Name Only' } })
        fireEvent.change(phoneInput, { target: { value: '' } })
        fireEvent.change(addressInput, { target: { value: '' } })

        fireEvent.click(screen.getByRole('button', { name: /update customer/i }))

        expect(mockUpdateMutation.mutate).toHaveBeenCalledWith({
          id: '1',
          name: 'Name Only',
          phone: undefined,
          address: undefined,
        })
      })

      it('shows loading state during submission', () => {
        ;(api.customers.update.useMutation as jest.Mock).mockReturnValue({
          ...mockUpdateMutation,
          isPending: true,
        })

        // Re-render with pending state
        render(
          <TestWrapper>
            <CustomersPage />
          </TestWrapper>
        )

        const editButtons = screen.getAllByRole('button', { name: '' })
        const firstEditButton = editButtons.find(button => 
          button.querySelector('svg') && !button.textContent?.includes('Add')
        )
        fireEvent.click(firstEditButton!)

        const submitButton = screen.getByRole('button', { name: /update customer/i })
        expect(submitButton).toBeDisabled()
      })
    })

    describe('Edit Dialog Management', () => {
      it('closes dialog when cancel button is clicked', () => {
        render(
          <TestWrapper>
            <CustomersPage />
          </TestWrapper>
        )

        const editButtons = screen.getAllByRole('button', { name: '' })
        const firstEditButton = editButtons.find(button => 
          button.querySelector('svg') && !button.textContent?.includes('Add')
        )
        fireEvent.click(firstEditButton!)

        expect(screen.getByRole('dialog')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })

      it('clears form state when dialog is closed', () => {
        render(
          <TestWrapper>
            <CustomersPage />
          </TestWrapper>
        )

        // Open edit dialog for first customer
        const editButtons = screen.getAllByRole('button', { name: '' })
        const firstEditButton = editButtons.find(button => 
          button.querySelector('svg') && !button.textContent?.includes('Add')
        )
        fireEvent.click(firstEditButton!)

        // Modify fields
        const nameInput = screen.getByLabelText(/name \*/i)
        fireEvent.change(nameInput, { target: { value: 'Modified Name' } })

        // Close dialog
        fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

        // Open edit dialog for second customer
        const editButtonsAgain = screen.getAllByRole('button', { name: '' })
        const editButtonsOnlyAgain = editButtonsAgain.filter(button => 
          button.querySelector('svg') && !button.textContent?.includes('Add')
        )
        const secondEditButton = editButtonsOnlyAgain[1]
        fireEvent.click(secondEditButton)

        // Should show second customer's data, not the modified data
        expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument()
      })
    })

    describe('Edit Mutation Configuration', () => {
      it('verifies update mutation is configured correctly', () => {
        render(
          <TestWrapper>
            <CustomersPage />
          </TestWrapper>
        )

        expect(api.customers.update.useMutation).toHaveBeenCalledWith({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      })
    })
  })
});