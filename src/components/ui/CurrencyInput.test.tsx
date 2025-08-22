import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CurrencyInput } from "./CurrencyInput";

describe("CurrencyInput", () => {
  describe("Basic Rendering", () => {
    it("renders with default placeholder", () => {
      render(<CurrencyInput />);
      expect(screen.getByPlaceholderText("0.00")).toBeInTheDocument();
    });

    it("renders with custom placeholder", () => {
      render(<CurrencyInput placeholder="Enter amount" />);
      expect(screen.getByPlaceholderText("Enter amount")).toBeInTheDocument();
    });

    it("renders with initial value", () => {
      render(<CurrencyInput value={1234.56} />);
      expect(screen.getByDisplayValue("1,234.56")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(<CurrencyInput className="custom-class" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(<CurrencyInput />);
      const input = screen.getByRole("textbox");
      
      expect(input).toHaveAttribute("aria-label", "Currency amount input");
      expect(input).toHaveAttribute("role", "textbox");
      expect(input).toHaveAttribute("aria-describedby", "currency-format-help");
    });

    it("has numeric input mode for mobile keypad", () => {
      render(<CurrencyInput />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("inputMode", "numeric");
    });

    it("handles disabled state", () => {
      render(<CurrencyInput disabled />);
      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
      expect(input).toHaveClass("disabled:pointer-events-none", "disabled:cursor-not-allowed", "disabled:opacity-50");
    });
  });

  describe("Thousand Separator Formatting", () => {
    it("formats thousands with commas on input", async () => {
      const user = userEvent.setup();
      render(<CurrencyInput />);
      const input = screen.getByRole("textbox");

      await user.type(input, "1234");
      expect(input).toHaveDisplayValue("1,234.00");
    });

    it("formats large numbers correctly", async () => {
      const user = userEvent.setup();
      render(<CurrencyInput />);
      const input = screen.getByRole("textbox");

      await user.type(input, "1234567");
      expect(input).toHaveDisplayValue("1,234,567.00");
    });

    it("handles decimal input correctly", async () => {
      const user = userEvent.setup();
      render(<CurrencyInput />);
      const input = screen.getByRole("textbox");

      await user.type(input, "1234.56");
      expect(input).toHaveDisplayValue("1,234.56");
    });
  });

  describe("Value Handling", () => {
    it("calls onChange with numeric value", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<CurrencyInput onChange={onChange} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "1234.56");
      
      await waitFor(() => {
        expect(onChange).toHaveBeenLastCalledWith(1234.56);
      });
    });

    it("calls onChange with undefined for empty value", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<CurrencyInput value={100} onChange={onChange} />);
      const input = screen.getByRole("textbox");

      await user.clear(input);
      
      await waitFor(() => {
        expect(onChange).toHaveBeenLastCalledWith(undefined);
      });
    });

    it("handles controlled value prop changes", () => {
      const { rerender } = render(<CurrencyInput value={100} />);
      expect(screen.getByDisplayValue("100.00")).toBeInTheDocument();

      rerender(<CurrencyInput value={200.50} />);
      expect(screen.getByDisplayValue("200.50")).toBeInTheDocument();
    });

    it("handles string value prop", () => {
      render(<CurrencyInput value="1234.56" />);
      expect(screen.getByDisplayValue("1,234.56")).toBeInTheDocument();
    });
  });

  describe("Decimal Handling", () => {
    it("fixes decimal scale to 2 places", async () => {
      const user = userEvent.setup();
      render(<CurrencyInput />);
      const input = screen.getByRole("textbox");

      await user.type(input, "123.1");
      expect(input).toHaveDisplayValue("123.10");
    });

    it("truncates extra decimal places", async () => {
      const user = userEvent.setup();
      render(<CurrencyInput />);
      const input = screen.getByRole("textbox");

      await user.type(input, "123.456789");
      expect(input).toHaveDisplayValue("123.45");
    });
  });

  describe("Input Constraints", () => {
    it("prevents negative values by default", async () => {
      const user = userEvent.setup();
      render(<CurrencyInput />);
      const input = screen.getByRole("textbox");

      await user.type(input, "-123");
      expect(input).toHaveDisplayValue("123.00");
    });

    it("respects min and max attributes", () => {
      render(<CurrencyInput min={10} max={1000} />);
      const input = screen.getByRole("textbox");
      
      expect(input).toHaveAttribute("min", "10");
      expect(input).toHaveAttribute("max", "1000");
    });

    it("respects step attribute", () => {
      render(<CurrencyInput step={0.25} />);
      const input = screen.getByRole("textbox");
      
      expect(input).toHaveAttribute("step", "0.25");
    });
  });

  describe("Thai Baht Compatibility", () => {
    it("works with Thai Baht formatting patterns", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<CurrencyInput onChange={onChange} />);
      const input = screen.getByRole("textbox");

      // Test typical Thai Baht amounts
      await user.type(input, "50000");
      expect(input).toHaveDisplayValue("50,000.00");
      
      await waitFor(() => {
        expect(onChange).toHaveBeenLastCalledWith(50000);
      });
    });

    it("handles small denominations correctly", async () => {
      const user = userEvent.setup();
      render(<CurrencyInput />);
      const input = screen.getByRole("textbox");

      await user.type(input, "25.25");
      expect(input).toHaveDisplayValue("25.25");
    });
  });

  describe("Keyboard and Focus", () => {
    it("accepts focus", () => {
      render(<CurrencyInput />);
      const input = screen.getByRole("textbox");
      
      input.focus();
      expect(input).toHaveFocus();
    });

    it("handles keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<CurrencyInput value={1234.56} />);
      const input = screen.getByRole("textbox");

      input.focus();
      await user.keyboard("{ArrowLeft}{ArrowLeft}{Backspace}");
      
      // Should be able to edit the value
      expect(input).toHaveFocus();
    });
  });

  describe("Edge Cases", () => {
    it("handles zero value", () => {
      render(<CurrencyInput value={0} />);
      expect(screen.getByDisplayValue("0.00")).toBeInTheDocument();
    });

    it("handles undefined value", () => {
      render(<CurrencyInput value={undefined} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveDisplayValue("");
    });

    it("handles null value", () => {
      render(<CurrencyInput value={null as unknown as number} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveDisplayValue("");
    });
  });
});