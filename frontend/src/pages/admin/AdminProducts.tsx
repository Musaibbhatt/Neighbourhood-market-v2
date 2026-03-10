import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronRight,
  AlertCircle,
  Save,
  X
} from 'lucide-react';
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

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      const data = await res.json();
      return data.products || data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newProduct: any) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newProduct)
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsDialogOpen(false);
      toast.success('Product created successfully');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (product: any) => {
      const res = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(product)
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setEditingProduct(null);
      toast.success('Product updated successfully');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    }
  });

  const filteredProducts = products?.filter((p: any) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    const productData = {
      ...data,
      basePrice: parseFloat(data.basePrice as string),
      stock: parseInt(data.stock as string),
      isOrganic: data.isOrganic === 'true',
      isGlutenFree: data.isGlutenFree === 'true',
      isVegan: data.isVegan === 'true',
      category: data.category // Assuming ID for now
    };

    if (editingProduct) {
      updateMutation.mutate({ ...productData, _id: editingProduct._id });
    } else {
      createMutation.mutate(productData);
    }
  };

  if (isLoading) return <div>Loading inventory...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-2" onClick={() => setEditingProduct(null)}>
              <Plus size={18} /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" name="name" defaultValue={editingProduct?.name} required />
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" name="brand" defaultValue={editingProduct?.brand} required />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" defaultValue={editingProduct?.description} required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="basePrice">Base Price ($)</Label>
                  <Input id="basePrice" name="basePrice" type="number" step="0.01" defaultValue={editingProduct?.basePrice} required />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input id="stock" name="stock" type="number" defaultValue={editingProduct?.stock} required />
                </div>
                <div>
                  <Label htmlFor="category">Category ID</Label>
                  <Input id="category" name="category" defaultValue={editingProduct?.category?._id || editingProduct?.category} required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 border p-4 rounded-lg bg-muted/20">
                 <div className="flex items-center gap-2">
                   <input type="checkbox" name="isOrganic" value="true" defaultChecked={editingProduct?.isOrganic} />
                   <Label>Organic</Label>
                 </div>
                 <div className="flex items-center gap-2">
                   <input type="checkbox" name="isGlutenFree" value="true" defaultChecked={editingProduct?.isGlutenFree} />
                   <Label>Gluten-Free</Label>
                 </div>
                 <div className="flex items-center gap-2">
                   <input type="checkbox" name="isVegan" value="true" defaultChecked={editingProduct?.isVegan} />
                   <Label>Vegan</Label>
                 </div>
              </div>
              <div>
                <Label htmlFor="imageURL">Image URL</Label>
                <Input id="imageURL" name="imageURL" defaultValue={editingProduct?.imageURL} />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full rounded-full">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b bg-slate-50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or brand..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts?.map((p: any) => (
                <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded border bg-muted overflow-hidden shrink-0">
                        <img src={p.imageURL || '/placeholder.svg'} className="h-full w-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{p.category?.name || 'Uncategorized'}</td>
                  <td className="px-6 py-4 font-bold text-sm text-slate-900">${p.basePrice.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${p.stock > 10 ? 'bg-green-500' : 'bg-amber-500'}`} />
                      <span className={`text-sm font-medium ${p.stock <= 5 ? 'text-destructive font-bold' : ''}`}>
                        {p.stock} units
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => {
                        setEditingProduct(p);
                        setIsDialogOpen(true);
                      }}>
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => {
                        if (confirm('Are you sure?')) deleteMutation.mutate(p._id);
                      }}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
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

export default AdminProducts;
