"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { categoriesApi } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/categories/category-card";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/types";

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await categoriesApi.getAll();
      
      if (data) {
        // Filter active categories and limit to 10
        const activeCategories = (data as Category[])
          .filter(c => c.is_active)
          .sort((a, b) => a.sort_order - b.sort_order)
          .slice(0, 10);
        setCategories(activeCategories);
      }
      setIsLoading(false);
    }
    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
            </div>
          </div>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Shop by Category
            </h2>
            <p className="text-muted-foreground mt-1">
              Find exactly what you{"'"}re looking for
            </p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:flex gap-2">
            <Link href="/categories">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Mobile: Scrollable row */}
        <div className="flex overflow-x-auto gap-2 pb-4 -mx-4 px-4 sm:hidden scrollbar-hide">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} variant="compact" className="shrink-0" />
          ))}
        </div>

        {/* Desktop: Grid */}
        <div className="hidden sm:grid grid-cols-5 md:grid-cols-10 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} variant="compact" />
          ))}
        </div>

        <Button variant="ghost" asChild className="w-full mt-6 sm:hidden">
          <Link href="/categories">
            View All Categories
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
