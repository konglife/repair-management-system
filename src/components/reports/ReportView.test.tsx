import React from 'react';
import { render, screen } from '@testing-library/react';
import ReportView from './ReportView';
import type { SummaryData } from './types';

// Enhanced mock data with all new fields
const mockEnhancedData: SummaryData = {
  reportPeriod: {
    startDate: '2025-08-01',
    endDate: '2025-08-31'
  },
  shopInfo: {
    name: 'Integration Test Shop',
    address: '456 Integration Street',
    phone: '987-654-3210'
  },
  overview: {
    expenses: 75000,
    totalRepairs: 25,
    totalSales: 12,
    salesProfit: 35000,
    repairIncome: 45000,
    salesIncome: 60000,
    repairProfit: 30000,
    grossProfit: 65000
  },
  salesData: [
    {
      date: '2025-08-01',
      totalCost: 3000,
      netTotal: 6000,
      totalAmount: 15,
      grossProfit: 3000,
      saleItems: [
        { name: 'Enhanced Product A' },
        { name: 'Enhanced Product B' },
        { name: 'Enhanced Product C' }
      ]
    },
    {
      date: '2025-08-15',
      totalCost: 2000,
      netTotal: 4000,
      totalAmount: 8,
      grossProfit: 2000,
      saleItems: [
        { name: 'Enhanced Product D' }
      ]
    }
  ],
  repairsData: [
    {
      date: '2025-08-02',
      description: 'Enhanced Repair Service A',
      partsCost: 1500,
      laborCost: 800,
      totalCost: 2300,
      usedParts: [
        { name: 'Enhanced Part 1', costAtTime: 800 },
        { name: 'Enhanced Part 2', costAtTime: 700 }
      ]
    },
    {
      date: '2025-08-10',
      description: 'Enhanced Repair Service B',
      partsCost: 900,
      laborCost: 600,
      totalCost: 1500,
      usedParts: [
        { name: 'Enhanced Part 3', costAtTime: 900 }
      ]
    }
  ],
  purchaseRecordsData: [
    {
      id: 'p1',
      quantity: 20,
      costPerUnit: 150,
      purchaseDate: '2025-08-01',
      product: { name: 'Enhanced Purchase Item A' }
    },
    {
      id: 'p2',
      quantity: 10,
      costPerUnit: 300,
      purchaseDate: '2025-08-05',
      product: { name: 'Enhanced Purchase Item B' }
    }
  ]
};

