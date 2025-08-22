"use client";

import { useState, useEffect } from "react";

const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

export function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored !== null) {
        setIsCollapsed(JSON.parse(stored));
      }
    } catch (error) {
      // Handle localStorage unavailable or parsing errors
      console.warn("Failed to load sidebar state from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(isCollapsed));
      } catch (error) {
        // Handle localStorage unavailable errors
        console.warn("Failed to save sidebar state to localStorage:", error);
      }
    }
  }, [isCollapsed, isLoaded]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return {
    isCollapsed,
    isLoaded,
    toggleSidebar,
    setIsCollapsed,
  };
}