import { render, screen } from '@testing-library/react';
import SalesTable from './SalesTable';
import type { SalesData } from './types';

describe('SalesTable', () => {
  const mockSalesData: SalesData[] = [
    {
      date: '2025-08-01',
      totalCost: 2500,
      netTotal: 5000,
      totalAmount: 10,
      grossProfit: 2500,
      saleItems: [{ name: 'สายชาร์จ iPhone' }, { name: 'ฟิล์มกันรอย' }]
    },
    {
      date: '2025-08-08',
      totalCost: 7800,
      netTotal: 12500,
      totalAmount: 5,
      grossProfit: 4700,
      saleItems: [{ name: 'เคสโทรศัพท์' }]
    },
    {
      date: '2025-08-12',
      totalCost: 15000,
      netTotal: 25000,
      totalAmount: 8,
      grossProfit: 10000,
      saleItems: [{ name: 'แบตเตอรี่โทรศัพท์' }, { name: 'ลำโพงพกพา' }, { name: 'ที่ชาร์จไร้สาย' }]
    }
  ];

  it('should render table title correctly', () => {
    render(<SalesTable salesData={mockSalesData} />);

    expect(screen.getByText('ตารางรายละเอียดจากงานขาย')).toBeInTheDocument();
  });

  it('should render table headers with new Sale Items column', () => {
    render(<SalesTable salesData={mockSalesData} />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Sale Items')).toBeInTheDocument();
    expect(screen.getByText('Total Cost')).toBeInTheDocument();
    expect(screen.getByText('Net Total')).toBeInTheDocument();
    expect(screen.getByText('Total Amount')).toBeInTheDocument();
    expect(screen.getByText('Gross Profit')).toBeInTheDocument();
  });

  it('should render sale items as comma-separated names', () => {
    render(<SalesTable salesData={mockSalesData} />);

    expect(screen.getByText('สายชาร์จ iPhone, ฟิล์มกันรอย')).toBeInTheDocument();
    expect(screen.getByText('เคสโทรศัพท์')).toBeInTheDocument();
    expect(screen.getByText('แบตเตอรี่โทรศัพท์, ลำโพงพกพา, ที่ชาร์จไร้สาย')).toBeInTheDocument();
  });

  it('should render all sales data rows correctly', () => {
    render(<SalesTable salesData={mockSalesData} />);

    expect(screen.getByText('01/08/2025')).toBeInTheDocument();
    expect(screen.getByText('08/08/2025')).toBeInTheDocument();
    expect(screen.getByText('12/08/2025')).toBeInTheDocument();
    
    expect(screen.getAllByText('฿2,500.00')).toHaveLength(2); // Individual and total cost
    expect(screen.getByText('฿5,000.00')).toBeInTheDocument();
    expect(screen.getByText('10 ชิ้น')).toBeInTheDocument();
  });

  it('should calculate and display totals row correctly', () => {
    render(<SalesTable salesData={mockSalesData} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    
    // Total Cost: 2500 + 7800 + 15000 = 25300
    expect(screen.getByText('฿25,300.00')).toBeInTheDocument();
    
    // Net Total: 5000 + 12500 + 25000 = 42500
    expect(screen.getByText('฿42,500.00')).toBeInTheDocument();
    
    // Total Amount: 10 + 5 + 8 = 23
    expect(screen.getByText('23 ชิ้น')).toBeInTheDocument();
    
    // Gross Profit: 2500 + 4700 + 10000 = 17200
    expect(screen.getByText('฿17,200.00')).toBeInTheDocument();
  });

  it('should handle empty sale items array', () => {
    const emptySaleItemsData: SalesData[] = [{
      date: '2025-08-01',
      totalCost: 1000,
      netTotal: 2000,
      totalAmount: 1,
      grossProfit: 1000,
      saleItems: []
    }];

    render(<SalesTable salesData={emptySaleItemsData} />);

    expect(screen.getAllByText('-')).toHaveLength(2); // Sale Items column and totals row
  });

  it('should handle missing saleItems property', () => {
    const missingSaleItemsData = [{
      date: '2025-08-01',
      totalCost: 1000,
      netTotal: 2000,
      totalAmount: 1,
      grossProfit: 1000,
      saleItems: undefined
    }] as SalesData[];

    render(<SalesTable salesData={missingSaleItemsData} />);

    expect(screen.getAllByText('-')).toHaveLength(2); // Sale Items column and totals row
  });

  it('should handle empty sales data array', () => {
    render(<SalesTable salesData={[]} />);

    expect(screen.getByText('ตารางรายละเอียดจากงานขาย')).toBeInTheDocument();
    
    // Should still show totals row with zeros
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getAllByText('฿0.00')).toHaveLength(3); // Only 3 monetary columns show in totals (netTotal column is not zero)
    expect(screen.getByText('0 ชิ้น')).toBeInTheDocument();
  });

  it('should have proper table structure and accessibility', () => {
    render(<SalesTable salesData={mockSalesData} />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(6);
    
    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('ตารางรายละเอียดจากงานขาย');
  });

  it('should apply correct CSS classes for totals row', () => {
    const { container } = render(<SalesTable salesData={mockSalesData} />);
    
    const totalsRow = container.querySelector('tr.bg-gray-100.font-bold');
    expect(totalsRow).toBeInTheDocument();
  });
});