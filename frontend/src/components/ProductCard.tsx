import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Star, Plus, Minus, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { Product } from "@/lib/data";
import { formatCurrency } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart, updateQuantity } = useCart();
  const isOnSale = !!product.salePrice;
  const displayPrice = isOnSale ? product.salePrice! : product.basePrice;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const cartItem = cart.find(i => i.id === product.id);
  const quantity = cartItem?.quantity || 0;

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

  const handleUpdateQuantity = (e: React.MouseEvent, newQuantity: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (newQuantity > product.stock) return;
    updateQuantity(product.id, newQuantity);
  };

  const handleNotify = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!localStorage.getItem('token')) {
      toast.error("Please login to set notifications");
      return;
    }
    try {
      const res = await fetch(`/api/products/${product.id}/stock-notify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getStockStatus = () => {
    if (isOutOfStock) return { label: "Out of Stock", class: "text-destructive" };
    if (isLowStock) return { label: `Only ${product.stock} left`, class: "text-amber-500 font-bold" };
    if (product.stock <= 10) return { label: "Low stock", class: "text-amber-500" };
    return { label: "In stock", class: "text-green-600" };
  };

  const stockStatus = getStockStatus();

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="bg-card rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
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
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground border-0 shadow-sm">
              SALE
            </Badge>
          )}
        </div>

        {/* Details */}
        <div className="p-4 flex flex-col flex-1">
          <div className="mb-auto">
            <p className="text-xs text-muted-foreground mb-1">{product.brand} • {product.category}</p>
            <h3 className="font-sans font-semibold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors h-10">
              {product.name}
            </h3>

            {/* Price */}
            <div className="mb-2">
              <span className="text-lg font-bold text-foreground">{formatCurrency(displayPrice)}</span>
              {isOnSale && (
                <span className="ml-2 text-sm text-muted-foreground line-through">{formatCurrency(product.basePrice)}</span>
              )}
              <span className="text-xs text-muted-foreground ml-1">/ {product.unit}</span>
            </div>

            {/* Stock Indicator */}
            <div className={cn("text-xs mb-4", stockStatus.class)}>
              {stockStatus.label}
            </div>
          </div>

          {/* Quick Add / Quantity Selector */}
          <div className="mt-4">
            {isOutOfStock ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNotify}
                className="w-full rounded-full gap-2 text-xs"
              >
                <Bell className="h-3 w-3" /> Notify Me
              </Button>
            ) : quantity === 0 ? (
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="w-full rounded-full gap-2 font-bold"
              >
                <Plus className="h-4 w-4" /> Add
              </Button>
            ) : (
              <div className="flex items-center justify-between bg-primary rounded-full p-0.5">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  onClick={(e) => handleUpdateQuantity(e, quantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-bold text-primary-foreground">{quantity}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  disabled={quantity >= product.stock}
                  onClick={(e) => handleUpdateQuantity(e, quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
