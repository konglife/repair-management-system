import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Thai Baht currency
 * @param amount - The numeric amount to format
 * @returns Formatted Thai Baht string with ฿ symbol and comma separators
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "฿0.00";

  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Test whether a monetary amount matches a search term.
 * Matches both the raw number (e.g. "1500") and the formatted currency
 * (e.g. "฿1,500.00"), so users can search an amount column by either form.
 * @param amount - The numeric amount to match against
 * @param term - The search term, already lowercased by the caller
 * @returns true if the term appears in the number or its formatted form
 */
export function matchesAmount(amount: number, term: string): boolean {
  return (
    amount.toString().includes(term) ||
    formatCurrency(amount).toLowerCase().includes(term)
  );
}

/**
 * Format a date consistently across the application
 * Uses DD/MM/YYYY format (Thai standard) with Gregorian calendar
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string in DD/MM/YYYY format
 */
export function formatDate(date: string | Date | number): string {
  if (!date) return "";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  return dateObj.toLocaleDateString("en-GB"); // DD/MM/YYYY format
}

/**
 * Format a date for display in tables and lists
 * Uses DD/MM/YYYY format consistently
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string
 */
export function formatDisplayDate(date: string | Date | number): string {
  return formatDate(date);
}

/**
 * Format a date for reports (same as display date for consistency)
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string in DD/MM/YYYY format
 */
export function formatReportDate(date: string | Date | number): string {
  return formatDate(date);
}

/**
 * Extract date string from Date object without timezone conversion
 * Returns YYYY-MM-DD format using local date components
 * @param date - Date object
 * @returns Date string in YYYY-MM-DD format (local date, no timezone conversion)
 */
export function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
