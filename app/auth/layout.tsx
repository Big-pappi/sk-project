import React from "react"
import Link from "next/link";
import { Store } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left - Form */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl">Sokoni Kiganjani</span>
          </Link>
          {children}
        </div>
      </div>

      {/* Right - Branding */}
      <div className="hidden lg:flex flex-col justify-center bg-primary p-12">
        <div className="max-w-lg mx-auto text-primary-foreground">
          <h1 className="text-4xl font-bold mb-6">
            Your Local Marketplace Awaits
          </h1>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Join thousands of buyers and sellers connecting through Sokoni Kiganjani. 
            Shop local, support your community, and enjoy fast delivery.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-primary-foreground/10 rounded-xl p-4">
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm text-primary-foreground/80">Local Shops</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-xl p-4">
              <p className="text-3xl font-bold">10K+</p>
              <p className="text-sm text-primary-foreground/80">Products</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-xl p-4">
              <p className="text-3xl font-bold">200+</p>
              <p className="text-sm text-primary-foreground/80">Boda Riders</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-xl p-4">
              <p className="text-3xl font-bold">50K+</p>
              <p className="text-sm text-primary-foreground/80">Happy Customers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
