import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Key, 
  Layout, 
  MessageSquare, 
  RefreshCcw, 
  Search, 
  Loader2 
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { arrayMove } from '@dnd-kit/sortable';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { UserManagement } from '@/features/admin/components/UserManagement';
import { AccessControl } from '@/features/admin/components/AccessControl';
import { UIBuilder } from '@/features/admin/components/UIBuilder';
import { FeedbackInbox } from '@/features/admin/components/FeedbackInbox';
import { Profile, AccessCode, DashboardModule, Feedback } from '@/types/admin';

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

  // User Actions
  const toggleUserStatus = async (userId: string, isBlocked: boolean) => {
    const { error } = await supabase.from('users').update({ is_blocked: !isBlocked }).eq('id', userId);
    if (!error) {
      setProfiles(profiles.map(p => p.id === userId ? { ...p, is_blocked: !isBlocked } : p));
      toast.success(`User ${!isBlocked ? 'blocked' : 'unblocked'}`);
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
    if (!error) {
      setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole as any } : p));
      toast.success('Role updated');
    }
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (!error) {
      setProfiles(profiles.filter(p => p.id !== userId));
      toast.success('User deleted');
    }
  };

  // Access Code Actions
  const createManualCode = async (code: string, eventName: string) => {
    const { data, error } = await supabase.from('access_codes').insert([{ code, event_name: eventName, is_active: true }]).select();
    if (!error && data) {
      setAccessCodes([data[0] as AccessCode, ...accessCodes]);
      toast.success('Code created');
    }
  };

  const toggleCodeStatus = async (codeId: string, isActive: boolean) => {
    const { error } = await supabase.from('access_codes').update({ is_active: !isActive }).eq('id', codeId);
    if (!error) {
      setAccessCodes(accessCodes.map(c => c.id === codeId ? { ...c, is_active: !isActive } : c));
      toast.success('Status updated');
    }
  };

  const deleteCode = async (id: string) => {
    const { error } = await supabase.from('access_codes').delete().eq('id', id);
    if (!error) {
      setAccessCodes(accessCodes.filter(c => c.id !== id));
      toast.success('Code deleted');
    }
  };

  // UI Builder Actions
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over.id);
      setModules(arrayMove(modules, oldIndex, newIndex));
      setModulesDirty(true);
    }
  };

  const saveAllModules = async () => {
    setIsSavingModules(true);
    const updates = modules.map((m, idx) => ({ id: m.id, name: m.name, label: m.label, enabled: m.enabled, order: idx }));
    const { error } = await supabase.from('dashboard_modules').upsert(updates);
    setIsSavingModules(false);
    if (!error) {
      setModulesDirty(false);
      toast.success('All changes saved!');
      onModulesSaved?.();
    }
  };

  const seedInitialModules = async () => {
    const initialModules = [
      { name: 'overview', label: 'Dashboard Home', enabled: true, order: 0 },
      { name: 'guests', label: 'Guest CRM', enabled: true, order: 1 },
      { name: 'budget', label: 'Financial Hub', enabled: true, order: 2 },
      { name: 'registry', label: 'Registry & Gifts', enabled: true, order: 3 },
      { name: 'logistics', label: 'Logistics', enabled: true, order: 4 },
      { name: 'vendors', label: 'Vendor Management', enabled: true, order: 5 },
      { name: 'drinks', label: 'Drink Calculator', enabled: true, order: 6 },
      { name: 'checklists', label: 'Master Checklists', enabled: true, order: 7 },
      { name: 'support', label: 'Feedback & Support', enabled: true, order: 8 },
    ];
    const { data, error } = await supabase.from('dashboard_modules').insert(initialModules).select();
    if (!error && data) {
      setModules(data.map((m: any) => ({ ...m, title: m.label || m.name, widgets: [] })) as DashboardModule[]);
      toast.success('Modules seeded');
    }
  };

  const saveModule = async (module: DashboardModule) => {
    const payload = { id: module.id, name: module.name || module.title, label: module.title, enabled: module.enabled, order: module.order };
    const { data, error } = await supabase.from('dashboard_modules').upsert(payload).select();
    if (!error && data) {
      const saved = { ...data[0], title: data[0].label || data[0].name, widgets: module.widgets || [] };
      setModules(prev => {
        const index = prev.findIndex(m => m.id === module.id);
        if (index >= 0) return prev.map(m => m.id === module.id ? saved : m);
        return [...prev, saved];
      });
      toast.success('Module saved');
    }
  };

  // Feedback Actions
  const updateFeedbackStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('user_feedback').update({ status }).eq('id', id);
    if (!error) {
      setFeedback(feedback.map(f => f.id === id ? { ...f, status: status as any } : f));
      toast.success('Status updated');
    }
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
              activeTab === item.id ? 'bg-black text-white border-black' : 'bg-white text-stone-400 border-stone-200 hover:text-black hover:border-black'
            }`}
          >
            <item.icon className="h-3 w-3" />
            {item.label}
          </button>
        ))}
      </div>

      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif italic mb-2">
            {activeTab === 'users' && 'User Management'}
            {activeTab === 'codes' && 'Access Control'}
            {activeTab === 'modules' && 'Dynamic UI Builder'}
            {activeTab === 'feedback' && 'Feedback Inbox'}
          </h1>
          <p className="text-stone-500 uppercase tracking-widest text-[10px] font-bold">
            Administer your platform settings and user data
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

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {activeTab === 'users' && (
            <UserManagement 
              profiles={profiles} 
              searchQuery={searchQuery} 
              toggleUserStatus={toggleUserStatus}
              changeUserRole={changeUserRole}
              deleteUser={deleteUser}
            />
          )}
          {activeTab === 'codes' && (
            <AccessControl 
              accessCodes={accessCodes}
              createManualCode={createManualCode}
              toggleCodeStatus={toggleCodeStatus}
              deleteCode={deleteCode}
            />
          )}
          {activeTab === 'modules' && (
            <UIBuilder 
              modules={modules}
              modulesDirty={modulesDirty}
              isSavingModules={isSavingModules}
              onDragEnd={handleDragEnd}
              onToggleModule={(id, enabled) => {
                setModules(modules.map(m => m.id === id ? { ...m, enabled } : m));
                setModulesDirty(true);
              }}
              onDeleteModule={async (id) => {
                const { error } = await supabase.from('dashboard_modules').delete().eq('id', id);
                if (!error) setModules(modules.filter(m => m.id !== id));
              }}
              onSaveAllModules={saveAllModules}
              onSeedModules={seedInitialModules}
              onSaveModule={saveModule}
            />
          )}
          {activeTab === 'feedback' && (
            <FeedbackInbox 
              feedback={feedback}
              updateFeedbackStatus={updateFeedbackStatus}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
