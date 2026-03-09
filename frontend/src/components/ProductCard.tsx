import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "@/lib/data";
import { formatCurrency } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const isOnSale = !!product.salePrice;
  const displayPrice = isOnSale ? product.salePrice! : product.basePrice;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
      quantity: 1,
      image: product.image,
      unit: product.unit,
    });
  };

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="bg-card rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square bg-muted/50 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          {isOnSale && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground border-0">
              SALE
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="secondary" className="absolute top-3 right-3">
              Out of Stock
            </Badge>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <Badge className="absolute top-3 right-3 bg-warning text-foreground border-0">
              Only {product.stock} left
            </Badge>
          )}
        </div>

        {/* Details */}
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{product.brand} • {product.category}</p>
          <h3 className="font-sans font-semibold text-sm leading-snug mb-2 min-h-[2.5rem] line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(product.averageRating) ? "fill-warning text-warning" : "text-muted"}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-foreground">{formatCurrency(displayPrice)}</span>
              {isOnSale && (
                <span className="ml-2 text-sm text-muted-foreground line-through">{formatCurrency(product.basePrice)}</span>
              )}
              <span className="block text-xs text-muted-foreground">per {product.unit}</span>
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="rounded-full h-9 w-9 p-0"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
