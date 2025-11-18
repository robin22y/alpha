'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Clock, Crown } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { getTrialDaysRemaining, hasProAccess } from '@/lib/proFeatures';

export default function TrialBanner() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const createdAt = useUserStore((state) => state.createdAt);
  const isPro = useUserStore((state) => state.isPro);
  const proExpiresAt = useUserStore((state) => state.proExpiresAt);
  const adminSettings = useUserStore((state) => state.adminSettings);

  useEffect(() => {
    setMounted(true);
    
    // Check if banner was dismissed recently
    const dismissedUntil = localStorage.getItem('zdebt_trial_banner_dismissed');
    if (dismissedUntil) {
      const dismissedTime = parseInt(dismissedUntil);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        setDismissed(true);
      }
    }
  }, []);

  if (!mounted || !createdAt) return null;

  const hasPro = hasProAccess({ createdAt, isPro, proExpiresAt, adminSettings });
  if (hasPro) return null; // Don't show if already PRO

  const daysRemaining = getTrialDaysRemaining({ createdAt, isPro, adminSettings });
  
  // Only show when 3 days or less remaining
  if (daysRemaining > 3 || daysRemaining <= 0) return null;
  
  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('zdebt_trial_banner_dismissed', Date.now().toString());
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slideUp">
      <div className="rounded-lg shadow-2xl p-4 text-white" style={{ 
        background: 'linear-gradient(to right, #37B24D, #2F9E44)'
      }}>
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded transition-all"
          aria-label="Dismiss"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Clock size={24} />
          </div>
          
          <div className="flex-1 pr-6">
            <p className="font-bold mb-1">
              {daysRemaining === 1 
                ? 'Last day of PRO trial!' 
                : `${daysRemaining} days left in trial`
              }
            </p>
            <p className="text-sm mb-3" style={{ color: '#D1FAE5' }}>
              Upgrade now to keep unlimited debts, analytics, and all PRO features.
            </p>
            
            <button
              onClick={() => router.push('/upgrade')}
              className="w-full py-2 bg-white rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
              style={{ color: '#2F9E44' }}
            >
              <Crown size={16} />
              View PRO Plans
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

