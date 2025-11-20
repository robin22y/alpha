
export const dynamic = 'force-static';
export const revalidate = 0;
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, HelpCircle } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { formatCurrency, getCurrency, CurrencyInfo } from '@/lib/currency';
import PrivacyBadge from '@/components/PrivacyBadge';

export default function HabitPage() {
  const router = useRouter();
  const [currency, setCurrencyState] = useState<CurrencyInfo | null>(null);
  
  const finances = useUserStore((state) => state.finances);
  const habit = useUserStore((state) => state.habit);
  const setHabit = useUserStore((state) => state.setHabit);
  
  const [choice, setChoice] = useState<'yes' | 'no' | 'custom' | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showExplainer, setShowExplainer] = useState(false);
  const onePercent = habit.onePercentAmount || (finances.monthlyIncome * 0.01);
  
  useEffect(() => {
    setCurrencyState(getCurrency());
  }, []);

  const handleCommit = () => {
    if (choice === 'yes') {
      setHabit(true, onePercent);
      router.push('/onboarding/debts');
    } else if (choice === 'custom' && customAmount) {
      const amount = parseFloat(customAmount);
      if (amount >= onePercent) {
        setHabit(true, amount);
        router.push('/onboarding/debts');
      }
    } else if (choice === 'no') {
      // Go directly to challenge flow - no amount required
      router.push('/onboarding/habit/challenge');
    }
  };

  const handleSkip = () => {
    setHabit(false);
    router.push('/onboarding/debts');
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: '#F5F5F7' }}>
      <PrivacyBadge />
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-passive-light rounded-full mb-4">
            <TrendingUp size={48} className="text-passive-dark" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-black">
            The 1% Habit
          </h1>
          <p className="text-black text-lg">
            A small monthly improvement. Your choice how.
          </p>
        </div>

        {/* 1% Calculation */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
          <p className="text-black mb-2">
            1% of your monthly income is:
          </p>
          <p className="text-5xl font-bold text-passive-dark mb-4">
            {currency ? formatCurrency(onePercent, currency.code) : `$${onePercent.toFixed(2)}`}
          </p>
          <p className="text-sm text-black">
            Per month • {currency ? formatCurrency(onePercent * 12, currency.code) : `$${(onePercent * 12).toFixed(2)}`} per year
          </p>
        </div>

        {/* The Question */}
        <div className="bg-goal-light border-2 border-goal rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-3 text-center text-black">
            Can you improve by this amount monthly?
          </h2>
          <p className="text-black text-center mb-4">
            Either by:
          </p>
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded p-4 text-center">
              <p className="font-semibold text-passive-dark mb-1">Earning more</p>
              <p className="text-xs text-black">Side work, raise, extra hours</p>
            </div>
            <div className="bg-white rounded p-4 text-center">
              <p className="font-semibold text-goal-dark mb-1">Spending less</p>
              <p className="text-xs text-black">Cut subscriptions, eat out less</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowExplainer(!showExplainer)}
            className="flex items-center gap-2 text-sm text-goal-dark hover:text-goal mx-auto"
          >
            <HelpCircle size={16} />
            Why 1%?
          </button>
        </div>

        {/* Explainer */}
        {showExplainer && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm">
            <p className="mb-2 text-black">
              <strong>1% is:</strong>
            </p>
            <ul className="space-y-1 ml-4 text-black">
              <li>• Small enough to start today</li>
              <li>• Big enough to notice over time</li>
              <li>• Achievable through many small changes</li>
              <li>• A habit, not a sacrifice</li>
            </ul>
            <p className="mt-3 text-xs text-black">
              This is about building better habits, not financial advice.
            </p>
          </div>
        )}

        {/* Choice buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => setChoice('yes')}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              choice === 'yes' 
                ? 'border-passive bg-passive-light/20 shadow-lg' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg text-black">Yes, I can improve by 1%</p>
                <p className="text-sm text-black">
                  {currency ? formatCurrency(onePercent, currency.code) : `$${onePercent.toFixed(2)}`}/month commitment
                </p>
              </div>
              {choice === 'yes' && (
                <div className="w-6 h-6 rounded-full bg-passive flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
          <button
            onClick={() => setChoice('custom')}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              choice === 'custom' 
                ? 'border-goal bg-goal-light/20 shadow-lg' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div>
              <p className="font-semibold text-lg text-black mb-2">Different amount</p>
              {choice === 'custom' && (
                <div className="relative mt-3">
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
                    autoFocus
                  />
                </div>
              )}
              <p className="text-sm text-black mt-2">
                Set your own monthly improvement target (minimum 1%)
              </p>
            </div>
          </button>
          <button
            onClick={() => setChoice('no')}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              choice === 'no' 
                ? 'border-goal bg-goal-light/20 shadow-lg' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg text-black">No, not right now</p>
                <p className="text-sm text-black">
                  I'll explore other options
                </p>
              </div>
              {choice === 'no' && (
                <div className="w-6 h-6 rounded-full bg-goal flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-xs text-black text-center">
          <p>
            This is a behavioral commitment about habits, not financial advice. 
            How you achieve this improvement is entirely your choice. 
            No guarantees or promises about outcomes.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push('/onboarding/finances')}
            className="px-6 py-3 bg-gray-200 text-black rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            ← Back
          </button>
          <button
            onClick={handleCommit}
            disabled={
              !choice || 
              (choice === 'custom' && (!customAmount || parseFloat(customAmount) < onePercent))
            }
            className="px-8 py-3 bg-passive-dark text-white rounded-lg font-semibold
              disabled:bg-gray-300 disabled:cursor-not-allowed
              hover:bg-passive transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            {choice === 'no' 
              ? 'Continue →' 
              : 'Commit →'}
          </button>
        </div>

        {/* Skip */}
        <div className="text-center mt-4">
          <button
            onClick={handleSkip}
            className="text-sm text-black hover:text-gray-700 underline"
          >
            Skip this step
          </button>
        </div>
      </div>
    </div>
  );
}

