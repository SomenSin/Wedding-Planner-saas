import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '../ui/accordion';
import { 
  Trash2,
  Edit2,
  Plus,
  Layout,
  CheckSquare
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

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

interface ChecklistCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

interface ChecklistsProps {
  categories: ChecklistCategory[];
  onToggleItem: (categoryId: string, itemId: string, completed: boolean) => void;
  userId: string;
  refreshData: () => void;
  isLoading?: boolean;
}

const ProgressRing = ({ progress }: { progress: number }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <svg className="h-full w-full -rotate-90 transform">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-zinc-100 dark:text-zinc-800"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-zinc-900 dark:text-white transition-all duration-500"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-zinc-900 dark:text-white">{Math.round(progress)}%</span>
    </div>
  );
};

const DEFAULT_CHECKLISTS = [
  { title: "12 Months Before", items: ["Set wedding budget"] },
  { title: "11 Months Before", items: ["Research venues"] },
  { title: "10 Months Before", items: ["Finalize venue"] },
  { title: "9 Months Before", items: ["Hire photographer"] },
  { title: "8 Months Before", items: ["Send Save the Dates"] },
  { title: "7 Months Before", items: ["Book hotel blocks"] },
  { title: "6 Months Before", items: ["Select caterer"] },
  { title: "5 Months Before", items: ["Create gift registry"] },
  { title: "4 Months Before", items: ["Order invitations"] },
  { title: "3 Months Before", items: ["Mail invitations"] },
  { title: "2 Months Before", items: ["Purchase wedding bands"] },
  { title: "1 Month Before", items: ["Marriage license"] }
];

