import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Clock, Truck, ShieldCheck, MapPin, Save, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<any>(null);

  const { data: initialConfig, isLoading } = useQuery({
    queryKey: ['store-config'],
    queryFn: async () => {
      const res = await fetch('/api/store-config');
      return res.json();
    }
  });

  useEffect(() => {
    if (initialConfig) setConfig(initialConfig);
  }, [initialConfig]);

  const updateMutation = useMutation({
    mutationFn: async (newConfig: any) => {
      const res = await fetch('/api/store-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newConfig)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-config'] });
      toast.success('Store configuration updated');
    }
  });

  const handleSave = () => {
    updateMutation.mutate(config);
  };

  const handleZoneUpdate = (index: number, field: string, value: any) => {
    const newZones = [...config.deliveryZones];
    newZones[index] = { ...newZones[index], [field]: value };
    setConfig({ ...config, deliveryZones: newZones });
  };

  const addZone = () => {
    setConfig({
      ...config,
      deliveryZones: [...config.deliveryZones, { zipCode: '', fee: 0 }]
    });
  };

  if (isLoading || !config) return <div>Loading settings...</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings size={32} className="text-primary" />
          Store Settings
        </h1>
        <Button onClick={handleSave} className="rounded-full gap-2 px-8">
          <Save size={18} /> Save All Changes
        </Button>
      </div>

      <div className="grid gap-8">
        {/* Ordering Control */}
        <div className="bg-card border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Power size={20} className="text-primary" />
                Ordering System
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Enable or disable new order placement</p>
            </div>
            <Switch
              checked={config.orderingEnabled}
              onCheckedChange={(checked) => setConfig({ ...config, orderingEnabled: checked })}
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="storeMessage">Store Status Message</Label>
            <Input
              id="storeMessage"
              placeholder="e.g. Currently closed for maintenance. Back in 1 hour."
              value={config.storeMessage}
              onChange={(e) => setConfig({ ...config, storeMessage: e.target.value })}
            />
          </div>
        </div>

        {/* Store Hours */}
        <div className="bg-card border rounded-2xl p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Clock size={20} className="text-primary" />
            Store Hours
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Opening Time</Label>
              <Input
                type="time"
                value={config.openHours?.start}
                onChange={(e) => setConfig({ ...config, openHours: { ...config.openHours, start: e.target.value } })}
              />
            </div>
            <div>
              <Label>Closing Time</Label>
              <Input
                type="time"
                value={config.openHours?.end}
                onChange={(e) => setConfig({ ...config, openHours: { ...config.openHours, end: e.target.value } })}
              />
            </div>
          </div>
        </div>

        {/* Fees and Thresholds */}
        <div className="bg-card border rounded-2xl p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Truck size={20} className="text-primary" />
            Fees & Thresholds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>Base Delivery Fee ($)</Label>
              <Input
                type="number"
                value={config.defaultDeliveryFee}
                onChange={(e) => setConfig({ ...config, defaultDeliveryFee: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label>Handling Charge ($)</Label>
              <Input
                type="number"
                value={config.handlingCharge}
                onChange={(e) => setConfig({ ...config, handlingCharge: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label>Free Delivery Over ($)</Label>
              <Input
                type="number"
                value={config.freeDeliveryThreshold}
                onChange={(e) => setConfig({ ...config, freeDeliveryThreshold: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Delivery Zones */}
        <div className="bg-card border rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin size={20} className="text-primary" />
              Delivery Zones
            </h2>
            <Button variant="outline" size="sm" className="rounded-full" onClick={addZone}>
              <Plus size={14} className="mr-2" /> Add Zone
            </Button>
          </div>
          <div className="space-y-4">
            {config.deliveryZones?.map((zone: any, idx: number) => (
              <div key={idx} className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label className="text-xs">ZIP Code</Label>
                  <Input
                    placeholder="e.g. 10001"
                    value={zone.zipCode}
                    onChange={(e) => handleZoneUpdate(idx, 'zipCode', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Custom Fee ($)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 10"
                    value={zone.fee}
                    onChange={(e) => handleZoneUpdate(idx, 'fee', parseFloat(e.target.value))}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => {
                    const newZones = config.deliveryZones.filter((_: any, i: number) => i !== idx);
                    setConfig({ ...config, deliveryZones: newZones });
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            {config.deliveryZones?.length === 0 && (
              <p className="text-sm text-center py-4 text-muted-foreground italic border-2 border-dashed rounded-lg">
                No delivery zones defined. The base fee will be used for all orders.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
