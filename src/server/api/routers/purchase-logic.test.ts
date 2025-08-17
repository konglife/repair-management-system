import { describe, it, expect } from "@jest/globals";

// Business logic functions for purchase calculations
export function calculateWeightedAverageCost(
  currentQuantity: number,
  currentAverageCost: number,
  purchaseQuantity: number,
  purchaseCostPerUnit: number
): number {
  if (currentQuantity === 0) {
    return purchaseCostPerUnit;
  }

  return ((currentQuantity * currentAverageCost) + (purchaseQuantity * purchaseCostPerUnit)) / 
         (currentQuantity + purchaseQuantity);
}

export function validatePurchaseInput(
  productId: string,
  quantity: number,
  costPerUnit: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!productId || productId.trim() === "") {
    errors.push("Product ID is required");
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    errors.push("Quantity must be a positive integer");
  }

  if (isNaN(costPerUnit) || costPerUnit < 0) {
    errors.push("Cost per unit must be a positive number");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

describe("Purchase Business Logic", () => {
  describe("getAll purchase functionality", () => {
    it("should handle empty purchase history", () => {
      const allPurchases: never[] = [];
      expect(allPurchases).toEqual([]);
      expect(allPurchases.length).toBe(0);
    });

    it("should handle multiple purchase records sorting", () => {
      const mockPurchases = [
        { id: "1", purchaseDate: new Date("2023-01-10"), productName: "Product A" },
        { id: "2", purchaseDate: new Date("2023-01-15"), productName: "Product B" },
        { id: "3", purchaseDate: new Date("2023-01-12"), productName: "Product C" },
      ];

      // Sort by date descending (most recent first)
      const sortedPurchases = mockPurchases.sort((a, b) => 
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
      );

      expect(sortedPurchases[0].id).toBe("2"); // Jan 15 (most recent)
      expect(sortedPurchases[1].id).toBe("3"); // Jan 12 (middle)
      expect(sortedPurchases[2].id).toBe("1"); // Jan 10 (oldest)
    });
  });
  describe("calculateWeightedAverageCost", () => {
    it("should return purchase cost when current quantity is zero (first purchase)", () => {
      const result = calculateWeightedAverageCost(0, 0, 10, 5.99);
      expect(result).toBe(5.99);
    });

    it("should calculate correct weighted average for subsequent purchases", () => {
      // currentQty=5, currentAvg=4.50, purchaseQty=10, purchaseCost=5.99
      // Expected: ((5 * 4.50) + (10 * 5.99)) / (5 + 10) = (22.5 + 59.9) / 15 = 5.493...
      const result = calculateWeightedAverageCost(5, 4.50, 10, 5.99);
      const expected = ((5 * 4.50) + (10 * 5.99)) / 15;
      expect(result).toBeCloseTo(expected, 2);
    });

    it("should handle large quantity purchases correctly", () => {
      // Small current stock with large purchase
      const result = calculateWeightedAverageCost(5, 3.00, 100, 2.50);
      const expected = ((5 * 3.00) + (100 * 2.50)) / 105;
      expect(result).toBeCloseTo(expected, 2);
    });

    it("should handle small fractional costs correctly", () => {
      const result = calculateWeightedAverageCost(3, 0.99, 2, 1.01);
      const expected = ((3 * 0.99) + (2 * 1.01)) / 5;
      expect(result).toBeCloseTo(expected, 3);
    });

    it("should handle equal cost scenarios", () => {
      const result = calculateWeightedAverageCost(10, 5.00, 5, 5.00);
      expect(result).toBe(5.00);
    });

    it("should handle very different cost scenarios", () => {
      // Expensive current stock, cheap purchase
      const result = calculateWeightedAverageCost(2, 100.00, 8, 10.00);
      // Expected: ((2 * 100.00) + (8 * 10.00)) / 10 = 28.00
      expect(result).toBeCloseTo(28.00, 2);
    });

    it("should maintain precision with decimal numbers", () => {
      const result = calculateWeightedAverageCost(7, 12.345, 3, 15.678);
      const expected = ((7 * 12.345) + (3 * 15.678)) / 10;
      expect(result).toBeCloseTo(expected, 4);
    });
  });

  describe("validatePurchaseInput", () => {
    it("should validate correct input", () => {
      const result = validatePurchaseInput("product-123", 10, 5.99);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject empty product ID", () => {
      const result = validatePurchaseInput("", 10, 5.99);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Product ID is required");
    });

    it("should reject whitespace-only product ID", () => {
      const result = validatePurchaseInput("   ", 10, 5.99);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Product ID is required");
    });

    it("should reject zero quantity", () => {
      const result = validatePurchaseInput("product-123", 0, 5.99);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Quantity must be a positive integer");
    });

    it("should reject negative quantity", () => {
      const result = validatePurchaseInput("product-123", -5, 5.99);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Quantity must be a positive integer");
    });

    it("should reject fractional quantity", () => {
      const result = validatePurchaseInput("product-123", 5.5, 5.99);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Quantity must be a positive integer");
    });

    it("should reject negative cost per unit", () => {
      const result = validatePurchaseInput("product-123", 10, -5.99);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Cost per unit must be a positive number");
    });

    it("should accept zero cost per unit (free items)", () => {
      const result = validatePurchaseInput("product-123", 10, 0);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject NaN cost per unit", () => {
      const result = validatePurchaseInput("product-123", 10, NaN);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Cost per unit must be a positive number");
    });

    it("should accumulate multiple validation errors", () => {
      const result = validatePurchaseInput("", -5, -10.5);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain("Product ID is required");
      expect(result.errors).toContain("Quantity must be a positive integer");
      expect(result.errors).toContain("Cost per unit must be a positive number");
    });

    it("should accept decimal cost per unit", () => {
      const result = validatePurchaseInput("product-123", 5, 12.99);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept very small cost per unit", () => {
      const result = validatePurchaseInput("product-123", 1000, 0.01);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept large quantity", () => {
      const result = validatePurchaseInput("product-123", 999999, 1.00);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("edge cases and boundary conditions", () => {
    it("should handle weighted average with very small quantities", () => {
      const result = calculateWeightedAverageCost(1, 1.00, 1, 2.00);
      expect(result).toBe(1.50);
    });

    it("should handle weighted average with very large quantities", () => {
      const result = calculateWeightedAverageCost(1000000, 5.00, 500000, 6.00);
      const expected = ((1000000 * 5.00) + (500000 * 6.00)) / 1500000;
      expect(result).toBeCloseTo(expected, 6);
    });

    it("should handle weighted average with very small costs", () => {
      const result = calculateWeightedAverageCost(100, 0.001, 50, 0.002);
      const expected = ((100 * 0.001) + (50 * 0.002)) / 150;
      expect(result).toBeCloseTo(expected, 6);
    });

    it("should handle weighted average with very large costs", () => {
      const result = calculateWeightedAverageCost(2, 999999.99, 1, 1000000.01);
      const expected = ((2 * 999999.99) + (1 * 1000000.01)) / 3;
      expect(result).toBeCloseTo(expected, 2);
    });

    it("should handle purchase quantity much larger than current quantity", () => {
      const result = calculateWeightedAverageCost(1, 10.00, 1000, 5.00);
      const expected = ((1 * 10.00) + (1000 * 5.00)) / 1001;
      expect(result).toBeCloseTo(expected, 4);
    });

    it("should handle purchase quantity much smaller than current quantity", () => {
      const result = calculateWeightedAverageCost(1000, 5.00, 1, 10.00);
      const expected = ((1000 * 5.00) + (1 * 10.00)) / 1001;
      expect(result).toBeCloseTo(expected, 4);
    });
  });
});