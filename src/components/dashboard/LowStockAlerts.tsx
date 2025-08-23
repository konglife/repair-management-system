"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { memo, useMemo } from "react"
import { api } from "~/lib/trpc"
import { AlertTriangle, Package } from "lucide-react"

interface LowStockProduct {
  id: string
  name: string
  currentStock: number
  category: string
  unit: string
}

const LowStockAlerts = memo(function LowStockAlerts() {
  const { data, isLoading, error } = api.dashboard.getLowStockAlerts.useQuery()

  const lowStockProducts: LowStockProduct[] = useMemo(() => 
    data?.lowStockProducts || [], [data?.lowStockProducts])

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Low Stock Alerts</CardTitle>
          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse mb-1" />
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-4 w-12 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Low Stock Alerts</CardTitle>
          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Failed to load stock alerts</p>
              <p className="text-muted-foreground text-xs mt-1">{error.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (lowStockProducts.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Low Stock Alerts</CardTitle>
          <Package className="h-5 w-5 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <div className="text-center">
              <Package className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-green-600 font-medium">All products well-stocked!</p>
              <p className="text-muted-foreground text-sm">No items below threshold</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Low Stock Alerts</CardTitle>
        <div className="flex items-center">
          <span className="text-sm font-medium text-red-600 mr-2">
            {lowStockProducts.length}
          </span>
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[250px] overflow-y-auto">
          {lowStockProducts.map((product) => (
            <div key={product.id} className="flex items-center space-x-3 p-2 rounded-lg border border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-red-900">
                  {product.name}
                </p>
                <p className="text-xs text-red-700 truncate">
                  {product.category}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-sm font-bold text-red-600">
                  {product.currentStock}
                </p>
                <p className="text-xs text-red-500">
                  {product.unit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
})

export default LowStockAlerts