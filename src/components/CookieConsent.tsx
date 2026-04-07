import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user has already consented
    const hasConsented = localStorage.getItem('cookie-consent');
    if (!hasConsented) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  const handleReview = () => {
    navigate('/privacy');
    // We don't hide the banner yet, user should decide on policy
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:max-w-md"
        >
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-2xl p-6 rounded-3xl backdrop-blur-md">
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-lg">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Cookie Preferences</h3>
                  <button onClick={() => setIsVisible(false)} className="text-stone-400 hover:text-black dark:text-zinc-500 dark:hover:text-white transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed font-medium">
                  We use cookies to enhance your wedding planning experience, remember your theme choices, and keep your session secure. By continuing, you agree to our <span onClick={handleReview} className="text-black dark:text-white underline cursor-pointer decoration-stone-200 dark:decoration-zinc-700 underline-offset-4 hover:decoration-black dark:hover:decoration-white transition-all">Privacy Policy</span>.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <Button 
                    onClick={handleAccept} 
                    className="flex-1 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-zinc-900 hover:bg-black/90 dark:hover:bg-zinc-100 text-[10px] uppercase tracking-widest font-bold"
                  >
                    <Check className="h-3 w-3 mr-2" /> Accept All
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleDecline}
                    className="flex-1 h-10 rounded-xl border-stone-200 dark:border-zinc-800 text-[10px] uppercase tracking-widest font-bold dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800"
                  >
                    Manage
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
