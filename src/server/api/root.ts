import { createTRPCRouter } from "~/server/api/trpc";
import { categoryRouter } from "~/server/api/routers/category";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  categories: categoryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;