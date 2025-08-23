import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const productRouter = createTRPCRouter({
  // Get all products with Category and Unit relations
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      include: {
        category: true,
        unit: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return products;
  }),

  // Get total value of all stock (sum of quantity * averageCost)
  getTotalValue: protectedProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      select: {
        quantity: true,
        averageCost: true,
      },
    });

    const totalValue = products.reduce((sum, product) => {
      return sum + (product.quantity * product.averageCost);
    }, 0);

    return totalValue;
  }),

  // Create a new product
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Product name is required").max(255, "Product name too long"),
        salePrice: z.number().min(0, "Sale price must be positive"),
        categoryId: z.string().min(1, "Category is required"),
        unitId: z.string().min(1, "Unit is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify that the category and unit exist
        const [category, unit] = await Promise.all([
          ctx.db.category.findUnique({
            where: { id: input.categoryId },
          }),
          ctx.db.unit.findUnique({
            where: { id: input.unitId },
          }),
        ]);

        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Selected category not found",
          });
        }

        if (!unit) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Selected unit not found",
          });
        }

        const product = await ctx.db.product.create({
          data: {
            name: input.name,
            salePrice: input.salePrice,
            categoryId: input.categoryId,
            unitId: input.unitId,
            // quantity and averageCost default to 0 as per schema
          },
          include: {
            category: true,
            unit: true,
          },
        });
        return product;
      } catch (error: unknown) {
        if (error instanceof TRPCError) {
          throw error;
        }
        if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A product with this name already exists",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create product",
        });
      }
    }),

  // Update an existing product
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Product name is required").max(255, "Product name too long"),
        salePrice: z.number().min(0, "Sale price must be positive"),
        categoryId: z.string().min(1, "Category is required"),
        unitId: z.string().min(1, "Unit is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify that the category and unit exist
        const [category, unit] = await Promise.all([
          ctx.db.category.findUnique({
            where: { id: input.categoryId },
          }),
          ctx.db.unit.findUnique({
            where: { id: input.unitId },
          }),
        ]);

        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Selected category not found",
          });
        }

        if (!unit) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Selected unit not found",
          });
        }

        const product = await ctx.db.product.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
            salePrice: input.salePrice,
            categoryId: input.categoryId,
            unitId: input.unitId,
          },
          include: {
            category: true,
            unit: true,
          },
        });
        return product;
      } catch (error: unknown) {
        if (error instanceof TRPCError) {
          throw error;
        }
        if (error && typeof error === "object" && "code" in error) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "A product with this name already exists",
            });
          }
          if (error.code === "P2025") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Product not found",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update product",
        });
      }
    }),
});