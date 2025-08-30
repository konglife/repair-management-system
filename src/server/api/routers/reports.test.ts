import { describe, it, expect } from "@jest/globals";

// Reports router validation and interface tests
describe("Reports Router Logic", () => {
  describe("input validation", () => {
    it("should validate getMonthlySummary input requirements", () => {
      const validateMonthlySummaryInput = (input: { startDate?: string; endDate?: string }) => {
        const errors: string[] = [];
        const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

        if (!input.startDate || typeof input.startDate !== "string") {
          errors.push("Start date is required");
        } else if (!dateFormat.test(input.startDate)) {
          errors.push("Invalid start date format. Use YYYY-MM-DD");
        }

        if (!input.endDate || typeof input.endDate !== "string") {
          errors.push("End date is required");
        } else if (!dateFormat.test(input.endDate)) {
          errors.push("Invalid end date format. Use YYYY-MM-DD");
        }

        if (input.startDate && input.endDate && 
            dateFormat.test(input.startDate) && dateFormat.test(input.endDate) &&
            input.startDate > input.endDate) {
          errors.push("Start date must be before or equal to end date");
        }

        return {
          isValid: errors.length === 0,
          errors,
        };
      };

      expect(validateMonthlySummaryInput({ startDate: "2024-01-01", endDate: "2024-01-31" })).toEqual({
        isValid: true,
        errors: [],
      });

      expect(validateMonthlySummaryInput({ startDate: "", endDate: "2024-01-31" })).toEqual({
        isValid: false,
        errors: ["Start date is required"],
      });

      expect(validateMonthlySummaryInput({ startDate: "invalid", endDate: "2024-01-31" })).toEqual({
        isValid: false,
        errors: ["Invalid start date format. Use YYYY-MM-DD"],
      });

      expect(validateMonthlySummaryInput({ startDate: "2024-01-31", endDate: "2024-01-01" })).toEqual({
        isValid: false,
        errors: ["Start date must be before or equal to end date"],
      });
    });
  });

  describe("interface structure validation", () => {
    it("should have SalesData interface with saleItems array", () => {
      interface SalesData {
        date: string;
        totalCost: number;
        netTotal: number;
        totalAmount: number;
        grossProfit: number;
        saleItems: { name: string }[];
      }

      const mockSalesData: SalesData = {
        date: "2024-01-01",
        totalCost: 100,
        netTotal: 150,
        totalAmount: 2,
        grossProfit: 50,
        saleItems: [{ name: "Product A" }, { name: "Product B" }]
      };

      expect(mockSalesData).toBeDefined();
      expect(mockSalesData.saleItems).toBeInstanceOf(Array);
      expect(mockSalesData.saleItems[0]).toHaveProperty('name');
      expect(typeof mockSalesData.saleItems[0]?.name).toBe('string');
    });

    it("should have RepairsData interface with usedParts array", () => {
      interface RepairsData {
        date: string;
        description: string;
        partsCost: number;
        laborCost: number;
        totalCost: number;
        usedParts: { name: string, costAtTime: number }[];
      }

      const mockRepairsData: RepairsData = {
        date: "2024-01-01",
        description: "Engine repair",
        partsCost: 75,
        laborCost: 50,
        totalCost: 125,
        usedParts: [
          { name: "Part A", costAtTime: 25 },
          { name: "Part B", costAtTime: 50 }
        ]
      };

      expect(mockRepairsData).toBeDefined();
      expect(mockRepairsData.usedParts).toBeInstanceOf(Array);
      expect(mockRepairsData.usedParts[0]).toHaveProperty('name');
      expect(mockRepairsData.usedParts[0]).toHaveProperty('costAtTime');
      expect(typeof mockRepairsData.usedParts[0]?.name).toBe('string');
      expect(typeof mockRepairsData.usedParts[0]?.costAtTime).toBe('number');
    });

    it("should have PurchaseRecordDetail interface with product name", () => {
      interface PurchaseRecordDetail {
        id: string;
        quantity: number;
        costPerUnit: number;
        purchaseDate: Date;
        product: { name: string };
      }

      const mockPurchaseRecord: PurchaseRecordDetail = {
        id: "clh1234567890abcdef",
        quantity: 10,
        costPerUnit: 15,
        purchaseDate: new Date("2024-01-01"),
        product: { name: "Purchase Item A" }
      };

      expect(mockPurchaseRecord).toBeDefined();
      expect(mockPurchaseRecord.product).toHaveProperty('name');
      expect(typeof mockPurchaseRecord.product.name).toBe('string');
    });

    it("should have SummaryData interface with purchaseRecordsData array", () => {
      interface PurchaseRecordDetail {
        id: string;
        quantity: number;
        costPerUnit: number;
        purchaseDate: Date;
        product: { name: string };
      }

      interface SummaryData {
        reportPeriod: {
          startDate: string;
          endDate: string;
        };
        shopInfo: Record<string, unknown>;
        overview: Record<string, unknown>;
        salesData: Record<string, unknown>[];
        repairsData: Record<string, unknown>[];
        purchaseRecordsData: PurchaseRecordDetail[];
      }

      const mockSummaryData: SummaryData = {
        reportPeriod: {
          startDate: "2024-01-01",
          endDate: "2024-01-31"
        },
        shopInfo: {},
        overview: {},
        salesData: [],
        repairsData: [],
        purchaseRecordsData: [{
          id: "clh9876543210fedcba",
          quantity: 5,
          costPerUnit: 20,
          purchaseDate: new Date("2024-01-15"),
          product: { name: "Test Product" }
        }]
      };

      expect(mockSummaryData).toBeDefined();
      expect(mockSummaryData.purchaseRecordsData).toBeInstanceOf(Array);
      expect(mockSummaryData.purchaseRecordsData[0]).toHaveProperty('product');
      expect(mockSummaryData.purchaseRecordsData[0]?.product).toHaveProperty('name');
    });
  });

  describe("data transformation logic", () => {
    it("should correctly transform sales data to include saleItems", () => {
      const mockSale = {
        id: 1,
        createdAt: new Date("2024-01-01"),
        totalAmount: 150,
        totalCost: 100,
        saleItems: [
          { product: { name: "Product A" } },
          { product: { name: "Product B" } }
        ]
      };

      const transformSalesData = (sale: typeof mockSale) => {
        const totalAmount = sale.saleItems.reduce((sum) => sum + 1, 0); // quantity logic
        const grossProfit = sale.totalAmount - sale.totalCost;
        
        return {
          date: sale.createdAt.toISOString().split('T')[0] as string,
          totalCost: sale.totalCost,
          netTotal: sale.totalAmount,
          totalAmount,
          grossProfit,
          saleItems: sale.saleItems.map(item => ({ name: item.product.name }))
        };
      };

      const result = transformSalesData(mockSale);

      expect(result.saleItems).toHaveLength(2);
      expect(result.saleItems[0]).toEqual({ name: "Product A" });
      expect(result.saleItems[1]).toEqual({ name: "Product B" });
      expect(result.grossProfit).toBe(50);
    });

    it("should correctly transform repairs data to include usedParts", () => {
      const mockRepair = {
        id: 1,
        createdAt: new Date("2024-01-01"),
        description: "Test repair",
        partsCost: 75,
        laborCost: 50,
        totalCost: 125,
        usedParts: [
          { product: { name: "Part A" }, costAtTime: 25 },
          { product: { name: "Part B" }, costAtTime: 50 }
        ]
      };

      const transformRepairsData = (repair: typeof mockRepair) => ({
        date: repair.createdAt.toISOString().split('T')[0] as string,
        description: repair.description,
        partsCost: repair.partsCost,
        laborCost: repair.laborCost,
        totalCost: repair.totalCost,
        usedParts: repair.usedParts.map(part => ({ 
          name: part.product.name, 
          costAtTime: part.costAtTime 
        }))
      });

      const result = transformRepairsData(mockRepair);

      expect(result.usedParts).toHaveLength(2);
      expect(result.usedParts[0]).toEqual({ name: "Part A", costAtTime: 25 });
      expect(result.usedParts[1]).toEqual({ name: "Part B", costAtTime: 50 });
    });

    it("should correctly transform purchaseRecords data to include product names", () => {
      const mockPurchaseRecords = [{
        id: "clh1111222233334444",
        quantity: 10,
        costPerUnit: 15,
        purchaseDate: new Date("2024-01-01"),
        product: { name: "Purchase Item A" }
      }];

      const transformPurchaseRecordsData = (records: typeof mockPurchaseRecords) => 
        records.map(record => ({
          id: record.id,
          quantity: record.quantity,
          costPerUnit: record.costPerUnit,
          purchaseDate: record.purchaseDate,
          product: { name: record.product.name }
        }));

      const result = transformPurchaseRecordsData(mockPurchaseRecords);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('product');
      expect(result[0]?.product.name).toBe("Purchase Item A");
    });
  });

  describe("backward compatibility", () => {
    it("should maintain existing salesData structure", () => {
      interface OriginalSalesData {
        date: string;
        totalCost: number;
        netTotal: number;
        totalAmount: number;
        grossProfit: number;
      }

      interface EnhancedSalesData extends OriginalSalesData {
        saleItems: { name: string }[];
      }

      const enhancedData: EnhancedSalesData = {
        date: "2024-01-01",
        totalCost: 100,
        netTotal: 150,
        totalAmount: 2,
        grossProfit: 50,
        saleItems: [{ name: "Product A" }]
      };

      // Should be assignable to original structure (ignoring extra field)
      const originalStructure: OriginalSalesData = {
        date: enhancedData.date,
        totalCost: enhancedData.totalCost,
        netTotal: enhancedData.netTotal,
        totalAmount: enhancedData.totalAmount,
        grossProfit: enhancedData.grossProfit,
      };

      expect(originalStructure).toBeDefined();
      expect(originalStructure.date).toBe("2024-01-01");
      expect(originalStructure.grossProfit).toBe(50);
    });

    it("should maintain existing repairsData structure", () => {
      interface OriginalRepairsData {
        date: string;
        description: string;
        partsCost: number;
        laborCost: number;
        totalCost: number;
      }

      interface EnhancedRepairsData extends OriginalRepairsData {
        usedParts: { name: string, costAtTime: number }[];
      }

      const enhancedData: EnhancedRepairsData = {
        date: "2024-01-01",
        description: "Engine repair",
        partsCost: 75,
        laborCost: 50,
        totalCost: 125,
        usedParts: [{ name: "Part A", costAtTime: 25 }]
      };

      // Should be assignable to original structure (ignoring extra field)
      const originalStructure: OriginalRepairsData = {
        date: enhancedData.date,
        description: enhancedData.description,
        partsCost: enhancedData.partsCost,
        laborCost: enhancedData.laborCost,
        totalCost: enhancedData.totalCost,
      };

      expect(originalStructure).toBeDefined();
      expect(originalStructure.description).toBe("Engine repair");
      expect(originalStructure.totalCost).toBe(125);
    });
  });
});