import { PDFDocument, PDFPage, rgb, type PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export interface BusinessInfo {
  shopName?: string;
  address?: string;
  phoneNumber?: string;
  contactEmail?: string;
  logoUrl?: string;
}

export interface SalesReportData {
  month: number;
  year: number;
  sales: Array<{
    id: string;
    createdAt: Date;
    customerName?: string;
    total: number;
    saleItems: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
  }>;
  totalRevenue: number;
  totalTransactions: number;
}

export interface RepairsReportData {
  month: number;
  year: number;
  repairs: Array<{
    id: string;
    createdAt: Date;
    customerName?: string;
    deviceInfo: string;
    repairCost: number;
    partsCost: number;
    status: string;
  }>;
  totalRevenue: number;
  totalPartsCost: number;
  grossProfit: number;
  totalRepairs: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export class PDFGeneratorError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'PDFGeneratorError';
  }
}

export class PDFGenerator {
  private doc: PDFDocument | null = null;
  private currentPage: PDFPage | null = null;
  private font: PDFFont | null = null;
  private boldFont: PDFFont | null = null;
  private unicodeFont: PDFFont | null = null;
  private unicodeBoldFont: PDFFont | null = null;
  private currentY: number = 0;
  private margin: number = 50;

  private async initialize(): Promise<void> {
    if (!this.doc) {
      this.doc = await PDFDocument.create();
      this.doc.registerFontkit(fontkit);
      this.currentPage = this.doc.addPage([612, 792]); // Letter size
      this.currentY = this.currentPage.getHeight() - this.margin;
    }
  }

  private hasUnicodeCharacters(text: string): boolean {
    // Check if text contains non-ASCII characters (code points > 127)
    return /[^\x00-\x7F]/.test(text);
  }

