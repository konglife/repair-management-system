import { render, screen, fireEvent } from "@testing-library/react";
import { SidebarToggle } from "./sidebar-toggle";

describe("SidebarToggle", () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it("renders the toggle button", () => {
    render(<SidebarToggle isCollapsed={false} onClick={mockOnClick} />);
    
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "Collapse sidebar");
  });

  it("shows correct aria-label when collapsed", () => {
    render(<SidebarToggle isCollapsed={true} onClick={mockOnClick} />);
    
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Expand sidebar");
  });

  it("shows correct aria-label when expanded", () => {
    render(<SidebarToggle isCollapsed={false} onClick={mockOnClick} />);
    
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Collapse sidebar");
  });

  it("calls onClick when clicked", () => {
    render(<SidebarToggle isCollapsed={false} onClick={mockOnClick} />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("applies rotation class when collapsed", () => {
    render(<SidebarToggle isCollapsed={true} onClick={mockOnClick} />);
    
    const icon = screen.getByRole("button").querySelector("svg");
    expect(icon).toHaveClass("rotate-90");
  });

  it("does not apply rotation class when expanded", () => {
    render(<SidebarToggle isCollapsed={false} onClick={mockOnClick} />);
    
    const icon = screen.getByRole("button").querySelector("svg");
    expect(icon).not.toHaveClass("rotate-90");
  });

  it("applies custom className", () => {
    render(
      <SidebarToggle 
        isCollapsed={false} 
        onClick={mockOnClick} 
        className="custom-class"
      />
    );
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("has proper hover and transition classes", () => {
    render(<SidebarToggle isCollapsed={false} onClick={mockOnClick} />);
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("hover:bg-gray-100");
    expect(button).toHaveClass("transition-colors");
  });
});