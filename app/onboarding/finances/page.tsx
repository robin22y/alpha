'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { formatCurrency, getCurrency, CurrencyInfo } from '@/lib/currency';
import StepIndicator from '@/components/StepIndicator';
import PrivacyBadge from '@/components/PrivacyBadge';
import PercentSliders from '@/components/PercentSliders';
import OvershootQuestion from '@/components/OvershootQuestion';
import { defaultPercents } from '@/lib/utils/defaultPercents';

const steps = ['Your Goal', 'Your Timeline', 'Your Income & Spending', 'Your Debt-Free Date'];

type Percents = {
  rentBills: number;
  food: number;
  transport: number;
  kidsHome: number;
  other: number;
};

export default function MonthlyInput() {
  const router = useRouter();
  const [currency, setCurrency] = useState<CurrencyInfo | null>(null);
  const setFinances = useUserStore((state) => state.setFinances);

  useEffect(() => {
    setCurrency(getCurrency());
  }, []);

  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [percents, setPercents] = useState<Percents>(defaultPercents);
  const [overshootAmount, setOvershootAmount] = useState<number>(0);

  // Load any saved overshoot from previous session
  useEffect(() => {
    const saved = localStorage.getItem("zdebt_overshoot_amount");
    if (saved) {
      const num = Number(saved);
      if (!Number.isNaN(num) && num >= 0) setOvershootAmount(num);
    }
  }, []);

  const income = parseFloat(monthlyIncome) || 0;

  // Reset to defaults when income is first entered
  useEffect(() => {
    if (income > 0 && Object.values(percents).every(p => p === 0)) {
      setPercents(defaultPercents);
    }
  }, [income]);

  // Calculate total percentage
  const totalPercent = Object.values(percents).reduce((a, b) => a + b, 0);

  // Calculate amounts from percents (always derived, never set directly)
  const amounts = useMemo(() => {
    return {
      rentBills: (percents.rentBills / 100) * income,
      food: (percents.food / 100) * income,
      transport: (percents.transport / 100) * income,
      kidsHome: (percents.kidsHome / 100) * income,
      other: (percents.other / 100) * income,
    };
  }, [percents, income]);

  const estimatedSpent = Object.values(amounts).reduce((sum, v) => sum + v, 0);
  const estimatedLeft = income - estimatedSpent;

  const unallocatedPct = Math.max(0, 100 - totalPercent);
  const unallocatedAmt = (unallocatedPct / 100) * income;

  const handleContinue = () => {
    // Continue is allowed when income > 0 (allocation can be any percentage)
    // Overshoot is optional (defaults to 0)
    if (income > 0) {
      // Save overshoot for dashboard use (can be 0)
      localStorage.setItem("zdebt_overshoot_amount", String(overshootAmount || 0));

      // Save to store with breakdown structure (mapping to existing format)
      const breakdownData = {
        housing: amounts.rentBills,
        food: amounts.food,
        transport: amounts.transport,
        utilities: 0,
        entertainment: amounts.kidsHome,
        other: amounts.other
      };
      
      // monthlySpending = essentials only (use estimatedSpent which is based on actual slider values)
      setFinances(income, estimatedSpent, breakdownData);
      router.push('/onboarding/debts');
    }
  };

  const handleBack = () => {
    router.push('/onboarding/timeline');
  };

  const handleIncomeChange = (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, '');
    setMonthlyIncome(cleaned);
  };

  if (!currency) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-bold text-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: '#F5F5F7' }}>
      <PrivacyBadge />
      
      <div className="max-w-3xl mx-auto">
        <StepIndicator currentStep={3} steps={steps} />
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-black">
            Your Money Overview
          </h1>
          <p className="text-black text-lg">
            Tell us your monthly income
          </p>
        </div>

        {/* Monthly Income Input */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
          <label className="block text-sm font-semibold mb-3 text-black">
            💰 Monthly income
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black text-xl">
              {currency.symbol}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={monthlyIncome}
              onChange={(e) => handleIncomeChange(e.target.value)}
              placeholder="0"
              className="w-full pl-12 pr-4 py-4 text-2xl font-semibold border-2 border-gray-200 rounded-lg focus:border-goal focus:outline-none text-black"
            />
          </div>
          <p className="text-xs text-black mt-2">
            After tax. All sources combined.
          </p>
        </div>

        {/* Percent Sliders */}
        {income > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
            <h2 className="text-lg font-semibold mb-6 text-black">Monthly Expenses</h2>
            
            <PercentSliders
              percents={percents}
              setPercents={setPercents}
              monthlyIncome={income}
              currency={currency}
            />

            {/* Summary based only on user sliders */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg text-sm space-y-1">
              <div>
                Total allocation:{" "}
                <span className={totalPercent === 100 ? "text-green-600 font-semibold" : "text-gray-800"}>
                  {totalPercent.toFixed(1)}%
                </span>
              </div>
              <div>
                Estimated spending: {formatCurrency(estimatedSpent, currency.code)}
              </div>
              <div>Estimated money left: {formatCurrency(estimatedLeft, currency.code)}</div>
              {unallocatedPct > 0 && (
                <div className="text-xs text-gray-500 mt-2">
                  You did not allocate about {unallocatedPct.toFixed(1)}% (
                  ≈ {formatCurrency(unallocatedAmt, currency.code)}). We treat this as other
                  small spending.
                </div>
              )}
            </div>

            {/* Overshoot question: only when user hit 100% */}
            {Math.round(totalPercent) === 100 && (
              <OvershootQuestion
                overshootAmount={overshootAmount}
                setOvershootAmount={setOvershootAmount}
              />
            )}
          </div>
        )}

        {/* Privacy reminder */}
        <div className="text-center mb-6 mt-6">
          <p className="text-sm text-black">
            🔒 These numbers stay on your device
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleBack}
            className="px-8 py-4 bg-gray-200 text-black rounded-lg font-semibold text-lg hover:bg-gray-300 transition-all"
          >
            ← Back
          </button>
          
          <button
            onClick={handleContinue}
            disabled={income === 0}
            className="px-8 py-4 bg-passive-dark text-white rounded-lg font-semibold text-lg 
              disabled:bg-gray-300 disabled:cursor-not-allowed
              hover:bg-passive transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
