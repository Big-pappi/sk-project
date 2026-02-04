"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Wallet,
  TrendingUp,
  Calendar,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from "lucide-react"

interface EarningRecord {
  id: string
  order_number: string
  delivery_fee: number
  tip: number
  completed_at: string
  distance: number
}

export default function BodaEarningsPage() {
  const [stats, setStats] = useState({
    todayEarnings: 0,
    weekEarnings: 0,
    monthEarnings: 0,
    totalEarnings: 0,
    todayDeliveries: 0,
    weekDeliveries: 0,
  })
  const [earnings, setEarnings] = useState<EarningRecord[]>([])
  const [period, setPeriod] = useState("week")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchEarnings()
  }, [period])

  const fetchEarnings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch boda profile for total stats
      const { data: bodaProfile } = await supabase
        .from("boda_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      // Calculate date ranges
      const now = new Date()
      const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString()
      const weekStart = new Date(now.setDate(now.getDate() - 7)).toISOString()
      const monthStart = new Date(now.setMonth(now.getMonth() - 1)).toISOString()

      // Fetch completed deliveries
      let query = supabase
        .from("deliveries")
        .select(`
          *,
          orders (order_number)
        `)
        .eq("boda_id", user.id)
        .eq("status", "delivered")
        .order("delivered_at", { ascending: false })

      if (period === "today") {
        query = query.gte("delivered_at", todayStart)
      } else if (period === "week") {
        query = query.gte("delivered_at", weekStart)
      } else if (period === "month") {
        query = query.gte("delivered_at", monthStart)
      }

      const { data: deliveriesData } = await query

      // Calculate stats
      const deliveries = deliveriesData || []
      const todayDeliveries = deliveries.filter(d => new Date(d.delivered_at) >= new Date(todayStart))
      const weekDeliveries = deliveries.filter(d => new Date(d.delivered_at) >= new Date(weekStart))

      setStats({
        todayEarnings: todayDeliveries.reduce((sum, d) => sum + (d.delivery_fee || 0), 0),
        weekEarnings: weekDeliveries.reduce((sum, d) => sum + (d.delivery_fee || 0), 0),
        monthEarnings: deliveries.reduce((sum, d) => sum + (d.delivery_fee || 0), 0),
        totalEarnings: bodaProfile?.total_earnings || 0,
        todayDeliveries: todayDeliveries.length,
        weekDeliveries: weekDeliveries.length,
      })

      setEarnings(
        deliveries.map((d) => ({
          id: d.id,
          order_number: d.orders?.order_number || "",
          delivery_fee: d.delivery_fee,
          tip: d.tip || 0,
          completed_at: d.delivered_at,
          distance: d.estimated_distance,
        }))
      )
    } catch (error) {
      console.error("Error fetching earnings:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("sw-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Earnings</h1>
          <p className="text-muted-foreground mt-1">Track your delivery income</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs md:text-sm text-muted-foreground">Today</p>
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold">{formatCurrency(stats.todayEarnings)}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.todayDeliveries} deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs md:text-sm text-muted-foreground">This Week</p>
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold">{formatCurrency(stats.weekEarnings)}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.weekDeliveries} deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs md:text-sm text-muted-foreground">This Month</p>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold">{formatCurrency(stats.monthEarnings)}</p>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs md:text-sm opacity-80">Total Earnings</p>
              <div className="p-2 bg-primary-foreground/20 rounded-lg">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Earnings History</CardTitle>
              <CardDescription>Your completed deliveries and earnings</CardDescription>
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No earnings yet</h3>
              <p className="text-muted-foreground">
                Complete deliveries to start earning
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {earnings.map((earning) => (
                <div
                  key={earning.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Order #{earning.order_number}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(earning.completed_at)}</span>
                        <span>•</span>
                        <span>{earning.distance.toFixed(1)} km</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {formatCurrency(earning.delivery_fee)}
                    </p>
                    {earning.tip > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        +{formatCurrency(earning.tip)} tip
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
