import { Search, ShoppingCart, CreditCard, Bike } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse & Discover",
    description: "Explore thousands of products from verified local shops in your area",
  },
  {
    icon: ShoppingCart,
    title: "Add to Cart",
    description: "Select your favorite items and add them to your shopping cart",
  },
  {
    icon: CreditCard,
    title: "Secure Checkout",
    description: "Pay securely with mobile money or other payment methods",
  },
  {
    icon: Bike,
    title: "Fast Delivery",
    description: "Get your order delivered quickly by our trusted Boda Boda riders",
  },
];

export function HowItWorks() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Shopping made simple. From discovery to delivery in four easy steps.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-border" />
              )}
              
              {/* Step number & icon */}
              <div className="relative inline-flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 text-primary mb-4 relative z-10">
                  <step.icon className="h-7 w-7" />
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
