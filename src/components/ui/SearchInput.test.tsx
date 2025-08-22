import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchInput } from './SearchInput';

// Mock the debounce for testing
jest.useFakeTimers();

describe('SearchInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  it('renders with default placeholder', () => {
    render(<SearchInput onChange={mockOnChange} />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<SearchInput placeholder="Search products..." onChange={mockOnChange} />);
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
  });

  it('displays search icon', () => {
    render(<SearchInput onChange={mockOnChange} />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<SearchInput placeholder="Search products..." onChange={mockOnChange} />);
    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('aria-label', 'Search search products...');
  });

  it('handles input changes with debouncing', async () => {
    render(<SearchInput onChange={mockOnChange} debounceMs={300} />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'test search' } });
    
    // onChange should not be called immediately
    expect(mockOnChange).not.toHaveBeenCalled();
    
    // Fast-forward time to trigger debounced function
    jest.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('test search');
    });
  });

  it('shows clear button when input has value', () => {
    render(<SearchInput onChange={mockOnChange} />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('does not show clear button when input is empty', () => {
    render(<SearchInput onChange={mockOnChange} />);
    
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('clears input when clear button is clicked', async () => {
    render(<SearchInput onChange={mockOnChange} />);
    const input = screen.getByRole('searchbox');

    // Type something
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Click clear button
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);
    
    expect(input).toHaveValue('');
    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('applies custom className', () => {
    render(<SearchInput onChange={mockOnChange} className="custom-class" />);
    const container = screen.getByRole('searchbox').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('handles controlled value prop', () => {
    const { rerender } = render(<SearchInput value="initial" onChange={mockOnChange} />);
    const input = screen.getByRole('searchbox');
    
    expect(input).toHaveValue('initial');
    
    rerender(<SearchInput value="updated" onChange={mockOnChange} />);
    expect(input).toHaveValue('updated');
  });

  it('debounces multiple rapid changes', async () => {
    render(<SearchInput onChange={mockOnChange} debounceMs={300} />);
    const input = screen.getByRole('searchbox');

    // Type multiple characters rapidly
    fireEvent.change(input, { target: { value: 't' } });
    fireEvent.change(input, { target: { value: 'te' } });
    fireEvent.change(input, { target: { value: 'tes' } });
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Should not call onChange yet
    expect(mockOnChange).not.toHaveBeenCalled();
    
    // Fast-forward to trigger debounced function
    jest.advanceTimersByTime(300);
    
    await waitFor(() => {
      // Should only be called once with the final value
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith('test');
    });
  });

  it('supports custom debounce timing', async () => {
    render(<SearchInput onChange={mockOnChange} debounceMs={500} />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'test' } });
    
    // Should not trigger at 300ms
    jest.advanceTimersByTime(300);
    expect(mockOnChange).not.toHaveBeenCalled();
    
    // Should trigger at 500ms
    jest.advanceTimersByTime(200);
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('test');
    });
  });
});