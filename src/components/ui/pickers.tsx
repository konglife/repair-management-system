"use client";

import type { ReactNode } from "react";
import { EntityPicker } from "~/components/ui/EntityPicker";
import { formatCurrency } from "~/lib/utils";

/**
 * Thin adapters over EntityPicker — the caller's domain knowledge
 * (which price field, whether to hide out-of-stock, how to label)
 * lives here. EntityPicker itself stays generic. See
 * docs/c1-entitypicker-design.md.
 */

// ---- Product / Part picker -------------------------------------------------

export interface PickerProduct {
  id: string;
  name: string;
  salePrice: number;
  averageCost?: number;
  quantity: number;
  unit?: { name: string } | null;
}

type ProductVariant = "sale" | "part" | "purchase";

interface ProductPickerProps {
  products: PickerProduct[];
  value?: string;
  onValueChange: (id: string) => void;
  /**
   * sale    — sales line items: hide out-of-stock, show salePrice
   * part    — parts used in a repair: hide out-of-stock, show averageCost
   * purchase — recording a purchase: show everything, show salePrice, append unit
   */
  variant?: ProductVariant;
  placeholder?: string;
  className?: string;
}

export function ProductPicker({
  products,
  value,
  onValueChange,
  variant = "sale",
  placeholder,
  className,
}: ProductPickerProps) {
  const showOutOfStock = variant === "purchase";
  const priceField = variant === "part" ? "averageCost" : "salePrice";

  const label = (p: PickerProduct): ReactNode => {
    const name =
      variant === "purchase" && p.unit?.name
        ? `${p.name} (${p.unit.name})`
        : p.name;
    const price = (p[priceField] ?? 0) as number;
    return (
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-muted-foreground">
          {formatCurrency(price)} • Stock: {p.quantity}
        </div>
      </div>
    );
  };

  const filter = (list: PickerProduct[], term: string): PickerProduct[] => {
    const available = showOutOfStock
      ? list
      : list.filter((p) => p.quantity > 0);
    const t = term.toLowerCase().trim();
    if (!t) return available;
    return available.filter((p) => p.name.toLowerCase().includes(t));
  };

  return (
    <EntityPicker
      items={products}
      value={value}
      onValueChange={onValueChange}
      label={label}
      filter={filter}
      placeholder={placeholder ?? "Search for a product..."}
      emptyText={
        showOutOfStock
          ? "No products available."
          : "No products with stock available."
      }
      className={className}
    />
  );
}

// ---- Customer picker -------------------------------------------------------

export interface PickerCustomer {
  id: string;
  name: string;
  phone?: string | null;
}

interface CustomerPickerProps {
  customers: PickerCustomer[];
  value?: string;
  onValueChange: (id: string) => void;
  placeholder?: string;
  className?: string;
}

export function CustomerPicker({
  customers,
  value,
  onValueChange,
  placeholder,
  className,
}: CustomerPickerProps) {
  const label = (c: PickerCustomer): ReactNode => (
    <div>
      <div className="font-medium">{c.name}</div>
      {c.phone && (
        <div className="text-sm text-muted-foreground">{c.phone}</div>
      )}
    </div>
  );

  const filter = (list: PickerCustomer[], term: string): PickerCustomer[] => {
    const t = term.toLowerCase().trim();
    if (!t) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(t) ||
        (c.phone ?? "").toLowerCase().includes(t)
    );
  };

  return (
    <EntityPicker
      items={customers}
      value={value}
      onValueChange={onValueChange}
      label={label}
      filter={filter}
      placeholder={placeholder ?? "Search for a customer..."}
      emptyText="No customers found."
      className={className}
    />
  );
}
