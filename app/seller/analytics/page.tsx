"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  Eye,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  revenueChange: number;
  ordersChange: number;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  ordersByStatus: Array<{ status: string; count: number }>;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  categoryBreakdown: Array<{ category: string; value: number }>;
}

const COLORS = ["#22c55e", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899"];

export default function SellerAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");
  const supabase = createClient();

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  async function fetchAnalytics() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!shop) {
      setIsLoading(false);
      return;
    }

    // Calculate date range
    const now = new Date();
    const daysAgo = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(startDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Fetch orders for current period
    const { data: orders } = await supabase
      .from("orders")
      .select(`
        id,
        total_amount,
        status,
        created_at,
        order_items(
          quantity,
          price,
          product:products(name, category_id)
        )
      `)
      .eq("shop_id", shop.id)
      .gte("created_at", startDate.toISOString());

    // Fetch orders for previous period (for comparison)
    const { data: previousOrders } = await supabase
      .from("orders")
      .select("id, total_amount")
      .eq("shop_id", shop.id)
      .gte("created_at", previousStartDate.toISOString())
      .lt("created_at", startDate.toISOString());

    // Fetch products count
    const { count: productsCount } = await supabase
      .from("products")
      .select("id", { count: "exact" })
      .eq("shop_id", shop.id);

    // Calculate metrics
    const currentRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
    const previousRevenue = previousOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
    const revenueChange = previousRevenue ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    
    const currentOrdersCount = orders?.length || 0;
    const previousOrdersCount = previousOrders?.length || 0;
    const ordersChange = previousOrdersCount ? ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100 : 0;

    // Orders by status
    const statusCounts: Record<string, number> = {};
    orders?.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });
    const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

    // Revenue by day
    const revenueByDay: Record<string, { revenue: number; orders: number }> = {};
    orders?.forEach(o => {
      const date = new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!revenueByDay[date]) {
        revenueByDay[date] = { revenue: 0, orders: 0 };
      }
      revenueByDay[date].revenue += o.total_amount || 0;
      revenueByDay[date].orders += 1;
    });

    // Top products
    const productSales: Record<string, { name: string; sales: number; revenue: number }> = {};
    orders?.forEach(o => {
      o.order_items?.forEach((item: { quantity: number; price: number; product: { name: string } }) => {
        const name = item.product?.name || "Unknown";
        if (!productSales[name]) {
          productSales[name] = { name, sales: 0, revenue: 0 };
        }
        productSales[name].sales += item.quantity;
        productSales[name].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    setAnalytics({
      totalRevenue: currentRevenue,
      totalOrders: currentOrdersCount,
      totalProducts: productsCount || 0,
      averageOrderValue: currentOrdersCount ? currentRevenue / currentOrdersCount : 0,
      revenueChange,
      ordersChange,
      topProducts,
      ordersByStatus,
      revenueByDay: Object.entries(revenueByDay).map(([date, data]) => ({
        date,
        ...data,
      })),
      categoryBreakdown: [
        { category: "Electronics", value: 35 },
        { category: "Fashion", value: 25 },
        { category: "Food", value: 20 },
        { category: "Home", value: 15 },
        { category: "Other", value: 5 },
      ],
    });

    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-16">
        <p>No analytics data available. Create a shop first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your shop performance</p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(range)}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">TZS {analytics.totalRevenue.toLocaleString()}</p>
              </div>
              <div className={`flex items-center gap-1 text-sm ${analytics.revenueChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {analytics.revenueChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {Math.abs(analytics.revenueChange).toFixed(1)}%
              </div>
            </div>
            <div className="mt-2 p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{analytics.totalOrders}</p>
              </div>
              <div className={`flex items-center gap-1 text-sm ${analytics.ordersChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {analytics.ordersChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {Math.abs(analytics.ordersChange).toFixed(1)}%
              </div>
            </div>
            <div className="mt-2 p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Average Order Value</p>
              <p className="text-2xl font-bold">TZS {analytics.averageOrderValue.toLocaleString()}</p>
            </div>
            <div className="mt-2 p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{analytics.totalProducts}</p>
            </div>
            <div className="mt-2 p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Daily revenue for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.revenueByDay}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    formatter={(value: number) => [`TZS ${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
            <CardDescription>Distribution of order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {analytics.ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Your best performing products</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topProducts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No sales data yet</p>
          ) : (
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">TZS {product.revenue.toLocaleString()}</p>
                  </div>
                  <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${(product.revenue / analytics.topProducts[0].revenue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
