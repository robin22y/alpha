'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { formatCurrency, getCurrency, CurrencyInfo } from '@/lib/currency';
import StepIndicator from '@/components/StepIndicator';
import PrivacyBadge from '@/components/PrivacyBadge';

const steps = ['Your Goal', 'Timeline', 'Details', 'Your Date'];

export default function FinancesPage() {
  const router = useRouter();
  const [currency, setCurrency] = useState<CurrencyInfo | null>(null);
  const setFinances = useUserStore((state) => state.setFinances);
  
  useEffect(() => {
    setCurrency(getCurrency());
  }, []);
  
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [monthlySpending, setMonthlySpending] = useState<string>('');
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  // Breakdown categories
  const [breakdown, setBreakdown] = useState({
    housing: '',
    food: '',
    transport: '',
    utilities: '',
    entertainment: '',
    other: ''
  });

  // Calculate leftover
  const income = parseFloat(monthlyIncome) || 0;
  const spending = parseFloat(monthlySpending) || 0;
  const leftover = income - spending;

  // Get leftover status
  const getLeftoverStatus = () => {
    if (leftover > 0) return { color: 'text-passive-dark', bg: 'bg-passive-light', label: 'Available' };
    if (leftover === 0) return { color: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Break-even' };
    return { color: 'text-red-700', bg: 'bg-red-100', label: 'Shortfall' };
  };

  const status = getLeftoverStatus();

  const handleContinue = () => {
    if (income > 0 && spending > 0) {
      // Save to store
      const breakdownData = showBreakdown ? {
        housing: parseFloat(breakdown.housing) || 0,
        food: parseFloat(breakdown.food) || 0,
        transport: parseFloat(breakdown.transport) || 0,
        utilities: parseFloat(breakdown.utilities) || 0,
        entertainment: parseFloat(breakdown.entertainment) || 0,
        other: parseFloat(breakdown.other) || 0
      } : undefined;
      
      setFinances(income, spending, breakdownData);
      router.push('/onboarding/habit');
    }
  };

  const handleBack = () => {
    router.push('/onboarding/timeline');
  };

  // Format number input
  const handleIncomeChange = (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, '');
    setMonthlyIncome(cleaned);
  };

  const handleSpendingChange = (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, '');
    setMonthlySpending(cleaned);
  };

  // Auto-calculate spending from breakdown
  useEffect(() => {
    if (showBreakdown) {
      const total = Object.values(breakdown).reduce((sum, val) => {
        return sum + (parseFloat(val) || 0);
      }, 0);
      setMonthlySpending(total.toString());
    }
  }, [breakdown, showBreakdown]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-trust-light/30 to-goal-light/30 py-8 px-4">
      <PrivacyBadge />
      
      <div className="max-w-3xl mx-auto">
        <StepIndicator currentStep={3} steps={steps} />
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-black">
            Your monthly numbers
          </h1>
          <p className="text-black text-lg">
            Just the basics. We'll keep it simple.
          </p>
        </div>

        {/* Main inputs */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
          {/* Monthly Income */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-black">
              💰 Monthly income
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black text-xl">
                {currency?.symbol || '$'}
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

          {/* Monthly Spending */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-black">
              🛒 Monthly spending
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black text-xl">
                {currency?.symbol || '$'}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={monthlySpending}
                onChange={(e) => handleSpendingChange(e.target.value)}
                placeholder="0"
                disabled={showBreakdown}
                className="w-full pl-12 pr-4 py-4 text-2xl font-semibold border-2 border-gray-200 rounded-lg focus:border-goal focus:outline-none disabled:bg-gray-50 text-black"
              />
            </div>
            <p className="text-xs text-black mt-2">
              Everything you spend each month. Estimate is fine.
            </p>
          </div>

          {/* Breakdown toggle */}
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center gap-2 text-sm text-goal-dark hover:text-goal font-semibold mb-4"
          >
            {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showBreakdown ? 'Hide breakdown' : 'Break down your spending'}
          </button>

          {/* Breakdown fields */}
          {showBreakdown && (
            <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              {[
                { key: 'housing', label: '🏠 Housing (rent/mortgage)', placeholder: 'e.g. 800' },
                { key: 'food', label: '🍽️ Food & groceries', placeholder: 'e.g. 300' },
                { key: 'transport', label: '🚗 Transport', placeholder: 'e.g. 150' },
                { key: 'utilities', label: '💡 Utilities & bills', placeholder: 'e.g. 120' },
                { key: 'entertainment', label: '🎮 Entertainment', placeholder: 'e.g. 80' },
                { key: 'other', label: '📦 Other', placeholder: 'e.g. 100' }
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium mb-1 text-black">
                    {label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-sm">
                      {currency?.symbol || '$'}
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={breakdown[key as keyof typeof breakdown]}
                      onChange={(e) => setBreakdown({
                        ...breakdown,
                        [key]: e.target.value.replace(/[^\d.]/g, '')
                      })}
                      placeholder={placeholder}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:border-goal focus:outline-none text-black"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Leftover calculation */}
          {income > 0 && spending > 0 && (
            <div className={`${status.bg} rounded-lg p-6 text-center`}>
              <p className="text-sm font-medium text-black mb-2">
                Monthly leftover
              </p>
              <p className={`text-4xl font-bold ${status.color} mb-2`}>
                {currency ? formatCurrency(Math.abs(leftover), currency.code) : `$${Math.abs(leftover).toFixed(2)}`}
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.bg} ${status.color} border-2`}>
                  {status.label}
                </span>
              </div>
              
              {leftover < 0 && (
                <p className="text-xs text-black mt-3">
                  This shortfall gets added to debt each month
                </p>
              )}
            </div>
          )}
        </div>

        {/* Privacy reminder */}
        <div className="text-center mb-6">
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
            disabled={!(income > 0 && spending > 0)}
            className="px-8 py-4 bg-passive-dark text-white rounded-lg font-semibold text-lg 
              disabled:bg-gray-300 disabled:cursor-not-allowed
              hover:bg-passive transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            Continue →
          </button>
        </div>

        {/* Skip option */}
        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/onboarding/habit')}
            className="text-sm text-black hover:text-gray-700 underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

