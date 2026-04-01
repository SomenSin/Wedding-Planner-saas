import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const GuestDashboard = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <div className="flex justify-center">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-6xl font-serif italic text-foreground">The Wedding of <br /> Sarah & James</h1>
          <p className="uppercase tracking-[0.3em] text-xs font-bold text-muted-foreground">Saturday, June 20th, 2026</p>
        </header>

        <div className="grid gap-8">
          <Card className="rounded-3xl border-border shadow-sm bg-card transition-colors">
            <CardHeader>
              <CardTitle className="font-serif italic text-2xl text-foreground">Itinerary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-6 border-l-2 border-border pl-6 relative">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-border" />
                <div>
                  <span className="font-mono text-sm font-bold text-foreground">4:00 PM</span>
                  <h3 className="font-bold uppercase tracking-wider text-sm mt-1 text-foreground">The Ceremony</h3>
                  <p className="text-muted-foreground text-sm">St. Mary's Chapel, Oak Ridge</p>
                </div>
              </div>
              <div className="flex gap-6 border-l-2 border-border pl-6 relative">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-border" />
                <div>
                  <span className="font-mono text-sm font-bold text-foreground">5:30 PM</span>
                  <h3 className="font-bold uppercase tracking-wider text-sm mt-1 text-foreground">Cocktail Hour</h3>
                  <p className="text-muted-foreground text-sm">The Garden Terrace</p>
                </div>
              </div>
              <div className="flex gap-6 border-l-2 border-border pl-6 relative">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-border" />
                <div>
                  <span className="font-mono text-sm font-bold text-foreground">7:00 PM</span>
                  <h3 className="font-bold uppercase tracking-wider text-sm mt-1 text-foreground">Dinner & Dancing</h3>
                  <p className="text-muted-foreground text-sm">The Grand Ballroom</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border shadow-sm bg-primary text-primary-foreground transition-colors overflow-hidden">
            <CardHeader>
              <CardTitle className="font-serif italic text-2xl">RSVP</CardTitle>
              <CardDescription className="text-primary-foreground/70">Please confirm your attendance by May 1st.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-background text-foreground hover:bg-background/90 rounded-2xl h-12 font-bold uppercase tracking-widest text-xs">
                Confirm Attendance
              </Button>
            </CardContent>
          </Card>
        </div>

        <footer className="text-center pt-12">
          <Button variant="link" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground" onClick={() => window.location.href = '/guest/portal'}>
            Back to Portal
          </Button>
        </footer>
      </div>
    </div>
  );
};
