import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Key, 
  Layout, 
  MessageSquare, 
  RefreshCcw, 
  Search, 
  Loader2,
  Heart
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

export const AdminDashboard: React.FC<{ refreshData?: () => void }> = ({ refreshData }) => {
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
    try {
      // Validate modules have names and IDs
      const updates = modules.map((m, idx) => ({ 
        id: m.id, 
        name: m.name || m.title.toLowerCase().replace(/\s+/g, '_'), 
        label: m.title, 
        enabled: m.enabled, 
        order: idx,
        widgets: m.widgets || [] 
      }));

      console.log('Attempting to save modules:', updates);
      
      // Attempt upsert - if widgets column doesn't exist, we'll try without it
      const { error } = await supabase.from('dashboard_modules').upsert(updates);
      
      if (error) {
        console.error('Initial upsert failed, trying without widgets column:', error);
        // Fallback for older schemas without widgets column
        const fallbackUpdates = updates.map(({ widgets, ...rest }) => rest);
        const { error: error2 } = await supabase.from('dashboard_modules').upsert(fallbackUpdates);
        if (error2) throw error2;
      }

      setModulesDirty(false);
      toast.success('Dashboard layout saved successfully');
      
      // Trigger a global refresh to update parent state
      if (refreshData) refreshData();
    } catch (err: any) {
      console.error('Detailed save error:', err);
      toast.error(`Failed to save dashboard changes: ${err.message || 'Database error'}`);
    } finally {
      setIsSavingModules(false);
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
    try {
      const payload = { 
        id: module.id, 
        name: module.name || module.title.toLowerCase().replace(/\s+/g, '_'), 
        label: module.title, 
        enabled: module.enabled, 
        order: module.order,
        widgets: module.widgets || []
      };
      
      console.log('Saving module individually:', payload);
      
      // Attempt upsert with widgets
      let { data, error } = await supabase.from('dashboard_modules').upsert(payload).select();
      
      if (error) {
        console.warn('Individual save failed with widgets, trying fallback:', error);
        const { widgets, ...fallbackPayload } = payload;
        const fallbackRes = await supabase.from('dashboard_modules').upsert(fallbackPayload).select();
        if (fallbackRes.error) throw fallbackRes.error;
        data = fallbackRes.data;
      }
      
      if (data) {
        const saved = { ...data[0], title: data[0].label || data[0].name, widgets: module.widgets || [] };
        setModules(prev => {
          const index = prev.findIndex(m => m.id === module.id);
          if (index >= 0) return prev.map(m => m.id === module.id ? saved : m);
          return [...prev, saved];
        });
        toast.success(`Module "${module.title}" saved successfully`);
        
        if (refreshData) refreshData();
        return true; 
      }
    } catch (err: any) {
      console.error('Module individual save error:', err);
      toast.error(`Failed to save module settings: ${err.message || 'Database error'}`);
      return false;
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

  const deleteFeedback = async (id: string, imageUrl?: string | null) => {
    try {
      // 1. Delete image from storage if it exists
      if (imageUrl && !imageUrl.startsWith('http')) {
        const { error: storageError } = await supabase.storage
          .from('feedback-images')
          .remove([imageUrl]);
        
        if (storageError) {
          console.error('Failed to delete image from storage:', storageError);
          // We continue anyway to at least remove the DB record
        }
      }

      // 2. Delete from database
      const { error: dbError } = await supabase
        .from('user_feedback')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // 3. Update local state
      setFeedback(prev => prev.filter(f => f.id !== id));
    } catch (err: any) {
      console.error('Delete feedback error:', err);
      throw new Error(err.message || 'Failed to delete feedback record');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin dark:border-zinc-800 dark:border-t-white" />
          <Heart className="absolute inset-0 m-auto h-4 w-4 text-zinc-900 animate-pulse dark:text-white" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 dark:text-zinc-500 animate-pulse">
          Synchronizing Admin Data...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f7f5] dark:bg-zinc-950 text-[#0a0a0a] dark:text-white font-sans transition-colors duration-300">
      <div className="mb-8 flex flex-wrap gap-2 border-b border-stone-200 dark:border-zinc-800 pb-4">
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
                ? 'bg-black dark:bg-white text-white dark:text-zinc-900 border-black dark:border-white shadow-lg' 
                : 'bg-white dark:bg-zinc-900 text-stone-400 dark:text-zinc-500 border-stone-200 dark:border-zinc-800 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-zinc-600'
            }`}
          >
            <item.icon className="h-3 w-3" />
            {item.label}
          </button>
        ))}
      </div>

      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif italic mb-2 dark:text-white text-zinc-900">
            {activeTab === 'users' && 'User Management'}
            {activeTab === 'codes' && 'Access Control'}
            {activeTab === 'modules' && 'Dynamic UI Builder'}
            {activeTab === 'feedback' && 'Feedback Inbox'}
          </h1>
          <p className="text-stone-500 dark:text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
            Administer your platform settings and user data
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-zinc-500" />
            <Input 
              placeholder="Search..." 
              className="pl-10 h-10 w-64 rounded-none border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-10 rounded-none border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 dark:text-white" onClick={fetchAllData}>
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
              searchQuery={searchQuery}
              modulesDirty={modulesDirty}
              isSavingModules={isSavingModules}
              onDragEnd={handleDragEnd}
              onToggleModule={(id, enabled) => {
                setModules(modules.map(m => m.id === id ? { ...m, enabled } : m));
                setModulesDirty(true);
              }}
              onDeleteModule={async (id) => {
                if (window.confirm('Are you sure you want to delete this module? This cannot be undone.')) {
                  const { error } = await supabase.from('dashboard_modules').delete().eq('id', id);
                  if (!error) {
                    setModules(modules.filter(m => m.id !== id));
                    toast.success('Module deleted');
                  } else {
                    toast.error('Failed to delete module');
                  }
                }
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
              deleteFeedback={deleteFeedback}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
