"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Package,
  MapPin,
  Navigation,
  Search,
  Filter,
  Clock,
  Bike,
} from "lucide-react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import Loading from "./loading"

interface Delivery {
  id: string
  order_number: string
  pickup_address: string
  delivery_address: string
  estimated_distance: number
  delivery_fee: number
  created_at: string
  shop_name?: string
}

export default function BodaDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [hasActiveDelivery, setHasActiveDelivery] = useState(false)
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchDeliveries()
    checkActiveDelivery()
  }, [sortBy])

  const checkActiveDelivery = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("deliveries")
      .select("id")
      .eq("boda_id", user.id)
      .in("status", ["assigned", "picked_up", "in_transit"])
      .single()

    setHasActiveDelivery(!!data)
  }

  const fetchDeliveries = async () => {
    try {
      let query = supabase
        .from("deliveries")
        .select(`
          *,
          orders (
            order_number,
            shops (name)
          )
        `)
        .eq("status", "pending")
        .is("boda_id", null)

      if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false })
      } else if (sortBy === "distance") {
        query = query.order("estimated_distance", { ascending: true })
      } else if (sortBy === "fee") {
        query = query.order("delivery_fee", { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error

      setDeliveries(
        (data || []).map((d) => ({
          id: d.id,
          order_number: d.orders?.order_number || "",
          pickup_address: d.pickup_address,
          delivery_address: d.delivery_address,
          estimated_distance: d.estimated_distance,
          delivery_fee: d.delivery_fee,
          created_at: d.created_at,
          shop_name: d.orders?.shops?.name,
        }))
      )
    } catch (error) {
      console.error("Error fetching deliveries:", error)
      toast.error("Failed to load deliveries")
    } finally {
      setLoading(false)
    }
  }

  const acceptDelivery = async (deliveryId: string) => {
    if (hasActiveDelivery) {
      toast.error("Complete your current delivery first")
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from("deliveries")
        .update({
          boda_id: user.id,
          status: "assigned",
          assigned_at: new Date().toISOString(),
        })
        .eq("id", deliveryId)

      if (error) throw error

      toast.success("Delivery accepted! Go to Active Delivery.")
      setHasActiveDelivery(true)
      fetchDeliveries()
    } catch (error) {
      console.error("Error accepting delivery:", error)
      toast.error("Failed to accept delivery")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("sw-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000)

    if (diff < 1) return "Just now"
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return date.toLocaleDateString()
  }

  const filteredDeliveries = deliveries.filter(
    (d) =>
      d.pickup_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.delivery_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.order_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Available Deliveries</h1>
        <p className="text-muted-foreground mt-1">Browse and accept delivery requests</p>
      </div>

      {/* Warning if has active delivery */}
      {hasActiveDelivery && (
        <Card className="border-yellow-500/50 bg-yellow-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Bike className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">You have an active delivery</p>
              <p className="text-sm text-yellow-700">Complete it before accepting a new one</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by address or order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="distance">Shortest Distance</SelectItem>
            <SelectItem value="fee">Highest Fee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deliveries List */}
      {filteredDeliveries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No deliveries available</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "No deliveries match your search"
                : "Check back soon for new delivery requests"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDeliveries.map((delivery) => (
            <Card key={delivery.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Delivery Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline">#{delivery.order_number}</Badge>
                      {delivery.shop_name && (
                        <span className="text-sm font-medium">{delivery.shop_name}</span>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(delivery.created_at)}
                      </div>
                    </div>

                    {/* Route */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="h-3 w-3 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Pickup</p>
                          <p className="text-sm">{delivery.pickup_address}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Navigation className="h-3 w-3 text-red-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Deliver to</p>
                          <p className="text-sm">{delivery.delivery_address}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats & Action */}
                  <div className="flex items-center gap-6 lg:gap-8">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{delivery.estimated_distance.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">km</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(delivery.delivery_fee)}
                      </p>
                      <p className="text-xs text-muted-foreground">Fee</p>
                    </div>
                    <Button
                      onClick={() => acceptDelivery(delivery.id)}
                      disabled={hasActiveDelivery}
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
