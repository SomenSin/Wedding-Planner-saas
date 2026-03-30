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
  Layout,
  Edit2
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
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
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

  const handleEditVendor = () => {
    if (!editingVendor) return;
    if (!editingVendor.name) {
      toast.error('Please enter a vendor name');
      return;
    }
    
    onUpdateVendor(editingVendor.id, {
      name: editingVendor.name,
      category: editingVendor.category,
      email: editingVendor.email,
      phone: editingVendor.phone,
      website: editingVendor.website,
      total_cost: editingVendor.total_cost,
      deposit_paid: editingVendor.deposit_paid,
      balance_due: editingVendor.total_cost - editingVendor.deposit_paid
    });
    
    toast.success('Vendor updated');
    setEditingVendor(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Vendor Management</h2>
          <p className="text-sm text-zinc-500">Keep track of your dream team.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger render={<Button size="sm" className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">
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
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleAddVendor} className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">Add Vendor</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
              <Button variant="outline" onClick={() => setEditingVendor(null)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleEditVendor} className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {vendors.map((vendor) => (
          <Card key={vendor.id} className="group relative flex flex-col overflow-hidden rounded-3xl border-none bg-white shadow-sm transition-all hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600">
                  <CategoryIcon category={vendor.category} />
                </div>
                <div className="flex gap-2">
                  {vendor.booked && (
                    <Badge className="rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      Booked
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                    onClick={() => setEditingVendor(vendor)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => onDeleteVendor(vendor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <CardTitle className="text-lg font-bold text-zinc-900">{vendor.name}</CardTitle>
                <CardDescription className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                  {vendor.category}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <Mail className="h-4 w-4 text-zinc-300" />
                  <span className="truncate">{vendor.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <Phone className="h-4 w-4 text-zinc-300" />
                  <span>{vendor.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <Globe className="h-4 w-4 text-zinc-300" />
                  <a href={vendor.website} target="_blank" rel="noreferrer" className="truncate hover:text-zinc-900 hover:underline">
                    {vendor.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl bg-zinc-50 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 uppercase tracking-wider">Total Cost</span>
                  <span className="font-bold text-zinc-900">{formatCurrency(vendor.total_cost)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 uppercase tracking-wider">Deposit Paid</span>
                  <span className="font-medium text-emerald-600">{formatCurrency(vendor.deposit_paid)}</span>
                </div>
                <div className="h-px w-full bg-zinc-200" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 uppercase tracking-wider">Balance Due</span>
                  <span className="font-bold text-red-500">{formatCurrency(vendor.balance_due)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t border-zinc-50 bg-zinc-50/30 px-6 py-4">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={vendor.quote_requested} 
                  onCheckedChange={(checked) => onUpdateVendor(vendor.id, { quote_requested: !!checked })}
                  className="rounded-md border-zinc-300"
                />
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Quote Requested</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={vendor.booked} 
                  onCheckedChange={(checked) => onUpdateVendor(vendor.id, { booked: !!checked })}
                  className="rounded-md border-zinc-300"
                />
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Booked</span>
              </div>
            </CardFooter>
          </Card>
        ))}
        <Button 
          variant="outline" 
          className="h-full min-h-[300px] flex-col gap-4 rounded-3xl border-dashed border-zinc-200 bg-transparent hover:bg-zinc-50"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
            <Plus className="h-6 w-6" />
          </div>
          <div className="text-center">
            <span className="block text-sm font-bold text-zinc-900">Add New Vendor</span>
            <span className="text-xs text-zinc-400">Expand your wedding team</span>
          </div>
        </Button>
      </div>
    </div>
  );
};
