import React from "react"
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Smartphone,
  Shirt,
  UtensilsCrossed,
  Home,
  Heart,
  Dumbbell,
  BookOpen,
  Car,
  Baby,
  Wrench,
  Package,
} from "lucide-react";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  electronics: Smartphone,
  fashion: Shirt,
  "food-beverages": UtensilsCrossed,
  "home-garden": Home,
  "health-beauty": Heart,
  "sports-outdoors": Dumbbell,
  "books-stationery": BookOpen,
  automotive: Car,
  "baby-kids": Baby,
  services: Wrench,
};

interface CategoryCardProps {
  category: Category;
  className?: string;
  variant?: "default" | "compact";
}

export function CategoryCard({ category, className, variant = "default" }: CategoryCardProps) {
  const Icon = iconMap[category.slug] || Package;

  if (variant === "compact") {
    return (
      <Link href={`/categories/${category.slug}`}>
        <div className={cn(
          "flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary transition-colors",
          className
        )}>
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <span className="text-xs font-medium text-center line-clamp-1">
            {category.name}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/categories/${category.slug}`}>
      <Card className={cn(
        "group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card",
        className
      )}>
        <div className="flex items-center gap-4 p-4">
          <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
