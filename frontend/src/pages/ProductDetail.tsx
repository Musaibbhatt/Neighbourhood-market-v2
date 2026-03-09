import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { products, formatCurrency } from "@/lib/data";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Minus, Plus } from "lucide-react";
import { useState } from "react";

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold">Product Not Found</h1>
        </div>
      </Layout>
    );
  }

  const isOnSale = !!product.salePrice;
  const displayPrice = isOnSale ? product.salePrice! : product.basePrice;
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: displayPrice,
        quantity: 1,
        image: product.image,
        unit: product.unit,
      });
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="bg-muted/50 rounded-2xl overflow-hidden aspect-square">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
            />
          </div>

          {/* Details */}
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">{product.brand} • {product.category}</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.round(product.averageRating) ? "fill-warning text-warning" : "text-muted"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold">{formatCurrency(displayPrice)}</span>
              {isOnSale && <span className="ml-3 text-lg text-muted-foreground line-through">{formatCurrency(product.basePrice)}</span>}
              <span className="block text-sm text-muted-foreground mt-1">per {product.unit}</span>
            </div>

            {/* Stock */}
            {product.stock > 0 ? (
              <p className="text-sm text-success font-medium mb-6">✓ In Stock ({product.stock} available)</p>
            ) : (
              <p className="text-sm text-destructive font-medium mb-6">Out of Stock</p>
            )}

            <p className="text-muted-foreground mb-8 leading-relaxed">{product.description}</p>

            {/* Quantity & Add to Cart */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-full">
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-semibold">{quantity}</span>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setQuantity(q => q + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button className="rounded-full flex-1 max-w-xs" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
