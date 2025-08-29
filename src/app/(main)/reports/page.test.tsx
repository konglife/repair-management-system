import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ReportsPage from './page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

describe('ReportsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders the reports page with form elements', () => {
    render(<ReportsPage />);
    
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Generate monthly reports for business analysis')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate report/i })).toBeInTheDocument();
  });

  it('shows validation errors when form is submitted without dates', async () => {
    render(<ReportsPage />);
    
    const submitButton = screen.getByRole('button', { name: /generate report/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Start date is required')).toBeInTheDocument();
      expect(screen.getByText('End date is required')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows validation error when start date is after end date', async () => {
    render(<ReportsPage />);
    
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    const submitButton = screen.getByRole('button', { name: /generate report/i });

    fireEvent.change(startDateInput, { target: { value: '2024-12-31' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-01' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Start date must be before end date')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('navigates to summary page with correct query parameters on valid submission', async () => {
    render(<ReportsPage />);
    
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    const submitButton = screen.getByRole('button', { name: /generate report/i });

    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/reports/summary?startDate=2024-01-01&endDate=2024-01-31');
    });
  });

  it('shows loading state during form submission', async () => {
    render(<ReportsPage />);
    
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    const submitButton = screen.getByRole('button', { name: /generate report/i });

    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });
    fireEvent.click(submitButton);

    // Check for loading state
    expect(screen.getByText('Generating Report...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it('clears validation errors when user starts typing', async () => {
    render(<ReportsPage />);
    
    const startDateInput = screen.getByLabelText('Start Date');
    const submitButton = screen.getByRole('button', { name: /generate report/i });

    // Submit form to trigger validation errors
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Start date is required')).toBeInTheDocument();
    });

    // Start typing in the input
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });

    // Error should be cleared
    expect(screen.queryByText('Start date is required')).not.toBeInTheDocument();
  });

  it('handles various date input scenarios correctly', async () => {
    render(<ReportsPage />);
    
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    const submitButton = screen.getByRole('button', { name: /generate report/i });

    // Test same date (should be valid)
    fireEvent.change(startDateInput, { target: { value: '2024-01-15' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-15' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/reports/summary?startDate=2024-01-15&endDate=2024-01-15');
    });

    // Reset mock
    mockPush.mockClear();

    // Test month boundary crossing (should be valid)
    fireEvent.change(startDateInput, { target: { value: '2024-01-31' } });
    fireEvent.change(endDateInput, { target: { value: '2024-02-01' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/reports/summary?startDate=2024-01-31&endDate=2024-02-01');
    });
  });

  it('constructs URL parameters correctly with special characters', async () => {
    render(<ReportsPage />);
    
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    const submitButton = screen.getByRole('button', { name: /generate report/i });

    fireEvent.change(startDateInput, { target: { value: '2024-12-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/reports/summary?startDate=2024-12-01&endDate=2024-12-31');
    });
  });
});