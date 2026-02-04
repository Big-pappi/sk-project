"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DollarSign,
  Search,
  TrendingUp,
  Store,
  Bike,
  Building,
  Download,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import Loading from "./loading"

interface Payment {
  id: string
  order_number: string
  amount: number
  platform_fee: number
  seller_amount: number
  boda_fee: number
  payment_method: string
  status: string
  created_at: string
  shop_name: string
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stats, setStats] = useState({
    totalRevenue: 0,
    platformFees: 0,
    sellerPayouts: 0,
    bodaPayouts: 0,
    pendingPayments: 0,
  })
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchPayments()
  }, [statusFilter])

  const fetchPayments = async () => {
    try {
      let query = supabase
        .from("payments")
        .select(`
          *,
          orders (
            order_number,
            shops (name)
          )
        `)
        .order("created_at", { ascending: false })

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter)
      }

      const { data, error } = await query

      if (error) throw error

      const formattedPayments = (data || []).map((p) => ({
        id: p.id,
        order_number: p.orders?.order_number || "",
        amount: p.amount,
        platform_fee: p.platform_fee,
        seller_amount: p.seller_amount,
        boda_fee: p.boda_fee || 0,
        payment_method: p.payment_method,
        status: p.status,
        created_at: p.created_at,
        shop_name: p.orders?.shops?.name || "Unknown",
      }))

      setPayments(formattedPayments)

      // Calculate stats
      const completedPayments = formattedPayments.filter((p) => p.status === "completed")
      setStats({
        totalRevenue: completedPayments.reduce((sum, p) => sum + p.amount, 0),
        platformFees: completedPayments.reduce((sum, p) => sum + p.platform_fee, 0),
        sellerPayouts: completedPayments.reduce((sum, p) => sum + p.seller_amount, 0),
        bodaPayouts: completedPayments.reduce((sum, p) => sum + p.boda_fee, 0),
        pendingPayments: formattedPayments.filter((p) => p.status === "pending").length,
      })
    } catch (error) {
      console.error("Error fetching payments:", error)
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
      year: "numeric",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "failed":
        return <XCircle className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredPayments = payments.filter(
    (p) =>
      p.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shop_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Payment Management</h1>
          <p className="text-muted-foreground mt-1">Track revenue and payment distributions</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-xs md:text-sm opacity-80">Total Revenue</p>
                <p className="text-xl md:text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Platform Fees (10%)</p>
                <p className="text-lg md:text-xl font-bold">{formatCurrency(stats.platformFees)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Store className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Seller Payouts (80%)</p>
                <p className="text-lg md:text-xl font-bold">{formatCurrency(stats.sellerPayouts)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bike className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Boda Payouts (10%)</p>
                <p className="text-lg md:text-xl font-bold">{formatCurrency(stats.bodaPayouts)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
                <p className="text-lg md:text-xl font-bold">{stats.pendingPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Distribution Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Distribution Model</CardTitle>
          <CardDescription>How payments are split on each transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-blue-500 h-8 rounded-l-lg flex items-center justify-center text-white text-sm font-medium">
              Seller 80%
            </div>
            <div className="w-24 bg-primary h-8 flex items-center justify-center text-primary-foreground text-sm font-medium">
              Platform 10%
            </div>
            <div className="w-24 bg-orange-500 h-8 rounded-r-lg flex items-center justify-center text-white text-sm font-medium">
              Boda 10%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Platform Fee</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Boda</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No payments found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">#{payment.order_number}</TableCell>
                      <TableCell>{payment.shop_name}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(payment.platform_fee)}</TableCell>
                      <TableCell className="text-blue-600">{formatCurrency(payment.seller_amount)}</TableCell>
                      <TableCell className="text-orange-600">{formatCurrency(payment.boda_fee)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {payment.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(payment.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(payment.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
