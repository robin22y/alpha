'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, CreditCard } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { formatCurrency, getCurrency } from '@/lib/currency';
import PrivacyBadge from '@/components/PrivacyBadge';

interface Debt {
  id: string;
  name: string;
  balance: number;
  monthlyPayment: number;
  interestRate?: number;
  interestRateString?: string; // For display while typing
}

export default function DebtsPage() {
  const router = useRouter();
  const [currency, setCurrency] = useState<ReturnType<typeof getCurrency> | null>(null);
  const addDebt = useUserStore((state) => state.addDebt);
  
  const [debts, setDebts] = useState<Debt[]>([
    { id: '1', name: '', balance: 0, monthlyPayment: 0 }
  ]);

  useEffect(() => {
    setCurrency(getCurrency());
  }, []);

  const handleAddDebt = () => {
    setDebts([
      ...debts,
      { id: Date.now().toString(), name: '', balance: 0, monthlyPayment: 0 }
    ]);
  };

  const handleRemoveDebt = (id: string) => {
    if (debts.length > 1) {
      setDebts(debts.filter(d => d.id !== id));
    }
  };

  const handleClearAll = () => {
    // Reset to a single empty debt entry
    setDebts([
      { id: Date.now().toString(), name: '', balance: 0, monthlyPayment: 0 }
    ]);
  };

  const updateDebt = (id: string, field: keyof Debt, value: any) => {
    setDebts(debts.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMonthly = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);

  const handleContinue = () => {
    // Clear existing debts first (in case user is re-entering)
    const currentDebts = [...useUserStore.getState().debts];
    currentDebts.forEach(debt => {
      useUserStore.getState().removeDebt(debt.id);
    });
    
    // Save valid debts to store (must have name, balance > 0, and monthlyPayment > 0)
    const validDebts = debts.filter(debt => 
      debt.name && 
      debt.name.trim() !== '' && 
      debt.balance > 0 && 
      debt.monthlyPayment > 0
    );
    
    console.log('Valid debts to save:', validDebts);
    
    if (validDebts.length === 0) {
      // No valid debts, just go to results
      console.log('No valid debts found');
      router.push('/onboarding/results');
      return;
    }
    
    // Add each valid debt
    validDebts.forEach(debt => {
      addDebt({
        id: debt.id,
        type: debt.name,
        name: debt.name,
        balance: debt.balance,
        interestRate: debt.interestRate || 0,
        monthlyPayment: debt.monthlyPayment
      });
    });
    
    // Force recalculation (addDebt already calls calculateTotals, but ensure it's done)
    useUserStore.getState().calculateTotals();
    
    // Log final state
    const finalState = useUserStore.getState();
    console.log('Final debts:', finalState.debts);
    console.log('Final total debt:', finalState.totalDebt);
    console.log('Final total monthly payment:', finalState.totalMonthlyPayment);
    
    router.push('/onboarding/results');
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
          {debts.map((debt, index) => (
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
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                    Name (e.g. "Credit Card", "Car Loan")
                  </label>
                  <input
                    type="text"
                    value={debt.name}
                    onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                    placeholder="e.g. Visa Card"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: '#E5E7EB' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  />
                </div>

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
                        value={debt.balance || ''}
                        onChange={(e) => updateDebt(debt.id, 'balance', parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0)}
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
                        value={debt.monthlyPayment || ''}
                        onChange={(e) => updateDebt(debt.id, 'monthlyPayment', parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0)}
                        placeholder="0"
                        className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none"
                        style={{ borderColor: '#E5E7EB' }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                    Interest rate (optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={debt.interestRateString !== undefined ? debt.interestRateString : (debt.interestRate !== undefined ? debt.interestRate.toString() : '')}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^\d.]/g, '');
                        // Prevent multiple decimal points
                        const parts = cleaned.split('.');
                        const sanitized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
                        
                        // Update display string
                        updateDebt(debt.id, 'interestRateString', sanitized);
                        
                        // Update numeric value if valid
                        if (sanitized === '' || sanitized === '.') {
                          updateDebt(debt.id, 'interestRate', undefined);
                        } else {
                          const numValue = parseFloat(sanitized);
                          if (!isNaN(numValue) && numValue >= 0) {
                            updateDebt(debt.id, 'interestRate', numValue);
                          }
                        }
                      }}
                      onBlur={(e) => {
                        // Clear display string on blur, keep numeric value
                        updateDebt(debt.id, 'interestRateString', undefined);
                      }}
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
              </div>
            </div>
          ))}
        </div>

        {/* Add debt and Clear buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleAddDebt}
            className="flex-1 py-3 border-2 border-dashed rounded-lg transition-all flex items-center justify-center gap-2"
            style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#4DABF7';
              e.currentTarget.style.color = '#4DABF7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.color = '#6B7280';
            }}
          >
            <Plus size={20} />
            Add another debt
          </button>
          <button
            onClick={handleClearAll}
            className="px-6 py-3 border-2 rounded-lg transition-all flex items-center justify-center gap-2"
            style={{ borderColor: '#FCA5A5', color: '#DC2626', backgroundColor: '#FEE2E2' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#DC2626';
              e.currentTarget.style.backgroundColor = '#FECACA';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#FCA5A5';
              e.currentTarget.style.backgroundColor = '#FEE2E2';
            }}
          >
            <Trash2 size={18} />
            Clear All
          </button>
        </div>

        {/* Summary */}
        {totalDebt > 0 && (
          <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: '#FFE066' }}>
            <div className="grid md:grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm mb-1" style={{ color: '#6B7280' }}>Total debt</p>
                <p className="text-3xl font-bold" style={{ color: '#FF9800' }}>
                  {formatCurrency(totalDebt, currency.code)}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#6B7280' }}>Total monthly payments</p>
                <p className="text-3xl font-bold" style={{ color: '#FF9800' }}>
                  {formatCurrency(totalMonthly, currency.code)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Privacy */}
        <div className="text-center mb-6">
          <p className="text-sm" style={{ color: '#6B7280' }}>
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
            className="px-8 py-3 text-white rounded-lg font-semibold shadow-lg"
            style={{ backgroundColor: '#37B24D' }}
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
            onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
          >
            I don't have any debts
          </button>
        </div>
      </div>
    </div>
  );
}
