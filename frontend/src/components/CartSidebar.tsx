import React from 'react';
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/data";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const CartSidebar = ({ children }: { children: React.ReactNode }) => {
  const { cart, updateQuantity, removeFromCart, totalPrice } = useCart();

  const FREE_DELIVERY_THRESHOLD = 50;
  const deliveryFee = totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : 4.99;
  const serviceFee = totalPrice * 0.05; // 5% service fee
  const tax = totalPrice * 0.08; // 8% tax
  const grandTotal = totalPrice + deliveryFee + serviceFee + tax;

  const progress = Math.min((totalPrice / FREE_DELIVERY_THRESHOLD) * 100, 100);
  const remainingForFreeDelivery = FREE_DELIVERY_THRESHOLD - totalPrice;

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-card/80 backdrop-blur-xl border-l border-white/20 shadow-2xl">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Your Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Start adding some delicious groceries to your cart!
            </p>
            <SheetTrigger asChild>
              <Link to="/shop">
                <Button variant="default" className="rounded-full px-8">Browse Shop</Button>
              </Link>
            </SheetTrigger>
          </div>
        ) : (
          <>
            <div className="p-4 bg-primary/5 rounded-xl my-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {totalPrice >= FREE_DELIVERY_THRESHOLD
                    ? "Congratulations! Free delivery applied"
                    : `Add ${formatCurrency(remainingForFreeDelivery)} more for FREE delivery`}
                </span>
                <span className="text-xs font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="relative h-20 w-20 rounded-lg border overflow-hidden bg-muted shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} / {item.unit}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-muted rounded-full p-0.5 scale-90 -ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="text-sm font-bold">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="pt-6 mt-auto space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className={deliveryFee === 0 ? "text-green-600 font-bold" : "font-medium"}>
                    {deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service & Handling (5%)</span>
                  <span className="font-medium">{formatCurrency(serviceFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes (8%)</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
              <SheetTrigger asChild>
                <Link to="/checkout" className="block w-full">
                  <Button className="w-full rounded-full py-6 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </SheetTrigger>
              <div className="text-center">
                <SheetTrigger asChild>
                  <Link to="/cart" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    View Full Cart Detail
                  </Link>
                </SheetTrigger>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;
