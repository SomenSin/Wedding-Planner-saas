import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export const LoginSplit: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Attempting authentication for:', email);
      
      if (!isLogin) {
        const { data: codeData, error: codeError } = await supabase
          .from('access_codes')
          .select('*')
          .eq('code', accessCode)
          .eq('status', 'active')
          .single();

        if (codeError || !codeData) {
          toast.error('Invalid or inactive access code. Please contact the administrator.');
          setIsLoading(false);
          return;
        }
      }

      // Add a timeout to the authentication call
      const authPromise = isLogin 
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ 
            email, 
            password,
            options: {
              data: {
                role: (email === 'somendrasing019@gmail.com' || email === 'somendrasingh019@gmail.com') ? 'admin' : 'couple'
              }
            }
          });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Authentication timed out. Please check your internet connection and Supabase configuration.')), 15000)
      );

      const result = await Promise.race([authPromise, timeoutPromise]) as any;
      const { error } = result;

      if (error) {
        console.error('Auth error returned:', error);
        
        if (error.message.includes('Email not confirmed')) {
          toast.error('Email not confirmed. Please check your inbox (and spam) for the verification link.', {
            description: 'You must verify your email before you can sign in.',
            duration: 6000,
          });
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid login credentials.', {
            description: 'Please check your email and password. If you haven\'t created an account yet, click "Request Access" below.',
            duration: 6000,
          });
        } else {
          toast.error(error.message);
        }
      } else {
        if (isLogin) {
          toast.success('Welcome back to VowVantage');
        } else {
          toast.success('Account created successfully!', {
            description: 'A verification link has been sent to your email. Please confirm it to complete your registration.',
            duration: 8000,
          });
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      console.error('Caught auth error:', err);
      toast.error(err.message || 'An unexpected error occurred. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white font-sans">
      {/* Left Side: Branding & Visuals (Luxury/Editorial vibe) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#0a0a0a] text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium tracking-[0.2em] uppercase">VowVantage</span>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-7xl font-light leading-[0.9] tracking-tighter mb-6"
          >
            Crafting <br />
            <span className="italic font-serif">Timeless</span> <br />
            Moments.
          </motion.h1>
          
          <p className="text-white/60 max-w-md text-lg font-light leading-relaxed">
            The premier platform for modern couples to manage every detail of their wedding with elegance and precision.
          </p>
        </div>

        {/* Decorative Element */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] text-white/40">
          <span>© 2026 VowVantage</span>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-stone-50/50">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => setIsLogin(true)}
                className={`text-[11px] uppercase tracking-widest font-bold pb-2 border-b-2 transition-all ${isLogin ? 'border-black text-black' : 'border-transparent text-stone-400'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`text-[11px] uppercase tracking-widest font-bold pb-2 border-b-2 transition-all ${!isLogin ? 'border-black text-black' : 'border-transparent text-stone-400'}`}
              >
                Request Access
              </button>
            </div>
            <h2 className="text-3xl font-serif italic mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-muted-foreground">
              {isLogin 
                ? 'Please enter your details to access your dashboard.' 
                : 'Join VowVantage to start planning your perfect day.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">
                Email Address
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="hello@vowvantage.com" 
                className="h-12 bg-white border-stone-200 focus:ring-black rounded-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">
                  Password
                </Label>
                {isLogin && (
                  <a href="#" className="text-[10px] uppercase tracking-widest font-bold hover:underline">Forgot?</a>
                )}
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="h-12 bg-white border-stone-200 focus:ring-black rounded-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">
                  Access Code
                </Label>
                <Input 
                  id="accessCode" 
                  type="text" 
                  placeholder="Enter your access code" 
                  className="h-12 bg-white border-stone-200 focus:ring-black rounded-none"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-none group transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-stone-200 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? (
                <>
                  Don't have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => setIsLogin(false)} 
                    className="font-bold text-black hover:underline"
                  >
                    Request Access
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => setIsLogin(true)} 
                    className="font-bold text-black hover:underline"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
