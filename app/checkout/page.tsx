"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { cartApi, ordersApi, authApi } from "@/lib/api/client";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Loader2,
  MapPin,
  CreditCard,
  Smartphone,
  Truck,
  CheckCircle,
} from "lucide-react";

interface CartItemWithProduct {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    discount_price: number | null;
    images: string[];
    stock_quantity: number;
    shop: { id: string; name: string; address?: string };
  };
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mobile_money");

  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    async function fetchData() {
      if (authLoading) return;
      
      if (!isAuthenticated) {
        router.push("/auth/login?redirect=/checkout");
        return;
      }

      // Fetch user profile for default address and phone
      const { data: profile } = await authApi.getProfile();

      if (profile) {
        setDeliveryAddress(profile.address || "");
        setPhone(profile.phone || "");
      }

      // Fetch cart items
      const { data: cartData, error } = await cartApi.getItems();

      if (error || !cartData || cartData.length === 0) {
        router.push("/cart");
        return;
      }

      setCartItems(cartData as CartItemWithProduct[]);
      setIsLoading(false);
    }

    fetchData();
  }, [isAuthenticated, authLoading, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getItemPrice = (item: CartItemWithProduct) => {
    const price = item.product.discount_price || item.product.price;
    return price * item.quantity;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + getItemPrice(item), 0);
  const deliveryFee = 2000;
  const platformFee = Math.round(subtotal * 0.1);
  const total = subtotal + deliveryFee + platformFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deliveryAddress || !phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await ordersApi.create({
        delivery_address: deliveryAddress,
        phone,
        notes: notes || undefined,
        payment_method: paymentMethod,
      });

      if (error) {
        toast.error(error);
        return;
      }

      if (data) {
        setOrderId(data.id);
        setOrderSuccess(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid md:grid-cols-2 gap-8">
              <Skeleton className="h-96 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your order. You will receive a confirmation shortly.
            </p>
            {orderId && (
              <p className="text-sm text-muted-foreground mb-6">
                Order ID: <span className="font-mono">{orderId.slice(0, 8)}</span>
              </p>
            )}
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/orders">View My Orders</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-5 gap-8">
              {/* Left Column - Forms */}
              <div className="md:col-span-3 space-y-6">
                {/* Delivery Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Delivery Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Textarea
                        id="address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter your delivery address"
                        required
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+255 xxx xxx xxx"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special instructions..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="space-y-3"
                    >
                      <Label
                        htmlFor="mobile_money"
                        className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                      >
                        <RadioGroupItem value="mobile_money" id="mobile_money" />
                        <Smartphone className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">Mobile Money</p>
                          <p className="text-sm text-muted-foreground">
                            M-Pesa, Tigo Pesa, Airtel Money
                          </p>
                        </div>
                      </Label>
                      <Label
                        htmlFor="cash"
                        className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                      >
                        <RadioGroupItem value="cash" id="cash" />
                        <Truck className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">
                            Pay when you receive your order
                          </p>
                        </div>
                      </Label>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Order Summary */}
              <div className="md:col-span-2">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
                            {item.product.name} x {item.quantity}
                          </span>
                          <span>{formatPrice(getItemPrice(item))}</span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span>{formatPrice(deliveryFee)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Platform Fee</span>
                        <span>{formatPrice(platformFee)}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay ${formatPrice(total)}`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
