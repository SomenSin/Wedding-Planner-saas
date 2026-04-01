import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export const GuestPortal = () => {
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md rounded-3xl border-border shadow-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-4xl font-serif italic text-foreground">Vow Vantage</CardTitle>
          <CardDescription className="uppercase tracking-widest text-[10px] font-bold mt-2">Guest Access Portal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Enter 6-Digit Code</Label>
            <Input
              placeholder="000000"
              maxLength={6}
              className="text-center text-3xl tracking-[0.5em] h-16 rounded-2xl border-border font-mono bg-muted"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <Button className="w-full h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAccess}>
            View Wedding Details
          </Button>
          
          <div className="pt-6 border-t border-border text-center">
            <Button variant="link" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground" onClick={() => navigate('/')}>
              Couple Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
