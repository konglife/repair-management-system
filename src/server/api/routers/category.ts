import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const categoryRouter = createTRPCRouter({
  // Get all categories
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return categories;
  }),

  // Create a new category
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Category name is required").max(100, "Category name too long"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const category = await ctx.db.category.create({
          data: {
            name: input.name,
          },
        });
        return category;
      } catch (error: unknown) {
        if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A category with this name already exists",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create category",
        });
      }
    }),

  // Update an existing category
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Category name is required").max(100, "Category name too long"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const category = await ctx.db.category.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
          },
        });
        return category;
      } catch (error: unknown) {
        if (error && typeof error === "object" && "code" in error) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "A category with this name already exists",
            });
          }
          if (error.code === "P2025") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Category not found",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update category",
        });
      }
    }),

  // Delete a category
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if category has associated products
        const productsCount = await ctx.db.product.count({
          where: {
            categoryId: input.id,
          },
        });

        if (productsCount > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Cannot delete category. It has ${productsCount} associated product(s).`,
          });
        }

        const category = await ctx.db.category.delete({
          where: {
            id: input.id,
          },
        });
        return category;
      } catch (error: unknown) {
        if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });
        }
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete category",
        });
      }
    }),
});