import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PartsAutocomplete } from "./PartsAutocomplete";

// Mock the SearchInput component
interface MockSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

jest.mock("~/components/ui/SearchInput", () => ({
  SearchInput: ({ value, onChange, placeholder, debounceMs }: MockSearchInputProps) => (
    <input
      data-testid="search-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      data-debounce-ms={debounceMs}
    />
  ),
}));

const mockProducts = [
  {
    id: "1",
    name: "iPhone Screen",
    averageCost: 150.00,
    quantity: 5,
  },
  {
    id: "2", 
    name: "Samsung Battery",
    averageCost: 50.00,
    quantity: 10,
  },
  {
    id: "3",
    name: "Charging Cable",
    averageCost: 15.00,
    quantity: 0, // Out of stock
  },
];

describe("PartsAutocomplete", () => {
  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    mockOnValueChange.mockClear();
  });

  it("renders with placeholder text", () => {
    render(
      <PartsAutocomplete
        products={mockProducts}
        onValueChange={mockOnValueChange}
        placeholder="Search for parts..."
      />
    );

    expect(screen.getByPlaceholderText("Search for parts...")).toBeInTheDocument();
  });

  it("filters out products with zero quantity", () => {
    render(
      <PartsAutocomplete
        products={mockProducts}
        onValueChange={mockOnValueChange}
      />
    );

    // Click to open dropdown
    const chevronButton = screen.getByRole("button");
    fireEvent.click(chevronButton);

    // Should only show products with stock
    expect(screen.getByText("iPhone Screen")).toBeInTheDocument();
    expect(screen.getByText("Samsung Battery")).toBeInTheDocument();
    expect(screen.queryByText("Charging Cable")).not.toBeInTheDocument();
  });

  it("calls onValueChange when a product is selected", async () => {
    const user = userEvent.setup();
    
    render(
      <PartsAutocomplete
        products={mockProducts}
        onValueChange={mockOnValueChange}
      />
    );

    // Click to open dropdown
    const chevronButton = screen.getByRole("button");
    await user.click(chevronButton);

    // Click on first product
    const productButton = screen.getByText("iPhone Screen");
    await user.click(productButton);

    expect(mockOnValueChange).toHaveBeenCalledWith("1");
  });

  it("shows selected product details", () => {
    render(
      <PartsAutocomplete
        products={mockProducts}
        value="1"
        onValueChange={mockOnValueChange}
      />
    );

    expect(screen.getByText("iPhone Screen")).toBeInTheDocument();
    expect(screen.getByText("฿150.00 (Stock: 5)")).toBeInTheDocument();
  });

  it("filters products based on search term", async () => {
    const user = userEvent.setup();
    
    render(
      <PartsAutocomplete
        products={mockProducts}
        onValueChange={mockOnValueChange}
      />
    );

    // Type in search input
    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "iphone");

    // Should filter to show only iPhone Screen
    expect(screen.getByText("iPhone Screen")).toBeInTheDocument();
    expect(screen.queryByText("Samsung Battery")).not.toBeInTheDocument();
  });

  it("shows no results message when no products match search", async () => {
    const user = userEvent.setup();
    
    render(
      <PartsAutocomplete
        products={mockProducts}
        onValueChange={mockOnValueChange}
      />
    );

    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "nonexistent");

    expect(screen.getByText("No parts found matching your search.")).toBeInTheDocument();
  });

  it("clears selection when clear button is clicked", async () => {
    const user = userEvent.setup();
    
    render(
      <PartsAutocomplete
        products={mockProducts}
        value="1"
        onValueChange={mockOnValueChange}
      />
    );

    // Find and click the clear button (first button with X icon)
    const buttons = screen.getAllByRole("button");
    const clearButton = buttons[0]; // First button is the clear button
    await user.click(clearButton);

    expect(mockOnValueChange).toHaveBeenCalledWith("");
  });

  it("uses 300ms debounce for search input", () => {
    render(
      <PartsAutocomplete
        products={mockProducts}
        onValueChange={mockOnValueChange}
      />
    );

    const searchInput = screen.getByTestId("search-input");
    expect(searchInput).toHaveAttribute("data-debounce-ms", "300");
  });
});