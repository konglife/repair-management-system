import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

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
        (sum, record) => sum + (record.costPerUnit * record.quantity),
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

      return {
        totalExpenses,
        totalRepairIncome,
        totalSalesIncome,
        salesProfit: totalSalesIncome - totalSalesCost,
        repairProfit: totalRepairLaborCost,
      };
    }),

  // Get trend data for 30-day period for dashboard graph
  getTrendData: protectedProcedure
    .input(
      z.object({
        period: z.literal('last30days'),
      })
    )
    .query(async ({ ctx }) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get sales data grouped by date
    const salesData = await ctx.db.sale.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Get repair data grouped by date  
    const repairData = await ctx.db.repair.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        totalCost: true,
      },
    });

    // Get purchase data grouped by date
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

    // Create a map to aggregate daily totals
    const dailyTotals = new Map<string, { totalIncome: number; totalExpenses: number }>();

    // Initialize all days with zero values
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      dailyTotals.set(dateString!, { totalIncome: 0, totalExpenses: 0 });
    }

    // Add sales income to daily totals
    salesData.forEach((sale) => {
      const dateString = sale.createdAt.toISOString().split('T')[0];
      const existing = dailyTotals.get(dateString!) ?? { totalIncome: 0, totalExpenses: 0 };
      existing.totalIncome += sale._sum.totalAmount ?? 0;
      dailyTotals.set(dateString!, existing);
    });

    // Add repair income to daily totals
    repairData.forEach((repair) => {
      const dateString = repair.createdAt.toISOString().split('T')[0];
      const existing = dailyTotals.get(dateString!) ?? { totalIncome: 0, totalExpenses: 0 };
      existing.totalIncome += repair._sum.totalCost ?? 0;
      dailyTotals.set(dateString!, existing);
    });

    // Add purchase expenses to daily totals
    purchaseData.forEach((purchase) => {
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
});