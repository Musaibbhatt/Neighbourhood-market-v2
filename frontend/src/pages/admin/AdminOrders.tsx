import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingCart,
  Search,
  ChevronRight,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/data';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return res.json();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ orderStatus: status })
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated');
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Order Received': return <ShoppingCart size={14} className="text-blue-500" />;
      case 'Packed': return <Package size={14} className="text-amber-500" />;
      case 'Out for Delivery': return <Truck size={14} className="text-purple-500" />;
      case 'Delivered': return <CheckCircle2 size={14} className="text-green-500" />;
      case 'Cancelled': return <XCircle size={14} className="text-destructive" />;
      default: return null;
    }
  };

  if (isLoading) return <div>Loading orders...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Order Management</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order: any) => (
                <tr key={order._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">#{order._id.slice(-6)}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.phone}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">{formatCurrency(order.totalPrice)}</td>
                  <td className="px-6 py-4">
                    <Select
                      defaultValue={order.orderStatus}
                      onValueChange={(val) => updateStatusMutation.mutate({ id: order._id, status: val })}
                    >
                      <SelectTrigger className="h-8 w-[180px] text-xs font-bold rounded-full">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.orderStatus)}
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Order Received">Order Received</SelectItem>
                        <SelectItem value="Packed">Packed</SelectItem>
                        <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                      <Eye size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
