import Layout from "@/components/Layout";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/data";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();

  const { data: impulseItems } = useQuery({
    queryKey: ['cart-page-impulse'],
    queryFn: async () => {
      const res = await fetch('/api/products?limit=4&isOrganic=false');
      const data = await res.json();
      return data.products || [];
    }
  });

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/40 mb-6" />
          <h1 className="font-display text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Looks like you haven't added any items yet.</p>
          <Link to="/shop">
            <Button className="rounded-full px-8">Start Shopping</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const FREE_DELIVERY_THRESHOLD = 50;
  const deliveryFee = totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : 4.99;
  const serviceFee = totalPrice * 0.05;
  const tax = totalPrice * 0.08;
  const grandTotal = totalPrice + deliveryFee + serviceFee + tax;

  const progress = Math.min((totalPrice / FREE_DELIVERY_THRESHOLD) * 100, 100);

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">Shopping Cart</h1>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive">
            Clear All
          </Button>
        </div>

        {/* Free delivery progress */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold text-primary">
              {totalPrice >= FREE_DELIVERY_THRESHOLD
                ? "🚚 Your order qualifies for FREE delivery!"
                : `🚚 Add ${formatCurrency(FREE_DELIVERY_THRESHOLD - totalPrice)} more for FREE delivery!`}
            </p>
            <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="bg-card border rounded-xl p-4 flex gap-4 items-center group transition-all hover:shadow-md">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 rounded-lg object-cover shrink-0 border"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{formatCurrency(item.price)} / {item.unit}</p>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-muted rounded-full p-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive h-9" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </Button>
                  </div>
                </div>
                <div className="text-right shrink-0 pr-2">
                  <p className="text-lg font-bold text-primary">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}

            {/* Impulse Section for Main Cart */}
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-6">Frequently Bought Together</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {impulseItems?.filter((p: any) => !cart.find(i => i.id === p._id)).map((p: any) => (
                  <div key={p._id} className="bg-card border rounded-2xl p-4 flex flex-col items-center text-center group hover:shadow-lg transition-all">
                    <img src={p.imageURL || '/placeholder.svg'} className="w-20 h-20 rounded-xl object-cover mb-3" alt="" />
                    <h3 className="text-xs font-bold line-clamp-1 mb-1">{p.name}</h3>
                    <p className="text-xs text-primary font-black mb-3">{formatCurrency(p.basePrice)}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full rounded-full text-[10px] h-8"
                      onClick={() => addToCart({
                        id: p._id,
                        name: p.name,
                        price: p.basePrice,
                        quantity: 1,
                        image: p.imageURL || '/placeholder.svg',
                        unit: p.unit || 'unit'
                      })}
                    >
                      Add to Cart
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card border rounded-2xl p-6 h-fit sticky top-24 shadow-sm">
            <h2 className="font-display text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className={deliveryFee === 0 ? "text-green-600 font-bold" : "font-semibold"}>
                  {deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service & Handling (5%)</span>
                <span className="font-semibold">{formatCurrency(serviceFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Taxes (8%)</span>
                <span className="font-semibold">{formatCurrency(tax)}</span>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-xl text-foreground">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Link to="/checkout">
                <Button className="w-full py-6 rounded-full text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                  Checkout Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/shop" className="block">
                <Button variant="outline" className="w-full py-6 rounded-full text-base">
                  Continue Shopping
                </Button>
              </Link>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Secure Checkout
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