export const Checklists: React.FC<ChecklistsProps> = ({
  categories,
  onToggleItem,
  userId,
  refreshData,
  isLoading = false
}) => {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editTitle, setEditTitle] = useState('');
  
  const [isSeeding, setIsSeeding] = useState(false);
  const [hasAttemptedSeed, setHasAttemptedSeed] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const seedingRef = React.useRef(false);

  // Auto-seed if empty
  React.useEffect(() => {
    if (!isLoading && categories.length === 0 && userId && !seedingRef.current) {
      handleSeedDefaults();
    }
  }, [categories.length, userId, isLoading]);

  const handleAddCategory = async () => {
    if (!newCategoryTitle) {
      toast.error('Please enter a category title');
      return;
    }

    const { error } = await supabase
      .from('checklist_categories')
      .insert([{ title: newCategoryTitle, couple_id: userId }]);

    if (error) {
      console.error(error);
      toast.error(`Failed to add To Do Section: ${error.message}. (Did you run the SQL patch?)`);
    } else {
      toast.success('Section added');
      setIsCategoryDialogOpen(false);
      setNewCategoryTitle('');
      refreshData();
    }
  };

  const handleUpdateCategoryTitle = async () => {
    if (!editTitle || !selectedCategoryId) return;
    const { error } = await supabase
      .from('checklist_categories')
      .update({ title: editTitle })
      .eq('id', selectedCategoryId);

    if (error) {
      toast.error('Failed to update title');
    } else {
      toast.success('Title updated');
      setIsEditCategoryDialogOpen(false);
      refreshData();
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle || !selectedCategoryId) {
      toast.error('Please enter a task title');
      return;
    }

    const { error } = await supabase
      .from('checklist_items')
      .insert([{ 
        title: newTaskTitle, 
        category_id: selectedCategoryId,
        completed: false,
        couple_id: userId
      }]);

    if (error) {
      toast.error(`Failed to add task: ${error.message}`);
    } else {
      toast.success('Task added');
      setIsTaskDialogOpen(false);
      setNewTaskTitle('');
      refreshData();
    }
  };

  const handleUpdateTaskTitle = async () => {
    if (!editTitle || !selectedTaskId) return;
    const { error } = await supabase
      .from('checklist_items')
      .update({ title: editTitle })
      .eq('id', selectedTaskId);

    if (error) {
      toast.error('Failed to update task');
    } else {
      toast.success('Task updated');
      setIsEditTaskDialogOpen(false);
      refreshData();
    }
  };

  const handleSeedDefaults = async () => {
    if (seedingRef.current) return;
    seedingRef.current = true;
    setIsSeeding(true);
    
    try {
      // 1. Fetch current categories to check for existing titles (to avoid duplicates)
      const { data: existingCats, error: fetchErr } = await supabase
        .from('checklist_categories')
        .select('title')
        .eq('couple_id', userId);
        
      if (fetchErr) throw fetchErr;
      
      const existingTitles = new Set(existingCats?.map(c => c.title) || []);

      // 2. Iterate through defaults and only add if title doesn't exist
      for (const group of DEFAULT_CHECKLISTS) {
        if (existingTitles.has(group.title)) {
          console.log(`Skipping duplicate section: ${group.title}`);
          continue;
        }

        // Create the section
        const { data: cat, error: catErr } = await supabase
          .from('checklist_categories')
          .insert([{ title: group.title, couple_id: userId }])
          .select()
          .single();
          
        if (catErr) {
          // If we hit a race condition where another call inserted this title
          if (catErr.code === '23505') { // Unique constraint violation (if exists)
             continue;
          }
          throw catErr;
        }
        
        // Insert associated tasks
        if (cat) {
          const itemsToInsert = group.items.map(itemTitle => ({
            title: itemTitle,
            category_id: cat.id,
            couple_id: userId,
            completed: false
          }));
          
          const { error: itemErr } = await supabase
            .from('checklist_items')
            .insert(itemsToInsert);
            
          if (itemErr) throw itemErr;
        }
      }
      
      // Only show success if we actually added something
      const { data: finalCats } = await supabase
        .from('checklist_categories')
        .select('id')
        .eq('couple_id', userId);
        
      if (finalCats && finalCats.length > 0) {
        toast.success('Default wedding roadmap synchronized!');
        refreshData();
      }
    } catch (error: any) {
      console.error('Seeding error:', error);
      toast.error('Failed to sync roadmap: ' + error.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    // Optimistic UI hiding
    setHiddenIds(prev => new Set(prev).add(id));
    
    const { error } = await supabase
      .from('checklist_categories')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete section');
      setHiddenIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      toast.success('Section deleted');
      refreshData();
    }
  };

  const handleDeleteTask = async (id: string) => {
    setHiddenIds(prev => new Set(prev).add(id));
    const { error } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete task');
      setHiddenIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      toast.success('Task deleted');
      refreshData();
    }
  };

  // Overall progress calculation
  const allItems = categories
    .filter(cat => !hiddenIds.has(cat.id))
    .flatMap(cat => (cat.items || []).filter(i => !hiddenIds.has(i.id)));
  const overallCompleted = allItems.filter(i => i.completed).length;
  const overallTotal = allItems.length;
  const overallPercent = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-32">
      {/* Overall Progress Header Card */}
      <Card className="rounded-[40px] bg-zinc-900 dark:bg-zinc-950 text-white border-none overflow-hidden relative group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-800 via-transparent to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />
        <CardHeader className="relative z-10 pb-2 p-8">
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare className="h-4 w-4 text-zinc-400" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">Our Progress Roadmap</span>
          </div>
          <CardTitle className="text-4xl font-serif italic mb-2 tracking-tight">Your Wedding Journey</CardTitle>
          <CardDescription className="text-zinc-400 max-w-md text-xs leading-relaxed">
            Every detail handled, every moment planned. Watch your dream wedding come to life as you check off each milestone.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 pt-4 p-8">
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-7xl font-light tracking-tighter sm:text-8xl">{overallPercent}%</span>
            <span className="text-sm text-zinc-500 uppercase tracking-[0.3em] font-bold">Complete</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-1000 ease-out" 
              style={{ width: `${overallPercent}%` }} 
            />
          </div>
          <div className="mt-8 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
              {overallCompleted} of {overallTotal} tasks secured
            </p>
            <div className="h-px flex-1 mx-8 bg-zinc-800" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold italic">
              {overallPercent === 100 ? "Ready to say 'I Do'!" : "Making Magic Happen"}
            </span>
          </div>
        </CardContent>
        {/* Decorative background element */}
        <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-white/5 blur-3xl opacity-20" />
      </Card>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between pt-4">
        <div>
          <h2 className="text-2xl font-serif italic text-zinc-900 dark:text-white">Personalized Checklist</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Every detail, perfectly organized.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger render={<Button size="sm" className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100">
              <Plus className="mr-2 h-4 w-4" />
              New To Do
            </Button>} />
            <DialogContent className="rounded-3xl dark:bg-zinc-900 dark:border-zinc-800">
              <DialogHeader>
                <DialogTitle className="font-serif italic text-2xl dark:text-white">Create New To Do List</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="dark:text-zinc-300">Section Title</Label>
                  <Input 
                    placeholder="e.g. 12 Months, Venue, Floral" 
                    value={newCategoryTitle}
                    onChange={(e) => setNewCategoryTitle(e.target.value)}
                    className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)} className="rounded-xl dark:border-zinc-800 dark:text-white">Cancel</Button>
                <Button onClick={handleAddCategory} className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100">Create Section</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Section Title Dialog */}
          <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
            <DialogContent className="rounded-3xl dark:bg-zinc-900 dark:border-zinc-800">
              <DialogHeader>
                <DialogTitle className="font-serif italic text-2xl dark:text-white">Rename Section</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="dark:text-zinc-300">New Section Title</Label>
                  <Input 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditCategoryDialogOpen(false)} className="rounded-xl dark:border-zinc-800 dark:text-white">Cancel</Button>
                <Button onClick={handleUpdateCategoryTitle} className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100">Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Task Title Dialog */}
          <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
            <DialogContent className="rounded-3xl dark:bg-zinc-900 dark:border-zinc-800">
              <DialogHeader>
                <DialogTitle className="font-serif italic text-2xl dark:text-white">Edit To Do</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="dark:text-zinc-300">To Do Title</Label>
                  <Input 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="rounded-xl dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditTaskDialogOpen(false)} className="rounded-xl dark:border-zinc-800 dark:text-white">Cancel</Button>
                <Button onClick={handleUpdateTaskTitle} className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100">Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {categories.length === 0 ? (
        <Card className="rounded-3xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 py-12 text-center">
          <CheckSquare className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
          <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">Setting up your Roadmap...</h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-zinc-400">
            One moment while we prepare your default wedding milestones.
          </p>
        </Card>
      ) : (
        <Accordion className="space-y-4">
          {categories.filter(c => !hiddenIds.has(c.id)).map((category) => {
            const completedCount = category.items.filter(i => i.completed).length;
            const progress = category.items.length > 0 ? (completedCount / category.items.length) * 100 : 0;

            return (
              <AccordionItem 
                key={category.id} 
                value={category.id} 
                className="overflow-hidden rounded-3xl border-none bg-white dark:bg-zinc-900 shadow-sm"
              >
                <AccordionTrigger className="px-6 py-6 hover:no-underline">
                  <div className="flex w-full items-center justify-between pr-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {category.icon || <Layout className="h-6 w-6" />}
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{category.title}</h3>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                          {completedCount} of {category.items.length} Tasks Complete
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <ProgressRing progress={progress} />
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategoryId(category.id);
                            setEditTitle(category.title);
                            setIsEditCategoryDialogOpen(true);
                          }}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="space-y-1">
                    {category.items.filter(i => !hiddenIds.has(i.id)).map((item) => (
                      <div 
                        key={item.id} 
                        className="group flex items-center justify-between rounded-2xl p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                        onClick={() => onToggleItem(category.id, item.id, !item.completed)}
                      >
                        <div className="flex items-center gap-4">
                          <Checkbox 
                            checked={item.completed} 
                            onCheckedChange={(checked) => onToggleItem(category.id, item.id, !!checked)}
                            className="h-5 w-5 rounded-md border-zinc-200 dark:border-zinc-700 data-[state=checked]:bg-zinc-900 dark:data-[state=checked]:bg-white data-[state=checked]:border-zinc-900 dark:data-[state=checked]:border-white"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className={`text-sm select-none transition-all ${item.completed ? 'text-zinc-400 dark:text-zinc-600 line-through' : 'text-zinc-700 dark:text-zinc-300 font-medium'}`}>
                            {item.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTaskId(item.id);
                              setEditTitle(item.title);
                              setIsEditTaskDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(item.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Dialog open={isTaskDialogOpen && selectedCategoryId === category.id} onOpenChange={(open) => {
                      setIsTaskDialogOpen(open);
                      if (!open) setSelectedCategoryId(null);
                    }}>
                      <DialogTrigger render={<Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 w-full justify-start rounded-xl text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white"
                        onClick={() => setSelectedCategoryId(category.id)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Task to {category.title}
                      </Button>} />
                      <DialogContent className="rounded-3xl dark:bg-zinc-900 dark:border-zinc-800">
                        <DialogHeader>
                          <DialogTitle className="font-serif italic text-2xl dark:text-white">Add Task to {category.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Task Title</Label>
                            <Input 
                              placeholder="e.g. Book the photographer" 
                              value={newTaskTitle}
                              onChange={(e) => setNewTaskTitle(e.target.value)}
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)} className="rounded-xl dark:border-zinc-800 dark:text-white">Cancel</Button>
                          <Button onClick={handleAddTask} className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100">Add Task</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};
