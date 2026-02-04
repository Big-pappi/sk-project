"use client";

import React from "react"

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Store, MapPin, Phone, Mail } from "lucide-react";
import type { Shop } from "@/lib/types";

export default function SellerSettingsPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    logo_url: "",
    banner_url: "",
  });

  const supabase = createClient();

  useEffect(() => {
    async function fetchShop() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: shopData } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (shopData) {
        setShop(shopData);
        setFormData({
          name: shopData.name || "",
          description: shopData.description || "",
          address: shopData.address || "",
          phone: shopData.phone || "",
          email: shopData.email || "",
          logo_url: shopData.logo_url || "",
          banner_url: shopData.banner_url || "",
        });
      }

      setIsLoading(false);
    }

    fetchShop();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const shopData = {
        owner_id: user.id,
        name: formData.name,
        description: formData.description || null,
        address: formData.address,
        phone: formData.phone || null,
        email: formData.email || null,
        logo_url: formData.logo_url || null,
        banner_url: formData.banner_url || null,
      };

      if (shop) {
        // Update existing shop
        const { error } = await supabase
          .from("shops")
          .update(shopData)
          .eq("id", shop.id);

        if (error) throw error;
        toast.success("Shop updated successfully!");
      } else {
        // Create new shop
        const { data, error } = await supabase
          .from("shops")
          .insert(shopData)
          .select()
          .single();

        if (error) throw error;
        setShop(data);
        toast.success("Shop created successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save shop settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            {shop ? "Shop Settings" : "Create Your Shop"}
          </CardTitle>
          <CardDescription>
            {shop
              ? "Update your shop information and settings"
              : "Set up your shop to start selling products"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Shop Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your Shop Name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell customers about your shop..."
                  rows={3}
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-semibold">Contact Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address *
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Shop address"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+255 xxx xxx xxx"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="shop@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Branding */}
            <div className="space-y-4">
              <h3 className="font-semibold">Shop Branding</h3>
              
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner_url">Banner URL</Label>
                <Input
                  id="banner_url"
                  value={formData.banner_url}
                  onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                  placeholder="https://example.com/banner.png"
                />
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : shop ? (
                "Save Changes"
              ) : (
                "Create Shop"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {shop && (
        <Card>
          <CardHeader>
            <CardTitle>Shop Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Verification Status</p>
                <p className="text-sm text-muted-foreground">
                  {shop.is_verified
                    ? "Your shop is verified"
                    : "Pending verification by admin"}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  shop.is_verified
                    ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                }`}
              >
                {shop.is_verified ? "Verified" : "Pending"}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
