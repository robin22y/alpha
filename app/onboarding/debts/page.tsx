'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, CreditCard } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { formatCurrency, getCurrency } from '@/lib/currency';
import PrivacyBadge from '@/components/PrivacyBadge';
import {
  DebtInput,
  DebtType,
  computeAllDebts,
  calcAmortisedPayment,
  type SimpleDebtInput,
  type MortgageDebtInput
} from '@/lib/debtEngine';

function createEmptyDebt(index: number): DebtInput {
  return {
    id: `debt-${Date.now()}-${index}`,
    name: '',
    debtType: 'credit_card',
    balance: 0,
    interestRate: 0,
    monthlyPayment: 0,
  } as DebtInput;
}

export default function DebtsPage() {
  const router = useRouter();
  const [currency, setCurrency] = useState<ReturnType<typeof getCurrency> | null>(null);
  const addDebt = useUserStore((state) => state.addDebt);
  const removeDebt = useUserStore((state) => state.removeDebt);
  
  const [debts, setDebts] = useState<DebtInput[]>([createEmptyDebt(0)]);
  const [interestRateStrings, setInterestRateStrings] = useState<Record<string, string>>({});

  useEffect(() => {
    setCurrency(getCurrency());
  }, []);

  const handleDebtChange = <K extends keyof DebtInput>(
    id: string,
    field: K,
    value: DebtInput[K]
  ) => {
    setDebts(prev =>
      prev.map(d => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleAddDebt = () => {
    setDebts(prev => [...prev, createEmptyDebt(prev.length)]);
  };

  const handleRemoveDebt = (id: string) => {
    if (debts.length > 1) {
      setDebts(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleClearAll = () => {
    setDebts([createEmptyDebt(0)]);
    setInterestRateStrings({});
  };

  const handleDebtTypeChange = (id: string, debtType: DebtType) => {
    setDebts(prev =>
      prev.map(d => {
        if (d.id !== id) return d;

        if (debtType === 'mortgage') {
          // Convert to mortgage shape
          const existingBalance = (d as any).balance ?? (d as any).principal ?? 0;
          return {
            id: d.id,
            name: d.name,
            debtType: 'mortgage',
            principal: existingBalance,
            interestRate: d.interestRate ?? 0,
            termYears: 30,
          } as MortgageDebtInput;
        } else {
          // Convert to simple shape
          const existingBalance = (d as any).balance ?? (d as any).principal ?? 0;
          return {
            id: d.id,
            name: d.name,
            debtType,
            balance: existingBalance,
            interestRate: d.interestRate ?? 0,
            monthlyPayment: (d as any).monthlyPayment ?? 0,
          } as SimpleDebtInput;
        }
      })
    );
  };

  const handleInterestRateChange = (id: string, value: string) => {
    // Allow digits and decimal point
    let cleaned = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Update display string
    setInterestRateStrings(prev => ({ ...prev, [id]: cleaned }));
    
    // Update numeric value if valid
    if (cleaned === '' || cleaned === '.') {
      handleDebtChange(id, 'interestRate', 0);
    } else {
      const numValue = parseFloat(cleaned);
      if (!isNaN(numValue) && numValue >= 0) {
        handleDebtChange(id, 'interestRate', numValue);
      }
    }
  };

  const handleInterestRateBlur = (id: string) => {
    setInterestRateStrings(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const computed = computeAllDebts(debts);

  const totalDebt = computed.reduce((sum, d) => {
    if (d.debtType === 'mortgage') {
      return sum + d.principal; // TypeScript knows principal is required for mortgages
    } else {
      return sum + d.balance; // TypeScript knows balance is required for simple debts
    }
  }, 0);

  const totalMonthly = computed.reduce((sum, d) => sum + d.monthlyPayment, 0);

  const handleContinue = () => {
    // Filter valid debts
    const validDebts = computed.filter(debt => {
      if (!debt.name || debt.name.trim() === '') return false;
      if (debt.monthlyPayment <= 0) return false;
      
      if (debt.debtType === 'mortgage') {
        return (debt.principal ?? 0) > 0;
      } else {
        return (debt.balance ?? 0) > 0;
      }
    });

    if (validDebts.length === 0) {
      router.push('/onboarding/results');
      return;
    }

    // Convert DebtComputed to DebtItem for store
    const debtsToSave: any[] = validDebts.map(debt => {
      const debtData: any = {
        id: debt.id,
        type: debt.name,
        name: debt.name,
        debtType: debt.debtType,
        interestRate: debt.interestRate || 0,
        monthlyPayment: debt.monthlyPayment,
        monthsToPayoff: debt.monthsToPayoff === Infinity ? 999 : debt.monthsToPayoff
      };

      if (debt.debtType === 'mortgage') {
        // Mortgage: save principal as loanAmount and balance for compatibility
        debtData.loanAmount = debt.principal ?? 0;
        debtData.mortgageTermYears = debt.termYears;
        debtData.balance = debt.principal ?? 0; // For compatibility with existing code
      } else if (debt.debtType === 'personal_loan' || debt.debtType === 'car_loan' || debt.debtType === 'student_loan') {
        // Loans: save balance as loanAmount for consistency
        debtData.loanAmount = debt.balance;
        debtData.balance = debt.balance; // For compatibility
      } else {
        // Credit cards: just balance
        debtData.balance = debt.balance;
      }

      return debtData;
    });

    // Clear all debts and set new ones atomically
    useUserStore.setState((state) => ({
      ...state,
      debts: debtsToSave
    }));
    
    // Force recalculation
    useUserStore.getState().calculateTotals();
    
    // Log for debugging
    console.log('Saved debts:', debtsToSave);
    console.log('Total debts saved:', debtsToSave.length);
    console.log('Verifying saved state:', useUserStore.getState().debts);
    
    // Small delay to ensure state is persisted before navigation
    setTimeout(() => {
      router.push('/onboarding/results');
    }, 100);
  };

  const handleSkip = () => {
    router.push('/onboarding/results');
  };

  if (!currency) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-bold text-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, white, rgba(178, 242, 187, 0.3), rgba(116, 192, 252, 0.3))' }}>
      <PrivacyBadge />
      
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#FFE066' }}>
            <CreditCard size={48} style={{ color: '#FF9800' }} />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#000000' }}>
            Your debts (if any)
          </h1>
          <p className="text-lg" style={{ color: '#666666' }}>
            Help us calculate your debt-free date
          </p>
        </div>

        {/* Debt forms */}
        <div className="space-y-4 mb-6">
          {debts.map((debt, index) => {
            const isMortgage = debt.debtType === 'mortgage';
            const computedDebt = computed[index];
            const interestRateString = interestRateStrings[debt.id] !== undefined 
              ? interestRateStrings[debt.id] 
              : (debt.interestRate !== undefined ? debt.interestRate.toString() : '');

            return (
              <div key={debt.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg" style={{ color: '#000000' }}>Debt {index + 1}</h3>
                  {debts.length > 1 && (
                    <button
                      onClick={() => handleRemoveDebt(debt.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                      Name (e.g. "Credit Card", "Car Loan")
                    </label>
                    <input
                      type="text"
                      value={debt.name}
                      onChange={(e) => handleDebtChange(debt.id, 'name', e.target.value)}
                      placeholder="e.g. Visa Card"
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#E5E7EB' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                    />
                  </div>

                  {/* Debt Type */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                      Debt Type
                    </label>
                    <select
                      value={debt.debtType}
                      onChange={(e) => handleDebtTypeChange(debt.id, e.target.value as DebtType)}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#E5E7EB' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="personal_loan">Personal Loan</option>
                      <option value="car_loan">Car Loan</option>
                      <option value="student_loan">Student Loan</option>
                      <option value="mortgage">Mortgage</option>
                    </select>
                  </div>

                  {isMortgage ? (
                    <>
                      {/* Mortgage Principal */}
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                          Mortgage Amount (Loan Principal)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }}>
                            {currency.symbol}
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={(debt as MortgageDebtInput).principal || ''}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0;
                              setDebts(prev =>
                                prev.map(d => (d.id === debt.id && d.debtType === 'mortgage' 
                                  ? { ...d, principal: value } as MortgageDebtInput
                                  : d))
                              );
                            }}
                            placeholder="0"
                            className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none"
                            style={{ borderColor: '#E5E7EB' }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                          />
                        </div>
                      </div>

                      {/* Term Years */}
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                          Term (years)
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={(debt as MortgageDebtInput).termYears || 30}
                          onChange={(e) => {
                              const value = parseInt(e.target.value) || 30;
                              setDebts(prev =>
                                prev.map(d => (d.id === debt.id && d.debtType === 'mortgage' 
                                  ? { ...d, termYears: value } as MortgageDebtInput
                                  : d))
                              );
                            }}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                          style={{ borderColor: '#E5E7EB' }}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                          onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                        />
                      </div>

                      {/* Interest Rate */}
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                          Interest Rate (%)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={interestRateString}
                            onChange={(e) => handleInterestRateChange(debt.id, e.target.value)}
                            onBlur={() => handleInterestRateBlur(debt.id)}
                            placeholder="e.g. 5.6"
                            className="w-full pr-12 px-4 py-3 border-2 rounded-lg focus:outline-none"
                            style={{ borderColor: '#E5E7EB' }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }}>
                            %
                          </span>
                        </div>
                      </div>

                      {/* Calculated Monthly Payment */}
                      {computedDebt.monthlyPayment > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm" style={{ color: '#666666' }}>
                            <strong>Calculated Monthly Payment:</strong>{' '}
                            {formatCurrency(computedDebt.monthlyPayment, currency.code)}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Balance and Monthly Payment */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                            Total balance
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }}>
                              {currency.symbol}
                            </span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={(debt as SimpleDebtInput).balance || ''}
                              onChange={(e) => handleDebtChange(
                                debt.id,
                                'balance' as keyof DebtInput,
                                parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0
                              )}
                              placeholder="0"
                              className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none"
                              style={{ borderColor: '#E5E7EB' }}
                              onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                            Monthly payment
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }}>
                              {currency.symbol}
                            </span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={(debt as SimpleDebtInput).monthlyPayment || ''}
                              onChange={(e) => handleDebtChange(
                                debt.id,
                                'monthlyPayment' as keyof DebtInput,
                                parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0
                              )}
                              placeholder="0"
                              className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none"
                              style={{ borderColor: '#E5E7EB' }}
                              onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Interest Rate */}
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                          Interest rate (optional)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={interestRateString}
                            onChange={(e) => handleInterestRateChange(debt.id, e.target.value)}
                            onBlur={() => handleInterestRateBlur(debt.id)}
                            placeholder="e.g. 19.9"
                            className="w-full pr-12 px-4 py-3 border-2 rounded-lg focus:outline-none"
                            style={{ borderColor: '#E5E7EB' }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }}>
                            %
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add debt button */}
        <button
          onClick={handleAddDebt}
          className="w-full mb-6 py-3 border-2 border-dashed rounded-lg transition-all flex items-center justify-center gap-2"
          style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#51CF66';
            e.currentTarget.style.color = '#51CF66';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#D1D5DB';
            e.currentTarget.style.color = '#6B7280';
          }}
        >
          <Plus size={20} />
          Add another debt
        </button>

        {/* Clear All button */}
        <div className="text-center mb-6">
          <button
            onClick={handleClearAll}
            className="text-sm underline"
            style={{ color: '#6B7280' }}
          >
            Clear All
          </button>
        </div>

        {/* Summary */}
        {totalDebt > 0 && (
          <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: '#FFE066' }}>
            <div className="grid md:grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm mb-1" style={{ color: '#666666' }}>Total debt</p>
                <p className="text-3xl font-bold" style={{ color: '#FF9800' }}>
                  {formatCurrency(totalDebt, currency.code)}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#666666' }}>Total monthly payments</p>
                <p className="text-3xl font-bold" style={{ color: '#FF9800' }}>
                  {formatCurrency(totalMonthly, currency.code)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Privacy */}
        <div className="text-center mb-6">
          <p className="text-sm" style={{ color: '#666666' }}>
            🔒 Your debt information stays on your device
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push('/onboarding/habit')}
            className="px-6 py-3 rounded-lg font-semibold"
            style={{ backgroundColor: '#E5E7EB', color: '#374151' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D1D5DB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            className="px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: '#37B24D', color: '#FFFFFF' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2F9E44'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#37B24D'}
          >
            See My Results →
          </button>
        </div>

        {/* Skip */}
        <div className="text-center mt-4">
          <button
            onClick={handleSkip}
            className="text-sm underline"
            style={{ color: '#6B7280' }}
          >
            I don't have any debts
          </button>
        </div>
      </div>
    </div>
  );
}
