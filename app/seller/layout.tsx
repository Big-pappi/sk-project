"use client";

import React from "react"

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Store,
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  LogOut,
  Plus,
  Bell,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const sidebarLinks = [
  { href: "/seller", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/seller/products", icon: Package, label: "Products" },
  { href: "/seller/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/seller/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/seller/settings", icon: Settings, label: "Settings" },
];

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const NavLinks = () => (
    <>
      {sidebarLinks.map((link) => {
        const isActive = pathname === link.href || 
          (link.href !== "/seller" && pathname.startsWith(link.href));
        
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 border-r bg-card">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-16 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-foreground">Sokoni</span>
              <span className="text-xs block text-muted-foreground">Seller Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavLinks />
        </nav>

        {/* Footer */}
        <div className="p-4 border-t space-y-2">
          <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 border-b bg-card/95 backdrop-blur">
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex items-center gap-2 px-4 h-16 border-b">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold">Sokoni</span>
                  <span className="text-xs block text-muted-foreground">Seller Portal</span>
                </div>
              </div>
              <nav className="p-4 space-y-1">
                <NavLinks />
              </nav>
              <div className="p-4 border-t">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="hidden md:block text-lg font-semibold">
            {sidebarLinks.find((l) => 
              pathname === l.href || (l.href !== "/seller" && pathname.startsWith(l.href))
            )?.label || "Dashboard"}
          </h1>

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button size="sm" asChild className="gap-2">
              <Link href="/seller/products/new">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Product</span>
              </Link>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
