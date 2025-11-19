'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Tv, ShoppingBag, TrendingDown, AlertCircle, Heart } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { formatCurrency, getCurrency, CurrencyInfo } from '@/lib/currency';
import PrivacyBadge from '@/components/PrivacyBadge';

export default function ChallengePage() {
  const router = useRouter();
  const [currency, setCurrencyState] = useState<CurrencyInfo | null>(null);
  const [step, setStep] = useState(1);
  const [customAmount, setCustomAmount] = useState<string>('');
  
  const habit = useUserStore((state) => state.habit);
  const setHabit = useUserStore((state) => state.setHabit);
  
  const onePercent = habit.onePercentAmount;
  
  useEffect(() => {
    setCurrencyState(getCurrency());
  }, []);

  // Step 1: Comparative examples
  const comparisons = [
    {
      icon: <Coffee size={32} />,
      item: '2-3 takeaway coffees',
      amount: onePercent,
      color: 'bg-yellow-100 text-yellow-700'
    },
    {
      icon: <Tv size={32} />,
      item: '1-2 streaming subscriptions',
      amount: onePercent,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      icon: <ShoppingBag size={32} />,
      item: 'One impulse purchase',
      amount: onePercent,
      color: 'bg-purple-100 text-purple-700'
    }
  ];

  const handleCommit = (amount?: number) => {
    if (amount) {
      setHabit(true, amount);
    } else {
      setHabit(true);
    }
    router.push('/onboarding/debts');
  };

  const handleSkip = () => {
    setHabit(false, undefined, 'declined_after_challenge');
    router.push('/onboarding/debts');
  };

  if (step === 1) {
    return (
      <div className="min-h-screen py-8 px-4" style={{ background: '#F5F5F7' }}>
        <PrivacyBadge />
        
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
              <Coffee size={48} className="text-yellow-700" />
            </div>
            
            <h1 className="text-3xl font-bold mb-3 text-black">
              Let's put {currency ? formatCurrency(onePercent, currency.code) : `$${onePercent.toFixed(2)}`} in perspective
            </h1>
            <p className="text-black">
              This is roughly equal to...
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {comparisons.map((comp, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${comp.color}`}>
                    {comp.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-black">{comp.item}</p>
                    <p className="text-sm text-black">per month</p>
                  </div>
                  <p className="text-xl font-bold text-black">
                    {currency ? formatCurrency(comp.amount, currency.code) : `$${comp.amount.toFixed(2)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-center text-black">
              <strong>Observation:</strong> Many people spend this amount on things they barely notice.
              <br />
              <span className="text-sm">Not judgment. Just comparison.</span>
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/onboarding/habit')}
              className="px-6 py-3 bg-gray-200 text-black rounded-lg font-semibold hover:bg-gray-300"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(2)}
              className="px-8 py-3 bg-passive-dark text-white rounded-lg font-semibold hover:bg-passive"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen py-8 px-4" style={{ background: '#F5F5F7' }}>
        <PrivacyBadge />
        
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
              <TrendingDown size={48} className="text-red-700" />
            </div>
            
            <h1 className="text-3xl font-bold mb-3 text-black">
              A reality check
            </h1>
            <p className="text-black">
              Not to pressure you. Just to consider.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="space-y-6">
              <div className="flex gap-4">
                <AlertCircle className="text-orange-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <p className="font-semibold mb-2 text-black">If improving by {currency ? formatCurrency(onePercent, currency.code) : `$${onePercent.toFixed(2)}`}/month feels difficult...</p>
                  <p className="text-black text-sm">
                    ...then changing your financial situation significantly might be harder.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <AlertCircle className="text-orange-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <p className="font-semibold mb-2 text-black">Progress requires capacity to change</p>
                  <p className="text-black text-sm">
                    Small improvements create momentum. Without them, movement forward can stall.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <AlertCircle className="text-orange-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <p className="font-semibold mb-2 text-black">This isn't about sacrifice</p>
                  <p className="text-black text-sm">
                    It's about demonstrating (to yourself) that you can improve things. Even by 1%.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
            <p className="text-center font-semibold text-black mb-2">
              You choose.
            </p>
            <p className="text-center text-sm text-black">
              This is observation, not judgment. Only you know your situation.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-gray-200 text-black rounded-lg font-semibold hover:bg-gray-300"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-8 py-3 bg-passive-dark text-white rounded-lg font-semibold hover:bg-passive"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen py-8 px-4" style={{ background: '#F5F5F7' }}>
        <PrivacyBadge />
        
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
              <Heart size={48} className="text-purple-700" />
            </div>
            
            <h1 className="text-3xl font-bold mb-3 text-black">
              Life moments
            </h1>
            <p className="text-black">
              Why people choose to track this
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="font-semibold mb-2 text-black">🎂 Family birthdays</p>
              <p className="text-sm text-black">
                Ability to buy meaningful gifts without stress
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="font-semibold mb-2 text-black">🚗 Unexpected repairs</p>
              <p className="text-sm text-black">
                Not panicking when the car breaks down
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="font-semibold mb-2 text-black">😌 Mental peace</p>
              <p className="text-sm text-black">
                Sleeping better without money anxiety
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="font-semibold mb-2 text-black">✨ Life opportunities</p>
              <p className="text-sm text-black">
                Saying "yes" to experiences that matter
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="font-semibold mb-2 text-black">🎯 Your goal</p>
              <p className="text-sm text-black">
                Actually achieving what you came here for
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 mb-6">
            <p className="text-center text-sm text-black">
              These aren't promises or guarantees. Just things people mention 
              when they improve their situation. Your experience may differ.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-gray-200 text-black rounded-lg font-semibold hover:bg-gray-300"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-8 py-3 bg-passive-dark text-white rounded-lg font-semibold hover:bg-passive"
            >
              Make My Choice
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Final choice
  return (
    <div className="min-h-screen py-8 px-4" style={{ background: '#F5F5F7' }}>
      <PrivacyBadge />
      
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3 text-black">
            Your final choice
          </h1>
          <p className="text-black">
            No wrong answer. You decide.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleCommit(onePercent)}
            className="w-full p-6 rounded-lg border-2 border-passive bg-passive-light/20 hover:shadow-lg transition-all text-left"
          >
            <p className="font-bold text-xl mb-2 text-passive-dark">
              ✓ Yes, I'll improve by 1% (minimum)
            </p>
              <p className="text-black mb-2">
              {currency ? formatCurrency(onePercent, currency.code) : `$${onePercent.toFixed(2)}`}/month commitment
            </p>
            <p className="text-sm text-black">
              I'll find ways to earn more or spend less
            </p>
          </button>

          <button
            onClick={() => {}}
            className="w-full p-6 rounded-lg border-2 border-goal bg-white hover:border-goal-dark hover:shadow-lg transition-all text-left"
          >
            <p className="font-bold text-xl mb-2 text-black">
              Different amount (minimum 1%)
            </p>
            <div className="relative mt-3 mb-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black">
                {currency?.symbol || '$'}
              </span>
               <input
                 type="text"
                 inputMode="decimal"
                 value={customAmount}
                 onChange={(e) => {
                   // Allow free typing - only filter non-numeric characters
                   const value = e.target.value.replace(/[^\d.]/g, '');
                   setCustomAmount(value);
                 }}
                 placeholder={`Minimum: ${currency ? formatCurrency(onePercent, currency.code) : `$${onePercent.toFixed(2)}`}`}
                 className="w-full pl-10 pr-4 py-3 text-lg border-2 border-goal rounded focus:outline-none text-black"
               />
            </div>
            <p className="text-xs mb-2 text-gray-600">
              Minimum: {currency ? formatCurrency(onePercent, currency.code) : `$${onePercent.toFixed(2)}`}/month (1% of income)
            </p>
            {customAmount && parseFloat(customAmount) >= onePercent && (
              <button
                onClick={() => handleCommit(parseFloat(customAmount))}
                className="w-full mt-2 py-2 bg-goal text-white rounded font-semibold hover:bg-goal-dark transition-all"
              >
                Commit to {currency ? formatCurrency(parseFloat(customAmount), currency.code) : `$${parseFloat(customAmount).toFixed(2)}`}/month
              </button>
            )}
          </button>

          <button
            onClick={handleSkip}
            className="w-full p-6 rounded-lg border-2 border-gray-300 bg-white hover:border-gray-400 hover:shadow transition-all text-left"
          >
            <p className="font-bold text-xl mb-2 text-black">
              Skip this step
            </p>
            <p className="text-sm text-black">
              I'll work with what I have right now
            </p>
          </button>
        </div>

        <div className="text-center text-xs text-black">
          <p>This is about behavioral habits, not financial advice.</p>
        </div>
      </div>
    </div>
  );
}

