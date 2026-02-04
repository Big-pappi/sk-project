"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Package,
  Heart,
  MapPin,
  CreditCard,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";

export default function AccountPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    wishlistCount: 0,
    totalSpent: 0,
    reviewsGiven: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      // Fetch orders stats
      const { data: orders } = await supabase
        .from("orders")
        .select("*, order_items(quantity, price)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (orders) {
        const pending = orders.filter(o => ["pending", "confirmed", "preparing"].includes(o.status));
        const delivered = orders.filter(o => o.status === "delivered");
        const totalSpent = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

        setStats({
          totalOrders: orders.length,
          pendingOrders: pending.length,
          deliveredOrders: delivered.length,
          wishlistCount: 0, // Will implement wishlist
          totalSpent,
          reviewsGiven: 0,
        });

        setRecentOrders(orders.slice(0, 5));
      }

      // Fetch wishlist count
      const { count: wishlistCount } = await supabase
        .from("wishlist")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      
      if (wishlistCount) {
        setStats(prev => ({ ...prev, wishlistCount }));
      }

      // Fetch reviews count
      const { count: reviewsCount } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      
      if (reviewsCount) {
        setStats(prev => ({ ...prev, reviewsGiven: reviewsCount }));
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Pending", variant: "secondary" },
      confirmed: { label: "Confirmed", variant: "default" },
      preparing: { label: "Preparing", variant: "default" },
      ready: { label: "Ready", variant: "default" },
      picked_up: { label: "On the way", variant: "default" },
      delivered: { label: "Delivered", variant: "outline" },
      cancelled: { label: "Cancelled", variant: "destructive" },
    };
    const config = statusConfig[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Welcome back, {profile?.full_name?.split(" ")[0] || "Customer"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your orders
          </p>
        </div>
        <Link href="/products">
          <Button className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold text-primary mt-1">{stats.totalOrders}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-accent mt-1">{stats.pendingOrders}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Truck className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.deliveredOrders}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wishlist</p>
                <p className="text-3xl font-bold text-pink-600 mt-1">{stats.wishlistCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Spent Card */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-primary-foreground/80 text-sm">Total Amount Spent</p>
              <p className="text-3xl lg:text-4xl font-bold mt-1">{formatPrice(stats.totalSpent)}</p>
              <p className="text-primary-foreground/80 text-sm mt-2">
                Across {stats.totalOrders} orders
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto">
                  <Star className="h-8 w-8" />
                </div>
                <p className="text-sm mt-2">{stats.reviewsGiven} Reviews</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <p className="text-sm mt-2">Loyal Customer</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <Link href="/account/orders">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <Link href="/products">
                    <Button className="mt-4">Start Shopping</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/account/orders/${order.id}`}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Order #{order.order_number}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <p className="text-sm font-medium mt-1">
                          {formatPrice(order.total_amount)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/account/orders" className="block">
                <Button variant="outline" className="w-full justify-start gap-3 bg-transparent">
                  <Package className="h-5 w-5 text-primary" />
                  Track My Orders
                </Button>
              </Link>
              <Link href="/account/wishlist" className="block">
                <Button variant="outline" className="w-full justify-start gap-3 bg-transparent">
                  <Heart className="h-5 w-5 text-pink-500" />
                  View Wishlist
                </Button>
              </Link>
              <Link href="/account/addresses" className="block">
                <Button variant="outline" className="w-full justify-start gap-3 bg-transparent">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  Manage Addresses
                </Button>
              </Link>
              <Link href="/account/settings" className="block">
                <Button variant="outline" className="w-full justify-start gap-3 bg-transparent">
                  <CreditCard className="h-5 w-5 text-green-500" />
                  Payment Methods
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email Verified</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Phone Added</span>
                  {profile?.phone ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Link href="/account/settings">
                      <Badge variant="outline" className="cursor-pointer">Add</Badge>
                    </Link>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Address Saved</span>
                  <Link href="/account/addresses">
                    <Badge variant="outline" className="cursor-pointer">Add</Badge>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
