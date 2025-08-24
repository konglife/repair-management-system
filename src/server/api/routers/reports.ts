import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { 
  generateSalesReportPDF, 
  generateRepairsReportPDF,
  type SalesReportData,
  type RepairsReportData,
  type BusinessInfo,
  PDFGeneratorError 
} from "~/lib/pdf-generator";
import { TRPCError } from "@trpc/server";

const reportInputSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
});

export const reportsRouter = createTRPCRouter({
  generateSalesReport: publicProcedure
    .input(reportInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { month, year } = input;

        // Get business profile information
        const businessProfile = await ctx.db.businessProfile.findFirst();
        const businessInfo: BusinessInfo = {
          shopName: businessProfile?.shopName,
          address: businessProfile?.address || undefined,
          phoneNumber: businessProfile?.phoneNumber || undefined,
          contactEmail: businessProfile?.contactEmail || undefined,
          logoUrl: businessProfile?.logoUrl || undefined,
        };

        // Query sales data for the specified month/year
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const sales = await ctx.db.sale.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            customer: {
              select: {
                name: true,
              },
            },
            saleItems: {
              include: {
                product: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        // Calculate totals and format data
        let totalRevenue = 0;
        const formattedSales = sales.map(sale => {
          const customerName = sale.customer?.name;

          const saleItems = sale.saleItems.map(item => ({
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: item.priceAtTime,
            total: item.priceAtTime * item.quantity,
          }));

          const saleTotal = sale.totalAmount;
          totalRevenue += saleTotal;

          return {
            id: sale.id,
            createdAt: sale.createdAt,
            customerName,
            total: saleTotal,
            saleItems,
          };
        });

        const reportData: SalesReportData = {
          month,
          year,
          sales: formattedSales,
          totalRevenue,
          totalTransactions: sales.length,
        };

        // Generate PDF
        const pdfBuffer = await generateSalesReportPDF(reportData, businessInfo);
        
        // Convert to base64 for transport
        const base64Data = Buffer.from(pdfBuffer).toString('base64');
        
        return {
          success: true,
          data: base64Data,
          filename: `sales-report-${year}-${month.toString().padStart(2, '0')}.pdf`,
          totalTransactions: sales.length,
          totalRevenue,
        };

      } catch (error) {
        console.error('Sales report generation error:', error);
        
        if (error instanceof PDFGeneratorError) {
          // Check if it's a font encoding error
          if (error.message.includes('encode') || error.message.includes('WinAnsi') || error.message.includes('font')) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'PDF generation failed due to character encoding issues. Some business information may contain characters that cannot be displayed in the PDF. Please check your business profile settings.',
              cause: error,
            });
          }
          
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to generate PDF report',
            cause: error,
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while generating the report',
          cause: error,
        });
      }
    }),

  generateRepairsReport: publicProcedure
    .input(reportInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { month, year } = input;

        // Get business profile information
        const businessProfile = await ctx.db.businessProfile.findFirst();
        const businessInfo: BusinessInfo = {
          shopName: businessProfile?.shopName,
          address: businessProfile?.address || undefined,
          phoneNumber: businessProfile?.phoneNumber || undefined,
          contactEmail: businessProfile?.contactEmail || undefined,
          logoUrl: businessProfile?.logoUrl || undefined,
        };

        // Query repairs data for the specified month/year
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const repairs = await ctx.db.repair.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            customer: {
              select: {
                name: true,
              },
            },
            usedParts: {
              include: {
                product: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        // Calculate totals and format data
        let totalRevenue = 0;
        let totalPartsCost = 0;

        const formattedRepairs = repairs.map(repair => {
          const customerName = repair.customer?.name;

          const repairCost = repair.totalCost;
          totalRevenue += repairCost;

          // Use the stored parts cost from the repair record
          const partsCost = repair.partsCost;
          totalPartsCost += partsCost;

          return {
            id: repair.id,
            createdAt: repair.createdAt,
            customerName,
            deviceInfo: repair.description,
            repairCost,
            partsCost,
            status: 'completed', // Default status since the model doesn't have this field
          };
        });

        const grossProfit = totalRevenue - totalPartsCost;

        const reportData: RepairsReportData = {
          month,
          year,
          repairs: formattedRepairs,
          totalRevenue,
          totalPartsCost,
          grossProfit,
          totalRepairs: repairs.length,
        };

        // Generate PDF
        const pdfBuffer = await generateRepairsReportPDF(reportData, businessInfo);
        
        // Convert to base64 for transport
        const base64Data = Buffer.from(pdfBuffer).toString('base64');
        
        return {
          success: true,
          data: base64Data,
          filename: `repairs-report-${year}-${month.toString().padStart(2, '0')}.pdf`,
          totalRepairs: repairs.length,
          totalRevenue,
          totalPartsCost,
          grossProfit,
        };

      } catch (error) {
        console.error('Repairs report generation error:', error);
        
        if (error instanceof PDFGeneratorError) {
          // Check if it's a font encoding error
          if (error.message.includes('encode') || error.message.includes('WinAnsi') || error.message.includes('font')) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'PDF generation failed due to character encoding issues. Some business information may contain characters that cannot be displayed in the PDF. Please check your business profile settings.',
              cause: error,
            });
          }
          
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to generate PDF report',
            cause: error,
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while generating the report',
          cause: error,
        });
      }
    }),
});