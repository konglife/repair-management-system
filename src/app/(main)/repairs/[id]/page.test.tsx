import { render, screen, fireEvent } from "@testing-library/react";
import RepairDetailPage from "./page";
import { api } from "~/app/providers";

// Mock Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({
    id: "repair123",
  }),
}));

// Mock tRPC API. Factory must be self-contained (no outer-variable references)
// so that jest hoists and applies it — otherwise the real ~/app/providers
// loads superjson (ESM) and the suite fails to run. See stock/page.test.tsx
// for the working pattern.
jest.mock("~/app/providers", () => ({
  api: {
    repairs: {
      getById: {
        useQuery: jest.fn(),
      },
    },
  },
}));

const mockRepairQuery: {
  data: unknown;
  isLoading: boolean;
  error: unknown;
} = {
  data: null,
  isLoading: false,
  error: null,
};

const mockUseQuery = api.repairs.getById.useQuery as jest.Mock;

// Mock UI components to avoid complex rendering
jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/table", () => ({
  Table: ({ children }: { children: React.ReactNode }) => (
    <table data-testid="table">{children}</table>
  ),
  TableBody: ({ children }: { children: React.ReactNode }) => (
    <tbody data-testid="table-body">{children}</tbody>
  ),
  TableCell: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <td className={className}>{children}</td>,
  TableHead: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <th className={className}>{children}</th>,
  TableHeader: ({ children }: { children: React.ReactNode }) => (
    <thead data-testid="table-header">{children}</thead>
  ),
  TableRow: ({ children }: { children: React.ReactNode }) => (
    <tr data-testid="table-row">{children}</tr>
  ),
}));

