import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft, ShieldCheck, Cookie, Lock, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-stone-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-zinc-900 dark:text-white" />
            <span className="text-lg font-serif italic text-zinc-900 dark:text-white">Vow Vantage</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="text-[10px] uppercase tracking-widest font-bold text-stone-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-5xl font-serif italic text-zinc-900 dark:text-white">Privacy Policy</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 dark:text-zinc-500">Last Updated: April 7th, 2026</p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 pb-32">
        <div className="space-y-16">
          
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-stone-600 dark:text-zinc-300">
                <UserCheck className="h-4 w-4" />
              </div>
              <h2 className="text-2xl font-serif italic text-zinc-900 dark:text-white">Information We Collect</h2>
            </div>
            <div className="prose prose-stone dark:prose-invert max-w-none text-stone-600 dark:text-zinc-400 leading-relaxed space-y-4">
              <p>
                At Vow Vantage, we collect information to help you plan your perfect wedding. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Data:</strong> Email address, name, and wedding details (date, partner name) provided during registration.</li>
                <li><strong>Dashboard Data:</strong> Guest lists, budget details, vendor contracts, and logistics information you input into your private dashboard.</li>
                <li><strong>Usage Data:</strong> Information about how you interact with our platform to improve our features.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-stone-600 dark:text-zinc-300">
                <Cookie className="h-4 w-4" />
              </div>
              <h2 className="text-2xl font-serif italic text-zinc-900 dark:text-white">Cookie Policy</h2>
            </div>
            <div className="prose prose-stone dark:prose-invert max-w-none text-stone-600 dark:text-zinc-400 leading-relaxed space-y-4">
              <p>
                We use cookies and similar tracking technologies to enhance your experience:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Used for authentication and security (e.g., maintaining your login session).</li>
                <li><strong>Preference Cookies:</strong> Used to remember your choices (e.g., Dark Mode settings).</li>
                <li><strong>Analytics Cookies:</strong> Used to understand general usage patterns.</li>
              </ul>
              <p className="mt-4">
                You can manage your cookie preferences through the interactive banner that appears on your first visit or through your browser settings.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-stone-600 dark:text-zinc-300">
                <Lock className="h-4 w-4" />
              </div>
              <h2 className="text-2xl font-serif italic text-zinc-900 dark:text-white">Data Security</h2>
            </div>
            <div className="prose prose-stone dark:prose-invert max-w-none text-stone-600 dark:text-zinc-400 leading-relaxed space-y-4">
              <p>
                Your wedding data is deeply personal. We implement robust security measures to protect it:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All data is stored securely using Supabase (PostgreSQL) with industry-standard encryption.</li>
                <li>We use Row-Level Security (RLS) to ensure only you can access your dashboard data.</li>
                <li>We never sell your personal information to third-party vendors.</li>
              </ul>
            </div>
          </section>

        </div>

        {/* Footer Link */}
        <div className="mt-24 pt-12 border-t border-stone-200 dark:border-zinc-800 text-center">
          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 dark:text-zinc-500">
            Have questions? Contact us at <span className="text-black dark:text-white underline cursor-pointer">support@vowvantage.com</span>
          </p>
        </div>
      </main>
    </div>
  );
};
