'use client';

import { useRouter } from 'next/navigation';
import { Lock, Shield, Calendar, ArrowRight, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { initializeUser } from '@/lib/deviceId';

// Lazy load PrivacyBadge
const PrivacyBadge = dynamic(() => import('@/components/PrivacyBadge'), {
  ssr: false,
});

type LifeStage = 'young' | 'midlife' | 'older';

export default function LandingPage() {
  const router = useRouter();
  const [selectedStage, setSelectedStage] = useState<LifeStage | null>(null);

  // Hidden admin access: long press counter
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pressCountRef = useRef(0);
  const lastPressTimeRef = useRef(0);
  const isLongPressingRef = useRef(false);
  const pressStartTimeRef = useRef(0);
  const isPressingRef = useRef(false);
  const LONG_PRESS_DURATION = 2000; // 2 seconds
  const REQUIRED_PRESSES = 3;
  const PRESS_WINDOW = 5000; // 5 seconds to complete all presses

  const handleStart = () => {
    // Initialize user
    const { deviceID, restoreCode, currency } = initializeUser();
    console.log('User initialized:', { deviceID, restoreCode, currency });
    
    // Navigate to welcome
    router.push('/onboarding/welcome');
  };

  // Hidden admin access handler
  const handleLongPressStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    pressStartTimeRef.current = now;
    isPressingRef.current = true;
    
    // Reset if too much time passed since last press
    if (lastPressTimeRef.current > 0 && now - lastPressTimeRef.current > PRESS_WINDOW) {
      pressCountRef.current = 0;
    }
    
    // Start timer for long press detection
    longPressTimerRef.current = setTimeout(() => {
      // Check if we're still pressing
      if (isPressingRef.current) {
        // Long press completed!
        pressCountRef.current++;
        lastPressTimeRef.current = Date.now();
        
        console.log(`Long press ${pressCountRef.current} of ${REQUIRED_PRESSES} detected`);
        
        // Check if we've reached the required number of presses
        if (pressCountRef.current >= REQUIRED_PRESSES) {
          // Reset counter
          pressCountRef.current = 0;
          lastPressTimeRef.current = 0;
          isLongPressingRef.current = true;
          isPressingRef.current = false;
          
          console.log('Admin access triggered!');
          
          // Navigate to admin (password screen will show)
          router.push('/admin');
          
          // Reset flag after navigation
          setTimeout(() => {
            isLongPressingRef.current = false;
          }, 1000);
        }
      }
    }, LONG_PRESS_DURATION);
  };

  const handleLongPressEnd = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    isPressingRef.current = false;
    
    // Clear timer if user releases before long press completes
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, white, #B2F2BB, #74C0FC)' }}>
      <PrivacyBadge />
      
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <button
            onMouseDown={(e) => {
              handleLongPressStart(e);
            }}
            onMouseUp={(e) => {
              handleLongPressEnd(e);
            }}
            onTouchStart={(e) => {
              handleLongPressStart(e);
            }}
            onTouchEnd={(e) => {
              handleLongPressEnd(e);
            }}
            className="text-2xl font-bold transition-all cursor-pointer"
            style={{ color: '#37B24D' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#2F9E44'}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#37B24D';
              handleLongPressEnd();
            }}
          >
            zdebt
          </button>
          <div className="flex items-center gap-2 text-sm" style={{ color: '#000000' }}>
            <Lock size={16} style={{ color: '#69DB7C' }} />
            <span>100% Anonymous</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: '#000000' }}>
            When Could You Be
            <br />
            <span style={{ color: '#37B24D' }}>Debt-Free?</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-4" style={{ color: '#000000' }}>
            Get your personalized target date.
          </p>
          
          <p className="text-lg mb-8" style={{ color: '#000000' }}>
            Anonymous • Private • No signup required
          </p>

          {/* Privacy USPs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm" style={{ color: '#000000' }}>
              <Lock size={18} style={{ color: '#69DB7C' }} />
              <span>No name required</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm" style={{ color: '#000000' }}>
              <Shield size={18} style={{ color: '#69DB7C' }} />
              <span>Data stays on your device</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm" style={{ color: '#000000' }}>
              <Calendar size={18} style={{ color: '#4DABF7' }} />
              <span>See your date in 3 minutes</span>
            </div>
          </div>

          {/* Quick Start CTA */}
          <button
            onClick={handleStart}
            className="inline-flex items-center gap-3 text-white text-xl px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all mb-8"
            style={{ backgroundColor: '#37B24D' }}
          >
            See Your Date
            <ArrowRight size={24} />
          </button>
          <p className="text-xs" style={{ color: '#000000' }}>
            For planning purposes only. Not financial advice.
          </p>
        </div>
      </section>

      {/* Life Stage Selection */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4" style={{ color: '#000000' }}>
            Which stage are you at?
          </h2>
          <p className="text-center mb-8" style={{ color: '#000000' }}>
            See how people like you are planning their path forward
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Young Adult */}
            <div 
              className={`bg-white rounded-lg p-6 shadow-lg cursor-pointer transition-all hover:shadow-xl ${
                selectedStage === 'young' ? 'ring-2' : ''
              }`}
              style={selectedStage === 'young' ? { borderColor: '#51CF66', borderWidth: '2px' } : {}}
              onClick={() => setSelectedStage('young')}
            >
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#000000' }}>Starting Out</h3>
              <p className="text-sm mb-4" style={{ color: '#000000' }}>Ages 22-35</p>
              
              <div className="space-y-2 text-sm" style={{ color: '#000000' }}>
                <p>💳 Student loans and credit cards</p>
                <p>🚗 Car payments adding up</p>
                <p>🏠 Wanting to save for a home</p>
                <p>💍 Planning major life events</p>
              </div>
              <div className="mt-6 pt-4 border-t text-sm">
                <p className="font-semibold mb-2" style={{ color: '#37B24D' }}>Common situation:</p>
                <p className="italic" style={{ color: '#000000' }}>
                  "I'm 28, earning £35K. Between student loans, credit cards, 
                  and my car, I'm paying £680/month. When can I be free?"
                </p>
              </div>
            </div>

            {/* Midlife */}
            <div 
              className={`bg-white rounded-lg p-6 shadow-lg cursor-pointer transition-all hover:shadow-xl ${
                selectedStage === 'midlife' ? 'ring-2' : ''
              }`}
              style={selectedStage === 'midlife' ? { borderColor: '#51CF66', borderWidth: '2px' } : {}}
              onClick={() => setSelectedStage('midlife')}
            >
              <div className="text-4xl mb-4">👨‍👩‍👧</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#000000' }}>Building Up</h3>
              <p className="text-sm mb-4" style={{ color: '#000000' }}>Ages 35-50</p>
              
              <div className="space-y-2 text-sm" style={{ color: '#000000' }}>
                <p>🏡 Mortgage feeling heavy</p>
                <p>👶 Raising kids, costs rising</p>
                <p>💼 Career established but stretched</p>
                <p>⚖️ Balancing multiple priorities</p>
              </div>
              <div className="mt-6 pt-4 border-t text-sm">
                <p className="font-semibold mb-2" style={{ color: '#37B24D' }}>Common situation:</p>
                <p className="italic" style={{ color: '#000000' }}>
                  "I'm 42 with two kids. Mortgage, car loans, some credit cards. 
                  Earning £55K but it disappears. When does it get easier?"
          </p>
        </div>
            </div>

            {/* Older */}
            <div 
              className={`bg-white rounded-lg p-6 shadow-lg cursor-pointer transition-all hover:shadow-xl ${
                selectedStage === 'older' ? 'ring-2' : ''
              }`}
              style={selectedStage === 'older' ? { borderColor: '#51CF66', borderWidth: '2px' } : {}}
              onClick={() => setSelectedStage('older')}
            >
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#000000' }}>Looking Ahead</h3>
              <p className="text-sm mb-4" style={{ color: '#000000' }}>Ages 50+</p>
              
              <div className="space-y-2 text-sm" style={{ color: '#000000' }}>
                <p>⏰ Time feeling more precious</p>
                <p>🏖️ Thinking about next chapter</p>
                <p>💰 Want to clear everything</p>
                <p>🧘 Peace of mind matters</p>
              </div>
              <div className="mt-6 pt-4 border-t text-sm">
                <p className="font-semibold mb-2" style={{ color: '#37B24D' }}>Common situation:</p>
                <p className="italic" style={{ color: '#000000' }}>
                  "I'm 54. Still have mortgage, some old debts. 
                  Want to retire at 65 completely clear. Is it realistic?"
                </p>
              </div>
            </div>
          </div>

          {/* CTA after selection */}
          {selectedStage && (
            <div className="text-center mt-8">
              <button
                onClick={handleStart}
                className="inline-flex items-center gap-3 text-white text-lg px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all"
                style={{ backgroundColor: '#37B24D' }}
              >
                See Your Debt-Free Date
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-12 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12" style={{ color: '#000000' }}>
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl" style={{ backgroundColor: '#74C0FC' }}>
                1️⃣
              </div>
              <h3 className="font-semibold mb-2" style={{ color: '#000000' }}>Enter Your Numbers</h3>
              <p className="text-sm" style={{ color: '#000000' }}>
                Total owed, monthly payments. Takes 2 minutes. No signup.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl" style={{ backgroundColor: '#74C0FC' }}>
                2️⃣
              </div>
              <h3 className="font-semibold mb-2" style={{ color: '#000000' }}>See Your Date</h3>
              <p className="text-sm" style={{ color: '#000000' }}>
                Get your debt-free date. See month-by-month breakdown.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl" style={{ backgroundColor: '#74C0FC' }}>
                3️⃣
              </div>
              <h3 className="font-semibold mb-2" style={{ color: '#000000' }}>Track Progress (Optional)</h3>
              <p className="text-sm" style={{ color: '#000000' }}>
                Update monthly. See how you're doing. Stay motivated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Emphasis */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto rounded-lg p-8" style={{ backgroundColor: '#B2F2BB' }}>
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#000000' }}>
            Why People Trust zdebt
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <Check className="flex-shrink-0" size={24} style={{ color: '#2F9E44' }} />
              <div>
                <p className="font-semibold mb-1" style={{ color: '#000000' }}>No name required</p>
                <p className="text-sm" style={{ color: '#000000' }}>
                  We never ask for your name. Ever.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Check className="flex-shrink-0" size={24} style={{ color: '#2F9E44' }} />
              <div>
                <p className="font-semibold mb-1" style={{ color: '#000000' }}>Data stays with you</p>
                <p className="text-sm" style={{ color: '#000000' }}>
                  Stored on your device. You control it.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Check className="flex-shrink-0" size={24} style={{ color: '#2F9E44' }} />
              <div>
                <p className="font-semibold mb-1" style={{ color: '#000000' }}>No credit check</p>
                <p className="text-sm" style={{ color: '#000000' }}>
                  Doesn't affect your credit score.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Check className="flex-shrink-0" size={24} style={{ color: '#2F9E44' }} />
              <div>
                <p className="font-semibold mb-1" style={{ color: '#000000' }}>Anonymous if hacked</p>
                <p className="text-sm" style={{ color: '#000000' }}>
                  Just numbers. No way to identify you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#000000' }}>
          Ready to See Your Date?
        </h2>
        <p className="text-xl mb-8" style={{ color: '#000000' }}>
          Takes 3 minutes. Completely anonymous.
        </p>
        <button
          onClick={handleStart}
          className="inline-flex items-center gap-3 text-white text-xl px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all"
          style={{ backgroundColor: '#37B24D' }}
        >
          Get Started (Free)
          <ArrowRight size={24} />
        </button>
        <p className="text-sm mt-4" style={{ color: '#000000' }}>
          No signup • No email • No credit check
        </p>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t text-center text-sm" style={{ color: '#000000' }}>
        <p className="mb-2">
          zdebt • Privacy-first planning tool
        </p>
        <p>
          For planning purposes only. Not financial advice. 
          Consult a qualified professional for financial decisions.
        </p>
      </footer>
    </div>
  );
}
