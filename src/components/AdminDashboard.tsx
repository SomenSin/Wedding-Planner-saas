import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Key, 
  Layout, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Shield, 
  ShieldOff, 
  UserPlus, 
  UserMinus,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ChevronRight,
  GripVertical,
  Settings,
  Eye,
  ExternalLink,
  Loader2,
  Search,
  Filter,
  RefreshCcw,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// DND Kit
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Types ---

interface Profile {
  id: string;
  email: string;
  wedding_name: string | null;
  role: 'super_admin' | 'couple';
  is_blocked: boolean;
  created_at: string;
}

interface AccessCode {
  id: string;
  code: string;
  linked_user_id: string | null;
  event_name: string | null;
  is_active: boolean;
  created_at: string;
}

interface DashboardModule {
  id: string;
  name: string;
  label: string;
  title: string;   // display convenience field (= label)
  enabled: boolean;
  order: number;
  widgets: DashboardWidget[];
}

interface DashboardWidget {
  id: string;
  type: 'metric' | 'table' | 'progress' | 'kanban' | 'toggle';
  title: string;
  config: any;
}

interface Feedback {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  status: 'new' | 'in-progress' | 'resolved';
  created_at: string;
  users?: {
    email: string;
  };
}

// --- Sub-components ---

const SortableModuleItem = ({ module, onToggle, onDelete, onEdit }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="group flex items-center gap-4 p-4 bg-white border border-stone-200 mb-2 hover:border-black transition-all">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-stone-400 hover:text-black">
        <GripVertical className="h-5 w-5" />
      </div>
      
      <div className="flex-1">
        <h4 className="text-sm font-bold uppercase tracking-wider">{module.title}</h4>
        <p className="text-[10px] text-stone-500 uppercase tracking-widest">{module.widgets?.length || 0} Widgets Active</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
            {module.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <Switch 
            checked={module.enabled} 
            onCheckedChange={(checked) => onToggle(module.id, checked)}
          />
        </div>
        
        <Button variant="ghost" size="icon" onClick={() => onEdit(module)}>
          <Settings className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onDelete(module.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// --- Main Component ---

export const AdminDashboard: React.FC<{ onModulesSaved?: () => void }> = ({ onModulesSaved }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [modulesDirty, setModulesDirty] = useState(false);
  const [isSavingModules, setIsSavingModules] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [modules, setModules] = useState<DashboardModule[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Sensors for DND
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [pRes, aRes, mRes, fRes] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('access_codes').select('*').order('created_at', { ascending: false }),
        supabase.from('dashboard_modules').select('*').order('order', { ascending: true }),
        supabase.from('user_feedback').select('*, users(email)').order('created_at', { ascending: false })
      ]);

      if (pRes.data) setProfiles(pRes.data as Profile[]);
      if (aRes.data) setAccessCodes(aRes.data as AccessCode[]);
      if (mRes.data) setModules(mRes.data.map((m: any) => ({ ...m, title: m.label || m.name, widgets: m.widgets || [] })) as DashboardModule[]);
      if (fRes.data) setFeedback(fRes.data as Feedback[]);
    } catch (err) {
      console.error('Admin fetch error:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // --- User Management Actions ---

  const toggleUserStatus = async (userId: string, isBlocked: boolean) => {
    const { error } = await supabase.from('users').update({ is_blocked: !isBlocked }).eq('id', userId);
    if (error) toast.error(error.message);
    else {
      setProfiles(profiles.map(p => p.id === userId ? { ...p, is_blocked: !isBlocked } : p));
      toast.success(`User ${!isBlocked ? 'blocked' : 'unblocked'}`);
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
    if (error) toast.error(error.message);
    else {
      setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole as any } : p));
      toast.success(`Role updated to ${newRole}`);
    }
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) toast.error(error.message);
    else {
      setProfiles(profiles.filter(p => p.id !== userId));
      toast.success('User deleted');
    }
  };

  // --- Access Code Actions ---

  const [isAddingCode, setIsAddingCode] = useState(false);
  const [newManualCode, setNewManualCode] = useState('');
  const [newEventName, setNewEventName] = useState('');

  const createManualCode = async () => {
    if (!newManualCode || !newEventName) {
      toast.error('Code and event name are required');
      return;
    }
    const { data, error } = await supabase.from('access_codes').insert([{
      code: newManualCode,
      event_name: newEventName,
      is_active: true
    }]).select();

    if (error) toast.error(error.message);
    else if (data) {
      setAccessCodes([data[0] as AccessCode, ...accessCodes]);
      setNewManualCode('');
      setNewEventName('');
      setIsAddingCode(false);
      toast.success(`Code created: ${newManualCode}`);
    }
  };

  const toggleCodeStatus = async (codeId: string, isActive: boolean) => {
    const { error } = await supabase.from('access_codes').update({ is_active: !isActive }).eq('id', codeId);
    if (error) toast.error(error.message);
    else {
      setAccessCodes(accessCodes.map(c => c.id === codeId ? { ...c, is_active: !isActive } : c));
      toast.success(`Code ${!isActive ? 'activated' : 'deactivated'}`);
    }
  };

  // --- Module Builder Actions ---

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over.id);
      const newModules: DashboardModule[] = arrayMove(modules, oldIndex, newIndex);
      // Only update local state — DB save happens on Save button
      setModules(newModules);
      setModulesDirty(true);
    }
  };

  const toggleModule = (id: string, enabled: boolean) => {
    // Only update local state — DB save happens on Save button
    setModules(modules.map(m => m.id === id ? { ...m, enabled } : m));
    setModulesDirty(true);
  };

  const saveAllModules = async () => {
    setIsSavingModules(true);
    const updates = modules.map((m, idx) => ({
      id: m.id,
      name: m.name,
      label: m.label,
      enabled: m.enabled,
      order: idx,
    }));
    const { error } = await supabase.from('dashboard_modules').upsert(updates);
    setIsSavingModules(false);
    if (error) {
      toast.error('Failed to save module changes');
    } else {
      setModulesDirty(false);
      toast.success('All module changes saved!');
      // Tell the parent (App.tsx) to re-fetch modules so the sidebar updates instantly
      onModulesSaved?.();
    }
  };

  // --- Feedback Actions ---

  const updateFeedbackStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('user_feedback').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      setFeedback(feedback.map(f => f.id === id ? { ...f, status: status as any } : f));
      toast.success('Status updated');
    }
  };

  const [editingModule, setEditingModule] = useState<DashboardModule | null>(null);

  const seedInitialModules = async () => {
    const initialModules = [
      { name: 'overview',   label: 'Dashboard Home',      enabled: true, order: 0 },
      { name: 'guests',     label: 'Guest CRM',           enabled: true, order: 1 },
      { name: 'budget',     label: 'Financial Hub',       enabled: true, order: 2 },
      { name: 'registry',   label: 'Registry & Gifts',    enabled: true, order: 3 },
      { name: 'logistics',  label: 'Logistics',           enabled: true, order: 4 },
      { name: 'vendors',    label: 'Vendor Management',   enabled: true, order: 5 },
      { name: 'drinks',     label: 'Drink Calculator',    enabled: true, order: 6 },
      { name: 'checklists', label: 'Master Checklists',   enabled: true, order: 7 },
      { name: 'support',    label: 'Feedback & Support',  enabled: true, order: 8 },
    ];

    const { data, error } = await supabase.from('dashboard_modules').insert(initialModules).select();
    if (error) toast.error(error.message);
    else if (data) {
      setModules(data.map((m: any) => ({ ...m, title: m.label || m.name, widgets: [] })) as DashboardModule[]);
      toast.success('All modules seeded successfully!');
    }
  };

  const saveModule = async (module: DashboardModule) => {
    // Only persist fields that exist in the DB schema
    const payload = {
      id: module.id,
      name: module.name || module.title,
      label: module.title,
      enabled: module.enabled,
      order: module.order
    };
    const { data, error } = await supabase.from('dashboard_modules').upsert(payload).select();
    if (error) toast.error(error.message);
    else if (data) {
      const saved: DashboardModule = { ...data[0], title: data[0].label || data[0].name, widgets: module.widgets || [] };
      setModules(prev => {
        const exists = prev.find(m => m.id === module.id);
        if (exists) return prev.map(m => m.id === module.id ? saved : m);
        return [...prev, saved];
      });
      setEditingModule(null);
      toast.success('Module saved');
    }
  };

  const addWidget = (moduleId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        const newWidget: DashboardWidget = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'metric',
          title: 'New Widget',
          config: { value: '0' }
        };
        return { ...m, widgets: [...m.widgets, newWidget] };
      }
      return m;
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto" />
          <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Initializing Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f7f5] text-[#0a0a0a] font-sans">
      {/* Sub-navigation for Admin */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-stone-200 pb-4">
        {[
          { id: 'users', label: 'Users', icon: Users },
          { id: 'codes', label: 'Access Codes', icon: Key },
          { id: 'modules', label: 'UI Builder', icon: Layout },
          { id: 'feedback', label: 'Feedback', icon: MessageSquare },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all border ${
              activeTab === item.id 
                ? 'bg-black text-white border-black' 
                : 'bg-white text-stone-400 border-stone-200 hover:text-black hover:border-black'
            }`}
          >
            <item.icon className="h-3 w-3" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-serif italic mb-2">
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'codes' && 'Access Control'}
              {activeTab === 'modules' && 'Dynamic UI Builder'}
              {activeTab === 'feedback' && 'Feedback Inbox'}
            </h1>
            <p className="text-stone-500 uppercase tracking-widest text-[10px] font-bold">
              {activeTab === 'users' && 'Monitor and manage platform access for all registered users'}
              {activeTab === 'codes' && 'Manage 6-digit guest access codes and wedding links'}
              {activeTab === 'modules' && 'Configure schema-driven dashboard modules and widgets'}
              {activeTab === 'feedback' && 'Review and resolve user-submitted feedback and bug reports'}
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input 
                placeholder="Search..." 
                className="pl-10 h-10 w-64 rounded-none border-stone-200 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-10 rounded-none border-stone-200 bg-white" onClick={fetchAllData}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* --- Tab Content --- */}

        <AnimatePresence mode="wait">
          {activeTab === 'users' && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <Card className="rounded-none border-stone-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200">
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500">User</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500">Role</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500">Status</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500">Joined</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {profiles.filter(p => p.email.toLowerCase().includes(searchQuery.toLowerCase())).map((profile) => (
                        <tr key={profile.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-bold text-xs">
                                {profile.email[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-bold">{profile.wedding_name || 'Anonymous User'}</div>
                                <div className="text-[10px] text-stone-400 font-mono">{profile.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={profile.role === 'super_admin' ? 'default' : 'secondary'} className="rounded-none uppercase text-[9px] tracking-widest">
                              {profile.role === 'super_admin' ? 'Admin' : 'Couple'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {!profile.is_blocked ? (
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-500" />
                              )}
                              <span className={`text-[10px] uppercase tracking-widest font-bold ${!profile.is_blocked ? 'text-green-600' : 'text-red-600'}`}>
                                {!profile.is_blocked ? 'Active' : 'Blocked'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[10px] font-mono text-stone-500">
                            {new Date(profile.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                                <MoreVertical className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-none w-48">
                                <DropdownMenuItem onClick={() => toggleUserStatus(profile.id, profile.is_blocked)}>
                                  {!profile.is_blocked ? <ShieldOff className="mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4" />}
                                  {!profile.is_blocked ? 'Block Access' : 'Unblock Access'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => changeUserRole(profile.id, profile.role === 'super_admin' ? 'couple' : 'super_admin')}>
                                  {profile.role === 'super_admin' ? <UserMinus className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                  {profile.role === 'super_admin' ? 'Make Couple' : 'Make Admin'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => deleteUser(profile.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'codes' && (
            <motion.div 
              key="codes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-end gap-3">
                <Dialog open={isAddingCode} onOpenChange={setIsAddingCode}>
                  <DialogTrigger render={<Button variant="outline" className="rounded-none bg-black text-white hover:bg-black/90">
                    <Plus className="mr-2 h-4 w-4" /> Create Custom Code
                  </Button>} />
                  <DialogContent className="rounded-none">
                    <DialogHeader>
                      <DialogTitle className="font-serif italic text-2xl">Create Access Code</DialogTitle>
                      <DialogDescription className="uppercase tracking-widest text-[10px] font-bold">
                        Manually define an access code for an upcoming event
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 flex flex-col gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Access Code</Label>
                        <Input 
                          value={newManualCode} 
                          onChange={(e) => setNewManualCode(e.target.value.toUpperCase())}
                          placeholder="e.g. SMITH2026"
                          className="rounded-none border-stone-200 uppercase"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Event Name</Label>
                        <Input 
                          value={newEventName} 
                          onChange={(e) => setNewEventName(e.target.value)}
                          placeholder="e.g. Sarah & John's Wedding"
                          className="rounded-none border-stone-200"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" className="rounded-none" onClick={() => setIsAddingCode(false)}>Cancel</Button>
                      <Button className="rounded-none bg-black hover:bg-black/90 px-8" onClick={createManualCode}>
                        Create Code
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="rounded-none border-stone-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200">
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500">Code</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500">Wedding / Link</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500">Status</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {accessCodes.map((code) => (
                      <tr key={code.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xl font-bold tracking-widest">{code.code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold">{code.event_name || 'Unlinked Code'}</div>
                          <div className="text-[10px] text-stone-400 font-mono italic">ID: {code.linked_user_id || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={code.is_active ? 'default' : 'outline'} className="rounded-none uppercase text-[9px] tracking-widest">
                            {code.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => toggleCodeStatus(code.id, code.is_active)}>
                              {code.is_active ? <XCircle className="h-4 w-4 text-stone-400" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={async () => {
                              const { error } = await supabase.from('access_codes').delete().eq('id', code.id);
                              if (!error) setAccessCodes(accessCodes.filter(c => c.id !== code.id));
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </motion.div>
          )}

          {activeTab === 'modules' && (
            <motion.div 
              key="modules"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  {modulesDirty && (
                    <span className="text-[10px] uppercase tracking-widest font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1">
                      Unsaved changes
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {modules.length === 0 && (
                    <Button variant="outline" className="rounded-none border-stone-200" onClick={seedInitialModules}>
                      Seed Initial Modules
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="rounded-none border-stone-200"
                    onClick={() => {
                      const newModule: DashboardModule = {
                        id: Math.random().toString(36).substr(2, 9),
                        name: 'new_module',
                        label: 'New Module',
                        title: 'New Module',
                        enabled: true,
                        order: modules.length,
                        widgets: []
                      };
                      setEditingModule(newModule);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create New Module
                  </Button>
                  <Button
                    className={`rounded-none px-6 ${
                      modulesDirty
                        ? 'bg-black hover:bg-black/90 text-white'
                        : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    }`}
                    disabled={!modulesDirty || isSavingModules}
                    onClick={saveAllModules}
                  >
                    {isSavingModules ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>

              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={modules.map(m => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {modules.map((module) => (
                      <SortableModuleItem 
                        key={module.id} 
                        module={module} 
                        onToggle={toggleModule}
                        onDelete={async (id) => {
                          const { error } = await supabase.from('dashboard_modules').delete().eq('id', id);
                          if (!error) setModules(modules.filter(m => m.id !== id));
                        }}
                        onEdit={(m) => setEditingModule(m)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Module Editor Dialog */}
              <Dialog open={!!editingModule} onOpenChange={(open) => !open && setEditingModule(null)}>
                <DialogContent className="max-w-2xl rounded-none">
                  <DialogHeader>
                    <DialogTitle className="font-serif italic text-2xl">
                      {editingModule?.id ? 'Edit Module' : 'Create Module'}
                    </DialogTitle>
                    <DialogDescription className="uppercase tracking-widest text-[10px] font-bold">
                      Configure widgets and layout for this dashboard section
                    </DialogDescription>
                  </DialogHeader>

                  {editingModule && (
                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Module Title</Label>
                        <Input 
                          value={editingModule.title} 
                          onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                          className="rounded-none border-stone-200"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Widgets</Label>
                          <Button variant="outline" size="sm" className="rounded-none text-[10px]" onClick={() => {
                            const newWidget: DashboardWidget = {
                              id: Math.random().toString(36).substr(2, 9),
                              type: 'metric',
                              title: 'New Widget',
                              config: { value: '0' }
                            };
                            setEditingModule({ ...editingModule, widgets: [...editingModule.widgets, newWidget] });
                          }}>
                            <Plus className="h-3 w-3 mr-1" /> Add Widget
                          </Button>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                          {editingModule.widgets.map((widget, idx) => (
                            <div key={widget.id} className="p-4 border border-stone-100 bg-stone-50/50 space-y-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-[9px] uppercase tracking-widest text-stone-400">Title</Label>
                                    <Input 
                                      value={widget.title}
                                      onChange={(e) => {
                                        const newWidgets = [...editingModule.widgets];
                                        newWidgets[idx].title = e.target.value;
                                        setEditingModule({ ...editingModule, widgets: newWidgets });
                                      }}
                                      className="h-8 text-xs rounded-none"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[9px] uppercase tracking-widest text-stone-400">Type</Label>
                                    <select 
                                      value={widget.type}
                                      onChange={(e) => {
                                        const newWidgets = [...editingModule.widgets];
                                        newWidgets[idx].type = e.target.value as any;
                                        setEditingModule({ ...editingModule, widgets: newWidgets });
                                      }}
                                      className="w-full h-8 text-xs border border-stone-200 bg-white rounded-none px-2"
                                    >
                                      <option value="metric">Metric Card</option>
                                      <option value="progress">Progress Ring</option>
                                      <option value="table">Data Table</option>
                                      <option value="kanban">Kanban Board</option>
                                      <option value="toggle">Toggle</option>
                                    </select>
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-red-400 hover:text-red-500"
                                  onClick={() => {
                                    const newWidgets = editingModule.widgets.filter((_, i) => i !== idx);
                                    setEditingModule({ ...editingModule, widgets: newWidgets });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <DialogFooter>
                    <Button variant="outline" className="rounded-none" onClick={() => setEditingModule(null)}>Cancel</Button>
                    <Button className="rounded-none bg-black hover:bg-black/90 px-8" onClick={() => editingModule && saveModule(editingModule)}>
                      Save Module
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {modules.length === 0 && (
                <div className="p-12 border-2 border-dashed border-stone-200 text-center text-stone-400 uppercase tracking-widest text-[10px] font-bold">
                  No dynamic modules configured
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'feedback' && (
            <motion.div 
              key="feedback"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {feedback.map((item) => (
                <Card key={item.id} className="rounded-none border-stone-200 shadow-sm flex flex-col group">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={`rounded-none uppercase text-[8px] tracking-widest ${
                        item.status === 'resolved' ? 'bg-green-500' : 
                        item.status === 'in-progress' ? 'bg-blue-500' : 'bg-stone-500'
                      }`}>
                        {item.status}
                      </Badge>
                      <span className="text-[9px] font-mono text-stone-400 shrink-0 text-right ml-2 whitespace-nowrap">
                        {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(item.created_at))}
                      </span>
                    </div>
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-stone-500">
                      {item.users?.email || 'Anonymous'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <p className="text-sm leading-relaxed text-stone-600 whitespace-pre-wrap">
                      {item.content}
                    </p>
                    
                    {item.image_url ? (
                      <div className="grid grid-cols-2 gap-2">
                        {item.image_url.split(',').map((rawUrl, idx) => {
                          const url = rawUrl.trim().startsWith('http') 
                            ? rawUrl.trim() 
                            : supabase.storage.from('feedback-images').getPublicUrl(rawUrl.trim()).data.publicUrl;
                          
                          return (
                            <Dialog key={idx}>
                              <DialogTrigger render={
                                <div className="relative aspect-video flex h-24 items-center justify-center bg-stone-100 border border-stone-200 cursor-zoom-in hover:border-black transition-all overflow-hidden group">
                                  <img 
                                    src={url} 
                                    alt={`Feedback attachment ${idx + 1}`} 
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    onError={(e: any) => {
                                      e.currentTarget.style.display = 'none';
                                      const fallback = document.createElement('div');
                                      fallback.className = 'flex flex-col items-center gap-1 p-2 text-center';
                                      fallback.innerHTML = `
                                        <span class="text-[8px] uppercase tracking-widest text-red-400 font-bold">Load Failed</span>
                                        <span class="text-[6px] text-stone-400 break-all select-all font-mono">${url.split('/').pop()}</span>
                                      `;
                                      e.currentTarget.parentElement.appendChild(fallback);
                                    }}
                                  />
                                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                    <Eye className="text-white h-6 w-6 mb-1" />
                                    <span className="text-[8px] text-white uppercase font-bold tracking-widest">Enlarge</span>
                                  </div>
                                </div>
                              } />
                              <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
                                <img 
                                  src={url} 
                                  alt={`Feedback attachment ${idx + 1} full`} 
                                  className="w-full h-auto"
                                />
                              </DialogContent>
                            </Dialog>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-100 italic text-[10px] text-stone-400 rounded-none">
                        <ImageIcon className="h-3 w-3" />
                        <span>No image attachments provided</span>
                      </div>
                    )}
                  </CardContent>
                  <div className="p-4 border-t border-stone-100 flex justify-between gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="flex-1 rounded-none text-[10px] uppercase tracking-widest font-bold" />}>
                        Update Status
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="rounded-none w-40">
                        <DropdownMenuItem onClick={() => updateFeedbackStatus(item.id, 'new')}>Mark as New</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateFeedbackStatus(item.id, 'in-progress')}>Mark as In Progress</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateFeedbackStatus(item.id, 'resolved')}>Mark as Resolved</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 rounded-none" onClick={async () => {
                      const { error } = await supabase.from('user_feedback').delete().eq('id', item.id);
                      if (!error) setFeedback(feedback.filter(f => f.id !== item.id));
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {feedback.length === 0 && (
                <div className="col-span-full p-24 border-2 border-dashed border-stone-200 text-center text-stone-400 uppercase tracking-widest text-[10px] font-bold">
                  Inbox is empty
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
