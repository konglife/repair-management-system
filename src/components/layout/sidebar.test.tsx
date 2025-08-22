import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe("Sidebar", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/dashboard");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders all navigation items when expanded", () => {
    render(<Sidebar />);
    
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Stock")).toBeInTheDocument();
    expect(screen.getByText("Sales")).toBeInTheDocument();
    expect(screen.getByText("Repairs")).toBeInTheDocument();
    expect(screen.getByText("Customers")).toBeInTheDocument();
  });

  it("shows full title when expanded", () => {
    render(<Sidebar />);
    
    expect(screen.getByText("Repair Shop")).toBeInTheDocument();
  });

  it("shows abbreviated title when collapsed", () => {
    render(<Sidebar isCollapsed={true} />);
    
    expect(screen.getByText("R")).toBeInTheDocument();
    expect(screen.queryByText("Repair Shop")).not.toBeInTheDocument();
  });

  it("hides navigation text when collapsed", () => {
    render(<Sidebar isCollapsed={true} />);
    
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Stock")).not.toBeInTheDocument();
    expect(screen.queryByText("Sales")).not.toBeInTheDocument();
    expect(screen.queryByText("Repairs")).not.toBeInTheDocument();
    expect(screen.queryByText("Customers")).not.toBeInTheDocument();
  });

  it("applies correct width classes", () => {
    const { rerender } = render(<Sidebar />);
    
    const sidebar = screen.getByRole("navigation").parentElement;
    expect(sidebar).toHaveClass("w-64");
    
    rerender(<Sidebar isCollapsed={true} />);
    expect(sidebar).toHaveClass("w-16");
  });

  it("shows all icons regardless of collapsed state", () => {
    const { rerender } = render(<Sidebar />);
    
    // Check that all 5 navigation icons are present when expanded
    const icons = screen.getAllByRole("link").map(link => 
      link.querySelector("svg")
    );
    expect(icons).toHaveLength(5);
    expect(icons.every(icon => icon !== null)).toBe(true);
    
    rerender(<Sidebar isCollapsed={true} />);
    
    // Check that all 5 navigation icons are still present when collapsed
    const collapsedIcons = screen.getAllByRole("link").map(link => 
      link.querySelector("svg")
    );
    expect(collapsedIcons).toHaveLength(5);
    expect(collapsedIcons.every(icon => icon !== null)).toBe(true);
  });

  it("highlights active navigation item", () => {
    mockUsePathname.mockReturnValue("/stock");
    
    render(<Sidebar />);
    
    const stockLink = screen.getByRole("link", { name: /stock/i });
    expect(stockLink).toHaveClass("bg-blue-50", "text-blue-700");
    
    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).not.toHaveClass("bg-blue-50", "text-blue-700");
  });

  it("adds tooltips when collapsed", () => {
    render(<Sidebar isCollapsed={true} />);
    
    const links = screen.getAllByRole("link");
    const stockLink = links.find(link => link.getAttribute("title") === "Stock");
    const dashboardLink = links.find(link => link.getAttribute("title") === "Dashboard");
    
    expect(stockLink).toBeInTheDocument();
    expect(dashboardLink).toBeInTheDocument();
  });

  it("does not add tooltips when expanded", () => {
    render(<Sidebar />);
    
    const links = screen.getAllByRole("link");
    links.forEach(link => {
      expect(link.getAttribute("title")).toBeNull();
    });
  });

  it("applies correct padding classes when collapsed", () => {
    render(<Sidebar isCollapsed={true} />);
    
    const links = screen.getAllByRole("link");
    links.forEach(link => {
      expect(link).toHaveClass("px-2", "justify-center");
      expect(link).not.toHaveClass("px-3");
    });
  });

  it("applies correct padding classes when expanded", () => {
    render(<Sidebar />);
    
    const links = screen.getAllByRole("link");
    links.forEach(link => {
      expect(link).toHaveClass("px-3");
      expect(link).not.toHaveClass("px-2", "justify-center");
    });
  });

  it("applies transition classes for smooth animation", () => {
    render(<Sidebar />);
    
    const sidebar = screen.getByRole("navigation").parentElement;
    expect(sidebar).toHaveClass("transition-all", "duration-300");
  });

  it("applies custom className when provided", () => {
    render(<Sidebar className="custom-class" />);
    
    const sidebar = screen.getByRole("navigation").parentElement;
    expect(sidebar).toHaveClass("custom-class");
  });

  it("defaults to expanded state when isCollapsed not provided", () => {
    render(<Sidebar />);
    
    const sidebar = screen.getByRole("navigation").parentElement;
    expect(sidebar).toHaveClass("w-64");
    expect(screen.getByText("Repair Shop")).toBeInTheDocument();
  });
});