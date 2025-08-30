import { render, screen } from '@testing-library/react';
import ReportView from './ReportView';
import type { SummaryData } from './types';

// Mock the sub-components
jest.mock('./ReportHeader', () => {
  return function MockReportHeader({ shopInfo, reportPeriod }: { shopInfo: { name: string }, reportPeriod: { startDate: string, endDate: string } }) {
    return (
      <div data-testid="report-header">
        <div>{shopInfo.name}</div>
        <div>{reportPeriod.startDate} - {reportPeriod.endDate}</div>
      </div>
    );
  };
});

jest.mock('./OverviewMetrics', () => {
  return function MockOverviewMetrics({ overview }: { overview: { expenses: number, grossProfit: number } }) {
    return (
      <div data-testid="overview-metrics">
        <div>Expenses: {overview.expenses}</div>
        <div>Gross Profit: {overview.grossProfit}</div>
      </div>
    );
  };
});

jest.mock('./SalesTable', () => {
  return function MockSalesTable({ salesData }: { salesData: unknown[] }) {
    return (
      <div data-testid="sales-table">
        <div>Sales Count: {salesData.length}</div>
      </div>
    );
  };
});

jest.mock('./RepairsTable', () => {
  return function MockRepairsTable({ repairsData }: { repairsData: unknown[] }) {
    return (
      <div data-testid="repairs-table">
        <div>Repairs Count: {repairsData.length}</div>
      </div>
    );
  };
});

jest.mock('./PurchasesTable', () => {
  return function MockPurchasesTable({ purchaseData }: { purchaseData: unknown[] }) {
    return (
      <div data-testid="purchases-table">
        <div>Purchases Count: {purchaseData.length}</div>
      </div>
    );
  };
});

const mockData: SummaryData = {
  reportPeriod: {
    startDate: '2025-08-01',
    endDate: '2025-08-31'
  },
  shopInfo: {
    name: 'Test Shop Name',
    address: 'Test Address',
    phone: '123-456-7890'
  },
  overview: {
    expenses: 100000,
    totalRepairs: 10,
    totalSales: 5,
    salesProfit: 50000,
    repairIncome: 30000,
    salesIncome: 20000,
    repairProfit: 15000,
    grossProfit: 25000
  },
  salesData: [
    {
      date: '2025-08-01',
      totalCost: 1000,
      netTotal: 2000,
      totalAmount: 2,
      grossProfit: 1000,
      saleItems: [{ name: 'Test Item' }]
    }
  ],
  repairsData: [
    {
      date: '2025-08-02',
      description: 'Test repair',
      partsCost: 500,
      laborCost: 300,
      totalCost: 800,
      usedParts: [{ name: 'Test Part', costAtTime: 500 }]
    }
  ],
  purchaseData: [
    {
      id: 'p1',
      quantity: 10,
      costPerUnit: 100,
      purchaseDate: '2025-08-01',
      product: { name: 'Test Product' }
    }
  ]
};

describe('ReportView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all main sections correctly', () => {
    render(<ReportView data={mockData} />);

    expect(screen.getByTestId('report-header')).toBeInTheDocument();
    expect(screen.getByTestId('overview-metrics')).toBeInTheDocument();
    expect(screen.getByTestId('sales-table')).toBeInTheDocument();
    expect(screen.getByTestId('repairs-table')).toBeInTheDocument();
    expect(screen.getByTestId('purchases-table')).toBeInTheDocument();
  });

  it('should pass correct props to ReportHeader component', () => {
    render(<ReportView data={mockData} />);

    expect(screen.getByText('Test Shop Name')).toBeInTheDocument();
    expect(screen.getByText('2025-08-01 - 2025-08-31')).toBeInTheDocument();
  });

  it('should pass correct props to OverviewMetrics component', () => {
    render(<ReportView data={mockData} />);

    expect(screen.getByText('Expenses: 100000')).toBeInTheDocument();
    expect(screen.getByText('Gross Profit: 25000')).toBeInTheDocument();
  });

  it('should pass correct props to data table components', () => {
    render(<ReportView data={mockData} />);

    expect(screen.getByText('Sales Count: 1')).toBeInTheDocument();
    expect(screen.getByText('Repairs Count: 1')).toBeInTheDocument();
    expect(screen.getByText('Purchases Count: 1')).toBeInTheDocument();
  });

  it('should render footer notes', () => {
    render(<ReportView data={mockData} />);

    expect(screen.getByText('* ค่าเงินแสดงเป็นบาท (฿)')).toBeInTheDocument();
  });

  it('should use mock data when no data prop is provided', () => {
    render(<ReportView />);

    // Should still render all components even without data prop
    expect(screen.getByTestId('report-header')).toBeInTheDocument();
    expect(screen.getByTestId('overview-metrics')).toBeInTheDocument();
    expect(screen.getByTestId('sales-table')).toBeInTheDocument();
    expect(screen.getByTestId('repairs-table')).toBeInTheDocument();
    expect(screen.getByTestId('purchases-table')).toBeInTheDocument();
  });

  it('should handle empty data arrays correctly', () => {
    const emptyData: SummaryData = {
      ...mockData,
      salesData: [],
      repairsData: [],
      purchaseData: []
    };

    render(<ReportView data={emptyData} />);

    expect(screen.getByText('Sales Count: 0')).toBeInTheDocument();
    expect(screen.getByText('Repairs Count: 0')).toBeInTheDocument();
    expect(screen.getByText('Purchases Count: 0')).toBeInTheDocument();
  });

  it('should have proper layout structure with dividers', () => {
    const { container } = render(<ReportView data={mockData} />);

    const dividers = container.querySelectorAll('.h-px.bg-gray-200');
    expect(dividers).toHaveLength(3); // Three dividers between sections
  });

  it('should have responsive container styling', () => {
    const { container } = render(<ReportView data={mockData} />);

    const mainContainer = container.querySelector('.max-w-4xl.mx-auto.p-6.bg-white');
    expect(mainContainer).toBeInTheDocument();
  });

  it('should maintain backward compatibility with existing data structure', () => {
    // Test with data that might not have the new enhanced properties
    const legacyData = {
      ...mockData,
      salesData: [
        {
          date: '2025-08-01',
          totalCost: 1000,
          netTotal: 2000,
          totalAmount: 5,
          grossProfit: 1000,
          saleItems: undefined // This should be handled gracefully
        }
      ]
    } as SummaryData;

    // Should not throw an error
    expect(() => render(<ReportView data={legacyData} />)).not.toThrow();
    expect(screen.getByTestId('sales-table')).toBeInTheDocument();
  });
});