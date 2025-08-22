"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { SidebarToggle } from "~/components/ui/sidebar-toggle";
import { useSidebarState } from "~/hooks/use-sidebar-state";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isCollapsed, isLoaded, toggleSidebar } = useSidebarState();

  // Show a minimal loading state while localStorage is being read
  if (!isLoaded) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="hidden md:flex md:w-64 md:flex-col bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-6 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <div className="h-16 bg-white border-b border-gray-200"></div>
          <main className="flex-1 p-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex md:flex-col transition-all duration-300 ${
        isCollapsed ? "md:w-16" : "md:w-64"
      }`}>
        <div className="relative h-full">
          <Sidebar isCollapsed={isCollapsed} />
          {/* Desktop Toggle Button */}
          <div className="absolute top-4 -right-3 z-10">
            <SidebarToggle
              isCollapsed={isCollapsed}
              onClick={toggleSidebar}
              className="bg-white border border-gray-200 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate to different sections of the repair management system
          </SheetDescription>
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}