import React, { useState, useEffect, useMemo } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import { FeedbackFAB } from '@/components/FeedbackFAB';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useStore } from '@/store/useStore';

import { Heart, Loader2, LayoutDashboard, Users, DollarSign, Gift, Calendar, Truck, Wine, CheckSquare, MessageSquare, Menu, X, LogOut, Camera, Flower2, Shield, Layout, Sun, Moon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { LoginSplit } from '@/components/LoginSplit';
import { AdminDashboard } from '@/components/AdminDashboard';
import { DashboardHome } from '@/components/modules/DashboardHome';
import { GuestCRM } from '@/components/modules/GuestCRM';
import { BudgetPlanner } from '@/components/modules/BudgetPlanner';
import { RegistryManager } from '@/components/modules/RegistryManager';
import { LogisticsManager } from '@/components/modules/LogisticsManager';
import { VendorManager } from '@/components/modules/VendorManager';
import { DrinkCalculator } from '@/components/modules/DrinkCalculator';
import { Checklists } from '@/components/modules/Checklists';
import { SupportModule } from '@/components/modules/SupportModule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'motion/react';

// --- Components ---

const GuestPortal = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleAccess = () => {
    if (code.length === 6) {
      toast.success('Access granted!');
      navigate('/guest/dashboard');
    } else {
      toast.error('Please enter a valid 6-digit code.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-zinc-950 p-4 transition-colors">
      <Card className="w-full max-w-md rounded-none border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-6 w-6 text-stone-300 dark:text-zinc-700" />
          </div>
          <CardTitle className="text-4xl font-serif italic dark:text-white">Vow Vantage</CardTitle>
          <CardDescription className="uppercase tracking-widest text-[10px] font-bold mt-2 dark:text-zinc-500">Guest Access Portal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 dark:text-zinc-400">Enter 6-Digit Code</Label>
            <Input
              placeholder="000000"
              maxLength={6}
              className="text-center text-3xl tracking-[0.5em] h-16 rounded-none border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white font-mono"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <Button className="w-full h-12 rounded-none bg-black dark:bg-white text-white dark:text-zinc-900 hover:bg-black/90 dark:hover:bg-white/90" onClick={handleAccess}>
            View Wedding Details
          </Button>
          
          <div className="pt-6 border-t border-stone-100 dark:border-zinc-800 text-center">
            <Button variant="link" className="text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200" render={<a href="/" />} nativeButton={false}>
              Couple Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const GuestDashboard = () => {
  return (
    <div className="min-h-screen bg-stone-50/50 dark:bg-zinc-950 p-8 transition-colors">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <div className="flex justify-center">
            <Heart className="h-8 w-8 text-stone-300 dark:text-zinc-700" />
          </div>
          <h1 className="text-6xl font-serif italic dark:text-white">The Wedding of <br /> Sarah & James</h1>
          <p className="uppercase tracking-[0.3em] text-xs font-bold text-stone-500 dark:text-zinc-400">Saturday, June 20th, 2026</p>
        </header>

        <div className="grid gap-8">
          <Card className="rounded-none border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif italic text-2xl dark:text-white">Itinerary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-6 border-l-2 border-stone-200 dark:border-zinc-800 pl-6 relative">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-stone-200 dark:bg-zinc-800" />
                <div>
                  <span className="font-mono text-sm font-bold dark:text-zinc-300">4:00 PM</span>
                  <h3 className="font-bold uppercase tracking-wider text-sm mt-1 dark:text-white">The Ceremony</h3>
                  <p className="text-muted-foreground dark:text-zinc-500 text-sm">St. Mary's Chapel, Oak Ridge</p>
                </div>
              </div>
              <div className="flex gap-6 border-l-2 border-stone-200 dark:border-zinc-800 pl-6 relative">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-stone-200 dark:bg-zinc-800" />
                <div>
                  <span className="font-mono text-sm font-bold dark:text-zinc-300">5:30 PM</span>
                  <h3 className="font-bold uppercase tracking-wider text-sm mt-1 dark:text-white">Cocktail Hour</h3>
                  <p className="text-muted-foreground dark:text-zinc-500 text-sm">The Garden Terrace</p>
                </div>
              </div>
              <div className="flex gap-6 border-l-2 border-stone-200 dark:border-zinc-800 pl-6 relative">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-stone-200 dark:bg-zinc-800" />
                <div>
                  <span className="font-mono text-sm font-bold dark:text-zinc-300">7:00 PM</span>
                  <h3 className="font-bold uppercase tracking-wider text-sm mt-1 dark:text-white">Dinner & Dancing</h3>
                  <p className="text-muted-foreground dark:text-zinc-500 text-sm">The Grand Ballroom</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-stone-200 dark:border-zinc-800 shadow-sm bg-stone-900 dark:bg-zinc-950 text-white">
            <CardHeader>
              <CardTitle className="font-serif italic text-2xl dark:text-white">RSVP</CardTitle>
              <CardDescription className="text-stone-400 dark:text-zinc-500">Please confirm your attendance by May 1st.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-white text-black hover:bg-stone-100 rounded-none h-12 font-bold uppercase tracking-widest text-xs">
                Confirm Attendance
              </Button>
            </CardContent>
          </Card>
        </div>

        <footer className="text-center pt-12">
          <Button variant="link" className="text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200" render={<a href="/guest/portal" />} nativeButton={false}>
            Back to Portal
          </Button>
        </footer>
      </div>
    </div>
  );
};

const CoupleDashboard: React.FC<{ isAdmin: boolean; userEmail: string; isDarkMode: boolean; setIsDarkMode: (val: boolean) => void }> = ({ isAdmin, userEmail, isDarkMode, setIsDarkMode }) => {
  const { guestCount, setGuestCount } = useStore();
  const [modules, setModules] = useState<any[]>([]);
  const [activeModuleId, setActiveModuleId] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
        drRes,
        clRes,
        acRes
      ] = await Promise.all([
        supabase.from('dashboard_modules').select('*').eq('enabled', true).order('order', { ascending: true }),
        supabase.from('guests').select('*').eq('couple_id', authUser.id),
        supabase.from('budget_items').select('*').eq('couple_id', authUser.id),
        supabase.from('registry_items').select('*').eq('couple_id', authUser.id),
        supabase.from('logistics_tasks').select('*').eq('couple_id', authUser.id),
        supabase.from('itinerary_items').select('*').eq('couple_id', authUser.id).order('start_time', { ascending: true }),
        supabase.from('vendors').select('*').eq('couple_id', authUser.id),
        supabase.from('drink_entries').select('*').eq('couple_id', authUser.id),
        supabase.from('checklist_categories').select('*, checklist_items(*)').eq('couple_id', authUser.id),
        supabase.from('access_codes').select('code').eq('linked_user_id', authUser.id).maybeSingle()
      ]);
      
      if (mRes.data) setModules(mRes.data);
      if (gRes.data) {
        setGuests(gRes.data);
        setGuestCount(gRes.data.length);
      }
      if (bRes.data) setBudgetItems(bRes.data);
      if (rRes.data) setRegistryItems(rRes.data);
      if (tRes.data) setTasks(tRes.data);
      if (iRes.data) setItinerary(iRes.data);
      if (vRes.data) setVendors(vRes.data);
      if (drRes.data) setDrinks(drRes.data);
      if (clRes.data) setChecklistCategories(clRes.data);
      setAccessCode(acRes.data?.code || '000000');

      // Auto-switch to first available module if current one is disabled
      if (mRes.data) {
        const enabledModules = mRes.data.filter((m: any) => m.enabled);
        const currentStillEnabled = enabledModules.find((m: any) => m.name === activeModuleId);
        if (!currentStillEnabled && enabledModules.length > 0 && activeModuleId !== 'admin' && activeModuleId !== 'support') {
          setActiveModuleId(enabledModules[0].name);
        }
      }
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
      setWeddingDetails(details);
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
      setWeddingDetails(details);
      toast.success('Wedding details updated!');
    }
  };

  const handleUpdateTotalBudget = async (newBudget: number) => {
    const { error } = await supabase.auth.updateUser({
      data: { total_budget: newBudget }
    });
    if (!error) {
      setTotalBudget(newBudget);
      toast.success('Budget updated');
    }
  };

  const handleUpdateCurrency = async (newCurrency: string) => {
    const { error } = await supabase.auth.updateUser({
      data: { currency: newCurrency }
    });
    if (!error) {
      setCurrency(newCurrency);
      toast.success(`Currency changed to ${newCurrency}`);
    }
  };

  const handleUpdateGuest = async (id: string, updates: any) => {
    const { error } = await supabase.from('guests').update(updates).eq('id', id);
    if (!error) setGuests(guests.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const handleUpdateBudget = async (id: string, updates: any) => {
    const { error } = await supabase.from('budget_items').update(updates).eq('id', id);
    if (!error) setBudgetItems(budgetItems.map(b => b.id === id ? { ...b, ...updates } : b));
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
    // In a real app, we'd update the order in DB
  };

  const handleUpdateVendor = async (id: string, updates: any) => {
    const { error } = await supabase.from('vendors').update(updates).eq('id', id);
    if (!error) setVendors(vendors.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const handleSubmitFeedback = async (data: any) => {
    const { files, ...feedbackData } = data;
    
    const { data: { user } } = await supabase.auth.getUser();
    
    // Map to schema: content, user_id, type
    const payload = {
      content: `${feedbackData.subject}: ${feedbackData.content}`,
      user_id: user?.id,
      type: feedbackData.category === 'bug' ? 'bug' : feedbackData.category === 'feature' ? 'feature' : 'other',
      status: 'new'
    };

    const { data: insertedData, error: insertError } = await supabase
      .from('user_feedback')
      .insert([payload])
      .select();

    if (insertError) throw insertError;

    if (files && files.length > 0 && insertedData?.[0]) {
      console.log('Files to upload for feedback:', files);
    }
  };

  const menuItems = useMemo(() => {
    const iconMap: Record<string, any> = {
      overview: LayoutDashboard,
      guests: Users,
      budget: DollarSign,
      registry: Gift,
      logistics: Truck,
      vendors: Calendar,
      drinks: Wine,
      checklists: CheckSquare,
      support: MessageSquare,
      admin: Shield
    };

    // Filter and sort modules based on the fetched global config
    return (modules || [])
      .filter(m => m.enabled)
      .map(m => ({
        id: m.name, // The technical name (e.g., 'overview')
        label: m.label || m.name, // The display title
        icon: iconMap[m.name] || LayoutDashboard
      }));
  }, [modules]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-12 w-12 animate-spin text-zinc-300" />
      </div>
    );
  }

  const activeModule = menuItems.find(m => m.id === activeModuleId);

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col p-8">
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg">
              <Heart className="h-6 w-6" />
            </div>
            <span className="text-xl font-serif italic text-zinc-900 dark:text-white">Vow Vantage</span>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModuleId(item.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                  activeModuleId === item.id 
                    ? 'bg-zinc-900 text-white shadow-md' 
                    : 'text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
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
                onClick={() => setActiveModuleId('admin')}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                  activeModuleId === 'admin' 
                    ? 'bg-zinc-900 text-white shadow-md' 
                    : 'text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Shield className="h-5 w-5" />
                Admin Panel
              </button>
            )}
            <button
              onClick={() => setActiveModuleId('support')}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                activeModuleId === 'support' 
                  ? 'bg-zinc-900 text-white shadow-md' 
                  : 'text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              Support & Feedback
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-zinc-400 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </button>
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between bg-white/80 dark:bg-zinc-900/80 px-8 backdrop-blur-md lg:hidden border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-zinc-900 dark:text-white" />
            <span className="text-lg font-serif italic text-zinc-900 dark:text-white">Vow Vantage</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="dark:text-white">
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
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
                  <div className="h-px w-8 bg-zinc-200 dark:bg-zinc-800" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-900 dark:text-zinc-100">{activeModule?.label}</span>
                </div>
                <h1 className="text-5xl font-serif italic text-zinc-900 dark:text-white">Our Wedding</h1>
              </div>

              {activeModuleId === 'overview' && (
                <DashboardHome 
                  weddingDate={weddingDetails.wedding_date}
                  coupleName={weddingDetails.couple_name}
                  partnerName={weddingDetails.partner_name}
                  guestCount={guests.length}
                  guests={guests}
                  rsvpsAccepted={guests.filter(g => g.rsvp_status === 'accepted').length}
                  totalBudget={totalBudget}
                  spentBudget={budgetItems.reduce((sum, i) => sum + (i.actual_cost || 0), 0)}
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
                  onDeleteGuest={async (id) => {
                    const { error } = await supabase.from('guests').delete().eq('id', id);
                    if (!error) setGuests(guests.filter(g => g.id !== id));
                  }}
                  userId={user?.id || ''}
                  refreshData={fetchData}
                />
              )}

              {activeModuleId === 'budget' && (
                <BudgetPlanner 
                  totalBudget={totalBudget}
                  budgetItems={budgetItems}
                  onUpdateItem={handleUpdateBudget}
                  onDeleteItem={async (id) => {
                    const { error } = await supabase.from('budget_items').delete().eq('id', id);
                    if (!error) setBudgetItems(budgetItems.filter(b => b.id !== id));
                  }}
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
                    if (!error) setRegistryItems(registryItems.filter(r => r.id !== id));
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
                    if (!error) setTasks(tasks.filter(t => t.id !== id));
                  }}
                  onDeleteItineraryItem={async (id) => {
                    const { error } = await supabase.from('itinerary_items').delete().eq('id', id);
                    if (!error) setItinerary(itinerary.filter(i => i.id !== id));
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
                    if (!error) setVendors(vendors.filter(v => v.id !== id));
                  }}
                  currency={currency}
                  userId={user?.id || ''}
                  refreshData={fetchData}
                />
              )}

              {activeModuleId === 'drinks' && (
                <DrinkCalculator 
                  guestCount={guests.length} 
                  userId={user?.id || ''}
                  refreshData={fetchData}
                />
              )}

              {activeModuleId === 'checklists' && (
                <Checklists 
                  categories={(checklistCategories || []).map(cat => ({
                    id: cat.id,
                    title: cat.title,
                    icon: <LayoutDashboard className="h-5 w-5" />,
                    items: cat.checklist_items || []
                  }))}
                  onToggleItem={async (catId, itemId, completed) => {
                    // 1. Optimistic local update
                    setChecklistCategories(prev => prev.map(cat => {
                      if (cat.id !== catId) return cat;
                      return {
                        ...cat,
                        checklist_items: (cat.checklist_items || []).map(item => 
                          item.id === itemId ? { ...item, completed } : item
                        )
                      };
                    }));

                    // 2. Background sync
                    const { error } = await supabase
                      .from('checklist_items')
                      .update({ completed })
                      .eq('id', itemId);
                    
                    if (error) {
                      toast.error('Sync failed: ' + error.message);
                      fetchData(); // Rollback to source of truth
                    }
                  }}
                  userId={user?.id || ''}
                  refreshData={fetchData}
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
                  <AdminDashboard refreshData={fetchData} />
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

const OnboardingDialog: React.FC<{ isOpen: boolean; onSubmit: (details: any) => void }> = ({ isOpen, onSubmit }) => {
  const [details, setDetails] = useState({
    couple_name: '',
    partner_name: '',
    wedding_date: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white mb-4">
            <Heart className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-serif italic text-zinc-900 dark:text-white">Welcome to Vow Vantage</h2>
          <p className="text-zinc-500 mt-2">Let's set up your wedding dashboard</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400">Your Name</Label>
            <Input 
              value={details.couple_name}
              onChange={(e) => setDetails({ ...details, couple_name: e.target.value })}
              placeholder="Enter your name"
              className="rounded-xl border-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400">Partner's Name</Label>
            <Input 
              value={details.partner_name}
              onChange={(e) => setDetails({ ...details, partner_name: e.target.value })}
              placeholder="Enter partner's name"
              className="rounded-xl border-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400">Wedding Date</Label>
            <Input 
              type="date"
              value={details.wedding_date}
              onChange={(e) => setDetails({ ...details, wedding_date: e.target.value })}
              className="rounded-xl border-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
            />
          </div>
        </div>

        <Button 
          className="w-full mt-8 rounded-xl bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 h-12 text-lg font-serif italic"
          onClick={() => onSubmit(details)}
          disabled={!details.couple_name || !details.partner_name || !details.wedding_date}
        >
          Start Planning
        </Button>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [isConfigured, setIsConfigured] = useState(true);
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

  useEffect(() => {
    const checkConfig = () => {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!url || !key) {
        setIsConfigured(false);
        return false;
      }
      return true;
    };

    if (!checkConfig()) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = session?.user?.user_metadata?.role === 'admin' || 
                  session?.user?.email === 'somendrasing019@gmail.com' ||
                  session?.user?.email === 'somendrasingh019@gmail.com';

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-zinc-950 p-8 text-center transition-colors">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-serif italic dark:text-white">Configuration Required</h1>
          <p className="text-muted-foreground dark:text-zinc-500">
            Please set <code className="bg-stone-200 dark:bg-zinc-800 px-1 rounded dark:text-zinc-300">VITE_SUPABASE_URL</code> and{' '}
            <code className="bg-stone-200 dark:bg-zinc-800 px-1 rounded dark:text-zinc-300">VITE_SUPABASE_ANON_KEY</code> in your
            environment variables (Secrets panel) to connect to your Supabase project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            session 
              ? <Navigate to={isAdmin ? "/admin-dashboard" : "/dashboard"} /> 
              : <LoginSplit />
          } 
        />
        <Route path="/guest/portal" element={<GuestPortal />} />
        <Route path="/guest/dashboard" element={<GuestDashboard />} />
        <Route 
          path="/login" 
          element={
            session 
              ? <Navigate to={isAdmin ? "/admin-dashboard" : "/dashboard"} /> 
              : <LoginSplit />
          } 
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            session 
              ? <CoupleDashboard isAdmin={isAdmin} userEmail={session.user.email || ''} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            session 
              ? (isAdmin ? <Navigate to="/dashboard" /> : <Navigate to="/dashboard" />)
              : <Navigate to="/login" />
          }
        />
        
        {/* Legacy Redirect */}
        <Route path="/admin" element={<Navigate to="/admin-dashboard" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </Router>
  );
}
