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

  it('should render shop name correctly', () => {
    render(
      <ReportHeader 
        shopInfo={mockShopInfo} 
        reportPeriod={mockReportPeriod} 
      />
    );

    expect(screen.getByText('ร้านซ่อมของ Test Shop')).toBeInTheDocument();
  });

  it('should render report title correctly', () => {
    render(
      <ReportHeader 
        shopInfo={mockShopInfo} 
        reportPeriod={mockReportPeriod} 
      />
    );

    expect(screen.getByText(/Summary Report/)).toBeInTheDocument();
  });

  it('should render formatted report period with hyphen correctly', () => {
    render(
      <ReportHeader 
        shopInfo={mockShopInfo} 
        reportPeriod={mockReportPeriod} 
      />
    );

    expect(screen.getByText(/Summary Report 01\/08\/2025 - 31\/08\/2025/)).toBeInTheDocument();
  });

  it('should render shop address correctly', () => {
    render(
      <ReportHeader 
        shopInfo={mockShopInfo} 
        reportPeriod={mockReportPeriod} 
      />
    );

    expect(screen.getByText('123 Test Street, Test City 12345')).toBeInTheDocument();
  });

  it('should have proper semantic structure with two headings', () => {
    render(
      <ReportHeader 
        shopInfo={mockShopInfo} 
        reportPeriod={mockReportPeriod} 
      />
    );

    const shopNameHeading = screen.getByRole('heading', { level: 1 });
    expect(shopNameHeading).toHaveTextContent('ร้านซ่อมของ Test Shop');

    const reportTitleHeading = screen.getByRole('heading', { level: 2 });
    expect(reportTitleHeading).toHaveTextContent(/Summary Report 01\/08\/2025 - 31\/08\/2025/);
  });

  it('should have centered text layout', () => {
    const { container } = render(
      <ReportHeader 
        shopInfo={mockShopInfo} 
        reportPeriod={mockReportPeriod} 
      />
    );

    const centeredContainer = container.querySelector('.text-center');
    expect(centeredContainer).toBeInTheDocument();
  });

  it('should not have card styling elements', () => {
    const { container } = render(
      <ReportHeader 
        shopInfo={mockShopInfo} 
        reportPeriod={mockReportPeriod} 
      />
    );

    // Verify no card styling is present
    expect(container.querySelector('.bg-gray-50')).not.toBeInTheDocument();
    expect(container.querySelector('.border')).not.toBeInTheDocument();
    expect(container.querySelector('.rounded-lg')).not.toBeInTheDocument();
  });

  // Logo functionality tests
  it('should render logo when logoUrl is provided', () => {
    const logoUrl = 'https://example.com/logo.png';
    render(
      <ReportHeader 
        shopInfo={mockShopInfo} 
        reportPeriod={mockReportPeriod} 
        logoUrl={logoUrl}
      />
    );

    const logo = screen.getByAltText('Company Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', logoUrl);
  });

  it('should apply grayscale filter to logo', () => {
    const logoUrl = 'https://example.com/logo.png';
    render(
      <ReportHeader 
        shopInfo={mockShopInfo} 
        reportPeriod={mockReportPeriod} 
        logoUrl={logoUrl}
      />
    );

    const logo = screen.getByAltText('Company Logo');
    expect(logo).toHaveClass('grayscale');
  });

  it('should apply proper sizing constraints to logo', () => {
    const logoUrl = 'https://example.com/logo.png';
    render(
      <ReportHeader 
        shopInfo={mockShopInfo} 
        reportPeriod={mockReportPeriod} 
        logoUrl={logoUrl}
      />
    );

    const logo = screen.getByAltText('Company Logo');
    expect(logo).toHaveClass('max-h-16', 'max-w-32', 'object-contain');
  });

  it('should not render logo when logoUrl is null', () => {
    render(
      <ReportHeader 
        shopInfo={mockShopInfo} 
        reportPeriod={mockReportPeriod} 
        logoUrl={undefined}
      />
    );

    expect(screen.queryByAltText('Company Logo')).not.toBeInTheDocument();
  });

  it('should not render logo when logoUrl is undefined', () => {
    render(
      <ReportHeader 
        shopInfo={mockShopInfo} 
        reportPeriod={mockReportPeriod} 
        logoUrl={undefined}
      />
    );

    expect(screen.queryByAltText('Company Logo')).not.toBeInTheDocument();
  });

  it('should handle broken image URLs gracefully', () => {
    const logoUrl = 'https://example.com/broken-logo.png';
    render(
      <ReportHeader 
        shopInfo={mockShopInfo} 
        reportPeriod={mockReportPeriod} 
        logoUrl={logoUrl}
      />
    );

    const logo = screen.getByAltText('Company Logo');
    
    // Trigger error event
    logo.dispatchEvent(new Event('error'));
    
    // Verify logo is hidden after error
    expect(logo.style.display).toBe('none');
  });
});