import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, MapPin, ShoppingBag, LogOut, ChevronRight, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (isLoading) return <Layout><div className="container py-20 text-center">Loading profile...</div></Layout>;

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders', description: 'View and track your orders', path: '/orders' },
    { icon: MapPin, label: 'Saved Addresses', description: 'Manage your delivery locations', path: '/profile/addresses' },
    { icon: CreditCard, label: 'Payment Methods', description: 'Manage your cards and UPI', path: '/profile/payments' },
  ];

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card border rounded-2xl p-6 text-center">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{profile?.name}</h2>
              <p className="text-sm text-muted-foreground mb-6">{profile?.email}</p>
              <Button variant="outline" className="w-full rounded-full gap-2 text-destructive" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </Button>
            </div>

            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
              <h3 className="font-bold text-primary mb-2">Loyalty Points</h3>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black">{profile?.loyaltyPoints || 0}</span>
                <span className="text-sm text-primary/70 mb-1">points</span>
              </div>
              <p className="text-xs text-primary/60 mt-2">Earn points on every order to get discounts!</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="md:col-span-2 space-y-4">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <div className="bg-card border rounded-2xl p-5 flex items-center gap-4 hover:border-primary transition-all group mb-4">
                  <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <item.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            ))}

            <div className="mt-8 pt-8 border-t">
              <h3 className="font-bold mb-6">Personal Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input defaultValue={profile?.name} readOnly />
                  </div>
                  <div>
                    <Label>Mobile Number</Label>
                    <Input defaultValue={profile?.mobile} readOnly />
                  </div>
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input defaultValue={profile?.email} readOnly />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
