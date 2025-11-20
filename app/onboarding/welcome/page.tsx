
export const dynamic = 'force-static';
export const revalidate = 0;
'use client';

import { useEffect } from 'react';
import { Lock, Shield, Eye, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { initializeUser } from '@/lib/deviceId';
import { useUserStore } from '@/store/useUserStore';
import PrivacyBadge from '@/components/PrivacyBadge';

export default function WelcomePage() {
  const router = useRouter();
  const initializeFromLocalStorage = useUserStore((state) => state.initializeFromLocalStorage);

  useEffect(() => {
    // Initialize Zustand store with localStorage data
    initializeFromLocalStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = () => {
    // Initialize user (creates device ID + restore code)
    const { deviceID, restoreCode, currency } = initializeUser();
    
    console.log('User initialized:', { deviceID, restoreCode, currency });
    
    // Update store
    initializeFromLocalStorage();
    
    // Navigate to goal selection
    router.push('/onboarding/goal');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F5F5F7' }}>
      <PrivacyBadge />
      
      <div className="max-w-3xl w-full">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <Lock size={64} className="text-trust-dark" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black">
            Let's See Your
            <br />
            <span className="text-passive-dark">Debt-Free Date</span>
          </h1>
          
          <p className="text-xl text-black mb-2">
            Takes 3 minutes. Completely anonymous.
          </p>
          
          <p className="text-lg font-semibold text-trust-dark">
            No name. No email. No signup.
          </p>
        </div>

        {/* Privacy USPs */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <Lock size={40} className="mx-auto mb-3 text-trust-dark" />
            <h3 className="font-semibold mb-2 text-black">No Name Required</h3>
            <p className="text-sm text-black">
              Never asked. Never stored. Never needed.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <Shield size={40} className="mx-auto mb-3 text-trust-dark" />
            <h3 className="font-semibold mb-2 text-black">Data on YOUR Device</h3>
            <p className="text-sm text-black">
              Stored locally. You control it. Optional cloud sync.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <Eye size={40} className="mx-auto mb-3 text-trust-dark" />
            <h3 className="font-semibold mb-2 text-black">Anonymous if Hacked</h3>
            <p className="text-sm text-black">
              Just numbers. No way to identify you.
            </p>
          </div>
        </div>

        {/* What to expect */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-lg">
          <h3 className="font-semibold mb-4 text-center text-black">What happens next:</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-goal-light text-goal-dark flex items-center justify-center font-semibold">1</div>
              <p className="text-black">Choose your goal (reduce stress, build stability, etc.)</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-goal-light text-goal-dark flex items-center justify-center font-semibold">2</div>
              <p className="text-black">Pick your timeline (6 months to 5 years, or no pressure)</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-goal-light text-goal-dark flex items-center justify-center font-semibold">3</div>
              <p className="text-black">Enter your debt details (we'll keep it simple)</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-passive text-white flex items-center justify-center font-semibold">4</div>
              <p className="text-black font-semibold">See your debt-free date! 🎉</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={handleStart}
            className="inline-flex items-center gap-3 bg-passive-dark text-white text-xl px-8 py-4 rounded-lg font-semibold hover:bg-passive shadow-lg hover:shadow-xl transition-all"
          >
            See Your Date
            <ArrowRight size={24} />
          </button>
          
          <p className="text-sm text-black mt-4">
            Takes 3 minutes • No credit check • For planning purposes only
          </p>
        </div>

        {/* Trust signal */}
        <div className="mt-12 text-center text-sm text-black">
          <p>🔒 Your data never leaves your device unless you choose cloud storage (PRO)</p>
        </div>
      </div>
    </div>
  );
}

