'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, getCurrency } from '@/lib/currency';
import type { IncomeSource, IncomeSourceType } from '@/lib/incomeSources';

interface IncomeSourcesModalProps {
  isOpen: boolean;
  sources: IncomeSource[];
  monthlyIncome: number;
  onClose: () => void;
  onSave: (sources: IncomeSource[]) => void;
}

interface IncomeSourceRow {
  name: string;
  amount: string;
  type: IncomeSourceType;
}

export default function IncomeSourcesModal({
  isOpen,
  sources,
  monthlyIncome,
  onClose,
  onSave
}: IncomeSourcesModalProps) {
  const [currency, setCurrency] = useState<ReturnType<typeof getCurrency> | null>(null);
  const [rows, setRows] = useState<IncomeSourceRow[]>([]);

  useEffect(() => {
    setCurrency(getCurrency());
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Load sources or default to one row with onboarding income
      if (sources.length > 0) {
        // Convert sources to rows
        setRows(sources.map(s => ({
          name: s.name || '',
          amount: s.amount.toString(),
          type: s.type
        })));
      } else {
        // Default to one row with onboarding income
        setRows([{
          name: 'Main income',
          amount: monthlyIncome > 0 ? monthlyIncome.toString() : '',
          type: 'work'
        }]);
      }
    }
  }, [isOpen, sources, monthlyIncome]);

  const handleRowChange = (index: number, field: keyof IncomeSourceRow, value: string | IncomeSourceType) => {
    setRows(prev => prev.map((row, i) => 
      i === index ? { ...row, [field]: value } : row
    ));
  };

  const handleAddRow = () => {
    setRows(prev => [...prev, {
      name: '',
      amount: '',
      type: 'work'
    }]);
  };

  const handleDeleteRow = (index: number) => {
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Collect all rows with valid entries (amount > 0 or name non-empty)
    const validSources: IncomeSource[] = rows
      .filter(row => {
        const amount = parseFloat(row.amount) || 0;
        return amount > 0 || row.name.trim().length > 0;
      })
      .map(row => ({
        name: row.name.trim() || '',
        amount: parseFloat(row.amount) || 0,
        type: row.type
      }));

    onSave(validSources);
    onClose();
  };

  const handleCancel = () => {
    // Reset to original sources
    if (sources.length > 0) {
      setRows(sources.map(s => ({
        name: s.name || '',
        amount: s.amount.toString(),
        type: s.type
      })));
    } else {
      setRows([{
        name: 'Main income',
        amount: monthlyIncome > 0 ? monthlyIncome.toString() : '',
        type: 'work'
      }]);
    }
    onClose();
  };

  if (!isOpen || !currency) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={handleCancel}
    >
      <div 
        className="bg-white rounded-2xl p-6 w-full max-w-[650px] shadow-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="font-bold text-gray-900 text-lg mb-4">
          Add / Edit Income Sources
        </div>

        <div className="text-sm font-semibold text-gray-700 mb-3">
          Your Income Sources
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 mb-2 pb-2 border-b border-gray-200">
          <div className="col-span-5 text-xs font-semibold text-gray-600">Name</div>
          <div className="col-span-2 text-xs font-semibold text-gray-600">Amount</div>
          <div className="col-span-3 text-xs font-semibold text-gray-600">Type</div>
          <div className="col-span-2 text-xs font-semibold text-gray-600">Delete</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-3 mb-4">
          {rows.map((row, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-center">
              {/* Name Input */}
              <div className="col-span-5">
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => handleRowChange(index, 'name', e.target.value)}
                  placeholder="e.g., Salary"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm text-gray-900"
                />
              </div>

              {/* Amount Input */}
              <div className="col-span-2">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 text-sm">
                    {currency.symbol}
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={row.amount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d.]/g, '');
                      handleRowChange(index, 'amount', value);
                    }}
                    placeholder="0"
                    className="w-full pl-8 pr-2 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm text-gray-900"
                  />
                </div>
              </div>

              {/* Type Dropdown */}
              <div className="col-span-3">
                <select
                  value={row.type}
                  onChange={(e) => handleRowChange(index, 'type', e.target.value as IncomeSourceType)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm text-gray-900 bg-white"
                >
                  <option value="work">Money from Work</option>
                  <option value="assets">Money from Assets</option>
                  <option value="other">Other Money</option>
                </select>
              </div>

              {/* Delete Button */}
              <div className="col-span-2">
                <button
                  onClick={() => handleDeleteRow(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-semibold transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Another Source Button */}
        <button
          onClick={handleAddRow}
          className="text-blue-600 hover:text-blue-800 underline text-sm mb-4"
        >
          + Add another source
        </button>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
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
