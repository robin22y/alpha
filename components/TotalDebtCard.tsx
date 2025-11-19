'use client';

import { Target } from 'lucide-react';
import { formatCurrency, getCurrency } from '@/lib/currency';

interface TotalDebtCardProps {
  totalDebt: number;
}

export default function TotalDebtCard({ totalDebt }: TotalDebtCardProps) {
  const currency = getCurrency();

  return (
    <div className="rounded-2xl bg-white shadow-sm p-5 border border-gray-100">
      {/* Icon + Title */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
          <Target className="text-yellow-500" size={20} />
        </div>
        <h3 className="font-semibold text-gray-800 text-sm">
          Total Debt Remaining
        </h3>
      </div>

      {/* Big number */}
      <p className="text-xl md:text-2xl font-semibold text-gray-900 mt-1">
        {formatCurrency(totalDebt, currency.code)}
      </p>
    </div>
  );
}