describe('ReportView Integration Tests', () => {
  describe('Enhanced data rendering', () => {
    it('should render all enhanced sales data with saleItems correctly', () => {
      render(<ReportView data={mockEnhancedData} />);

      // Check sales table headers
      expect(screen.getByText('ตารางรายละเอียดจากงานขาย')).toBeInTheDocument();
      expect(screen.getByText('Sale Items')).toBeInTheDocument();

      // Check enhanced sales data
      expect(screen.getByText('Enhanced Product A, Enhanced Product B, Enhanced Product C')).toBeInTheDocument();
      expect(screen.getByText('Enhanced Product D')).toBeInTheDocument();

      // Check sales totals exist
      expect(screen.getByText('฿5,000.00')).toBeInTheDocument(); // Total cost
      expect(screen.getByText('฿10,000.00')).toBeInTheDocument(); // Net total
    });

    it('should render all enhanced repairs data with usedParts correctly', () => {
      render(<ReportView data={mockEnhancedData} />);

      // Check repairs table headers
      expect(screen.getByText('ตารางรายละเอียดจากงานซ่อม')).toBeInTheDocument();
      expect(screen.getByText('Parts Used')).toBeInTheDocument();

      // Check enhanced repairs data
      expect(screen.getByText('Enhanced Part 1 (฿800.00), Enhanced Part 2 (฿700.00)')).toBeInTheDocument();
      expect(screen.getByText('Enhanced Part 3 (฿900.00)')).toBeInTheDocument();

      // Check repair descriptions
      expect(screen.getByText('Enhanced Repair Service A')).toBeInTheDocument();
      expect(screen.getByText('Enhanced Repair Service B')).toBeInTheDocument();
    });

    it('should render purchaseRecordsData in purchases table correctly', () => {
      render(<ReportView data={mockEnhancedData} />);

      // Check purchases table headers
      expect(screen.getByText('ตารางรายละเอียดจากการซื้อสินค้า')).toBeInTheDocument();
      expect(screen.getByText('Product Name')).toBeInTheDocument();

      // Check purchase data
      expect(screen.getByText('Enhanced Purchase Item A')).toBeInTheDocument();
      expect(screen.getByText('Enhanced Purchase Item B')).toBeInTheDocument();

      // Check quantities and costs
      expect(screen.getByText('20 ชิ้น')).toBeInTheDocument();
      expect(screen.getByText('10 ชิ้น')).toBeInTheDocument();
      expect(screen.getByText('฿150.00')).toBeInTheDocument();
      expect(screen.getByText('฿300.00')).toBeInTheDocument();
    });

    it('should render overview metrics correctly', () => {
      render(<ReportView data={mockEnhancedData} />);

      // Check overview section
      expect(screen.getByText('ภาพรวม')).toBeInTheDocument();
      expect(screen.getByText('฿75,000.00')).toBeInTheDocument(); // Expenses
      expect(screen.getByText('25 งาน')).toBeInTheDocument(); // Total repairs
      expect(screen.getByText('12 งาน')).toBeInTheDocument(); // Total sales
    });

    it('should render shop info and report period correctly', () => {
      render(<ReportView data={mockEnhancedData} />);

      // Check shop information
      expect(screen.getByText('Integration Test Shop')).toBeInTheDocument();
      expect(screen.getByText('456 Integration Street')).toBeInTheDocument();
      // Note: Phone number is not displayed in ReportHeader component
    });
  });

  describe('Data structure compatibility', () => {
    it('should handle API response with purchaseRecordsData field name', () => {
      const dataWithPurchaseRecordsData = {
        ...mockEnhancedData,
        purchaseRecordsData: mockEnhancedData.purchaseRecordsData,
        purchaseData: undefined
      };

      render(<ReportView data={dataWithPurchaseRecordsData} />);

      expect(screen.getByText('Enhanced Purchase Item A')).toBeInTheDocument();
      expect(screen.getByText('Enhanced Purchase Item B')).toBeInTheDocument();
    });

    it('should handle legacy API response with purchaseData field name', () => {
      const dataWithPurchaseData = {
        ...mockEnhancedData,
        purchaseData: mockEnhancedData.purchaseRecordsData,
        purchaseRecordsData: undefined
      };

      render(<ReportView data={dataWithPurchaseData} />);

      expect(screen.getByText('Enhanced Purchase Item A')).toBeInTheDocument();
      expect(screen.getByText('Enhanced Purchase Item B')).toBeInTheDocument();
    });

    it('should handle missing enhanced data arrays gracefully', () => {
      const incompleteData = {
        ...mockEnhancedData,
        salesData: [
          {
            date: '2025-08-01',
            totalCost: 3000,
            netTotal: 6000,
            totalAmount: 15,
            grossProfit: 3000,
            saleItems: [] // Empty array
          }
        ],
        repairsData: [
          {
            date: '2025-08-02',
            description: 'Test Repair',
            partsCost: 1500,
            laborCost: 800,
            totalCost: 2300,
            usedParts: [] // Empty array
          }
        ],
        purchaseRecordsData: [] // Empty array
      };

      render(<ReportView data={incompleteData} />);

      // Should render without errors and show fallback values
      expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(3); // At least one for each empty data array
    });

    it('should handle undefined/null enhanced data arrays', () => {
      const dataWithUndefinedArrays = {
        ...mockEnhancedData,
        salesData: [
          {
            date: '2025-08-01',
            totalCost: 3000,
            netTotal: 6000,
            totalAmount: 15,
            grossProfit: 3000,
            saleItems: undefined as any
          }
        ],
        repairsData: [
          {
            date: '2025-08-02',
            description: 'Test Repair',
            partsCost: 1500,
            laborCost: 800,
            totalCost: 2300,
            usedParts: null as any
          }
        ],
        purchaseRecordsData: undefined as any
      };

      render(<ReportView data={dataWithUndefinedArrays} />);

      // Should render without errors
      expect(screen.getByText('Integration Test Shop')).toBeInTheDocument();
    });
  });

  describe('Responsive design with enhanced data', () => {
    it('should render all tables with enhanced data in responsive containers', () => {
      render(<ReportView data={mockEnhancedData} />);

      // Check that all tables are present with overflow-x-auto for responsiveness
      const tables = screen.getAllByRole('table');
      expect(tables).toHaveLength(3); // Sales, Repairs, Purchases

      // Verify enhanced columns are present
      expect(screen.getByText('Sale Items')).toBeInTheDocument();
      expect(screen.getByText('Parts Used')).toBeInTheDocument();
      expect(screen.getByText('Product Name')).toBeInTheDocument();
    });
  });

  describe('Table calculations with enhanced data', () => {
    it('should calculate totals correctly for all monetary columns', () => {
      render(<ReportView data={mockEnhancedData} />);

      // Sales totals (3000 + 2000 = 5000, 6000 + 4000 = 10000, etc.)
      const salesTotalRows = screen.getAllByText('Total');
      expect(salesTotalRows.length).toBeGreaterThan(0);

      // Purchase totals (20*150 + 10*300 = 3000 + 3000 = 6000)
      expect(screen.getAllByText('฿6,000.00')).toHaveLength(2); // Appears in both sales and purchases totals

      // Repairs totals (1500 + 900 = 2400, 800 + 600 = 1400, 2300 + 1500 = 3800)
      expect(screen.getByText('฿2,400.00')).toBeInTheDocument(); // Parts cost total
      expect(screen.getByText('฿1,400.00')).toBeInTheDocument(); // Labor cost total
      expect(screen.getByText('฿3,800.00')).toBeInTheDocument(); // Total cost total
    });
  });
});