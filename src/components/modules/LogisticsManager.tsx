import React, { useState, useMemo } from 'react';
import { 
  Card, 
  CardContent,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  MapPin
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

interface ItineraryItem {
  id: string;
  time_text: string;
  activity: string;
  location: string;
  event_date?: string;
}

interface LogisticsManagerProps {
  weddingDate: string;
  tasks: any[];
  itinerary: ItineraryItem[];
  onUpdateTask: (id: string, updates: any) => void;
  onUpdateItinerary: (items: ItineraryItem[]) => void;
  onDeleteTask: (id: string) => void;
  onDeleteItineraryItem: (id: string) => void;
  userId: string;
  refreshData: () => void;
}

// Parse "HH:MM AM/PM" to minutes since midnight for sorting
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 9999;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 9999;
  let [, h, m, period] = match;
  let hours = parseInt(h);
  const mins = parseInt(m);
  if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
  return hours * 60 + mins;
}

export const LogisticsManager: React.FC<LogisticsManagerProps> = ({
  weddingDate,
  itinerary,
  onDeleteItineraryItem,
  userId,
  refreshData
}) => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(weddingDate || today);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);

  const [newItem, setNewItem] = useState({
    activity: '',
    location: '',
    time_text: '09:00 AM',
    event_date: selectedDate,
  });

  // Group all itinerary items by date
  const itemsByDate = useMemo(() => {
    const map: Record<string, ItineraryItem[]> = {};
    itinerary.forEach(item => {
      const date = item.event_date || weddingDate || today;
      if (!map[date]) map[date] = [];
      map[date].push(item);
    });
    Object.keys(map).forEach(date => {
      map[date].sort((a, b) => parseTimeToMinutes(a.time_text) - parseTimeToMinutes(b.time_text));
    });
    return map;
  }, [itinerary, weddingDate]);

  // Unique sorted dates that have events
  const allDates = useMemo(() => Object.keys(itemsByDate).sort(), [itemsByDate]);

  const itemsForDate = itemsByDate[selectedDate] || [];

  const handleAddItem = async () => {
    if (!newItem.activity) {
      toast.error('Please enter an activity name');
      return;
    }
    if (!newItem.time_text) {
      toast.error('Please enter a start time');
      return;
    }

    const { error } = await supabase
      .from('itinerary_items')
      .insert([{
        title: newItem.activity,
        activity: newItem.activity,
        location: newItem.location,
        time_text: newItem.time_text,
        event_date: selectedDate,
        couple_id: userId,
      }]);

    if (error) {
      toast.error('Failed to add: ' + error.message);
    } else {
      toast.success('Activity added');
      setIsAddDialogOpen(false);
      setNewItem({ activity: '', location: '', time_text: '09:00 AM', event_date: selectedDate });
      refreshData();
    }
  };

  const handleEditItem = async () => {
    if (!editingItem || !editingItem.activity) {
      toast.error('Please enter an activity name');
      return;
    }
    const { error } = await supabase
      .from('itinerary_items')
      .update({
        title: editingItem.activity,
        activity: editingItem.activity,
        location: editingItem.location,
        time_text: editingItem.time_text,
        event_date: editingItem.event_date,
      })
      .eq('id', editingItem.id);

    if (error) {
      toast.error('Failed to update: ' + error.message);
    } else {
      toast.success('Activity updated');
      setEditingItem(null);
      setIsEditDialogOpen(false);
      refreshData();
    }
  };

  // Format "09:00 AM" nicely, or ensure it's showing correctly
  const formatTime = (t: string) => t || '–';

  const formatDateLabel = (dateStr: string) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Wedding Day Itinerary</h2>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">Plan your schedule across all wedding days.</p>
        </div>
        <Button
          onClick={() => {
            setNewItem({ activity: '', location: '', time_text: '09:00 AM', event_date: selectedDate });
            setIsAddDialogOpen(true);
          }}
          className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Activity
        </Button>
      </div>

      {/* Date selector */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedDate(today)}
          className={`shrink-0 rounded-2xl border px-4 py-2 text-sm font-semibold transition-all ${
            selectedDate === today
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white'
              : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
          }`}
        >
          Today
        </button>
        {weddingDate && (
          <button
            onClick={() => setSelectedDate(weddingDate)}
            className={`shrink-0 rounded-2xl border px-4 py-2 text-sm font-semibold transition-all ${
              selectedDate === weddingDate
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white'
                : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
            }`}
          >
            Wedding Day
          </button>
        )}
        {allDates.filter(d => d !== today && d !== weddingDate).map(d => (
          <button
            key={d}
            onClick={() => setSelectedDate(d)}
            className={`shrink-0 rounded-2xl border px-4 py-2 text-sm font-semibold transition-all ${
              selectedDate === d
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white'
                : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
            }`}
          >
            {new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </button>
        ))}
        {/* Custom date picker */}
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="ml-auto shrink-0 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      {/* Date heading */}
      <div className="rounded-3xl bg-zinc-900 dark:bg-zinc-950 border dark:border-zinc-800 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800">
            <Clock className="h-6 w-6 text-zinc-400" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-400">Schedule for</p>
            <h3 className="text-xl font-bold">{formatDateLabel(selectedDate)}</h3>
          </div>
          <div className="ml-auto">
            <Badge className="rounded-full bg-zinc-700 text-zinc-300 text-xs">
              {itemsForDate.length} {itemsForDate.length === 1 ? 'event' : 'events'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {itemsForDate.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <Clock className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
          <p className="text-sm text-zinc-400 dark:text-zinc-500">No activities planned for this day</p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => {
              setNewItem({ activity: '', location: '', time_text: '09:00 AM', event_date: selectedDate });
              setIsAddDialogOpen(true);
            }}
          >
            Add First Activity
          </Button>
        </div>
      ) : (
        <div className="relative space-y-3 pl-4">
          {/* Vertical timeline line */}
          <div className="absolute left-[1.85rem] top-3 bottom-3 w-0.5 bg-zinc-100 dark:bg-zinc-800" />

          {itemsForDate.map((item, idx) => (
            <div key={item.id} className="group relative flex items-start gap-6">
              {/* Time dot */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[9px] font-bold shadow-md">
                  {idx + 1}
                </div>
              </div>

              {/* Card */}
              <div className="flex-1 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm transition-all hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-md dark:shadow-none">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {/* TIME — prominent */}
                     <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">{formatTime(item.time_text)}</span>
                    </div>
                    <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{item.activity}</h4>
                    {item.location && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">{item.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                      onClick={() => {
                        setEditingItem(item);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600"
                      onClick={() => onDeleteItineraryItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="rounded-3xl dark:bg-zinc-900 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-2xl dark:text-white">Add Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="dark:text-zinc-300">Activity Name *</Label>
              <Input
                placeholder="e.g. Ceremony starts"
                value={newItem.activity}
                onChange={e => setNewItem({ ...newItem, activity: e.target.value })}
                className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="dark:text-zinc-300">Start Time *</Label>
                <Input
                  placeholder="e.g. 10:30 AM"
                  value={newItem.time_text}
                  onChange={e => setNewItem({ ...newItem, time_text: e.target.value })}
                  className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-zinc-300">Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="dark:text-zinc-300">Location (optional)</Label>
              <Input
                placeholder="e.g. Main Hall"
                value={newItem.location}
                onChange={e => setNewItem({ ...newItem, location: e.target.value })}
                className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl dark:border-zinc-800 dark:text-white">Cancel</Button>
            <Button onClick={handleAddItem} className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100">Add Activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={open => { setIsEditDialogOpen(open); if (!open) setEditingItem(null); }}>
        <DialogContent className="rounded-3xl dark:bg-zinc-900 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-2xl dark:text-white">Edit Activity</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="dark:text-zinc-300">Activity Name *</Label>
                <Input
                  value={editingItem.activity}
                  onChange={e => setEditingItem({ ...editingItem, activity: e.target.value })}
                  className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="dark:text-zinc-300">Start Time *</Label>
                  <Input
                    placeholder="e.g. 10:30 AM"
                    value={editingItem.time_text}
                    onChange={e => setEditingItem({ ...editingItem, time_text: e.target.value })}
                    className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-zinc-300">Date</Label>
                  <Input
                    type="date"
                    value={editingItem.event_date || ''}
                    onChange={e => setEditingItem({ ...editingItem, event_date: e.target.value })}
                    className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="dark:text-zinc-300">Location (optional)</Label>
                <Input
                  value={editingItem.location}
                  onChange={e => setEditingItem({ ...editingItem, location: e.target.value })}
                  className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingItem(null); }} className="rounded-xl dark:border-zinc-800 dark:text-white">Cancel</Button>
            <Button onClick={handleEditItem} className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
