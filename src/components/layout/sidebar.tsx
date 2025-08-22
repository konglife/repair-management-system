"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Wrench,
  Users,
} from "lucide-react";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Stock",
    href: "/stock",
    icon: Boxes,
  },
  {
    name: "Sales",
    href: "/sales",
    icon: ShoppingCart,
  },
  {
    name: "Repairs",
    href: "/repairs",
    icon: Wrench,
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users,
  },
];

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
}

export function Sidebar({ className, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn(
      "flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="flex h-16 items-center border-b border-gray-200">
        {isCollapsed ? (
          <div className="flex w-full justify-center">
            <h1 className="text-xl font-semibold text-gray-900">R</h1>
          </div>
        ) : (
          <div className="px-6">
            <h1 className="text-xl font-semibold text-gray-900">Repair Shop</h1>
          </div>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md py-2 text-sm font-medium transition-colors",
                isCollapsed ? "px-2 justify-center" : "px-3",
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isCollapsed ? "mr-0" : "mr-3",
                  isActive ? "text-blue-700" : "text-gray-500 group-hover:text-gray-900"
                )}
              />
              {!isCollapsed && item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}