# **API Design and Integration (tRPC)**

### **tRPC Router Modification: `src/server/api/routers/reports.ts`**

The `getMonthlySummary` procedure will be updated to perform the following actions:

1.  **Extend Sales Query**: The Prisma query for `sales` will be modified to include related `saleItems` and their corresponding `product` details (specifically the product `name`).
    ```typescript
    // Example Prisma include
    include: {
      saleItems: {
        include: {
          product: {
            select: { name: true }
          }
        }
      }
    }
    ```
2.  **Extend Repairs Query**: The Prisma query for `repairs` will be modified to include `usedParts` and their `product` details (`name` and `costAtTime`).
    ```typescript
    // Example Prisma include
    include: {
      usedParts: {
        include: {
          product: {
            select: { name: true }
          }
        }
      }
    }
    ```
3.  **Add Purchase Records Query**: A new query will be added to fetch `purchaseRecord` within the date range, including the related product's name.
4.  **Update Return Type**: The `SummaryData` return type will be updated to include the newly fetched data arrays. For example:
    ```typescript
    interface SaleItemDetail {
      product: { name: string };
    }

    interface UsedPartDetail {
      quantity: number;
      costAtTime: number;
      product: { name: string };
    }

    interface PurchaseRecordDetail {
      // ... fields
      product: { name: string };
    }

    interface SalesData {
      // ... existing fields
      saleItems: SaleItemDetail[];
    }

    interface RepairsData {
        // ... existing fields
        usedParts: UsedPartDetail[];
    }

    interface SummaryData {
      // ... existing fields
      purchaseData: PurchaseRecordDetail[];
    }
    ```

-----
