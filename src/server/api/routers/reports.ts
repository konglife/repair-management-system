import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/lib/db";
import { getLocalDateString } from "~/lib/utils";

// Input validation schema for date parameters
const getMonthlySummaryInput = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
});

// Return type interfaces matching ReportView component expectations
interface ShopInformation {
  name: string;
  address: string;
  phone: string;
}

interface OverviewMetrics {
  expenses: number;
  totalRepairs: number;
  totalSales: number;
  salesProfit: number;
  repairIncome: number;
  salesIncome: number;
  repairProfit: number;
  grossProfit: number;
}

interface SalesData {
  date: string;
  totalCost: number;
  netTotal: number;
  totalAmount: number;
  grossProfit: number;
}

interface RepairsData {
  date: string;
  description: string;
  partsCost: number;
  laborCost: number;
  totalCost: number;
}

interface SummaryData {
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  shopInfo: ShopInformation;
  overview: OverviewMetrics;
  salesData: SalesData[];
  repairsData: RepairsData[];
}

export const reportsRouter = createTRPCRouter({
  getMonthlySummary: publicProcedure
    .input(getMonthlySummaryInput)
    .query(async ({ input }): Promise<SummaryData> => {
      try {
        const { startDate, endDate } = input;
        
        // Convert string dates to Date objects for Prisma queries
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end date
        
        // Fetch business profile for shop information
        const businessProfile = await db.businessProfile.findFirst();
        const shopInfo: ShopInformation = {
          name: businessProfile?.shopName || 'ร้านซ่อมมอเตอร์ไซค์',
          address: businessProfile?.address || 'ที่อยู่ไม่ได้ระบุ',
          phone: businessProfile?.phoneNumber || 'เบอร์โทรไม่ได้ระบุ'
        };

        // Fetch sales data within date range
        const sales = await db.sale.findMany({
          where: {
            createdAt: {
              gte: start,
              lte: end
            }
          },
          include: {
            saleItems: {
              include: {
                product: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        // Fetch repairs data within date range
        const repairs = await db.repair.findMany({
          where: {
            createdAt: {
              gte: start,
              lte: end
            }
          },
          include: {
            usedParts: {
              include: {
                product: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        // Calculate overview metrics
        const totalSales = sales.length;
        const totalRepairs = repairs.length;
        
        const salesIncome = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const salesCost = sales.reduce((sum, sale) => sum + sale.totalCost, 0);
        const salesProfit = salesIncome - salesCost;
        
        const repairIncome = repairs.reduce((sum, repair) => sum + repair.totalCost, 0);
        const repairCost = repairs.reduce((sum, repair) => sum + repair.partsCost, 0);
        const repairProfit = repairIncome - repairCost;
        
        const grossProfit = salesProfit + repairProfit;
        
        // For expenses, we'll use purchase records within the date range
        const purchaseRecords = await db.purchaseRecord.findMany({
          where: {
            purchaseDate: {
              gte: start,
              lte: end
            }
          }
        });
        const expenses = purchaseRecords.reduce((sum, record) => sum + (record.quantity * record.costPerUnit), 0);

        const overview: OverviewMetrics = {
          expenses,
          totalRepairs,
          totalSales,
          salesProfit,
          repairIncome,
          salesIncome,
          repairProfit,
          grossProfit
        };

        // Transform sales data for display
        const salesData: SalesData[] = sales.map(sale => {
          const totalAmount = sale.saleItems.reduce((sum, item) => sum + item.quantity, 0);
          const grossProfit = sale.totalAmount - sale.totalCost;
          
          return {
            date: getLocalDateString(sale.createdAt),
            totalCost: sale.totalCost,
            netTotal: sale.totalAmount,
            totalAmount,
            grossProfit
          };
        });

        // Transform repairs data for display
        const repairsData: RepairsData[] = repairs.map(repair => ({
          date: getLocalDateString(repair.createdAt),
          description: repair.description,
          partsCost: repair.partsCost,
          laborCost: repair.laborCost,
          totalCost: repair.totalCost
        }));

        return {
          reportPeriod: {
            startDate,
            endDate
          },
          shopInfo,
          overview,
          salesData,
          repairsData
        };

      } catch (error) {
        console.error('Error fetching monthly summary:', error);
        throw new Error('Failed to fetch monthly summary data');
      }
    }),
});