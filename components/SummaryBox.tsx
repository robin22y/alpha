import React from "react";
import { formatCurrency, CurrencyInfo } from "@/lib/currency";

interface Props {
  income: number;
  essentials: number;
  debtMinimums: number;
  buffer: number;
  leftover: number;
  currency: CurrencyInfo;
}

export default function SummaryBox({ income, essentials, debtMinimums, buffer, leftover, currency }: Props) {
  const getLeftoverStatus = () => {
    if (leftover > 0) return { color: '#37B24D', bg: '#8CE99A', label: 'Available' };
    if (leftover === 0) return { color: '#92400E', bg: '#FEF3C7', label: 'Break-even' };
    return { color: '#DC2626', bg: '#FEE2E2', label: 'Shortfall' };
  };

  const status = getLeftoverStatus();

  return (
    <div className={`rounded-lg p-6 text-center`} style={{ backgroundColor: status.bg }}>
      <div className="space-y-3 mb-4 text-left">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Income</span>
          <span className="text-sm font-semibold text-black">
            {formatCurrency(income, currency.code)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Essential Spending</span>
          <span className="text-sm font-semibold text-black">
            {formatCurrency(essentials, currency.code)}
          </span>
        </div>
        {debtMinimums > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Debt Minimums</span>
            <span className="text-sm font-semibold text-black">
              {formatCurrency(debtMinimums, currency.code)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Life Buffer (auto)</span>
          <span className="text-sm font-semibold text-black">
            {formatCurrency(buffer, currency.code)}
          </span>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-300">
        <p className="text-sm font-medium mb-2 text-black">
          Monthly leftover
        </p>
        <p className={`text-4xl font-bold mb-2`} style={{ color: status.color }}>
          {formatCurrency(Math.abs(leftover), currency.code)}
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border-2`} style={{ backgroundColor: status.bg, color: status.color, borderColor: status.color }}>
            {status.label}
          </span>
        </div>
      </div>
    </div>
  );
}
