"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Package,
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  Store,
  Truck,
  CheckCircle,
  XCircle,
  Star,
  MessageSquare,
  Copy,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(
            id,
            quantity,
            price,
            product:products(id, name, images, description)
          ),
          shop:shops(id, name, logo_url, phone, address),
          delivery:deliveries(
            id,
            status,
            picked_up_at,
            delivered_at,
            boda:boda_profiles(
              id,
              vehicle_plate,
              profile:profiles(full_name, phone)
            )
          )
        `)
        .eq("id", id)
        .eq("customer_id", user.id)
        .single();

      if (data) {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [id, supabase, router]);

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    setCancelling(true);
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled", notes: cancelReason })
      .eq("id", order.id);

    if (error) {
      toast.error("Failed to cancel order");
    } else {
      toast.success("Order cancelled successfully");
      setOrder({ ...order, status: "cancelled" });
    }
    setCancelling(false);
  };

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("reviews").insert({
      user_id: user?.id,
      shop_id: order.shop_id,
      order_id: order.id,
      rating,
      comment: reviewText,
    });

    if (error) {
      toast.error("Failed to submit review");
    } else {
      toast.success("Review submitted successfully!");
      setReviewDialogOpen(false);
    }
    setSubmittingReview(false);
  };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.order_number);
    toast.success("Order number copied!");
  };

  const getStatusStep = (status: string) => {
    const steps = ["pending", "confirmed", "preparing", "ready", "picked_up", "delivered"];
    return steps.indexOf(status);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 lg:p-8 text-center">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Order not found</h2>
        <p className="text-muted-foreground mb-4">
          This order doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link href="/account/orders">
          <Button>Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const currentStep = getStatusStep(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Order #{order.order_number}
            </h1>
            <Button variant="ghost" size="icon" onClick={copyOrderNumber}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Clock className="h-4 w-4" />
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex gap-3">
          {order.status === "delivered" && (
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Star className="h-4 w-4" />
                  Write Review
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rate your experience</DialogTitle>
                  <DialogDescription>
                    How was your order from {order.shop?.name}?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Share your experience..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {["pending", "confirmed"].includes(order.status) && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Cancel Order
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Order</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel this order? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="Please provide a reason for cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                />
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                  >
                    {cancelling ? "Cancelling..." : "Confirm Cancellation"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Order Progress */}
      {!isCancelled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="flex justify-between mb-2">
                {["Pending", "Confirmed", "Preparing", "Ready", "On the way", "Delivered"].map(
                  (step, index) => (
                    <div
                      key={step}
                      className={`flex flex-col items-center ${
                        index <= currentStep ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center mb-2 ${
                          index <= currentStep
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {index < currentStep ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <span className="text-xs text-center hidden sm:block">{step}</span>
                    </div>
                  )
                )}
              </div>
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted -z-10">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancelled Notice */}
      {isCancelled && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <XCircle className="h-8 w-8 text-destructive" />
              <div>
                <h3 className="font-semibold text-destructive">Order Cancelled</h3>
                <p className="text-muted-foreground">
                  {order.notes || "This order has been cancelled."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({order.order_items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.order_items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-lg border border-border"
                >
                  <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {item.product?.images?.[0] ? (
                      <img
                        src={item.product.images[0] || "/placeholder.svg"}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.product?.name}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.product?.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </span>
                      <span className="font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Delivery Info */}
          {order.delivery?.[0] && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {order.delivery[0].boda?.profile?.full_name || "Boda Rider"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vehicle: {order.delivery[0].boda?.vehicle_plate || "N/A"}
                    </p>
                  </div>
                  {order.delivery[0].boda?.profile?.phone && (
                    <a href={`tel:${order.delivery[0].boda.profile.phone}`}>
                      <Button variant="outline" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          {/* Shop Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Store className="h-5 w-5" />
                Shop Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                {order.shop?.logo_url ? (
                  <img
                    src={order.shop.logo_url || "/placeholder.svg"}
                    alt={order.shop.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-semibold">{order.shop?.name}</p>
                  <p className="text-sm text-muted-foreground">{order.shop?.address}</p>
                </div>
              </div>
              {order.shop?.phone && (
                <a href={`tel:${order.shop.phone}`}>
                  <Button variant="outline" className="w-full gap-2 bg-transparent">
                    <Phone className="h-4 w-4" />
                    Contact Shop
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{order.delivery_address}</p>
              {order.delivery_notes && (
                <p className="text-sm text-muted-foreground mt-2">
                  Note: {order.delivery_notes}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>{formatPrice(order.delivery_fee)}</span>
              </div>
              {order.service_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span>{formatPrice(order.service_fee)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total_amount)}</span>
              </div>
              <Badge variant="outline" className="w-full justify-center py-2">
                {order.payment_status === "paid" ? "Paid" : "Payment Pending"}
              </Badge>
            </CardContent>
          </Card>

          {/* Need Help */}
          <Card>
            <CardContent className="py-4">
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <MessageSquare className="h-4 w-4" />
                Need Help?
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
