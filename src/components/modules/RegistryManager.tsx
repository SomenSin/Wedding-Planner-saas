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
  Trash2
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
  gifter_name: string;
  gift_description: string;
  cash_amount: number;
  date_received: string;
  thank_you_sent: boolean;
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
  const [newItem, setNewItem] = useState({
    gifter_name: '',
    gift_description: '',
    cash_amount: 0,
    date_received: new Date().toISOString().split('T')[0]
  });

  const recommendedGifts = guestCount * 2;
  
  const tiers = [
    { label: `Under ${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(50)}`, count: Math.round(recommendedGifts * 0.2), icon: '🥉' },
    { label: `${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(50)} - ${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(100)}`, count: Math.round(recommendedGifts * 0.4), icon: '🥈' },
    { label: `${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(100)} - ${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(250)}`, count: Math.round(recommendedGifts * 0.3), icon: '🥇' },
    { label: `Over ${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(250)}`, count: Math.round(recommendedGifts * 0.1), icon: '💎' },
  ];

  const totalCashReceived = registryItems.reduce((sum, item) => sum + (item.cash_amount || 0), 0);
  const thankYouProgress = registryItems.length > 0 
    ? Math.round((registryItems.filter(i => i.thank_you_sent).length / registryItems.length) * 100) 
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleLogGift = async () => {
    if (!newItem.gifter_name) {
      toast.error('Please enter a gifter name');
      return;
    }

    const { data, error } = await supabase
      .from('registry_items')
      .insert([{
        ...newItem,
        user_id: userId,
        thank_you_sent: false
      }])
      .select();

    if (error) {
      toast.error('Failed to log gift');
    } else {
      toast.success('Gift logged');
      setIsLogDialogOpen(false);
      setNewItem({ gifter_name: '', gift_description: '', cash_amount: 0, date_received: new Date().toISOString().split('T')[0] });
      refreshData();
    }
  };

  return (
    <div className="space-y-8">
      {/* Smart Calculator Widget */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="col-span-1 rounded-3xl border-none bg-primary text-primary-foreground shadow-lg lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
<<<<<<< HEAD
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-400 uppercase tracking-widest">
                <Calculator className="h-4 w-4" />
                Registry Strategy
              </CardTitle>
              <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                Based on {guestCount} Guests
=======
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-primary-foreground/70 uppercase tracking-widest">
                <Gift className="h-4 w-4" />
                Gift Summary
              </CardTitle>
              <Badge variant="outline" className="border-primary-foreground/20 text-primary-foreground/70">
                Total Value: {formatCurrency(totalCashReceived)}
>>>>>>> cb0cbc8 (feat: complete dark mode refactor and branding refinement for Vow Vantage dashboard and admin interface)
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4 flex flex-col gap-8 sm:flex-row sm:items-center">
              <div className="flex flex-col">
<<<<<<< HEAD
                <span className="text-5xl font-bold tracking-tighter">{recommendedGifts}</span>
                <span className="text-sm text-zinc-500 uppercase tracking-wider">Recommended Gifts</span>
=======
                <span className="text-5xl font-bold tracking-tighter">{totalGifts}</span>
                <span className="text-sm text-primary-foreground/60 uppercase tracking-wider">Total Gifts Tracked</span>
>>>>>>> cb0cbc8 (feat: complete dark mode refactor and branding refinement for Vow Vantage dashboard and admin interface)
              </div>
              <div className="h-px w-full bg-primary-foreground/10 sm:h-16 sm:w-px" />
              <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
                {tiers.map((tier) => (
                  <div key={tier.label} className="flex flex-col items-center text-center">
                    <span className="text-xl">{tier.icon}</span>
                    <span className="mt-1 text-lg font-bold">{tier.count}</span>
                    <span className="text-[10px] text-primary-foreground/60 uppercase font-bold">{tier.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Thank Yous
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">{thankYouProgress}%</span>
              <span className="text-xs text-muted-foreground">Complete</span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${thankYouProgress}%` }} 
              />
            </div>
<<<<<<< HEAD
            <p className="mt-2 text-xs text-zinc-400">
              {registryItems.filter(i => i.thank_you_sent).length} of {registryItems.length} notes sent
=======
            <p className="mt-2 text-xs text-muted-foreground">
              {registryItems.filter(i => i.is_purchased).length} of {registryItems.length} notes sent
>>>>>>> cb0cbc8 (feat: complete dark mode refactor and branding refinement for Vow Vantage dashboard and admin interface)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gift Tracker Table */}
      <Card className="rounded-3xl border border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-6">
          <div>
            <CardTitle className="text-foreground">Gift Tracker</CardTitle>
            <CardDescription className="text-muted-foreground">Keep track of every gift and thank you note.</CardDescription>
          </div>
<<<<<<< HEAD
          
=======
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl border-input bg-background" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            
>>>>>>> cb0cbc8 (feat: complete dark mode refactor and branding refinement for Vow Vantage dashboard and admin interface)
          <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
            <DialogTrigger render={<Button size="sm" className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
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
                    value={newItem.gifter_name}
                    onChange={(e) => setNewItem({ ...newItem, gifter_name: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gift Description</Label>
                  <Input 
                    placeholder="e.g. KitchenAid Mixer" 
                    value={newItem.gift_description}
                    onChange={(e) => setNewItem({ ...newItem, gift_description: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cash Amount ({currency})</Label>
                    <Input 
                      type="number" 
                      placeholder="0"
                      value={newItem.cash_amount === 0 ? '' : newItem.cash_amount}
                      onChange={(e) => setNewItem({ ...newItem, cash_amount: Number(e.target.value) })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date Received</Label>
                    <Input 
                      type="date" 
                      value={newItem.date_received}
                      onChange={(e) => setNewItem({ ...newItem, date_received: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsLogDialogOpen(false)} className="rounded-xl font-medium">Cancel</Button>
                <Button onClick={handleLogGift} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">Log Gift</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
<<<<<<< HEAD
=======

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
                <Button variant="outline" onClick={() => setEditingItem(null)} className="rounded-xl font-medium">Cancel</Button>
                <Button onClick={handleEditGift} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
>>>>>>> cb0cbc8 (feat: complete dark mode refactor and branding refinement for Vow Vantage dashboard and admin interface)
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[200px] font-medium">Gifter Name</TableHead>
                  <TableHead className="font-medium">Gift Description / Cash</TableHead>
                  <TableHead className="font-medium">Date Received</TableHead>
                  <TableHead className="w-[150px] font-medium">Thank You Sent</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registryItems.length > 0 ? (
                  registryItems.map((item) => (
<<<<<<< HEAD
                    <TableRow key={item.id} className="group transition-colors hover:bg-zinc-50">
                      <TableCell className="font-medium text-zinc-900">{item.gifter_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.cash_amount > 0 ? (
                            <>
                              <DollarSign className="h-3 w-3 text-emerald-500" />
                              <span className="font-semibold text-emerald-600">{formatCurrency(item.cash_amount)}</span>
                            </>
                          ) : (
                            <>
                              <Gift className="h-3 w-3 text-zinc-400" />
                              <span className="text-zinc-600">{item.gift_description}</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-400">
                        {item.date_received ? new Date(item.date_received).toLocaleDateString() : '-'}
=======
                    <TableRow key={item.id} className="group transition-colors hover:bg-accent/50">
                      <TableCell className="font-medium text-foreground">{item.purchased_by}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.title ? (
                            <>
                              <Gift className="h-3 w-3 text-muted-foreground" />
                              <span className="text-foreground">{item.title}</span>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.price > 0 ? (
                            <>
                              <DollarSign className="h-3 w-3 text-emerald-500" />
                              <span className="font-semibold text-emerald-500">{formatCurrency(item.price)}</span>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
>>>>>>> cb0cbc8 (feat: complete dark mode refactor and branding refinement for Vow Vantage dashboard and admin interface)
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Checkbox 
<<<<<<< HEAD
                            checked={item.thank_you_sent} 
                            onCheckedChange={(checked) => onUpdateItem(item.id, { thank_you_sent: !!checked })}
                            className="rounded-md border-zinc-300 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900"
                          />
                          <span className={`text-xs ${item.thank_you_sent ? 'text-zinc-900 font-medium' : 'text-zinc-400'}`}>
                            {item.thank_you_sent ? 'Complete' : 'Pending'}
=======
                            checked={item.is_purchased} 
                            onCheckedChange={(checked) => onUpdateItem(item.id, { is_purchased: !!checked })}
                            className="rounded-md border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <span className={`text-xs ${item.is_purchased ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            {item.is_purchased ? 'Complete' : 'Pending'}
>>>>>>> cb0cbc8 (feat: complete dark mode refactor and branding refinement for Vow Vantage dashboard and admin interface)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
<<<<<<< HEAD
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => onDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
=======
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
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
>>>>>>> cb0cbc8 (feat: complete dark mode refactor and branding refinement for Vow Vantage dashboard and admin interface)
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
<<<<<<< HEAD
                    <TableCell colSpan={5} className="h-24 text-center text-sm text-zinc-400 italic">
=======
                    <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground italic">
>>>>>>> cb0cbc8 (feat: complete dark mode refactor and branding refinement for Vow Vantage dashboard and admin interface)
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
