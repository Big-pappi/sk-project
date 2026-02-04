"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { cartApi } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, Store } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { isAuthenticated } = useAuth();

  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0;
  const displayPrice = hasDiscount ? product.discount_price : product.price;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    setIsAddingToCart(true);
    try {
      const { error } = await cartApi.addItem(product.id, 1);
      
      if (error) {
        toast.error(error);
      } else {
        toast.success("Added to cart!");
      }
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <Link href={`/products/${product.id}`}>
      <Card className={cn(
        "group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-card",
        className
      )}>
        <div className="relative aspect-square overflow-hidden bg-secondary/30">
          {product.images?.[0] ? (
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <Store className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && (
              <Badge className="bg-destructive text-destructive-foreground">
                -{discountPercent}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge variant="secondary">Featured</Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
              isWishlisted && "opacity-100 bg-destructive/10 text-destructive"
            )}
            onClick={handleWishlist}
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
            <span className="sr-only">Add to wishlist</span>
          </Button>

          {/* Quick Add to Cart */}
          <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
            <Button
              size="sm"
              className="w-full gap-2"
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock_quantity === 0}
            >
              <ShoppingCart className="h-4 w-4" />
              {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </div>

        <CardContent className="p-3">
          {/* Shop Name */}
          {product.shop && (
            <p className="text-xs text-muted-foreground mb-1 truncate">
              {product.shop.name}
            </p>
          )}

          {/* Product Name */}
          <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            <span className="text-xs text-muted-foreground">
              {product.shop?.rating?.toFixed(1) || "New"}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">
              {formatPrice(displayPrice!)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <p className="text-xs text-destructive mt-1">
              Only {product.stock_quantity} left!
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
