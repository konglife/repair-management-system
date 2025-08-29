import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportView from './ReportView';

// Mock data for testing
const mockData = {
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
      grossProfit: 1000
    }
  ],
  repairsData: [
    {
      date: '2025-08-02',
      description: 'Test repair',
      partsCost: 500,
      laborCost: 300,
      totalCost: 800
    }
  ]
};

describe('ReportView Component', () => {
  test('renders with mock data when no props provided', () => {
    render(<ReportView />);
    
    // Check if main title is rendered
    expect(screen.getByText('รายงานสรุปข้อมูลรายเดือน')).toBeInTheDocument();
    
    // Check if overview section is rendered
    expect(screen.getByText('ภาพรวม')).toBeInTheDocument();
    
    // Check if tables are rendered
    expect(screen.getByText('ตารางรายละเอียดจากงานขาย')).toBeInTheDocument();
    expect(screen.getByText('ตารางรายละเอียดจากงานซ่อม')).toBeInTheDocument();
  });

  test('renders with provided prop data', () => {
    render(<ReportView data={mockData} />);
    
    // Check if shop info is rendered correctly
    expect(screen.getByText('Test Shop Name')).toBeInTheDocument();
    expect(screen.getByText(/Test Address/)).toBeInTheDocument();
    expect(screen.getByText(/123-456-7890/)).toBeInTheDocument();
    
    // Check if overview metrics are rendered
    expect(screen.getByText('10 งาน')).toBeInTheDocument(); // Total Repairs
    expect(screen.getByText('5 งาน')).toBeInTheDocument(); // Total Sales
  });

  test('formats currency values correctly', () => {
    render(<ReportView data={mockData} />);
    
    // Check if currency formatting is applied
    expect(screen.getByText('฿100,000')).toBeInTheDocument(); // Expenses
    expect(screen.getByText('฿50,000')).toBeInTheDocument(); // Sales Profit
  });

  test('formats dates consistently', () => {
    render(<ReportView data={mockData} />);
    
    // Check if dates are formatted (Thai locale shows Buddhist year)
    const dateElements = screen.getAllByText(/1\/8\/2568/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  test('renders sales table with correct data', () => {
    render(<ReportView data={mockData} />);
    
    // Check sales table headers (using getAllByText for duplicates)
    expect(screen.getAllByText('Date').length).toBe(2); // Both tables have Date
    expect(screen.getAllByText('Total Cost').length).toBe(2); // Both tables have Total Cost
    expect(screen.getByText('Net Total')).toBeInTheDocument();
    expect(screen.getByText('Total Amount')).toBeInTheDocument();
    expect(screen.getByText('Gross Profit')).toBeInTheDocument();
    
    // Check sales data (using getAllByText for duplicates)
    expect(screen.getAllByText('฿1,000').length).toBe(2); // Total cost and gross profit
    expect(screen.getByText('฿2,000')).toBeInTheDocument();
    expect(screen.getByText('2 ชิ้น')).toBeInTheDocument();
  });

  test('renders repairs table with correct data', () => {
    render(<ReportView data={mockData} />);
    
    // Check repairs table headers
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Parts Cost')).toBeInTheDocument();
    expect(screen.getByText('Labor Cost')).toBeInTheDocument();
    expect(screen.getAllByText('Total Cost').length).toBe(2); // Both tables have Total Cost
    
    // Check repairs data
    expect(screen.getByText('Test repair')).toBeInTheDocument();
    expect(screen.getByText('฿500')).toBeInTheDocument();
    expect(screen.getByText('฿300')).toBeInTheDocument();
    expect(screen.getByText('฿800')).toBeInTheDocument();
  });

  test('applies responsive layout classes', () => {
    const { container } = render(<ReportView data={mockData} />);
    
    // Check if responsive grid classes are applied
    const gridElement = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
    expect(gridElement).toBeInTheDocument();
    
    // Check if overflow-x-auto is applied to tables
    const tableContainers = container.querySelectorAll('.overflow-x-auto');
    expect(tableContainers.length).toBe(2); // Two tables
  });

  test('renders notes section', () => {
    render(<ReportView data={mockData} />);
    
    // Check if notes are rendered
    expect(screen.getByText('* ค่าเงินแสดงเป็นบาท (฿)')).toBeInTheDocument();
  });

  test('handles empty data arrays gracefully', () => {
    const emptyData = {
      ...mockData,
      salesData: [],
      repairsData: []
    };
    
    render(<ReportView data={emptyData} />);
    
    // Should still render table headers
    expect(screen.getByText('ตารางรายละเอียดจากงานขาย')).toBeInTheDocument();
    expect(screen.getByText('ตารางรายละเอียดจากงานซ่อม')).toBeInTheDocument();
  });
});