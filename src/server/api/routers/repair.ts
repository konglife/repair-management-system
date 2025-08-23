import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const repairRouter = createTRPCRouter({
  // Get all repairs with related data for repair history
  getAll: protectedProcedure
    .input(
      z.object({
        dateRange: z.enum(["today", "7days", "1month"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      // Calculate date range filter
      let dateFilter = undefined;
      if (input?.dateRange) {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (input.dateRange) {
          case "today":
            dateFilter = {
              gte: startOfDay,
            };
            break;
          case "7days":
            const sevenDaysAgo = new Date(startOfDay);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            dateFilter = {
              gte: sevenDaysAgo,
            };
            break;
          case "1month":
            const oneMonthAgo = new Date(startOfDay);
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            dateFilter = {
              gte: oneMonthAgo,
            };
            break;
        }
      }
      const repairs = await ctx.db.repair.findMany({
        where: dateFilter ? {
          createdAt: dateFilter,
        } : undefined,
        include: {
          customer: true,
          usedParts: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc", // Newest repairs first
        },
      });
      return repairs;
    }),

  // Get single repair by ID with full details
  getById: protectedProcedure
    .input(z.object({
      id: z.string().cuid("Invalid repair ID"),
    }))
    .query(async ({ ctx, input }) => {
      const repair = await ctx.db.repair.findUnique({
        where: { id: input.id },
        include: {
          customer: true,
          usedParts: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!repair) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Repair not found",
        });
      }

      return repair;
    }),

  // Create a new repair with stock deduction
  create: protectedProcedure
    .input(
      z.object({
        customerId: z.string().cuid("Invalid customer ID"),
        description: z.string().min(1, "Job description is required"),
        totalCost: z.number().positive("Total cost must be positive"),
        usedParts: z.array(
          z.object({
            productId: z.string().cuid("Invalid product ID"),
            quantity: z.number().int().positive("Quantity must be positive"),
          })
        ).min(1, "At least one part is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Use Prisma transaction to ensure atomicity
      const repair = await ctx.db.$transaction(async (tx) => {
        // First, validate all products exist and have sufficient stock
        const products = await tx.product.findMany({
          where: {
            id: { in: input.usedParts.map((part) => part.productId) },
          },
        });

        // Check if all products exist
        if (products.length !== input.usedParts.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "One or more products not found",
          });
        }

        // Check stock availability for each part
        for (const part of input.usedParts) {
          const product = products.find((p) => p.id === part.productId);
          if (!product) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Product with id ${part.productId} not found`,
            });
          }
          if (product.quantity < part.quantity) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${part.quantity}`,
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

        // Calculate parts cost from used parts
        let partsCost = 0;

        const usedPartsData = input.usedParts.map((part) => {
          const product = products.find((p) => p.id === part.productId)!;
          const partCost = product.averageCost * part.quantity;
          partsCost += partCost;

          return {
            productId: part.productId,
            quantity: part.quantity,
            costAtTime: product.averageCost,
          };
        });

        // Calculate labor cost (total cost - parts cost)
        const laborCost = input.totalCost - partsCost;

        // Create the repair record
        const newRepair = await tx.repair.create({
          data: {
            customerId: input.customerId,
            description: input.description,
            totalCost: input.totalCost,
            partsCost,
            laborCost,
            usedParts: {
              create: usedPartsData,
            },
          },
          include: {
            customer: true,
            usedParts: {
              include: {
                product: true,
              },
            },
          },
        });

        // Deduct stock quantities
        for (const part of input.usedParts) {
          await tx.product.update({
            where: { id: part.productId },
            data: {
              quantity: {
                decrement: part.quantity,
              },
            },
          });
        }

        return newRepair;
      });

      return repair;
    }),

  // Get repairs analytics with date filtering
  getAnalytics: protectedProcedure
    .input(
      z.object({
        dateRange: z.enum(["today", "7days", "1month"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      // Calculate date range filter (same logic as getAll)
      let dateFilter = undefined;
      if (input?.dateRange) {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (input.dateRange) {
          case "today":
            dateFilter = {
              gte: startOfDay,
            };
            break;
          case "7days":
            const sevenDaysAgo = new Date(startOfDay);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            dateFilter = {
              gte: sevenDaysAgo,
            };
            break;
          case "1month":
            const oneMonthAgo = new Date(startOfDay);
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            dateFilter = {
              gte: oneMonthAgo,
            };
            break;
        }
      }

      // Get repairs data for analytics calculations
      const repairs = await ctx.db.repair.findMany({
        where: dateFilter ? {
          createdAt: dateFilter,
        } : undefined,
        include: {
          usedParts: {
            include: {
              product: true,
            },
          },
        },
      });

      // Calculate analytics
      const totalRepairs = repairs.length;
      const totalRevenue = repairs.reduce((sum, repair) => sum + repair.totalCost, 0);
      const averageRepairCost = totalRepairs > 0 ? totalRevenue / totalRepairs : 0;
      const totalLaborRevenue = repairs.reduce((sum, repair) => sum + repair.laborCost, 0);
      const totalPartsCost = repairs.reduce((sum, repair) => sum + repair.partsCost, 0);

      return {
        totalRepairs,
        totalRevenue,
        averageRepairCost,
        totalLaborRevenue,
        totalPartsCost,
      };
    }),
});