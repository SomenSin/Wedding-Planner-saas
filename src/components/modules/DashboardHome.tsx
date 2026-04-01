import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Users, 
  DollarSign, 
  CheckSquare, 
  Plus, 
  Calendar,
  ArrowRight,
  Edit2,
  Gift,
  Wine,
  Clock
} from 'lucide-react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { motion } from 'motion/react';

import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface DashboardHomeProps {
  weddingDate: string;
  coupleName: string;
  partnerName: string;
  guestCount: number;
  guests: any[];
  rsvpsAccepted: number;
  totalBudget: number;
  spentBudget: number;
  upcomingTasks: any[];
  itinerary: any[];
  registryItems: any[];
  vendors: any[];
  drinks: any[];
  checklistCategories: any[];
  onQuickAction: (action: string) => void;
  onUpdateWeddingDetails: (details: any) => void;
  currency: string;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  weddingDate,
  coupleName,
  partnerName,
  guestCount,
  guests,
  rsvpsAccepted,
  totalBudget,
  spentBudget,
  upcomingTasks,
  itinerary,
  registryItems,
  vendors,
  drinks,
  checklistCategories,
  onQuickAction,
  onUpdateWeddingDetails,
  currency
}) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editDetails, setEditDetails] = useState({
    couple_name: coupleName,
    partner_name: partnerName,
    wedding_date: weddingDate
  });

  // Parse "HH:MM AM/PM" to minutes since midnight for sorting
  // Parse various time formats like "9 AM", "10:30 PM", "12:00 PM"
  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 9999;
    const match = timeStr.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
    if (!match) return 9999;
    
    let hours = parseInt(match[1]);
    const mins = match[2] ? parseInt(match[2]) : 0;
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + mins;
  };

  // Helper to normalize dates to simplified YYYY-MM-DD for comparison
  const normalizeDate = (d: any) => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return String(d).split('T')[0];
      return dt.toISOString().split('T')[0];
    } catch {
      return String(d).split('T')[0];
    }
  };

  // Filter and sort itinerary for dashboard display (Wedding Day only)
  const normWeddingDate = normalizeDate(weddingDate);
  const weddingDayItems = itinerary
    .filter(item => normalizeDate(item.event_date) === normWeddingDate)
    .sort((a, b) => parseTimeToMinutes(a.time_text) - parseTimeToMinutes(b.time_text))
    .slice(0, 3);

  useEffect(() => {
    setEditDetails({
      couple_name: coupleName,
      partner_name: partnerName,
      wedding_date: weddingDate
    });
  }, [coupleName, partnerName, weddingDate]);

  useEffect(() => {
    if (!weddingDate) return;

    const timer = setInterval(() => {
      const target = new Date(weddingDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

  const budgetSpentPercent = totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate total headcount (sum of party_size) for accurate drink estimations
  const totalHeadcount = guests.reduce((sum, g) => sum + (g.party_size || 1), 0);

  // Calculate total drinks from the actual drink calculator entries
  const totalDrinksFromCalculator = (drinks || []).reduce((sum, d) => sum + (d.estimated || 0), 0);

  return (
    <div className="space-y-8">
      {/* Countdown Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-zinc-900 p-12 text-white shadow-2xl"
      >
        <div className="absolute top-6 right-6 z-20">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger render={
              <Button variant="ghost" size="icon" className="rounded-full bg-white/10 text-white hover:bg-white/20">
                <Edit2 className="h-4 w-4" />
              </Button>
            } />
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-serif italic text-2xl">Edit Wedding Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Your Name</Label>
                  <Input 
                    value={editDetails.couple_name}
                    onChange={(e) => setEditDetails({ ...editDetails, couple_name: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Partner's Name</Label>
                  <Input 
                    value={editDetails.partner_name}
                    onChange={(e) => setEditDetails({ ...editDetails, partner_name: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Wedding Date</Label>
                  <Input 
                    type="date"
                    value={editDetails.wedding_date}
                    onChange={(e) => setEditDetails({ ...editDetails, wedding_date: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl">Cancel</Button>
                <Button onClick={() => {
                  onUpdateWeddingDetails(editDetails);
                  setIsEditing(false);
                }} className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <span className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
            {coupleName} & {partnerName}'s Big Day
          </span>
          <div className="mb-6 flex gap-4 sm:gap-8">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Mins', value: timeLeft.minutes },
              { label: 'Secs', value: timeLeft.seconds },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <span className="font-serif text-4xl font-light tracking-tighter sm:text-7xl md:text-8xl">
                  {String(item.value).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-2">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xl font-light text-zinc-300 italic">Until We Say "I Do"</p>
          <div className="mt-8 h-px w-24 bg-zinc-700" />
          <p className="mt-6 font-mono text-xs tracking-widest text-zinc-500 uppercase">
            {weddingDate ? new Date(weddingDate).toLocaleDateString('en-US', { dateStyle: 'full' }) : 'Date not set'}
          </p>
        </div>
        {/* Decorative background elements */}
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-zinc-800/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-zinc-800/20 blur-3xl" />
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Button 
          variant="outline" 
          className="h-24 flex-col gap-2 rounded-2xl border-zinc-200 bg-white hover:bg-zinc-50"
          onClick={() => onQuickAction('add-guest')}
        >
          <Plus className="h-6 w-6 text-zinc-600" />
          <span className="font-medium">Add Guest</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-24 flex-col gap-2 rounded-2xl border-zinc-200 bg-white hover:bg-zinc-50"
          onClick={() => onQuickAction('log-expense')}
        >
          <Plus className="h-6 w-6 text-zinc-600" />
          <span className="font-medium">Log Expense</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-24 flex-col gap-2 rounded-2xl border-zinc-200 bg-white hover:bg-zinc-50"
          onClick={() => onQuickAction('check-task')}
        >
          <CheckSquare className="h-6 w-6 text-zinc-600" />
          <span className="font-medium">Check off Task</span>
        </Button>
      </div>

      {/* Summary Widgets Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Budget Status */}
        <Card className="rounded-3xl border-none bg-zinc-50 shadow-sm transition-all hover:bg-zinc-100/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-500">
              <DollarSign className="h-4 w-4" />
              Budget Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-zinc-900">{budgetSpentPercent}%</span>
              <span className="text-xs text-zinc-400">spent of total</span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-200/50">
              <div 
                className="h-full bg-zinc-900 transition-all duration-700" 
                style={{ width: `${budgetSpentPercent}%` }} 
              />
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              Spent: {formatCurrency(spentBudget)}
            </p>
          </CardContent>
        </Card>

        {/* Guest RSVPs */}
        <Card className="rounded-3xl border-none bg-zinc-50 shadow-sm transition-all hover:bg-zinc-100/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-500">
              <Users className="h-4 w-4" />
              RSVPs Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-zinc-900">{rsvpsAccepted}</span>
              <span className="text-xs text-zinc-400">accepted of {guestCount}</span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-200/50">
              <div 
                className="h-full bg-zinc-900 transition-all duration-700" 
                style={{ width: `${guestCount > 0 ? (rsvpsAccepted / guestCount) * 100 : 0}%` }} 
              />
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              Pending: {guestCount - rsvpsAccepted - guests.filter(g => g.rsvp_status === 'declined').length} response(s)
            </p>
          </CardContent>
        </Card>

        {/* Registry & Gifts */}
        <Card className="rounded-3xl border-none bg-zinc-50 shadow-sm transition-all hover:bg-zinc-100/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-500">
              <Gift className="h-4 w-4" />
              Gift Registry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-zinc-900">{registryItems.length}</span>
              <span className="text-xs text-zinc-400">items in list</span>
            </div>
            <p className="mt-4 text-xs text-zinc-500">
              <span className="font-bold text-zinc-900">{registryItems.filter(i => i.is_purchased).length}</span> gift received so far
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              Cash Received: {formatCurrency(registryItems.reduce((acc, current) => acc + (current.price || 0), 0))} value
            </p>
          </CardContent>
        </Card>

        {/* Vendors */}
        <Card className="rounded-3xl border-none bg-zinc-50 shadow-sm transition-all hover:bg-zinc-100/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-500">
              <Calendar className="h-4 w-4" />
              Vendors Hired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-zinc-900">{vendors.length}</span>
              <span className="text-xs text-zinc-400">Total vendors</span>
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <p className="text-xs text-zinc-500">
                <span className="font-bold text-zinc-900">{vendors.filter(v => v.status === 'hired').length}</span> confirmed hired
              </p>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/50">
                <div 
                  className="h-full bg-zinc-900 transition-all" 
                  style={{ width: `${vendors.length > 0 ? (vendors.filter(v => v.status === 'hired').length / vendors.length) * 100 : 0}%` }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Drink Calculator Summary */}
        <Card className="rounded-3xl border-none bg-zinc-50 shadow-sm transition-all hover:bg-zinc-100/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-500">
              <Wine className="h-4 w-4" />
              Drink Estimations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-zinc-900">
                {totalDrinksFromCalculator > 0 ? totalDrinksFromCalculator : Math.round(totalHeadcount * 4)}
              </span>
              <span className="text-xs text-zinc-400">total drinks est.</span>
            </div>
            <p className="mt-4 text-xs text-zinc-500 leading-tight">
              Based on {totalDrinksFromCalculator > 0 ? 'calculator list' : `${totalHeadcount} guests`}
            </p>
            <p className="mt-3 text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              Breakdown: 50% Soft Drinks, 20% Beer, 15% Wine, 10% Spirits, 5% Others
            </p>
          </CardContent>
        </Card>

        {/* Itinerary & Tasks */}
        <Card className="rounded-3xl border-none bg-zinc-50 shadow-sm transition-all hover:bg-zinc-100/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-500">
              <Clock className="h-4 w-4" />
              Wedding Day Itinerary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-4">
              {weddingDayItems.length > 0 ? (
                <div className="space-y-3">
                  {weddingDayItems.map((item, i) => (
                    <div key={`itin-${i}`} className="flex items-start gap-3">
                      <div className="flex flex-col items-center pt-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-900" />
                        {i !== weddingDayItems.length - 1 && <div className="h-4 w-px bg-zinc-200 mt-1" />}
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="truncate text-xs font-bold text-zinc-900 uppercase tracking-wide leading-none">{item.activity || item.title}</span>
                        <span className="text-[10px] text-zinc-400 font-medium">{item.time_text} • {item.location || 'Main Venue'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <Clock className="h-8 w-8 text-zinc-100 mb-2" />
                  <p className="text-[10px] text-zinc-400 italic">No wedding day events scheduled</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Master Checklist */}
        <Card className="rounded-3xl border-none bg-zinc-50 shadow-sm transition-all hover:bg-zinc-100/50 md:col-span-full lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-500">
              <CheckSquare className="h-4 w-4" />
              Checklist Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const allItems = checklistCategories.flatMap(c => c.checklist_items || []);
              const completed = allItems.filter(i => i.completed).length;
              const total = allItems.length;
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
              
              return (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-zinc-900">{percent}%</span>
                    <span className="text-xs text-zinc-400">overall roadmap</span>
                  </div>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-200/50">
                    <div 
                      className="h-full bg-zinc-900 transition-all duration-1000" 
                      style={{ width: `${percent}%` }} 
                    />
                  </div>
                  <p className="mt-3 text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                    {completed} of {total} items completed
                  </p>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
