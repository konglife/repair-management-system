"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { memo, useMemo } from "react"
import { api } from "~/lib/trpc"
import { formatCurrency } from "~/lib/utils"
import { Activity, ShoppingCart, Wrench, Package } from "lucide-react"

interface RecentActivity {
  id: string
  type: 'sale' | 'repair' | 'purchase'
  description: string
  amount: number
  customerName?: string
  date: Date
}

const ActivityIcon = ({ type }: { type: RecentActivity['type'] }) => {
  switch (type) {
    case 'sale':
      return <ShoppingCart className="h-4 w-4 text-green-500" />
    case 'repair':
      return <Wrench className="h-4 w-4 text-blue-500" />
    case 'purchase':
      return <Package className="h-4 w-4 text-orange-500" />
    default:
      return <Activity className="h-4 w-4 text-gray-500" />
  }
}

const formatActivityDate = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
}

const RecentActivities = memo(function RecentActivities() {
  const { data, isLoading, error } = api.dashboard.getRecentActivities.useQuery()

  const activities: RecentActivity[] = useMemo(() => 
    data?.activities || [], [data?.activities])

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Recent Activities</CardTitle>
          <Activity className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse mb-1" />
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
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
          <CardTitle className="text-lg font-medium">Recent Activities</CardTitle>
          <Activity className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Failed to load activities</p>
              <p className="text-muted-foreground text-xs mt-1">{error.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Recent Activities</CardTitle>
          <Activity className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground text-sm">No recent activities</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Recent Activities</CardTitle>
        <Activity className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3">
              <ActivityIcon type={activity.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {activity.description}
                </p>
                {activity.customerName && (
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.customerName}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end">
                <p className="text-sm font-medium">
                  {formatCurrency(activity.amount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatActivityDate(activity.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
})

export default RecentActivities