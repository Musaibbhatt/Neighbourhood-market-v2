import Layout from "@/components/Layout";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/data";
import { Link } from "react-router-dom";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();

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

  const deliveryFee = totalPrice >= 50 ? 0 : 4.99;
  const grandTotal = totalPrice + deliveryFee;

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
        {totalPrice < 50 && (
          <div className="bg-accent rounded-lg p-4 mb-6">
            <p className="text-sm text-accent-foreground">
              🚚 Add <strong>{formatCurrency(50 - totalPrice)}</strong> more for <strong>FREE delivery!</strong>
            </p>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min((totalPrice / 50) * 100, 100)}%` }} />
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="bg-card border rounded-xl p-4 flex gap-4 items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} / {item.unit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm">{formatCurrency(item.price * item.quantity)}</p>
                  <Button variant="ghost" size="sm" className="text-destructive h-7 px-2 mt-1" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-card border rounded-xl p-6 h-fit sticky top-24">
            <h2 className="font-display text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(totalPrice)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{deliveryFee === 0 ? <span className="text-success font-medium">FREE</span> : formatCurrency(deliveryFee)}</span></div>
              <div className="border-t pt-3 flex justify-between font-bold text-base">
                <span>Total</span><span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
            <Link to="/checkout">
              <Button className="w-full mt-6 rounded-full">
                Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
