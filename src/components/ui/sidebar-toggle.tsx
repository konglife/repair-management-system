"use client";

import { Menu } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface SidebarToggleProps {
  isCollapsed: boolean;
  onClick: () => void;
  className?: string;
}

export function SidebarToggle({ isCollapsed, onClick, className }: SidebarToggleProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-9 w-9 p-0 transition-colors hover:bg-gray-100",
        className
      )}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <Menu 
        className={cn(
          "h-5 w-5 transition-transform",
          isCollapsed && "rotate-90"
        )} 
      />
    </Button>
  );
}