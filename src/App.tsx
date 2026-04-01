import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { LoginSplit } from '@/components/LoginSplit';
import { GuestPortal } from '@/features/guest/GuestPortal';
import { GuestDashboard } from '@/features/guest/GuestDashboard';
import { CoupleDashboard } from '@/features/dashboard/CoupleDashboard';

export default function App() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isConfigured, setIsConfigured] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();
        
        if (!error && data) {
          setUserRole(data.role);
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
      }
    };

    const checkConfig = () => {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!url || !key) {
        setIsConfigured(false);
        return false;
      }
      return true;
    };

    if (checkConfig()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          fetchUserRole(session.user.id);
        }
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session?.user) {
          fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-12 w-12 animate-spin text-zinc-300" />
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
        <div className="max-w-md w-full bg-white p-8 border border-stone-200 shadow-sm text-center">
          <h2 className="text-2xl font-serif italic mb-4">Configuration Required</h2>
          <p className="text-sm text-stone-500 mb-6">
            Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables to begin.
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = userRole === 'super_admin' || session?.user?.user_metadata?.role === 'super_admin';

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route 
          path="/" 
          element={session ? <Navigate to="/dashboard" replace /> : <LoginSplit />} 
        />
        <Route 
          path="/dashboard" 
          element={session ? <CoupleDashboard isAdmin={isAdmin} userEmail={session.user.email} /> : <Navigate to="/" replace />} 
        />
        
        {/* Guest Routes */}
        <Route path="/guest/portal" element={<GuestPortal />} />
        <Route path="/guest/dashboard" element={<GuestDashboard />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-center" />
    </Router>
  );
}
