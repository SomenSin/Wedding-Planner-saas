import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Loader2, 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Gift, 
  Clock, 
  Calendar, 
  Wine, 
  CheckSquare, 
  MessageSquare, 
  Menu, 
  X, 
  LogOut, 
  Shield, 
  Layout,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { DashboardHome } from '@/components/modules/DashboardHome';
import { GuestCRM } from '@/components/modules/GuestCRM';
import { BudgetPlanner } from '@/components/modules/BudgetPlanner';
import { RegistryManager } from '@/components/modules/RegistryManager';
import { LogisticsManager } from '@/components/modules/LogisticsManager';
import { VendorManager } from '@/components/modules/VendorManager';
import { DrinkCalculator } from '@/components/modules/DrinkCalculator';
import { Checklists } from '@/components/modules/Checklists';
import { SupportModule } from '@/components/modules/SupportModule';
import { AdminDashboard } from '@/components/AdminDashboard';
import { OnboardingDialog } from '@/components/modals/OnboardingDialog';


interface CoupleDashboardProps {
  isAdmin: boolean;
  userEmail: string;
}

export const CoupleDashboard: React.FC<CoupleDashboardProps> = ({ isAdmin, userEmail }) => {
  const { guestCount, setGuestCount } = useStore();
  const [modules, setModules] = useState<any[]>([]);
  const [activeModuleId, setActiveModuleId] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  
  // Data states
  const [weddingDetails, setWeddingDetails] = useState<any>({ wedding_date: '', couple_name: '', partner_name: '' });
  const [guests, setGuests] = useState<any[]>([]);
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [registryItems, setRegistryItems] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [drinks, setDrinks] = useState<any[]>([]);
  const [checklistCategories, setChecklistCategories] = useState<any[]>([]);
  const [accessCode, setAccessCode] = useState('000000');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [totalBudget, setTotalBudget] = useState(0);

  const [currency, setCurrency] = useState('USD');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const fetchData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      setUser(authUser);

      // Check for wedding details in user metadata
      const metadata = authUser.user_metadata;
      if (metadata?.wedding_date) {
        setWeddingDetails({
          wedding_date: metadata.wedding_date,
          couple_name: metadata.couple_name || '',
          partner_name: metadata.partner_name || ''
        });
        setTotalBudget(metadata.total_budget || 0);
        setCurrency(metadata.currency || 'USD');
      } else {
        setIsOnboardingOpen(true);
      }

      const [
        mRes, 
        gRes, 
        bRes, 
        rRes, 
        tRes, 
        iRes, 
        vRes, 
        clRes,
        acRes,
        deRes
      ] = await Promise.all([
        supabase.from('dashboard_modules').select('*').eq('enabled', true).order('order', { ascending: true }),
        supabase.from('guests').select('*').eq('couple_id', authUser.id),
        supabase.from('budget_items').select('*').eq('couple_id', authUser.id),
        supabase.from('registry_items').select('*').eq('couple_id', authUser.id),
        supabase.from('logistics_tasks').select('*').eq('couple_id', authUser.id),
        supabase.from('itinerary_items').select('*').eq('couple_id', authUser.id).order('start_time', { ascending: true }),
        supabase.from('vendors').select('*').eq('couple_id', authUser.id),
        supabase.from('checklist_categories').select('*, checklist_items(*)'),
        supabase.from('access_codes').select('code').eq('linked_user_id', authUser.id).maybeSingle(),
        supabase.from('drink_entries').select('*').eq('couple_id', authUser.id)
      ]);
      
      if (mRes.data) setModules(mRes.data);
      if (gRes.data) {
        setGuests(gRes.data);
        const totalPeople = gRes.data.reduce((acc: number, g: any) => acc + (g.party_size || 1), 0);
        setGuestCount(totalPeople);
      }
      if (bRes.data) setBudgetItems(bRes.data);
      if (rRes.data) setRegistryItems(rRes.data);
      if (tRes.data) setTasks(tRes.data);
      if (iRes.data) setItinerary(iRes.data);
      if (vRes.data) setVendors(vRes.data);
      if (deRes.data) setDrinks(deRes.data);
      if (clRes.data) setChecklistCategories(clRes.data);
      if (acRes.data) setAccessCode(acRes.data.code);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOnboardingSubmit = async (details: any) => {
    const { error } = await supabase.auth.updateUser({
      data: {
        wedding_date: details.wedding_date,
        couple_name: details.couple_name,
        partner_name: details.partner_name
      }
    });

    if (error) {
      toast.error(error.message);
    } else {
      await fetchData(); // Full refresh to sync dashboard
      setIsOnboardingOpen(false);
      toast.success('Wedding details saved!');
    }
  };

  const handleUpdateWeddingDetails = async (details: any) => {
    const { error } = await supabase.auth.updateUser({
      data: {
        wedding_date: details.wedding_date,
        couple_name: details.couple_name,
        partner_name: details.partner_name
      }
    });

    if (error) {
      toast.error(error.message);
    } else {
      await fetchData(); // Full refresh to sync dashboard
      toast.success('Wedding details updated!');
    }
  };

  const handleUpdateTotalBudget = async (newBudget: number) => {
    const originalBudget = totalBudget;
    setTotalBudget(newBudget);
    
    const { error } = await supabase.auth.updateUser({
      data: { total_budget: newBudget }
    });
    
    if (error) {
      setTotalBudget(originalBudget);
      toast.error('Failed to update total budget');
    } else {
      toast.success('Budget updated');
    }
  };

  const handleUpdateCurrency = async (newCurrency: string) => {
    const originalCurrency = currency;
    setCurrency(newCurrency);
    
    const { error } = await supabase.auth.updateUser({
      data: { currency: newCurrency }
    });
    
    if (error) {
      setCurrency(originalCurrency);
      toast.error('Failed to change currency');
    } else {
      toast.success(`Currency changed to ${newCurrency}`);
    }
  };

  const handleUpdateGuest = async (id: string, updates: any) => {
    const originalGuests = [...guests];
    setGuests(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    
    const { error } = await supabase.from('guests').update(updates).eq('id', id);
    if (error) {
      setGuests(originalGuests);
      toast.error('Failed to update guest');
    } else {
      toast.success('Guest updated');
    }
  };

  const handleDeleteGuest = async (id: string) => {
    const originalGuests = [...guests];
    setGuests(prev => prev.filter(g => g.id !== id));

    const { error } = await supabase.from('guests').delete().eq('id', id);
    if (error) {
      setGuests(originalGuests);
      toast.error('Failed to remove guest');
    } else {
      toast.success('Guest removed');
    }
  };

  const handleUpdateBudget = async (id: string, updates: any) => {
    const originalBudget = [...budgetItems];
    setBudgetItems(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));

    const { error } = await supabase.from('budget_items').update(updates).eq('id', id);
    if (error) {
      setBudgetItems(originalBudget);
      toast.error('Failed to update budget');
    } else {
      toast.success('Budget item updated');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    const originalBudget = [...budgetItems];
    setBudgetItems(prev => prev.filter(b => b.id !== id));

    const { error } = await supabase.from('budget_items').delete().eq('id', id);
    if (error) {
      setBudgetItems(originalBudget);
      toast.error('Failed to remove item');
    } else {
      toast.success('Item removed');
    }
  };

  const handleUpdateRegistry = async (id: string, updates: any) => {
    const { error } = await supabase.from('registry_items').update(updates).eq('id', id);
    if (!error) setRegistryItems(registryItems.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleUpdateTask = async (id: string, updates: any) => {
    const { error } = await supabase.from('logistics_tasks').update(updates).eq('id', id);
    if (!error) setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleUpdateItinerary = async (newItems: any[]) => {
    setItinerary(newItems);
  };

  const handleUpdateVendor = async (id: string, updates: any) => {
    const { error } = await supabase.from('vendors').update(updates).eq('id', id);
    if (!error) setVendors(vendors.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const handleSubmitFeedback = async (data: any) => {
    const { files, ...feedbackData } = data;
    const { data: { user } } = await supabase.auth.getUser();
    let imageUrls: string[] = [];
    
    if (files && files.length > 0) {
      console.log('Support Module: Attempting to upload', files.length, 'files');
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        
        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('feedback-images')
            .upload(fileName, file);
            
          if (uploadError) {
            console.error('Support Module: Upload error for', file.name, uploadError);
            toast.error(`Failed to upload ${file.name}`);
            continue;
          }
          
          if (uploadData) {
            const { data: publicRes } = supabase.storage
              .from('feedback-images')
              .getPublicUrl(uploadData.path);
            
            if (publicRes?.publicUrl) {
              imageUrls.push(publicRes.publicUrl);
              console.log('Support Module: File uploaded, public URL:', publicRes.publicUrl);
            }
          }
        } catch (err) {
          console.error('Support Module: Unexpected upload error:', err);
        }
      }
    }

    const payload = {
      content: `${feedbackData.subject}\n\n${feedbackData.content}`,
      user_id: user?.id,
      type: feedbackData.category === 'bug' ? 'bug' : feedbackData.category === 'feature' ? 'feature' : 'other',
      status: 'new',
      image_url: imageUrls.length > 0 ? imageUrls.join(',') : null
    };

    console.log('Support Module: Inserting feedback payload:', payload);
    const { error: insertError } = await supabase.from('user_feedback').insert([payload]);
    
    if (insertError) {
      console.error('Support Module: Database insert error:', insertError);
      throw insertError;
    }
  };

  const MODULE_ICON_MAP: Record<string, { icon: any; label: string }> = {
    overview:   { icon: LayoutDashboard, label: 'Dashboard' },
    guests:     { icon: Users,           label: 'Guest CRM' },
    budget:     { icon: DollarSign,      label: 'Financial Hub' },
    registry:   { icon: Gift,            label: 'Registry & Gifts' },
    logistics:  { icon: Clock,           label: 'Itinerary' },
    vendors:    { icon: Calendar,        label: 'Vendors' },
    drinks:     { icon: Wine,            label: 'Drink Calc' },
    checklists: { icon: CheckSquare,     label: 'Checklists' },
    support:    { icon: MessageSquare,   label: 'Support' },
  };

  const menuItems = modules.length > 0
    ? modules
        .filter(m => m.enabled)
        .sort((a, b) => a.order - b.order)
        .map(m => ({
          id: m.name,
          label: m.label || MODULE_ICON_MAP[m.name]?.label || m.name,
          icon: MODULE_ICON_MAP[m.name]?.icon || LayoutDashboard,
        }))
    : [
        { id: 'overview',   label: 'Dashboard',         icon: LayoutDashboard },
        { id: 'guests',     label: 'Guest CRM',          icon: Users },
        { id: 'budget',     label: 'Financial Hub',      icon: DollarSign },
        { id: 'registry',   label: 'Registry & Gifts',   icon: Gift },
        { id: 'logistics',  label: 'Itinerary',          icon: Clock },
        { id: 'vendors',    label: 'Vendors',            icon: Calendar },
        { id: 'drinks',     label: 'Drink Calc',         icon: Wine },
        { id: 'checklists', label: 'Checklists',         icon: CheckSquare },
      ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-12 w-12 animate-spin text-zinc-300" />
      </div>
    );
  }

  const activeModule = menuItems.find(m => m.id === activeModuleId);

  return (
    <div className="flex min-h-screen bg-zinc-50 relative overflow-hidden">
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-[45] bg-black/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white border-r border-zinc-100 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        <div className="flex h-full flex-col p-8">
          <div className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-lg">
                <Heart className="h-6 w-6" />
              </div>
              <span className="text-xl font-serif italic text-zinc-900">Vow Vantage</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(false)} 
              className="lg:hidden"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModuleId(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                  activeModuleId === item.id 
                    ? 'bg-zinc-900 text-white shadow-md' 
                    : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8 space-y-2">
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveModuleId('admin');
                  setIsSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                  activeModuleId === 'admin' 
                    ? 'bg-zinc-900 text-white shadow-md' 
                    : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <Shield className="h-5 w-5" />
                Admin Panel
              </button>
            )}
            <button
              onClick={() => {
                setActiveModuleId('support');
                setIsSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                activeModuleId === 'support' 
                  ? 'bg-zinc-900 text-white shadow-md' 
                  : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              Support & Feedback
            </button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? (
                <>
                  <Sun className="h-5 w-5" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5" />
                  Dark Mode
                </>
              )}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-50 hover:text-red-500"
              onClick={() => supabase.auth.signOut()}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between bg-white/80 px-8 backdrop-blur-md lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-auto">
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <div className="flex items-center gap-3 ml-auto">
            <Heart className="h-6 w-6 text-zinc-900" />
            <span className="text-lg font-serif italic">Vow Vantage</span>
          </div>
        </header>

        <div className="p-8 lg:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModuleId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">Couple Dashboard</span>
                  <div className="h-px w-8 bg-zinc-200" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-900">{activeModule?.label}</span>
                </div>
                <h1 className="text-5xl font-serif italic text-zinc-900">Our Wedding</h1>
              </div>

              {activeModuleId === 'overview' && (
                <DashboardHome 
                  weddingDate={weddingDetails.wedding_date}
                  coupleName={weddingDetails.couple_name}
                  partnerName={weddingDetails.partner_name}
                  guestCount={guestCount}
                  guests={guests}
                  rsvpsAccepted={guests.filter(g => g.rsvp_status === 'accepted').reduce((acc, g) => acc + (g.party_size || 1), 0)}
                  totalBudget={totalBudget}
                  spentBudget={budgetItems.reduce((sum, i) => sum + i.actual_cost, 0)}
                  upcomingTasks={tasks.filter(t => t.status !== 'done')}
                  itinerary={itinerary}
                  registryItems={registryItems}
                  vendors={vendors}
                  drinks={drinks}
                  checklistCategories={checklistCategories}
                  onQuickAction={(action) => setActiveModuleId(action === 'add-guest' ? 'guests' : action === 'log-expense' ? 'budget' : 'logistics')}
                  onUpdateWeddingDetails={handleUpdateWeddingDetails}
                  currency={currency}
                />
              )}

              {activeModuleId === 'guests' && (
                <GuestCRM 
                  guests={guests}
                  accessCode={accessCode}
                  onUpdateGuest={handleUpdateGuest}
                  onDeleteGuest={handleDeleteGuest}
                  userId={user?.id || ''}
                  refreshData={fetchData}
                />
              )}

              {activeModuleId === 'budget' && (
                <BudgetPlanner 
                  totalBudget={totalBudget}
                  budgetItems={budgetItems}
                  onUpdateItem={handleUpdateBudget}
                  onDeleteItem={handleDeleteBudget}
                  onUpdateTotalBudget={handleUpdateTotalBudget}
                  currency={currency}
                  onUpdateCurrency={handleUpdateCurrency}
                  userId={user?.id || ''}
                  refreshData={fetchData}
                />
              )}

              {activeModuleId === 'registry' && (
                <RegistryManager 
                  guestCount={guests.length}
                  registryItems={registryItems}
                  cashFunds={[]}
                  onUpdateItem={handleUpdateRegistry}
                  onDeleteItem={async (id) => {
                    const { error } = await supabase.from('registry_items').delete().eq('id', id);
                    if (!error) {
                      await fetchData();
                      toast.success('Gift removed');
                    }
                  }}
                  currency={currency}
                  userId={user?.id || ''}
                  refreshData={fetchData}
                />
              )}

              {activeModuleId === 'logistics' && (
                <LogisticsManager 
                  weddingDate={weddingDetails.wedding_date}
                  tasks={tasks}
                  itinerary={itinerary}
                  onUpdateTask={handleUpdateTask}
                  onUpdateItinerary={handleUpdateItinerary}
                  onDeleteTask={async (id) => {
                    const { error } = await supabase.from('logistics_tasks').delete().eq('id', id);
                    if (!error) {
                      await fetchData();
                      toast.success('Task removed');
                    }
                  }}
                  onDeleteItineraryItem={async (id) => {
                    const { error } = await supabase.from('itinerary_items').delete().eq('id', id);
                    if (!error) {
                      await fetchData();
                      toast.success('Activity removed');
                    }
                  }}
                  userId={user?.id || ''}
                  refreshData={fetchData}
                />
              )}

              {activeModuleId === 'vendors' && (
                <VendorManager 
                  vendors={vendors}
                  onUpdateVendor={handleUpdateVendor}
                  onDeleteVendor={async (id) => {
                    const { error } = await supabase.from('vendors').delete().eq('id', id);
                    if (!error) {
                      await fetchData();
                      toast.success('Vendor removed');
                    }
                  }}
                  currency={currency}
                  userId={user?.id || ''}
                  refreshData={fetchData}
                />
              )}

              {activeModuleId === 'drinks' && (
                <DrinkCalculator
                  guestCount={guestCount}
                  userId={user?.id || ''}
                  refreshData={fetchData}
                />
              )}

              {activeModuleId === 'checklists' && (
                <Checklists 
                  categories={checklistCategories.map(cat => ({
                    id: cat.id,
                    title: cat.title,
                    icon: <Layout className="h-5 w-5" />,
                    items: cat.checklist_items || []
                  }))}
                  onToggleItem={async (catId, itemId, completed) => {
                    const originalState = [...checklistCategories];
                    setChecklistCategories(prev => prev.map(cat => {
                      if (cat.id !== catId) return cat;
                      return {
                        ...cat,
                        checklist_items: (cat.checklist_items || []).map(item => 
                          item.id === itemId ? { ...item, completed } : item
                        )
                      };
                    }));
                    const { error } = await supabase.from('checklist_items').update({ completed }).eq('id', itemId);
                    if (error) {
                      setChecklistCategories(originalState);
                      toast.error("Failed to sync checklist");
                    } else {
                      fetchData();
                    }
                  }}
                  userId={user?.id || ''}
                  refreshData={fetchData}
                  isLoading={isLoading}
                />
              )}

              {activeModuleId === 'support' && (
                <SupportModule 
                  userEmail={userEmail}
                  onSubmitFeedback={handleSubmitFeedback}
                />
              )}

              {activeModuleId === 'admin' && isAdmin && (
                <div className="p-8">
                  <AdminDashboard onModulesSaved={fetchData} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <OnboardingDialog 
        isOpen={isOnboardingOpen} 
        onSubmit={handleOnboardingSubmit} 
      />
    </div>
  );
};
