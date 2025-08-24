import { createTRPCRouter } from "~/server/api/trpc";
import { categoryRouter } from "~/server/api/routers/category";
import { unitRouter } from "~/server/api/routers/unit";
import { productRouter } from "~/server/api/routers/product";
import { purchaseRouter } from "~/server/api/routers/purchase";
import { customerRouter } from "~/server/api/routers/customer";
import { saleRouter } from "~/server/api/routers/sale";
import { repairRouter } from "~/server/api/routers/repair";
import { dashboardRouter } from "~/server/api/routers/dashboard";
import { settingsRouter } from "~/server/api/routers/settings";
import { reportsRouter } from "~/server/api/routers/reports";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  categories: categoryRouter,
  units: unitRouter,
  products: productRouter,
  purchases: purchaseRouter,
  customers: customerRouter,
  sales: saleRouter,
  repairs: repairRouter,
  dashboard: dashboardRouter,
  settings: settingsRouter,
  reports: reportsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;