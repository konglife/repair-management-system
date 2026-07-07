"use client";

import { useState, useMemo, useRef, useEffect, type ReactNode } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { SearchInput } from "~/components/ui/SearchInput";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "~/lib/utils";

export interface EntityPickerProps<T extends { id: string }> {
  items: T[];
  value?: string;
  onValueChange: (id: string) => void;
  label: (item: T) => ReactNode;
  filter: (items: T[], term: string) => T[];
  placeholder?: string;
  emptyText?: string;
  className?: string;
}

export function EntityPicker<T extends { id: string }>({
  items,
  value,
  onValueChange,
  label,
  filter,
  placeholder = "Search...",
  emptyText = "No results found.",
  className,
}: EntityPickerProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlight, setHighlight] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => filter(items, searchTerm),
    [items, searchTerm, filter]
  );

  const selectedItem = items.find((i) => i.id === value);

  const select = (id: string) => {
    onValueChange(id);
    setIsOpen(false);
    setSearchTerm("");
    setHighlight(-1);
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (event.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
      setHighlight(-1);
      return;
    }
    if (filtered.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((h) => (h + 1) % filtered.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((h) => (h - 1 + filtered.length) % filtered.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const idx = highlight >= 0 ? highlight : 0;
      const item = filtered[idx];
      if (item) select(item.id);
    }
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={cn("relative", className)}
    >
      {selectedItem && !isOpen ? (
        <div className="flex items-center justify-between p-2 border rounded-md bg-background">
          <div className="flex-1">{label(selectedItem)}</div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onValueChange("");
                setSearchTerm("");
                setHighlight(-1);
              }}
              className="h-6 w-6 p-0"
              aria-label="Clear selection"
            >
              <X className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="h-6 w-6 p-0"
              aria-label="Toggle dropdown"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <SearchInput
            placeholder={placeholder}
            value={searchTerm}
            onChange={(v) => {
              setSearchTerm(v);
              setHighlight(-1);
              setIsOpen(true);
            }}
            debounceMs={300}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-1 top-1 h-7 w-7 p-0"
            aria-label="Toggle dropdown"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      )}

      {isOpen && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-auto">
          <CardContent className="p-0">
            {filtered.length > 0 ? (
              <div className="py-1">
                {filtered.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => select(item.id)}
                    className={cn(
                      "w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors flex items-center justify-between",
                      value === item.id && "bg-accent text-accent-foreground",
                      highlight === index && "bg-accent text-accent-foreground"
                    )}
                  >
                    <div className="flex-1">{label(item)}</div>
                    {value === item.id && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {emptyText}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
