import React, { useMemo, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '../ui/card';
import { Button } from '../ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { 
  Gift, 
  DollarSign, 
  Calculator, 
  Plus, 
  CheckCircle2, 
  Heart,
  TrendingUp,
  ArrowRight,
  Trash2,
  Edit2,
  Download
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface RegistryItem {
  id: string;
  purchased_by: string;
  title: string;
  price: number;
  created_at: string;
  is_purchased: boolean;
}

interface RegistryManagerProps {
  guestCount: number;
  registryItems: RegistryItem[];
  cashFunds: { name: string; target: number; current: number }[];
  onUpdateItem: (id: string, updates: Partial<RegistryItem>) => void;
  onDeleteItem: (id: string) => void;
  currency: string;
  userId: string;
  refreshData: () => void;
}

export const RegistryManager: React.FC<RegistryManagerProps> = ({
  guestCount,
  registryItems,
  cashFunds,
  onUpdateItem,
  onDeleteItem,
  currency,
  userId,
  refreshData
}) => {
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RegistryItem | null>(null);
  const [newItem, setNewItem] = useState({
    purchased_by: '',
    title: '',
    price: 0,
    created_at: new Date().toISOString().split('T')[0]
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const totalGifts = registryItems.length;
  
  const getCurrencyMultiplier = () => {
    switch(currency.toUpperCase()) {
      case 'INR':
      case 'JPY':
        return 100;
      default:
        return 1;
    }
  };

  const multiplier = getCurrencyMultiplier();
  const tier1 = 50 * multiplier;
  const tier2 = 100 * multiplier;
  const tier3 = 250 * multiplier;

  const tiers = [
    { label: `Under ${formatCurrency(tier1)}`, count: registryItems.filter(i => (i.price || 0) < tier1).length, icon: '🥉' },
    { label: `${formatCurrency(tier1)} - ${formatCurrency(tier2)}`, count: registryItems.filter(i => (i.price || 0) >= tier1 && (i.price || 0) <= tier2).length, icon: '🥈' },
    { label: `${formatCurrency(tier2)} - ${formatCurrency(tier3)}`, count: registryItems.filter(i => (i.price || 0) > tier2 && (i.price || 0) <= tier3).length, icon: '🥇' },
    { label: `Over ${formatCurrency(tier3)}`, count: registryItems.filter(i => (i.price || 0) > tier3).length, icon: '💎' },
  ];

  const totalCashReceived = registryItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const thankYouProgress = registryItems.length > 0 
    ? Math.round((registryItems.filter(i => i.is_purchased).length / registryItems.length) * 100) 
    : 0;

  const handleLogGift = async () => {
    if (!newItem.purchased_by) {
      toast.error('Please enter a gifter name');
      return;
    }

    const { data, error } = await supabase
      .from('registry_items')
      .insert([{
        purchased_by: newItem.purchased_by,
        title: newItem.title || (newItem.price > 0 ? '' : 'Gift'),
        price: newItem.price,
        created_at: newItem.created_at,
        is_purchased: false,
        couple_id: userId
      }])
      .select();

    if (error) {
      toast.error('Failed to log gift');
    } else {
      toast.success('Gift logged');
      setIsLogDialogOpen(false);
      setNewItem({ purchased_by: '', title: '', price: 0, created_at: new Date().toISOString().split('T')[0] });
      refreshData();
    }
  };

  const handleEditGift = () => {
    if (!editingItem) return;
    if (!editingItem.purchased_by) {
      toast.error('Please enter a gifter name');
      return;
    }
    
    onUpdateItem(editingItem.id, {
      purchased_by: editingItem.purchased_by,
      title: editingItem.title,
      price: editingItem.price,
      created_at: editingItem.created_at
    });
    
    toast.success('Gift updated');
    setEditingItem(null);
  };

  const handleExport = () => {
    if (registryItems.length === 0) {
      toast.error('No gifts to export');
      return;
    }
    
    const headers = ['Gifter Name,Gift Description,Cash Amount,Date Received,Thank You Sent'];
    const rows = registryItems.map(item => {
      const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString() : '';
      return `"${item.purchased_by || ''}","${item.title || ''}","${item.price || 0}","${dateStr}","${item.is_purchased ? 'Yes' : 'No'}"`;
    });
    const csvContent = headers.concat(rows).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "gift-tracker.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Gift list exported successfully!');
  };

  return (
    <div className="space-y-8">
      {/* Smart Calculator Widget */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="col-span-1 rounded-3xl border-none bg-zinc-900 text-white shadow-lg lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-400 uppercase tracking-widest">
                <Gift className="h-4 w-4" />
                Gift Summary
              </CardTitle>
              <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                Total Value: {formatCurrency(totalCashReceived)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4 flex flex-col gap-8 sm:flex-row sm:items-center">
              <div className="flex flex-col">
                <span className="text-5xl font-bold tracking-tighter">{totalGifts}</span>
                <span className="text-sm text-zinc-500 uppercase tracking-wider">Total Gifts Tracked</span>
              </div>
              <div className="h-px w-full bg-zinc-800 sm:h-16 sm:w-px" />
              <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
                {tiers.map((tier) => (
                  <div key={tier.label} className="flex flex-col items-center text-center">
                    <span className="text-xl">{tier.icon}</span>
                    <span className="mt-1 text-lg font-bold">{tier.count}</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">{tier.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-500">
              <CheckCircle2 className="h-4 w-4" />
              Thank Yous
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-zinc-900">{thankYouProgress}%</span>
              <span className="text-xs text-zinc-400">Complete</span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
              <div 
                className="h-full bg-zinc-900 transition-all duration-500" 
                style={{ width: `${thankYouProgress}%` }} 
              />
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              {registryItems.filter(i => i.is_purchased).length} of {registryItems.length} notes sent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gift Tracker Table */}
      <Card className="rounded-3xl border-none bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 pb-6">
          <div>
            <CardTitle>Gift Tracker</CardTitle>
            <CardDescription>Keep track of every gift and thank you note.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            
          <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
            <DialogTrigger render={<Button size="sm" className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">
              <Plus className="mr-2 h-4 w-4" />
              Log Gift
            </Button>} />
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-serif italic text-2xl">Log New Gift</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Gifter Name</Label>
                  <Input 
                    placeholder="e.g. Aunt Mary" 
                    value={newItem.purchased_by}
                    onChange={(e) => setNewItem({ ...newItem, purchased_by: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gift Description</Label>
                  <Input 
                    placeholder="e.g. KitchenAid Mixer" 
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cash Amount ({currency})</Label>
                    <Input 
                      type="number" 
                      placeholder="0"
                      value={newItem.price === 0 ? '' : newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date Received</Label>
                    <Input 
                      type="date" 
                      value={newItem.created_at}
                      onChange={(e) => setNewItem({ ...newItem, created_at: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsLogDialogOpen(false)} className="rounded-xl">Cancel</Button>
                <Button onClick={handleLogGift} className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">Log Gift</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-serif italic text-2xl">Edit Gift</DialogTitle>
              </DialogHeader>
              {editingItem && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Gifter Name</Label>
                    <Input 
                      value={editingItem.purchased_by}
                      onChange={(e) => setEditingItem({ ...editingItem, purchased_by: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gift Description</Label>
                    <Input 
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cash Amount ({currency})</Label>
                      <Input 
                        type="number" 
                        value={editingItem.price === 0 ? '' : editingItem.price}
                        onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date Received</Label>
                      <Input 
                        type="date" 
                        value={editingItem.created_at}
                        onChange={(e) => setEditingItem({ ...editingItem, created_at: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingItem(null)} className="rounded-xl">Cancel</Button>
                <Button onClick={handleEditGift} className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[200px] font-medium">Gifter Name</TableHead>
                  <TableHead className="font-medium">Gift Description</TableHead>
                  <TableHead className="font-medium">Cash Amount</TableHead>
                  <TableHead className="font-medium">Date Received</TableHead>
                  <TableHead className="w-[150px] font-medium">Thank You Sent</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registryItems.length > 0 ? (
                  registryItems.map((item) => (
                    <TableRow key={item.id} className="group transition-colors hover:bg-zinc-50">
                      <TableCell className="font-medium text-zinc-900">{item.purchased_by}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.title ? (
                            <>
                              <Gift className="h-3 w-3 text-zinc-400" />
                              <span className="text-zinc-600">{item.title}</span>
                            </>
                          ) : (
                            <span className="text-xs text-zinc-400 italic">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.price > 0 ? (
                            <>
                              <DollarSign className="h-3 w-3 text-emerald-500" />
                              <span className="font-semibold text-emerald-600">{formatCurrency(item.price)}</span>
                            </>
                          ) : (
                            <span className="text-xs text-zinc-400 italic">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-400">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={item.is_purchased} 
                            onCheckedChange={(checked) => onUpdateItem(item.id, { is_purchased: !!checked })}
                            className="rounded-md border-zinc-300 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900"
                          />
                          <span className={`text-xs ${item.is_purchased ? 'text-zinc-900 font-medium' : 'text-zinc-400'}`}>
                            {item.is_purchased ? 'Complete' : 'Pending'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                            onClick={() => setEditingItem(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => onDeleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-sm text-zinc-400 italic">
                      No gifts logged yet. Time to start your registry!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
