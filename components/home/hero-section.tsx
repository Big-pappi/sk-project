"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store, Bike, ShieldCheck } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Now serving your area!
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Your Local
              <span className="text-primary"> Marketplace</span>
              <br />
              at Your Fingertips
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg text-pretty">
              Discover amazing products from local shops, support your community, 
              and enjoy fast delivery with our trusted Boda Boda riders.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="gap-2">
                <Link href="/products">
                  Start Shopping
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/sign-up?role=seller">
                  <Store className="mr-2 h-4 w-4" />
                  Become a Seller
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Local Shops</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-primary">10K+</p>
                <p className="text-sm text-muted-foreground">Products</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-primary">50K+</p>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Decorative circles */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full animate-pulse" />
              <div className="absolute inset-8 bg-gradient-to-tr from-primary/30 to-accent/30 rounded-full" />
              
              {/* Feature cards */}
              <div className="absolute top-10 left-0 bg-card p-4 rounded-xl shadow-lg flex items-center gap-3 animate-float">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Local Shops</p>
                  <p className="text-xs text-muted-foreground">Support your community</p>
                </div>
              </div>

              <div className="absolute top-1/3 right-0 bg-card p-4 rounded-xl shadow-lg flex items-center gap-3 animate-float" style={{ animationDelay: "0.5s" }}>
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Bike className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-sm">Fast Delivery</p>
                  <p className="text-xs text-muted-foreground">Boda Boda riders</p>
                </div>
              </div>

              <div className="absolute bottom-20 left-10 bg-card p-4 rounded-xl shadow-lg flex items-center gap-3 animate-float" style={{ animationDelay: "1s" }}>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Secure Payments</p>
                  <p className="text-xs text-muted-foreground">100% protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
