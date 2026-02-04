"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  MapPin,
  Phone,
  Navigation,
  CheckCircle,
  Package,
  Store,
  User,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface ActiveDelivery {
  id: string;
  status: string;
  pickup_address: string;
  delivery_address: string;
  distance_km: number;
  delivery_fee: number;
  picked_up_at: string | null;
  created_at: string;
  order: {
    id: string;
    total_amount: number;
    customer_phone: string;
    order_items: Array<{
      quantity: number;
      product: { name: string };
    }>;
  };
  shop: {
    name: string;
    phone: string;
    address: string;
  };
}

export default function BodaActivePage() {
  const [activeDelivery, setActiveDelivery] = useState<ActiveDelivery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchActiveDelivery();
    
    // Set up real-time subscription
    const channel = supabase
      .channel("active-delivery")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deliveries" },
        () => fetchActiveDelivery()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function fetchActiveDelivery() {
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

    const { data } = await supabase
      .from("deliveries")
      .select(`
        *,
        order:orders(
          id,
          total_amount,
          customer_phone,
          order_items(
            quantity,
            product:products(name)
          )
        ),
        shop:shops(name, phone, address)
      `)
      .eq("boda_id", bodaProfile.id)
      .in("status", ["assigned", "picked_up"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    setActiveDelivery(data);
    setIsLoading(false);
  }

  const updateDeliveryStatus = async (newStatus: string) => {
    if (!activeDelivery) return;
    setIsUpdating(true);

    try {
      const updates: Record<string, unknown> = { status: newStatus };
      
      if (newStatus === "picked_up") {
        updates.picked_up_at = new Date().toISOString();
      } else if (newStatus === "delivered") {
        updates.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("deliveries")
        .update(updates)
        .eq("id", activeDelivery.id);

      if (error) throw error;

      // Also update order status
      if (newStatus === "picked_up") {
        await supabase
          .from("orders")
          .update({ status: "in_transit" })
          .eq("id", activeDelivery.order.id);
      } else if (newStatus === "delivered") {
        await supabase
          .from("orders")
          .update({ status: "delivered" })
          .eq("id", activeDelivery.order.id);
      }

      toast.success(
        newStatus === "picked_up" 
          ? "Package picked up! Head to delivery location." 
          : "Delivery completed! Great job!"
      );
      
      fetchActiveDelivery();
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!activeDelivery) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Active Delivery</h2>
            <p className="text-muted-foreground mb-6">
              You don't have any active delivery at the moment.
            </p>
            <Button asChild>
              <Link href="/boda/deliveries">Browse Available Deliveries</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusSteps = [
    { key: "assigned", label: "Assigned", icon: Package },
    { key: "picked_up", label: "Picked Up", icon: Store },
    { key: "delivered", label: "Delivered", icon: CheckCircle },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === activeDelivery.status);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Active Delivery</h1>
        <p className="text-muted-foreground">Track and manage your current delivery</p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : isCurrent
                          ? "bg-primary/20 text-primary border-2 border-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs mt-2 ${isCurrent ? "font-semibold" : ""}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`w-16 sm:w-24 h-1 mx-2 rounded ${
                        index < currentStepIndex ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Delivery Details</CardTitle>
            <Badge variant={activeDelivery.status === "picked_up" ? "default" : "secondary"}>
              {activeDelivery.status === "assigned" ? "Ready for Pickup" : "In Transit"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Route */}
          <div className="space-y-4">
            {/* Pickup Location */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <Store className="h-4 w-4 text-orange-600" />
                </div>
                <div className="w-0.5 h-12 bg-border my-1" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Pickup from</p>
                <p className="font-semibold">{activeDelivery.shop.name}</p>
                <p className="text-sm text-muted-foreground">{activeDelivery.pickup_address}</p>
                {activeDelivery.shop.phone && (
                  <a
                    href={`tel:${activeDelivery.shop.phone}`}
                    className="inline-flex items-center gap-1 text-sm text-primary mt-1"
                  >
                    <Phone className="h-3 w-3" />
                    {activeDelivery.shop.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Delivery Location */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Deliver to</p>
                <p className="font-semibold">{activeDelivery.delivery_address}</p>
                {activeDelivery.order.customer_phone && (
                  <a
                    href={`tel:${activeDelivery.order.customer_phone}`}
                    className="inline-flex items-center gap-1 text-sm text-primary mt-1"
                  >
                    <Phone className="h-3 w-3" />
                    {activeDelivery.order.customer_phone}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Items to Deliver</h4>
            <div className="space-y-2">
              {activeDelivery.order.order_items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.product.name}</span>
                  <span className="text-muted-foreground">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 border-t pt-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="font-semibold">{activeDelivery.distance_km.toFixed(1)} km</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Delivery Fee</p>
              <p className="font-semibold text-primary">
                TZS {activeDelivery.delivery_fee.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Your Earnings</p>
              <p className="font-semibold text-green-600">
                TZS {(activeDelivery.delivery_fee * 0.85).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {activeDelivery.status === "assigned" && (
          <>
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeDelivery.pickup_address)}`,
                  "_blank"
                );
              }}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Navigate to Shop
            </Button>
            <Button
              className="flex-1"
              onClick={() => updateDeliveryStatus("picked_up")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Confirm Pickup
            </Button>
          </>
        )}

        {activeDelivery.status === "picked_up" && (
          <>
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeDelivery.delivery_address)}`,
                  "_blank"
                );
              }}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Navigate to Customer
            </Button>
            <Button
              className="flex-1"
              onClick={() => updateDeliveryStatus("delivered")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Confirm Delivery
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
