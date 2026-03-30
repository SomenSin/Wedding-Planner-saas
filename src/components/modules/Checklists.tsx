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
  Camera, 
  Flower2, 
  FileText, 
  CheckCircle2, 
  Plus, 
  MoreVertical,
  Search,
  Filter,
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
          className="text-zinc-100"
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
          className="text-zinc-900 transition-all duration-500"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-zinc-900">{Math.round(progress)}%</span>
    </div>
  );
};

export const Checklists: React.FC<ChecklistsProps> = ({
  categories,
  onToggleItem,
  userId,
  refreshData
}) => {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddCategory = async () => {
    if (!newCategoryTitle) {
      toast.error('Please enter a category title');
      return;
    }

    const { error } = await supabase
      .from('checklist_categories')
      .insert([{ title: newCategoryTitle, user_id: userId }]);

    if (error) {
      toast.error('Failed to add category');
    } else {
      toast.success('Category added');
      setIsCategoryDialogOpen(false);
      setNewCategoryTitle('');
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
        completed: false
      }]);

    if (error) {
      toast.error('Failed to add task');
    } else {
      toast.success('Task added');
      setIsTaskDialogOpen(false);
      setNewTaskTitle('');
      refreshData();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('checklist_categories')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete category');
    } else {
      toast.success('Category deleted');
      refreshData();
    }
  };

  const handleDeleteTask = async (id: string) => {
    const { error } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete task');
    } else {
      toast.success('Task deleted');
      refreshData();
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Master Checklists</h2>
          <p className="mt-2 text-zinc-500">Every detail, perfectly organized.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger render={<Button size="sm" className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>} />
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-serif italic text-2xl">Create New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Category Title</Label>
                  <Input 
                    placeholder="e.g. Photography, Floral, Legal" 
                    value={newCategoryTitle}
                    onChange={(e) => setNewCategoryTitle(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)} className="rounded-xl">Cancel</Button>
                <Button onClick={handleAddCategory} className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">Create Category</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Accordion className="space-y-4">
        {categories.map((category) => {
          const completedCount = category.items.filter(i => i.completed).length;
          const progress = category.items.length > 0 ? (completedCount / category.items.length) * 100 : 0;

          return (
            <AccordionItem 
              key={category.id} 
              value={category.id} 
              className="overflow-hidden rounded-3xl border-none bg-white shadow-sm"
            >
              <AccordionTrigger className="px-6 py-6 hover:no-underline">
                <div className="flex w-full items-center justify-between pr-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-600">
                      {category.icon || <Layout className="h-6 w-6" />}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-zinc-900">{category.title}</h3>
                      <p className="text-xs text-zinc-400 uppercase tracking-widest">
                        {completedCount} of {category.items.length} Tasks Complete
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <ProgressRing progress={progress} />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <div className="space-y-1">
                  {category.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="group flex items-center justify-between rounded-2xl p-3 transition-colors hover:bg-zinc-50"
                    >
                      <div className="flex items-center gap-4">
                        <Checkbox 
                          checked={item.completed} 
                          onCheckedChange={(checked) => onToggleItem(category.id, item.id, !!checked)}
                          className="h-5 w-5 rounded-md border-zinc-200 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900"
                        />
                        <span className={`text-sm ${item.completed ? 'text-zinc-400 line-through' : 'text-zinc-700 font-medium'}`}>
                          {item.title}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDeleteTask(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Dialog open={isTaskDialogOpen && selectedCategoryId === category.id} onOpenChange={(open) => {
                    setIsTaskDialogOpen(open);
                    if (!open) setSelectedCategoryId(null);
                  }}>
                    <DialogTrigger render={<Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 w-full justify-start rounded-xl text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
                      onClick={() => setSelectedCategoryId(category.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Task to {category.title}
                    </Button>} />
                    <DialogContent className="rounded-3xl">
                      <DialogHeader>
                        <DialogTitle className="font-serif italic text-2xl">Add Task to {category.title}</DialogTitle>
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
                        <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleAddTask} className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">Add Task</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};
