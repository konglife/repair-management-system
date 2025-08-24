import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// Type interfaces for database operations
interface PurchaseRecord {
  costPerUnit: number;
  quantity: number;
}

interface Product {
  quantity: number;
  averageCost: number;
}

// Query-specific interfaces for trend data (limited field selections)
interface TrendSaleData {
  createdAt: Date;
  totalAmount: number;
}

interface TrendRepairData {
  createdAt: Date;
  totalCost: number;
}

interface TrendPurchaseData {
  purchaseDate: Date;
  costPerUnit: number;
  quantity: number;
}

// Full object interfaces for operations that include relations
interface Sale {
  id: string;
  totalAmount: number;
  createdAt: Date;
  customer: { name: string };
}

interface Repair {
  id: string;
  description: string;
  totalCost: number;
  createdAt: Date;
  customer: { name: string };
}

interface Purchase {
  id: string;
  costPerUnit: number;
  quantity: number;
  purchaseDate: Date;
  product: { name: string };
}

interface TopProduct {
  productId: string;
  _sum: {
    quantity: number | null;
    priceAtTime: number | null;
  };
}

interface ProductDetail {
  id: string;
  name: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  quantity: number;
  category: { name: string };
  unit: { name: string };
}

export const dashboardRouter = createTRPCRouter({
  // Get summary data for dashboard with time range filtering
  getSummary: protectedProcedure
    .input(
      z.object({
        period: z.enum(['today', 'last7days', 'thismonth']),
      })
    )
    .query(async ({ ctx, input }) => {
      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;

      switch (input.period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'last7days':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'thismonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      // For purchases, we need to calculate costPerUnit * quantity for each record
      const purchaseRecords = await ctx.db.purchaseRecord.findMany({
        where: {
          purchaseDate: {
            gte: startDate,
          },
        },
        select: {
          costPerUnit: true,
          quantity: true,
        },
      });

      const totalExpenses = purchaseRecords.reduce(
        (sum: number, record: PurchaseRecord) => sum + (record.costPerUnit * record.quantity),
        0
      );

      // Calculate sales data
      const salesAggregation = await ctx.db.sale.aggregate({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _sum: {
          totalAmount: true,
          totalCost: true,
        },
      });

      // Calculate repair data
      const repairAggregation = await ctx.db.repair.aggregate({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _sum: {
          totalCost: true,
          laborCost: true,
        },
      });

      // Calculate totals with null safety
      const totalSalesIncome = salesAggregation._sum.totalAmount ?? 0;
      const totalSalesCost = salesAggregation._sum.totalCost ?? 0;
      const totalRepairIncome = repairAggregation._sum.totalCost ?? 0;
      const totalRepairLaborCost = repairAggregation._sum.laborCost ?? 0;

      // Calculate total stock value (quantity * average cost)
      const products = await ctx.db.product.findMany({
        select: {
          quantity: true,
          averageCost: true,
        },
      });

      const totalStockValue = products.reduce(
        (sum: number, product: Product) => sum + (product.quantity * product.averageCost),
        0
      );

      return {
        totalExpenses,
        totalRepairIncome,
        totalSalesIncome,
        salesProfit: totalSalesIncome - totalSalesCost,
        repairProfit: totalRepairLaborCost,
        totalStockValue,
        grossProfit: (totalSalesIncome - totalSalesCost) + totalRepairLaborCost,
      };
    }),

  // Get trend data for 30-day period for dashboard graph (optimized with targeted Prisma queries)
  getTrendData: protectedProcedure
    .input(
      z.object({
        period: z.literal('last30days'),
      })
    )
    .query(async ({ ctx }) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Use optimized Prisma queries with proper field names
    const salesData = await ctx.db.sale.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    });

    const repairData = await ctx.db.repair.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
        totalCost: true,
      },
    });

    const purchaseData = await ctx.db.purchaseRecord.findMany({
      where: {
        purchaseDate: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        purchaseDate: true,
        costPerUnit: true,
        quantity: true,
      },
    });

    // Create a map to aggregate daily totals efficiently
    const dailyTotals = new Map<string, { totalIncome: number; totalExpenses: number }>();

    // Initialize all days with zero values
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      dailyTotals.set(dateString!, { totalIncome: 0, totalExpenses: 0 });
    }

    // Merge sales data
    salesData.forEach((sale: TrendSaleData) => {
      const dateString = sale.createdAt.toISOString().split('T')[0];
      const existing = dailyTotals.get(dateString!) ?? { totalIncome: 0, totalExpenses: 0 };
      existing.totalIncome += sale.totalAmount;
      dailyTotals.set(dateString!, existing);
    });

    // Merge repair data
    repairData.forEach((repair: TrendRepairData) => {
      const dateString = repair.createdAt.toISOString().split('T')[0];
      const existing = dailyTotals.get(dateString!) ?? { totalIncome: 0, totalExpenses: 0 };
      existing.totalIncome += repair.totalCost;
      dailyTotals.set(dateString!, existing);
    });

    // Merge purchase data
    purchaseData.forEach((purchase: TrendPurchaseData) => {
      const dateString = purchase.purchaseDate.toISOString().split('T')[0];
      const existing = dailyTotals.get(dateString!) ?? { totalIncome: 0, totalExpenses: 0 };
      existing.totalExpenses += purchase.costPerUnit * purchase.quantity;
      dailyTotals.set(dateString!, existing);
    });

    // Convert map to array and sort by date
    const dailyData = Array.from(dailyTotals.entries())
      .map(([date, totals]) => ({
        date,
        totalIncome: totals.totalIncome,
        totalExpenses: totals.totalExpenses,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      trendData: dailyData,
    };
  }),

  // Get top selling products with date range filtering
  getTopProducts: protectedProcedure
    .input(
      z.object({
        period: z.enum(['today', 'last7days', 'thismonth']),
      })
    )
    .query(async ({ ctx, input }) => {
      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;

      switch (input.period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'last7days':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'thismonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      // Get top products from sales
      const topProducts = await ctx.db.saleItem.groupBy({
        by: ['productId'],
        where: {
          sale: {
            createdAt: {
              gte: startDate,
            },
          },
        },
        _sum: {
          quantity: true,
          priceAtTime: true,
        },
        orderBy: {
          _sum: {
            priceAtTime: 'desc',
          },
        },
        take: 5,
      });

      // Get product details for the top products
      const productDetails = await ctx.db.product.findMany({
        where: {
          id: {
            in: topProducts.map((tp: TopProduct) => tp.productId),
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      // Map products with their sales data
      const topProductsWithNames = topProducts.map((product: TopProduct) => {
        const productInfo = productDetails.find((pd: ProductDetail) => pd.id === product.productId);
        return {
          productName: productInfo?.name || 'Unknown Product',
          totalSales: product._sum.quantity || 0,
          totalRevenue: product._sum.priceAtTime || 0,
        };
      });

      return {
        topProducts: topProductsWithNames,
      };
    }),

  // Get recent activities (sales, repairs, purchases)
  getRecentActivities: protectedProcedure
    .query(async ({ ctx }) => {
      const limit = 10;

      // Get recent sales
      const recentSales = await ctx.db.sale.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true } },
        },
      });

      // Get recent repairs
      const recentRepairs = await ctx.db.repair.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true } },
        },
      });

      // Get recent purchases (last few days)
      const recentPurchases = await ctx.db.purchaseRecord.findMany({
        take: limit,
        orderBy: { purchaseDate: 'desc' },
        include: {
          product: { select: { name: true } },
        },
      });

      // Combine and format activities
      const activities = [
        ...recentSales.map((sale: Sale) => ({
          id: `sale-${sale.id}`,
          type: 'sale' as const,
          description: `Sale completed`,
          amount: sale.totalAmount,
          customerName: sale.customer.name,
          date: sale.createdAt,
        })),
        ...recentRepairs.map((repair: Repair) => ({
          id: `repair-${repair.id}`,
          type: 'repair' as const,
          description: repair.description.length > 30 ? 
            `${repair.description.substring(0, 30)}...` : 
            repair.description,
          amount: repair.totalCost,
          customerName: repair.customer.name,
          date: repair.createdAt,
        })),
        ...recentPurchases.map((purchase: Purchase) => ({
          id: `purchase-${purchase.id}`,
          type: 'purchase' as const,
          description: `Purchased ${purchase.product.name}`,
          amount: purchase.costPerUnit * purchase.quantity,
          customerName: undefined,
          date: purchase.purchaseDate,
        })),
      ];

      // Sort by date and take top 10
      const sortedActivities = activities
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 10);

      return {
        activities: sortedActivities,
      };
    }),

  // Get low stock alerts (products below threshold)
  getLowStockAlerts: protectedProcedure
    .query(async ({ ctx }) => {
      // Get the low stock threshold from business profile
      const businessProfile = await ctx.db.businessProfile.findFirst();
      const lowStockThreshold = businessProfile?.lowStockThreshold ?? 5; // Default to 5 if no profile exists

      const lowStockProducts = await ctx.db.product.findMany({
        where: {
          quantity: {
            lt: lowStockThreshold,
          },
        },
        include: {
          category: { select: { name: true } },
          unit: { select: { name: true } },
        },
        orderBy: {
          quantity: 'asc',
        },
        take: 20, // Limit to prevent too many alerts
      });

      const formattedLowStock = lowStockProducts.map((product: LowStockProduct) => ({
        id: product.id,
        name: product.name,
        currentStock: product.quantity,
        category: product.category.name,
        unit: product.unit.name,
      }));

      return {
        lowStockProducts: formattedLowStock,
      };
    }),
});