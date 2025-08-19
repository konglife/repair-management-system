"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Wrench,
  ShoppingCart
} from "lucide-react"
import { api } from "~/lib/trpc"
import TrendGraph from "./components/TrendGraph"

type TimePeriod = 'today' | 'last7days' | 'thismonth'

const timeRangeOptions = [
  { value: 'today' as TimePeriod, label: 'Today' },
  { value: 'last7days' as TimePeriod, label: 'Last 7 Days' },
  { value: 'thismonth' as TimePeriod, label: 'This Month' },
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('thismonth')
  
  const { data: summaryData, isLoading, error } = api.dashboard.getSummary.useQuery({
    period: selectedPeriod
  })

  const handlePeriodChange = (value: TimePeriod) => {
    setSelectedPeriod(value)
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-10">
          <h2 className="text-lg font-semibold text-red-600">Error loading dashboard</h2>
          <p className="text-muted-foreground mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your repair shop management dashboard
          </p>
        </div>
        
        <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {timeRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Expenses Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-20 animate-pulse bg-muted rounded" />
              ) : (
                formatCurrency(summaryData?.totalExpenses ?? 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total expenditures
            </p>
          </CardContent>
        </Card>

        {/* Repair Income Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repair Income</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-20 animate-pulse bg-muted rounded" />
              ) : (
                formatCurrency(summaryData?.totalRepairIncome ?? 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue from repairs
            </p>
          </CardContent>
        </Card>

        {/* Sales Income Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Income</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-20 animate-pulse bg-muted rounded" />
              ) : (
                formatCurrency(summaryData?.totalSalesIncome ?? 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue from sales
            </p>
          </CardContent>
        </Card>

        {/* Sales Profit Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-20 animate-pulse bg-muted rounded" />
              ) : (
                formatCurrency(summaryData?.salesProfit ?? 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Profit from sales
            </p>
          </CardContent>
        </Card>

        {/* Repair Profit Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repair Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-20 animate-pulse bg-muted rounded" />
              ) : (
                formatCurrency(summaryData?.repairProfit ?? 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Labor cost revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Graph Section */}
      <div className="w-full">
        <TrendGraph />
      </div>
    </div>
  )
}