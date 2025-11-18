'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, CreditCard } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { formatCurrency, getCurrency } from '@/lib/currency';
import PrivacyBadge from '@/components/PrivacyBadge';

type DebtType = 'credit_card' | 'personal_loan' | 'car_loan' | 'student_loan' | 'mortgage';

interface Debt {
  id: string;
  name: string;
  debtType: DebtType;
  balance: number;
  monthlyPayment: number;
  interestRate?: number;
  interestRateString?: string; // For display while typing
  // For loans (personal/car/student)
  loanAmount?: number;
  loanTermYears?: number;
  // For mortgage
  homePrice?: number;
  downPayment?: number;
  mortgageTermYears?: number;
  startDate?: string;
  monthsToPayoff?: number;
}

// Calculation functions
function calcMonthlyPayment(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  const m = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return parseFloat(m.toFixed(2));
}

function calcCreditCardMonths(balance: number, monthlyPayment: number, annualRate: number): number {
  const r = annualRate / 100 / 12;
  if (monthlyPayment <= balance * r) return Infinity;
  const months = -1 * Math.log(1 - (balance * r / monthlyPayment)) / Math.log(1 + r);
  return Math.ceil(months);
}

function calcAmortizedLoanMonths(principal: number, monthlyPayment: number, annualRate: number): number {
  const r = annualRate / 100 / 12;
  if (monthlyPayment <= principal * r) return Infinity;
  const months = Math.log(monthlyPayment / (monthlyPayment - principal * r)) / Math.log(1 + r);
  return Math.ceil(months);
}

