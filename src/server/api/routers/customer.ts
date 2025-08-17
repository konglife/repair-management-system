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
});