import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StockPage from './page';
import { api } from '~/app/providers';

// Mock the tRPC API
jest.mock('~/app/providers', () => ({
  api: {
    categories: {
      getAll: {
        useQuery: jest.fn(),
      },
      create: {
        useMutation: jest.fn(),
      },
      update: {
        useMutation: jest.fn(),
      },
      delete: {
        useMutation: jest.fn(),
      },
    },
    units: {
      getAll: {
        useQuery: jest.fn(),
      },
      create: {
        useMutation: jest.fn(),
      },
      update: {
        useMutation: jest.fn(),
      },
      delete: {
        useMutation: jest.fn(),
      },
    },
    products: {
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
    purchases: {
      create: {
        useMutation: jest.fn(),
      },
      getAll: {
        useQuery: jest.fn(),
      },
      getByProduct: {
        useQuery: jest.fn(),
      },
    },
  },
}));

const mockCategories = [
  { id: 'cat-1', name: 'Electronics' },
  { id: 'cat-2', name: 'Accessories' },
];

const mockUnits = [
  { id: 'unit-1', name: 'piece' },
  { id: 'unit-2', name: 'box' },
];

const mockProducts = [
  {
    id: 'product-1',
    name: 'iPhone Screen',
    salePrice: 150.00,
    quantity: 10,
    averageCost: 75.00,
    categoryId: 'cat-1',
    unitId: 'unit-1',
    category: { name: 'Electronics' },
    unit: { name: 'piece' },
  },
  {
    id: 'product-2',
    name: 'Phone Case',
    salePrice: 25.00,
    quantity: 5,
    averageCost: 12.50,
    categoryId: 'cat-2',
    unitId: 'unit-1',
    category: { name: 'Accessories' },
    unit: { name: 'piece' },
  },
];

const mockPurchaseHistory = [
  {
    id: 'purchase-1',
    quantity: 5,
    costPerUnit: 70.00,
    purchaseDate: '2023-01-15T10:00:00Z',
    product: {
      id: 'product-1',
      name: 'iPhone Screen',
      category: { name: 'Electronics' },
      unit: { name: 'piece' },
    },
  },
  {
    id: 'purchase-2',
    quantity: 3,
    costPerUnit: 80.00,
    purchaseDate: '2023-01-10T15:30:00Z',
    product: {
      id: 'product-1',
      name: 'iPhone Screen',
      category: { name: 'Electronics' },
      unit: { name: 'piece' },
    },
  },
];

describe('StockPage - Purchase Recording', () => {
  const mockMutateFn = jest.fn();
  const mockRefetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful API queries
    (api.categories.getAll.useQuery as jest.Mock).mockReturnValue({
      data: mockCategories,
      refetch: mockRefetch,
      isLoading: false,
    });

    (api.units.getAll.useQuery as jest.Mock).mockReturnValue({
      data: mockUnits,
      refetch: mockRefetch,
      isLoading: false,
    });

    (api.products.getAll.useQuery as jest.Mock).mockReturnValue({
      data: mockProducts,
      refetch: mockRefetch,
      isLoading: false,
    });

    // Mock all mutations
    const mockMutationReturn = {
      mutate: mockMutateFn,
      isPending: false,
    };

    (api.categories.create.useMutation as jest.Mock).mockReturnValue(mockMutationReturn);
    (api.categories.update.useMutation as jest.Mock).mockReturnValue(mockMutationReturn);
    (api.categories.delete.useMutation as jest.Mock).mockReturnValue(mockMutationReturn);
    (api.units.create.useMutation as jest.Mock).mockReturnValue(mockMutationReturn);
    (api.units.update.useMutation as jest.Mock).mockReturnValue(mockMutationReturn);
    (api.units.delete.useMutation as jest.Mock).mockReturnValue(mockMutationReturn);
    (api.products.create.useMutation as jest.Mock).mockReturnValue(mockMutationReturn);
    (api.products.update.useMutation as jest.Mock).mockReturnValue(mockMutationReturn);

    (api.purchases.create.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutateFn,
      isPending: false,
    });

    (api.purchases.getAll.useQuery as jest.Mock).mockReturnValue({
      data: [],
      refetch: mockRefetch,
      isLoading: false,
    });

    (api.purchases.getByProduct.useQuery as jest.Mock).mockReturnValue({
      data: [],
      refetch: mockRefetch,
      isLoading: false,
    });
  });

  it('renders the Record Purchase tab', async () => {
    render(<StockPage />);

    // Look for the tab button specifically (it has the ShoppingCart icon)
    const purchaseTab = screen.getByRole('button', { name: /Record Purchase/ });
    expect(purchaseTab).toBeInTheDocument();
    
    // Should have ShoppingCart icon in tab area
    const tabButtons = screen.getAllByRole('button', { name: /Record Purchase/ });
    expect(tabButtons.length).toBeGreaterThan(0);
  });

  it('switches to Purchase tab when clicked', async () => {
    const user = userEvent.setup();
    render(<StockPage />);

    const purchaseTab = screen.getByRole('button', { name: /Record Purchase/i });
    await user.click(purchaseTab);

    expect(screen.getByText('Record Stock Purchase')).toBeInTheDocument();
    expect(screen.getByText('Record New Purchase')).toBeInTheDocument();
  });

  it('displays purchase recording form with correct fields', async () => {
    const user = userEvent.setup();
    render(<StockPage />);

    const purchaseTab = screen.getByRole('button', { name: /Record Purchase/i });
    await user.click(purchaseTab);

    // Check form fields
    expect(screen.getByLabelText('Product')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
    expect(screen.getByLabelText('Cost Per Unit ($)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Record Purchase/i })).toBeInTheDocument();
  });

  it('populates product dropdown with available products', async () => {
    const user = userEvent.setup();
    render(<StockPage />);

    const purchaseTab = screen.getByRole('button', { name: /Record Purchase/i });
    await user.click(purchaseTab);

    const productSelect = screen.getByLabelText('Product');
    expect(productSelect).toBeInTheDocument();

    // Check that products are in the dropdown
    expect(screen.getByText('iPhone Screen (piece)')).toBeInTheDocument();
    expect(screen.getByText('Phone Case (piece)')).toBeInTheDocument();
  });

  it('validates purchase form inputs', async () => {
    const user = userEvent.setup();
    render(<StockPage />);

    const purchaseTab = screen.getByRole('button', { name: /Record Purchase/i });
    await user.click(purchaseTab);

    const submitButton = screen.getByRole('button', { name: /Record Purchase/i });
    
    // Button should be disabled initially (no product selected)
    expect(submitButton).toBeDisabled();

    // Fill in product
    const productSelect = screen.getByLabelText('Product');
    await user.selectOptions(productSelect, 'product-1');

    // Still disabled without quantity and cost
    expect(submitButton).toBeDisabled();

    // Fill in quantity
    const quantityInput = screen.getByLabelText('Quantity');
    await user.type(quantityInput, '5');

    // Still disabled without cost
    expect(submitButton).toBeDisabled();

    // Fill in cost
    const costInput = screen.getByLabelText('Cost Per Unit ($)');
    await user.type(costInput, '75.50');

    // Now should be enabled
    expect(submitButton).toBeEnabled();
  });

  it('submits purchase form with correct data', async () => {
    const user = userEvent.setup();
    render(<StockPage />);

    const purchaseTab = screen.getByRole('button', { name: /Record Purchase/i });
    await user.click(purchaseTab);

    // Fill in form
    const productSelect = screen.getByLabelText('Product');
    await user.selectOptions(productSelect, 'product-1');

    const quantityInput = screen.getByLabelText('Quantity');
    await user.type(quantityInput, '10');

    const costInput = screen.getByLabelText('Cost Per Unit ($)');
    await user.type(costInput, '85.00');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Record Purchase/i });
    await user.click(submitButton);

    expect(mockMutateFn).toHaveBeenCalledWith({
      productId: 'product-1',
      quantity: 10,
      costPerUnit: 85.00,
    });
  });

  it('displays purchase history section', async () => {
    const user = userEvent.setup();
    render(<StockPage />);

    const purchaseTab = screen.getByRole('button', { name: /Record Purchase/i });
    await user.click(purchaseTab);

    expect(screen.getByText('Purchase History')).toBeInTheDocument();
    expect(screen.getByText('View history for product')).toBeInTheDocument();

    const historySelect = screen.getByDisplayValue('Select product to view history');
    expect(historySelect).toBeInTheDocument();
  });

  it('loads and displays purchase history when product is selected', async () => {
    // Mock purchase history data
    (api.purchases.getByProduct.useQuery as jest.Mock).mockReturnValue({
      data: mockPurchaseHistory,
      refetch: mockRefetch,
      isLoading: false,
    });

    const user = userEvent.setup();
    render(<StockPage />);

    const purchaseTab = screen.getByRole('button', { name: /Record Purchase/i });
    await user.click(purchaseTab);

    // Select product for history
    const historySelect = screen.getByDisplayValue('Select product to view history');
    await user.selectOptions(historySelect, 'product-1');

    await waitFor(() => {
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Quantity')).toBeInTheDocument();
      expect(screen.getByText('Cost Per Unit')).toBeInTheDocument();
      expect(screen.getByText('Total Cost')).toBeInTheDocument();
    });
  });

  it('displays purchase history data correctly', async () => {
    // Mock purchase history data
    (api.purchases.getByProduct.useQuery as jest.Mock).mockReturnValue({
      data: mockPurchaseHistory,
      refetch: mockRefetch,
      isLoading: false,
    });

    const user = userEvent.setup();
    render(<StockPage />);

    const purchaseTabs = screen.getAllByRole('button', { name: /Record Purchase/i });
    const purchaseTab = purchaseTabs[0]; // Use the first one (tab navigation)
    await user.click(purchaseTab);

    // Select product for history
    const historySelect = screen.getByDisplayValue('All Purchases');
    await user.selectOptions(historySelect, 'product-1');

    await waitFor(() => {
      // Check first purchase record
      expect(screen.getByText('5')).toBeInTheDocument(); // quantity
      expect(screen.getByText('฿70.00')).toBeInTheDocument(); // cost per unit
      expect(screen.getByText('฿350.00')).toBeInTheDocument(); // total cost (5 * 70)

      // Check second purchase record
      expect(screen.getByText('3')).toBeInTheDocument(); // quantity
      expect(screen.getByText('฿80.00')).toBeInTheDocument(); // cost per unit
      expect(screen.getByText('฿240.00')).toBeInTheDocument(); // total cost (3 * 80)
    });
  });

  it('shows loading state when creating purchase', async () => {
    (api.purchases.create.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutateFn,
      isPending: true,
    });

    const user = userEvent.setup();
    render(<StockPage />);

    const purchaseTab = screen.getByRole('button', { name: /Record Purchase/i });
    await user.click(purchaseTab);

    const submitButton = screen.getByRole('button', { name: /Record Purchase/i });
    expect(submitButton).toBeDisabled();
    
    // Should show loading spinner (Loader2 component)
    const loader = submitButton.querySelector('svg');
    expect(loader).toBeInTheDocument();
  });

  it('shows loading state when fetching purchase history', async () => {
    (api.purchases.getByProduct.useQuery as jest.Mock).mockReturnValue({
      data: [],
      refetch: mockRefetch,
      isLoading: true,
    });

    const user = userEvent.setup();
    render(<StockPage />);

    const purchaseTab = screen.getByRole('button', { name: /Record Purchase/i });
    await user.click(purchaseTab);

    // Select product for history
    const historySelect = screen.getByDisplayValue('Select product to view history');
    await user.selectOptions(historySelect, 'product-1');

    await waitFor(() => {
      // Should show loading row in table
      const loadingCell = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'td' && 
               element?.classList.contains('text-center');
      });
      expect(loadingCell).toBeInTheDocument();
    });
  });

  it('shows empty state when no purchase history exists', async () => {
    (api.purchases.getByProduct.useQuery as jest.Mock).mockReturnValue({
      data: [],
      refetch: mockRefetch,
      isLoading: false,
    });

    const user = userEvent.setup();
    render(<StockPage />);

    const purchaseTab = screen.getByRole('button', { name: /Record Purchase/i });
    await user.click(purchaseTab);

    // Select product for history
    const historySelect = screen.getByDisplayValue('Select product to view history');
    await user.selectOptions(historySelect, 'product-1');

    await waitFor(() => {
      expect(screen.getByText('No purchase history found for this product.')).toBeInTheDocument();
    });
  });

  it('quick action button navigates to purchase tab', async () => {
    const user = userEvent.setup();
    render(<StockPage />);

    // Initially on categories tab
    expect(screen.getByText('Categories')).toBeInTheDocument();

    // Click quick action button
    const quickActionButton = screen.getByRole('button', { name: /Record Purchase/i });
    await user.click(quickActionButton);

    // Should switch to purchases tab
    expect(screen.getByText('Record Stock Purchase')).toBeInTheDocument();
  });

  it('handles form validation errors gracefully', async () => {
    // Mock window.alert to verify error handling
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    const user = userEvent.setup();
    render(<StockPage />);

    const purchaseTab = screen.getByRole('button', { name: /Record Purchase/i });
    await user.click(purchaseTab);

    // Fill form with invalid data
    const productSelect = screen.getByLabelText('Product');
    await user.selectOptions(productSelect, 'product-1');

    const quantityInput = screen.getByLabelText('Quantity');
    await user.type(quantityInput, '0'); // Invalid quantity

    const costInput = screen.getByLabelText('Cost Per Unit ($)');
    await user.type(costInput, '85.00');

    // Try to submit
    const submitButton = screen.getByRole('button', { name: /Record Purchase/i });
    await user.click(submitButton);

    expect(alertSpy).toHaveBeenCalledWith('Please enter a valid quantity');

    alertSpy.mockRestore();
  });
});