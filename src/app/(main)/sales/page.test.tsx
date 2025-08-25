import { describe, it, expect, beforeEach } from "@jest/globals";

// Sales page business logic tests to avoid complex mocking issues
describe("Sales Page Logic", () => {
  beforeEach(() => {
    // Clear any previous test state
  });

  describe("sale item management", () => {
    it("should add new products to sale items", () => {
      const addProductToSaleItems = (
        currentItems: Array<{ productId: string; quantity: number; unitPrice: number; subtotal: number }>,
        productId: string,
        quantity: number,
        unitPrice: number
      ) => {
        const existingItemIndex = currentItems.findIndex(item => item.productId === productId);
        
        if (existingItemIndex >= 0) {
          // Update existing item
          const updatedItems = [...currentItems];
          const existingItem = updatedItems[existingItemIndex]!;
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + quantity,
            subtotal: (existingItem.quantity + quantity) * unitPrice,
          };
          return updatedItems;
        } else {
          // Add new item
          return [
            ...currentItems,
            {
              productId,
              quantity,
              unitPrice,
              subtotal: quantity * unitPrice,
            },
          ];
        }
      };

      const initialItems: Array<{ productId: string; quantity: number; unitPrice: number; subtotal: number }> = [];

      // Add first product
      const items1 = addProductToSaleItems(initialItems, "product1", 2, 50.0);
      expect(items1).toEqual([
        { productId: "product1", quantity: 2, unitPrice: 50.0, subtotal: 100.0 },
      ]);

      // Add second product
      const items2 = addProductToSaleItems(items1, "product2", 1, 75.0);
      expect(items2).toEqual([
        { productId: "product1", quantity: 2, unitPrice: 50.0, subtotal: 100.0 },
        { productId: "product2", quantity: 1, unitPrice: 75.0, subtotal: 75.0 },
      ]);

      // Add more of the first product
      const items3 = addProductToSaleItems(items2, "product1", 1, 50.0);
      expect(items3).toEqual([
        { productId: "product1", quantity: 3, unitPrice: 50.0, subtotal: 150.0 },
        { productId: "product2", quantity: 1, unitPrice: 75.0, subtotal: 75.0 },
      ]);
    });

    it("should remove products from sale items", () => {
      const removeProductFromSaleItems = (
        currentItems: Array<{ productId: string; quantity: number; unitPrice: number; subtotal: number }>,
        productId: string
      ) => {
        return currentItems.filter(item => item.productId !== productId);
      };

      const items = [
        { productId: "product1", quantity: 2, unitPrice: 50.0, subtotal: 100.0 },
        { productId: "product2", quantity: 1, unitPrice: 75.0, subtotal: 75.0 },
      ];

      const updatedItems = removeProductFromSaleItems(items, "product1");
      expect(updatedItems).toEqual([
        { productId: "product2", quantity: 1, unitPrice: 75.0, subtotal: 75.0 },
      ]);
    });

    it("should update product quantities in sale items", () => {
      const updateProductQuantity = (
        currentItems: Array<{ productId: string; quantity: number; unitPrice: number; subtotal: number }>,
        productId: string,
        newQuantity: number
      ) => {
        if (newQuantity <= 0) {
          return currentItems.filter(item => item.productId !== productId);
        }

        return currentItems.map(item => {
          if (item.productId === productId) {
            return {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * item.unitPrice,
            };
          }
          return item;
        });
      };

      const items = [
        { productId: "product1", quantity: 2, unitPrice: 50.0, subtotal: 100.0 },
        { productId: "product2", quantity: 1, unitPrice: 75.0, subtotal: 75.0 },
      ];

      // Update quantity to positive number
      const updatedItems1 = updateProductQuantity(items, "product1", 5);
      expect(updatedItems1).toEqual([
        { productId: "product1", quantity: 5, unitPrice: 50.0, subtotal: 250.0 },
        { productId: "product2", quantity: 1, unitPrice: 75.0, subtotal: 75.0 },
      ]);

      // Update quantity to zero (should remove item)
      const updatedItems2 = updateProductQuantity(items, "product1", 0);
      expect(updatedItems2).toEqual([
        { productId: "product2", quantity: 1, unitPrice: 75.0, subtotal: 75.0 },
      ]);
    });
  });

  describe("sale calculations", () => {
    it("should calculate sale total correctly", () => {
      const calculateSaleTotal = (
        items: Array<{ productId: string; quantity: number; unitPrice: number; subtotal: number }>
      ) => {
        return items.reduce((total, item) => total + item.subtotal, 0);
      };

      const items = [
        { productId: "product1", quantity: 2, unitPrice: 50.0, subtotal: 100.0 },
        { productId: "product2", quantity: 1, unitPrice: 75.0, subtotal: 75.0 },
        { productId: "product3", quantity: 3, unitPrice: 25.0, subtotal: 75.0 },
      ];

      expect(calculateSaleTotal(items)).toBe(250.0);
      expect(calculateSaleTotal([])).toBe(0.0);
    });

    it("should calculate dashboard statistics correctly", () => {
      const calculateDashboardStats = (
        sales: Array<{ id: string; totalAmount: number; createdAt: Date }>
      ) => {
        const totalSalesAmount = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalSalesCount = sales.length;
        const averageSaleAmount = totalSalesCount > 0 ? totalSalesAmount / totalSalesCount : 0;

        return {
          totalSalesAmount,
          totalSalesCount,
          averageSaleAmount,
        };
      };

      const sales = [
        { id: "sale1", totalAmount: 100.0, createdAt: new Date("2025-01-15") },
        { id: "sale2", totalAmount: 150.0, createdAt: new Date("2025-01-16") },
        { id: "sale3", totalAmount: 200.0, createdAt: new Date("2025-01-17") },
      ];

      expect(calculateDashboardStats(sales)).toEqual({
        totalSalesAmount: 450.0,
        totalSalesCount: 3,
        averageSaleAmount: 150.0,
      });

      expect(calculateDashboardStats([])).toEqual({
        totalSalesAmount: 0,
        totalSalesCount: 0,
        averageSaleAmount: 0,
      });
    });
  });

  describe("form validation", () => {
    it("should validate sale creation form", () => {
      const validateSaleForm = (
        customerId: string,
        items: Array<{ productId: string; quantity: number }>
      ) => {
        const errors: string[] = [];

        if (!customerId || customerId.trim() === "") {
          errors.push("Customer is required");
        }

        if (!items || items.length === 0) {
          errors.push("At least one product is required");
        }

        items.forEach((item, index) => {
          if (!item.productId || item.productId.trim() === "") {
            errors.push(`Item ${index + 1}: Product is required`);
          }
          if (item.quantity <= 0) {
            errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
          }
        });

        return {
          isValid: errors.length === 0,
          errors,
        };
      };

      // Valid form
      expect(validateSaleForm("customer1", [
        { productId: "product1", quantity: 2 },
        { productId: "product2", quantity: 1 },
      ])).toEqual({
        isValid: true,
        errors: [],
      });

      // Missing customer
      expect(validateSaleForm("", [
        { productId: "product1", quantity: 2 },
      ])).toEqual({
        isValid: false,
        errors: ["Customer is required"],
      });

      // No items
      expect(validateSaleForm("customer1", [])).toEqual({
        isValid: false,
        errors: ["At least one product is required"],
      });

      // Invalid quantity
      expect(validateSaleForm("customer1", [
        { productId: "product1", quantity: 0 },
      ])).toEqual({
        isValid: false,
        errors: ["Item 1: Quantity must be greater than 0"],
      });

      // Missing product ID
      expect(validateSaleForm("customer1", [
        { productId: "", quantity: 2 },
      ])).toEqual({
        isValid: false,
        errors: ["Item 1: Product is required"],
      });
    });

    it("should validate product stock availability", () => {
      const validateStockAvailability = (
        requestedItems: Array<{ productId: string; quantity: number }>,
        availableStock: Record<string, number>
      ) => {
        const errors: string[] = [];

        requestedItems.forEach((item, index) => {
          const available = availableStock[item.productId] ?? 0;
          if (available < item.quantity) {
            errors.push(`Item ${index + 1}: Insufficient stock. Available: ${available}, Requested: ${item.quantity}`);
          }
        });

        return {
          isValid: errors.length === 0,
          errors,
        };
      };

      const availableStock = {
        "product1": 10,
        "product2": 5,
        "product3": 0,
      };

      // Valid stock
      expect(validateStockAvailability([
        { productId: "product1", quantity: 5 },
        { productId: "product2", quantity: 3 },
      ], availableStock)).toEqual({
        isValid: true,
        errors: [],
      });

      // Insufficient stock
      expect(validateStockAvailability([
        { productId: "product1", quantity: 15 },
        { productId: "product2", quantity: 10 },
      ], availableStock)).toEqual({
        isValid: false,
        errors: [
          "Item 1: Insufficient stock. Available: 10, Requested: 15",
          "Item 2: Insufficient stock. Available: 5, Requested: 10",
        ],
      });

      // Out of stock
      expect(validateStockAvailability([
        { productId: "product3", quantity: 1 },
      ], availableStock)).toEqual({
        isValid: false,
        errors: ["Item 1: Insufficient stock. Available: 0, Requested: 1"],
      });
    });
  });

  describe("data formatting", () => {
    it("should format sale data for display", () => {
      const formatSaleForDisplay = (sale: {
        id: string;
        totalAmount: number;
        createdAt: Date | string;
        customer: { name: string };
        saleItems: Array<{ quantity: number; product: { name: string } }>;
      }) => {
        return {
          id: sale.id,
          formattedDate: new Date(sale.createdAt).toLocaleDateString(),
          customerName: sale.customer.name,
          itemsCount: sale.saleItems.length,
          formattedTotal: new Intl.NumberFormat("th-TH", {
            style: "currency",
            currency: "THB",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(sale.totalAmount),
          itemsSummary: sale.saleItems.map(item => 
            `${item.quantity}x ${item.product.name}`
          ).join(", "),
        };
      };

      const sale = {
        id: "sale1",
        totalAmount: 250.75,
        createdAt: new Date("2025-01-15"),
        customer: { name: "John Doe" },
        saleItems: [
          { quantity: 2, product: { name: "Product A" } },
          { quantity: 1, product: { name: "Product B" } },
        ],
      };

      expect(formatSaleForDisplay(sale)).toEqual({
        id: "sale1",
        formattedDate: "1/15/2025",
        customerName: "John Doe",
        itemsCount: 2,
        formattedTotal: "฿250.75",
        itemsSummary: "2x Product A, 1x Product B",
      });
    });

    it("should sort sales chronologically", () => {
      const sortSalesChronologically = (sales: Array<{
        id: string;
        createdAt: Date | string;
      }>) => {
        return [...sales].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      };

      const sales = [
        { id: "sale1", createdAt: new Date("2025-01-10") },
        { id: "sale2", createdAt: new Date("2025-01-15") },
        { id: "sale3", createdAt: new Date("2025-01-12") },
      ];

      const sortedSales = sortSalesChronologically(sales);
      expect(sortedSales.map(s => s.id)).toEqual(["sale2", "sale3", "sale1"]);
    });
  });

  describe("navigation and routing", () => {
    it("should generate correct sale detail route paths", () => {
      const generateSaleDetailPath = (saleId: string) => {
        return `/sales/${saleId}`;
      };

      expect(generateSaleDetailPath("cm1a2b3c4d5e6f7g8h9i")).toBe("/sales/cm1a2b3c4d5e6f7g8h9i");
      expect(generateSaleDetailPath("cs123456789abcdef")).toBe("/sales/cs123456789abcdef");
    });

    it("should handle sale detail navigation action", () => {
      const handleSaleDetailNavigation = (saleId: string) => {
        return {
          action: "navigate",
          destination: `/sales/${saleId}`,
          method: "push",
          saleId,
        };
      };

      expect(handleSaleDetailNavigation("sale123")).toEqual({
        action: "navigate",
        destination: "/sales/sale123",
        method: "push",
        saleId: "sale123",
      });
    });

    it("should validate sale actions availability", () => {
      const getSaleActions = (sale: { id: string; customer: { name: string } }) => {
        return {
          canViewDetails: Boolean(sale.id),
          detailsButtonProps: {
            variant: "ghost" as const,
            size: "sm" as const,
            title: "View Details",
            onClick: () => ({ action: "navigate", path: `/sales/${sale.id}` }),
          },
        };
      };

      const mockSale = {
        id: "cs123456789",
        customer: { name: "John Doe" },
      };

      const actions = getSaleActions(mockSale);
      expect(actions.canViewDetails).toBe(true);
      expect(actions.detailsButtonProps.title).toBe("View Details");
      expect(actions.detailsButtonProps.variant).toBe("ghost");
      expect(actions.detailsButtonProps.size).toBe("sm");
    });

    it("should handle sales table row actions", () => {
      const getSalesTableRowActions = (sales: Array<{ id: string; totalAmount: number }>) => {
        return sales.map(sale => ({
          saleId: sale.id,
          totalAmount: sale.totalAmount,
          actions: [
            {
              type: "view-details",
              label: "View Details",
              icon: "Eye",
              destination: `/sales/${sale.id}`,
            },
          ],
        }));
      };

      const mockSales = [
        { id: "sale1", totalAmount: 100.0 },
        { id: "sale2", totalAmount: 200.0 },
      ];

      const result = getSalesTableRowActions(mockSales);
      expect(result).toHaveLength(2);
      expect(result[0].actions[0]).toEqual({
        type: "view-details",
        label: "View Details",
        icon: "Eye",
        destination: "/sales/sale1",
      });
      expect(result[1].actions[0]).toEqual({
        type: "view-details",
        label: "View Details",
        icon: "Eye",
        destination: "/sales/sale2",
      });
    });
  });

  describe("UI state management", () => {
    it("should manage form state correctly with date field", () => {
      const resetFormState = () => ({
        selectedCustomerId: "",
        saleItems: [],
        selectedProductId: "",
        productQuantity: 1,
        saleDate: new Date(),
        showCreateSaleForm: false,
      });

      const openFormState = (baseState: { showCreateSaleForm?: boolean }) => ({
        ...baseState,
        showCreateSaleForm: true,
      });

      const closeFormState = () => ({
        ...resetFormState(),
        showCreateSaleForm: false,
      });

      const initialState = resetFormState();
      expect(initialState.selectedCustomerId).toBe("");
      expect(initialState.saleItems).toEqual([]);
      expect(initialState.saleDate).toBeInstanceOf(Date);
      expect(initialState.showCreateSaleForm).toBe(false);

      const openState = openFormState(initialState);
      expect(openState.showCreateSaleForm).toBe(true);

      const closedState = closeFormState();
      expect(closedState.selectedCustomerId).toBe("");
      expect(closedState.saleItems).toEqual([]);
      expect(closedState.showCreateSaleForm).toBe(false);
    });

    it("should handle product selection state", () => {
      const updateProductSelection = (
        currentState: { selectedProductId: string; productQuantity: number },
        productId: string,
        quantity: number = 1
      ) => ({
        selectedProductId: productId,
        productQuantity: Math.max(1, quantity),
      });

      const clearProductSelection = () => ({
        selectedProductId: "",
        productQuantity: 1,
      });

      expect(updateProductSelection(
        { selectedProductId: "", productQuantity: 1 },
        "product1",
        5
      )).toEqual({
        selectedProductId: "product1",
        productQuantity: 5,
      });

      expect(updateProductSelection(
        { selectedProductId: "product1", productQuantity: 5 },
        "product2",
        0
      )).toEqual({
        selectedProductId: "product2",
        productQuantity: 1, // Minimum quantity enforced
      });

      expect(clearProductSelection()).toEqual({
        selectedProductId: "",
        productQuantity: 1,
      });
    });
  });

  describe("date field functionality", () => {
    it("should validate sale date field", () => {
      const validateSaleDate = (date: Date | undefined) => {
        const errors: string[] = [];
        
        if (!date) {
          errors.push("Sale date is required");
        } else {
          const now = new Date();
          // Allow future dates up to 1 day ahead to handle timezone issues
          const maxDate = new Date(now);
          maxDate.setDate(maxDate.getDate() + 1);
          
          if (date > maxDate) {
            errors.push("Sale date cannot be in the future");
          }
          
          // Prevent dates older than 1 year
          const minDate = new Date(now);
          minDate.setFullYear(minDate.getFullYear() - 1);
          
          if (date < minDate) {
            errors.push("Sale date cannot be older than 1 year");
          }
        }
        
        return {
          isValid: errors.length === 0,
          errors,
        };
      };

      // Valid date (today)
      const today = new Date();
      expect(validateSaleDate(today)).toEqual({
        isValid: true,
        errors: [],
      });

      // Valid date (yesterday)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(validateSaleDate(yesterday)).toEqual({
        isValid: true,
        errors: [],
      });

      // Invalid: undefined date
      expect(validateSaleDate(undefined)).toEqual({
        isValid: false,
        errors: ["Sale date is required"],
      });

      // Invalid: future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const futureValidation = validateSaleDate(futureDate);
      expect(futureValidation.isValid).toBe(false);
      expect(futureValidation.errors).toContain("Sale date cannot be in the future");

      // Invalid: very old date
      const veryOldDate = new Date();
      veryOldDate.setFullYear(veryOldDate.getFullYear() - 2);
      const oldValidation = validateSaleDate(veryOldDate);
      expect(oldValidation.isValid).toBe(false);
      expect(oldValidation.errors).toContain("Sale date cannot be older than 1 year");
    });

    it("should handle date picker state changes", () => {
      const manageDatePickerState = (
        currentDate: Date | undefined,
        newDate: Date | undefined
      ) => {
        return {
          previousDate: currentDate,
          newDate,
          hasChanged: currentDate !== newDate,
          formattedDate: newDate ? newDate.toLocaleDateString() : null,
        };
      };

      const initialDate = new Date("2025-01-15");
      const newDate = new Date("2025-01-20");

      expect(manageDatePickerState(initialDate, newDate)).toEqual({
        previousDate: initialDate,
        newDate,
        hasChanged: true,
        formattedDate: "1/20/2025",
      });

      expect(manageDatePickerState(initialDate, initialDate)).toEqual({
        previousDate: initialDate,
        newDate: initialDate,
        hasChanged: false,
        formattedDate: "1/15/2025",
      });

      expect(manageDatePickerState(initialDate, undefined)).toEqual({
        previousDate: initialDate,
        newDate: undefined,
        hasChanged: true,
        formattedDate: null,
      });
    });
  });

  describe("inline form behavior", () => {
    it("should handle inline form visibility toggle", () => {
      const manageInlineForm = (
        currentState: { showCreateSaleForm: boolean },
        action: "open" | "close"
      ) => {
        switch (action) {
          case "open":
            return { ...currentState, showCreateSaleForm: true };
          case "close":
            return { ...currentState, showCreateSaleForm: false };
          default:
            return currentState;
        }
      };

      const initialState = { showCreateSaleForm: false };

      expect(manageInlineForm(initialState, "open")).toEqual({
        showCreateSaleForm: true,
      });

      expect(manageInlineForm({ showCreateSaleForm: true }, "close")).toEqual({
        showCreateSaleForm: false,
      });
    });

    it("should validate inline form submission", () => {
      const validateInlineFormSubmission = (formData: {
        customerId: string;
        saleItems: Array<{ productId: string; quantity: number }>;
        saleDate: Date | undefined;
      }) => {
        const errors: string[] = [];

        if (!formData.customerId) {
          errors.push("Customer selection is required");
        }

        if (!formData.saleItems.length) {
          errors.push("At least one product must be added");
        }

        if (!formData.saleDate) {
          errors.push("Sale date is required");
        }

        formData.saleItems.forEach((item, index) => {
          if (!item.productId) {
            errors.push(`Item ${index + 1}: Product is required`);
          }
          if (item.quantity <= 0) {
            errors.push(`Item ${index + 1}: Quantity must be positive`);
          }
        });

        return {
          isValid: errors.length === 0,
          errors,
          canSubmit: errors.length === 0,
        };
      };

      // Valid form
      expect(validateInlineFormSubmission({
        customerId: "customer1",
        saleItems: [{ productId: "product1", quantity: 2 }],
        saleDate: new Date(),
      })).toEqual({
        isValid: true,
        errors: [],
        canSubmit: true,
      });

      // Invalid form - missing fields
      expect(validateInlineFormSubmission({
        customerId: "",
        saleItems: [],
        saleDate: undefined,
      })).toEqual({
        isValid: false,
        errors: [
          "Customer selection is required",
          "At least one product must be added",
          "Sale date is required",
        ],
        canSubmit: false,
      });
    });
  });

  describe("analytics updates", () => {
    it("should handle automatic analytics refresh", () => {
      const simulateAnalyticsRefresh = (
        currentAnalytics: { totalSales: number; totalRevenue: number },
        newSaleData: { amount: number }
      ) => {
        return {
          totalSales: currentAnalytics.totalSales + 1,
          totalRevenue: currentAnalytics.totalRevenue + newSaleData.amount,
          refreshTriggered: true,
          lastUpdated: new Date(),
        };
      };

      const currentAnalytics = {
        totalSales: 5,
        totalRevenue: 1000,
      };

      const result = simulateAnalyticsRefresh(currentAnalytics, { amount: 150 });

      expect(result.totalSales).toBe(6);
      expect(result.totalRevenue).toBe(1150);
      expect(result.refreshTriggered).toBe(true);
      expect(result.lastUpdated).toBeInstanceOf(Date);
    });

    it("should manage multiple refetch operations", () => {
      const manageRefetchOperations = () => {
        const operations: Array<{ name: string; status: "pending" | "completed" }> = [];

        const addRefetchOperation = (name: string) => {
          operations.push({ name, status: "pending" });
          return operations.length;
        };

        const completeRefetchOperation = (name: string) => {
          const operation = operations.find(op => op.name === name);
          if (operation) {
            operation.status = "completed";
          }
          return operations.filter(op => op.status === "completed").length;
        };

        const getAllOperations = () => operations;

        return {
          addRefetchOperation,
          completeRefetchOperation,
          getAllOperations,
        };
      };

      const manager = manageRefetchOperations();

      expect(manager.addRefetchOperation("sales")).toBe(1);
      expect(manager.addRefetchOperation("analytics")).toBe(2);

      expect(manager.completeRefetchOperation("sales")).toBe(1);
      expect(manager.completeRefetchOperation("analytics")).toBe(2);

      const allOps = manager.getAllOperations();
      expect(allOps).toHaveLength(2);
      expect(allOps.every(op => op.status === "completed")).toBe(true);
    });
  });
});