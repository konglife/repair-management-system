import { render, screen } from '@testing-library/react';
import RepairsTable from './RepairsTable';
import type { RepairsData } from './types';

describe('RepairsTable', () => {
  const mockRepairsData: RepairsData[] = [
    {
      date: '2025-08-02',
      description: 'เปลี่ยนแบตเตอรี่รถมอเตอร์ไซค์',
      partsCost: 1200,
      laborCost: 500,
      totalCost: 1700,
      usedParts: [{ name: 'แบตเตอรี่ 12V', costAtTime: 1200 }]
    },
    {
      date: '2025-08-05',
      description: 'ซ่อมแผงวงจรทีวี',
      partsCost: 800,
      laborCost: 1500,
      totalCost: 2300,
      usedParts: [
        { name: 'คาปาซิเตอร์', costAtTime: 400 },
        { name: 'ไอซี', costAtTime: 400 }
      ]
    },
    {
      date: '2025-08-11',
      description: 'ล้างและปรับแต่งคาร์บูเรเตอร์',
      partsCost: 400,
      laborCost: 1000,
      totalCost: 1400,
      usedParts: [
        { name: 'ยางซีลคาร์บู', costAtTime: 200 },
        { name: 'น้ำมันหล่อลื่น', costAtTime: 200 }
      ]
    }
  ];

  it('should render table title correctly', () => {
    render(<RepairsTable repairsData={mockRepairsData} />);

    expect(screen.getByText('ตารางรายละเอียดจากงานซ่อม')).toBeInTheDocument();
  });

  it('should render table headers with new Parts Used column', () => {
    render(<RepairsTable repairsData={mockRepairsData} />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Parts Used')).toBeInTheDocument();
    expect(screen.getByText('Parts Cost')).toBeInTheDocument();
    expect(screen.getByText('Labor Cost')).toBeInTheDocument();
    expect(screen.getByText('Total Cost')).toBeInTheDocument();
  });

  it('should render used parts with names and costs', () => {
    render(<RepairsTable repairsData={mockRepairsData} />);

    expect(screen.getByText('แบตเตอรี่ 12V (฿1,200.00)')).toBeInTheDocument();
    expect(screen.getByText('คาปาซิเตอร์ (฿400.00), ไอซี (฿400.00)')).toBeInTheDocument();
    expect(screen.getByText('ยางซีลคาร์บู (฿200.00), น้ำมันหล่อลื่น (฿200.00)')).toBeInTheDocument();
  });

  it('should render all repair data rows correctly', () => {
    render(<RepairsTable repairsData={mockRepairsData} />);

    expect(screen.getByText('02/08/2025')).toBeInTheDocument();
    expect(screen.getByText('05/08/2025')).toBeInTheDocument();
    expect(screen.getByText('11/08/2025')).toBeInTheDocument();
    
    expect(screen.getByText('เปลี่ยนแบตเตอรี่รถมอเตอร์ไซค์')).toBeInTheDocument();
    expect(screen.getByText('ซ่อมแผงวงจรทีวี')).toBeInTheDocument();
    expect(screen.getByText('ล้างและปรับแต่งคาร์บูเรเตอร์')).toBeInTheDocument();
    
    expect(screen.getByText('฿1,200.00')).toBeInTheDocument();
    expect(screen.getByText('฿500.00')).toBeInTheDocument();
    expect(screen.getByText('฿1,700.00')).toBeInTheDocument();
  });

  it('should calculate and display totals row correctly', () => {
    render(<RepairsTable repairsData={mockRepairsData} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    
    // Parts Cost: 1200 + 800 + 400 = 2400
    expect(screen.getByText('฿2,400.00')).toBeInTheDocument();
    
    // Labor Cost: 500 + 1500 + 1000 = 3000
    expect(screen.getByText('฿3,000.00')).toBeInTheDocument();
    
    // Total Cost: 1700 + 2300 + 1400 = 5400
    expect(screen.getByText('฿5,400.00')).toBeInTheDocument();
  });

  it('should handle empty used parts array', () => {
    const emptyUsedPartsData: RepairsData[] = [{
      date: '2025-08-01',
      description: 'Simple repair',
      partsCost: 0,
      laborCost: 1000,
      totalCost: 1000,
      usedParts: []
    }];

    render(<RepairsTable repairsData={emptyUsedPartsData} />);

    const partsUsedCells = screen.getAllByText('-');
    expect(partsUsedCells.length).toBeGreaterThan(0);
  });

  it('should handle missing usedParts property', () => {
    const missingUsedPartsData = [{
      date: '2025-08-01',
      description: 'Simple repair',
      partsCost: 0,
      laborCost: 1000,
      totalCost: 1000,
      usedParts: undefined
    }] as RepairsData[];

    render(<RepairsTable repairsData={missingUsedPartsData} />);

    const partsUsedCells = screen.getAllByText('-');
    expect(partsUsedCells.length).toBeGreaterThan(0);
  });

  it('should handle empty repairs data array', () => {
    render(<RepairsTable repairsData={[]} />);

    expect(screen.getByText('ตารางรายละเอียดจากงานซ่อม')).toBeInTheDocument();
    
    // Should still show totals row with zeros
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getAllByText('฿0.00')).toHaveLength(3); // All 3 monetary columns
  });

  it('should have proper table structure and accessibility', () => {
    render(<RepairsTable repairsData={mockRepairsData} />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(6);
    
    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('ตารางรายละเอียดจากงานซ่อม');
  });

  it('should apply correct CSS classes for totals row', () => {
    const { container } = render(<RepairsTable repairsData={mockRepairsData} />);
    
    const totalsRow = container.querySelector('tr.bg-gray-100.font-bold');
    expect(totalsRow).toBeInTheDocument();
  });

  it('should handle single used part correctly', () => {
    const singlePartData: RepairsData[] = [{
      date: '2025-08-01',
      description: 'Replace single part',
      partsCost: 500,
      laborCost: 300,
      totalCost: 800,
      usedParts: [{ name: 'Test Part', costAtTime: 500 }]
    }];

    render(<RepairsTable repairsData={singlePartData} />);

    expect(screen.getByText('Test Part (฿500.00)')).toBeInTheDocument();
  });
});