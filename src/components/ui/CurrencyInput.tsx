"use client";

import { NumericFormat, NumericFormatProps } from "react-number-format";
import { forwardRef } from "react";
import { cn } from "~/lib/utils";

interface CurrencyInputProps extends Omit<NumericFormatProps, 'onChange' | 'value'> {
  value?: number | string;
  onChange?: (value: number | undefined) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ 
    className, 
    value, 
    onChange, 
    placeholder = "0.00",
    disabled = false,
    min,
    max,
    step = 0.01,
    ...props 
  }, ref) => {
    return (
      <NumericFormat
        getInputRef={ref}
        value={value}
        onValueChange={(values) => {
          const { floatValue } = values;
          onChange?.(floatValue);
        }}
        thousandSeparator=","
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale={true}
        allowNegative={false}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        inputMode="numeric"
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        aria-label="Currency amount input"
        role="textbox"
        aria-describedby="currency-format-help"
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
export type { CurrencyInputProps };