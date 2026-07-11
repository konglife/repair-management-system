"use client";

import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

/**
 * DatePicker — single-date picker deep module.
 *
 * Encapsulates the Popover + Button trigger + Calendar + display format + label
 * wiring so every call site looks and behaves identically.
 *
 * Value is `Date | undefined` in and out. Display format is hard-wired to
 * `dd/MM/yyyy` (matches `formatDisplayDate`) — callers cannot override it, which
 * is what guarantees a single consistent look across pages.
 *
 * What it does NOT own (left to the caller): validation / error messages
 * (cross-field rules like start < end belong on the reports page) and range
 * mode (use two pickers).
 */
export interface DatePickerProps {
  /** Bound to <Label htmlFor> and the trigger button id (a11y wiring). */
  id: string;
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function DatePicker({
  id,
  label,
  value,
  onChange,
  placeholder = "Pick a date",
  required = false,
  disabled = false,
}: DatePickerProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-required={required}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "dd/MM/yyyy") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
