import React, { useState, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { 
  Search, 
  MoreHorizontal, 
  Share2, 
  Download, 
  Filter,
  Users,
  Utensils,
  Mail,
  Plus,
  X,
  Trash2,
  Edit2
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '../ui/dialog';
import { Label } from '../ui/label';
import { supabase } from '@/lib/supabase';

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  save_the_date_sent: boolean;
  invite_sent: boolean;
  rsvp_status: 'pending' | 'accepted' | 'declined';
  party_size: number;
  table_number: string;
  menu_choice: 'beef' | 'chicken' | 'fish' | 'veg' | 'none';
  dietary_restrictions: string;
}

interface GuestCRMProps {
  guests: Guest[];
  accessCode: string;
  onUpdateGuest: (id: string, updates: Partial<Guest>) => void;
  onDeleteGuest: (id: string) => void;
  userId: string;
  refreshData: () => void;
}

const COLORS = [
  '#18181b', // Zinc 900
  '#c5a880', // Champagne Gold
  '#8a9a86', // Sage Green
  '#e2c2c6', // Blush Pink
];

export const GuestCRM: React.FC<GuestCRMProps> = ({
  guests,
  accessCode,
  onUpdateGuest,
  onDeleteGuest,
  userId,
  refreshData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: '',
    party_size: 1,
    address: '',
    menu_choice: 'none',
    rsvp_status: 'pending' as 'pending' | 'accepted' | 'declined'
  });

  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      const matchesSearch = 
        (guest.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (guest.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || guest.rsvp_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [guests, searchTerm, statusFilter]);

  const rsvpStats = useMemo(() => {
    const stats = [
      { name: 'Accepted', value: guests.filter(g => g.rsvp_status === 'accepted').length },
      { name: 'Declined', value: guests.filter(g => g.rsvp_status === 'declined').length },
      { name: 'Pending', value: guests.filter(g => g.rsvp_status === 'pending').length },
    ];
    return stats;
  }, [guests]);

  const menuStats = useMemo(() => {
    const stats = [
      { name: 'Beef', count: guests.filter(g => g.menu_choice === 'beef').length },
      { name: 'Chicken', count: guests.filter(g => g.menu_choice === 'chicken').length },
      { name: 'Fish', count: guests.filter(g => g.menu_choice === 'fish').length },
      { name: 'Veg', count: guests.filter(g => g.menu_choice === 'veg').length },
    ];
    return stats;
  }, [guests]);

  const handleSharePortal = () => {
    const url = window.location.origin + '/rsvp';
    navigator.clipboard.writeText(url);
    toast.success('RSVP Portal link copied to clipboard!');
  };

  const handleAddGuest = async () => {
    if (!newGuest.name) {
      toast.error('Please enter a guest name');
      return;
    }

    const { data, error } = await supabase
      .from('guests')
      .insert([{
        ...newGuest,
        couple_id: userId,
        rsvp_status: newGuest.rsvp_status,
        save_the_date_sent: false,
        invite_sent: false
      }])
      .select();

    if (error) {
      console.error('Supabase Error adding guest:', error);
      toast.error('Failed to add guest: ' + error.message);
    } else {
      toast.success('Guest added');
      setIsAddDialogOpen(false);
      setNewGuest({ name: '', email: '', phone: '', party_size: 1, address: '', menu_choice: 'none' });
      refreshData();
    }
  };

  const handleEditGuest = () => {
    if (!editingGuest || !editingGuest.name) {
      toast.error('Please enter a guest name');
      return;
    }
    
    onUpdateGuest(editingGuest.id, {
      name: editingGuest.name,
      email: editingGuest.email,
      phone: editingGuest.phone,
      party_size: editingGuest.party_size,
      address: editingGuest.address,
      menu_choice: editingGuest.menu_choice,
      rsvp_status: editingGuest.rsvp_status
    });
    
    toast.success('Guest updated');
    setEditingGuest(null);
  };

  const handleExport = () => {
    if (filteredGuests.length === 0) {
      toast.error('No guests to export');
      return;
    }
    
    const headers = ['Name,Email,Phone,RSVP Status,Party Size,Table,Menu Choice'];
    const rows = filteredGuests.map(g => 
      `"${g.name || ''}","${g.email || ''}","${g.phone || ''}","${g.rsvp_status}","${g.party_size || 1}","${g.table_number || ''}","${g.menu_choice || 'none'}"`
    );
    const csvContent = headers.concat(rows).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "guest-list.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export downloaded!');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-serif italic text-zinc-900">Guest CRM</h2>
          <p className="text-zinc-500">Manage your guest list, RSVPs, and preferences.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3 overflow-hidden">
            {guests.slice(0, 5).map((guest, i) => (
              <div key={i} className="inline-block h-10 w-10 rounded-full bg-zinc-100 ring-2 ring-white flex items-center justify-center text-xs font-bold text-zinc-400">
                {guest.name.charAt(0)}
              </div>
            ))}
            {guests.length > 5 && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white ring-2 ring-white">
                +{guests.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <Card className="flex-1 rounded-3xl border-none bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-500">RSVP Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[320px]">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rsvpStats}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {rsvpStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-auto grid grid-cols-4 gap-2 text-center border-t border-zinc-100 pt-4">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-zinc-900">{guests.length}</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mt-1">Total</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-emerald-500">{guests.filter(g => g.rsvp_status === 'accepted').length}</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mt-1">Accepted</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-red-500">{guests.filter(g => g.rsvp_status === 'declined').length}</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mt-1">Declined</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-orange-400">{guests.filter(g => g.rsvp_status === 'pending').length}</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mt-1">Pending</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-3xl border-none bg-white shadow-sm">
        <CardHeader className="border-b border-zinc-100 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Guest List</CardTitle>
              <CardDescription>Manage your wedding guests and their preferences.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger render={<Button size="sm" className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Guest
                </Button>} />
                <DialogContent className="rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="font-serif italic text-2xl">Add New Guest</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input 
                        placeholder="e.g. John Doe" 
                        value={newGuest.name}
                        onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input 
                          type="email" 
                          placeholder="john@example.com"
                          value={newGuest.email}
                          onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input 
                          placeholder="+1 234 567 890"
                          value={newGuest.phone}
                          onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Party Size</Label>
                      <Input 
                        type="number" 
                        placeholder="1"
                        value={newGuest.party_size === 0 ? '' : newGuest.party_size}
                        onChange={(e) => setNewGuest({ ...newGuest, party_size: Number(e.target.value) })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input 
                        placeholder="Mailing address" 
                        value={newGuest.address}
                        onChange={(e) => setNewGuest({ ...newGuest, address: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Menu Choice</Label>
                          <select 
                            className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                            value={newGuest.menu_choice}
                            onChange={(e) => setNewGuest({ ...newGuest, menu_choice: e.target.value })}
                          >
                            <option value="none">None</option>
                            <option value="beef">Beef</option>
                            <option value="chicken">Chicken</option>
                            <option value="fish">Fish</option>
                            <option value="veg">Vegetarian</option>
                          </select>
                      </div>
                      <div className="space-y-2">
                        <Label>RSVP Status</Label>
                          <select 
                            className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                            value={newGuest.rsvp_status}
                            onChange={(e) => setNewGuest({ ...newGuest, rsvp_status: e.target.value as any })}
                          >
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="declined">Declined</option>
                          </select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">Cancel</Button>
                    <Button onClick={handleAddGuest} className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">Add Guest</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={!!editingGuest} onOpenChange={(open) => !open && setEditingGuest(null)}>
                <DialogContent className="rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="font-serif italic text-2xl">Edit Guest</DialogTitle>
                  </DialogHeader>
                  {editingGuest && (
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input 
                          value={editingGuest.name}
                          onChange={(e) => setEditingGuest({ ...editingGuest, name: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input 
                            type="email" 
                            value={editingGuest.email || ''}
                            onChange={(e) => setEditingGuest({ ...editingGuest, email: e.target.value })}
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input 
                            value={editingGuest.phone || ''}
                            onChange={(e) => setEditingGuest({ ...editingGuest, phone: e.target.value })}
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Party Size</Label>
                        <Input 
                          type="number" 
                          value={editingGuest.party_size === 0 ? '' : editingGuest.party_size}
                          onChange={(e) => setEditingGuest({ ...editingGuest, party_size: Number(e.target.value) })}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input 
                          value={editingGuest.address || ''}
                          onChange={(e) => setEditingGuest({ ...editingGuest, address: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Menu Choice</Label>
                            <select 
                              className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                              value={editingGuest.menu_choice}
                              onChange={(e) => setEditingGuest({ ...editingGuest, menu_choice: e.target.value as any })}
                            >
                              <option value="none">None</option>
                              <option value="beef">Beef</option>
                              <option value="chicken">Chicken</option>
                              <option value="fish">Fish</option>
                              <option value="veg">Vegetarian</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                          <Label>RSVP Status</Label>
                            <select 
                              className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                              value={editingGuest.rsvp_status}
                              onChange={(e) => setEditingGuest({ ...editingGuest, rsvp_status: e.target.value as any })}
                            >
                              <option value="pending">Pending</option>
                              <option value="accepted">Accepted</option>
                              <option value="declined">Declined</option>
                            </select>
                        </div>
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingGuest(null)} className="rounded-xl">Cancel</Button>
                    <Button onClick={handleEditGuest} className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input 
                placeholder="Search guests..." 
                className="pl-10 rounded-xl border-zinc-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl border-zinc-200">
                    <Filter className="mr-2 h-4 w-4" />
                    {statusFilter === 'all' ? 'Filter' : `Status: ${statusFilter}`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Guests</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('pending')}>Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('accepted')}>Accepted</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('declined')}>Declined</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[200px] font-medium">Guest Name</TableHead>
                  <TableHead className="font-medium">Contact</TableHead>
                  <TableHead className="font-medium">RSVP Status</TableHead>
                  <TableHead className="font-medium">Party</TableHead>
                  <TableHead className="font-medium">Menu</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.map((guest) => (
                  <TableRow key={guest.id} className="group transition-colors hover:bg-zinc-50">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{guest.name}</span>
                        <span className="text-xs text-zinc-400 font-normal truncate max-w-[150px]">{guest.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs text-zinc-500">
                        <span>{guest.email}</span>
                        <span>{guest.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-full capitalize ${
                        guest.rsvp_status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        guest.rsvp_status === 'declined' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-zinc-50 text-zinc-600 border-zinc-100'
                      }`}>
                        {guest.rsvp_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{guest.party_size}</TableCell>
                    <TableCell className="capitalize text-xs">{guest.menu_choice}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                          onClick={() => setEditingGuest(guest)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => onDeleteGuest(guest.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
