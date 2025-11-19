'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, getCurrency } from '@/lib/currency';

interface PassiveIncomeModalProps {
  isOpen: boolean;
  currentPassiveIncome: number;
  onClose: () => void;
  onSave: (amount: number) => void;
}

export default function PassiveIncomeModal({
  isOpen,
  currentPassiveIncome,
  onClose,
  onSave
}: PassiveIncomeModalProps) {
  const [tempAmount, setTempAmount] = useState<string>('');
  const [currency, setCurrency] = useState<ReturnType<typeof getCurrency> | null>(null);

  useEffect(() => {
    setCurrency(getCurrency());
    if (isOpen) {
      setTempAmount(currentPassiveIncome > 0 ? currentPassiveIncome.toString() : '');
    }
  }, [isOpen, currentPassiveIncome]);

  const handleSave = () => {
    const amount = parseFloat(tempAmount) || 0;
    onSave(amount);
    onClose();
  };

  const handleCancel = () => {
    setTempAmount(currentPassiveIncome > 0 ? currentPassiveIncome.toString() : '');
    onClose();
  };

  if (!isOpen || !currency) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={handleCancel}
    >
      <div 
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="font-bold text-gray-900 text-lg">
          Add Passive Income
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Enter how much you receive monthly:
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
              {currency.symbol}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={tempAmount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, '');
                setTempAmount(value);
              }}
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
              autoFocus
            />
          </div>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p className="font-semibold mb-1">Examples:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Rental income</li>
            <li>Dividends</li>
            <li>Side business</li>
            <li>Interest</li>
            <li>Royalties</li>
          </ul>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

