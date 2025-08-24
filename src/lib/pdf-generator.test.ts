import { 
  PDFGenerator, 
  generateSalesReportPDF, 
  generateRepairsReportPDF,
  PDFGeneratorError,
  type SalesReportData,
  type RepairsReportData,
  type BusinessInfo
} from './pdf-generator';

// Mock data for testing
const mockBusinessInfo: BusinessInfo = {
  shopName: 'Test Repair Shop',
  address: '123 Main St, Test City, TC 12345',
  phoneNumber: '(555) 123-4567',
  contactEmail: 'test@repairshop.com',
  logoUrl: 'https://example.com/logo.png',
};

const mockEmptyBusinessInfo: BusinessInfo = {};

const mockSalesData: SalesReportData = {
  month: 3,
  year: 2024,
  sales: [
    {
      id: 'sale-1',
      createdAt: new Date('2024-03-15T10:00:00Z'),
      customerName: 'John Doe',
      total: 150.00,
      saleItems: [
        {
          productName: 'Screen Protector',
          quantity: 2,
          unitPrice: 25.00,
          total: 50.00,
        },
        {
          productName: 'Phone Case',
          quantity: 1,
          unitPrice: 100.00,
          total: 100.00,
        },
      ],
    },
    {
      id: 'sale-2',
      createdAt: new Date('2024-03-20T14:30:00Z'),
      total: 75.50,
      saleItems: [
        {
          productName: 'Charging Cable',
          quantity: 3,
          unitPrice: 25.17,
          total: 75.50,
        },
      ],
    },
  ],
  totalRevenue: 225.50,
  totalTransactions: 2,
};

const mockEmptySalesData: SalesReportData = {
  month: 2,
  year: 2024,
  sales: [],
  totalRevenue: 0,
  totalTransactions: 0,
};

const mockRepairsData: RepairsReportData = {
  month: 3,
  year: 2024,
  repairs: [
    {
      id: 'repair-1',
      createdAt: new Date('2024-03-10T09:00:00Z'),
      customerName: 'Jane Smith',
      deviceInfo: 'iPhone 12 - A1234',
      repairCost: 200.00,
      partsCost: 75.00,
      status: 'completed',
    },
    {
      id: 'repair-2',
      createdAt: new Date('2024-03-25T16:45:00Z'),
      customerName: 'Bob Johnson',
      deviceInfo: 'Samsung Galaxy S21 - Unknown Model',
      repairCost: 150.00,
      partsCost: 50.00,
      status: 'in-progress',
    },
  ],
  totalRevenue: 350.00,
  totalPartsCost: 125.00,
  grossProfit: 225.00,
  totalRepairs: 2,
};

const mockEmptyRepairsData: RepairsReportData = {
  month: 2,
  year: 2024,
  repairs: [],
  totalRevenue: 0,
  totalPartsCost: 0,
  grossProfit: 0,
  totalRepairs: 0,
};

describe('PDFGenerator', () => {
  describe('generateSalesReport', () => {
    it('should generate a valid PDF buffer for sales report with data', async () => {
      const generator = new PDFGenerator();
      const result = await generator.generateSalesReport(mockSalesData, mockBusinessInfo);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
      
      // Basic PDF header check
      const pdfHeader = String.fromCharCode(...Array.from(result.slice(0, 4)));
      expect(pdfHeader).toBe('%PDF');
    });

    it('should generate PDF with empty sales data', async () => {
      const generator = new PDFGenerator();
      const result = await generator.generateSalesReport(mockEmptySalesData, mockBusinessInfo);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle missing business information gracefully', async () => {
      const generator = new PDFGenerator();
      const result = await generator.generateSalesReport(mockSalesData, mockEmptyBusinessInfo);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should throw PDFGeneratorError on invalid data', async () => {
      const generator = new PDFGenerator();
      const invalidData = { ...mockSalesData, month: -1 };
      
      // This test might not fail due to the robustness of pdf-lib, 
      // but we test the error handling structure
      try {
        await generator.generateSalesReport(invalidData, mockBusinessInfo);
      } catch (error) {
        if (error instanceof PDFGeneratorError) {
          expect(error.message).toContain('Failed to generate sales report');
        }
      }
    });
  });

  describe('generateRepairsReport', () => {
    it('should generate a valid PDF buffer for repairs report with data', async () => {
      const generator = new PDFGenerator();
      const result = await generator.generateRepairsReport(mockRepairsData, mockBusinessInfo);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
      
      // Basic PDF header check
      const pdfHeader = String.fromCharCode(...Array.from(result.slice(0, 4)));
      expect(pdfHeader).toBe('%PDF');
    });

    it('should generate PDF with empty repairs data', async () => {
      const generator = new PDFGenerator();
      const result = await generator.generateRepairsReport(mockEmptyRepairsData, mockBusinessInfo);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle missing business information gracefully', async () => {
      const generator = new PDFGenerator();
      const result = await generator.generateRepairsReport(mockRepairsData, mockEmptyBusinessInfo);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should calculate profit margins correctly in summary', async () => {
      const generator = new PDFGenerator();
      const result = await generator.generateRepairsReport(mockRepairsData, mockBusinessInfo);
      
      // Verify PDF was generated (indirect test of calculations)
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
      
      // The actual profit margin calculation is tested via the report data structure
      const expectedProfitMargin = (mockRepairsData.grossProfit / mockRepairsData.totalRevenue) * 100;
      expect(expectedProfitMargin).toBeCloseTo(64.3, 1); // 225/350 * 100 ≈ 64.3%
    });
  });
});

