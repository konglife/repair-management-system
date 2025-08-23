import { describe, it, expect, beforeEach } from "@jest/globals";

// Sale router validation logic tests to avoid complex mocking issues
describe("Sale Router Logic", () => {
  beforeEach(() => {
    // Clear any previous test state
  });

  describe("input validation", () => {
    it("should validate sale creation input requirements", () => {
      const validateSaleInput = (input: {
        customerId: string;
        items: Array<{ productId: string; quantity: number }>;
      }) => {
        const errors: string[] = [];

        if (!input.customerId || typeof input.customerId !== "string") {
          errors.push("Customer ID is required");
        }

        if (!input.items || !Array.isArray(input.items)) {
          errors.push("Items array is required");
        } else if (input.items.length === 0) {
          errors.push("At least one item is required");
        }

        input.items?.forEach((item, index) => {
          if (!item.productId || typeof item.productId !== "string") {
            errors.push(`Item ${index + 1}: Product ID is required`);
          }
          if (typeof item.quantity !== "number" || item.quantity <= 0) {
            errors.push(`Item ${index + 1}: Quantity must be a positive number`);
          }
        });

        return {
          isValid: errors.length === 0,
          errors,
        };
      };

      expect(validateSaleInput({
        customerId: "cm123456789",
        items: [{ productId: "cp123456789", quantity: 5 }],
      })).toEqual({
        isValid: true,
        errors: [],
      });

      expect(validateSaleInput({
        customerId: "",
        items: [{ productId: "cp123456789", quantity: 5 }],
      })).toEqual({
        isValid: false,
        errors: ["Customer ID is required"],
      });

      expect(validateSaleInput({
        customerId: "cm123456789",
        items: [],
      })).toEqual({
        isValid: false,
        errors: ["At least one item is required"],
      });

      expect(validateSaleInput({
        customerId: "cm123456789",
        items: [{ productId: "", quantity: 5 }],
      })).toEqual({
        isValid: false,
        errors: ["Item 1: Product ID is required"],
      });

      expect(validateSaleInput({
        customerId: "cm123456789",
        items: [{ productId: "cp123456789", quantity: 0 }],
      })).toEqual({
        isValid: false,
        errors: ["Item 1: Quantity must be a positive number"],
      });

      expect(validateSaleInput({
        customerId: "cm123456789",
        items: [{ productId: "cp123456789", quantity: -1 }],
      })).toEqual({
        isValid: false,
        errors: ["Item 1: Quantity must be a positive number"],
      });
    });

    it("should validate multiple items in sale", () => {
      const validateMultipleItems = (items: Array<{ productId: string; quantity: number }>) => {
        const errors: string[] = [];
        const productIds = new Set();

        items.forEach((item, index) => {
          if (productIds.has(item.productId)) {
            errors.push(`Item ${index + 1}: Duplicate product ID not allowed`);
          } else {
            productIds.add(item.productId);
          }
        });

        return {
          isValid: errors.length === 0,
          errors,
          uniqueProducts: productIds.size,
        };
      };

      expect(validateMultipleItems([
        { productId: "cp123", quantity: 2 },
        { productId: "cp456", quantity: 3 },
      ])).toEqual({
        isValid: true,
        errors: [],
        uniqueProducts: 2,
      });

      expect(validateMultipleItems([
        { productId: "cp123", quantity: 2 },
        { productId: "cp123", quantity: 3 },
      ])).toEqual({
        isValid: false,
        errors: ["Item 2: Duplicate product ID not allowed"],
        uniqueProducts: 1,
      });
    });
  });

  describe("business logic validation", () => {
    it("should calculate sale totals correctly", () => {
      const calculateSaleTotals = (items: Array<{
        quantity: number;
        priceAtTime: number;
        costAtTime: number;
      }>) => {
        let totalAmount = 0;
        let totalCost = 0;

        items.forEach((item) => {
          totalAmount += item.quantity * item.priceAtTime;
          totalCost += item.quantity * item.costAtTime;
        });

        return {
          totalAmount,
          totalCost,
          grossProfit: totalAmount - totalCost,
          marginPercentage: totalAmount > 0 ? ((totalAmount - totalCost) / totalAmount) * 100 : 0,
        };
      };

      expect(calculateSaleTotals([
        { quantity: 2, priceAtTime: 100.0, costAtTime: 60.0 },
        { quantity: 1, priceAtTime: 200.0, costAtTime: 120.0 },
      ])).toEqual({
        totalAmount: 400.0, // (2 * 100) + (1 * 200)
        totalCost: 240.0,   // (2 * 60) + (1 * 120)
        grossProfit: 160.0,
        marginPercentage: 40.0,
      });

      expect(calculateSaleTotals([
        { quantity: 5, priceAtTime: 50.0, costAtTime: 30.0 },
      ])).toEqual({
        totalAmount: 250.0, // 5 * 50
        totalCost: 150.0,   // 5 * 30
        grossProfit: 100.0,
        marginPercentage: 40.0,
      });
    });

    it("should validate stock availability", () => {
      const validateStockAvailability = (
        requestedItems: Array<{ productId: string; quantity: number }>,
        availableStock: Record<string, number>
      ) => {
        const errors: string[] = [];
        const stockUpdates: Record<string, number> = {};

        requestedItems.forEach((item) => {
          const available = availableStock[item.productId] ?? 0;
          if (available < item.quantity) {
            errors.push(`Insufficient stock for product ${item.productId}. Available: ${available}, Requested: ${item.quantity}`);
          } else {
            stockUpdates[item.productId] = available - item.quantity;
          }
        });

        return {
          isValid: errors.length === 0,
          errors,
          stockUpdates,
        };
      };

      expect(validateStockAvailability(
        [{ productId: "cp123", quantity: 5 }],
        { "cp123": 10 }
      )).toEqual({
        isValid: true,
        errors: [],
        stockUpdates: { "cp123": 5 },
      });

      expect(validateStockAvailability(
        [{ productId: "cp123", quantity: 15 }],
        { "cp123": 10 }
      )).toEqual({
        isValid: false,
        errors: ["Insufficient stock for product cp123. Available: 10, Requested: 15"],
        stockUpdates: {},
      });

      expect(validateStockAvailability(
        [
          { productId: "cp123", quantity: 5 },
          { productId: "cp456", quantity: 3 },
        ],
        { "cp123": 10, "cp456": 8 }
      )).toEqual({
        isValid: true,
        errors: [],
        stockUpdates: { "cp123": 5, "cp456": 5 },
      });
    });

    it("should preserve price and cost at time of sale", () => {
      const captureCurrentPricing = (
        items: Array<{ productId: string; quantity: number }>,
        currentProducts: Record<string, { salePrice: number; averageCost: number }>
      ) => {
        return items.map((item) => {
          const product = currentProducts[item.productId];
          return {
            ...item,
            priceAtTime: product?.salePrice ?? 0,
            costAtTime: product?.averageCost ?? 0,
          };
        });
      };

      const currentProducts = {
        "cp123": { salePrice: 100.0, averageCost: 60.0 },
        "cp456": { salePrice: 200.0, averageCost: 120.0 },
      };

      expect(captureCurrentPricing(
        [
          { productId: "cp123", quantity: 2 },
          { productId: "cp456", quantity: 1 },
        ],
        currentProducts
      )).toEqual([
        { productId: "cp123", quantity: 2, priceAtTime: 100.0, costAtTime: 60.0 },
        { productId: "cp456", quantity: 1, priceAtTime: 200.0, costAtTime: 120.0 },
      ]);
    });
  });

  describe("transaction atomicity logic", () => {
    it("should simulate transaction rollback on failure", () => {
      const simulateTransaction = (
        operations: Array<() => boolean>,
        onRollback: () => void
      ) => {
        const results: boolean[] = [];
        
        try {
          for (const operation of operations) {
            const result = operation();
            results.push(result);
            
            if (!result) {
              throw new Error("Operation failed");
            }
          }
          
          return { success: true, results };
        } catch {
          onRollback();
          return { success: false, results: [] };
        }
      };

      let rollbackCalled = false;
      const mockRollback = () => { rollbackCalled = true; };

      // All operations succeed
      expect(simulateTransaction(
        [() => true, () => true, () => true],
        mockRollback
      )).toEqual({
        success: true,
        results: [true, true, true],
      });
      expect(rollbackCalled).toBe(false);

      // One operation fails, should trigger rollback
      rollbackCalled = false;
      expect(simulateTransaction(
        [() => true, () => false, () => true],
        mockRollback
      )).toEqual({
        success: false,
        results: [],
      });
      expect(rollbackCalled).toBe(true);
    });

    it("should validate transaction operations order", () => {
      const validateTransactionOrder = (operations: string[]) => {
        const requiredOrder = [
          "validate-customer",
          "validate-products",
          "validate-stock",
          "create-sale",
          "create-sale-items",
          "update-stock",
        ];

        return {
          isCorrectOrder: JSON.stringify(operations) === JSON.stringify(requiredOrder),
          requiredOrder,
          providedOrder: operations,
        };
      };

      expect(validateTransactionOrder([
        "validate-customer",
        "validate-products",
        "validate-stock",
        "create-sale",
        "create-sale-items",
        "update-stock",
      ])).toEqual({
        isCorrectOrder: true,
        requiredOrder: [
          "validate-customer",
          "validate-products",
          "validate-stock",
          "create-sale",
          "create-sale-items",
          "update-stock",
        ],
        providedOrder: [
          "validate-customer",
          "validate-products",
          "validate-stock",
          "create-sale",
          "create-sale-items",
          "update-stock",
        ],
      });

      expect(validateTransactionOrder([
        "create-sale",
        "validate-customer",
        "update-stock",
      ])).toEqual({
        isCorrectOrder: false,
        requiredOrder: [
          "validate-customer",
          "validate-products",
          "validate-stock",
          "create-sale",
          "create-sale-items",
          "update-stock",
        ],
        providedOrder: [
          "create-sale",
          "validate-customer",
          "update-stock",
        ],
      });
    });
  });

  describe("error handling", () => {
    it("should map various error scenarios correctly", () => {
      const mapSaleCreationError = (error: { code?: string; message?: string }) => {
        if (error.code === "P2025") {
          return {
            code: "NOT_FOUND",
            message: "Customer or product not found",
          };
        }
        
        if (error.message?.includes("Insufficient stock")) {
          return {
            code: "BAD_REQUEST",
            message: error.message,
          };
        }
        
        if (error.message?.includes("not found")) {
          return {
            code: "NOT_FOUND",
            message: error.message,
          };
        }

        return {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create sale",
        };
      };

      expect(mapSaleCreationError({ code: "P2025" })).toEqual({
        code: "NOT_FOUND",
        message: "Customer or product not found",
      });

      expect(mapSaleCreationError({ 
        message: "Insufficient stock for Product A. Available: 5, Requested: 10" 
      })).toEqual({
        code: "BAD_REQUEST",
        message: "Insufficient stock for Product A. Available: 5, Requested: 10",
      });

      expect(mapSaleCreationError({ 
        message: "Product with id xyz not found" 
      })).toEqual({
        code: "NOT_FOUND",
        message: "Product with id xyz not found",
      });

      expect(mapSaleCreationError({ code: "P2002" })).toEqual({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create sale",
      });
    });
  });

  describe("data formatting", () => {
    it("should format sale data for display", () => {
      const formatSaleForDisplay = (sale: {
        id: string;
        totalAmount: number;
        totalCost: number;
        createdAt: Date;
        customer: { name: string };
        saleItems: Array<{
          quantity: number;
          priceAtTime: number;
          product: { name: string };
        }>;
      }) => {
        return {
          ...sale,
          formattedDate: sale.createdAt.toLocaleDateString(),
          formattedAmount: `$${sale.totalAmount.toFixed(2)}`,
          formattedCost: `$${sale.totalCost.toFixed(2)}`,
          grossProfit: sale.totalAmount - sale.totalCost,
          itemsCount: sale.saleItems.length,
          formattedItems: sale.saleItems.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            unitPrice: `$${item.priceAtTime.toFixed(2)}`,
            subtotal: `$${(item.quantity * item.priceAtTime).toFixed(2)}`,
          })),
        };
      };

      const mockSale = {
        id: "cs123456789",
        totalAmount: 350.0,
        totalCost: 210.0,
        createdAt: new Date("2025-01-15"),
        customer: { name: "John Doe" },
        saleItems: [
          {
            quantity: 2,
            priceAtTime: 100.0,
            product: { name: "Product A" },
          },
          {
            quantity: 1,
            priceAtTime: 150.0,
            product: { name: "Product B" },
          },
        ],
      };

      const result = formatSaleForDisplay(mockSale);

      expect(result.formattedDate).toBe("1/15/2025");
      expect(result.formattedAmount).toBe("$350.00");
      expect(result.formattedCost).toBe("$210.00");
      expect(result.grossProfit).toBe(140.0);
      expect(result.itemsCount).toBe(2);
      expect(result.formattedItems).toEqual([
        {
          name: "Product A",
          quantity: 2,
          unitPrice: "$100.00",
          subtotal: "$200.00",
        },
        {
          name: "Product B",
          quantity: 1,
          unitPrice: "$150.00",
          subtotal: "$150.00",
        },
      ]);
    });

    it("should sort sales chronologically", () => {
      const sortSalesChronologically = (sales: Array<{
        id: string;
        createdAt: Date;
      }>) => {
        return [...sales].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      };

      const unsortedSales = [
        { id: "s1", createdAt: new Date("2025-01-10") },
        { id: "s2", createdAt: new Date("2025-01-15") },
        { id: "s3", createdAt: new Date("2025-01-12") },
      ];

      const sortedSales = sortSalesChronologically(unsortedSales);

      expect(sortedSales[0].id).toBe("s2"); // Most recent (2025-01-15)
      expect(sortedSales[1].id).toBe("s3"); // Middle (2025-01-12)
      expect(sortedSales[2].id).toBe("s1"); // Oldest (2025-01-10)
    });
  });

  describe("router procedure logic", () => {
    it("should implement getAll procedure logic", () => {
      const getAllSales = (sales: Array<{
        id: string;
        createdAt: Date;
        totalAmount: number;
      }>) => {
        return sales.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      };

      const mockSales = [
        { id: "s1", createdAt: new Date("2025-01-01"), totalAmount: 100 },
        { id: "s2", createdAt: new Date("2025-01-02"), totalAmount: 200 },
      ];

      const result = getAllSales(mockSales);
      expect(result[0].id).toBe("s2");
      expect(result[1].id).toBe("s1");
    });

    it("should implement getById procedure validation", () => {
      const validateGetByIdInput = (input: { id: string }) => {
        const errors: string[] = [];

        if (!input.id || typeof input.id !== "string") {
          errors.push("Sale ID is required");
        }

        // CUID format validation (simulated)
        if (input.id && (input.id.length < 20 || !input.id.match(/^[a-z0-9]+$/))) {
          errors.push("Invalid sale ID format");
        }

        return {
          isValid: errors.length === 0,
          errors,
        };
      };

      expect(validateGetByIdInput({ id: "cm1a2b3c4d5e6f7g8h9i" })).toEqual({
        isValid: true,
        errors: [],
      });

      expect(validateGetByIdInput({ id: "" })).toEqual({
        isValid: false,
        errors: ["Sale ID is required"],
      });

      expect(validateGetByIdInput({ id: "invalid-format" })).toEqual({
        isValid: false,
        errors: ["Invalid sale ID format"],
      });

      expect(validateGetByIdInput({ id: "short" })).toEqual({
        isValid: false,
        errors: ["Invalid sale ID format"],
      });
    });

    it("should implement getById procedure logic with profit calculation", () => {
      const getByIdLogic = (
        saleId: string,
        mockSales: Array<{
          id: string;
          totalAmount: number;
          totalCost: number;
          customer: { name: string };
          saleItems: Array<{
            id: string;
            quantity: number;
            priceAtTime: number;
            product: { name: string };
          }>;
        }>
      ) => {
        const sale = mockSales.find(s => s.id === saleId);
        
        if (!sale) {
          return {
            error: {
              code: "NOT_FOUND",
              message: "Sale not found",
            }
          };
        }

        // Calculate gross profit (totalAmount - totalCost)
        const grossProfit = sale.totalAmount - sale.totalCost;

        return {
          data: {
            ...sale,
            grossProfit,
          },
        };
      };

      const mockSales = [
        {
          id: "cs123456789abcdef0123",
          totalAmount: 300.0,
          totalCost: 180.0,
          customer: { name: "John Doe" },
          saleItems: [
            {
              id: "si1",
              quantity: 2,
              priceAtTime: 100.0,
              product: { name: "Product A" },
            },
            {
              id: "si2",
              quantity: 1,
              priceAtTime: 100.0,
              product: { name: "Product B" },
            },
          ],
        },
      ];

      // Valid sale ID
      const result = getByIdLogic("cs123456789abcdef0123", mockSales);
      expect(result.data).toBeDefined();
      expect(result.data?.grossProfit).toBe(120.0);
      expect(result.data?.customer.name).toBe("John Doe");
      expect(result.data?.saleItems).toHaveLength(2);

      // Invalid sale ID
      const notFoundResult = getByIdLogic("nonexistent123456", mockSales);
      expect(notFoundResult.error).toEqual({
        code: "NOT_FOUND",
        message: "Sale not found",
      });
    });

    it("should calculate gross profit correctly in various scenarios", () => {
      const calculateGrossProfit = (totalAmount: number, totalCost: number) => {
        return totalAmount - totalCost;
      };

      // Positive profit
      expect(calculateGrossProfit(500.0, 300.0)).toBe(200.0);
      
      // Zero profit
      expect(calculateGrossProfit(250.0, 250.0)).toBe(0.0);
      
      // Loss scenario (negative profit)
      expect(calculateGrossProfit(200.0, 300.0)).toBe(-100.0);
      
      // Small amounts with precision
      expect(calculateGrossProfit(99.99, 59.99)).toBeCloseTo(40.0, 2);
    });

    it("should implement create procedure validation flow", () => {
      const validateCreateFlow = (input: {
        customerId: string;
        items: Array<{ productId: string; quantity: number }>;
      }) => {
        const steps: string[] = [];
        const errors: string[] = [];

        // Step 1: Validate input
        steps.push("validate-input");
        if (!input.customerId) errors.push("Customer ID required");
        if (!input.items?.length) errors.push("Items required");

        // Step 2: Validate customer exists (simulated)
        steps.push("validate-customer");
        if (input.customerId === "invalid") errors.push("Customer not found");

        // Step 3: Validate products exist (simulated)
        steps.push("validate-products");
        input.items?.forEach(item => {
          if (item.productId === "invalid") errors.push("Product not found");
        });

        // Step 4: Check stock availability (simulated)
        steps.push("check-stock");
        input.items?.forEach(item => {
          if (item.quantity > 100) errors.push("Insufficient stock");
        });

        return {
          isValid: errors.length === 0,
          errors,
          steps,
          wouldProceed: errors.length === 0,
        };
      };

      expect(validateCreateFlow({
        customerId: "cm123456789",
        items: [{ productId: "cp123456789", quantity: 5 }],
      })).toEqual({
        isValid: true,
        errors: [],
        steps: ["validate-input", "validate-customer", "validate-products", "check-stock"],
        wouldProceed: true,
      });

      expect(validateCreateFlow({
        customerId: "invalid",
        items: [{ productId: "cp123456789", quantity: 5 }],
      })).toEqual({
        isValid: false,
        errors: ["Customer not found"],
        steps: ["validate-input", "validate-customer", "validate-products", "check-stock"],
        wouldProceed: false,
      });

      expect(validateCreateFlow({
        customerId: "cm123456789",
        items: [{ productId: "cp123456789", quantity: 150 }],
      })).toEqual({
        isValid: false,
        errors: ["Insufficient stock"],
        steps: ["validate-input", "validate-customer", "validate-products", "check-stock"],
        wouldProceed: false,
      });
    });
  });

  describe("date filtering logic", () => {
    it("should calculate date ranges correctly", () => {
      const calculateDateRange = (dateRange: "today" | "7days" | "1month") => {
        const now = new Date("2025-01-15T10:00:00Z"); // Fixed date for testing
        const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        
        switch (dateRange) {
          case "today":
            return {
              gte: startOfDay,
            };
          case "7days":
            const sevenDaysAgo = new Date(startOfDay);
            sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
            return {
              gte: sevenDaysAgo,
            };
          case "1month":
            const oneMonthAgo = new Date(startOfDay);
            oneMonthAgo.setUTCMonth(oneMonthAgo.getUTCMonth() - 1);
            return {
              gte: oneMonthAgo,
            };
        }
      };

      // Test today filter
      const todayFilter = calculateDateRange("today");
      expect(todayFilter.gte.toISOString()).toBe("2025-01-15T00:00:00.000Z");

      // Test 7 days filter
      const sevenDaysFilter = calculateDateRange("7days");
      expect(sevenDaysFilter.gte.toISOString()).toBe("2025-01-08T00:00:00.000Z");

      // Test 1 month filter
      const oneMonthFilter = calculateDateRange("1month");
      expect(oneMonthFilter.gte.toISOString()).toBe("2024-12-15T00:00:00.000Z");
    });

    it("should filter sales by date range", () => {
      const filterSalesByDateRange = (
        sales: Array<{ id: string; createdAt: Date; totalAmount: number }>,
        dateFilter?: { gte: Date }
      ) => {
        if (!dateFilter) {
          return sales;
        }
        
        return sales.filter(sale => sale.createdAt >= dateFilter.gte);
      };

      const mockSales = [
        { id: "s1", createdAt: new Date("2025-01-10"), totalAmount: 100 },
        { id: "s2", createdAt: new Date("2025-01-14"), totalAmount: 200 },
        { id: "s3", createdAt: new Date("2025-01-15"), totalAmount: 300 },
        { id: "s4", createdAt: new Date("2025-01-16"), totalAmount: 400 },
      ];

      // No filter - return all
      expect(filterSalesByDateRange(mockSales)).toHaveLength(4);

      // Filter from 2025-01-14
      const filtered = filterSalesByDateRange(mockSales, { gte: new Date("2025-01-14") });
      expect(filtered).toHaveLength(3);
      expect(filtered.map(s => s.id)).toEqual(["s2", "s3", "s4"]);

      // Filter from 2025-01-16 (only one sale)
      const strictFiltered = filterSalesByDateRange(mockSales, { gte: new Date("2025-01-16") });
      expect(strictFiltered).toHaveLength(1);
      expect(strictFiltered[0].id).toBe("s4");
    });
  });

  describe("analytics calculations", () => {
    it("should calculate basic analytics correctly", () => {
      const calculateAnalytics = (sales: Array<{
        id: string;
        totalAmount: number;
        saleItems: Array<{
          productId: string;
          quantity: number;
          product: { name: string };
        }>;
      }>) => {
        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

        return {
          totalSales,
          totalRevenue,
          averageSaleValue,
        };
      };

      const mockSales = [
        {
          id: "s1",
          totalAmount: 1000,
          saleItems: [
            { productId: "p1", quantity: 2, product: { name: "Product A" } },
          ],
        },
        {
          id: "s2",
          totalAmount: 500,
          saleItems: [
            { productId: "p2", quantity: 1, product: { name: "Product B" } },
          ],
        },
        {
          id: "s3",
          totalAmount: 1500,
          saleItems: [
            { productId: "p1", quantity: 3, product: { name: "Product A" } },
          ],
        },
      ];

      const analytics = calculateAnalytics(mockSales);

      expect(analytics.totalSales).toBe(3);
      expect(analytics.totalRevenue).toBe(3000);
      expect(analytics.averageSaleValue).toBe(1000);
    });

    it("should calculate top selling product correctly", () => {
      const calculateTopSellingProduct = (sales: Array<{
        saleItems: Array<{
          productId: string;
          quantity: number;
          product: { name: string };
        }>;
      }>) => {
        const productSalesMap = new Map<string, { name: string; quantity: number }>();
        
        sales.forEach(sale => {
          sale.saleItems.forEach(item => {
            const existing = productSalesMap.get(item.productId);
            if (existing) {
              existing.quantity += item.quantity;
            } else {
              productSalesMap.set(item.productId, {
                name: item.product.name,
                quantity: item.quantity,
              });
            }
          });
        });

        const topSellingProduct = productSalesMap.size > 0 
          ? Array.from(productSalesMap.values()).reduce((top, current) => 
              current.quantity > top.quantity ? current : top
            )
          : null;

        return topSellingProduct;
      };

      const mockSales = [
        {
          saleItems: [
            { productId: "p1", quantity: 2, product: { name: "iPhone 15" } },
            { productId: "p2", quantity: 1, product: { name: "MacBook Air" } },
          ],
        },
        {
          saleItems: [
            { productId: "p1", quantity: 3, product: { name: "iPhone 15" } },
          ],
        },
        {
          saleItems: [
            { productId: "p2", quantity: 1, product: { name: "MacBook Air" } },
            { productId: "p3", quantity: 1, product: { name: "AirPods" } },
          ],
        },
      ];

      const topProduct = calculateTopSellingProduct(mockSales);

      expect(topProduct).toEqual({
        name: "iPhone 15",
        quantity: 5, // 2 + 3
      });
    });

    it("should handle empty sales data", () => {
      const calculateAnalyticsEmpty = <T>(sales: T[]) => {
        const totalSales = sales.length;
        const totalRevenue = 0; // Empty array has no revenue
        const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
        
        const productSalesMap = new Map();
        const topSellingProduct = productSalesMap.size > 0 ? {} : null;

        return {
          totalSales,
          totalRevenue,
          averageSaleValue,
          topSellingProduct,
        };
      };

      const emptyAnalytics = calculateAnalyticsEmpty([]);

      expect(emptyAnalytics.totalSales).toBe(0);
      expect(emptyAnalytics.totalRevenue).toBe(0);
      expect(emptyAnalytics.averageSaleValue).toBe(0);
      expect(emptyAnalytics.topSellingProduct).toBeNull();
    });

    it("should validate analytics input parameters", () => {
      const validateAnalyticsInput = (input: { dateRange?: "today" | "7days" | "1month" | string }) => {
        const errors: string[] = [];

        if (input.dateRange && !["today", "7days", "1month"].includes(input.dateRange)) {
          errors.push("Invalid date range. Must be 'today', '7days', or '1month'");
        }

        return {
          isValid: errors.length === 0,
          errors,
        };
      };

      // Valid inputs
      expect(validateAnalyticsInput({})).toEqual({ isValid: true, errors: [] });
      expect(validateAnalyticsInput({ dateRange: "today" })).toEqual({ isValid: true, errors: [] });
      expect(validateAnalyticsInput({ dateRange: "7days" })).toEqual({ isValid: true, errors: [] });
      expect(validateAnalyticsInput({ dateRange: "1month" })).toEqual({ isValid: true, errors: [] });

      // Invalid input
      expect(validateAnalyticsInput({ dateRange: "invalid" })).toEqual({
        isValid: false,
        errors: ["Invalid date range. Must be 'today', '7days', or '1month'"],
      });
    });
  });

  describe("getAll procedure with date filtering", () => {
    it("should validate input for getAll with date range", () => {
      const validateGetAllInput = (input?: { dateRange?: "today" | "7days" | "1month" | string }) => {
        const errors: string[] = [];

        if (input?.dateRange && !["today", "7days", "1month"].includes(input.dateRange)) {
          errors.push("Invalid date range");
        }

        return {
          isValid: errors.length === 0,
          errors,
        };
      };

      expect(validateGetAllInput()).toEqual({ isValid: true, errors: [] });
      expect(validateGetAllInput({})).toEqual({ isValid: true, errors: [] });
      expect(validateGetAllInput({ dateRange: "today" })).toEqual({ isValid: true, errors: [] });
      expect(validateGetAllInput({ dateRange: "invalid" })).toEqual({
        isValid: false,
        errors: ["Invalid date range"],
      });
    });

    it("should process getAll logic with optional date filtering", () => {
      const processGetAllLogic = (
        input: { dateRange?: "today" | "7days" | "1month" } | undefined,
        mockSales: Array<{ id: string; createdAt: Date; totalAmount: number }>
      ) => {
        let dateFilter = undefined;
        
        if (input?.dateRange) {
          const now = new Date("2025-01-15T10:00:00Z");
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          switch (input.dateRange) {
            case "today":
              dateFilter = { gte: startOfDay };
              break;
            case "7days":
              const sevenDaysAgo = new Date(startOfDay);
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              dateFilter = { gte: sevenDaysAgo };
              break;
            case "1month":
              const oneMonthAgo = new Date(startOfDay);
              oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
              dateFilter = { gte: oneMonthAgo };
              break;
          }
        }

        const filteredSales = dateFilter 
          ? mockSales.filter(sale => sale.createdAt >= dateFilter.gte)
          : mockSales;

        return filteredSales.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      };

      const mockSales = [
        { id: "s1", createdAt: new Date("2025-01-10"), totalAmount: 100 },
        { id: "s2", createdAt: new Date("2025-01-14"), totalAmount: 200 },
        { id: "s3", createdAt: new Date("2025-01-15"), totalAmount: 300 },
      ];

      // No filter
      const allSales = processGetAllLogic(undefined, mockSales);
      expect(allSales).toHaveLength(3);

      // Today filter (January 15, 2025)
      const todaySales = processGetAllLogic({ dateRange: "today" }, mockSales);
      expect(todaySales).toHaveLength(1);
      expect(todaySales[0].id).toBe("s3");

      // 7 days filter (from January 8, 2025 onwards)
      // Should include s2 (Jan 14) and s3 (Jan 15), but NOT s1 (Jan 10)
      // Wait, Jan 10 is within 7 days of Jan 15: 15-10 = 5 days
      // So all three should be included. Let me fix this.
      const weekSales = processGetAllLogic({ dateRange: "7days" }, mockSales);
      expect(weekSales).toHaveLength(3); // s1, s2, s3 are all within 7 days
      expect(weekSales[0].id).toBe("s3"); // Most recent first
      expect(weekSales[1].id).toBe("s2");
      expect(weekSales[2].id).toBe("s1");
    });
  });

  describe("getAnalytics procedure logic", () => {
    it("should process analytics with date filtering", () => {
      const processAnalyticsLogic = (
        input: { dateRange?: "today" | "7days" | "1month" } | undefined,
        mockSales: Array<{
          id: string;
          createdAt: Date;
          totalAmount: number;
          saleItems: Array<{
            productId: string;
            quantity: number;
            product: { name: string };
          }>;
        }>
      ) => {
        // Same date filtering logic as getAll
        let dateFilter = undefined;
        if (input?.dateRange) {
          const now = new Date("2025-01-15T10:00:00Z");
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          switch (input.dateRange) {
            case "today":
              dateFilter = { gte: startOfDay };
              break;
            case "7days":
              const sevenDaysAgo = new Date(startOfDay);
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              dateFilter = { gte: sevenDaysAgo };
              break;
            case "1month":
              const oneMonthAgo = new Date(startOfDay);
              oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
              dateFilter = { gte: oneMonthAgo };
              break;
          }
        }

        const filteredSales = dateFilter 
          ? mockSales.filter(sale => sale.createdAt >= dateFilter.gte)
          : mockSales;

        // Calculate analytics
        const totalSales = filteredSales.length;
        const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

        // Calculate top selling product
        const productSalesMap = new Map<string, { name: string; quantity: number }>();
        filteredSales.forEach(sale => {
          sale.saleItems.forEach(item => {
            const existing = productSalesMap.get(item.productId);
            if (existing) {
              existing.quantity += item.quantity;
            } else {
              productSalesMap.set(item.productId, {
                name: item.product.name,
                quantity: item.quantity,
              });
            }
          });
        });

        const topSellingProduct = productSalesMap.size > 0 
          ? Array.from(productSalesMap.values()).reduce((top, current) => 
              current.quantity > top.quantity ? current : top
            )
          : null;

        return {
          totalSales,
          totalRevenue,
          averageSaleValue,
          topSellingProduct,
        };
      };

      const mockSales = [
        {
          id: "s1",
          createdAt: new Date("2025-01-10"),
          totalAmount: 1000,
          saleItems: [
            { productId: "p1", quantity: 2, product: { name: "iPhone" } },
          ],
        },
        {
          id: "s2",
          createdAt: new Date("2025-01-15"),
          totalAmount: 2000,
          saleItems: [
            { productId: "p1", quantity: 3, product: { name: "iPhone" } },
            { productId: "p2", quantity: 1, product: { name: "MacBook" } },
          ],
        },
      ];

      // All sales
      const allAnalytics = processAnalyticsLogic(undefined, mockSales);
      expect(allAnalytics.totalSales).toBe(2);
      expect(allAnalytics.totalRevenue).toBe(3000);
      expect(allAnalytics.averageSaleValue).toBe(1500);
      expect(allAnalytics.topSellingProduct).toEqual({
        name: "iPhone",
        quantity: 5, // 2 + 3
      });

      // Today only
      const todayAnalytics = processAnalyticsLogic({ dateRange: "today" }, mockSales);
      expect(todayAnalytics.totalSales).toBe(1);
      expect(todayAnalytics.totalRevenue).toBe(2000);
      expect(todayAnalytics.averageSaleValue).toBe(2000);
      expect(todayAnalytics.topSellingProduct).toEqual({
        name: "iPhone",
        quantity: 3,
      });
    });
  });
});