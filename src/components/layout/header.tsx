"use client";

import { Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex items-center">
        <UserButton />
      </div>
    </header>
  );
}