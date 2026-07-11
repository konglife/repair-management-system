import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";
import { validateAndDeductStock } from "~/server/stock";
import { DATE_RANGE_VALUES, parseDateRange } from "~/server/dates";

// Type interfaces for database operations
interface Sale {
  totalAmount: number;
  saleItems: SaleItem[];
}

interface SaleItem {
  quantity: number;
  productId: string;
  product: {
    name: string;
  };
}

export const saleRouter = createTRPCRouter({
  // Get all sales with related data for sales history
  getAll: protectedProcedure
    .input(
      z
        .object({
          dateRange: z.enum(DATE_RANGE_VALUES).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      // Calculate date range filter
      const dateFilter = parseDateRange(input?.dateRange);

      const sales = await ctx.db.sale.findMany({
        where: dateFilter
          ? {
              createdAt: dateFilter,
            }
          : undefined,
        include: {
          customer: true,
          saleItems: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc", // Newest sales first
        },
      });
      return sales;
    }),

  // Get sale by ID with complete details for sale detail view
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid("Invalid sale ID format"),
      })
    )
    .query(async ({ ctx, input }) => {
      const sale = await ctx.db.sale.findUnique({
        where: { id: input.id },
        include: {
          customer: true,
          saleItems: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!sale) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sale not found",
        });
      }

      // Calculate gross profit (totalAmount - totalCost)
      const grossProfit = sale.totalAmount - sale.totalCost;

      return {
        ...sale,
        grossProfit,
      };
    }),

  // Create a new sale with stock deduction
  create: protectedProcedure
    .input(
      z.object({
        customerId: z.string().cuid(),
        items: z
          .array(
            z.object({
              productId: z.string().cuid(),
              quantity: z.number().int().positive(),
            })
          )
          .min(1, "At least one item is required"),
        saleDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Use Prisma transaction to ensure atomicity
      const sale = await ctx.db.$transaction(
        async (tx: Prisma.TransactionClient) => {
          // Validate products + deduct stock (รวมใน module เดียว — เคยซ้ำกับ repair.create)
          const products = await validateAndDeductStock(tx, input.items);

          // Validate customer exists
          const customer = await tx.customer.findUnique({
            where: { id: input.customerId },
          });
          if (!customer) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Customer not found",
            });
          }

          // Calculate totals
          let totalAmount = 0;
          let totalCost = 0;

          const saleItemsData = input.items.map((item) => {
            const product = products.get(item.productId)!;
            const itemTotal = product.salePrice * item.quantity;
            const itemCost = product.averageCost * item.quantity;

            totalAmount += itemTotal;
            totalCost += itemCost;

            return {
              productId: item.productId,
              quantity: item.quantity,
              priceAtTime: product.salePrice,
              costAtTime: product.averageCost,
            };
          });

          // Create the sale record
          const newSale = await tx.sale.create({
            data: {
              customerId: input.customerId,
              totalAmount,
              totalCost,
              createdAt: input.saleDate,
              saleItems: {
                create: saleItemsData,
              },
            },
            include: {
              customer: true,
              saleItems: {
                include: {
                  product: true,
                },
              },
            },
          });

          return newSale;
        }
      );

      return sale;
    }),

  // Get sales analytics with date filtering
  getAnalytics: protectedProcedure
    .input(
      z
        .object({
          dateRange: z.enum(DATE_RANGE_VALUES).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      // Calculate date range filter (same logic as getAll)
      const dateFilter = parseDateRange(input?.dateRange);

      // Get sales data for analytics calculations
      const sales = await ctx.db.sale.findMany({
        where: dateFilter
          ? {
              createdAt: dateFilter,
            }
          : undefined,
        include: {
          saleItems: {
            include: {
              product: true,
            },
          },
        },
      });

      // Calculate analytics
      const totalSales = sales.length;
      const totalRevenue = sales.reduce(
        (sum: number, sale: Sale) => sum + sale.totalAmount,
        0
      );
      const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Calculate top selling product
      const productSalesMap = new Map<
        string,
        { name: string; quantity: number }
      >();
      sales.forEach((sale: Sale) => {
        sale.saleItems.forEach((item: SaleItem) => {
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

      const topSellingProduct =
        productSalesMap.size > 0
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
    }),
});
