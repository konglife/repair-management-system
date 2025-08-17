import { createTRPCRouter } from "~/server/api/trpc";
import { categoryRouter } from "~/server/api/routers/category";
import { unitRouter } from "~/server/api/routers/unit";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  categories: categoryRouter,
  units: unitRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;