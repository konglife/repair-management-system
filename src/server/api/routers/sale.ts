import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const saleRouter = createTRPCRouter({
  // Get all sales with related data for sales history
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const sales = await ctx.db.sale.findMany({
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

  // Create a new sale with stock deduction
  create: protectedProcedure
    .input(
      z.object({
        customerId: z.string().cuid(),
        items: z.array(
          z.object({
            productId: z.string().cuid(),
            quantity: z.number().int().positive(),
          })
        ).min(1, "At least one item is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Use Prisma transaction to ensure atomicity
      const sale = await ctx.db.$transaction(async (tx) => {
        // First, validate all products exist and have sufficient stock
        const products = await tx.product.findMany({
          where: {
            id: { in: input.items.map((item) => item.productId) },
          },
        });

        // Check if all products exist
        if (products.length !== input.items.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "One or more products not found",
          });
        }

        // Check stock availability for each product
        for (const item of input.items) {
          const product = products.find((p) => p.id === item.productId);
          if (!product) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Product with id ${item.productId} not found`,
            });
          }
          if (product.quantity < item.quantity) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`,
            });
          }
        }

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
          const product = products.find((p) => p.id === item.productId)!;
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

        // Deduct stock quantities
        for (const item of input.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        }

        return newSale;
      });

      return sale;
    }),
});