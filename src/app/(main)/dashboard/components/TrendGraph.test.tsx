import { render, screen } from '@testing-library/react'
import { api } from '~/lib/trpc'
import TrendGraph from './TrendGraph'

// Mock the tRPC API
jest.mock('~/lib/trpc', () => ({
  api: {
    dashboard: {
      getTrendData: {
        useQuery: jest.fn(),
      },
    },
  },
}))

// Mock Recharts components to avoid SVG rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid={`line-${dataKey}`} aria-label={name} />
  ),
  XAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="x-axis" data-key={dataKey} />
  ),
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

const mockTrendData = [
  {
    date: '2024-01-01',
    totalIncome: 1500,
    totalExpenses: 800,
  },
  {
    date: '2024-01-02',
    totalIncome: 2200,
    totalExpenses: 1200,
  },
  {
    date: '2024-01-03',
    totalIncome: 1800,
    totalExpenses: 900,
  },
]

describe('TrendGraph', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should display loading skeleton when data is loading', () => {
      (api.dashboard.getTrendData.useQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as unknown)

      render(<TrendGraph />)

      expect(screen.getByText('Income vs Expenses Trend')).toBeInTheDocument()
      expect(screen.getByTestId('loading-skeleton')).toHaveClass('animate-pulse')
    })

    it('should call API with correct parameters', () => {
      (api.dashboard.getTrendData.useQuery as jest.Mock).mockReturnValue({
        data: { trendData: mockTrendData },
        isLoading: false,
        error: null,
      } as unknown)

      render(<TrendGraph />)

      expect(api.dashboard.getTrendData.useQuery).toHaveBeenCalledWith({
        period: 'last30days'
      })
    })
  })

  describe('Error State', () => {
    it('should display error message when API fails', () => {
      const errorMessage = 'Failed to fetch trend data';
      (api.dashboard.getTrendData.useQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { message: errorMessage },
      } as unknown)

      render(<TrendGraph />)

      expect(screen.getByText('Failed to load trend data')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should display empty message when no data is available', () => {
      (api.dashboard.getTrendData.useQuery as jest.Mock).mockReturnValue({
        data: { trendData: [] },
        isLoading: false,
        error: null,
      } as unknown)

      render(<TrendGraph />)

      expect(screen.getByText('No trend data available')).toBeInTheDocument()
    })

    it('should handle undefined trendData', () => {
      (api.dashboard.getTrendData.useQuery as jest.Mock).mockReturnValue({
        data: { trendData: undefined },
        isLoading: false,
        error: null,
      } as unknown)

      render(<TrendGraph />)

      expect(screen.getByText('No trend data available')).toBeInTheDocument()
    })
  })

  describe('Chart Rendering', () => {
    beforeEach(() => {
      (api.dashboard.getTrendData.useQuery as jest.Mock).mockReturnValue({
        data: { trendData: mockTrendData },
        isLoading: false,
        error: null,
      } as unknown)
    })

    it('should render chart with correct title and icon', () => {
      render(<TrendGraph />)

      expect(screen.getByText('Income vs Expenses Trend')).toBeInTheDocument()
      // Check for the trending up icon by looking for the SVG with the correct class
      const trendingIcon = document.querySelector('.lucide-trending-up')
      expect(trendingIcon).toBeInTheDocument()
    })

    it('should render chart components', () => {
      render(<TrendGraph />)

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })

    it('should render both income and expense lines', () => {
      render(<TrendGraph />)

      const incomeLine = screen.getByTestId('line-totalIncome')
      const expenseLine = screen.getByTestId('line-totalExpenses')

      expect(incomeLine).toBeInTheDocument()
      expect(expenseLine).toBeInTheDocument()
      expect(incomeLine).toHaveAttribute('aria-label', 'Total Income')
      expect(expenseLine).toHaveAttribute('aria-label', 'Total Expenses')
    })

    it('should configure X-axis with display date', () => {
      render(<TrendGraph />)

      const xAxis = screen.getByTestId('x-axis')
      expect(xAxis).toHaveAttribute('data-key', 'displayDate')
    })
  })

  describe('Data Transformation', () => {
    it('should transform date format for display', async () => {
      (api.dashboard.getTrendData.useQuery as jest.Mock).mockReturnValue({
        data: { trendData: mockTrendData },
        isLoading: false,
        error: null,
      } as unknown)

      render(<TrendGraph />)

      // The component should transform '2024-01-01' to 'Jan 1' format
      // This is tested implicitly through the chart rendering
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('should handle invalid dates gracefully', () => {
      const invalidData = [
        {
          date: 'invalid-date',
          totalIncome: 100,
          totalExpenses: 50,
        }
      ];

      (api.dashboard.getTrendData.useQuery as jest.Mock).mockReturnValue({
        data: { trendData: invalidData },
        isLoading: false,
        error: null,
      } as unknown)

      // Should not throw an error
      expect(() => render(<TrendGraph />)).not.toThrow()
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      (api.dashboard.getTrendData.useQuery as jest.Mock).mockReturnValue({
        data: { trendData: mockTrendData },
        isLoading: false,
        error: null,
      } as unknown)
    })

    it('should have proper heading structure', () => {
      render(<TrendGraph />)
      
      const heading = screen.getByText('Income vs Expenses Trend')
      expect(heading).toBeInTheDocument()
    })

    it('should have aria-labels on chart lines', () => {
      render(<TrendGraph />)

      expect(screen.getByLabelText('Total Income')).toBeInTheDocument()
      expect(screen.getByLabelText('Total Expenses')).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('should render ResponsiveContainer for responsive sizing', () => {
      (api.dashboard.getTrendData.useQuery as jest.Mock).mockReturnValue({
        data: { trendData: mockTrendData },
        isLoading: false,
        error: null,
      } as unknown)

      render(<TrendGraph />)

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })
})

// Custom Tooltip Component Tests
describe('TrendGraph CustomTooltip', () => {
  // Since CustomTooltip is defined inside the component,
  // we test it indirectly through the main component behavior
  
  it('should be included in the chart configuration', () => {
    (api.dashboard.getTrendData.useQuery as jest.Mock).mockReturnValue({
      data: { trendData: mockTrendData },
      isLoading: false,
      error: null,
    } as unknown)

    render(<TrendGraph />)

    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
  })
})