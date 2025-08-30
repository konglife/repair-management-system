import { render, screen } from '@testing-library/react';
import OverviewMetricsComponent from './OverviewMetrics';
import type { OverviewMetrics } from './types';

describe('OverviewMetrics', () => {
  const mockOverview: OverviewMetrics = {
    expenses: 835000,
    totalRepairs: 42,
    totalSales: 18,
    salesProfit: 854000,
    repairIncome: 126000,
    salesIncome: 89000,
    repairProfit: 91000,
    grossProfit: 145000
  };

  it('should render overview section title', () => {
    render(<OverviewMetricsComponent overview={mockOverview} />);

    expect(screen.getByText('ภาพรวม')).toBeInTheDocument();
  });

  it('should render all financial metrics correctly', () => {
    render(<OverviewMetricsComponent overview={mockOverview} />);

    expect(screen.getByText(/Expenses.*ค่าใช้จ่าย/)).toBeInTheDocument();
    expect(screen.getByText('฿835,000.00')).toBeInTheDocument();
    
    expect(screen.getByText(/Sales Profit.*กำไรงานขาย/)).toBeInTheDocument();
    expect(screen.getByText('฿854,000.00')).toBeInTheDocument();
    
    expect(screen.getByText(/Repair Income.*รายได้จากงานซ่อม/)).toBeInTheDocument();
    expect(screen.getByText('฿126,000.00')).toBeInTheDocument();
    
    expect(screen.getByText(/Sales Income.*รายได้จากงานขาย/)).toBeInTheDocument();
    expect(screen.getByText('฿89,000.00')).toBeInTheDocument();
    
    expect(screen.getByText(/Repair Profit.*กำไรงานซ่อม/)).toBeInTheDocument();
    expect(screen.getByText('฿91,000.00')).toBeInTheDocument();
    
    expect(screen.getByText(/Gross Profit.*กำไรขั้นต้น/)).toBeInTheDocument();
    expect(screen.getByText('฿145,000.00')).toBeInTheDocument();
  });

  it('should render count metrics correctly', () => {
    render(<OverviewMetricsComponent overview={mockOverview} />);

    expect(screen.getByText(/Total Repairs.*จำนวนงานซ่อม/)).toBeInTheDocument();
    expect(screen.getByText('42 งาน')).toBeInTheDocument();
    
    expect(screen.getByText(/Total Sales.*จำนวนงานขาย/)).toBeInTheDocument();
    expect(screen.getByText('18 งาน')).toBeInTheDocument();
  });

  it('should handle zero values correctly', () => {
    const zeroOverview: OverviewMetrics = {
      expenses: 0,
      totalRepairs: 0,
      totalSales: 0,
      salesProfit: 0,
      repairIncome: 0,
      salesIncome: 0,
      repairProfit: 0,
      grossProfit: 0
    };

    render(<OverviewMetricsComponent overview={zeroOverview} />);

    expect(screen.getAllByText('฿0.00')).toHaveLength(6); // 6 financial metrics with currency
    expect(screen.getAllByText('0 งาน')).toHaveLength(2); // Both count metrics
  });

  it('should have proper grid layout structure', () => {
    const { container } = render(<OverviewMetricsComponent overview={mockOverview} />);
    
    const gridContainer = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
    expect(gridContainer).toBeInTheDocument();
  });

  it('should have proper semantic heading structure', () => {
    render(<OverviewMetricsComponent overview={mockOverview} />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('ภาพรวม');
  });
});