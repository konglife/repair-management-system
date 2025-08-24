import { type inferProcedureInput } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type AppRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { reportsRouter } from "./reports";
import type { PrismaClient } from "@prisma/client";
import { mockDeep } from "vitest-mock-extended";
import { Decimal } from "@prisma/client/runtime/library";

// Mock the PDF generator
vi.mock("~/lib/pdf-generator", () => ({
  generateSalesReportPDF: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])),
  generateRepairsReportPDF: vi.fn().mockResolvedValue(new Uint8Array([5, 6, 7, 8])),
  PDFGeneratorError: class PDFGeneratorError extends Error {
    constructor(message: string, public cause?: Error) {
      super(message);
      this.name = 'PDFGeneratorError';
    }
  },
}));

// Mock Prisma
const mockDb = mockDeep<PrismaClient>();

const createCaller = () => {
  const ctx = createInnerTRPCContext({
    db: mockDb,
  });
  
  return reportsRouter.createCaller(ctx);
};

describe("Reports Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.businessProfile.findFirst.mockReset();
    mockDb.sale.findMany.mockReset();
    mockDb.repair.findMany.mockReset();
  });

  describe("generateSalesReport", () => {
    const validInput: inferProcedureInput<AppRouter["reports"]["generateSalesReport"]> = {
      month: 3,
      year: 2024,
    };

    it("should generate sales report successfully with data", async () => {
      const caller = createCaller();

      // Mock business profile
      mockDb.businessProfile.findFirst.mockResolvedValue({
        id: "business-1",
        shopName: "Test Shop",
        address: "123 Test St",
        phoneNumber: "(555) 123-4567",
        contactEmail: "test@shop.com",
        logoUrl: null,
        lowStockThreshold: 5,
      });

      // Mock sales data
      mockDb.sale.findMany.mockResolvedValue([
        {
          id: "sale-1",
          customerId: "customer-1",
          total: new Decimal(150.00),
          createdAt: new Date("2024-03-15T10:00:00Z"),
          updatedAt: new Date("2024-03-15T10:00:00Z"),
          customer: {
            firstName: "John",
            lastName: "Doe",
          },
          saleItems: [
            {
              id: "item-1",
              saleId: "sale-1",
              productId: "product-1",
              quantity: 2,
              unitPrice: new Decimal(25.00),
              total: new Decimal(50.00),
              product: {
                name: "Screen Protector",
              },
            },
            {
              id: "item-2",
              saleId: "sale-1",
              productId: "product-2",
              quantity: 1,
              unitPrice: new Decimal(100.00),
              total: new Decimal(100.00),
              product: {
                name: "Phone Case",
              },
            },
          ],
        },
      ]);

      const result = await caller.generateSalesReport(validInput);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.filename).toBe("sales-report-2024-03.pdf");
      expect(result.totalTransactions).toBe(1);
      expect(result.totalRevenue).toBe(150.00);

      // Verify database queries
      expect(mockDb.businessProfile.findFirst).toHaveBeenCalledTimes(1);
      expect(mockDb.sale.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: new Date(2024, 2, 1), // March 1, 2024
            lte: new Date(2024, 3, 0, 23, 59, 59, 999), // March 31, 2024 end of day
          },
        },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          saleItems: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it("should generate sales report with empty data", async () => {
      const caller = createCaller();

      mockDb.businessProfile.findFirst.mockResolvedValue({
        id: "business-1",
        shopName: "Test Shop",
        address: null,
        phoneNumber: null,
        contactEmail: null,
        logoUrl: null,
        lowStockThreshold: 5,
      });

      mockDb.sale.findMany.mockResolvedValue([]);

      const result = await caller.generateSalesReport(validInput);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.totalTransactions).toBe(0);
      expect(result.totalRevenue).toBe(0);
    });

    it("should handle missing business profile", async () => {
      const caller = createCaller();

      mockDb.businessProfile.findFirst.mockResolvedValue(null);
      mockDb.sale.findMany.mockResolvedValue([]);

      const result = await caller.generateSalesReport(validInput);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should validate input parameters", async () => {
      const caller = createCaller();

      const invalidInputs = [
        { month: 0, year: 2024 },
        { month: 13, year: 2024 },
        { month: 3, year: 1999 },
        { month: 3, year: 2101 },
      ];

      for (const invalidInput of invalidInputs) {
        await expect(caller.generateSalesReport(invalidInput)).rejects.toThrow();
      }
    });

    it("should handle database errors", async () => {
      const caller = createCaller();

      mockDb.businessProfile.findFirst.mockRejectedValue(new Error("Database connection failed"));

      await expect(caller.generateSalesReport(validInput)).rejects.toThrow();
    });
  });

  describe("generateRepairsReport", () => {
    const validInput: inferProcedureInput<AppRouter["reports"]["generateRepairsReport"]> = {
      month: 3,
      year: 2024,
    };

    it("should generate repairs report successfully with data", async () => {
      const caller = createCaller();

      mockDb.businessProfile.findFirst.mockResolvedValue({
        id: "business-1",
        shopName: "Test Shop",
        address: "123 Test St",
        phoneNumber: "(555) 123-4567",
        contactEmail: "test@shop.com",
        logoUrl: null,
        lowStockThreshold: 5,
      });

      mockDb.repair.findMany.mockResolvedValue([
        {
          id: "repair-1",
          customerId: "customer-1",
          deviceType: "iPhone",
          deviceModel: "12",
          problemDescription: "Broken screen",
          repairCost: new Decimal(200.00),
          status: "completed",
          createdAt: new Date("2024-03-15T10:00:00Z"),
          updatedAt: new Date("2024-03-15T10:00:00Z"),
          customer: {
            firstName: "Jane",
            lastName: "Smith",
          },
          usedParts: [
            {
              id: "part-1",
              repairId: "repair-1",
              productId: "product-1",
              quantity: 1,
              costPerUnit: new Decimal(75.00),
              product: {
                name: "iPhone 12 Screen",
              },
            },
          ],
        },
      ]);

      const result = await caller.generateRepairsReport(validInput);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.filename).toBe("repairs-report-2024-03.pdf");
      expect(result.totalRepairs).toBe(1);
      expect(result.totalRevenue).toBe(200.00);
      expect(result.totalPartsCost).toBe(75.00);
      expect(result.grossProfit).toBe(125.00);

      // Verify database queries
      expect(mockDb.businessProfile.findFirst).toHaveBeenCalledTimes(1);
      expect(mockDb.repair.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: new Date(2024, 2, 1),
            lte: new Date(2024, 3, 0, 23, 59, 59, 999),
          },
        },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          usedParts: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it("should generate repairs report with empty data", async () => {
      const caller = createCaller();

      mockDb.businessProfile.findFirst.mockResolvedValue({
        id: "business-1",
        shopName: "Test Shop",
        address: null,
        phoneNumber: null,
        contactEmail: null,
        logoUrl: null,
        lowStockThreshold: 5,
      });

      mockDb.repair.findMany.mockResolvedValue([]);

      const result = await caller.generateRepairsReport(validInput);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.totalRepairs).toBe(0);
      expect(result.totalRevenue).toBe(0);
      expect(result.totalPartsCost).toBe(0);
      expect(result.grossProfit).toBe(0);
    });

    it("should calculate costs correctly with multiple repairs and parts", async () => {
      const caller = createCaller();

      mockDb.businessProfile.findFirst.mockResolvedValue(null);

      mockDb.repair.findMany.mockResolvedValue([
        {
          id: "repair-1",
          customerId: "customer-1",
          deviceType: "iPhone",
          deviceModel: "12",
          problemDescription: "Broken screen",
          repairCost: new Decimal(200.00),
          status: "completed",
          createdAt: new Date("2024-03-15T10:00:00Z"),
          updatedAt: new Date("2024-03-15T10:00:00Z"),
          customer: null,
          usedParts: [
            {
              id: "part-1",
              repairId: "repair-1",
              productId: "product-1",
              quantity: 1,
              costPerUnit: new Decimal(75.00),
              product: { name: "iPhone 12 Screen" },
            },
            {
              id: "part-2",
              repairId: "repair-1",
              productId: "product-2",
              quantity: 2,
              costPerUnit: new Decimal(10.00),
              product: { name: "Screws" },
            },
          ],
        },
        {
          id: "repair-2",
          customerId: "customer-2",
          deviceType: "Samsung",
          deviceModel: null,
          problemDescription: "Battery replacement",
          repairCost: new Decimal(150.00),
          status: "in-progress",
          createdAt: new Date("2024-03-20T14:00:00Z"),
          updatedAt: new Date("2024-03-20T14:00:00Z"),
          customer: {
            firstName: "Bob",
            lastName: "Johnson",
          },
          usedParts: [
            {
              id: "part-3",
              repairId: "repair-2",
              productId: "product-3",
              quantity: 1,
              costPerUnit: new Decimal(50.00),
              product: { name: "Samsung Battery" },
            },
          ],
        },
      ]);

      const result = await caller.generateRepairsReport(validInput);

      expect(result.success).toBe(true);
      expect(result.totalRepairs).toBe(2);
      expect(result.totalRevenue).toBe(350.00); // 200 + 150
      expect(result.totalPartsCost).toBe(145.00); // (75 + 10*2) + 50 = 95 + 50
      expect(result.grossProfit).toBe(205.00); // 350 - 145
    });

    it("should validate input parameters", async () => {
      const caller = createCaller();

      const invalidInputs = [
        { month: 0, year: 2024 },
        { month: 13, year: 2024 },
        { month: 3, year: 1999 },
        { month: 3, year: 2101 },
      ];

      for (const invalidInput of invalidInputs) {
        await expect(caller.generateRepairsReport(invalidInput)).rejects.toThrow();
      }
    });
  });
});