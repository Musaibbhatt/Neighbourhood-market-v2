import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/data";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Truck, Store, MapPin, ShieldCheck, CreditCard, Banknote, Smartphone, Heart, Sparkles, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [fulfillment, setFulfillment] = useState("delivery");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState("");

  // Impulse buy state
  const [showImpulse, setShowImpulse] = useState(false);
  const [impulseItems, setImpulseItems] = useState<any[]>([]);

  // Reset tip when switching to pickup
  useEffect(() => {
    if (fulfillment === "pickup") {
      setTipAmount(null);
      setCustomTip("");
    }
  }, [fulfillment]);

  useEffect(() => {
    const fetchImpulseItems = async () => {
      try {
        // Fetch common impulse buy items (snacks, drinks, etc)
        const res = await fetch("/api/products?limit=4&isOrganic=false"); // Simple proxy for impulse items
        const data = await res.json();
        setImpulseItems(data.products || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchImpulseItems();
  }, []);

  const actualTip = useMemo(() => {
    if (fulfillment === "pickup") return 0;
    if (tipAmount !== null) return tipAmount;
    const customValue = parseFloat(customTip);
    return isNaN(customValue) ? 0 : customValue;
  }, [fulfillment, tipAmount, customTip]);

  const deliveryFee = useMemo(() => {
    if (fulfillment === "pickup") return 0;
    if (totalPrice >= 50) return 0;

    // Simple logic for location-based fee variation
    let baseFee = 4.99;
    if (formData.zipCode.startsWith("9")) baseFee += 2.00; // Farther zone
    if (formData.zipCode.startsWith("1")) baseFee -= 1.00; // Nearer zone

    return Math.max(0, baseFee);
  }, [fulfillment, totalPrice, formData.zipCode]);

  const serviceFee = totalPrice * 0.05;
  const tax = totalPrice * 0.08;
  const grandTotal = totalPrice + deliveryFee + serviceFee + tax + actualTip;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowImpulse(true);
  };

  const handleFinalOrder = async () => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          customerName: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: fulfillment === "delivery" ? `${formData.address}, ${formData.city}, ${formData.zipCode}` : "Store Pickup",
          products: cart.map(item => ({
            product: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            variant: item.unit,
            imageURL: item.image
          })),
          subtotal: totalPrice,
          deliveryFee,
          totalPrice: grandTotal,
          orderType: fulfillment === "delivery" ? "Delivery" : "Pickup",
          paymentMethod: paymentMethod === 'card' ? 'Card' : paymentMethod === 'applepay' ? 'Apple Pay' : 'Cash',
          tip: actualTip,
          tax: tax,
          handlingFee: serviceFee
        })
      });

      const orderData = await res.json();

      if (!res.ok) throw new Error(orderData.message || "Checkout failed");

      toast.success("Order placed successfully! 🎉");
      clearCart();
      navigate(\`/track/\${orderData._id}\`);
    } catch (err: any) {
      toast.error(err.message);
    }
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
            <div className="bg-card border rounded-xl p-6 space-y-6">
              <h2 className="font-display text-xl font-bold">Fulfillment Method</h2>
              <RadioGroup value={fulfillment} onValueChange={setFulfillment} className="grid grid-cols-2 gap-4">
                <div>
                  <RadioGroupItem value="delivery" id="delivery" className="peer sr-only" />
                  <Label
                    htmlFor="delivery"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Truck className="mb-3 h-6 w-6" />
                    <span className="font-bold">Home Delivery</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="pickup" id="pickup" className="peer sr-only" />
                  <Label
                    htmlFor="pickup"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Store className="mb-3 h-6 w-6" />
                    <span className="font-bold">Store Pickup</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="bg-card border rounded-xl p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold">
                {fulfillment === "delivery" ? "Delivery Details" : "Contact Information"}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="firstName">First Name</Label><Input id="firstName" required placeholder="John" value={formData.firstName} onChange={handleInputChange} /></div>
                <div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" required placeholder="Doe" value={formData.lastName} onChange={handleInputChange} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required placeholder="john@example.com" value={formData.email} onChange={handleInputChange} /></div>
                <div><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" required placeholder="+1 234 567 890" value={formData.phone} onChange={handleInputChange} /></div>
              </div>

              {fulfillment === "delivery" && (
                <>
                  <div><Label htmlFor="address">Street Address</Label><Input id="address" required placeholder="123 Main Street" value={formData.address} onChange={handleInputChange} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="city">City</Label><Input id="city" required placeholder="New York" value={formData.city} onChange={handleInputChange} /></div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        required
                        placeholder="10001"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </>
              )}

              {fulfillment === "pickup" && (
                <div className="bg-muted/50 rounded-lg p-4 flex gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-bold">Pick up at:</p>
                    <p className="text-sm text-muted-foreground">Neighbourhood Central Market, 456 Market St, New York, NY 10001</p>
                    <p className="text-xs text-primary mt-1">Ready in: 30 - 60 mins</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card border rounded-xl p-6 space-y-6">
              <h2 className="font-display text-lg font-semibold">Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent transition-colors">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex flex-1 items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <span>Credit / Debit Card</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent transition-colors">
                  <RadioGroupItem value="applepay" id="applepay" />
                  <Label htmlFor="applepay" className="flex flex-1 items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <span>Apple Pay</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent transition-colors">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex flex-1 items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Banknote className="h-5 w-5 text-muted-foreground" />
                      <span>{fulfillment === "delivery" ? "Cash on Delivery" : "Pay at Store"}</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {fulfillment === "delivery" && (
              <div className="bg-card border rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary fill-primary" />
                  <h2 className="font-display text-lg font-semibold">Add a Tip</h2>
                </div>
                <p className="text-sm text-muted-foreground">100% of the tip goes to your delivery partner.</p>
                <div className="flex flex-wrap gap-2">
                  {[1, 3, 10].map((val) => (
                    <Button
                      key={val}
                      type="button"
                      variant={tipAmount === val ? "default" : "outline"}
                      className="rounded-full flex-1"
                      onClick={() => {
                        setTipAmount(val);
                        setCustomTip("");
                      }}
                    >
                      \${val}
                    </Button>
                  ))}
                  <div className="flex-1 min-w-[120px]">
                    <Input
                      placeholder="Custom tip"
                      className="rounded-full"
                      value={customTip}
                      onChange={(e) => {
                        setTipAmount(null);
                        setCustomTip(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-card border rounded-xl p-6">
              <Button type="submit" className="w-full rounded-full py-6 text-lg font-bold" size="lg">
                Proceed to Final Step • {formatCurrency(grandTotal)}
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3 w-3" /> All transactions are secure and encrypted.
              </p>
            </div>
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{deliveryFee === 0 ? <span className="text-green-600 font-bold">FREE</span> : formatCurrency(deliveryFee)}</span>
                </div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service & Handling (5%)</span><span>{formatCurrency(serviceFee)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Taxes (8%)</span><span>{formatCurrency(tax)}</span></div>
                {actualTip > 0 && (
                  <div className="flex justify-between text-primary font-medium">
                    <span>Driver Tip</span>
                    <span>{formatCurrency(actualTip)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2 text-primary">
                  <span>Total</span><span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Impulse Buy Modal */}
      {showImpulse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col scale-in-center">
            <div className="p-6 border-b flex justify-between items-center bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Sparkles className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Forgot something?</h2>
                  <p className="text-sm text-muted-foreground">Most people also grab these favorites!</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowImpulse(false)}>
                <X size={20} />
              </Button>
            </div>

            <div className="p-8 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {impulseItems.map((p) => (
                  <ProductCard key={p._id} product={{
                    id: p._id,
                    name: p.name,
                    brand: p.brand,
                    category: p.category.name,
                    basePrice: p.basePrice,
                    salePrice: p.salePrice,
                    image: p.imageURL || "/placeholder.svg",
                    stock: p.stock,
                    averageRating: p.averageRating,
                    reviewCount: p.numReviews,
                    description: p.description,
                    unit: p.unit || "unit"
                  }} />
                ))}
              </div>
            </div>

            <div className="p-6 border-t bg-muted/30 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-center sm:text-left">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Final Total</p>
                <p className="text-2xl font-black text-primary">{formatCurrency(grandTotal)}</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button variant="outline" className="rounded-full flex-1 sm:flex-initial" onClick={() => setShowImpulse(false)}>
                  Go Back
                </Button>
                <Button className="rounded-full flex-1 sm:flex-initial px-8 py-6 text-lg font-bold" onClick={handleFinalOrder}>
                  Confirm Order & Pay
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
