import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Search,
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

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newCat: any) => {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newCat)
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setIsDialogOpen(false);
      toast.success('Category created');
    },
    onError: (err: any) => toast.error(err.message)
  });

  const updateMutation = useMutation({
    mutationFn: async (cat: any) => {
      const res = await fetch(`/api/categories/${cat._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(cat)
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setEditingCategory(null);
      toast.success('Category updated');
    },
    onError: (err: any) => toast.error(err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to delete');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category removed');
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    if (editingCategory) {
      updateMutation.mutate({ ...data, _id: editingCategory._id });
    } else {
      createMutation.mutate(data);
    }
  };

  const filtered = categories?.filter((c: any) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div>Loading categories...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Category Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-2" onClick={() => setEditingCategory(null)}>
              <Plus size={18} /> New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" name="name" defaultValue={editingCategory?.name} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" defaultValue={editingCategory?.description} />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full rounded-full">
                  {editingCategory ? 'Save Changes' : 'Create Category'}
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
              placeholder="Search categories..."
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
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map((c: any) => (
                <tr key={c._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-sm">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{c.description || 'No description'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => {
                        setEditingCategory(c);
                        setIsDialogOpen(true);
                      }}>
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => {
                        if (confirm('Delete this category?')) deleteMutation.mutate(c._id);
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

export default AdminCategories;
