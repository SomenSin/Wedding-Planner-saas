import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import {
  Wine,
  Beer,
  GlassWater,
  Users,
  TrendingUp,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { exportToCSV } from '@/lib/export';
import { FileDown } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DrinkEntry {
  id: string;
  drink_type: string;
  name: string;
  unit: string;
  estimated: number;
  acquired: number;
  notes: string;
  is_manual: boolean;
}

type CalcResult = {
  totalDrinks: number;
  wineBottles: number;
  beerBottles: number;
  liquorBottles: number;
  othersTotal: number;
  nonAlcTotal: number;
};

const WINE_TYPES = ['red_wine', 'white_wine', 'rose_wine', 'champagne'];
const BEER_TYPES = ['beer'];
const SPIRITS_TYPES = ['whisky', 'vodka', 'rum', 'gin', 'tequila', 'brandy'];
const SOFT_DRINKS_TYPES = ['juice', 'soft_drinks', 'water'];

function getGroup(type: string) {
  if (WINE_TYPES.includes(type)) return 'wine';
  if (BEER_TYPES.includes(type)) return 'beer';
  if (SPIRITS_TYPES.includes(type)) return 'spirits';
  if (SOFT_DRINKS_TYPES.includes(type)) return 'soft_drinks';
  return 'others';
}

// ─── Master catalogue ─────────────────────────────────────────────────────────
const CATALOGUE: {
  type: string; label: string; unit: string;
  formula: (c: CalcResult) => number;
}[] = [
    // Wine breakdown (15% of total): Red 40%, White 40%, Rosé 20%
    { type: 'rose_wine',   label: 'Rosé Wine',            unit: 'Bottles', formula: c => Math.round(c.wineBottles * 0.2) },
    { type: 'white_wine',  label: 'White Wine',           unit: 'Bottles', formula: c => Math.round(c.wineBottles * 0.4) },
    { type: 'red_wine',    label: 'Red Wine',             unit: 'Bottles', formula: c => Math.max(0, c.wineBottles - Math.round(c.wineBottles * 0.2) - Math.round(c.wineBottles * 0.4)) },
    
    { type: 'beer',        label: 'Beer',                 unit: 'Cans / Bottles', formula: c => c.beerBottles },

    // Spirits breakdown (10% of total): 750ml bottles.
    { type: 'tequila',     label: 'Tequila',              unit: 'Bottles (750ml)', formula: c => Math.round(c.liquorBottles * 0.1) },
    { type: 'gin',         label: 'Gin',                  unit: 'Bottles (750ml)', formula: c => Math.round(c.liquorBottles * 0.1) },
    { type: 'rum',         label: 'Rum',                  unit: 'Bottles (750ml)', formula: c => Math.round(c.liquorBottles * 0.2) },
    { type: 'vodka',       label: 'Vodka',                unit: 'Bottles (750ml)', formula: c => Math.round(c.liquorBottles * 0.3) },
    { type: 'whisky',      label: 'Whisky',               unit: 'Bottles (750ml)', formula: c => Math.max(0, c.liquorBottles - Math.round(c.liquorBottles * 0.1) - Math.round(c.liquorBottles * 0.1) - Math.round(c.liquorBottles * 0.2) - Math.round(c.liquorBottles * 0.3)) },

    // Others (5% of total)
    { type: 'champagne',   label: 'Champagne / Prosecco', unit: 'Bottles', formula: c => c.othersTotal },

    // Non-alcoholic (50% of total): Water 50%, Soft Drinks 30%, Juice 20%
    { type: 'juice',       label: 'Juices',               unit: 'Litres', formula: c => Math.round(c.nonAlcTotal * 0.2) },
    { type: 'soft_drinks', label: 'Soft Drinks / Soda',  unit: 'Litres', formula: c => Math.round(c.nonAlcTotal * 0.3) },
    { type: 'water',       label: 'Water / Mineral',      unit: 'Litres', formula: c => Math.max(0, c.nonAlcTotal - Math.round(c.nonAlcTotal * 0.2) - Math.round(c.nonAlcTotal * 0.3)) },
  ];

interface DrinkCalculatorProps {
  guestCount: number;
  userId: string;
  refreshData?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const DrinkCalculator: React.FC<DrinkCalculatorProps> = ({
  guestCount: propGuestCount,
  userId,
  refreshData,
}) => {
  const [guestCount, setGuestCount] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [crowdType, setCrowdType] = useState<string>('average');
  const [drinks, setDrinks] = useState<DrinkEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const [showAddCustom, setShowAddCustom] = useState(false);
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [customUnit, setCustomUnit] = useState('Bottles');
  const [customEstimated, setCustomEstimated] = useState<number>(1);
  const [customNotes, setCustomNotes] = useState('');

  // ─── Pure formula (used for auto-seeding only) ───────────────────────────────
  const calcFromInputs = useCallback((gc: number, dur: number, ct: string): CalcResult => {
    // Realistic multipliers for wedding settings: 
    // Light: 0.5 drinks/hr, Average: 1.0 drinks/hr, Heavy: 1.5 drinks/hr
    const m = ct === 'light' ? 0.5 : ct === 'heavy' ? 1.5 : 1.0;
    const total = Math.round(gc * dur * m);
    
    return {
      totalDrinks:   total,
      wineBottles:   Math.ceil((total * 0.15) / 5),      // 15% Wine (5 glasses per bottle)
      beerBottles:   Math.ceil(total * 0.25),            // 25% Beer (1 bottle per drink)
      liquorBottles: Math.ceil((total * 0.10) / 17),     // 10% Spirits (17 drinks per bottle)
      othersTotal:   Math.ceil((total * 0.05) / 6),      // 5% Others (e.g. Champagne)
      nonAlcTotal:   Math.ceil(total * 0.50),            // 50% Non-alcoholic
    };
  }, []);

  const currentCalc = useMemo(
    () => calcFromInputs(guestCount, duration, crowdType),
    [guestCount, duration, crowdType, calcFromInputs]
  );

  const formulaFor = useCallback((type: string, calc: CalcResult) => {
    const cat = CATALOGUE.find(c => c.type === type);
    return cat ? cat.formula(calc) : 0;
  }, []);

  // ─── Load from DB ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [{ data: entries }, { data: settings }] = await Promise.all([
        supabase.from('drink_entries').select('*').eq('couple_id', userId).order('created_at'),
        supabase.from('drink_settings').select('*').eq('couple_id', userId).single(),
      ]);

      let gc = 0;
      let dur = 0;
      let ct = 'average';

      if (settings) {
        gc = settings.guest_count ?? 0;
        dur = settings.duration ?? 0;
        ct = settings.crowd_type ?? 'average';
        setGuestCount(gc);
        setDuration(dur);
        setCrowdType(ct);
      }

      if (entries && entries.length > 0) {
        setDrinks(entries.map((d: any) => ({
          id: d.id, drink_type: d.drink_type || 'custom', name: d.name,
          unit: d.unit || 'Bottles', estimated: d.estimated ?? 0,
          acquired: d.acquired ?? 0, notes: d.notes || '', is_manual: d.is_manual ?? false,
        })));
      } else {
        // Seed all catalogue drinks with calculated estimates
        const calc = calcFromInputs(gc, dur, ct);
        const toInsert = CATALOGUE.map(cat => ({
          couple_id: userId,
          drink_type: cat.type,
          name: cat.label,
          unit: cat.unit,
          estimated: cat.formula(calc),
          acquired: 0,
          notes: '',
          is_manual: false,
        }));
        const { data: inserted, error: insertErr } = await supabase.from('drink_entries').insert(toInsert).select();
        if (insertErr) {
          console.error('Seed insert failed:', insertErr.message);
          // Retry without is_manual in case column doesn't exist yet
          const toInsertFallback = toInsert.map(({ is_manual, ...row }) => row);
          const { data: inserted2 } = await supabase.from('drink_entries').insert(toInsertFallback).select();
          if (inserted2) {
            setDrinks(inserted2.map((d: any) => ({
              id: d.id, drink_type: d.drink_type || 'custom', name: d.name, unit: d.unit,
              estimated: d.estimated ?? 0, acquired: 0, notes: '', is_manual: false,
            })));
            if (refreshData) refreshData();
          }
        } else if (inserted) {
          setDrinks(inserted.map((d: any) => ({
            id: d.id, drink_type: d.drink_type, name: d.name, unit: d.unit,
            estimated: d.estimated, acquired: 0, notes: '', is_manual: false,
          })));
          if (refreshData) refreshData();
        }
      }
      setIsLoaded(true);
    })();
  }, [userId]);

  // ─── Live list sync ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !userId) return;

    const syncList = async () => {
      const desiredTypes = CATALOGUE.filter(cat => cat.formula(currentCalc) > 0);
      
      const toDelete: string[] = [];
      const toUpdate: { id: string; estimated: number }[] = [];
      const toInsert: any[] = [];

      // 1. Check existing drinks
      const updatedDrinks = drinks.map(d => {
        // Custom drinks are always preserved
        if (d.drink_type === 'custom') return d;

        const target = desiredTypes.find(t => t.type === d.drink_type);
        if (!target) {
          // No longer needed by formula - unless manually touched by user
          // User request: Delete if 0 quantity
          toDelete.push(d.id);
          return null;
        }

        // If manual, don't overwrite the number, but keep the row
        if (d.is_manual) return d;

        const newEst = target.formula(currentCalc);
        if (newEst !== d.estimated) {
          toUpdate.push({ id: d.id, estimated: newEst });
          return { ...d, estimated: newEst };
        }
        return d;
      }).filter(Boolean) as DrinkEntry[];

      // 2. Identify missing types
      desiredTypes.forEach(cat => {
        const exists = drinks.find(d => d.drink_type === cat.type);
        if (!exists) {
          toInsert.push({
            couple_id: userId,
            drink_type: cat.type,
            name: cat.label,
            unit: cat.unit,
            estimated: cat.formula(currentCalc),
            acquired: 0,
            notes: '',
            is_manual: false
          });
        }
      });

      // 3. Execution
      if (toDelete.length > 0) {
        await supabase.from('drink_entries').delete().in('id', toDelete);
      }
      if (toUpdate.length > 0) {
        await Promise.all(toUpdate.map(({ id, estimated }) => 
          supabase.from('drink_entries').update({ estimated }).eq('id', id)
        ));
      }
      
      let finalDrinks = updatedDrinks;
      if (toInsert.length > 0) {
        const { data } = await supabase.from('drink_entries').insert(toInsert).select();
        if (data) {
          finalDrinks = [...updatedDrinks, ...data.map((d: any) => ({
            id: d.id, drink_type: d.drink_type, name: d.name, unit: d.unit,
            estimated: d.estimated, acquired: 0, notes: '', is_manual: false
          }))];
        }
      }

      if (toDelete.length > 0 || toUpdate.length > 0 || toInsert.length > 0) {
        setDrinks(finalDrinks);
        if (refreshData) refreshData();
      }
    };

    syncList();
  }, [currentCalc, isLoaded, userId]);

  // ─── Settings persistence ─────────────────────────────────────────────────────
  const saveSettings = useCallback(async (gc: number, dur: number, ct: string) => {
    await supabase.from('drink_settings').upsert(
      { couple_id: userId, guest_count: gc, duration: dur, crowd_type: ct },
      { onConflict: 'couple_id' }
    );
  }, [userId]);

  // ─── CRUD ────────────────────────────────────────────────────────────────────
  const updateEstimated = async (id: string, value: number) => {
    const v = Math.max(0, value);
    // Important: mark as manual so the automatic sync doesn't overwrite it
    setDrinks(prev => prev.map(d => d.id === id ? { ...d, estimated: v, is_manual: true } : d));
    
    await supabase.from('drink_entries').update({ estimated: v, is_manual: true }).eq('id', id);
    if (refreshData) refreshData();
  };

  const resetToAuto = async (drink: DrinkEntry) => {
    const auto = formulaFor(drink.drink_type, currentCalc);
    setDrinks(prev => prev.map(d => d.id === drink.id ? { ...d, estimated: auto, is_manual: false } : d));
    await supabase.from('drink_entries').update({ estimated: auto, is_manual: false }).eq('id', drink.id);
    if (refreshData) refreshData();
    toast.success('Reset to formula value');
  };

  const updateAcquired = async (id: string, value: number) => {
    const v = Math.max(0, value);
    setDrinks(prev => prev.map(d => d.id === id ? { ...d, acquired: v } : d));
    await supabase.from('drink_entries').update({ acquired: v }).eq('id', id);
  };

  const updateNotes = async (id: string, notes: string) => {
    setDrinks(prev => prev.map(d => d.id === id ? { ...d, notes } : d));
    await supabase.from('drink_entries').update({ notes }).eq('id', id);
  };

  const deleteDrink = async (id: string) => {
    const { error } = await supabase.from('drink_entries').delete().eq('id', id);
    if (!error) {
      setDrinks(prev => prev.filter(d => d.id !== id));
      if (refreshData) refreshData();
    }
    else toast.error('Failed to delete');
  };

  const recalculateCountRef = React.useRef(0);
  const recalculate = async () => {
    if (guestCount === 0 || duration === 0) {
      toast.error('Set guest count and duration first');
      return;
    }
    setIsRecalculating(true);
    
    // Increment the ref to trigger the sync useEffect again if needed
    // or we can just call our logic manually here.
    // For simplicity, we'll just clear manual flags if the user is forcing a full recalc
    const { error } = await supabase
      .from('drink_entries')
      .update({ is_manual: false })
      .eq('couple_id', userId)
      .neq('drink_type', 'custom');
    
    if (error) {
       toast.error('Recalc failed: ' + error.message);
    } else {
       // Refresh list to trigger the useEffect sync with new manual=false states
       const { data } = await supabase.from('drink_entries').select('*').eq('couple_id', userId).order('created_at');
       if (data) {
          setDrinks(data.map((d: any) => ({
            id: d.id, drink_type: d.drink_type || 'custom', name: d.name,
            unit: d.unit || 'Bottles', estimated: d.estimated ?? 0,
            acquired: d.acquired ?? 0, notes: d.notes || '', is_manual: d.is_manual ?? false,
          })));
          toast.success('List recalculated and synced from formula');
       }
    }
    setIsRecalculating(false);
  };

  const addCustomDrink = async () => {
    if (!customName.trim()) { toast.error('Enter a drink name'); return; }
    if (customEstimated <= 0) { toast.error('Estimated must be more than 0'); return; }

    // Try with is_manual first; fall back without it if column doesn't exist
    let result = await supabase.from('drink_entries').insert([{
      couple_id: userId,
      drink_type: 'custom',
      name: customName.trim(),
      unit: customUnit,
      estimated: customEstimated,
      acquired: 0,
      notes: customNotes,
      is_manual: true,
    }]).select().single();

    if (result.error) {
      result = await supabase.from('drink_entries').insert([{
        couple_id: userId,
        drink_type: 'custom',
        name: customName.trim(),
        unit: customUnit,
        estimated: customEstimated,
        acquired: 0,
        notes: customNotes,
      }]).select().single();
    }

    if (result.error) {
      toast.error('Failed to add: ' + result.error.message);
      return;
    }
    const data = result.data;
    setDrinks(prev => [...prev, {
      id: data.id, drink_type: 'custom', name: data.name,
      unit: data.unit, estimated: customEstimated, acquired: 0,
      notes: customNotes, is_manual: true,
    }]);
    setCustomName(''); setCustomUnit('Bottles'); setCustomEstimated(1); setCustomNotes('');
    setShowAddCustom(false);
    if (refreshData) refreshData();
    toast.success(`${data.name} added`);
  };

  const handleExport = () => {
    const headers = {
      name: 'Drink Name',
      drink_type: 'Type',
      unit: 'Unit',
      estimated: 'Estimated Quantity',
      acquired: 'Acquired Quantity',
      notes: 'Notes/Brand'
    };
    exportToCSV(drinks, 'Drink_Calculation_Export', headers);
    toast.success('Excel-compatible CSV exported');
  };

  // ─── Derived breakdown FROM the drink list (not abstract formula) ─────────────
  const breakdown = useMemo(() => {
    const wine = drinks.filter(d => WINE_TYPES.includes(d.drink_type));
    const beer = drinks.filter(d => BEER_TYPES.includes(d.drink_type));
    const spirits = drinks.filter(d => SPIRITS_TYPES.includes(d.drink_type));
    const soft = drinks.filter(d => SOFT_DRINKS_TYPES.includes(d.drink_type));
    const others = drinks.filter(d => 
      !WINE_TYPES.includes(d.drink_type) && 
      !BEER_TYPES.includes(d.drink_type) && 
      !SPIRITS_TYPES.includes(d.drink_type) &&
      !SOFT_DRINKS_TYPES.includes(d.drink_type)
    );

    const sum = (arr: DrinkEntry[]) => arr.reduce((s, d) => s + d.estimated, 0);
    return {
      wineTotal: sum(wine),
      beerTotal: sum(beer),
      spiritsTotal: sum(spirits),
      softTotal: sum(soft),
      othersTotal: sum(others),
    };
  }, [drinks]);

  // Total drinks = sum of ALL estimated in the list
  const totalEst = drinks.reduce((s, d) => s + d.estimated, 0);
  const totalAcq = drinks.reduce((s, d) => s + d.acquired, 0);
  const acqPct = totalEst > 0 ? Math.min(100, Math.round((totalAcq / totalEst) * 100)) : 0;

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const handleGuestChange = (v: number) => {
    const val = Math.max(0, v);
    setGuestCount(val);
    saveSettings(val, duration, crowdType);
  };
  const handleDurationChange = (v: number) => {
    const val = Math.max(0, v);
    setDuration(val);
    saveSettings(guestCount, val, crowdType);
  };
  const handleCrowdChange = (v: string) => {
    setCrowdType(v);
    saveSettings(guestCount, duration, v);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Drink Calculator</h2>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">Set your inputs — all estimates update automatically. Edit any row manually after.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-xl border-zinc-200 dark:border-zinc-800 dark:text-white"
          onClick={handleExport}
        >
          <FileDown className="mr-2 h-4 w-4" /> Export to Excel
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Guests', value: guestCount, bg: 'bg-blue-50 dark:bg-blue-500/10', fg: 'text-blue-700 dark:text-blue-400', Icon: Users },
          { label: 'Total Est.', value: totalEst, bg: 'bg-amber-50 dark:bg-amber-500/10', fg: 'text-amber-700 dark:text-amber-400', Icon: Wine },
          { label: 'Total Acq.', value: `${totalAcq} / ${totalEst}`, bg: 'bg-green-50 dark:bg-green-500/10', fg: 'text-green-700 dark:text-green-400', Icon: TrendingUp },
          { label: 'Acq. %', value: `${acqPct}%`, bg: 'bg-violet-50 dark:bg-violet-500/10', fg: 'text-violet-700 dark:text-violet-400', Icon: GlassWater },
        ].map(({ label, value, bg, fg, Icon }) => (
          <div key={label} className={`rounded-2xl p-4 ${bg}`}>
            <div className={`flex items-center gap-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider ${fg}`}>
              <Icon className="h-3.5 w-3.5" />{label}
            </div>
            <div className={`text-2xl font-bold ${fg}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 shadow-sm">
        <div className="flex justify-between text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
          <span>Overall Acquisition</span>
          <span className="text-zinc-900 dark:text-white">{totalAcq} acquired of {totalEst} estimated ({acqPct}%)</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="h-2.5 rounded-full bg-green-500 transition-all duration-500" style={{ width: `${acqPct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* ─── Left: Calculator + Breakdown ──────────────────────────────── */}
        <Card className="rounded-3xl border-none bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Guest count */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Guest Count</Label>
              <div className="flex items-center gap-2">
                <button className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white"
                  onClick={() => handleGuestChange(guestCount - 1)}>
                  <Minus className="h-4 w-4" />
                </button>
                <Input type="number" min={0} value={guestCount === 0 ? '' : guestCount}
                  placeholder="0"
                  onChange={e => handleGuestChange(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="h-10 rounded-xl border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-center text-lg font-bold dark:text-white" />
                <button className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white"
                  onClick={() => handleGuestChange(guestCount + 1)}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {propGuestCount > 0 && propGuestCount !== guestCount && (
                <button className="text-[10px] text-blue-500 dark:text-blue-400 hover:underline"
                  onClick={() => handleGuestChange(propGuestCount)}>
                  Use Guest CRM count ({propGuestCount})
                </button>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Event Duration (hours)</Label>
              <div className="flex items-center gap-2">
                <button className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white"
                  onClick={() => handleDurationChange(duration - 1)}>
                  <Minus className="h-4 w-4" />
                </button>
                <Input type="number" min={0} value={duration === 0 ? '' : duration}
                  placeholder="0"
                  onChange={e => handleDurationChange(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="h-10 rounded-xl border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-center text-lg font-bold dark:text-white" />
                <button className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white"
                  onClick={() => handleDurationChange(duration + 1)}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Crowd type */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Drinking Crowd</Label>
              <Select value={crowdType} onValueChange={handleCrowdChange}>
                <SelectTrigger className="h-12 rounded-xl border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-semibold dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-zinc-800">
                  <SelectItem value="light">Light (0.7 drinks/hr)</SelectItem>
                  <SelectItem value="average">Average (1.0 drinks/hr)</SelectItem>
                  <SelectItem value="heavy">Heavy (1.5 drinks/hr)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recalculate button */}
            <Button
              className="w-full rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50"
              onClick={recalculate}
              disabled={isRecalculating}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
              {isRecalculating ? 'Calculating…' : 'Recalculate Drink List'}
            </Button>

            {/* ── Drink Breakdown — group totals only ── */}
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 dark:text-zinc-500 mb-2">Drink Breakdown</p>

              {[
                { label: 'Soft Drinks', total: breakdown.softTotal,    icon: <GlassWater className="h-3.5 w-3.5" />, color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-100 dark:bg-blue-900/20'   },
                { label: 'Beer',        total: breakdown.beerTotal,    icon: <Beer className="h-3.5 w-3.5" />,       color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-100 dark:bg-amber-900/20'  },
                { label: 'Wine',        total: breakdown.wineTotal,    icon: <Wine className="h-3.5 w-3.5" />,       color: 'text-rose-600 dark:text-rose-400',   bg: 'bg-rose-100 dark:bg-rose-900/20'   },
                { label: 'Spirits',     total: breakdown.spiritsTotal, icon: <TrendingUp className="h-3.5 w-3.5" />, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/20' },
                { label: 'Others',      total: breakdown.othersTotal,  icon: <Plus className="h-3.5 w-3.5" />,       color: 'text-teal-600 dark:text-teal-400',   bg: 'bg-teal-100 dark:bg-teal-900/20'   },
              ].map(({ label, total, icon, color, bg }) => (
                <div key={label} className={`flex items-center justify-between rounded-xl px-3 py-2 ${bg}`}>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold ${color}`}>
                    {icon} {label}
                  </span>
                  <span className={`text-sm font-bold ${color}`}>{total}</span>
                </div>
              ))}

              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 flex justify-between text-xs font-bold text-zinc-900 dark:text-white mt-1">
                <span>Total Estimated</span>
                <span>{totalEst}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Right: Drink List ────────────────────────────────────────── */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Drink List</h3>
            <Button variant="outline" size="sm" className="rounded-xl border-zinc-200 dark:border-zinc-800 dark:text-white" onClick={() => setShowAddCustom(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Custom Drink
            </Button>
          </div>

          {/* Add custom drink form */}
          {showAddCustom && (
            <div className="rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-600">Add Custom Drink</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <Label className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Drink Name *</Label>
                  <Input placeholder="e.g. Cocktail Mixer" value={customName}
                    onChange={e => setCustomName(e.target.value)} className="rounded-xl mt-1 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Estimated (required) *</Label>
                  <Input type="number" min={1} placeholder="e.g. 10" 
                    value={customEstimated || ''}
                    onChange={e => setCustomEstimated(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="rounded-xl mt-1 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Unit</Label>
                  <Input placeholder="Bottles / Litres" value={customUnit}
                    onChange={e => setCustomUnit(e.target.value)} className="rounded-xl mt-1 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
                </div>
                <div className="col-span-2">
                  <Label className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Notes / Brand</Label>
                  <Input placeholder="e.g. Johnnie Walker Black" value={customNotes}
                    onChange={e => setCustomNotes(e.target.value)} className="rounded-xl mt-1 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" onClick={addCustomDrink}>Add Drink</Button>
                <Button size="sm" variant="ghost" className="rounded-xl text-zinc-500 dark:text-zinc-400"
                  onClick={() => { setShowAddCustom(false); setCustomName(''); setCustomEstimated(1); setCustomNotes(''); }}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-12 gap-2 px-4 text-[10px] uppercase tracking-widest font-bold text-zinc-400 dark:text-zinc-500">
            <div className="col-span-3">Drink</div>
            <div className="col-span-3 text-center">Estimated</div>
            <div className="col-span-3 text-center">Acquired / Total</div>
            <div className="col-span-2">Notes</div>
            <div className="col-span-1" />
          </div>

          {/* Filter out 0-quantity rows unless they are custom or being focused */}
          <div className="space-y-2">
            {drinks.filter(d => d.estimated > 0 || d.acquired > 0 || d.id === focusedRowId || d.drink_type === 'custom').map(drink => {
              const isComplete = drink.acquired >= drink.estimated && drink.estimated > 0;
              const pct = drink.estimated > 0 ? Math.min(100, Math.round((drink.acquired / drink.estimated) * 100)) : 0;
              const group = getGroup(drink.drink_type);

              const groupColors: Record<string, string> = {
                wine: 'text-rose-400',
                beer: 'text-amber-400',
                spirits: 'text-violet-400',
                soft_drinks: 'text-blue-400',
                others: 'text-teal-400',
              };

              return (
                <div key={drink.id}
                  className={`rounded-2xl border bg-white dark:bg-zinc-900 p-4 shadow-sm transition-all ${isComplete ? 'border-green-200 dark:border-green-500/20 bg-green-50/30 dark:bg-green-500/5' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'
                    }`}>
                  <div className="grid grid-cols-12 gap-2 items-center">

                    {/* Name */}
                    <div className="col-span-12 sm:col-span-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${groupColors[group]}`}>
                          {group}
                        </span>
                        {isComplete && <Badge className="rounded-full bg-green-500 px-1.5 py-0.5 text-[9px] dark:text-white">Done</Badge>}
                        {drink.is_manual && (
                          <Badge variant="outline" className="rounded-full px-1.5 py-0.5 text-[9px] border-amber-400 text-amber-600 dark:text-amber-400">
                            Custom
                          </Badge>
                        )}
                      </div>
                      <span className="font-semibold text-sm text-zinc-900 dark:text-white">{drink.name}</span>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{drink.unit}</p>
                    </div>

                    {/* Estimated */}
                    <div className="col-span-4 sm:col-span-3">
                      <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1 sm:hidden">Estimated</p>
                      <div className="flex items-center gap-1">
                        <button className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white"
                          onClick={() => updateEstimated(drink.id, drink.estimated - 1)}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <Input type="number" min={0} value={drink.id === focusedRowId && drink.estimated === 0 ? '' : drink.estimated}
                          onChange={e => {
                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                            updateEstimated(drink.id, val);
                          }}
                          onFocus={() => setFocusedRowId(drink.id)}
                          onBlur={() => {
                            setFocusedRowId(null);
                            if (drink.estimated === 0) {
                              toast.info(`${drink.name} hidden because quantity is 0.`);
                            }
                          }}
                          className="h-7 w-14 text-center text-sm font-bold rounded-lg border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white" />
                        <button className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white"
                          onClick={() => {
                               updateEstimated(drink.id, drink.estimated + 1);
                          }}>
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      {drink.is_manual && drink.drink_type !== 'custom' && (
                        <button className="mt-0.5 flex items-center gap-0.5 text-[9px] text-blue-400 dark:text-blue-500 hover:underline"
                          onClick={() => resetToAuto(drink)}>
                          <RefreshCw className="h-2.5 w-2.5" /> reset to formula
                        </button>
                      )}
                    </div>

                    {/* Acquired / Total */}
                    <div className="col-span-4 sm:col-span-3">
                      <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1 sm:hidden">Acquired / Total</p>
                     <div className="flex items-center gap-1">
                        <button className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white"
                          onClick={() => updateAcquired(drink.id, drink.acquired - 1)}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <div className="flex flex-col items-center min-w-[4rem]">
                          <span className={`text-sm font-bold leading-none ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-zinc-900 dark:text-white'}`}>
                            {drink.acquired}
                          </span>
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 leading-none">of {drink.estimated}</span>
                        </div>
                        <button className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white"
                          onClick={() => updateAcquired(drink.id, drink.acquired + 1)}>
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="col-span-12 sm:col-span-2 mt-2 sm:mt-0">
                      <Input
                        placeholder="Brand / notes…"
                        defaultValue={drink.notes}
                        onBlur={e => updateNotes(drink.id, e.target.value)}
                        className="h-8 rounded-lg text-xs border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white"
                      />
                    </div>

                    {/* Delete */}
                    <div className="col-span-4 sm:col-span-1 flex justify-end sm:justify-center">
                      <button className="h-7 w-7 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600"
                        onClick={() => deleteDrink(drink.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Per-row progress bar */}
                  {drink.estimated > 0 && (
                    <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${isComplete ? 'bg-green-500' : 'bg-zinc-400 dark:bg-zinc-700'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {drinks.length === 0 && !isLoaded && (
              <div className="flex h-32 items-center justify-center text-zinc-400 text-sm">
                Loading…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
