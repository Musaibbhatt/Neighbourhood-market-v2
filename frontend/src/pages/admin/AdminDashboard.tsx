import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, ShoppingCart, DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    }
  });

  if (isLoading) return <div>Loading...</div>;

  const cards = [
    { title: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-blue-600' },
    { title: 'Total Orders', value: stats?.totalOrders, icon: ShoppingCart, color: 'text-green-600' },
    { title: 'Total Revenue', value: `$${stats?.totalRevenue?.toFixed(2)}`, icon: DollarSign, color: 'text-amber-600' },
    { title: 'Recent Orders', value: stats?.recentOrders?.length, icon: Package, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{card.title}</CardTitle>
              <card.icon className={card.color} size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 font-medium text-slate-500">Order ID</th>
                <th className="pb-3 font-medium text-slate-500">Customer</th>
                <th className="pb-3 font-medium text-slate-500">Total</th>
                <th className="pb-3 font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map((order: any) => (
                <tr key={order._id} className="border-b border-slate-50 last:border-0">
                  <td className="py-4 text-sm">#{order._id.slice(-6)}</td>
                  <td className="py-4 text-sm">{order.customerName}</td>
                  <td className="py-4 text-sm font-medium">${order.totalPrice.toFixed(2)}</td>
                  <td className="py-4 text-sm">
                    <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">
                      {order.orderStatus}
                    </span>
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

export default AdminDashboard;
