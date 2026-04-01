import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const GuestDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50/50 p-8">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <div className="flex justify-center">
            <Heart className="h-8 w-8 text-stone-300" />
          </div>
          <h1 className="text-6xl font-serif italic">The Wedding of <br /> Sarah & James</h1>
          <p className="uppercase tracking-[0.3em] text-xs font-bold text-stone-500">Saturday, June 20th, 2026</p>
        </header>

        <div className="grid gap-8">
          <Card className="rounded-none border-stone-200 shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif italic text-2xl">Itinerary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-6 border-l-2 border-stone-200 pl-6 relative">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-stone-200" />
                <div>
                  <span className="font-mono text-sm font-bold">4:00 PM</span>
                  <h3 className="font-bold uppercase tracking-wider text-sm mt-1">The Ceremony</h3>
                  <p className="text-muted-foreground text-sm">St. Mary's Chapel, Oak Ridge</p>
                </div>
              </div>
              <div className="flex gap-6 border-l-2 border-stone-200 pl-6 relative">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-stone-200" />
                <div>
                  <span className="font-mono text-sm font-bold">5:30 PM</span>
                  <h3 className="font-bold uppercase tracking-wider text-sm mt-1">Cocktail Hour</h3>
                  <p className="text-muted-foreground text-sm">The Garden Terrace</p>
                </div>
              </div>
              <div className="flex gap-6 border-l-2 border-stone-200 pl-6 relative">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-stone-200" />
                <div>
                  <span className="font-mono text-sm font-bold">7:00 PM</span>
                  <h3 className="font-bold uppercase tracking-wider text-sm mt-1">Dinner & Dancing</h3>
                  <p className="text-muted-foreground text-sm">The Grand Ballroom</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-stone-200 shadow-sm bg-stone-900 text-white">
            <CardHeader>
              <CardTitle className="font-serif italic text-2xl">RSVP</CardTitle>
              <CardDescription className="text-stone-400">Please confirm your attendance by May 1st.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-white text-black hover:bg-stone-100 rounded-none h-12 font-bold uppercase tracking-widest text-xs">
                Confirm Attendance
              </Button>
            </CardContent>
          </Card>
        </div>

        <footer className="text-center pt-12">
          <Button variant="link" className="text-[10px] uppercase tracking-widest font-bold text-stone-400" onClick={() => navigate('/guest/portal')}>
            Back to Portal
          </Button>
        </footer>
      </div>
    </div>
  );
};
