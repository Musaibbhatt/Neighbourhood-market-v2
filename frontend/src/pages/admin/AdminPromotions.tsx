import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ticket, Plus, Trash2, Calendar, Tag, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const AdminPromotions = () => {
  const queryClient = useQueryClient();
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);

  const { data: coupons, isLoading: couponsLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await fetch('/api/coupons', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return res.json();
    }
  });

  const createCouponMutation = useMutation({
    mutationFn: async (newCoupon: any) => {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newCoupon)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setIsCouponDialogOpen(false);
      toast.success('Coupon created successfully');
    }
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Coupon deleted');
    }
  });

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    createCouponMutation.mutate({
      ...data,
      discountAmount: parseFloat(data.discountAmount as string),
      minPurchase: parseFloat(data.minPurchase as string),
      expiryDate: new Date(data.expiryDate as string)
    });
  };

  if (couponsLoading) return <div>Loading promotions...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Promotions & Coupons</h1>
        <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-2">
              <Plus size={18} /> New Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Coupon</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCouponSubmit} className="space-y-4 py-4">
              <div>
                <Label htmlFor="code">Coupon Code (e.g. SAVE20)</Label>
                <Input id="code" name="code" required className="uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discountType">Type</Label>
                  <select name="discountType" className="w-full h-10 border rounded-md px-3 text-sm">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="discountAmount">Discount Value</Label>
                  <Input id="discountAmount" name="discountAmount" type="number" step="0.01" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minPurchase">Min Purchase ($)</Label>
                  <Input id="minPurchase" name="minPurchase" type="number" defaultValue="0" />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input id="expiryDate" name="expiryDate" type="date" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full rounded-full">Create Coupon</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons?.map((coupon: any) => (
          <div key={coupon._id} className="bg-card border rounded-2xl p-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => deleteCouponMutation.mutate(coupon._id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Tag size={20} />
              </div>
              <div>
                <p className="text-xl font-black uppercase tracking-tighter text-primary">{coupon.code}</p>
                <p className="text-xs text-muted-foreground">Expires {new Date(coupon.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold">
                {coupon.discountType === 'percentage' ? `${coupon.discountAmount}% OFF` : `$${coupon.discountAmount} OFF`}
              </p>
              <p className="text-xs text-muted-foreground">Valid on orders over ${coupon.minPurchase}</p>
            </div>
            <div className="mt-6 pt-4 border-t flex justify-between items-center">
               <span className={`px-2 py-1 rounded text-[10px] font-bold ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                 {coupon.isActive ? 'ACTIVE' : 'INACTIVE'}
               </span>
               <Zap size={14} className="text-primary/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPromotions;
