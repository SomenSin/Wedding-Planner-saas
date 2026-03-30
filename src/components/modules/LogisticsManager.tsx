import React, { useState, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Calendar, 
  Clock, 
  Plus, 
  MoreVertical, 
  GripVertical, 
  CheckCircle2, 
  Circle,
  ArrowRight,
  LayoutGrid,
  List,
  Trash2
} from 'lucide-react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow, addMonths, subMonths } from 'date-fns';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
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

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  due_date: string;
  category: string;
}

interface ItineraryItem {
  id: string;
  start_time: string;
  duration: string;
  activity: string;
  location: string;
}

interface LogisticsManagerProps {
  weddingDate: string;
  tasks: Task[];
  itinerary: ItineraryItem[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onUpdateItinerary: (items: ItineraryItem[]) => void;
  onDeleteTask: (id: string) => void;
  onDeleteItineraryItem: (id: string) => void;
  userId: string;
  refreshData: () => void;
}

const SortableItineraryItem = ({ item, onDelete }: { item: ItineraryItem, onDelete: (id: string) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="group flex items-center gap-4 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm transition-all hover:border-zinc-200 hover:shadow-md"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-zinc-300 hover:text-zinc-500">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex w-24 flex-col">
        <span className="text-sm font-bold text-zinc-900">{item.start_time}</span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-400">{item.duration}</span>
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-zinc-900">{item.activity}</h4>
        <p className="text-xs text-zinc-400">{item.location}</p>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 hover:text-red-600"
        onClick={() => onDelete(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const LogisticsManager: React.FC<LogisticsManagerProps> = ({
  weddingDate,
  tasks,
  itinerary,
  onUpdateTask,
  onUpdateItinerary,
  onDeleteTask,
  onDeleteItineraryItem,
  userId,
  refreshData
}) => {
  const [view, setView] = useState<'timeline' | 'itinerary'>('timeline');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isItineraryDialogOpen, setIsItineraryDialogOpen] = useState(false);
  
  const [newTask, setNewTask] = useState({
    title: '',
    status: 'todo' as const,
    due_date: new Date().toISOString().split('T')[0],
    category: 'General'
  });

  const [newItineraryItem, setNewItineraryItem] = useState({
    start_time: '12:00 PM',
    duration: '1 hour',
    activity: '',
    location: ''
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = itinerary.findIndex((item) => item.id === active.id);
      const newIndex = itinerary.findIndex((item) => item.id === over.id);
      onUpdateItinerary(arrayMove(itinerary, oldIndex, newIndex));
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title) {
      toast.error('Please enter a task title');
      return;
    }

    const { error } = await supabase
      .from('logistics_tasks')
      .insert([{
        ...newTask,
        user_id: userId
      }]);

    if (error) {
      toast.error('Failed to add task');
    } else {
      toast.success('Task added');
      setIsTaskDialogOpen(false);
      setNewTask({ title: '', status: 'todo', due_date: new Date().toISOString().split('T')[0], category: 'General' });
      refreshData();
    }
  };

  const handleAddItineraryItem = async () => {
    if (!newItineraryItem.activity) {
      toast.error('Please enter an activity');
      return;
    }

    const { error } = await supabase
      .from('itinerary_items')
      .insert([{
        ...newItineraryItem,
        user_id: userId,
        order_index: itinerary.length
      }]);

    if (error) {
      toast.error('Failed to add activity');
    } else {
      toast.success('Activity added');
      setIsItineraryDialogOpen(false);
      setNewItineraryItem({ start_time: '12:00 PM', duration: '1 hour', activity: '', location: '' });
      refreshData();
    }
  };

  const columns = [
    { id: 'todo', title: 'To-Do', icon: <Circle className="h-4 w-4 text-zinc-300" /> },
    { id: 'in-progress', title: 'In Progress', icon: <Clock className="h-4 w-4 text-zinc-500" /> },
    { id: 'done', title: 'Done', icon: <CheckCircle2 className="h-4 w-4 text-zinc-900" /> },
  ];

  return (
    <div className="space-y-8">
      {/* View Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-2xl bg-zinc-100 p-1">
          <Button 
            variant={view === 'timeline' ? 'default' : 'ghost'} 
            size="sm" 
            className={`rounded-xl px-4 ${view === 'timeline' ? 'bg-white text-zinc-900 shadow-sm hover:bg-white' : 'text-zinc-500'}`}
            onClick={() => setView('timeline')}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            13-Month Timeline
          </Button>
          <Button 
            variant={view === 'itinerary' ? 'default' : 'ghost'} 
            size="sm" 
            className={`rounded-xl px-4 ${view === 'itinerary' ? 'bg-white text-zinc-900 shadow-sm hover:bg-white' : 'text-zinc-500'}`}
            onClick={() => setView('itinerary')}
          >
            <List className="mr-2 h-4 w-4" />
            Day-of Schedule
          </Button>
        </div>
        
        {view === 'timeline' ? (
          <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
            <DialogTrigger render={<Button size="sm" className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>} />
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-serif italic text-2xl">Add Logistics Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Task Title</Label>
                  <Input 
                    placeholder="e.g. Finalize seating chart" 
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input 
                      placeholder="e.g. Planning" 
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input 
                      type="date" 
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)} className="rounded-xl">Cancel</Button>
                <Button onClick={handleAddTask} className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">Add Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog open={isItineraryDialogOpen} onOpenChange={setIsItineraryDialogOpen}>
            <DialogTrigger render={<Button size="sm" className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">
              <Plus className="mr-2 h-4 w-4" />
              Add Activity
            </Button>} />
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-serif italic text-2xl">Add Itinerary Activity</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Activity</Label>
                  <Input 
                    placeholder="e.g. Ceremony starts" 
                    value={newItineraryItem.activity}
                    onChange={(e) => setNewItineraryItem({ ...newItineraryItem, activity: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input 
                    placeholder="e.g. Main Chapel" 
                    value={newItineraryItem.location}
                    onChange={(e) => setNewItineraryItem({ ...newItineraryItem, location: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input 
                      placeholder="e.g. 4:00 PM" 
                      value={newItineraryItem.start_time}
                      onChange={(e) => setNewItineraryItem({ ...newItineraryItem, start_time: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input 
                      placeholder="e.g. 30 mins" 
                      value={newItineraryItem.duration}
                      onChange={(e) => setNewItineraryItem({ ...newItineraryItem, duration: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsItineraryDialogOpen(false)} className="rounded-xl">Cancel</Button>
                <Button onClick={handleAddItineraryItem} className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">Add Activity</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {view === 'timeline' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {columns.map((col) => (
            <div key={col.id} className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  {col.icon}
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">{col.title}</h3>
                </div>
                <Badge variant="secondary" className="rounded-full bg-zinc-100 text-[10px] text-zinc-500">
                  {tasks.filter(t => t.status === col.id).length}
                </Badge>
              </div>
              
              <div className="flex flex-col gap-3">
                {tasks.filter(t => t.status === col.id).map((task) => (
                  <Card key={task.id} className="group rounded-2xl border-none bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <Badge variant="outline" className="rounded-full border-zinc-100 text-[10px] text-zinc-400 font-normal uppercase">
                          {task.category}
                        </Badge>
                        <div className="flex gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100">
                              <MoreVertical className="h-3 w-3" />
                            </Button>} />
                            <DropdownMenuContent align="end" className="rounded-xl">
                              <DropdownMenuItem onClick={() => onUpdateTask(task.id, { status: 'todo' })}>Move to To-Do</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onUpdateTask(task.id, { status: 'in-progress' })}>Move to In Progress</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onUpdateTask(task.id, { status: 'done' })}>Move to Done</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => onDeleteTask(task.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <h4 className="text-sm font-semibold text-zinc-900">{task.title}</h4>
                      <div className="flex items-center justify-between border-t border-zinc-50 pt-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                          <Calendar className="h-3 w-3" />
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                        </div>
                        {task.due_date && (
                          <span className="text-[10px] font-medium text-zinc-400">
                            {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                {tasks.filter(t => t.status === col.id).length === 0 && (
                  <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-zinc-200 text-xs text-zinc-400 italic">
                    No tasks here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center justify-between rounded-3xl bg-zinc-900 p-8 text-white shadow-xl">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">The Big Day</h2>
              <p className="mt-1 text-sm text-zinc-400">Chronological itinerary for your wedding day.</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800">
              <Clock className="h-8 w-8 text-zinc-400" />
            </div>
          </div>

          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={itinerary.map(i => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {itinerary.map((item) => (
                  <SortableItineraryItem key={item.id} item={item} onDelete={onDeleteItineraryItem} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          
          {itinerary.length === 0 && (
            <div className="flex h-48 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/50">
              <Clock className="h-8 w-8 text-zinc-300" />
              <p className="text-sm text-zinc-400">Start building your day-of schedule</p>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setIsItineraryDialogOpen(true)}>
                Add First Activity
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
