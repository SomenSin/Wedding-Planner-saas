import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import { FeedbackFAB } from '@/components/FeedbackFAB';
import { toast } from 'sonner';
import { useStore } from '@/store/useStore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { LoginSplit } from '@/components/LoginSplit';
import { AdminDashboard } from '@/components/AdminDashboard';
import { CoupleDashboard } from '@/features/dashboard/CoupleDashboard';
import { GuestPortal } from '@/features/guest/GuestPortal';
import { GuestDashboard } from '@/features/guest/GuestDashboard';
import { motion, AnimatePresence } from 'motion/react';

// --- Main App ---

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [isConfigured, setIsConfigured] = useState(true);

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
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-8 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-serif italic">Configuration Required</h1>
          <p className="text-muted-foreground">
            Please set <code className="bg-stone-200 px-1 rounded">VITE_SUPABASE_URL</code> and{' '}
            <code className="bg-stone-200 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> in your
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
              ? <CoupleDashboard isAdmin={isAdmin} userEmail={session.user.email || ''} />
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
