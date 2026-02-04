"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth/context"
import { deliveriesApi } from "@/lib/api/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Bike,
  Package,
  Wallet,
  MapPin,
  Clock,
  TrendingUp,
  Star,
  Navigation,
  Phone,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

interface ActiveDelivery {
  id: string
  order_id: string
  order_number: string
  pickup_address: string
  delivery_address: string
  customer_name: string
  customer_phone: string
  distance_km: number
  delivery_fee: number
  status: string
}

interface AvailableDelivery {
  id: string
  order_id: string
  order_number: string
  pickup_address: string
  delivery_address: string
  distance_km: number
  delivery_fee: number
}

interface Stats {
  todayDeliveries: number
  todayEarnings: number
  totalDeliveries: number
  rating: number
  pendingDeliveries: number
}

export default function BodaDashboard() {
  const [stats, setStats] = useState<Stats>({
    todayDeliveries: 0,
    todayEarnings: 0,
    totalDeliveries: 0,
    rating: 4.8,
    pendingDeliveries: 0,
  })
  const [activeDelivery, setActiveDelivery] = useState<ActiveDelivery | null>(null)
  const [availableDeliveries, setAvailableDeliveries] = useState<AvailableDelivery[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [isAuthenticated, authLoading])

  const fetchDashboardData = async () => {
    if (authLoading) return
    if (!isAuthenticated) return

    try {
      // Fetch stats
      const { data: statsData } = await deliveriesApi.getStats()
      if (statsData) {
        setStats({
          todayDeliveries: statsData.today_deliveries,
          todayEarnings: statsData.today_earnings,
          totalDeliveries: statsData.total_deliveries,
          rating: statsData.rating,
          pendingDeliveries: 0,
        })
      }

      // Fetch active delivery
      const { data: activeData } = await deliveriesApi.getActive()
      if (activeData) {
        setActiveDelivery(activeData as ActiveDelivery)
      }

      // Fetch available deliveries
      const { data: availableData } = await deliveriesApi.getAvailable()
      if (availableData) {
        setAvailableDeliveries(availableData as AvailableDelivery[])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const acceptDelivery = async (deliveryId: string) => {
    try {
      const { error } = await deliveriesApi.accept(deliveryId)
      if (!error) {
        fetchDashboardData()
      }
    } catch (error) {
      console.error("Error accepting delivery:", error)
    }
  }

  const updateDeliveryStatus = async (status: string) => {
    if (!activeDelivery) return
    
    try {
      const { error } = await deliveriesApi.updateStatus(activeDelivery.id, status)
      if (!error) {
        fetchDashboardData()
      }
    } catch (error) {
      console.error("Error updating delivery status:", error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("sw-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading || authLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here{"'"}s your delivery overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-primary/10 rounded-xl">
                <Package className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Today{"'"}s Deliveries</p>
                <p className="text-xl md:text-2xl font-bold">{stats.todayDeliveries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-accent/20 rounded-xl">
                <Wallet className="h-5 w-5 md:h-6 md:w-6 text-accent" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Today{"'"}s Earnings</p>
                <p className="text-xl md:text-2xl font-bold">{formatCurrency(stats.todayEarnings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-blue-100 rounded-xl">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Deliveries</p>
                <p className="text-xl md:text-2xl font-bold">{stats.totalDeliveries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-yellow-100 rounded-xl">
                <Star className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Rating</p>
                <p className="text-xl md:text-2xl font-bold">{stats.rating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Delivery */}
      {activeDelivery && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bike className="h-5 w-5 text-primary" />
                  Active Delivery
                </CardTitle>
                <CardDescription>Order #{activeDelivery.order_number}</CardDescription>
              </div>
              <Badge variant={activeDelivery.status === "picked_up" ? "default" : "secondary"}>
                {activeDelivery.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Route Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pickup from</p>
                  <p className="font-medium">{activeDelivery.pickup_address}</p>
                </div>
              </div>
              <div className="ml-4 border-l-2 border-dashed border-muted h-6" />
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Navigation className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Deliver to</p>
                  <p className="font-medium">{activeDelivery.delivery_address}</p>
                </div>
              </div>
            </div>

            {/* Customer & Delivery Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Distance</p>
                <p className="font-semibold">{activeDelivery.distance_km.toFixed(1)} km</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Delivery Fee</p>
                <p className="font-semibold text-primary">{formatCurrency(activeDelivery.delivery_fee)}</p>
              </div>
            </div>

            {/* Customer Contact */}
            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <span className="font-semibold">{activeDelivery.customer_name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium">{activeDelivery.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{activeDelivery.customer_phone}</p>
                </div>
              </div>
              <Button variant="outline" size="icon" asChild>
                <a href={`tel:${activeDelivery.customer_phone}`}>
                  <Phone className="h-4 w-4" />
                </a>
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {activeDelivery.status === "assigned" && (
                <Button 
                  className="flex-1" 
                  onClick={() => updateDeliveryStatus("picked_up")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Pickup
                </Button>
              )}
              {activeDelivery.status === "picked_up" && (
                <Button 
                  className="flex-1"
                  onClick={() => updateDeliveryStatus("in_transit")}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Start Delivery
                </Button>
              )}
              {activeDelivery.status === "in_transit" && (
                <Button 
                  className="flex-1"
                  onClick={() => updateDeliveryStatus("delivered")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Delivery
                </Button>
              )}
              <Button variant="outline" asChild>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeDelivery.delivery_address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Navigate
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Deliveries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Available Deliveries</CardTitle>
              <CardDescription>Accept new delivery requests nearby</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/boda/deliveries">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {availableDeliveries.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No deliveries available right now</p>
              <p className="text-sm text-muted-foreground">Check back soon for new requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{delivery.order_number}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {delivery.distance_km.toFixed(1)} km
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3 w-3 text-green-600" />
                      <span className="truncate">{delivery.pickup_address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Navigation className="h-3 w-3 text-red-600" />
                      <span className="truncate">{delivery.delivery_address}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-primary">{formatCurrency(delivery.delivery_fee)}</p>
                      <p className="text-xs text-muted-foreground">Delivery Fee</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => acceptDelivery(delivery.id)}
                      disabled={!!activeDelivery}
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Stay Online</p>
                <p className="text-xs text-muted-foreground">More online time = more delivery opportunities</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Maintain Rating</p>
                <p className="text-xs text-muted-foreground">High ratings get priority assignments</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Handle with Care</p>
                <p className="text-xs text-muted-foreground">Safe delivery ensures customer satisfaction</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
