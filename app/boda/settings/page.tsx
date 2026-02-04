"use client";

import React from "react"

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, User, Phone, Bike, Bell, Shield } from "lucide-react";

interface BodaProfile {
  id: string;
  user_id: string;
  vehicle_plate: string | null;
  vehicle_type: string | null;
  license_number: string | null;
  is_available: boolean;
  is_verified: boolean;
  current_lat: number | null;
  current_lng: number | null;
}

export default function BodaSettingsPage() {
  const [profile, setProfile] = useState<{ full_name: string; phone: string } | null>(null);
  const [bodaProfile, setBodaProfile] = useState<BodaProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    vehicle_plate: "",
    vehicle_type: "motorcycle",
    license_number: "",
  });

  const [notifications, setNotifications] = useState({
    newDeliveries: true,
    orderUpdates: true,
    earnings: true,
  });

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();

      // Fetch boda profile
      const { data: bodaData } = await supabase
        .from("boda_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFormData(prev => ({
          ...prev,
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
        }));
      }

      if (bodaData) {
        setBodaProfile(bodaData);
        setFormData(prev => ({
          ...prev,
          vehicle_plate: bodaData.vehicle_plate || "",
          vehicle_type: bodaData.vehicle_type || "motorcycle",
          license_number: bodaData.license_number || "",
        }));
      }

      setIsLoading(false);
    }

    fetchData();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update or create boda profile
      if (bodaProfile) {
        const { error: bodaError } = await supabase
          .from("boda_profiles")
          .update({
            vehicle_plate: formData.vehicle_plate || null,
            vehicle_type: formData.vehicle_type,
            license_number: formData.license_number || null,
          })
          .eq("user_id", user.id);

        if (bodaError) throw bodaError;
      } else {
        const { data: newBoda, error: bodaError } = await supabase
          .from("boda_profiles")
          .insert({
            user_id: user.id,
            vehicle_plate: formData.vehicle_plate || null,
            vehicle_type: formData.vehicle_type,
            license_number: formData.license_number || null,
            is_available: false,
          })
          .select()
          .single();

        if (bodaError) throw bodaError;
        setBodaProfile(newBoda);
      }

      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Settings save error:", error);
      toast.error("Failed to save settings");
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
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+255 xxx xxx xxx"
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bike className="h-5 w-5" />
            Vehicle Information
          </CardTitle>
          <CardDescription>Your vehicle details for deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle_plate">Vehicle Plate Number</Label>
                <Input
                  id="vehicle_plate"
                  value={formData.vehicle_plate}
                  onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })}
                  placeholder="T 123 ABC"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license_number">License Number</Label>
                <Input
                  id="license_number"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  placeholder="License number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
              <select
                id="vehicle_type"
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="motorcycle">Motorcycle (Boda Boda)</option>
                <option value="bicycle">Bicycle</option>
                <option value="car">Car</option>
                <option value="tricycle">Tricycle (Bajaji)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New Delivery Requests</p>
              <p className="text-sm text-muted-foreground">Get notified about new delivery opportunities</p>
            </div>
            <Switch
              checked={notifications.newDeliveries}
              onCheckedChange={(checked) => setNotifications({ ...notifications, newDeliveries: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Order Updates</p>
              <p className="text-sm text-muted-foreground">Updates about your active deliveries</p>
            </div>
            <Switch
              checked={notifications.orderUpdates}
              onCheckedChange={(checked) => setNotifications({ ...notifications, orderUpdates: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Earnings Notifications</p>
              <p className="text-sm text-muted-foreground">Get notified when you receive payments</p>
            </div>
            <Switch
              checked={notifications.earnings}
              onCheckedChange={(checked) => setNotifications({ ...notifications, earnings: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Account Verification</p>
              <p className="text-sm text-muted-foreground">
                {bodaProfile?.is_verified
                  ? "Your account is verified and ready to accept deliveries"
                  : "Your account is pending verification by admin"}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                bodaProfile?.is_verified
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
              }`}
            >
              {bodaProfile?.is_verified ? "Verified" : "Pending"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSubmit} disabled={isSaving} className="w-full sm:w-auto">
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </div>
  );
}
