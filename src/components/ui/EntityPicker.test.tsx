import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntityPicker } from "./EntityPicker";

// Mock SearchInput as a plain controlled input (no debounce) so the picker's
// filter/keyboard logic is exercised synchronously in tests.
interface MockSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

jest.mock("~/components/ui/SearchInput", () => ({
  SearchInput: ({ value, onChange, placeholder }: MockSearchInputProps) => (
    <input
      data-testid="search-input"
      aria-label="search"
      role="searchbox"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

interface Item {
  id: string;
  name: string;
}

const items: Item[] = [
  { id: "1", name: "Alpha" },
  { id: "2", name: "Beta" },
  { id: "3", name: "Gamma" },
];

const defaultProps = {
  items,
  onValueChange: jest.fn(),
  label: (item: Item) => item.name,
  filter: (list: Item[], term: string) =>
    list.filter((i) => i.name.toLowerCase().includes(term.toLowerCase())),
};

describe("EntityPicker", () => {
  const onValueChange = jest.fn();

  beforeEach(() => {
    onValueChange.mockClear();
  });

  it("shows items via label when the dropdown is opened", () => {
    render(<EntityPicker {...defaultProps} onValueChange={onValueChange} />);

    // Dropdown closed initially
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();

    // Open via chevron toggle button
    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
  });

  it("calls onValueChange with the item id when an item is clicked", () => {
    render(<EntityPicker {...defaultProps} onValueChange={onValueChange} />);

    fireEvent.click(screen.getByRole("button")); // open
    fireEvent.click(screen.getByText("Beta"));

    expect(onValueChange).toHaveBeenCalledWith("2");
  });

  it("shows the selected item via label when value is set and dropdown closed", () => {
    render(
      <EntityPicker {...defaultProps} value="2" onValueChange={onValueChange} />
    );

    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("clears selection (onValueChange('')) when the clear button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <EntityPicker {...defaultProps} value="2" onValueChange={onValueChange} />
    );

    await user.click(screen.getByRole("button", { name: /clear selection/i }));

    expect(onValueChange).toHaveBeenCalledWith("");
  });

  it("filters items as the user types", async () => {
    const user = userEvent.setup();
    render(<EntityPicker {...defaultProps} onValueChange={onValueChange} />);

    const input = screen.getByTestId("search-input");
    await user.type(input, "al");

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
    expect(screen.queryByText("Gamma")).not.toBeInTheDocument();
  });

  it("shows emptyText when no items match the search term", async () => {
    const user = userEvent.setup();
    render(
      <EntityPicker
        {...defaultProps}
        onValueChange={onValueChange}
        emptyText="Nothing here"
      />
    );

    await user.type(screen.getByTestId("search-input"), "zzz");

    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("shows emptyText when the items list is empty", () => {
    render(
      <EntityPicker
        {...defaultProps}
        items={[]}
        onValueChange={onValueChange}
        emptyText="No items"
      />
    );

    fireEvent.click(screen.getByRole("button")); // open

    expect(screen.getByText("No items")).toBeInTheDocument();
  });

  it("selects the highlighted item via ArrowDown + Enter", async () => {
    const user = userEvent.setup();
    render(<EntityPicker {...defaultProps} onValueChange={onValueChange} />);

    fireEvent.click(screen.getByRole("button")); // open
    const input = screen.getByTestId("search-input");
    input.focus();
    await user.keyboard("{ArrowDown}"); // highlight first (Alpha)
    await user.keyboard("{Enter}");

    expect(onValueChange).toHaveBeenCalledWith("1");
  });

  it("closes the dropdown when Escape is pressed", async () => {
    const user = userEvent.setup();
    render(<EntityPicker {...defaultProps} onValueChange={onValueChange} />);

    fireEvent.click(screen.getByRole("button")); // open
    expect(screen.getByText("Alpha")).toBeInTheDocument();

    screen.getByTestId("search-input").focus();
    await user.keyboard("{Escape}");

    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  });

  it("closes the dropdown when clicking outside", () => {
    render(
      <div>
        <EntityPicker {...defaultProps} onValueChange={onValueChange} />
        <div data-testid="outside">outside</div>
      </div>
    );

    fireEvent.click(screen.getByRole("button")); // open
    expect(screen.getByText("Alpha")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId("outside"));

    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  });
});
