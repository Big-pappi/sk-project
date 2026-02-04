"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  MapPin,
  Store,
  Calendar,
  Clock,
  Search,
  Package,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import Loading from "./loading";

interface DeliveryHistory {
  id: string;
  status: string;
  pickup_address: string;
  delivery_address: string;
  distance_km: number;
  delivery_fee: number;
  created_at: string;
  picked_up_at: string | null;
  delivered_at: string | null;
  shop: { name: string };
}

export default function BodaHistoryPage() {
  const [deliveries, setDeliveries] = useState<DeliveryHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const supabase = createClient();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchHistory();
  }, [currentPage, statusFilter]);

  async function fetchHistory() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: bodaProfile } = await supabase
      .from("boda_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!bodaProfile) {
      setIsLoading(false);
      return;
    }

    let query = supabase
      .from("deliveries")
      .select(`
        id,
        status,
        pickup_address,
        delivery_address,
        distance_km,
        delivery_fee,
        created_at,
        picked_up_at,
        delivered_at,
        shop:shops(name)
      `, { count: "exact" })
      .eq("boda_id", bodaProfile.id)
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    
    const { data, count, error } = await query.range(from, to);

    if (!error && data) {
      setDeliveries(data as DeliveryHistory[]);
      setTotalCount(count || 0);
    }

    setIsLoading(false);
  }

  const filteredDeliveries = deliveries.filter(d =>
    d.shop?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.pickup_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.delivery_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-100 text-green-700">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = {
    total: totalCount,
    delivered: deliveries.filter(d => d.status === "delivered").length,
    totalEarnings: deliveries
      .filter(d => d.status === "delivered")
      .reduce((sum, d) => sum + (d.delivery_fee * 0.85), 0),
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Delivery History</h1>
        <p className="text-muted-foreground">View all your past deliveries</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Deliveries</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <span className="text-lg font-bold text-primary">TZS</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">{stats.totalEarnings.toLocaleString()}</p>
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
            placeholder="Search by shop or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Status</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* History List */}
      {filteredDeliveries.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No delivery history</h3>
            <p className="text-muted-foreground">Your completed deliveries will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDeliveries.map((delivery) => (
            <Card key={delivery.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{delivery.shop?.name || "Unknown Shop"}</span>
                      {getStatusBadge(delivery.status)}
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-orange-500 mt-0.5" />
                        <span className="text-muted-foreground">{delivery.pickup_address}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-muted-foreground">{delivery.delivery_address}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(delivery.created_at), "MMM d, yyyy")}
                      </span>
                      {delivery.delivered_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(delivery.delivered_at), "h:mm a")}
                        </span>
                      )}
                      <span>{delivery.distance_km.toFixed(1)} km</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Earnings</p>
                    <p className="text-lg font-bold text-primary">
                      TZS {(delivery.delivery_fee * 0.85).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
