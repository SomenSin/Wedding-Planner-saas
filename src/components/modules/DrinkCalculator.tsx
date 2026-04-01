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
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-zinc-900 text-white shadow-xl">
          <Wine className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-3xl font-bold tracking-tight">Smart Drink Calculator</h2>
        <p className="mt-2 text-zinc-500">Calculate exactly how much alcohol to buy for your wedding.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Input Card */}
        <Card className="col-span-1 rounded-3xl border-none bg-white shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-900">Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Guest Count</Label>
              <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-4">
                <Users className="h-5 w-5 text-zinc-400" />
                <span className="text-xl font-bold text-zinc-900">{guestCount}</span>
                <span className="text-xs text-zinc-400">From CRM</span>
              </div>
            </div>

            <div className="space-y-2">
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
