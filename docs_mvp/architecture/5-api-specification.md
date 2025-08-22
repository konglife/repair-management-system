# 5\. API Specification

Since we have chosen to use **tRPC**, a modern technology, we don't need to create traditional API documentation (like OpenAPI or Swagger). Instead, we will define what are called **"Routers,"** which are groups of Backend functions categorized to make them easy for the Frontend to call.

Our approach is to create a main router (`appRouter`) that will aggregate the sub-routers for each feature. The structure will look like this:

### tRPC Router Definitions

We will organize our API according to the data model groups we designed. Here is the code structure that will serve as the blueprint for our API:

```typescript
import { initTRPC } from '@trpc/server';
import { z } from 'zod'; // Zod is a library used for input validation

const t = initTRPC.create();

// =================================================================
// Sub-routers for managing each data entity
// =================================================================

const categoryRouter = t.router({
  // Ex: Function to fetch all categories
  getAll: t.procedure.query(() => {
    // ... code to fetch Categories from the database
  }),
  // ... other CRUD functions for Category
});

const unitRouter = t.router({
  // ... CRUD functions for Unit
});

const productRouter = t.router({
  // ... CRUD functions for Product
});

const purchaseRouter = t.router({
  // ... functions for recording purchases
});

const customerRouter = t.router({
  // ... CRUD functions for Customer
});

const saleRouter = t.router({
  // ... functions for creating and viewing sales
});

const repairRouter = t.router({
  // ... functions for creating and viewing repairs
});

const dashboardRouter = t.router({
  // Function to fetch summary data for the Dashboard
  getSummary: t.procedure
    .input(z.object({ period: z.enum(['today', 'last7days', 'thismonth']) }))
    .query(({ input }) => {
      // ... code to fetch summary data based on the specified time period
    }),
});


// =================================================================
// The main router that combines everything
// =================================================================
export const appRouter = t.router({
  categories: categoryRouter,
  units: unitRouter,
  products: productRouter,
  purchases: purchaseRouter,
  customers: customerRouter,
  sales: saleRouter,
  repairs: repairRouter,
  dashboard: dashboardRouter,
});

// Export the type of the AppRouter for Frontend use
export type AppRouter = typeof appRouter;

```

### **Description:**

  * **`t.router`**: Used to create a group of API endpoints.
  * **`t.procedure`**: Used to create an individual endpoint.
  * **`.query`**: For endpoints that **fetch/read** data (e.g., `getAll`).
  * **`.mutation`**: For endpoints that **create/edit/delete** data (e.g., `create`, `update`, `delete`).
  * **`.input(z.object(...))`**: Uses **Zod** to define the shape and data types of the input required for an endpoint, which tRPC will use for automatic validation.
