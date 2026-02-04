"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Loading } from "./loading"
import {
  Store,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Phone,
  Mail,
  Package,
} from "lucide-react"
import { toast } from "sonner"

interface Shop {
  id: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  logo_url: string | null
  is_verified: boolean
  is_active: boolean
  created_at: string
  owner_name: string
  product_count: number
}

export default function AdminShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchShops()
  }, [statusFilter])

  const fetchShops = async () => {
    try {
      let query = supabase
        .from("shops")
        .select(`
          *,
          profiles (full_name),
          products (id)
        `)
        .order("created_at", { ascending: false })

      if (statusFilter === "verified") {
        query = query.eq("is_verified", true)
      } else if (statusFilter === "pending") {
        query = query.eq("is_verified", false)
      }

      const { data, error } = await query

      if (error) throw error

      setShops(
        (data || []).map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          address: s.address,
          phone: s.phone,
          email: s.email,
          logo_url: s.logo_url,
          is_verified: s.is_verified,
          is_active: s.is_active,
          created_at: s.created_at,
          owner_name: s.profiles?.full_name || "Unknown",
          product_count: s.products?.length || 0,
        }))
      )
    } catch (error) {
      console.error("Error fetching shops:", error)
      toast.error("Failed to load shops")
    } finally {
      setLoading(false)
    }
  }

  const verifyShop = async (shopId: string) => {
    try {
      const { error } = await supabase
        .from("shops")
        .update({ is_verified: true })
        .eq("id", shopId)

      if (error) throw error

      toast.success("Shop verified successfully")
      fetchShops()
      setShowDetails(false)
    } catch (error) {
      console.error("Error verifying shop:", error)
      toast.error("Failed to verify shop")
    }
  }

  const rejectShop = async (shopId: string) => {
    try {
      const { error } = await supabase
        .from("shops")
        .update({ is_verified: false, is_active: false })
        .eq("id", shopId)

      if (error) throw error

      toast.success("Shop rejected")
      fetchShops()
      setShowDetails(false)
    } catch (error) {
      console.error("Error rejecting shop:", error)
      toast.error("Failed to reject shop")
    }
  }

  const toggleShopStatus = async (shopId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("shops")
        .update({ is_active: !isActive })
        .eq("id", shopId)

      if (error) throw error

      toast.success(isActive ? "Shop deactivated" : "Shop activated")
      fetchShops()
    } catch (error) {
      console.error("Error updating shop status:", error)
      toast.error("Failed to update shop status")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const filteredShops = shops.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingCount = shops.filter((s) => !s.is_verified).length
  const verifiedCount = shops.filter((s) => s.is_verified).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Shop Management</h1>
          <p className="text-muted-foreground mt-1">Verify and manage seller shops</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Store className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{shops.length}</p>
                  <p className="text-xs text-muted-foreground">Total Shops</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{verifiedCount}</p>
                  <p className="text-xs text-muted-foreground">Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={pendingCount > 0 ? "border-yellow-500" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search shops..."
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
              <SelectItem value="all">All Shops</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending Verification</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Shops Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShops.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Store className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No shops found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredShops.map((shop) => (
                      <TableRow key={shop.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Store className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{shop.name}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {shop.address}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{shop.owner_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            {shop.product_count}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant={shop.is_verified ? "default" : "secondary"}
                              className={shop.is_verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                            >
                              {shop.is_verified ? "Verified" : "Pending"}
                            </Badge>
                            {shop.is_verified && (
                              <Badge variant={shop.is_active ? "outline" : "secondary"} className="text-xs">
                                {shop.is_active ? "Active" : "Inactive"}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(shop.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedShop(shop)
                                setShowDetails(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!shop.is_verified && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-green-600"
                                  onClick={() => verifyShop(shop.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => rejectShop(shop.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Shop Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedShop?.name}</DialogTitle>
              <DialogDescription>Shop details and verification</DialogDescription>
            </DialogHeader>
            {selectedShop && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Owner</p>
                    <p className="font-medium">{selectedShop.owner_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Products</p>
                    <p className="font-medium">{selectedShop.product_count}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{selectedShop.description || "No description"}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {selectedShop.address || "No address"}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selectedShop.phone || "No phone"}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {selectedShop.email || "No email"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    className={selectedShop.is_verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                  >
                    {selectedShop.is_verified ? "Verified" : "Pending Verification"}
                  </Badge>
                  {selectedShop.is_verified && (
                    <Badge variant={selectedShop.is_active ? "default" : "secondary"}>
                      {selectedShop.is_active ? "Active" : "Inactive"}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              {selectedShop && !selectedShop.is_verified && (
                <>
                  <Button variant="outline" onClick={() => rejectShop(selectedShop.id)}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button onClick={() => verifyShop(selectedShop.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Shop
                  </Button>
                </>
              )}
              {selectedShop && selectedShop.is_verified && (
                <Button
                  variant={selectedShop.is_active ? "destructive" : "default"}
                  onClick={() => toggleShopStatus(selectedShop.id, selectedShop.is_active)}
                >
                  {selectedShop.is_active ? "Deactivate Shop" : "Activate Shop"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Suspense>
  )
}
