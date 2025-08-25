import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";

export const purchaseRouter = createTRPCRouter({
  // Create a new purchase record and update product quantity and average cost
  create: protectedProcedure
    .input(
      z.object({
        productId: z.string().min(1, "Product is required"),
        quantity: z.number().int().min(1, "Quantity must be a positive integer"),
        costPerUnit: z.number().min(0, "Cost per unit must be positive"),
        purchaseDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify that the product exists
        const existingProduct = await ctx.db.product.findUnique({
          where: { id: input.productId },
        });

        if (!existingProduct) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        // Calculate new weighted average cost
        const currentQuantity = existingProduct.quantity;
        const currentAverageCost = existingProduct.averageCost;
        const purchaseQuantity = input.quantity;
        const purchaseCostPerUnit = input.costPerUnit;

        let newAverageCost: number;
        
        if (currentQuantity === 0) {
          // If no existing stock, new average cost = purchase cost
          newAverageCost = purchaseCostPerUnit;
        } else {
          // Weighted average formula: ((currentQty * currentAvgCost) + (purchaseQty * purchaseCost)) / (currentQty + purchaseQty)
          newAverageCost = 
            ((currentQuantity * currentAverageCost) + (purchaseQuantity * purchaseCostPerUnit)) / 
            (currentQuantity + purchaseQuantity);
        }

        const newQuantity = currentQuantity + purchaseQuantity;

        // Use transaction to ensure atomicity
        const result = await ctx.db.$transaction(async (tx: Prisma.TransactionClient) => {
          // Create the purchase record
          const purchaseRecord = await tx.purchaseRecord.create({
            data: {
              productId: input.productId,
              quantity: input.quantity,
              costPerUnit: input.costPerUnit,
              ...(input.purchaseDate && { purchaseDate: input.purchaseDate }),
            },
            include: {
              product: {
                include: {
                  category: true,
                  unit: true,
                },
              },
            },
          });

          // Update the product with new quantity and average cost
          await tx.product.update({
            where: { id: input.productId },
            data: {
              quantity: newQuantity,
              averageCost: newAverageCost,
            },
          });

          return purchaseRecord;
        });

        return result;
      } catch (error: unknown) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to record purchase",
        });
      }
    }),

  // Get purchase history for a specific product
  getByProduct: protectedProcedure
    .input(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const purchases = await ctx.db.purchaseRecord.findMany({
          where: {
            productId: input.productId,
          },
          include: {
            product: {
              include: {
                category: true,
                unit: true,
              },
            },
          },
          orderBy: {
            purchaseDate: "desc",
          },
        });

        return purchases;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch purchase history",
        });
      }
    }),

  // Get all purchase records
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const purchases = await ctx.db.purchaseRecord.findMany({
        include: {
          product: {
            include: {
              category: true,
              unit: true,
            },
          },
        },
        orderBy: {
          purchaseDate: "desc",
        },
      });

      return purchases;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch all purchase history",
      });
    }
  }),
});