  private sanitizeText(text: string): string {
    // Replace common non-ASCII characters with ASCII alternatives
    return text
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\x00-\x7F]/g, '?') // Replace remaining non-ASCII with ?
      .replace(/\?+/g, '?'); // Collapse multiple ? marks
  }

  private async loadUnicodeFont(): Promise<void> {
    if (!this.doc || this.unicodeFont) return;

    try {
      // Try to load Noto Sans from Google Fonts CDN
      const fontUrl = 'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNr5TRASf6M7Q.woff2';
      const response = await fetch(fontUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Unicode font');
      }
      
      const fontBytes = await response.arrayBuffer();
      this.unicodeFont = await this.doc.embedFont(fontBytes, { subset: true });
      
      // For bold, we'll use the same font with increased weight via CSS-like approach
      // Since we can't easily get bold variant, we'll simulate it by drawing text twice with slight offset
      this.unicodeBoldFont = this.unicodeFont;
    } catch (error) {
      // If Unicode font loading fails, we'll use fallback mechanism
      console.warn('Failed to load Unicode font, will use text sanitization fallback:', error);
      this.unicodeFont = null;
      this.unicodeBoldFont = null;
    }
  }

  private async ensureFonts(): Promise<void> {
    if (!this.doc) {
      throw new PDFGeneratorError('PDF document not initialized');
    }
    if (!this.font) {
      this.font = await this.doc.embedFont('Helvetica');
    }
    if (!this.boldFont) {
      this.boldFont = await this.doc.embedFont('Helvetica-Bold');
    }
    
    // Try to load Unicode font for international character support
    await this.loadUnicodeFont();
  }

  private drawText(
    text: string, 
    x: number, 
    y: number, 
    size: number, 
    isBold: boolean = false,
    color: [number, number, number] = [0.1, 0.1, 0.1]
  ): void {
    if (!this.currentPage) {
      throw new PDFGeneratorError('Page not loaded');
    }

    let finalText = text;
    let selectedFont: PDFFont;
    const textColor = rgb(color[0], color[1], color[2]);

    try {
      // Check if text contains Unicode characters
      if (this.hasUnicodeCharacters(text)) {
        if (this.unicodeFont) {
          // Use Unicode font if available
          selectedFont = isBold ? (this.unicodeBoldFont || this.unicodeFont) : this.unicodeFont;
        } else {
          // Fallback: sanitize text and use standard font
          finalText = this.sanitizeText(text);
          selectedFont = isBold ? this.boldFont! : this.font!;
        }
      } else {
        // Use standard font for ASCII text
        selectedFont = isBold ? this.boldFont! : this.font!;
      }

      this.currentPage.drawText(finalText, {
        x,
        y,
        size,
        font: selectedFont,
        color: textColor,
      });

      // If using Unicode font for bold, draw text twice with slight offset for bold effect
      if (this.hasUnicodeCharacters(text) && isBold && this.unicodeFont && finalText === text) {
        this.currentPage.drawText(finalText, {
          x: x + 0.5,
          y,
          size,
          font: selectedFont,
          color: textColor,
        });
      }
    } catch (error) {
      // Last resort fallback: sanitize and use standard font
      if (finalText !== this.sanitizeText(text)) {
        finalText = this.sanitizeText(text);
        selectedFont = isBold ? this.boldFont! : this.font!;
        this.currentPage.drawText(finalText, {
          x,
          y,
          size,
          font: selectedFont,
          color: textColor,
        });
      } else {
        throw error;
      }
    }
  }

  private addHeader(businessInfo: BusinessInfo, title: string, subtitle: string): void {
    if (!this.font || !this.boldFont || !this.currentPage) {
      throw new PDFGeneratorError('Fonts or page not loaded');
    }

    const pageWidth = this.currentPage.getWidth();
    
    // Business name
    const businessName = businessInfo.shopName || 'Repair Shop';
    this.drawText(businessName, this.margin, this.currentY, 20, true);

    // Business info (right aligned) - for simplicity, we'll use left alignment to avoid width calculations with Unicode
    let infoY = this.currentY;
    if (businessInfo.address) {
      this.drawText(businessInfo.address, pageWidth - 300, infoY, 10, false, [0.4, 0.4, 0.4]);
      infoY -= 15;
    }

    if (businessInfo.phoneNumber) {
      this.drawText(businessInfo.phoneNumber, pageWidth - 300, infoY, 10, false, [0.4, 0.4, 0.4]);
      infoY -= 15;
    }

    if (businessInfo.contactEmail) {
      this.drawText(businessInfo.contactEmail, pageWidth - 300, infoY, 10, false, [0.4, 0.4, 0.4]);
    }

    this.currentY -= 40;

    // Report title (centered)
    this.drawText(title, (pageWidth - 150) / 2, this.currentY, 16, true);

    this.currentY -= 20;

    // Report subtitle (centered)
    this.drawText(subtitle, (pageWidth - 100) / 2, this.currentY, 12, false, [0.4, 0.4, 0.4]);

    this.currentY -= 40;
  }

  private addSectionHeader(text: string): void {
    if (!this.boldFont || !this.currentPage) {
      throw new PDFGeneratorError('Fonts or page not loaded');
    }

    this.currentY -= 10;
    this.drawText(text, this.margin, this.currentY, 14, true);
    this.currentY -= 25;
  }

  private addLine(label: string, value: string, indent: number = 0): void {
    if (!this.font || !this.currentPage) {
      throw new PDFGeneratorError('Fonts or page not loaded');
    }

    const x = this.margin + indent;
    const text = label ? `${label}: ${value}` : value;
    this.drawText(text, x, this.currentY, 10, false, [0.2, 0.2, 0.2]);
    this.currentY -= 15;
  }

  private checkPageSpace(requiredSpace: number): void {
    if (!this.doc) {
      throw new PDFGeneratorError('PDF document not initialized');
    }
    if (this.currentY - requiredSpace < this.margin) {
      this.currentPage = this.doc.addPage([612, 792]);
      this.currentY = this.currentPage.getHeight() - this.margin;
    }
  }

  async generateSalesReport(data: SalesReportData, businessInfo: BusinessInfo): Promise<Uint8Array> {
    try {
      await this.initialize();
      await this.ensureFonts();
      
      const monthName = MONTHS[data.month - 1];
      const title = 'Sales Report';
      const subtitle = `${monthName} ${data.year}`;

      this.addHeader(businessInfo, title, subtitle);

      // Summary section
      this.addSectionHeader('Summary');
      this.addLine('Total Sales', data.totalTransactions.toString());
      this.addLine('Total Revenue', `$${data.totalRevenue.toFixed(2)}`);
      this.addLine('Average Sale', `$${(data.totalRevenue / (data.totalTransactions || 1)).toFixed(2)}`);

      // Sales details
      if (data.sales.length > 0) {
        this.addSectionHeader('Sales Details');
        
        for (const sale of data.sales) {
          this.checkPageSpace(100);
          
          const date = sale.createdAt.toLocaleDateString();
          const customer = sale.customerName || 'Walk-in Customer';
          
          this.addLine('Sale ID', sale.id);
          this.addLine('Date', date, 20);
          this.addLine('Customer', customer, 20);
          this.addLine('Total', `$${sale.total.toFixed(2)}`, 20);
          
          // Sale items
          if (sale.saleItems.length > 0) {
            this.addLine('Items', '', 20);
            for (const item of sale.saleItems) {
              this.addLine('', `${item.productName} x${item.quantity} @ $${item.unitPrice.toFixed(2)} = $${item.total.toFixed(2)}`, 40);
            }
          }
          
          this.currentY -= 10; // Extra spacing between sales
        }
      } else {
        this.addSectionHeader('Sales Details');
        this.addLine('No sales found', `for ${monthName} ${data.year}`);
      }

      if (!this.doc) {
        throw new PDFGeneratorError('PDF document not initialized');
      }
      return await this.doc.save();
    } catch (error) {
      throw new PDFGeneratorError('Failed to generate sales report', error as Error);
    }
  }

  async generateRepairsReport(data: RepairsReportData, businessInfo: BusinessInfo): Promise<Uint8Array> {
    try {
      await this.initialize();
      await this.ensureFonts();
      
      const monthName = MONTHS[data.month - 1];
      const title = 'Repairs Report';
      const subtitle = `${monthName} ${data.year}`;

      this.addHeader(businessInfo, title, subtitle);

      // Summary section
      this.addSectionHeader('Summary');
      this.addLine('Total Repairs', data.totalRepairs.toString());
      this.addLine('Total Revenue', `$${data.totalRevenue.toFixed(2)}`);
      this.addLine('Total Parts Cost', `$${data.totalPartsCost.toFixed(2)}`);
      this.addLine('Gross Profit', `$${data.grossProfit.toFixed(2)}`);
      this.addLine('Profit Margin', `${((data.grossProfit / (data.totalRevenue || 1)) * 100).toFixed(1)}%`);

      // Repairs details
      if (data.repairs.length > 0) {
        this.addSectionHeader('Repair Details');
        
        for (const repair of data.repairs) {
          this.checkPageSpace(100);
          
          const date = repair.createdAt.toLocaleDateString();
          const customer = repair.customerName || 'Walk-in Customer';
          
          this.addLine('Repair ID', repair.id);
          this.addLine('Date', date, 20);
          this.addLine('Customer', customer, 20);
          this.addLine('Device', repair.deviceInfo, 20);
          this.addLine('Status', repair.status, 20);
          this.addLine('Repair Cost', `$${repair.repairCost.toFixed(2)}`, 20);
          this.addLine('Parts Cost', `$${repair.partsCost.toFixed(2)}`, 20);
          this.addLine('Profit', `$${(repair.repairCost - repair.partsCost).toFixed(2)}`, 20);
          
          this.currentY -= 10; // Extra spacing between repairs
        }
      } else {
        this.addSectionHeader('Repair Details');
        this.addLine('No repairs found', `for ${monthName} ${data.year}`);
      }

      if (!this.doc) {
        throw new PDFGeneratorError('PDF document not initialized');
      }
      return await this.doc.save();
    } catch (error) {
      throw new PDFGeneratorError('Failed to generate repairs report', error as Error);
    }
  }
}

export async function generateSalesReportPDF(
  data: SalesReportData,
  businessInfo: BusinessInfo
): Promise<Uint8Array> {
  const generator = new PDFGenerator();
  return await generator.generateSalesReport(data, businessInfo);
}

export async function generateRepairsReportPDF(
  data: RepairsReportData,
  businessInfo: BusinessInfo
): Promise<Uint8Array> {
  const generator = new PDFGenerator();
  return await generator.generateRepairsReport(data, businessInfo);
}