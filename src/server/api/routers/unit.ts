import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const unitRouter = createTRPCRouter({
  // Get all units
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const units = await ctx.db.unit.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return units;
  }),

  // Create a new unit
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Unit name is required").max(100, "Unit name too long"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const unit = await ctx.db.unit.create({
          data: {
            name: input.name,
          },
        });
        return unit;
      } catch (error: unknown) {
        if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A unit with this name already exists",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create unit",
        });
      }
    }),

  // Update an existing unit
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Unit name is required").max(100, "Unit name too long"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const unit = await ctx.db.unit.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
          },
        });
        return unit;
      } catch (error: unknown) {
        if (error && typeof error === "object" && "code" in error) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "A unit with this name already exists",
            });
          }
          if (error.code === "P2025") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Unit not found",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update unit",
        });
      }
    }),

  // Delete a unit
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if unit has associated products
        const productsCount = await ctx.db.product.count({
          where: {
            unitId: input.id,
          },
        });

        if (productsCount > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Cannot delete unit. It has ${productsCount} associated product(s).`,
          });
        }

        const unit = await ctx.db.unit.delete({
          where: {
            id: input.id,
          },
        });
        return unit;
      } catch (error: unknown) {
        if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Unit not found",
          });
        }
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete unit",
        });
      }
    }),
});