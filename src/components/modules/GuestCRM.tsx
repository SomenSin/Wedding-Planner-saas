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
  Trash2
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

const COLORS = ['#18181b', '#71717a', '#d4d4d8', '#f4f4f5'];

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
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: '',
    party_size: 1,
    address: ''
  });

  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      const matchesSearch = 
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchTerm.toLowerCase());
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
        user_id: userId,
        rsvp_status: 'pending',
        menu_choice: 'none',
        save_the_date_sent: false,
        invite_sent: false
      }])
      .select();

    if (error) {
      toast.error('Failed to add guest');
    } else {
      toast.success('Guest added');
      setIsAddDialogOpen(false);
      setNewGuest({ name: '', email: '', phone: '', party_size: 1, address: '' });
      refreshData();
    }
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
          <CardContent className="h-[200px]">
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
          </CardContent>
        </Card>

        <Card className="flex-1 rounded-3xl border-none bg-zinc-50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-500">Menu Choices</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={menuStats}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis hide />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" fill="#18181b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="w-full rounded-3xl border-none bg-zinc-900 p-6 text-white shadow-lg lg:w-80">
          <div className="flex h-full flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold">RSVP Portal</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Guests can RSVP using this unique code on the portal.
              </p>
              <div className="mt-6 flex items-center justify-center rounded-2xl bg-zinc-800 p-4 font-mono text-3xl font-bold tracking-widest">
                {accessCode}
              </div>
            </div>
            <Button 
              onClick={handleSharePortal}
              className="mt-6 w-full bg-white text-zinc-900 hover:bg-zinc-100"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share RSVP Portal
            </Button>
          </div>
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
              <Button variant="outline" size="sm" className="rounded-xl">
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
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">Cancel</Button>
                    <Button onClick={handleAddGuest} className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">Add Guest</Button>
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
              <Button variant="outline" size="sm" className="rounded-xl border-zinc-200">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
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
                  <TableHead className="font-medium">Save Date</TableHead>
                  <TableHead className="font-medium">Invite</TableHead>
                  <TableHead className="font-medium">Party</TableHead>
                  <TableHead className="font-medium">Table</TableHead>
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
                    <TableCell>
                      <Switch 
                        checked={guest.save_the_date_sent} 
                        onCheckedChange={(checked) => onUpdateGuest(guest.id, { save_the_date_sent: checked })}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={guest.invite_sent} 
                        onCheckedChange={(checked) => onUpdateGuest(guest.id, { invite_sent: checked })}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{guest.party_size}</TableCell>
                    <TableCell className="font-mono text-xs">{guest.table_number || '-'}</TableCell>
                    <TableCell className="capitalize text-xs">{guest.menu_choice}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>} />
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem onClick={() => onUpdateGuest(guest.id, { rsvp_status: 'accepted' })}>Mark Accepted</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateGuest(guest.id, { rsvp_status: 'declined' })}>Mark Declined</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => onDeleteGuest(guest.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
