"use client";

import { Search, X } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  debounceMs?: number;
}

export function SearchInput({ 
  placeholder = "Search...", 
  value = "", 
  onChange, 
  className,
  debounceMs = 300 
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange handler using useRef
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const debouncedOnChange = useCallback(
    (searchValue: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onChange(searchValue);
      }, debounceMs);
    },
    [onChange, debounceMs]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={handleInputChange}
        className="pl-9 pr-9"
        aria-label={`Search ${placeholder.toLowerCase()}`}
        role="searchbox"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 h-7 w-7 p-0 hover:bg-gray-100"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

