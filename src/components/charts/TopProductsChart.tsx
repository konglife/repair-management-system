"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { memo, useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { api } from "~/lib/trpc"
import { formatCurrency } from "~/lib/utils"
import { TrendingUp } from "lucide-react"

interface TopProductData {
  productName: string
  totalSales: number
  totalRevenue: number
}

type TimePeriod = 'today' | 'last7days' | 'thismonth'

interface TopProductsChartProps {
  period: TimePeriod
}

// Custom formatter for chart Y-axis (no decimals)
const formatCurrencyForChart = (value: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const CustomTooltip = ({ active, payload, label }: { 
  active?: boolean; 
  payload?: Array<{color: string; name: string; value: number; payload: TopProductData}>; 
  label?: string 
}) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload as TopProductData
    return (
      <div className="bg-background border rounded-lg p-3 shadow-md">
        <p className="font-semibold mb-2">{label}</p>
        <p className="text-sm" style={{ color: payload[0]?.color }}>
          {`Total Sales: ${data?.totalSales || 0} units`}
        </p>
        <p className="text-sm" style={{ color: payload[0]?.color }}>
          {`Revenue: ${formatCurrency(payload[0]?.value || 0)}`}
        </p>
      </div>
    )
  }
  return null
}

const TopProductsChart = memo(function TopProductsChart({ period }: TopProductsChartProps) {
  const { data, isLoading, error } = api.dashboard.getTopProducts.useQuery({
    period
  })

  const chartData: TopProductData[] = useMemo(() => 
    data?.topProducts || [], [data?.topProducts])

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Top 5 Selling Products</CardTitle>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full animate-pulse bg-muted rounded-md" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Top 5 Selling Products</CardTitle>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Failed to load top products data</p>
              <p className="text-muted-foreground text-xs mt-1">{error.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Top 5 Selling Products</CardTitle>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No sales data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Top 5 Selling Products</CardTitle>
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="productName" 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrencyForChart}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="totalRevenue" 
                fill="hsl(var(--chart-1))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
})

export default TopProductsChart