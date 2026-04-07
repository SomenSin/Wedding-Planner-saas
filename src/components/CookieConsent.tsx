import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDetailed, setIsDetailed] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    functional: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie-consent-settings');
    if (!savedConsent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSave = (all = false) => {
    const settings = all 
      ? { essential: true, analytics: true, functional: true }
      : preferences;
    
    localStorage.setItem('cookie-consent-settings', JSON.stringify(settings));
    localStorage.setItem('cookie-consent', all ? 'accepted' : 'custom');
    setIsVisible(false);
  };

  const handleReview = () => {
    navigate('/privacy');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:max-w-md w-[calc(100%-3rem)] md:w-full"
        >
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-2xl p-6 rounded-3xl backdrop-blur-md overflow-hidden transition-all duration-500">
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-lg">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white">
                    {isDetailed ? 'Privacy Settings' : 'Cookie Preferences'}
                  </h3>
                  <button onClick={() => setIsVisible(false)} className="text-stone-400 hover:text-black dark:text-zinc-500 dark:hover:text-white transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {!isDetailed ? (
                    <motion.div
                      key="summary"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-4"
                    >
                      <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed font-medium">
                        We use cookies to enhance your wedding planning experience, remember your theme choices, and keep your session secure. By continuing, you agree to our <span onClick={handleReview} className="text-black dark:text-white underline cursor-pointer decoration-stone-200 dark:decoration-zinc-700 underline-offset-4 hover:decoration-black dark:hover:decoration-white transition-all">Privacy Policy</span>.
                      </p>
                      <div className="flex items-center gap-3 pt-2">
                        <Button 
                          onClick={() => handleSave(true)} 
                          className="flex-1 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-zinc-900 hover:bg-black/90 dark:hover:bg-zinc-100 text-[10px] uppercase tracking-widest font-bold"
                        >
                          <Check className="h-3 w-3 mr-2" /> Accept All
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsDetailed(true)}
                          className="flex-1 h-10 rounded-xl border-stone-200 dark:border-zinc-800 text-[10px] uppercase tracking-widest font-bold dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800"
                        >
                          Manage
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="detailed"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Essential */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/50">
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest dark:text-white">Essential</p>
                            <p className="text-[9px] text-stone-400 dark:text-zinc-500">Security & Sign-in</p>
                          </div>
                          <div className="h-5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                            <Shield className="h-3 w-3 text-stone-400 dark:text-zinc-500" />
                          </div>
                        </div>

                        {/* Analytics */}
                        <div 
                          onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                          className="flex items-center justify-between p-3 rounded-2xl border border-stone-100 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/30 cursor-pointer transition-all"
                        >
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest dark:text-white">Analytics</p>
                            <p className="text-[9px] text-stone-400 dark:text-zinc-500">Usage & Performance</p>
                          </div>
                          <div className={`h-5 w-10 rounded-full transition-colors relative ${preferences.analytics ? 'bg-black dark:bg-white' : 'bg-stone-200 dark:bg-zinc-800'}`}>
                            <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${preferences.analytics ? 'right-1 bg-white dark:bg-zinc-900' : 'left-1 bg-stone-400'}`} />
                          </div>
                        </div>

                        {/* Functional */}
                        <div 
                          onClick={() => setPreferences(p => ({ ...p, functional: !p.functional }))}
                          className="flex items-center justify-between p-3 rounded-2xl border border-stone-100 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/30 cursor-pointer transition-all"
                        >
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest dark:text-white">Functional</p>
                            <p className="text-[9px] text-stone-400 dark:text-zinc-500">Theme & Settings</p>
                          </div>
                          <div className={`h-5 w-10 rounded-full transition-colors relative ${preferences.functional ? 'bg-black dark:bg-white' : 'bg-stone-200 dark:bg-zinc-800'}`}>
                            <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${preferences.functional ? 'right-1 bg-white dark:bg-zinc-900' : 'left-1 bg-stone-400'}`} />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <Button 
                          onClick={() => handleSave(false)} 
                          className="flex-1 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-zinc-900 hover:bg-black/90 dark:hover:bg-zinc-100 text-[10px] uppercase tracking-widest font-bold"
                        >
                          Save Choices
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => setIsDetailed(false)}
                          className="flex-1 h-10 rounded-xl text-[10px] uppercase tracking-widest font-bold dark:text-zinc-500 hover:bg-stone-50 dark:hover:bg-zinc-800"
                        >
                          Back
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
