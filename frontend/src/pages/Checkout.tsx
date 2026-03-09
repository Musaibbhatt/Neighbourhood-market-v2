import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/data";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const deliveryFee = totalPrice >= 50 ? 0 : 4.99;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Order placed successfully! 🎉");
    clearCart();
    navigate("/");
  };

  if (cart.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-5 gap-8">
          {/* Form */}
          <div className="md:col-span-3 space-y-6">
            <div className="bg-card border rounded-xl p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold">Delivery Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>First Name</Label><Input required placeholder="John" /></div>
                <div><Label>Last Name</Label><Input required placeholder="Doe" /></div>
              </div>
              <div><Label>Email</Label><Input type="email" required placeholder="john@example.com" /></div>
              <div><Label>Phone</Label><Input type="tel" required placeholder="+1 234 567 890" /></div>
              <div><Label>Address</Label><Input required placeholder="123 Main Street" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>City</Label><Input required placeholder="New York" /></div>
                <div><Label>ZIP Code</Label><Input required placeholder="10001" /></div>
              </div>
            </div>
            <Button type="submit" className="w-full rounded-full" size="lg">
              Place Order • {formatCurrency(totalPrice + deliveryFee)}
            </Button>
          </div>

          {/* Summary */}
          <div className="md:col-span-2">
            <div className="bg-card border rounded-xl p-6 sticky top-24">
              <h2 className="font-display text-lg font-semibold mb-4">Your Order</h2>
              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="truncate flex-1">{item.name} × {item.quantity}</span>
                    <span className="font-medium ml-2">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(totalPrice)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>{formatCurrency(totalPrice + deliveryFee)}</span></div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
