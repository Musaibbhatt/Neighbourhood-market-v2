import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/data";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Banknote, Smartphone, Heart, Truck, Store } from "lucide-react";
import ProductCard from "@/components/ProductCard";

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  // Core States
  const [fulfillment, setFulfillment] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: ""
  });
  const [showImpulse, setShowImpulse] = useState(false);
  const [impulseItems, setImpulseItems] = useState<any[]>([]);

  // Fetch items for the "Forget anything?" popup
  useEffect(() => {
    const fetchImpulseItems = async () => {
      try {
        const res = await fetch("/api/products?limit=4");
        const data = await res.json();
        setImpulseItems(data.products || []);
      } catch (err) { console.error(err); }
    };
    fetchImpulseItems();
  }, []);

  // Calculate Fees & Tip
  const actualTip = useMemo(() => {
    if (fulfillment === "pickup") return 0;
    if (tipAmount !== null) return tipAmount;
    const customValue = parseFloat(customTip);
    return isNaN(customValue) ? 0 : customValue;
  }, [fulfillment, tipAmount, customTip]);

  const deliveryFee = (fulfillment === "pickup" || totalPrice >= 50) ? 0 : 4.99;
  const serviceFee = totalPrice * 0.05;
  const tax = totalPrice * 0.08;
  const grandTotal = totalPrice + deliveryFee + serviceFee + tax + actualTip;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

 const handleFinalOrder = async () => {
  // Pass the total and the chosen method (card/upi) to the next page
  navigate("/payment", { 
    state: { 
      amount: grandTotal,
      method: paymentMethod 
    } 
  });
};

  if (cart.length === 0) return <Layout><div className="p-20 text-center">Your cart is empty.</div></Layout>;

  return (
    <Layout>
      <div className="container py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* FULFILLMENT SECTION */}
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                {fulfillment === "delivery" ? <Truck className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                How would you like your order?
              </h2>
              <RadioGroup value={fulfillment} onValueChange={setFulfillment} className="grid grid-cols-2 gap-4">
                <Label htmlFor="delivery" className={`flex items-center justify-between border p-4 rounded-lg cursor-pointer transition-all ${fulfillment === 'delivery' ? 'border-primary bg-primary/5' : ''}`}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="delivery" id="delivery" />
                    <span>Delivery</span>
                  </div>
                </Label>
                <Label htmlFor="pickup" className={`flex items-center justify-between border p-4 rounded-lg cursor-pointer transition-all ${fulfillment === 'pickup' ? 'border-primary bg-primary/5' : ''}`}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <span>Pickup</span>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {/* DRIVER TIP SECTION (Only for Delivery) */}
            {fulfillment === "delivery" && (
              <div className="bg-card border rounded-xl p-6 shadow-sm border-orange-100 bg-orange-50/30">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  <h2 className="text-xl font-bold italic text-orange-900">Driver Tip</h2>
                </div>
                <p className="text-sm text-orange-800 mb-4 font-medium">Support your driver! 100% of this goes to them.</p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[1, 2, 5, 10].map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant={tipAmount === amount ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => { setTipAmount(amount); setCustomTip(""); }}
                    >
                      {formatCurrency(amount)}
                    </Button>
                  ))}
                </div>
                <Input
                  placeholder="Or enter custom tip..."
                  className="bg-white"
                  value={customTip}
                  onChange={(e) => { setCustomTip(e.target.value); setTipAmount(null); }}
                />
              </div>
            )}

            {/* PAYMENT METHOD SECTION */}
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                {[
                  { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                  { id: 'cash', label: 'Cash on Delivery', icon: Banknote },
                  { id: 'upi', label: 'UPI / Digital Wallet', icon: Smartphone }
                ].map((method) => (
                  <Label key={method.id} htmlFor={method.id} className={`flex items-center gap-3 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${paymentMethod === method.id ? 'border-primary ring-1 ring-primary' : ''}`}>
                    <RadioGroupItem value={method.id} id={method.id} />
                    <method.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">{method.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {/* CONTACT DETAILS */}
            <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-bold mb-2">Delivery Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" onChange={handleInputChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+1 (555) 000-0000" onChange={handleInputChange} />
              </div>
              {fulfillment === "delivery" && (
                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input id="address" placeholder="Street name, Apartment, Suite" onChange={handleInputChange} />
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-xl p-6 sticky top-24 shadow-md">
              <h2 className="text-lg font-bold mb-4 border-b pb-2">Order Summary</h2>
              <div className="space-y-3 mb-6 max-h-60 overflow-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(totalPrice)}</span></div>
                {fulfillment === "delivery" && <div className="flex justify-between"><span>Delivery Fee</span><span>{formatCurrency(deliveryFee)}</span></div>}
                <div className="flex justify-between"><span>Tax & Service</span><span>{formatCurrency(tax + serviceFee)}</span></div>
                {actualTip > 0 && <div className="flex justify-between text-green-600 font-bold"><span>Driver Tip</span><span>{formatCurrency(actualTip)}</span></div>}
                <div className="flex justify-between text-lg font-black border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>
              <Button className="w-full mt-6 py-6 text-lg font-bold shadow-lg" onClick={() => setShowImpulse(true)}>
                Place Your Order
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* IMPULSE POPUP */}
      {showImpulse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-card border rounded-3xl w-full max-w-4xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black mb-6 text-center">Wait! Did you forget these?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {impulseItems.map((p) => (
                <ProductCard 
                  key={p._id} 
                  product={{
                    _id: p._id,
                    name: p.name,
                    brand: p.brand || "Fresh",
                    category: p.category?.name || "Grocery",
                    basePrice: p.basePrice,
                    salePrice: p.salePrice,
                    image: p.imageURL || "/placeholder.svg",
                    stock: p.stock || 10,
                    description: p.description || "Daily essential"
                  }} 
                />
              ))}
            </div>
            <div className="flex gap-4">
               <Button variant="ghost" className="rounded-full px-8" onClick={() => setShowImpulse(false)}>Back</Button>
               <Button className="flex-1 py-6 text-xl rounded-full" onClick={handleFinalOrder}>Confirm & Pay {formatCurrency(grandTotal)}</Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}