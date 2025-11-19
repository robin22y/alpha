import React from "react";
import { formatCurrency, CurrencyInfo } from "@/lib/currency";

interface Props {
  percentages: {
    rentBills: number;
    food: number;
    transport: number;
    kidsHome: number;
    other: number;
  };
  onChange: (key: string, value: number) => void;
  currency: CurrencyInfo;
  monthlyIncome: number;
}

export default function ExpenseSliders({ percentages, onChange, currency, monthlyIncome }: Props) {
  const sliders = [
    { key: "rentBills", label: "Rent & Bills", icon: "🏠" },
    { key: "food", label: "Food & Groceries", icon: "🍽️" },
    { key: "transport", label: "Transport", icon: "🚗" },
    { key: "kidsHome", label: "Kids & Home", icon: "👶" },
    { key: "other", label: "Everything Else", icon: "📦" },
  ];

  // Calculate total percentage
  const totalPercentage = Object.values(percentages).reduce((sum, p) => sum + p, 0);
  const remainingPercentage = 100 - totalPercentage;

  const handleSliderChange = (key: string, newValue: number) => {
    const currentValue = percentages[key as keyof typeof percentages];
    const difference = newValue - currentValue;
    
    // Get other slider keys
    const otherKeys = sliders.filter(s => s.key !== key).map(s => s.key);
    
    // Calculate how much to adjust other sliders
    // Distribute the difference proportionally among other sliders
    const otherTotal = otherKeys.reduce((sum, k) => sum + percentages[k as keyof typeof percentages], 0);
    
    if (otherTotal > 0 && difference !== 0) {
      // Distribute proportionally
      const adjustedPercentages = { ...percentages };
      adjustedPercentages[key as keyof typeof percentages] = newValue;
      
      // Adjust others proportionally
      otherKeys.forEach(k => {
        const current = percentages[k as keyof typeof percentages];
        const proportion = current / otherTotal;
        const adjustment = -difference * proportion;
        adjustedPercentages[k as keyof typeof percentages] = Math.max(0, Math.min(100, current + adjustment));
      });
      
      // Ensure total is exactly 100 by adjusting the last slider
      const newTotal = Object.values(adjustedPercentages).reduce((sum, p) => sum + p, 0);
      const lastKey = otherKeys[otherKeys.length - 1];
      if (newTotal !== 100) {
        adjustedPercentages[lastKey as keyof typeof percentages] = Math.max(0, Math.min(100, 
          adjustedPercentages[lastKey as keyof typeof percentages] + (100 - newTotal)
        ));
      }
      
      // Update all values
      Object.keys(adjustedPercentages).forEach(k => {
        onChange(k, adjustedPercentages[k as keyof typeof adjustedPercentages]);
      });
    } else if (difference !== 0) {
      // If otherTotal is 0, just set this one and adjust the first other slider
      onChange(key, newValue);
      if (otherKeys.length > 0) {
        const firstOther = otherKeys[0];
        const currentFirstOther = percentages[firstOther as keyof typeof percentages];
        onChange(firstOther, Math.max(0, Math.min(100, currentFirstOther - difference)));
      }
    }
  };

  return (
    <div className="space-y-6">
      {sliders.map((s) => {
        const percentage = percentages[s.key as keyof typeof percentages];
        const amount = Math.round((monthlyIncome * percentage) / 100);

        return (
          <div key={s.key} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-black flex items-center gap-2">
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </label>
              <div className="text-right">
                <div className="text-lg font-bold text-black">
                  {formatCurrency(amount, currency.code)}
                </div>
                <div className="text-xs text-gray-500">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={0.5}
              value={percentage}
              onChange={(e) => {
                const newValue = parseFloat(e.target.value);
                handleSliderChange(s.key, newValue);
              }}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #51CF66 0%, #51CF66 ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        );
      })}
      
      {/* Show total percentage */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-black">Total Allocation</span>
          <span className={`text-sm font-bold ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
            {totalPercentage.toFixed(1)}%
          </span>
        </div>
        {totalPercentage !== 100 && (
          <p className="text-xs text-red-600 mt-1">
            {totalPercentage < 100 
              ? `Add ${(100 - totalPercentage).toFixed(1)}% to reach 100%`
              : `Reduce by ${(totalPercentage - 100).toFixed(1)}% to reach 100%`
            }
          </p>
        )}
      </div>
    </div>
  );
}
