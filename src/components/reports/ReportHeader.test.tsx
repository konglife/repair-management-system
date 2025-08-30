import { render, screen } from '@testing-library/react';
import ReportHeader from './ReportHeader';
import type { ShopInformation, ReportPeriod } from './types';

describe('ReportHeader', () => {
  const mockShopInfo: ShopInformation = {
    name: 'ร้านซ่อมของ Test Shop',
    address: '123 Test Street, Test City 12345',
    phone: '089-123-4567'
  };

  const mockReportPeriod: ReportPeriod = {
    startDate: '2025-08-01',
    endDate: '2025-08-31'
  };

  it('should render report title correctly', () => {
    render(
      <ReportHeader 
        shopInfo={mockShopInfo} 
        reportPeriod={mockReportPeriod} 
      />
    );

    expect(screen.getByText('รายงานสรุปข้อมูลรายเดือน')).toBeInTheDocument();
  });

  it('should render formatted report period', () => {
    render(
      <ReportHeader 
        shopInfo={mockShopInfo} 
        reportPeriod={mockReportPeriod} 
      />
    );

    expect(screen.getByText(/Report Period:/)).toBeInTheDocument();
    expect(screen.getByText(/01\/08\/2025 - 31\/08\/2025/)).toBeInTheDocument();
  });

  it('should render shop information correctly', () => {
    render(
      <ReportHeader 
        shopInfo={mockShopInfo} 
        reportPeriod={mockReportPeriod} 
      />
    );

    expect(screen.getByText('ร้านซ่อมของ Test Shop')).toBeInTheDocument();
    expect(screen.getByText(/123 Test Street, Test City 12345/)).toBeInTheDocument();
    expect(screen.getByText(/089-123-4567/)).toBeInTheDocument();
  });

  it('should have proper semantic structure', () => {
    render(
      <ReportHeader 
        shopInfo={mockShopInfo} 
        reportPeriod={mockReportPeriod} 
      />
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('รายงานสรุปข้อมูลรายเดือน');
  });

  it('should apply correct CSS classes for styling', () => {
    const { container } = render(
      <ReportHeader 
        shopInfo={mockShopInfo} 
        reportPeriod={mockReportPeriod} 
      />
    );

    const shopPanel = container.querySelector('.bg-gray-50.border.border-gray-200.rounded-lg');
    expect(shopPanel).toBeInTheDocument();
  });
});