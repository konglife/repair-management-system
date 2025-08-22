import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Thai Baht currency
 * @param amount - The numeric amount to format
 * @returns Formatted Thai Baht string with ฿ symbol and comma separators
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "฿0.00"
  
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
