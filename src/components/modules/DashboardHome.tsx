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
  Edit2
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
  rsvpsAccepted: number;
  totalBudget: number;
  spentBudget: number;
  upcomingTasks: any[];
  onQuickAction: (action: string) => void;
  onUpdateWeddingDetails: (details: any) => void;
  currency: string;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  weddingDate,
  coupleName,
  partnerName,
  guestCount,
  rsvpsAccepted,
  totalBudget,
  spentBudget,
  upcomingTasks,
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

      {/* Mini-Widgets */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="rounded-3xl border-none bg-zinc-50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-500">
              <DollarSign className="h-4 w-4" />
              Budget Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-zinc-900">{budgetSpentPercent}%</span>
              <span className="text-xs text-zinc-400">of total budget</span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
              <div 
                className="h-full bg-zinc-900 transition-all duration-500" 
                style={{ width: `${budgetSpentPercent}%` }} 
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500">{formatCurrency(spentBudget)} spent of {formatCurrency(totalBudget)}</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none bg-zinc-50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-500">
              <Users className="h-4 w-4" />
              RSVPs Accepted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-zinc-900">{rsvpsAccepted}</span>
              <span className="text-xs text-zinc-400">out of {guestCount} guests</span>
            </div>
            <div className="mt-4 flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 flex-1 rounded-full ${i < (rsvpsAccepted / (guestCount || 1) * 10) ? 'bg-zinc-900' : 'bg-zinc-200'}`} 
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none bg-zinc-50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-500">
              <CheckSquare className="h-4 w-4" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.slice(0, 3).map((task, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate text-zinc-700">{task.title}</span>
                    <span className="text-xs text-zinc-400">{task.due_date ? formatDistanceToNow(new Date(task.due_date), { addSuffix: true }) : 'No date'}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-400 italic">All caught up!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
