import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OnboardingDialogProps {
  isOpen: boolean;
  onSubmit: (details: any) => void;
}

export const OnboardingDialog: React.FC<OnboardingDialogProps> = ({ isOpen, onSubmit }) => {
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
        className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white mb-4">
            <Heart className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-serif italic text-zinc-900">Welcome to Vow Vantage</h2>
          <p className="text-zinc-500 mt-2">Let's set up your wedding dashboard</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest font-bold text-zinc-500">Your Name</Label>
            <Input 
              value={details.couple_name}
              onChange={(e) => setDetails({ ...details, couple_name: e.target.value })}
              placeholder="Enter your name"
              className="rounded-xl border-zinc-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest font-bold text-zinc-500">Partner's Name</Label>
            <Input 
              value={details.partner_name}
              onChange={(e) => setDetails({ ...details, partner_name: e.target.value })}
              placeholder="Enter partner's name"
              className="rounded-xl border-zinc-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest font-bold text-zinc-500">Wedding Date</Label>
            <Input 
              type="date"
              value={details.wedding_date}
              onChange={(e) => setDetails({ ...details, wedding_date: e.target.value })}
              className="rounded-xl border-zinc-200"
            />
          </div>
        </div>

        <Button 
          className="w-full mt-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 h-12 text-lg font-serif italic"
          onClick={() => onSubmit(details)}
          disabled={!details.couple_name || !details.partner_name || !details.wedding_date}
        >
          Start Planning
        </Button>
      </motion.div>
    </div>
  );
};
