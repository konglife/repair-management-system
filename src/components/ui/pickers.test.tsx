import { render, screen, fireEvent } from "@testing-library/react";
import { ProductPicker, CustomerPicker, type PickerProduct } from "./pickers";

const products: PickerProduct[] = [
  {
    id: "1",
    name: "iPhone 15",
    salePrice: 35000,
    averageCost: 30000,
    quantity: 10,
    unit: { name: "เครื่อง" },
  },
  {
    id: "2",
    name: "Samsung Galaxy",
    salePrice: 30000,
    averageCost: 25000,
    quantity: 5,
    unit: null,
  },
  {
    id: "3",
    name: "Out of Stock",
    salePrice: 10000,
    averageCost: 8000,
    quantity: 0,
    unit: null,
  },
];

function openDropdown() {
  // chevron toggle button (no value selected → only the chevron is rendered)
  fireEvent.click(screen.getByRole("button"));
}

describe("ProductPicker", () => {
  it("sale variant hides out-of-stock items and shows salePrice", () => {
    render(
      <ProductPicker
        products={products}
        onValueChange={jest.fn()}
        variant="sale"
      />
    );
    openDropdown();

    expect(screen.getByText("iPhone 15")).toBeInTheDocument();
    expect(screen.getByText(/฿35,000.00/)).toBeInTheDocument();
    expect(screen.queryByText("Out of Stock")).not.toBeInTheDocument();
  });

  it("part variant shows averageCost", () => {
    render(
      <ProductPicker
        products={products}
        onValueChange={jest.fn()}
        variant="part"
      />
    );
    openDropdown();

    expect(screen.getByText(/฿30,000.00/)).toBeInTheDocument(); // averageCost of iPhone
  });

  it("purchase variant shows all items (incl. out-of-stock) and appends unit name", () => {
    render(
      <ProductPicker
        products={products}
        onValueChange={jest.fn()}
        variant="purchase"
      />
    );
    openDropdown();

    expect(screen.getByText("iPhone 15 (เครื่อง)")).toBeInTheDocument();
    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
  });

  it("calls onValueChange when an item is selected", () => {
    const onValueChange = jest.fn();
    render(
      <ProductPicker
        products={products}
        onValueChange={onValueChange}
        variant="sale"
      />
    );
    openDropdown();
    fireEvent.click(screen.getByText("iPhone 15"));

    expect(onValueChange).toHaveBeenCalledWith("1");
  });
});

describe("CustomerPicker", () => {
  const customers = [
    { id: "1", name: "Somchai", phone: "0812345678" },
    { id: "2", name: "Suda", phone: null },
  ];

  it("shows name + phone in the dropdown", () => {
    render(<CustomerPicker customers={customers} onValueChange={jest.fn()} />);
    openDropdown();

    expect(screen.getByText("Somchai")).toBeInTheDocument();
    expect(screen.getByText("0812345678")).toBeInTheDocument();
    expect(screen.getByText("Suda")).toBeInTheDocument();
  });

  it("calls onValueChange when a customer is selected", () => {
    const onValueChange = jest.fn();
    render(
      <CustomerPicker customers={customers} onValueChange={onValueChange} />
    );
    openDropdown();
    fireEvent.click(screen.getByText("Suda"));

    expect(onValueChange).toHaveBeenCalledWith("2");
  });
});
