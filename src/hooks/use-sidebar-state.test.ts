import { renderHook, act } from "@testing-library/react";
import { useSidebarState } from "./use-sidebar-state";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Define localStorage as a property on global
Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("useSidebarState", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    
    // Mock console.warn to avoid noise in tests
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("initializes with default state when no localStorage value", () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useSidebarState());
    
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.isLoaded).toBe(true);
    expect(localStorageMock.getItem).toHaveBeenCalledWith("sidebar-collapsed");
  });

  it("loads saved state from localStorage", () => {
    localStorageMock.getItem.mockReturnValue("true");
    
    const { result } = renderHook(() => useSidebarState());
    
    expect(result.current.isCollapsed).toBe(true);
    expect(result.current.isLoaded).toBe(true);
  });

  it("handles invalid JSON in localStorage gracefully", () => {
    localStorageMock.getItem.mockReturnValue("invalid-json");
    
    const { result } = renderHook(() => useSidebarState());
    
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.isLoaded).toBe(true);
    expect(console.warn).toHaveBeenCalledWith(
      "Failed to load sidebar state from localStorage:",
      expect.any(Error)
    );
  });

  it("handles localStorage getItem throwing error", () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error("localStorage not available");
    });
    
    const { result } = renderHook(() => useSidebarState());
    
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.isLoaded).toBe(true);
    expect(console.warn).toHaveBeenCalledWith(
      "Failed to load sidebar state from localStorage:",
      expect.any(Error)
    );
  });

  it("toggles sidebar state", () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useSidebarState());
    
    expect(result.current.isCollapsed).toBe(false);
    
    act(() => {
      result.current.toggleSidebar();
    });
    
    expect(result.current.isCollapsed).toBe(true);
    
    act(() => {
      result.current.toggleSidebar();
    });
    
    expect(result.current.isCollapsed).toBe(false);
  });

  it("saves state to localStorage when toggled", () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useSidebarState());
    
    act(() => {
      result.current.toggleSidebar();
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "sidebar-collapsed",
      "true"
    );
  });

  it("sets collapsed state directly", () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useSidebarState());
    
    act(() => {
      result.current.setIsCollapsed(true);
    });
    
    expect(result.current.isCollapsed).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "sidebar-collapsed",
      "true"
    );
  });

  it("handles localStorage setItem throwing error", () => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error("localStorage quota exceeded");
    });
    
    const { result } = renderHook(() => useSidebarState());
    
    act(() => {
      result.current.toggleSidebar();
    });
    
    expect(result.current.isCollapsed).toBe(true);
    expect(console.warn).toHaveBeenCalledWith(
      "Failed to save sidebar state to localStorage:",
      expect.any(Error)
    );
  });

  it("does not save to localStorage during initial load", () => {
    // This test verifies that setItem is only called after state changes, not during load
    localStorageMock.getItem.mockReturnValue("false");
    
    const { result } = renderHook(() => useSidebarState());
    
    // Wait for initial load to complete
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.isCollapsed).toBe(false);
    
    // getItem should be called during initialization
    expect(localStorageMock.getItem).toHaveBeenCalledWith("sidebar-collapsed");
    
    // setItem should be called once after load completes to save the loaded state
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
    expect(localStorageMock.setItem).toHaveBeenCalledWith("sidebar-collapsed", "false");
  });
});