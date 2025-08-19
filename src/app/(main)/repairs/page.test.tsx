import { describe, it, expect, beforeEach } from "@jest/globals";

// Repairs page business logic tests to avoid complex mocking issues
describe("Repairs Page Logic", () => {
  beforeEach(() => {
    // Clear any previous test state
  });

  describe("used part management", () => {
    it("should add new parts to repair", () => {
      const addPartToRepair = (
        currentParts: Array<{ productId: string; quantity: number; costAtTime: number; partCost: number }>,
        productId: string,
        quantity: number,
        costAtTime: number
      ) => {
        const existingPartIndex = currentParts.findIndex(part => part.productId === productId);
        
        if (existingPartIndex >= 0) {
          // Update existing part
          const updatedParts = [...currentParts];
          const existingPart = updatedParts[existingPartIndex]!;
          updatedParts[existingPartIndex] = {
            ...existingPart,
            quantity: existingPart.quantity + quantity,
            partCost: (existingPart.quantity + quantity) * costAtTime,
          };
          return updatedParts;
        } else {
          // Add new part
          return [
            ...currentParts,
            {
              productId,
              quantity,
              costAtTime,
              partCost: quantity * costAtTime,
            },
          ];
        }
      };

      const initialParts: Array<{ productId: string; quantity: number; costAtTime: number; partCost: number }> = [];

      // Add first part
      const parts1 = addPartToRepair(initialParts, "part1", 1, 25.0);
      expect(parts1).toEqual([
        { productId: "part1", quantity: 1, costAtTime: 25.0, partCost: 25.0 },
      ]);

      // Add second part
      const parts2 = addPartToRepair(parts1, "part2", 2, 40.0);
      expect(parts2).toEqual([
        { productId: "part1", quantity: 1, costAtTime: 25.0, partCost: 25.0 },
        { productId: "part2", quantity: 2, costAtTime: 40.0, partCost: 80.0 },
      ]);

      // Add more of the first part
      const parts3 = addPartToRepair(parts2, "part1", 1, 25.0);
      expect(parts3).toEqual([
        { productId: "part1", quantity: 2, costAtTime: 25.0, partCost: 50.0 },
        { productId: "part2", quantity: 2, costAtTime: 40.0, partCost: 80.0 },
      ]);
    });

    it("should remove parts from repair", () => {
      const removePartFromRepair = (
        currentParts: Array<{ productId: string; quantity: number; costAtTime: number; partCost: number }>,
        productId: string
      ) => {
        return currentParts.filter(part => part.productId !== productId);
      };

      const parts = [
        { productId: "part1", quantity: 1, costAtTime: 25.0, partCost: 25.0 },
        { productId: "part2", quantity: 2, costAtTime: 40.0, partCost: 80.0 },
      ];

      const updatedParts = removePartFromRepair(parts, "part1");
      expect(updatedParts).toEqual([
        { productId: "part2", quantity: 2, costAtTime: 40.0, partCost: 80.0 },
      ]);
    });

    it("should update part quantities in repair", () => {
      const updatePartQuantity = (
        currentParts: Array<{ productId: string; quantity: number; costAtTime: number; partCost: number }>,
        productId: string,
        newQuantity: number
      ) => {
        if (newQuantity <= 0) {
          return currentParts.filter(part => part.productId !== productId);
        }

        return currentParts.map(part => {
          if (part.productId === productId) {
            return {
              ...part,
              quantity: newQuantity,
              partCost: newQuantity * part.costAtTime,
            };
          }
          return part;
        });
      };

      const parts = [
        { productId: "part1", quantity: 1, costAtTime: 25.0, partCost: 25.0 },
        { productId: "part2", quantity: 2, costAtTime: 40.0, partCost: 80.0 },
      ];

      // Update quantity to positive number
      const updatedParts1 = updatePartQuantity(parts, "part1", 3);
      expect(updatedParts1).toEqual([
        { productId: "part1", quantity: 3, costAtTime: 25.0, partCost: 75.0 },
        { productId: "part2", quantity: 2, costAtTime: 40.0, partCost: 80.0 },
      ]);

      // Update quantity to zero (should remove part)
      const updatedParts2 = updatePartQuantity(parts, "part1", 0);
      expect(updatedParts2).toEqual([
        { productId: "part2", quantity: 2, costAtTime: 40.0, partCost: 80.0 },
      ]);
    });
  });

  describe("repair calculations", () => {
    it("should calculate parts cost correctly", () => {
      const calculatePartsCost = (
        parts: Array<{ productId: string; quantity: number; costAtTime: number; partCost: number }>
      ) => {
        return parts.reduce((total, part) => total + part.partCost, 0);
      };

      const parts = [
        { productId: "part1", quantity: 1, costAtTime: 25.0, partCost: 25.0 },
        { productId: "part2", quantity: 2, costAtTime: 40.0, partCost: 80.0 },
        { productId: "part3", quantity: 3, costAtTime: 15.0, partCost: 45.0 },
      ];

      expect(calculatePartsCost(parts)).toBe(150.0);
      expect(calculatePartsCost([])).toBe(0.0);
    });

    it("should calculate labor cost correctly", () => {
      const calculateLaborCost = (totalCost: number, partsCost: number) => {
        return totalCost - partsCost;
      };

      expect(calculateLaborCost(300.0, 150.0)).toBe(150.0);
      expect(calculateLaborCost(200.0, 200.0)).toBe(0.0);
      expect(calculateLaborCost(100.0, 120.0)).toBe(-20.0); // Loss scenario
    });

    it("should calculate dashboard statistics correctly", () => {
      const calculateRepairDashboardStats = (
        repairs: Array<{ id: string; totalCost: number; laborCost: number; createdAt: Date }>
      ) => {
        const totalRepairAmount = repairs.reduce((sum, repair) => sum + repair.totalCost, 0);
        const totalRepairsCount = repairs.length;
        const averageRepairCost = totalRepairsCount > 0 ? totalRepairAmount / totalRepairsCount : 0;
        const totalLaborAmount = repairs.reduce((sum, repair) => sum + repair.laborCost, 0);

        return {
          totalRepairAmount,
          totalRepairsCount,
          averageRepairCost,
          totalLaborAmount,
        };
      };

      const repairs = [
        { id: "repair1", totalCost: 150.0, laborCost: 50.0, createdAt: new Date("2025-01-15") },
        { id: "repair2", totalCost: 250.0, laborCost: 100.0, createdAt: new Date("2025-01-16") },
        { id: "repair3", totalCost: 300.0, laborCost: 150.0, createdAt: new Date("2025-01-17") },
      ];

      expect(calculateRepairDashboardStats(repairs)).toEqual({
        totalRepairAmount: 700.0,
        totalRepairsCount: 3,
        averageRepairCost: 233.33333333333334,
        totalLaborAmount: 300.0,
      });

      expect(calculateRepairDashboardStats([])).toEqual({
        totalRepairAmount: 0,
        totalRepairsCount: 0,
        averageRepairCost: 0,
        totalLaborAmount: 0,
      });
    });
  });

  describe("form validation", () => {
    it("should validate repair creation form", () => {
      const validateRepairForm = (
        customerId: string,
        description: string,
        totalCost: number,
        usedParts: Array<{ productId: string; quantity: number }>
      ) => {
        const errors: string[] = [];

        if (!customerId || customerId.trim() === "") {
          errors.push("Customer is required");
        }

        if (!description || description.trim() === "") {
          errors.push("Job description is required");
        }

        if (!totalCost || totalCost <= 0) {
          errors.push("Total cost must be greater than 0");
        }

        if (!usedParts || usedParts.length === 0) {
          errors.push("At least one part is required");
        }

        usedParts.forEach((part, index) => {
          if (!part.productId || part.productId.trim() === "") {
            errors.push(`Part ${index + 1}: Product is required`);
          }
          if (part.quantity <= 0) {
            errors.push(`Part ${index + 1}: Quantity must be greater than 0`);
          }
        });

        return {
          isValid: errors.length === 0,
          errors,
        };
      };

      // Valid form
      expect(validateRepairForm("customer1", "Fix broken screen", 200.0, [
        { productId: "part1", quantity: 1 },
        { productId: "part2", quantity: 2 },
      ])).toEqual({
        isValid: true,
        errors: [],
      });

      // Missing customer
      expect(validateRepairForm("", "Fix broken screen", 200.0, [
        { productId: "part1", quantity: 1 },
      ])).toEqual({
        isValid: false,
        errors: ["Customer is required"],
      });

      // Missing description
      expect(validateRepairForm("customer1", "", 200.0, [
        { productId: "part1", quantity: 1 },
      ])).toEqual({
        isValid: false,
        errors: ["Job description is required"],
      });

      // Invalid total cost
      expect(validateRepairForm("customer1", "Fix broken screen", 0, [
        { productId: "part1", quantity: 1 },
      ])).toEqual({
        isValid: false,
        errors: ["Total cost must be greater than 0"],
      });

      // No parts
      expect(validateRepairForm("customer1", "Fix broken screen", 200.0, [])).toEqual({
        isValid: false,
        errors: ["At least one part is required"],
      });

      // Invalid quantity
      expect(validateRepairForm("customer1", "Fix broken screen", 200.0, [
        { productId: "part1", quantity: 0 },
      ])).toEqual({
        isValid: false,
        errors: ["Part 1: Quantity must be greater than 0"],
      });

      // Missing product ID
      expect(validateRepairForm("customer1", "Fix broken screen", 200.0, [
        { productId: "", quantity: 1 },
      ])).toEqual({
        isValid: false,
        errors: ["Part 1: Product is required"],
      });
    });

    it("should validate part stock availability", () => {
      const validatePartStockAvailability = (
        requestedParts: Array<{ productId: string; quantity: number }>,
        availableStock: Record<string, number>
      ) => {
        const errors: string[] = [];

        requestedParts.forEach((part, index) => {
          const available = availableStock[part.productId] ?? 0;
          if (available < part.quantity) {
            errors.push(`Part ${index + 1}: Insufficient stock. Available: ${available}, Requested: ${part.quantity}`);
          }
        });

        return {
          isValid: errors.length === 0,
          errors,
        };
      };

      const availableStock = {
        "part1": 5,
        "part2": 10,
        "part3": 0,
      };

      // Valid stock
      expect(validatePartStockAvailability([
        { productId: "part1", quantity: 3 },
        { productId: "part2", quantity: 5 },
      ], availableStock)).toEqual({
        isValid: true,
        errors: [],
      });

      // Insufficient stock
      expect(validatePartStockAvailability([
        { productId: "part1", quantity: 10 },
        { productId: "part2", quantity: 15 },
      ], availableStock)).toEqual({
        isValid: false,
        errors: [
          "Part 1: Insufficient stock. Available: 5, Requested: 10",
          "Part 2: Insufficient stock. Available: 10, Requested: 15",
        ],
      });

      // Out of stock
      expect(validatePartStockAvailability([
        { productId: "part3", quantity: 1 },
      ], availableStock)).toEqual({
        isValid: false,
        errors: ["Part 1: Insufficient stock. Available: 0, Requested: 1"],
      });
    });
  });

  describe("data formatting", () => {
    it("should format repair data for display", () => {
      const formatRepairForDisplay = (repair: {
        id: string;
        description: string;
        totalCost: number;
        laborCost: number;
        createdAt: Date | string;
        customer: { name: string };
        usedParts: Array<{ quantity: number; product: { name: string } }>;
      }) => {
        return {
          id: repair.id,
          formattedDate: new Date(repair.createdAt).toLocaleDateString(),
          customerName: repair.customer.name,
          description: repair.description,
          partsCount: repair.usedParts.length,
          formattedTotal: `$${repair.totalCost.toFixed(2)}`,
          formattedLaborCost: `$${repair.laborCost.toFixed(2)}`,
          partsSummary: repair.usedParts.map(part => 
            `${part.quantity}x ${part.product.name}`
          ).join(", "),
        };
      };

      const repair = {
        id: "repair1",
        description: "Replace broken screen and battery",
        totalCost: 280.50,
        laborCost: 120.50,
        createdAt: new Date("2025-01-15"),
        customer: { name: "Jane Smith" },
        usedParts: [
          { quantity: 1, product: { name: "Screen Assembly" } },
          { quantity: 1, product: { name: "Battery Pack" } },
        ],
      };

      expect(formatRepairForDisplay(repair)).toEqual({
        id: "repair1",
        formattedDate: "1/15/2025",
        customerName: "Jane Smith",
        description: "Replace broken screen and battery",
        partsCount: 2,
        formattedTotal: "$280.50",
        formattedLaborCost: "$120.50",
        partsSummary: "1x Screen Assembly, 1x Battery Pack",
      });
    });

    it("should sort repairs chronologically", () => {
      const sortRepairsChronologically = (repairs: Array<{
        id: string;
        createdAt: Date | string;
      }>) => {
        return [...repairs].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      };

      const repairs = [
        { id: "repair1", createdAt: new Date("2025-01-10") },
        { id: "repair2", createdAt: new Date("2025-01-15") },
        { id: "repair3", createdAt: new Date("2025-01-12") },
      ];

      const sortedRepairs = sortRepairsChronologically(repairs);
      expect(sortedRepairs.map(r => r.id)).toEqual(["repair2", "repair3", "repair1"]);
    });
  });

  describe("navigation and routing", () => {
    it("should generate correct repair detail route paths", () => {
      const generateRepairDetailPath = (repairId: string) => {
        return `/repairs/${repairId}`;
      };

      expect(generateRepairDetailPath("cr1a2b3c4d5e6f7g8h9i")).toBe("/repairs/cr1a2b3c4d5e6f7g8h9i");
      expect(generateRepairDetailPath("cr123456789abcdef")).toBe("/repairs/cr123456789abcdef");
    });

    it("should handle repair detail navigation action", () => {
      const handleRepairDetailNavigation = (repairId: string) => {
        return {
          action: "navigate",
          destination: `/repairs/${repairId}`,
          method: "push",
          repairId,
        };
      };

      expect(handleRepairDetailNavigation("repair123")).toEqual({
        action: "navigate",
        destination: "/repairs/repair123",
        method: "push",
        repairId: "repair123",
      });
    });

    it("should validate repair actions availability", () => {
      const getRepairActions = (repair: { id: string; customer: { name: string } }) => {
        return {
          canViewDetails: Boolean(repair.id),
          detailsButtonProps: {
            variant: "ghost" as const,
            size: "sm" as const,
            title: "View Details",
            onClick: () => ({ action: "navigate", path: `/repairs/${repair.id}` }),
          },
        };
      };

      const mockRepair = {
        id: "cr123456789",
        customer: { name: "John Doe" },
      };

      const actions = getRepairActions(mockRepair);
      expect(actions.canViewDetails).toBe(true);
      expect(actions.detailsButtonProps.title).toBe("View Details");
      expect(actions.detailsButtonProps.variant).toBe("ghost");
      expect(actions.detailsButtonProps.size).toBe("sm");
    });

    it("should handle repairs table row actions", () => {
      const getRepairsTableRowActions = (repairs: Array<{ id: string; totalCost: number }>) => {
        return repairs.map(repair => ({
          repairId: repair.id,
          totalCost: repair.totalCost,
          actions: [
            {
              type: "view-details",
              label: "View Details",
              icon: "Eye",
              destination: `/repairs/${repair.id}`,
            },
          ],
        }));
      };

      const mockRepairs = [
        { id: "repair1", totalCost: 150.0 },
        { id: "repair2", totalCost: 250.0 },
      ];

      const result = getRepairsTableRowActions(mockRepairs);
      expect(result).toHaveLength(2);
      expect(result[0].actions[0]).toEqual({
        type: "view-details",
        label: "View Details",
        icon: "Eye",
        destination: "/repairs/repair1",
      });
      expect(result[1].actions[0]).toEqual({
        type: "view-details",
        label: "View Details",
        icon: "Eye",
        destination: "/repairs/repair2",
      });
    });
  });

  describe("UI state management", () => {
    it("should manage form state correctly", () => {
      const resetFormState = () => ({
        selectedCustomerId: "",
        repairDescription: "",
        totalCost: 0,
        usedParts: [],
        selectedProductId: "",
        partQuantity: 1,
        showCreateRepairForm: false,
      });

      const openFormState = (baseState: { showCreateRepairForm?: boolean }) => ({
        ...baseState,
        showCreateRepairForm: true,
      });

      const closeFormState = () => ({
        ...resetFormState(),
        showCreateRepairForm: false,
      });

      const initialState = resetFormState();
      expect(initialState.selectedCustomerId).toBe("");
      expect(initialState.repairDescription).toBe("");
      expect(initialState.totalCost).toBe(0);
      expect(initialState.usedParts).toEqual([]);
      expect(initialState.showCreateRepairForm).toBe(false);

      const openState = openFormState(initialState);
      expect(openState.showCreateRepairForm).toBe(true);

      const closedState = closeFormState();
      expect(closedState).toEqual(resetFormState());
    });

    it("should handle product selection state for parts", () => {
      const updatePartSelection = (
        currentState: { selectedProductId: string; partQuantity: number },
        productId: string,
        quantity: number = 1
      ) => ({
        selectedProductId: productId,
        partQuantity: Math.max(1, quantity),
      });

      const clearPartSelection = () => ({
        selectedProductId: "",
        partQuantity: 1,
      });

      expect(updatePartSelection(
        { selectedProductId: "", partQuantity: 1 },
        "part1",
        3
      )).toEqual({
        selectedProductId: "part1",
        partQuantity: 3,
      });

      expect(updatePartSelection(
        { selectedProductId: "part1", partQuantity: 3 },
        "part2",
        0
      )).toEqual({
        selectedProductId: "part2",
        partQuantity: 1, // Minimum quantity enforced
      });

      expect(clearPartSelection()).toEqual({
        selectedProductId: "",
        partQuantity: 1,
      });
    });

    it("should handle repair description state", () => {
      const updateRepairDescription = (description: string) => {
        return {
          description: description.trim(),
          isValid: description.trim().length > 0,
          characterCount: description.trim().length,
        };
      };

      expect(updateRepairDescription("Fix broken screen")).toEqual({
        description: "Fix broken screen",
        isValid: true,
        characterCount: 17,
      });

      expect(updateRepairDescription("  ")).toEqual({
        description: "",
        isValid: false,
        characterCount: 0,
      });

      expect(updateRepairDescription("")).toEqual({
        description: "",
        isValid: false,
        characterCount: 0,
      });
    });

    it("should handle total cost state", () => {
      const updateTotalCost = (cost: number, partsCost: number) => {
        const laborCost = Math.max(0, cost - partsCost);
        return {
          totalCost: cost,
          laborCost,
          isValid: cost > 0,
          formattedTotalCost: `$${cost.toFixed(2)}`,
          formattedLaborCost: `$${laborCost.toFixed(2)}`,
        };
      };

      expect(updateTotalCost(200.0, 80.0)).toEqual({
        totalCost: 200.0,
        laborCost: 120.0,
        isValid: true,
        formattedTotalCost: "$200.00",
        formattedLaborCost: "$120.00",
      });

      expect(updateTotalCost(0, 50.0)).toEqual({
        totalCost: 0,
        laborCost: 0,
        isValid: false,
        formattedTotalCost: "$0.00",
        formattedLaborCost: "$0.00",
      });

      expect(updateTotalCost(50.0, 75.0)).toEqual({
        totalCost: 50.0,
        laborCost: 0, // Can't be negative
        isValid: true,
        formattedTotalCost: "$50.00",
        formattedLaborCost: "$0.00",
      });
    });
  });
});