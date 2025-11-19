'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, getCurrency } from '@/lib/currency';

export default function HabitCard({ monthlyIncome }: { monthlyIncome: number }) {
  const [target, setTarget] = useState<number | null>(null);
  const [currency, setCurrency] = useState<ReturnType<typeof getCurrency> | null>(null);

  useEffect(() => {
    setCurrency(getCurrency());
    const saved = localStorage.getItem("zdebt_habit_target");
    if (saved) {
      const num = Number(saved);
      if (!Number.isNaN(num) && num > 0) {
        setTarget(num);
      }
    }
  }, []);

  const onePercent = monthlyIncome * 0.01;

  const handleSetTarget = () => {
    const def = Math.round(onePercent);
    localStorage.setItem("zdebt_habit_target", String(def));
    setTarget(def);
  };

  const handleChange = () => {
    // Open a simple prompt or modal to change target
    // For now, just clear it so user can set again
    localStorage.removeItem("zdebt_habit_target");
    setTarget(null);
  };

  if (!currency) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4 flex items-center justify-between h-full">
      <div className="flex items-start gap-3 flex-1">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
          <span className="text-xl">🌱</span>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">1% Habit (Optional)</div>
          <div className="text-sm text-gray-500 mt-1">
            1% of your income: {formatCurrency(onePercent, currency.code)}
          </div>
          
          {!target && (
            <button
              onClick={handleSetTarget}
              className="mt-2 bg-green-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-green-700 transition-colors"
            >
              Set 1% target
            </button>
          )}
          
          {target && (
            <div className="mt-2 text-sm text-gray-600">
              Target: {formatCurrency(target, currency.code)}/month
            </div>
          )}
          
          <div className="text-[10px] text-gray-400 mt-1">
            A simple habit idea. Not financial advice.
          </div>
        </div>
      </div>
      
      <div className="text-gray-400 text-xl ml-2">→</div>
    </div>
  );
}

