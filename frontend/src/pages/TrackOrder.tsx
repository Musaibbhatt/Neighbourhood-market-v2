import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/data';
import {
  CheckCircle2,
  Package,
  Truck,
  Home,
  ChevronLeft,
  AlertCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

const steps = [
  { status: 'Order Received', icon: CheckCircle2, label: 'Order Received' },
  { status: 'Packed', icon: Package, label: 'Packing items' },
  { status: 'Out for Delivery', icon: Truck, label: 'Out for delivery' },
  { status: 'Delivered', icon: Home, label: 'Delivered' },
];

const TrackOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchOrder, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
      });
      if (!res.ok) throw new Error('Failed to cancel order');
      const updatedOrder = await res.json();
      setOrder(updatedOrder);
      toast.success('Order cancelled successfully');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <Layout><div className="container py-20 text-center">Loading tracker...</div></Layout>;
  if (!order) return <Layout><div className="container py-20 text-center text-destructive">Order not found</div></Layout>;

  const currentStepIndex = steps.findIndex(s => s.status === order.orderStatus);
  const isCancelled = order.orderStatus === 'Cancelled';

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <Link to="/orders">
          <Button variant="ghost" size="sm" className="mb-6 rounded-full gap-2">
            <ChevronLeft className="h-4 w-4" /> My Orders
          </Button>
        </Link>

        <div className="bg-card border rounded-2xl p-8 shadow-sm mb-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold">Track Order #{order._id.slice(-6)}</h1>
              <p className="text-sm text-muted-foreground">Placed on {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            {order.orderStatus === 'Order Received' && !isCancelled && (
              <Button variant="destructive" size="sm" className="rounded-full" onClick={handleCancel}>
                Cancel Order
              </Button>
            )}
          </div>

          {isCancelled ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 flex items-center gap-4 text-destructive mb-8">
              <XCircle className="h-8 w-8" />
              <div>
                <p className="font-bold">Order Cancelled</p>
                <p className="text-sm">This order has been cancelled and will not be fulfilled.</p>
              </div>
            </div>
          ) : (
            <div className="relative mb-12 px-4">
              {/* Progress Line */}
              <div className="absolute top-5 left-10 right-10 h-0.5 bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 z-10">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center border-4 ${
                        isCompleted ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-muted text-muted-foreground'
                      } ${isCurrent ? 'ring-4 ring-primary/20 scale-110 shadow-lg' : ''} transition-all`}>
                        <step.icon size={20} />
                      </div>
                      <span className={`text-xs font-bold text-center w-20 ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-8 pt-8 border-t">
            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Latest Update
              </h3>
              <div className="space-y-4">
                {order.statusHistory?.slice().reverse().map((history: any, idx: number) => (
                  <div key={idx} className="flex gap-3 relative pb-4 last:pb-0">
                    {idx !== order.statusHistory.length - 1 && (
                      <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-muted" />
                    )}
                    <div className="h-4 w-4 rounded-full bg-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-bold">{history.status}</p>
                      <p className="text-xs text-muted-foreground">{new Date(history.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-2">Delivery Details</h3>
                <p className="text-sm text-muted-foreground">{order.customerName}</p>
                <p className="text-sm text-muted-foreground">{order.address}</p>
                <p className="text-sm text-muted-foreground">{order.phone}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Order Summary</h3>
                <div className="space-y-1">
                  {order.products.map((p: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm text-muted-foreground">
                      <span>{p.name} × {p.quantity}</span>
                      <span>{formatCurrency(p.price * p.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(order.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrackOrder;
