import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { 
  Mail, 
  Phone, 
  Globe, 
  Plus, 
  ExternalLink, 
  CheckCircle2, 
  DollarSign,
  MoreVertical,
  Camera,
  Music,
  MapPin,
  Flower2,
  Trash2,
  Layout
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface Vendor {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  website: string;
  quote_requested: boolean;
  booked: boolean;
  total_cost: number;
  deposit_paid: number;
  balance_due: number;
}

interface VendorManagerProps {
  vendors: Vendor[];
  onUpdateVendor: (id: string, updates: Partial<Vendor>) => void;
  onDeleteVendor: (id: string) => void;
  currency: string;
  userId: string;
  refreshData: () => void;
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category.toLowerCase()) {
    case 'photographer': return <Camera className="h-5 w-5" />;
    case 'venue': return <MapPin className="h-5 w-5" />;
    case 'florist': return <Flower2 className="h-5 w-5" />;
    case 'dj': return <Music className="h-5 w-5" />;
    default: return <Layout className="h-5 w-5" />;
  }
};

const VENDOR_CATEGORIES = [
  'Venue',
  'Photographer',
  'Florist',
  'DJ',
  'Catering',
  'Bakery',
  'Attire',
  'Stationery',
  'Other'
];

export const VendorManager: React.FC<VendorManagerProps> = ({
  vendors,
  onUpdateVendor,
  onDeleteVendor,
  currency,
  userId,
  refreshData
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    category: 'Other',
    email: '',
    phone: '',
    website: '',
    total_cost: 0,
    deposit_paid: 0
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleAddVendor = async () => {
    if (!newVendor.name) {
      toast.error('Please enter a vendor name');
      return;
    }

    const { error } = await supabase
      .from('vendors')
      .insert([{
        ...newVendor,
        user_id: userId,
        quote_requested: false,
        booked: false,
        balance_due: newVendor.total_cost - newVendor.deposit_paid
      }]);

    if (error) {
      toast.error('Failed to add vendor');
    } else {
      toast.success('Vendor added');
      setIsAddDialogOpen(false);
      setNewVendor({ name: '', category: 'Other', email: '', phone: '', website: '', total_cost: 0, deposit_paid: 0 });
      refreshData();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Vendor Management</h2>
          <p className="text-sm text-muted-foreground">Keep track of your dream team.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger render={<Button size="sm" className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>} />
          <DialogContent className="rounded-3xl max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif italic text-2xl">Add New Vendor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Vendor Name</Label>
                <Input 
                  placeholder="e.g. Elegant Events" 
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={newVendor.category} 
                  onValueChange={(value) => setNewVendor({ ...newVendor, category: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {VENDOR_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    placeholder="vendor@example.com" 
                    value={newVendor.email}
                    onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    placeholder="+1 (555) 000-0000" 
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input 
                  placeholder="https://example.com" 
                  value={newVendor.website}
                  onChange={(e) => setNewVendor({ ...newVendor, website: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Cost ({currency})</Label>
                  <Input 
                    type="number" 
                    placeholder="0"
                    value={newVendor.total_cost === 0 ? '' : newVendor.total_cost}
                    onChange={(e) => setNewVendor({ ...newVendor, total_cost: Number(e.target.value) })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deposit Paid ({currency})</Label>
                  <Input 
                    type="number" 
                    placeholder="0"
                    value={newVendor.deposit_paid === 0 ? '' : newVendor.deposit_paid}
                    onChange={(e) => setNewVendor({ ...newVendor, deposit_paid: Number(e.target.value) })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl font-medium">Cancel</Button>
              <Button onClick={handleAddVendor} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">Add Vendor</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
<<<<<<< HEAD
=======

        <Dialog open={!!editingVendor} onOpenChange={(open) => !open && setEditingVendor(null)}>
          <DialogContent className="rounded-3xl max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif italic text-2xl">Edit Vendor</DialogTitle>
            </DialogHeader>
            {editingVendor && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Vendor Name</Label>
                  <Input 
                    value={editingVendor.name}
                    onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={editingVendor.category} 
                    onValueChange={(value) => setEditingVendor({ ...editingVendor, category: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {VENDOR_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      value={editingVendor.email}
                      onChange={(e) => setEditingVendor({ ...editingVendor, email: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input 
                      value={editingVendor.phone}
                      onChange={(e) => setEditingVendor({ ...editingVendor, phone: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input 
                    value={editingVendor.website}
                    onChange={(e) => setEditingVendor({ ...editingVendor, website: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total Cost ({currency})</Label>
                    <Input 
                      type="number" 
                      value={editingVendor.total_cost === 0 ? '' : editingVendor.total_cost}
                      onChange={(e) => setEditingVendor({ ...editingVendor, total_cost: Number(e.target.value) })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deposit Paid ({currency})</Label>
                    <Input 
                      type="number" 
                      value={editingVendor.deposit_paid === 0 ? '' : editingVendor.deposit_paid}
                      onChange={(e) => setEditingVendor({ ...editingVendor, deposit_paid: Number(e.target.value) })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingVendor(null)} className="rounded-xl font-medium">Cancel</Button>
              <Button onClick={handleEditVendor} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
>>>>>>> cb0cbc8 (feat: complete dark mode refactor and branding refinement for Vow Vantage dashboard and admin interface)
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {vendors.map((vendor) => (
          <Card key={vendor.id} className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <CategoryIcon category={vendor.category} />
                </div>
                <div className="flex gap-2">
                  {vendor.booked && (
                    <Badge className="rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                      Booked
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
<<<<<<< HEAD
=======
                    className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setEditingVendor(vendor)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
>>>>>>> cb0cbc8 (feat: complete dark mode refactor and branding refinement for Vow Vantage dashboard and admin interface)
                    className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => onDeleteVendor(vendor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <CardTitle className="text-lg font-bold text-foreground">{vendor.name}</CardTitle>
                <CardDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {vendor.category}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-muted-foreground/50" />
                  <span className="truncate">{vendor.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-muted-foreground/50" />
                  <span>{vendor.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground/80">
                  <Globe className="h-4 w-4 text-muted-foreground/50" />
                  <a href={vendor.website} target="_blank" rel="noreferrer" className="truncate hover:text-foreground hover:underline">
                    {vendor.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl bg-muted/50 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground uppercase tracking-wider">Total Cost</span>
                  <span className="font-bold text-foreground">{formatCurrency(vendor.total_cost)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground uppercase tracking-wider">Deposit Paid</span>
                  <span className="font-medium text-emerald-500">{formatCurrency(vendor.deposit_paid)}</span>
                </div>
                <div className="h-px w-full bg-border" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground uppercase tracking-wider">Balance Due</span>
                  <span className="font-bold text-destructive">{formatCurrency(vendor.balance_due)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-4">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={vendor.quote_requested} 
                  onCheckedChange={(checked) => onUpdateVendor(vendor.id, { quote_requested: !!checked })}
                  className="rounded-md border-input"
                />
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Quote Requested</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={vendor.booked} 
                  onCheckedChange={(checked) => onUpdateVendor(vendor.id, { booked: !!checked })}
                  className="rounded-md border-input"
                />
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Booked</span>
              </div>
            </CardFooter>
          </Card>
        ))}
        <Button 
          variant="outline" 
          className="h-full min-h-[300px] flex-col gap-4 rounded-3xl border-dashed border-border bg-transparent hover:bg-muted/10 text-muted-foreground hover:text-foreground"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Plus className="h-6 w-6" />
          </div>
          <div className="text-center">
            <span className="block text-sm font-bold text-foreground">Add New Vendor</span>
            <span className="text-xs text-muted-foreground">Expand your wedding team</span>
          </div>
        </Button>
      </div>
    </div>
  );
};
