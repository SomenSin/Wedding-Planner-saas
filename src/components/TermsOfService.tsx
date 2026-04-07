import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft, FileText, Globe, Gavel, UserCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const TermsOfService: React.FC = () => {
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
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="text-5xl font-serif italic text-zinc-900 dark:text-white">Terms of Service</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 dark:text-zinc-500">Last Updated: April 7th, 2026</p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 pb-32">
        <div className="space-y-16">
          
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-stone-600 dark:text-zinc-300">
                <Globe className="h-4 w-4" />
              </div>
              <h2 className="text-2xl font-serif italic text-zinc-900 dark:text-white">Agreement to Terms</h2>
            </div>
            <div className="prose prose-stone dark:prose-invert max-w-none text-stone-600 dark:text-zinc-400 leading-relaxed space-y-4">
              <p>
                By accessing or using Vow Vantage, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service. These terms apply to all visitors, users, and others who access or use the Service.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-stone-600 dark:text-zinc-300">
                <UserCheck className="h-4 w-4" />
              </div>
              <h2 className="text-2xl font-serif italic text-zinc-900 dark:text-white">User Accounts</h2>
            </div>
            <div className="prose prose-stone dark:prose-invert max-w-none text-stone-600 dark:text-zinc-400 leading-relaxed space-y-4">
              <p>
                To access certain features of Vow Vantage, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-4">
                <li><strong>Security:</strong> Maintain the security of your password and identification.</li>
                <li><strong>Accuracy:</strong> Provide and maintain accurate, current, and complete information.</li>
                <li><strong>Responsibility:</strong> Accept all risks of unauthorized access to all information you provide to the Service.</li>
                <li><strong>Privacy:</strong> Understand that your account is private. Sharing account access is strictly prohibited.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-stone-600 dark:text-zinc-300">
                <Gavel className="h-4 w-4" />
              </div>
              <h2 className="text-2xl font-serif italic text-zinc-900 dark:text-white">Acceptable Use</h2>
            </div>
            <div className="prose prose-stone dark:prose-invert max-w-none text-stone-600 dark:text-zinc-400 leading-relaxed space-y-4">
              <p>
                Vow Vantage is designed for wedding planning. You agree not to use the Service for any purpose that is prohibited by these Terms or by law. Prohibited conduct includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Using the Service for any illegal or unauthorized purpose.</li>
                <li>Attempting to hack, destabilize, or adapt the Service and its code.</li>
                <li>Uploading malicious code or viruses.</li>
                <li>Compiling data from our service for any commercial purpose without our express written consent.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-6 text-center pt-8 border-t border-stone-200 dark:border-zinc-800">
            <p className="text-sm text-stone-500 dark:text-zinc-400 mb-8 italic">
              "Planning a wedding is a journey. We're here to make it elegant and effortless."
            </p>
            <div className="flex justify-center gap-6 text-[10px] uppercase tracking-widest font-bold">
              <Link to="/privacy" className="text-zinc-900 dark:text-white hover:underline transition-all">Privacy Policy</Link>
              <span className="text-stone-300 dark:text-zinc-700">|</span>
              <Link to="/login" className="text-stone-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all">Back to Sign In</Link>
            </div>
          </section>

        </div>

        {/* Footer Link */}
        <div className="mt-24 pt-12 border-t border-stone-200 dark:border-zinc-800 text-center">
          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 dark:text-zinc-500">
            © 2026 Vow Vantage. All Rights Reserved.
          </p>
        </div>
      </main>
    </div>
  );
};