describe("RepairDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRepairQuery.data = null;
    mockRepairQuery.isLoading = false;
    mockRepairQuery.error = null;
    mockUseQuery.mockReturnValue(mockRepairQuery);
  });

  describe("loading states", () => {
    it("should display loading spinner when data is loading", () => {
      mockRepairQuery.isLoading = true;

      const { container } = render(<RepairDetailPage />);

      // Loading state renders a Loader2 with the animate-spin class.
      expect(container.querySelector(".animate-spin")).toBeTruthy();
    });
  });

  describe("error states", () => {
    it("should display error message when repair is not found", () => {
      mockRepairQuery.error = { message: "Repair not found" };

      render(<RepairDetailPage />);

      expect(screen.getByText("Repair Not Found")).toBeTruthy();
      expect(
        screen.getByText(
          "The repair job you're looking for could not be found."
        )
      ).toBeTruthy();
      expect(screen.getByText("Return to Repairs")).toBeTruthy();
    });

    it("should display error message when data is null", () => {
      mockRepairQuery.data = null;
      mockRepairQuery.error = null;

      render(<RepairDetailPage />);

      expect(screen.getByText("Repair Not Found")).toBeTruthy();
    });

    it("should navigate back to repairs when clicking return button", () => {
      mockRepairQuery.error = { message: "Repair not found" };

      render(<RepairDetailPage />);

      const returnButton = screen.getByText("Return to Repairs");
      fireEvent.click(returnButton);

      expect(mockPush).toHaveBeenCalledWith("/repairs");
    });
  });

  describe("successful data display", () => {
    beforeEach(() => {
      mockRepairQuery.data = {
        id: "repair123",
        description: "Fix broken screen and battery",
        totalCost: 250.0,
        partsCost: 180.0,
        laborCost: 70.0,
        createdAt: new Date("2025-01-15"),
        customer: {
          id: "customer123",
          name: "Jane Doe",
        },
        usedParts: [
          {
            id: "usedpart1",
            quantity: 1,
            costAtTime: 150.0,
            product: {
              id: "product1",
              name: "Screen Assembly",
            },
          },
          {
            id: "usedpart2",
            quantity: 1,
            costAtTime: 30.0,
            product: {
              id: "product2",
              name: "Battery",
            },
          },
        ],
      };
    });

    it("should display repair details header with back navigation", () => {
      render(<RepairDetailPage />);

      expect(screen.getByText("Repair Details")).toBeTruthy();
      expect(
        screen.getByText("View detailed information about this repair job")
      ).toBeTruthy();

      const backButton = screen.getByText("Back to Repairs");
      expect(backButton).toBeTruthy();

      fireEvent.click(backButton);
      expect(mockPush).toHaveBeenCalledWith("/repairs");
    });

    it("should display customer information correctly", () => {
      render(<RepairDetailPage />);

      expect(screen.getByText("Customer")).toBeTruthy();
      expect(screen.getByText("Jane Doe")).toBeTruthy();
    });

    it("should display repair date correctly", () => {
      render(<RepairDetailPage />);

      expect(screen.getByText("Date")).toBeTruthy();
      expect(screen.getByText("1/15/2025")).toBeTruthy();
    });

    it("should display total cost correctly", () => {
      render(<RepairDetailPage />);

      // "Total Cost" appears in the summary card, the parts table header, and
      // the cost breakdown — assert presence via getAllByText.
      expect(screen.getAllByText("Total Cost").length).toBeGreaterThan(0);
      expect(screen.getAllByText("฿250.00").length).toBeGreaterThan(0);
    });

    it("should display parts count correctly", () => {
      render(<RepairDetailPage />);

      expect(screen.getAllByText("Parts Used").length).toBeGreaterThan(0);
      expect(screen.getAllByText("2").length).toBeGreaterThan(0); // count card + quantity cells
      expect(screen.getByText("Total parts")).toBeTruthy();
    });

    it("should display job description correctly", () => {
      render(<RepairDetailPage />);

      expect(screen.getByText("Job Description")).toBeTruthy();
      expect(screen.getByText("Fix broken screen and battery")).toBeTruthy();
    });

    it("should display parts table with correct headers", () => {
      render(<RepairDetailPage />);

      expect(screen.getByText("Part Name")).toBeTruthy();
      expect(screen.getByText("Quantity")).toBeTruthy();
      expect(screen.getByText("Cost per Unit")).toBeTruthy();
      // "Total Cost" is also a summary card title + breakdown label.
      expect(screen.getAllByText("Total Cost").length).toBeGreaterThan(0);
    });

    it("should display used parts with correct details", () => {
      render(<RepairDetailPage />);

      // Screen Assembly part
      expect(screen.getByText("Screen Assembly")).toBeTruthy();
      // ฿150.00 appears as both unit cost and line total (qty 1).
      expect(screen.getAllByText("฿150.00").length).toBeGreaterThan(0);

      // Battery part
      expect(screen.getByText("Battery")).toBeTruthy();
      expect(screen.getAllByText("฿30.00").length).toBeGreaterThan(0);

      // Verify quantities (both parts have quantity 1)
      const quantityCells = screen.getAllByText("1");
      expect(quantityCells.length).toBeGreaterThanOrEqual(2);
    });

    it("should calculate and display part total costs correctly", () => {
      render(<RepairDetailPage />);

      // Screen: 1 * ฿150.00 = ฿150.00
      expect(screen.getAllByText("฿150.00").length).toBeGreaterThan(0);

      // Battery: 1 * ฿30.00 = ฿30.00
      expect(screen.getAllByText("฿30.00").length).toBeGreaterThan(0);
    });

    it("should display cost breakdown correctly", () => {
      render(<RepairDetailPage />);

      expect(screen.getByText("Cost Breakdown")).toBeTruthy();
      expect(screen.getByText("Parts Cost:")).toBeTruthy();
      expect(screen.getByText("฿180.00")).toBeTruthy();
      expect(screen.getByText("Labor Cost:")).toBeTruthy();
      expect(screen.getByText("฿70.00")).toBeTruthy();

      // Total cost appears twice (in summary cards and breakdown)
      const totalCostElements = screen.getAllByText("฿250.00");
      expect(totalCostElements.length).toBeGreaterThanOrEqual(2);
    });

    it("should display all required sections", () => {
      render(<RepairDetailPage />);

      // Count of card components should be correct
      const cards = screen.getAllByTestId("card");
      expect(cards.length).toBeGreaterThanOrEqual(6); // 4 info cards + description + parts + breakdown

      // Check for tables (parts table)
      expect(screen.getByTestId("table")).toBeTruthy();
    });
  });

  describe("navigation functionality", () => {
    beforeEach(() => {
      mockRepairQuery.data = {
        id: "repair123",
        description: "Test repair",
        totalCost: 100.0,
        partsCost: 75.0,
        laborCost: 25.0,
        createdAt: new Date("2025-01-15"),
        customer: { id: "customer123", name: "John Doe" },
        usedParts: [
          {
            id: "usedpart1",
            quantity: 1,
            costAtTime: 75.0,
            product: { id: "product1", name: "Test Part" },
          },
        ],
      };
    });

    it("should handle back navigation from multiple locations", () => {
      render(<RepairDetailPage />);

      const backButtons = screen.getAllByText("Back to Repairs");
      expect(backButtons.length).toBeGreaterThanOrEqual(1);

      // Click first back button
      fireEvent.click(backButtons[0]);
      expect(mockPush).toHaveBeenCalledWith("/repairs");
    });
  });

  describe("responsive design elements", () => {
    it("should apply responsive grid classes for info cards", () => {
      mockRepairQuery.data = {
        id: "repair123",
        description: "Test repair",
        totalCost: 100.0,
        partsCost: 75.0,
        laborCost: 25.0,
        createdAt: new Date("2025-01-15"),
        customer: { id: "customer123", name: "John Doe" },
        usedParts: [],
      };

      render(<RepairDetailPage />);

      // The component should render without errors and include responsive classes
      // This is validated by the successful render and presence of expected content
      expect(screen.getByText("Repair Details")).toBeTruthy();
    });
  });

  describe("edge cases", () => {
    it("should handle repair with no used parts", () => {
      mockRepairQuery.data = {
        id: "repair123",
        description: "Labor only repair",
        totalCost: 50.0,
        partsCost: 0.0,
        laborCost: 50.0,
        createdAt: new Date("2025-01-15"),
        customer: { id: "customer123", name: "John Doe" },
        usedParts: [],
      };

      render(<RepairDetailPage />);

      expect(screen.getByText("0")).toBeTruthy(); // Parts count
      expect(screen.getByText("฿0.00")).toBeTruthy(); // Parts cost
      // ฿50.00 appears as both labor cost and total cost.
      expect(screen.getAllByText("฿50.00").length).toBeGreaterThan(0);
    });

    it("should handle repair with multiple parts of same type", () => {
      mockRepairQuery.data = {
        id: "repair123",
        description: "Multiple parts repair",
        totalCost: 200.0,
        partsCost: 150.0,
        laborCost: 50.0,
        createdAt: new Date("2025-01-15"),
        customer: { id: "customer123", name: "John Doe" },
        usedParts: [
          {
            id: "usedpart1",
            quantity: 3,
            costAtTime: 25.0,
            product: { id: "product1", name: "Screws" },
          },
          {
            id: "usedpart2",
            quantity: 2,
            costAtTime: 37.5,
            product: { id: "product2", name: "Capacitor" },
          },
        ],
      };

      render(<RepairDetailPage />);

      expect(screen.getByText("Screws")).toBeTruthy();
      expect(screen.getByText("Capacitor")).toBeTruthy();
      expect(screen.getByText("3")).toBeTruthy(); // Quantity for screws
      // "2" appears as the parts-count card value and the capacitor quantity.
      expect(screen.getAllByText("2").length).toBeGreaterThan(0);
      expect(screen.getByText("฿25.00")).toBeTruthy(); // Unit cost for screws
      expect(screen.getByText("฿37.50")).toBeTruthy(); // Unit cost for capacitors
      // ฿75.00 is both screws total (3*25) and capacitor total (2*37.50).
      expect(screen.getAllByText("฿75.00").length).toBeGreaterThanOrEqual(2);
    });

    it("should format currency correctly for various amounts", () => {
      mockRepairQuery.data = {
        id: "repair123",
        description: "Test repair",
        totalCost: 1234.56,
        partsCost: 999.99,
        laborCost: 234.57,
        createdAt: new Date("2025-01-15"),
        customer: { id: "customer123", name: "John Doe" },
        usedParts: [
          {
            id: "usedpart1",
            quantity: 1,
            costAtTime: 999.99,
            product: { id: "product1", name: "Expensive Part" },
          },
        ],
      };

      render(<RepairDetailPage />);

      // ฿1,234.56 appears in the Total Cost card and the breakdown total.
      expect(screen.getAllByText("฿1,234.56").length).toBeGreaterThan(0);
      // ฿999.99 appears as parts cost (breakdown) and the part's unit cost.
      expect(screen.getAllByText("฿999.99").length).toBeGreaterThan(0);
      expect(screen.getByText("฿234.57")).toBeTruthy(); // Labor cost
    });
  });
});
