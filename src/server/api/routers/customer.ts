import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const customerRouter = createTRPCRouter({
  // Get all customers
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const customers = await ctx.db.customer.findMany({
      orderBy: {
        createdAt: "desc", // Most recent customers first
      },
    });
    return customers;
  }),

  // Create a new customer
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Customer name is required").max(100, "Customer name too long"),
        phone: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const customer = await ctx.db.customer.create({
          data: {
            name: input.name,
            phone: input.phone || null,
            address: input.address || null,
          },
        });
        return customer;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create customer",
        });
      }
    }),

  // Update existing customer
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(1, "Customer name is required").max(100, "Customer name too long"),
        phone: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const customer = await ctx.db.customer.update({
          where: { id: input.id },
          data: {
            name: input.name,
            phone: input.phone || null,
            address: input.address || null,
          },
        });
        return customer;
      } catch (error) {
        // Check if customer doesn't exist
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Customer not found",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update customer",
        });
      }
    }),

  // Get customer transaction history
  getTransactionHistory: protectedProcedure
    .input(
      z.object({
        customerId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const customer = await ctx.db.customer.findUnique({
          where: { id: input.customerId },
          include: {
            sales: {
              include: { saleItems: true },
              orderBy: { createdAt: "desc" },
            },
            repairs: {
              include: { usedParts: true },
              orderBy: { createdAt: "desc" },
            },
          },
        });

        if (!customer) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Customer not found",
          });
        }

        return customer;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve customer transaction history",
        });
      }
    }),
});