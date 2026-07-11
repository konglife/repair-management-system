import {
  render,
  screen,
  waitFor,
  within,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StockPage from "./page";
import { api } from "~/app/providers";

// Mock the tRPC API
jest.mock("~/app/providers", () => ({
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
      getTotalValue: {
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
  { id: "cat-1", name: "Electronics" },
  { id: "cat-2", name: "Accessories" },
];

const mockUnits = [
  { id: "unit-1", name: "piece" },
  { id: "unit-2", name: "box" },
];

const mockProducts = [
  {
    id: "product-1",
    name: "iPhone Screen",
    salePrice: 150.0,
    quantity: 10,
    averageCost: 75.0,
    categoryId: "cat-1",
    unitId: "unit-1",
    category: { name: "Electronics" },
    unit: { name: "piece" },
  },
  {
    id: "product-2",
    name: "Phone Case",
    salePrice: 25.0,
    quantity: 5,
    averageCost: 12.5,
    categoryId: "cat-2",
    unitId: "unit-1",
    category: { name: "Accessories" },
    unit: { name: "piece" },
  },
];

const mockPurchaseHistory = [
  {
    id: "purchase-1",
    quantity: 5,
    costPerUnit: 70.0,
    purchaseDate: "2023-01-15T10:00:00Z",
    product: {
      id: "product-1",
      name: "iPhone Screen",
      category: { name: "Electronics" },
      unit: { name: "piece" },
    },
  },
  {
    id: "purchase-2",
    quantity: 3,
    costPerUnit: 80.0,
    purchaseDate: "2023-01-10T15:30:00Z",
    product: {
      id: "product-1",
      name: "iPhone Screen",
      category: { name: "Electronics" },
      unit: { name: "piece" },
    },
  },
];

describe("StockPage - Purchase Recording", () => {
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

    (api.products.getTotalValue.useQuery as jest.Mock).mockReturnValue({
      data: 0,
      isLoading: false,
      error: null,
    });

    // Mock all mutations
    const mockMutationReturn = {
      mutate: mockMutateFn,
      isPending: false,
    };

    (api.categories.create.useMutation as jest.Mock).mockReturnValue(
      mockMutationReturn
    );
    (api.categories.update.useMutation as jest.Mock).mockReturnValue(
      mockMutationReturn
    );
    (api.categories.delete.useMutation as jest.Mock).mockReturnValue(
      mockMutationReturn
    );
    (api.units.create.useMutation as jest.Mock).mockReturnValue(
      mockMutationReturn
    );
    (api.units.update.useMutation as jest.Mock).mockReturnValue(
      mockMutationReturn
    );
    (api.units.delete.useMutation as jest.Mock).mockReturnValue(
      mockMutationReturn
    );
    (api.products.create.useMutation as jest.Mock).mockReturnValue(
      mockMutationReturn
    );
    (api.products.update.useMutation as jest.Mock).mockReturnValue(
      mockMutationReturn
    );

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

  it("renders the Record Purchase tab", async () => {
    render(<StockPage />);

    // Look for the tab button specifically (it has the ShoppingCart icon)
    const purchaseTab = screen.getByRole("button", { name: /Record Purchase/ });
    expect(purchaseTab).toBeInTheDocument();

    // Should have ShoppingCart icon in tab area
    const tabButtons = screen.getAllByRole("button", {
      name: /Record Purchase/,
    });
    expect(tabButtons.length).toBeGreaterThan(0);
  });

  it("switches to Purchase tab when clicked", async () => {
    const user = userEvent.setup();
    render(<StockPage />);

    const purchaseTab = screen.getByRole("button", {
      name: /Record Purchase/i,
    });
    await user.click(purchaseTab);

    expect(screen.getByText("Record Stock Purchase")).toBeInTheDocument();
    // The purchase form itself is toggle-revealed by the "Add Purchase" button,
    // so 'Record New Purchase' is not visible until the form is opened.
  });

  // Product field uses ProductPicker (EntityPicker) — a searchable dropdown, not a
  // native <select>. The form is toggle-revealed via "Add Purchase" and currency is ฿.
  // These tests drive the picker (open via "Toggle dropdown", click item) + the form.
  async function openPurchaseForm() {
    const user = userEvent.setup();
    const { container } = render(<StockPage />);
    await user.click(screen.getByRole("button", { name: /Record Purchase/i }));
    await user.click(screen.getByRole("button", { name: /Add Purchase/i }));
    const form = container.querySelector("form") as HTMLFormElement;
    return { user, form };
  }

  it("displays purchase recording form with correct fields", async () => {
    const { form } = await openPurchaseForm();

    expect(form).toBeInTheDocument();
    // Product is a searchable picker, not a native <select>
    expect(
      within(form).getByPlaceholderText("Search for a product to purchase...")
    ).toBeInTheDocument();
    expect(
      within(form).getByPlaceholderText("Enter quantity")
    ).toBeInTheDocument();
    expect(
      within(form).getByLabelText("Currency amount input")
    ).toBeInTheDocument();
    expect(
      within(form).getByRole("button", { name: /Record Purchase/i })
    ).toBeInTheDocument();
  });

  it("populates product dropdown with available products", async () => {
    const { user, form } = await openPurchaseForm();

    await user.click(
      within(form).getByRole("button", { name: "Toggle dropdown" })
    );

    expect(within(form).getByText("iPhone Screen (piece)")).toBeInTheDocument();
    expect(within(form).getByText("Phone Case (piece)")).toBeInTheDocument();
  });

  it("enables submit only once product, quantity and cost are filled", async () => {
    const { user, form } = await openPurchaseForm();

    const submit = within(form).getByRole("button", {
      name: /Record Purchase/i,
    });
    // Disabled with no fields filled
    expect(submit).toBeDisabled();

    // Select a product via the picker
    await user.click(
      within(form).getByRole("button", { name: "Toggle dropdown" })
    );
    await user.click(within(form).getByText("iPhone Screen (piece)"));
    expect(submit).toBeDisabled();

    // Still disabled without quantity
    await user.type(within(form).getByPlaceholderText("Enter quantity"), "5");
    expect(submit).toBeDisabled();

    // Enabled once cost is filled
    await user.type(
      within(form).getByLabelText("Currency amount input"),
      "75.50"
    );
    expect(submit).toBeEnabled();
  });

  it("submits purchase form with correct data", async () => {
    const { user, form } = await openPurchaseForm();

    // Select product via the picker
    await user.click(
      within(form).getByRole("button", { name: "Toggle dropdown" })
    );
    await user.click(within(form).getByText("iPhone Screen (piece)"));

    await user.type(within(form).getByPlaceholderText("Enter quantity"), "10");
    await user.type(within(form).getByLabelText("Currency amount input"), "85");

    fireEvent.submit(form);

    expect(mockMutateFn).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: "product-1",
        quantity: 10,
        costPerUnit: 85,
      })
    );
  });

  it("displays purchase history section", async () => {
    const user = userEvent.setup();
    render(<StockPage />);

    const purchaseTab = screen.getByRole("button", {
      name: /Record Purchase/i,
    });
    await user.click(purchaseTab);

    expect(screen.getByText("Purchase History")).toBeInTheDocument();
    expect(screen.getByText("Filter by product")).toBeInTheDocument();

    const historySelect = screen.getByDisplayValue("All Purchases");
    expect(historySelect).toBeInTheDocument();
  });

  it("loads and displays purchase history when product is selected", async () => {
    // Mock purchase history data
    (api.purchases.getByProduct.useQuery as jest.Mock).mockReturnValue({
      data: mockPurchaseHistory,
      refetch: mockRefetch,
      isLoading: false,
    });

    const user = userEvent.setup();
    render(<StockPage />);

    const purchaseTab = screen.getByRole("button", {
      name: /Record Purchase/i,
    });
    await user.click(purchaseTab);

    // Select product for history
    const historySelect = screen.getByDisplayValue("All Purchases");
    await user.selectOptions(historySelect, "product-1");

    await waitFor(() => {
      expect(screen.getByText("Date")).toBeInTheDocument();
      expect(screen.getByText("Quantity")).toBeInTheDocument();
      expect(screen.getByText("Cost Per Unit")).toBeInTheDocument();
      expect(screen.getByText("Total Cost")).toBeInTheDocument();
    });
  });

  it("displays purchase history data correctly", async () => {
    // Mock purchase history data
    (api.purchases.getByProduct.useQuery as jest.Mock).mockReturnValue({
      data: mockPurchaseHistory,
      refetch: mockRefetch,
      isLoading: false,
    });

    const user = userEvent.setup();
    render(<StockPage />);

    const purchaseTabs = screen.getAllByRole("button", {
      name: /Record Purchase/i,
    });
    const purchaseTab = purchaseTabs[0]; // Use the first one (tab navigation)
    await user.click(purchaseTab);

    // Select product for history
    const historySelect = screen.getByDisplayValue("All Purchases");
    await user.selectOptions(historySelect, "product-1");

    await waitFor(() => {
      // Check first purchase record
      expect(screen.getByText("5")).toBeInTheDocument(); // quantity
      expect(screen.getByText("฿70.00")).toBeInTheDocument(); // cost per unit
      expect(screen.getByText("฿350.00")).toBeInTheDocument(); // total cost (5 * 70)

      // Check second purchase record
      expect(screen.getByText("3")).toBeInTheDocument(); // quantity
      expect(screen.getByText("฿80.00")).toBeInTheDocument(); // cost per unit
      expect(screen.getByText("฿240.00")).toBeInTheDocument(); // total cost (3 * 80)
    });
  });

  it("shows loading state when creating purchase", async () => {
    (api.purchases.create.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutateFn,
      isPending: true,
    });

    const { form } = await openPurchaseForm();

    const submit = within(form).getByRole("button", {
      name: /Record Purchase/i,
    });
    expect(submit).toBeDisabled();

    // Should show loading spinner (Loader2 component)
    const loader = submit.querySelector("svg");
    expect(loader).toBeInTheDocument();
  });

  it("shows loading state when fetching purchase history", async () => {
    (api.purchases.getByProduct.useQuery as jest.Mock).mockReturnValue({
      data: [],
      refetch: mockRefetch,
      isLoading: true,
    });

    const user = userEvent.setup();
    render(<StockPage />);

    const purchaseTab = screen.getByRole("button", {
      name: /Record Purchase/i,
    });
    await user.click(purchaseTab);

    // Select product for history
    const historySelect = screen.getByDisplayValue("All Purchases");
    await user.selectOptions(historySelect, "product-1");

    await waitFor(() => {
      // Should show loading row in table
      const loadingCell = screen.getByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === "td" &&
          element?.classList.contains("text-center")
        );
      });
      expect(loadingCell).toBeInTheDocument();
    });
  });

  it("shows empty state when no purchase history exists", async () => {
    (api.purchases.getByProduct.useQuery as jest.Mock).mockReturnValue({
      data: [],
      refetch: mockRefetch,
      isLoading: false,
    });

    const user = userEvent.setup();
    render(<StockPage />);

    const purchaseTab = screen.getByRole("button", {
      name: /Record Purchase/i,
    });
    await user.click(purchaseTab);

    // Select product for history
    const historySelect = screen.getByDisplayValue("All Purchases");
    await user.selectOptions(historySelect, "product-1");

    await waitFor(() => {
      expect(
        screen.getByText("No purchase history found for this product.")
      ).toBeInTheDocument();
    });
  });

  it("quick action button navigates to purchase tab", async () => {
    const user = userEvent.setup();
    render(<StockPage />);

    // Initially on categories tab
    expect(screen.getByText("Categories")).toBeInTheDocument();

    // Click quick action button
    const quickActionButton = screen.getByRole("button", {
      name: /Record Purchase/i,
    });
    await user.click(quickActionButton);

    // Should switch to purchases tab
    expect(screen.getByText("Record Stock Purchase")).toBeInTheDocument();
  });

  it("handles form validation errors gracefully", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    const { user, form } = await openPurchaseForm();

    // Select product
    await user.click(
      within(form).getByRole("button", { name: "Toggle dropdown" })
    );
    await user.click(within(form).getByText("iPhone Screen (piece)"));

    // Fill with invalid quantity (0)
    await user.type(within(form).getByPlaceholderText("Enter quantity"), "0");
    await user.type(within(form).getByLabelText("Currency amount input"), "85");

    fireEvent.submit(form);

    expect(alertSpy).toHaveBeenCalledWith("Please enter a valid quantity");

    alertSpy.mockRestore();
  });
});
