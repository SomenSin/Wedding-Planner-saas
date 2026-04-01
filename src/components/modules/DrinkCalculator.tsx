import React, { useState, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
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
  Calculator, 
  Users, 
  Clock, 
  TrendingUp,
  ShoppingCart,
  Download
} from 'lucide-react';

import { toast } from 'sonner';

interface DrinkCalculatorProps {
  guestCount: number;
}

export const DrinkCalculator: React.FC<DrinkCalculatorProps> = ({
  guestCount
}) => {
  const [duration, setDuration] = useState<number>(4);
  const [crowdType, setCrowdType] = useState<string>('average');

  const results = useMemo(() => {
    // Basic formula: 1 drink per person per hour
    // Average: 1.0, Light: 0.7, Heavy: 1.5
    const multiplier = crowdType === 'light' ? 0.7 : crowdType === 'heavy' ? 1.5 : 1.0;
    const totalDrinks = guestCount * duration * multiplier;

    // Standard distribution: 50% Wine, 30% Beer, 20% Liquor
    const wineDrinks = totalDrinks * 0.5;
    const beerDrinks = totalDrinks * 0.3;
    const liquorDrinks = totalDrinks * 0.2;

    // Conversions:
    // 1 bottle of wine = 5 glasses
    // 1 bottle of beer = 1 drink
    // 1 bottle of liquor (750ml) = 16-18 drinks
    return {
      totalDrinks: Math.round(totalDrinks),
      wine: {
        bottles: Math.ceil(wineDrinks / 5),
        red: Math.ceil((wineDrinks / 5) * 0.4),
        white: Math.ceil((wineDrinks / 5) * 0.4),
        rose: Math.ceil((wineDrinks / 5) * 0.2),
      },
      beer: {
        bottles: Math.ceil(beerDrinks),
        cases: Math.ceil(beerDrinks / 24),
      },
      liquor: {
        bottles: Math.ceil(liquorDrinks / 17),
      }
    };
  }, [guestCount, duration, crowdType]);

  return (
<<<<<<< HEAD
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-zinc-900 text-white shadow-xl">
          <Wine className="h-8 w-8" />
=======
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Drink Calculator</h2>
        <p className="mt-1 text-muted-foreground">Set your inputs — all estimates update automatically. Edit any row manually after.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Guests', value: guestCount, bg: 'bg-blue-50', fg: 'text-blue-700', Icon: Users },
          { label: 'Total Est.', value: totalEst, bg: 'bg-amber-50', fg: 'text-amber-700', Icon: Wine },
          { label: 'Total Acq.', value: `${totalAcq} / ${totalEst}`, bg: 'bg-green-50', fg: 'text-green-700', Icon: TrendingUp },
          { label: 'Acq. %', value: `${acqPct}%`, bg: 'bg-violet-50', fg: 'text-violet-700', Icon: GlassWater },
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
      <div className="rounded-2xl bg-card border border-border p-4 shadow-sm">
        <div className="flex justify-between text-sm font-semibold text-muted-foreground mb-2">
          <span>Overall Acquisition</span>
          <span className="text-foreground">{totalAcq} acquired of {totalEst} estimated ({acqPct}%)</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-muted">
          <div className="h-2.5 rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${acqPct}%` }} />
>>>>>>> cb0cbc8 (feat: complete dark mode refactor and branding refinement for Vow Vantage dashboard and admin interface)
        </div>
        <h2 className="mt-6 text-3xl font-bold tracking-tight">Smart Drink Calculator</h2>
        <p className="mt-2 text-zinc-500">Calculate exactly how much alcohol to buy for your wedding.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
<<<<<<< HEAD
        {/* Input Card */}
        <Card className="col-span-1 rounded-3xl border-none bg-white shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-900">Inputs</CardTitle>
=======
        {/* ─── Left: Calculator + Breakdown ──────────────────────────────── */}
        <Card className="rounded-3xl border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-foreground">Calculator</CardTitle>
>>>>>>> cb0cbc8 (feat: complete dark mode refactor and branding refinement for Vow Vantage dashboard and admin interface)
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
<<<<<<< HEAD
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Guest Count</Label>
              <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-4">
                <Users className="h-5 w-5 text-zinc-400" />
                <span className="text-xl font-bold text-zinc-900">{guestCount}</span>
                <span className="text-xs text-zinc-400">From CRM</span>
=======
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Guest Count</Label>
              <div className="flex items-center gap-2">
                <button className="h-10 w-10 rounded-xl bg-muted hover:bg-accent flex items-center justify-center"
                  onClick={() => handleGuestChange(guestCount - 1)}>
                  <Minus className="h-4 w-4" />
                </button>
                <Input type="number" min={0} value={guestCount === 0 ? '' : guestCount}
                  placeholder="0"
                  onChange={e => handleGuestChange(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="h-10 rounded-xl border-input bg-background text-center text-lg font-bold" />
                <button className="h-10 w-10 rounded-xl bg-muted hover:bg-accent flex items-center justify-center"
                  onClick={() => handleGuestChange(guestCount + 1)}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {propGuestCount > 0 && propGuestCount !== guestCount && (
                <button className="text-[10px] text-blue-500 hover:underline"
                  onClick={() => handleGuestChange(propGuestCount)}>
                  Use Guest CRM count ({propGuestCount})
                </button>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Event Duration (hours)</Label>
              <div className="flex items-center gap-2">
                <button className="h-10 w-10 rounded-xl bg-muted hover:bg-accent flex items-center justify-center"
                  onClick={() => handleDurationChange(duration - 1)}>
                  <Minus className="h-4 w-4" />
                </button>
                <Input type="number" min={0} value={duration === 0 ? '' : duration}
                  placeholder="0"
                  onChange={e => handleDurationChange(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="h-10 rounded-xl border-input bg-background text-center text-lg font-bold" />
                <button className="h-10 w-10 rounded-xl bg-muted hover:bg-accent flex items-center justify-center"
                  onClick={() => handleDurationChange(duration + 1)}>
                  <Plus className="h-4 w-4" />
                </button>
>>>>>>> cb0cbc8 (feat: complete dark mode refactor and branding refinement for Vow Vantage dashboard and admin interface)
              </div>
            </div>

            <div className="space-y-2">
<<<<<<< HEAD
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Event Duration (Hours)</Label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <Input 
                  type="number" 
                  placeholder="0"
                  value={duration === 0 ? '' : duration} 
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="h-14 rounded-2xl border-zinc-100 bg-zinc-50 pl-12 text-lg font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Drinking Crowd Type</Label>
              <Select value={crowdType} onValueChange={setCrowdType}>
                <SelectTrigger className="h-14 rounded-2xl border-zinc-100 bg-zinc-50 text-lg font-bold">
                  <SelectValue placeholder="Select type" />
=======
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Drinking Crowd</Label>
              <Select value={crowdType} onValueChange={handleCrowdChange}>
                <SelectTrigger className="h-12 rounded-xl border-input bg-background font-semibold">
                  <SelectValue />
>>>>>>> cb0cbc8 (feat: complete dark mode refactor and branding refinement for Vow Vantage dashboard and admin interface)
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="light">Light (0.7 drinks/hr)</SelectItem>
                  <SelectItem value="average">Average (1.0 drinks/hr)</SelectItem>
                  <SelectItem value="heavy">Heavy (1.5 drinks/hr)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

<<<<<<< HEAD
        {/* Results Card */}
        <Card className="col-span-1 rounded-3xl border-none bg-zinc-900 text-white shadow-xl lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800 pb-6">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400">Shopping List</CardTitle>
              <CardDescription className="text-zinc-500">Estimated totals for your event.</CardDescription>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800">
              <ShoppingCart className="h-6 w-6 text-zinc-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Wine className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Wine</span>
=======
            {/* Recalculate button */}
            <Button
              className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              onClick={recalculate}
              disabled={isRecalculating}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
              {isRecalculating ? 'Calculating…' : 'Recalculate Drink List'}
            </Button>

            {/* ── Drink Breakdown — group totals only ── */}
            <div className="rounded-2xl bg-muted/30 p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">Drink Breakdown</p>

              {[
                { label: 'Soft Drinks', total: breakdown.softTotal,    icon: <GlassWater className="h-3.5 w-3.5" />, color: 'text-blue-500',   bg: 'bg-blue-500/10'   },
                { label: 'Beer',        total: breakdown.beerTotal,    icon: <Beer className="h-3.5 w-3.5" />,       color: 'text-amber-500',  bg: 'bg-amber-500/10'  },
                { label: 'Wine',        total: breakdown.wineTotal,    icon: <Wine className="h-3.5 w-3.5" />,       color: 'text-rose-500',   bg: 'bg-rose-500/10'   },
                { label: 'Spirits',     total: breakdown.spiritsTotal, icon: <TrendingUp className="h-3.5 w-3.5" />, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                { label: 'Others',      total: breakdown.othersTotal,  icon: <Plus className="h-3.5 w-3.5" />,       color: 'text-teal-500',   bg: 'bg-teal-500/10'   },
              ].map(({ label, total, icon, color, bg }) => (
                <div key={label} className={`flex items-center justify-between rounded-xl px-3 py-2 ${bg}`}>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold ${color}`}>
                    {icon} {label}
                  </span>
                  <span className={`text-sm font-bold ${color}`}>{total}</span>
>>>>>>> cb0cbc8 (feat: complete dark mode refactor and branding refinement for Vow Vantage dashboard and admin interface)
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{results.wine.bottles}</div>
                  <div className="text-xs text-zinc-500">Total Bottles (750ml)</div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Red</span>
                    <span className="font-bold">{results.wine.red}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">White</span>
                    <span className="font-bold">{results.wine.white}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Rosé</span>
                    <span className="font-bold">{results.wine.rose}</span>
                  </div>
                </div>
              </div>

<<<<<<< HEAD
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Beer className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Beer</span>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{results.beer.bottles}</div>
                  <div className="text-xs text-zinc-500">Total Bottles / Cans</div>
                </div>
                <div className="mt-4 rounded-xl bg-zinc-800 p-3 text-center">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Approx. {results.beer.cases} Cases</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <GlassWater className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Liquor</span>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{results.liquor.bottles}</div>
                  <div className="text-xs text-zinc-500">Total Bottles (750ml)</div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-zinc-800 p-3 text-xs text-zinc-400">
                  <TrendingUp className="h-4 w-4" />
                  Includes mixers & garnishes
                </div>
              </div>
            </div>

            <div className="mt-12 rounded-2xl bg-zinc-800 p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Total Drinks Estimated</span>
                  <span className="text-4xl font-bold tracking-tighter">{results.totalDrinks}</span>
                </div>
                <Button 
                  className="bg-white text-zinc-900 hover:bg-zinc-100"
                  onClick={() => {
                    toast.success('Shopping list saved to your dashboard!');
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Save List
                </Button>
=======
              <div className="border-t border-border pt-2 flex justify-between text-xs font-bold text-foreground mt-1">
                <span>Total Estimated</span>
                <span>{totalEst}</span>
>>>>>>> cb0cbc8 (feat: complete dark mode refactor and branding refinement for Vow Vantage dashboard and admin interface)
              </div>
            </div>
          </CardContent>
        </Card>
<<<<<<< HEAD
=======

        {/* ─── Right: Drink List ────────────────────────────────────────── */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Drink List</h3>
            <Button variant="outline" size="sm" className="rounded-xl border-input bg-background" onClick={() => setShowAddCustom(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Custom Drink
            </Button>
          </div>

          {/* Add custom drink form */}
          {showAddCustom && (
            <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Add Custom Drink</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Drink Name *</Label>
                  <Input placeholder="e.g. Cocktail Mixer" value={customName}
                    onChange={e => setCustomName(e.target.value)} className="rounded-xl mt-1 border-input bg-background" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-zinc-400">Estimated (required) *</Label>
                  <Input type="number" min={1} placeholder="e.g. 10" value={customEstimated === 0 ? '' : customEstimated}
                    onChange={e => setCustomEstimated(Math.max(1, Number(e.target.value)))}
                    className="rounded-xl mt-1" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-zinc-400">Unit</Label>
                  <Input placeholder="Bottles / Litres" value={customUnit}
                    onChange={e => setCustomUnit(e.target.value)} className="rounded-xl mt-1" />
                </div>
                <div className="col-span-2">
                  <Label className="text-[10px] uppercase tracking-wider text-zinc-400">Notes / Brand</Label>
                  <Input placeholder="e.g. Johnnie Walker Black" value={customNotes}
                    onChange={e => setCustomNotes(e.target.value)} className="rounded-xl mt-1" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" onClick={addCustomDrink}>Add Drink</Button>
                <Button size="sm" variant="ghost" className="rounded-xl"
                  onClick={() => { setShowAddCustom(false); setCustomName(''); setCustomEstimated(1); setCustomNotes(''); }}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-12 gap-2 px-4 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            <div className="col-span-3">Drink</div>
            <div className="col-span-3 text-center">Estimated</div>
            <div className="col-span-3 text-center">Acquired / Total</div>
            <div className="col-span-2">Notes</div>
            <div className="col-span-1" />
          </div>

          {/* Rows — hide drinks where both estimated and acquired are 0 */}
          <div className="space-y-2">
            {drinks.filter(d => d.estimated > 0 || d.acquired > 0).map(drink => {
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
                  className={`rounded-2xl border bg-card p-4 shadow-sm transition-all ${isComplete ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-border hover:border-muted-foreground/30'
                    }`}>
                  <div className="grid grid-cols-12 gap-2 items-center">

                    {/* Name */}
                    <div className="col-span-12 sm:col-span-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${groupColors[group]}`}>
                          {group}
                        </span>
                        {isComplete && <Badge className="rounded-full bg-green-500 px-1.5 py-0.5 text-[9px]">Done</Badge>}
                        {drink.is_manual && (
                          <Badge variant="outline" className="rounded-full px-1.5 py-0.5 text-[9px] border-amber-400 text-amber-600">
                            Custom
                          </Badge>
                        )}
                      </div>
                      <span className="font-semibold text-sm text-foreground">{drink.name}</span>
                      <p className="text-[10px] text-muted-foreground">{drink.unit}</p>
                    </div>

                    {/* Estimated */}
                    <div className="col-span-4 sm:col-span-3">
                      <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 sm:hidden">Estimated</p>
                      <div className="flex items-center gap-1">
                        <button className="h-7 w-7 rounded-lg bg-muted hover:bg-accent flex items-center justify-center"
                          onClick={() => updateEstimated(drink.id, drink.estimated - 1)}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <Input type="number" min={0} value={drink.estimated}
                          onChange={e => updateEstimated(drink.id, Number(e.target.value))}
                          className="h-7 w-14 text-center text-sm font-bold rounded-lg border-input bg-background" />
                        <button className="h-7 w-7 rounded-lg bg-muted hover:bg-accent flex items-center justify-center"
                          onClick={() => updateEstimated(drink.id, drink.estimated + 1)}>
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      {drink.is_manual && drink.drink_type !== 'custom' && (
                        <button className="mt-0.5 flex items-center gap-0.5 text-[9px] text-blue-400 hover:underline"
                          onClick={() => resetToAuto(drink)}>
                          <RefreshCw className="h-2.5 w-2.5" /> reset to formula
                        </button>
                      )}
                    </div>

                    {/* Acquired / Total */}
                    <div className="col-span-4 sm:col-span-3">
                      <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 sm:hidden">Acquired / Total</p>
                      <div className="flex items-center gap-1">
                        <button className="h-7 w-7 rounded-lg bg-muted hover:bg-accent flex items-center justify-center"
                          onClick={() => updateAcquired(drink.id, drink.acquired - 1)}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <div className="flex flex-col items-center min-w-[4rem]">
                          <span className={`text-sm font-bold leading-none ${isComplete ? 'text-emerald-500' : 'text-foreground'}`}>
                            {drink.acquired}
                          </span>
                          <span className="text-[9px] text-muted-foreground leading-none">of {drink.estimated}</span>
                        </div>
                        <button className="h-7 w-7 rounded-lg bg-muted hover:bg-accent flex items-center justify-center"
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
                        className="h-8 rounded-lg text-xs border-input bg-background"
                      />
                    </div>

                    {/* Delete */}
                    <div className="col-span-4 sm:col-span-1 flex justify-end sm:justify-center">
                      <button className="h-7 w-7 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center"
                        onClick={() => deleteDrink(drink.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Per-row progress bar */}
                  {drink.estimated > 0 && (
                    <div className="mt-3 h-1.5 w-full rounded-full bg-muted">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${isComplete ? 'bg-emerald-500' : 'bg-primary/50'}`}
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
>>>>>>> cb0cbc8 (feat: complete dark mode refactor and branding refinement for Vow Vantage dashboard and admin interface)
      </div>
    </div>
  );
};
