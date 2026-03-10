import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ShoppingBag, RefreshCw, ChevronRight, Clock, MapPin, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders/my-orders', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleReorder = (order: any) => {
    order.products.forEach((item: any) => {
      addToCart({
        id: item.product._id || item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.imageURL || '/placeholder.svg',
        unit: item.variant || 'unit'
      });
    });
    toast.success('Items added to cart!');
    navigate('/cart');
  };

  if (isLoading) return <Layout><div className="container py-20 text-center">Loading orders...</div></Layout>;

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/profile">
            <Button variant="ghost" size="sm" className="rounded-full">
              User Profile
            </Button>
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-3xl font-bold">Order History</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-card border rounded-2xl">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">When you place an order, it will appear here.</p>
            <Link to="/shop">
              <Button className="rounded-full">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-card border rounded-2xl overflow-hidden">
                <div className="p-6 border-b bg-muted/30 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
                      #{order._id.slice(-4)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-xs text-muted-foreground">{order.products.length} Items • {formatCurrency(order.totalPrice)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {order.orderStatus}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full gap-2"
                      onClick={() => handleReorder(order)}
                    >
                      <RefreshCw className="h-3 w-3" /> Reorder
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {order.products.map((item: any, idx: number) => (
                      <div key={idx} className="shrink-0 w-16 h-16 rounded-lg border bg-muted overflow-hidden">
                        <img src={item.imageURL || '/placeholder.svg'} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
