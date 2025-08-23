import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const settingsRouter = createTRPCRouter({
  // Get business profile
  getBusinessProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Find the first (and only) business profile
      const businessProfile = await ctx.db.businessProfile.findFirst();
      return businessProfile;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve business profile",
      });
    }
  }),

  // Create or update business profile
  createOrUpdateBusinessProfile: protectedProcedure
    .input(
      z.object({
        shopName: z.string().min(1, "Shop name is required").max(100, "Shop name too long"),
        address: z.string().max(200, "Address too long").optional(),
        phoneNumber: z.string().max(20, "Phone number too long").optional(),
        contactEmail: z.string().email("Invalid email format").max(100, "Email too long").optional(),
        logoUrl: z.string().url("Invalid URL format").max(500, "URL too long").optional(),
        lowStockThreshold: z.number().int().min(0, "Low stock threshold must be 0 or greater").max(999, "Low stock threshold too high").optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if a business profile already exists
        const existingProfile = await ctx.db.businessProfile.findFirst();
        
        if (existingProfile) {
          // Update existing profile
          const updatedProfile = await ctx.db.businessProfile.update({
            where: { id: existingProfile.id },
            data: {
              shopName: input.shopName,
              address: input.address || null,
              phoneNumber: input.phoneNumber || null,
              contactEmail: input.contactEmail || null,
              logoUrl: input.logoUrl || null,
              lowStockThreshold: input.lowStockThreshold ?? existingProfile.lowStockThreshold,
            },
          });
          return updatedProfile;
        } else {
          // Create new profile
          const newProfile = await ctx.db.businessProfile.create({
            data: {
              shopName: input.shopName,
              address: input.address || null,
              phoneNumber: input.phoneNumber || null,
              contactEmail: input.contactEmail || null,
              logoUrl: input.logoUrl || null,
              lowStockThreshold: input.lowStockThreshold ?? 5, // Default to 5 if not provided
            },
          });
          return newProfile;
        }
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save business profile",
        });
      }
    }),
});