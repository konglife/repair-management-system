import { render, screen } from '@testing-library/react';
import PurchasesTable from './PurchasesTable';
import type { PurchaseRecordDetail } from './types';

describe('PurchasesTable', () => {
  const mockPurchaseData: PurchaseRecordDetail[] = [
    {
      id: 'p1',
      quantity: 10,
      costPerUnit: 250,
      purchaseDate: '2025-08-01',
      product: { name: 'สายชาร์จ iPhone' }
    },
    {
      id: 'p2',
      quantity: 5,
      costPerUnit: 1500,
      purchaseDate: '2025-08-03',
      product: { name: 'แบตเตอรี่ 12V' }
    },
    {
      id: 'p3',
      quantity: 20,
      costPerUnit: 150,
      purchaseDate: '2025-08-05',
      product: { name: 'ฟิล์มกันรอย' }
    }
  ];

  it('should render table title correctly', () => {
    render(<PurchasesTable purchaseData={mockPurchaseData} />);

    expect(screen.getByText('ตารางรายละเอียดจากการซื้อสินค้า')).toBeInTheDocument();
  });

  it('should render table headers correctly', () => {
    render(<PurchasesTable purchaseData={mockPurchaseData} />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Product Name')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Cost Per Unit')).toBeInTheDocument();
    expect(screen.getByText('Total Cost')).toBeInTheDocument();
  });

  it('should render all purchase data rows correctly', () => {
    render(<PurchasesTable purchaseData={mockPurchaseData} />);

    expect(screen.getByText('01/08/2025')).toBeInTheDocument();
    expect(screen.getByText('03/08/2025')).toBeInTheDocument();
    expect(screen.getByText('05/08/2025')).toBeInTheDocument();
    
    expect(screen.getByText('สายชาร์จ iPhone')).toBeInTheDocument();
    expect(screen.getByText('แบตเตอรี่ 12V')).toBeInTheDocument();
    expect(screen.getByText('ฟิล์มกันรอย')).toBeInTheDocument();
    
    expect(screen.getByText('10 ชิ้น')).toBeInTheDocument();
    expect(screen.getByText('5 ชิ้น')).toBeInTheDocument();
    expect(screen.getByText('20 ชิ้น')).toBeInTheDocument();
    
    expect(screen.getByText('฿250.00')).toBeInTheDocument();
    expect(screen.getByText('฿1,500.00')).toBeInTheDocument();
    expect(screen.getByText('฿150.00')).toBeInTheDocument();
  });

  it('should calculate and display individual total costs correctly', () => {
    render(<PurchasesTable purchaseData={mockPurchaseData} />);
    
    // 10 * 250 = 2500
    expect(screen.getByText('฿2,500.00')).toBeInTheDocument();
    
    // 5 * 1500 = 7500
    expect(screen.getByText('฿7,500.00')).toBeInTheDocument();
    
    // 20 * 150 = 3000
    expect(screen.getByText('฿3,000.00')).toBeInTheDocument();
  });

  it('should calculate and display totals row correctly', () => {
    render(<PurchasesTable purchaseData={mockPurchaseData} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    
    // Total Quantity: 10 + 5 + 20 = 35
    expect(screen.getByText('35 ชิ้น')).toBeInTheDocument();
    
    // Total Cost: 2500 + 7500 + 3000 = 13000
    expect(screen.getByText('฿13,000.00')).toBeInTheDocument();
    
    // Cost per unit should show dash for totals
    const dashCells = screen.getAllByText('-');
    expect(dashCells.length).toBeGreaterThanOrEqual(2); // At least in totals row
  });

  it('should handle empty purchase data array', () => {
    render(<PurchasesTable purchaseData={[]} />);

    expect(screen.getByText('ตารางรายละเอียดจากการซื้อสินค้า')).toBeInTheDocument();
    
    // Should still show totals row with zeros
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('0 ชิ้น')).toBeInTheDocument();
    expect(screen.getByText('฿0.00')).toBeInTheDocument(); // Only one total cost column
  });

  it('should handle single purchase record correctly', () => {
    const singlePurchaseData: PurchaseRecordDetail[] = [{
      id: 'p1',
      quantity: 3,
      costPerUnit: 1000,
      purchaseDate: '2025-08-01',
      product: { name: 'Test Product' }
    }];

    render(<PurchasesTable purchaseData={singlePurchaseData} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getAllByText('3 ชิ้น')).toHaveLength(2); // Individual row and totals row
    expect(screen.getByText('฿1,000.00')).toBeInTheDocument();
    expect(screen.getAllByText('฿3,000.00')).toHaveLength(2); // Individual and total cost
  });

  it('should have proper table structure and accessibility', () => {
    render(<PurchasesTable purchaseData={mockPurchaseData} />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(5);
    
    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('ตารางรายละเอียดจากการซื้อสินค้า');
  });

  it('should apply correct CSS classes for totals row', () => {
    const { container } = render(<PurchasesTable purchaseData={mockPurchaseData} />);
    
    const totalsRow = container.querySelector('tr.bg-gray-100.font-bold');
    expect(totalsRow).toBeInTheDocument();
  });

  it('should handle zero quantities correctly', () => {
    const zeroQuantityData: PurchaseRecordDetail[] = [{
      id: 'p1',
      quantity: 0,
      costPerUnit: 500,
      purchaseDate: '2025-08-01',
      product: { name: 'Zero Quantity Product' }
    }];

    render(<PurchasesTable purchaseData={zeroQuantityData} />);

    expect(screen.getAllByText('0 ชิ้น')).toHaveLength(2); // Individual row and totals row
    expect(screen.getAllByText('฿0.00')).toHaveLength(2); // Total cost column shows zero twice
  });

  it('should handle zero cost per unit correctly', () => {
    const zeroCostData: PurchaseRecordDetail[] = [{
      id: 'p1',
      quantity: 5,
      costPerUnit: 0,
      purchaseDate: '2025-08-01',
      product: { name: 'Free Product' }
    }];

    render(<PurchasesTable purchaseData={zeroCostData} />);

    expect(screen.getAllByText('5 ชิ้น')).toHaveLength(2); // Individual row and totals row
    expect(screen.getAllByText('฿0.00')).toHaveLength(3); // Cost per unit, total cost, and total row
  });
});