export default function DebtsPage() {
  const router = useRouter();
  const [currency, setCurrency] = useState<ReturnType<typeof getCurrency> | null>(null);
  const addDebt = useUserStore((state) => state.addDebt);
  
  const [debts, setDebts] = useState<Debt[]>([
    { id: '1', name: '', debtType: 'credit_card', balance: 0, monthlyPayment: 0 }
  ]);

  useEffect(() => {
    setCurrency(getCurrency());
  }, []);

  const handleAddDebt = () => {
    setDebts([
      ...debts,
      { id: Date.now().toString(), name: '', debtType: 'credit_card', balance: 0, monthlyPayment: 0 }
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
      { id: Date.now().toString(), name: '', debtType: 'credit_card', balance: 0, monthlyPayment: 0 }
    ]);
  };

  const updateDebt = (id: string, field: keyof Debt, value: any, additionalUpdates?: Partial<Debt>) => {
    setDebts(debts.map(d => {
      if (d.id !== id) return d;
      
      const updated = { ...d, [field]: value, ...additionalUpdates };
      
      // When debtType changes, reset relevant fields
      if (field === 'debtType') {
        if (value === 'mortgage') {
          // Reset mortgage-specific fields, keep name
          updated.balance = 0;
          updated.monthlyPayment = 0;
          updated.homePrice = 0;
          updated.downPayment = 0;
          updated.mortgageTermYears = 30;
          updated.loanAmount = 0;
        } else if (value === 'credit_card') {
          // Reset loan-specific fields
          updated.loanAmount = undefined;
          updated.loanTermYears = undefined;
          updated.homePrice = undefined;
          updated.downPayment = undefined;
          updated.mortgageTermYears = undefined;
          updated.startDate = undefined;
        } else {
          // For personal/car/student loans
          updated.balance = 0;
          updated.loanAmount = 0;
          updated.loanTermYears = undefined;
          updated.homePrice = undefined;
          updated.downPayment = undefined;
          updated.mortgageTermYears = undefined;
          updated.startDate = undefined;
        }
      }
      
      // Auto-calculate mortgage fields
      if (updated.debtType === 'mortgage') {
        // Recalculate loan amount if home price or down payment changed
        if (field === 'homePrice' || field === 'downPayment') {
          const homePrice = field === 'homePrice' ? (value || 0) : (updated.homePrice || 0);
          const downPayment = field === 'downPayment' ? (value || 0) : (updated.downPayment || 0);
          updated.loanAmount = Math.max(0, homePrice - downPayment);
        }
        
        // Recalculate monthly payment whenever relevant fields change
        const loanAmount = updated.loanAmount || 0;
        const interestRate = updated.interestRate || 0;
        const termYears = updated.mortgageTermYears || 30;
        
        if (loanAmount > 0 && interestRate > 0 && termYears > 0) {
          updated.monthlyPayment = calcMonthlyPayment(loanAmount, interestRate, termYears);
          updated.monthsToPayoff = termYears * 12;
        } else {
          updated.monthlyPayment = 0;
          updated.monthsToPayoff = 0;
        }
      }
      
      return updated;
    }));
  };

  const totalDebt = debts.reduce((sum, d) => {
    if (d.debtType === 'mortgage') {
      return sum + (d.loanAmount || 0);
    } else if (d.debtType === 'personal_loan' || d.debtType === 'car_loan' || d.debtType === 'student_loan') {
      return sum + (d.loanAmount || d.balance || 0);
    }
    return sum + (d.balance || 0);
  }, 0);
  const totalMonthly = debts.reduce((sum, d) => sum + (d.monthlyPayment || 0), 0);

  const handleContinue = () => {
    // Clear existing debts first (in case user is re-entering)
    const currentDebts = [...useUserStore.getState().debts];
    currentDebts.forEach(debt => {
      useUserStore.getState().removeDebt(debt.id);
    });
    
    // Calculate monthsToPayoff for each debt before saving
    const debtsWithCalculations = debts.map(debt => {
      let monthsToPayoff = 0;
      
      if (debt.debtType === 'mortgage') {
        monthsToPayoff = (debt.mortgageTermYears || 30) * 12;
      } else if (debt.debtType === 'credit_card') {
        if (debt.balance > 0 && debt.monthlyPayment > 0 && debt.interestRate) {
          monthsToPayoff = calcCreditCardMonths(debt.balance, debt.monthlyPayment, debt.interestRate);
        } else {
          monthsToPayoff = Infinity;
        }
      } else {
        // personal_loan, car_loan, student_loan
        const principal = debt.loanAmount || debt.balance || 0;
        if (principal > 0 && debt.monthlyPayment > 0 && debt.interestRate) {
          monthsToPayoff = calcAmortizedLoanMonths(principal, debt.monthlyPayment, debt.interestRate);
        } else {
          monthsToPayoff = Infinity;
        }
      }
      
      return { ...debt, monthsToPayoff };
    });
    
    // Save valid debts to store
    const validDebts = debtsWithCalculations.filter(debt => {
      if (!debt.name || debt.name.trim() === '') return false;
      if (debt.monthlyPayment <= 0) return false;
      
      if (debt.debtType === 'mortgage') {
        return (debt.loanAmount || 0) > 0;
      } else if (debt.debtType === 'personal_loan' || debt.debtType === 'car_loan' || debt.debtType === 'student_loan') {
        return (debt.loanAmount || debt.balance || 0) > 0;
      } else {
        return debt.balance > 0;
      }
    });
    
    console.log('Valid debts to save:', validDebts);
    
    if (validDebts.length === 0) {
      // No valid debts, just go to results
      console.log('No valid debts found');
      router.push('/onboarding/results');
      return;
    }
    
    // Add each valid debt
    validDebts.forEach(debt => {
      const debtData: any = {
        id: debt.id,
        type: debt.name,
        name: debt.name,
        debtType: debt.debtType,
        interestRate: debt.interestRate || 0,
        monthlyPayment: debt.monthlyPayment,
        monthsToPayoff: debt.monthsToPayoff
      };
      
      if (debt.debtType === 'mortgage') {
        debtData.homePrice = debt.homePrice || 0;
        debtData.downPayment = debt.downPayment || 0;
        // Ensure loanAmount is calculated from homePrice - downPayment
        const calculatedLoanAmount = Math.max(0, (debt.homePrice || 0) - (debt.downPayment || 0));
        debtData.loanAmount = calculatedLoanAmount;
        debtData.mortgageTermYears = debt.mortgageTermYears || 30;
        if (debt.startDate) debtData.startDate = debt.startDate;
        debtData.balance = calculatedLoanAmount; // For compatibility - use calculated value
        
        console.log('Saving mortgage:', {
          name: debtData.name,
          homePrice: debtData.homePrice,
          downPayment: debtData.downPayment,
          loanAmount: debtData.loanAmount,
          balance: debtData.balance,
          monthlyPayment: debtData.monthlyPayment
        });
      } else if (debt.debtType === 'personal_loan' || debt.debtType === 'car_loan' || debt.debtType === 'student_loan') {
        // Ensure loanAmount is set correctly - use loanAmount if set, otherwise use balance
        const calculatedLoanAmount = (debt.loanAmount !== undefined && debt.loanAmount !== null) 
          ? debt.loanAmount 
          : (debt.balance || 0);
        debtData.loanAmount = calculatedLoanAmount;
        debtData.loanTermYears = debt.loanTermYears;
        debtData.balance = calculatedLoanAmount; // For compatibility
        
        console.log('Saving loan:', {
          name: debtData.name,
          debtType: debtData.debtType,
          loanAmount: debtData.loanAmount,
          balance: debtData.balance,
          monthlyPayment: debtData.monthlyPayment
        });
      } else {
        debtData.balance = debt.balance;
      }
      
      addDebt(debtData);
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

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                    Debt Type
                  </label>
                  <select
                    value={debt.debtType}
                    onChange={(e) => updateDebt(debt.id, 'debtType', e.target.value as DebtType)}
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

                {/* Credit Card Fields */}
                {debt.debtType === 'credit_card' && (
                  <>
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
                            const parts = cleaned.split('.');
                            const sanitized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
                            
                            updateDebt(debt.id, 'interestRateString', sanitized);
                            
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
                    
                    {/* Warning for impossible values */}
                    {debt.balance > 0 && debt.interestRate && debt.monthlyPayment > 0 && debt.monthlyPayment <= (debt.balance * (debt.interestRate / 100 / 12)) && (
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', borderWidth: '1px' }}>
                        <p className="text-sm" style={{ color: '#991B1B' }}>
                          ⚠️ Warning: Monthly payment is too low to cover interest. This debt may never be paid off.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Personal/Car/Student Loan Fields */}
                {(debt.debtType === 'personal_loan' || debt.debtType === 'car_loan' || debt.debtType === 'student_loan') && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                          Loan amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }}>
                            {currency.symbol}
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={debt.loanAmount || debt.balance || ''}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0;
                              updateDebt(debt.id, 'loanAmount', value);
                              updateDebt(debt.id, 'balance', value); // Keep balance for compatibility
                            }}
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
                          Loan term (years)
                        </label>
                        <input
                          type="number"
                          value={debt.loanTermYears || ''}
                          onChange={(e) => updateDebt(debt.id, 'loanTermYears', parseFloat(e.target.value) || undefined)}
                          placeholder="e.g. 3"
                          className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                          style={{ borderColor: '#E5E7EB' }}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                          onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                          Interest rate (%)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={debt.interestRateString !== undefined ? debt.interestRateString : (debt.interestRate !== undefined ? debt.interestRate.toString() : '')}
                            onChange={(e) => {
                              const cleaned = e.target.value.replace(/[^\d.]/g, '');
                              const parts = cleaned.split('.');
                              const sanitized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
                              
                              updateDebt(debt.id, 'interestRateString', sanitized);
                              
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
                              updateDebt(debt.id, 'interestRateString', undefined);
                            }}
                            placeholder="e.g. 8.5"
                            className="w-full pr-12 px-4 py-3 border-2 rounded-lg focus:outline-none"
                            style={{ borderColor: '#E5E7EB' }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }}>
                            %
                          </span>
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
                    
                    {/* Warning for impossible values */}
                    {(debt.loanAmount || debt.balance) && (debt.loanAmount || debt.balance) > 0 && debt.interestRate && debt.monthlyPayment > 0 && debt.monthlyPayment <= ((debt.loanAmount || debt.balance || 0) * (debt.interestRate / 100 / 12)) && (
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', borderWidth: '1px' }}>
                        <p className="text-sm" style={{ color: '#991B1B' }}>
                          ⚠️ Warning: Monthly payment is too low to cover interest. This debt may never be paid off.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Mortgage Fields */}
                {debt.debtType === 'mortgage' && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                          Home Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }}>
                            {currency.symbol}
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={debt.homePrice || ''}
                            onChange={(e) => updateDebt(debt.id, 'homePrice', parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0)}
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
                          Down Payment
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }}>
                            {currency.symbol}
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={debt.downPayment || ''}
                            onChange={(e) => updateDebt(debt.id, 'downPayment', parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0)}
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
                        Loan Amount (auto-calculated)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }}>
                          {currency.symbol}
                        </span>
                        <input
                          type="text"
                          value={formatCurrency(debt.loanAmount || 0, currency.code)}
                          readOnly
                          className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none bg-gray-50"
                          style={{ borderColor: '#E5E7EB', color: '#6B7280' }}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                          Interest Rate (%)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={debt.interestRateString !== undefined ? debt.interestRateString : (debt.interestRate !== undefined ? debt.interestRate.toString() : '')}
                            onChange={(e) => {
                              // Allow digits and decimal point
                              let cleaned = e.target.value.replace(/[^\d.]/g, '');
                              
                              // Ensure only one decimal point
                              const parts = cleaned.split('.');
                              if (parts.length > 2) {
                                cleaned = parts[0] + '.' + parts.slice(1).join('');
                              }
                              
                              // Update both display string and numeric value in one call
                              const updates: Partial<Debt> = {
                                interestRateString: cleaned
                              };
                              
                              if (cleaned === '' || cleaned === '.') {
                                updates.interestRate = undefined;
                              } else {
                                const numValue = parseFloat(cleaned);
                                if (!isNaN(numValue) && numValue >= 0) {
                                  updates.interestRate = numValue;
                                }
                              }
                              
                              updateDebt(debt.id, 'interestRateString', cleaned, updates);
                            }}
                            onBlur={(e) => {
                              // Clear display string on blur, keep numeric value
                              updateDebt(debt.id, 'interestRateString', undefined);
                            }}
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

                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                          Mortgage Term (years)
                        </label>
                        <input
                          type="number"
                          value={debt.mortgageTermYears || 30}
                          onChange={(e) => updateDebt(debt.id, 'mortgageTermYears', parseFloat(e.target.value) || 30)}
                          placeholder="30"
                          className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                          style={{ borderColor: '#E5E7EB' }}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                          onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                          Mortgage Start Date (optional)
                        </label>
                        <input
                          type="date"
                          value={debt.startDate || ''}
                          onChange={(e) => updateDebt(debt.id, 'startDate', e.target.value || undefined)}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                          style={{ borderColor: '#E5E7EB' }}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                          onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                          Monthly Payment (auto-calculated)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }}>
                            {currency.symbol}
                          </span>
                          <input
                            type="text"
                            value={formatCurrency(debt.monthlyPayment || 0, currency.code)}
                            readOnly
                            className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none bg-gray-50"
                            style={{ borderColor: '#E5E7EB', color: '#6B7280' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Warning for impossible values */}
                    {debt.loanAmount && debt.loanAmount > 0 && debt.interestRate && debt.monthlyPayment > 0 && debt.monthlyPayment <= (debt.loanAmount * (debt.interestRate / 100 / 12)) && (
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', borderWidth: '1px' }}>
                        <p className="text-sm" style={{ color: '#991B1B' }}>
                          ⚠️ Warning: Monthly payment is too low to cover interest. This debt may never be paid off.
                        </p>
                      </div>
                    )}
                  </>
                )}
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
