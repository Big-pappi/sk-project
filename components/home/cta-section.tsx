import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Store, Bike, ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-12 md:py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Seller CTA */}
          <div className="bg-primary-foreground/10 rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-primary-foreground/20 mb-6">
              <Store className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Start Selling Today</h3>
            <p className="text-primary-foreground/80 mb-6">
              Join hundreds of local sellers and grow your business online. 
              Reach more customers and increase your sales.
            </p>
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                Easy product listing
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                Secure payments
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                Delivery handled for you
              </li>
            </ul>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/auth/sign-up?role=seller">
                Become a Seller
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Boda CTA */}
          <div className="bg-primary-foreground/10 rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-primary-foreground/20 mb-6">
              <Bike className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Earn as a Rider</h3>
            <p className="text-primary-foreground/80 mb-6">
              Be your own boss and earn money delivering orders with your 
              motorcycle. Flexible hours and great pay.
            </p>
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                Flexible schedule
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                Weekly payments
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                Performance bonuses
              </li>
            </ul>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/auth/sign-up?role=boda">
                Become a Rider
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