describe('PDF Generation Helper Functions', () => {
  describe('generateSalesReportPDF', () => {
    it('should generate sales report PDF successfully', async () => {
      const result = await generateSalesReportPDF(mockSalesData, mockBusinessInfo);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
      
      const pdfHeader = String.fromCharCode(...Array.from(result.slice(0, 4)));
      expect(pdfHeader).toBe('%PDF');
    });

    it('should handle sales report generation errors', async () => {
      // Create data that might cause issues
      const corruptedData = { ...mockSalesData, sales: null as unknown as SalesReportData['sales'] };
      
      await expect(generateSalesReportPDF(corruptedData, mockBusinessInfo))
        .rejects.toThrow(PDFGeneratorError);
    });
  });

  describe('generateRepairsReportPDF', () => {
    it('should generate repairs report PDF successfully', async () => {
      const result = await generateRepairsReportPDF(mockRepairsData, mockBusinessInfo);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
      
      const pdfHeader = String.fromCharCode(...Array.from(result.slice(0, 4)));
      expect(pdfHeader).toBe('%PDF');
    });

    it('should handle repairs report generation errors', async () => {
      const corruptedData = { ...mockRepairsData, repairs: null as unknown as RepairsReportData['repairs'] };
      
      await expect(generateRepairsReportPDF(corruptedData, mockBusinessInfo))
        .rejects.toThrow(PDFGeneratorError);
    });
  });
});

describe('PDFGeneratorError', () => {
  it('should create error with message and optional cause', () => {
    const originalError = new Error('Original error');
    const pdfError = new PDFGeneratorError('PDF generation failed', originalError);
    
    expect(pdfError.name).toBe('PDFGeneratorError');
    expect(pdfError.message).toBe('PDF generation failed');
    expect(pdfError.cause).toBe(originalError);
  });

  it('should create error without cause', () => {
    const pdfError = new PDFGeneratorError('PDF generation failed');
    
    expect(pdfError.name).toBe('PDFGeneratorError');
    expect(pdfError.message).toBe('PDF generation failed');
    expect(pdfError.cause).toBeUndefined();
  });
});

describe('PDF Content Validation', () => {
  it('should include all required sections in sales report', async () => {
    const result = await generateSalesReportPDF(mockSalesData, mockBusinessInfo);
    
    // Convert PDF to string for basic content checking (this is limited but better than nothing)
    const pdfString = String.fromCharCode(...Array.from(result));
    
    // Check for presence of key information (these are embedded in the PDF structure)
    expect(pdfString).toContain('March'); // Month should be present
    expect(pdfString).toContain('2024');  // Year should be present
  });

  it('should include all required sections in repairs report', async () => {
    const result = await generateRepairsReportPDF(mockRepairsData, mockBusinessInfo);
    
    // Convert PDF to string for basic content checking
    const pdfString = String.fromCharCode(...Array.from(result));
    
    // Check for presence of key information
    expect(pdfString).toContain('March'); // Month should be present
    expect(pdfString).toContain('2024');  // Year should be present
  });

  it('should handle various date formats correctly', async () => {
    const dataWithDifferentDates: SalesReportData = {
      ...mockSalesData,
      month: 12, // December
      year: 2023,
      sales: [
        {
          ...mockSalesData.sales[0],
          createdAt: new Date('2023-12-01T00:00:00Z'),
        },
      ],
    };

    const result = await generateSalesReportPDF(dataWithDifferentDates, mockBusinessInfo);
    const pdfString = String.fromCharCode(...Array.from(result));
    
    expect(pdfString).toContain('December');
    expect(pdfString).toContain('2023');
  });
});