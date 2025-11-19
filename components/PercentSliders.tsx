import React from "react";
import { formatCurrency, CurrencyInfo } from "@/lib/currency";

interface Props {
  percents: {
    rentBills: number;
    food: number;
    transport: number;
    kidsHome: number;
    other: number;
  };
  setPercents: (updater: (prev: any) => any) => void;
  monthlyIncome: number;
  currency: CurrencyInfo;
}

const sliderList = [
  { key: "rentBills", label: "Rent & Bills", icon: "🏠" },
  { key: "food", label: "Food & Groceries", icon: "🍽️" },
  { key: "transport", label: "Transport", icon: "🚗" },
  { key: "kidsHome", label: "Kids & Home", icon: "👶" },
  { key: "other", label: "Everything Else", icon: "📦" },
];

export default function PercentSliders({ percents, setPercents, monthlyIncome, currency }: Props) {
  const updatePercent = (key: string, newValue: number) => {
    setPercents((prev: any) => {
      const current = prev[key];

      // sum of all other categories
      const totalOthers = Object.entries(prev)
        .filter(([k]) => k !== key)
        .reduce((sum, [, val]) => sum + (val as number), 0);

      // max allowed for this slider so total never > 100
      const maxForThis = Math.max(0, 100 - totalOthers);

      // clamp the new value between 0 and maxForThis
      const clamped = Math.min(Math.max(newValue, 0), maxForThis);

      return {
        ...prev,
        [key]: clamped,
      };
    });
  };

  return (
    <div className="space-y-6">
      {sliderList.map((item) => {
        const percent = percents[item.key as keyof typeof percents];
        const amount = (percent / 100) * monthlyIncome;

        return (
          <div key={item.key} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-black flex items-center gap-2">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </label>
              <div className="text-right">
                <div className="text-lg font-bold text-black">
                  {formatCurrency(amount, currency.code)}
                </div>
                <div className="text-xs text-gray-500">
                  {percent.toFixed(1)}%
                </div>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={percent}
              onChange={(e) => updatePercent(item.key, Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #51CF66 0%, #51CF66 ${percent}%, #E5E7EB ${percent}%, #E5E7EB 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
