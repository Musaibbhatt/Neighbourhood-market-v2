import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { products, formatCurrency } from "@/lib/data";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Minus, Plus, MessageSquare, Camera, Check, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ProductDetail() {
  const { id } = useParams();
  // We should try to fetch the product from the backend to get real DB data
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewImage, setReviewImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, revRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch(`/api/products/${id}/reviews`)
        ]);

        if (prodRes.ok) setProduct(await prodRes.json());
        if (revRes.ok) setReviews(await revRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) return <Layout><div className="container py-20 text-center">Loading product...</div></Layout>;

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold">Product Not Found</h1>
          <Link to="/shop">
            <Button className="mt-4 rounded-full">Back to Shop</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localStorage.getItem('token')) {
      toast.error("Please login to write a review");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating, comment, imageUrl: reviewImage })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review");

      toast.success("Review submitted!");
      setComment("");
      setReviewImage("");
      // Refresh reviews
      const revRes = await fetch(`/api/products/${id}/reviews`);
      if (revRes.ok) setReviews(await revRes.json());
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOnSale = !!product.salePrice;
  const displayPrice = isOnSale ? product.salePrice! : product.basePrice;
  // Use mock related products from lib/data but filter by current product's category if possible
  const related = products.filter(p => (p.category === (product.category?.name || product.category)) && p.id !== product._id).slice(0, 4);

  const handleAddToCart = () => {
    addToCart({
      id: product._id,
      name: product.name,
      price: displayPrice,
      quantity: quantity,
      image: product.imageURL || '/placeholder.svg',
      unit: product.unit || 'unit',
    });
    toast.success("Added to cart!");
  };

  const handleNotify = async () => {
    if (!localStorage.getItem('token')) {
      toast.error("Please login to set notifications");
      return;
    }
    try {
      const res = await fetch(`/api/products/${id}/stock-notify`, {
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
            {product.stock > 0 ? (
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
            ) : (
              <Button variant="outline" className="rounded-full gap-2" onClick={handleNotify}>
                <Bell size={18} /> Notify when available
              </Button>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-16 pt-16 border-t">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Review Summary & Form */}
            <div className="md:col-span-1 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-2">Customer Reviews</h2>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-black">{product.averageRating?.toFixed(1) || "0.0"}</div>
                  <div>
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.round(product.averageRating || 0) ? "fill-warning text-warning" : "text-muted"}`} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">Based on {reviews.length} reviews</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-2xl p-6">
                <h3 className="font-bold mb-4">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <Label>Rating</Label>
                    <div className="flex gap-2 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className={`h-10 w-10 rounded-full flex items-center justify-center border transition-all ${
                            rating >= s ? 'bg-warning/10 border-warning text-warning' : 'border-muted text-muted-foreground'
                          }`}
                        >
                          <Star size={18} fill={rating >= s ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="comment">Comment</Label>
                    <Textarea
                      id="comment"
                      placeholder="What did you think of this product?"
                      className="mt-1"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reviewImage">Photo URL (Optional)</Label>
                    <div className="relative mt-1">
                      <Input
                        id="reviewImage"
                        placeholder="https://example.com/image.jpg"
                        value={reviewImage}
                        onChange={(e) => setReviewImage(e.target.value)}
                        className="pl-9"
                      />
                      <Camera className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              </div>
            </div>

            {/* Review List */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-8">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">Review List</h3>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-2xl border-2 border-dashed">
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="bg-card border rounded-2xl p-6 transition-all hover:shadow-md">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                            {rev.user?.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{rev.user?.name || "Verified Buyer"}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < rev.rating ? "fill-warning text-warning" : "text-muted"}`} />
                                ))}
                              </div>
                              <span className="text-[10px] text-muted-foreground">• {new Date(rev.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                          <Check size={10} /> Verified Purchase
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed mb-4">{rev.comment}</p>
                      {rev.imageUrl && (
                        <div className="w-24 h-24 rounded-lg overflow-hidden border">
                          <img src={rev.imageUrl} alt="Review" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-20 pt-16 border-t">
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
