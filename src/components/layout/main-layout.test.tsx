import { render, screen, fireEvent } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { MainLayout } from "./main-layout";
import { useSidebarState } from "~/hooks/use-sidebar-state";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock the sidebar state hook
jest.mock("~/hooks/use-sidebar-state", () => ({
  useSidebarState: jest.fn(),
}));

// Mock Clerk UserButton component
jest.mock("@clerk/nextjs", () => ({
  UserButton: () => <div data-testid="user-button">User Button</div>,
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseSidebarState = useSidebarState as jest.MockedFunction<typeof useSidebarState>;

describe("MainLayout", () => {
  const mockToggleSidebar = jest.fn();
  
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/dashboard");
    mockUseSidebarState.mockReturnValue({
      isCollapsed: false,
      isLoaded: true,
      toggleSidebar: mockToggleSidebar,
    });
    mockToggleSidebar.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders children content", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("shows loading state when sidebar state is not loaded", () => {
    mockUseSidebarState.mockReturnValue({
      isCollapsed: false,
      isLoaded: false,
      toggleSidebar: mockToggleSidebar,
    });
    
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    
    // Should show loading skeleton and not the actual content
    expect(screen.queryByText("Test Content")).not.toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveClass("p-6");
  });

  it("renders sidebar toggle button on desktop", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    
    // There should be toggle buttons (one for desktop sidebar)
    const toggleButtons = screen.getAllByRole("button", { 
      name: /collapse sidebar|expand sidebar/i 
    });
    expect(toggleButtons.length).toBeGreaterThan(0);
  });

  it("calls toggleSidebar when desktop toggle is clicked", async () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    
    const toggleButton = screen.getByRole("button", { 
      name: /collapse sidebar/i 
    });
    
    fireEvent.click(toggleButton);
    
    expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it("renders mobile menu button", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    
    // Should have mobile menu button in header
    const mobileMenuButtons = screen.getAllByRole("button");
    const mobileMenuButton = mobileMenuButtons.find(button => 
      button.querySelector("svg") && 
      !button.getAttribute("aria-label")?.includes("sidebar")
    );
    
    expect(mobileMenuButton).toBeInTheDocument();
  });

  it("applies correct width classes based on sidebar state", () => {
    const { rerender } = render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    
    // Check expanded state
    const sidebarContainer = document.querySelector(".md\\:w-64");
    expect(sidebarContainer).toBeInTheDocument();
    
    // Test collapsed state
    mockUseSidebarState.mockReturnValue({
      isCollapsed: true,
      isLoaded: true,
      toggleSidebar: mockToggleSidebar,
    });
    
    rerender(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    
    const collapsedSidebarContainer = document.querySelector(".md\\:w-16");
    expect(collapsedSidebarContainer).toBeInTheDocument();
  });

  it("renders UserButton in header", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    
    expect(screen.getByTestId("user-button")).toBeInTheDocument();
  });

  it("renders main content area with correct styling", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    
    const mainElement = screen.getByRole("main");
    expect(mainElement).toHaveClass("flex-1", "overflow-auto", "p-6");
  });

  it("has proper responsive classes for desktop sidebar", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    
    const desktopSidebar = document.querySelector(".hidden.md\\:flex");
    expect(desktopSidebar).toBeInTheDocument();
    expect(desktopSidebar).toHaveClass("md:flex-col");
  });

  it("includes transition classes for smooth animation", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    
    const sidebarContainer = document.querySelector(".transition-all.duration-300");
    expect(sidebarContainer).toBeInTheDocument();
  });

  it("positions toggle button correctly", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    
    const toggleButtonContainer = document.querySelector(".absolute.top-4.-right-3.z-10");
    expect(toggleButtonContainer).toBeInTheDocument();
  });

  it("applies correct styling to toggle button", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    
    const toggleButton = screen.getByRole("button", { 
      name: /collapse sidebar/i 
    });
    
    expect(toggleButton).toHaveClass("bg-white", "border", "border-gray-200", "shadow-sm");
  });

  it("sidebar wrapper has full height class for proper screen spanning", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    
    const sidebarWrapper = document.querySelector(".relative.h-full");
    expect(sidebarWrapper).toBeInTheDocument();
  });

  it("main container uses h-screen for full viewport height", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    
    const mainContainer = document.querySelector(".flex.h-screen");
    expect(mainContainer).toBeInTheDocument();
  });
});