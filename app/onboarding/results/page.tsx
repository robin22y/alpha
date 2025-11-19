'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, TrendingUp, DollarSign, Target, ArrowRight } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { formatCurrency, getCurrency } from '@/lib/currency';
import {
  calculateIncomeBreakdown,
  calculateDebtProjection,
  calculatePhases,
  calculateInterestSavings,
  formatDate
} from '@/lib/calculations';
import PrivacyBadge from '@/components/PrivacyBadge';
import { computeDebtsFromStore, calculateDebtTotals } from '@/lib/debtUtils';
import type { DebtComputed } from '@/lib/debtEngine';

export default function ResultsPage() {
  const router = useRouter();
  const [currency, setCurrency] = useState<ReturnType<typeof getCurrency> | null>(null);
  
  const finances = useUserStore((state) => state.finances);
  const habit = useUserStore((state) => state.habit);
  const debts = useUserStore((state) => state.debts);
  const goal = useUserStore((state) => state.goal);
  const timeline = useUserStore((state) => state.timeline);
  const initializeFromLocalStorage = useUserStore((state) => state.initializeFromLocalStorage);

  // Compute debts using debt engine (same as dashboard)
  const computedDebts: DebtComputed[] = debts.length > 0 ? computeDebtsFromStore(debts) : [];
  const debtTotals = computedDebts.length > 0 ? calculateDebtTotals(computedDebts) : {
    totalDebt: 0,
    totalMonthlyPayment: 0,
    totalInterest: 0
  };

  useEffect(() => {
    // Initialize from localStorage first
    initializeFromLocalStorage();
    setCurrency(getCurrency());
  }, [initializeFromLocalStorage]);

  useEffect(() => {
    // Debug: log current state
    console.log('Results page - Debts from store:', debts);
    console.log('Results page - Computed debts:', computedDebts);
    console.log('Results page - Debt totals:', debtTotals);
    console.log('Results page - Debts count:', debts.length);
  }, [debts, computedDebts, debtTotals]);

  // Check if there are debts using computed totals
  const hasDebt = computedDebts.length > 0 && debtTotals.totalDebt > 0;
  
  // Use computed totals for projections
  const totalDebt = debtTotals.totalDebt;
  const totalMonthlyPayment = debtTotals.totalMonthlyPayment;
  
  // Calculate projections
  const incomeBreakdown = calculateIncomeBreakdown(finances.monthlyIncome);
  
  // Use customAmount if set, otherwise use onePercentAmount
  const habitAmount = habit.customAmount || habit.onePercentAmount || 0;
  const isCustomAmount = habit.customAmount !== undefined && habit.customAmount !== null;
  
  const debtProjection = hasDebt ? calculateDebtProjection(
    computedDebts,
    habitAmount,
    habit.committed
  ) : null;
  
  const phases = hasDebt ? calculatePhases(
    computedDebts,
    habitAmount,
    habit.committed,
    isCustomAmount
  ) : [];
  
  // Calculate interest savings if habit is committed and we have debt data
  const interestSavings = hasDebt && habit.committed && debtProjection && computedDebts.length > 0
    ? calculateInterestSavings(
        computedDebts,
        debtProjection.currentTimeline,
        debtProjection.with1Percent,
        habitAmount
      )
    : null;

  if (!currency) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-bold text-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, white, rgba(129, 233, 154, 0.2), rgba(116, 192, 252, 0.2))' }}>
      <PrivacyBadge />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#51CF66' }}>
            <Target size={48} style={{ color: '#FFFFFF' }} />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#000000' }}>
            Your Breakdown
          </h1>
          <p className="text-lg" style={{ color: '#666666' }}>
            Based on the numbers you entered
          </p>
        </div>

        {/* Current situation */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#000000' }}>
            <DollarSign style={{ color: '#4DABF7' }} />
            Your Current Breakdown
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#74C0FC' }}>
              <p className="text-sm mb-1" style={{ color: '#666666' }}>Monthly Income</p>
              <p className="text-2xl font-bold" style={{ color: '#1C7ED6' }}>
                {formatCurrency(finances.monthlyIncome, currency.code)}
              </p>
            </div>

            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
              <p className="text-sm mb-1" style={{ color: '#666666' }}>Monthly Spending</p>
              <p className="text-2xl font-bold" style={{ color: '#B91C1C' }}>
                {formatCurrency(finances.monthlySpending, currency.code)}
              </p>
            </div>

            <div className={`text-center p-4 rounded-lg ${
              finances.monthlyLeftover >= 0 ? '' : ''
            }`} style={{ backgroundColor: finances.monthlyLeftover >= 0 ? '#8CE99A' : '#FEE2E2' }}>
              <p className="text-sm mb-1" style={{ color: '#666666' }}>Monthly Leftover</p>
              <p className={`text-2xl font-bold ${
                finances.monthlyLeftover >= 0 ? '' : ''
              }`} style={{ color: finances.monthlyLeftover >= 0 ? '#37B24D' : '#B91C1C' }}>
                {formatCurrency(finances.monthlyLeftover, currency.code)}
              </p>
            </div>
          </div>

          {/* Simple pie chart placeholder */}
          <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#F9FAFB' }}>
            <p className="text-lg font-semibold mb-4" style={{ color: '#000000' }}>Income Type</p>
            <div className="max-w-xs mx-auto">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-32 h-32 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #FF6B6B, #E03131)' }}>
                  <div className="text-center text-white">
                    <p className="text-3xl font-bold">{incomeBreakdown.activePercentage}%</p>
                    <p className="text-xs">Active</p>
                  </div>
                </div>
              </div>
              <p className="text-sm" style={{ color: '#666666' }}>
                Currently, {incomeBreakdown.activePercentage}% of your income comes from active work
              </p>
            </div>
          </div>
        </div>

        {/* Debt projections */}
        {hasDebt && debtProjection ? (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#000000' }}>
              <Calendar style={{ color: '#51CF66' }} />
              Your Debt-Free Timeline
            </h2>

            <div className="rounded-lg p-6 mb-6 text-center" style={{ backgroundColor: '#FFE066' }}>
              <p className="text-sm mb-2" style={{ color: '#666666' }}>Total Debt</p>
              <p className="text-4xl font-bold mb-1" style={{ color: '#FF9800' }}>
                {formatCurrency(totalDebt, currency.code)}
              </p>
              <p className="text-sm" style={{ color: '#666666' }}>
                Paying {formatCurrency(totalMonthlyPayment, currency.code)}/month
              </p>
            </div>

            {/* Individual Debt Breakdown */}
            {computedDebts.length > 0 && (
              <div className="mb-6 bg-white rounded-lg p-6 border-2" style={{ borderColor: '#E5E7EB' }}>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#000000' }}>
                  Individual Debt Breakdown
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b-2" style={{ borderColor: '#E5E7EB' }}>
                        <th className="pb-3 pr-4 text-sm font-semibold" style={{ color: '#374151' }}>Debt</th>
                        <th className="pb-3 pr-4 text-sm font-semibold text-right" style={{ color: '#374151' }}>Balance</th>
                        <th className="pb-3 pr-4 text-sm font-semibold text-right" style={{ color: '#374151' }}>Rate</th>
                        <th className="pb-3 pr-4 text-sm font-semibold text-right" style={{ color: '#374151' }}>Monthly Payment</th>
                        <th className="pb-3 pr-4 text-sm font-semibold text-right" style={{ color: '#374151' }}>Term</th>
                        <th className="pb-3 pr-4 text-sm font-semibold text-right" style={{ color: '#374151' }}>Payoff Date</th>
                        <th className="pb-3 pr-4 text-sm font-semibold text-right" style={{ color: '#374151' }}>Total Interest</th>
                        <th className="pb-3 text-sm font-semibold text-right" style={{ color: '#374151' }}>Months</th>
                      </tr>
                    </thead>
                    <tbody>
                      {computedDebts.map((debt, idx) => {
                        const debtBalance = debt.debtType === 'mortgage' ? debt.principal : debt.balance;
                        const payoffDate = new Date();
                        payoffDate.setMonth(payoffDate.getMonth() + (debt.monthsToPayoff === Infinity ? 999 : debt.monthsToPayoff));
                        const isImpossible = debt.monthsToPayoff === Infinity;
                        const mortgageDebt = debt.debtType === 'mortgage' ? debt as any : null;
                        
                        return (
                          <tr key={debt.id} className={`border-b ${idx === computedDebts.length - 1 ? 'border-b-0' : ''}`} style={{ borderColor: '#F3F4F6' }}>
                            <td className="py-3 pr-4">
                              <div>
                                <p className="font-medium" style={{ color: '#000000' }}>{debt.name}</p>
                                <p className="text-xs" style={{ color: '#6B7280' }}>
                                  {debt.debtType === 'mortgage' ? 'Mortgage' :
                                   debt.debtType === 'car_loan' ? 'Car Loan' :
                                   debt.debtType === 'personal_loan' ? 'Personal Loan' :
                                   debt.debtType === 'student_loan' ? 'Student Loan' :
                                   'Credit Card'}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-right font-medium" style={{ color: '#000000' }}>
                              {formatCurrency(debtBalance || 0, currency.code)}
                            </td>
                            <td className="py-3 pr-4 text-right" style={{ color: '#374151' }}>
                              {debt.interestRate.toFixed(2)}%
                            </td>
                            <td className="py-3 pr-4 text-right font-medium" style={{ color: '#000000' }}>
                              {formatCurrency(debt.monthlyPayment, currency.code)}
                            </td>
                            <td className="py-3 pr-4 text-right" style={{ color: '#374151' }}>
                              {debt.debtType === 'mortgage' && mortgageDebt?.termYears ? (
                                <span>{mortgageDebt.termYears} years</span>
                              ) : (
                                <span className="text-xs">—</span>
                              )}
                            </td>
                            <td className="py-3 pr-4 text-right" style={{ color: isImpossible ? '#DC2626' : '#374151' }}>
                              {isImpossible ? (
                                <span className="text-xs font-medium">Never</span>
                              ) : (
                                <span>{formatDate(payoffDate)}</span>
                              )}
                            </td>
                            <td className="py-3 pr-4 text-right" style={{ color: '#374151' }}>
                              {debt.totalInterest === Infinity ? (
                                <span className="text-xs">—</span>
                              ) : (
                                formatCurrency(debt.totalInterest, currency.code)
                              )}
                            </td>
                            <td className="py-3 text-right" style={{ color: isImpossible ? '#DC2626' : '#374151' }}>
                              {isImpossible ? (
                                <span className="text-xs font-medium">∞</span>
                              ) : (
                                <span>{debt.monthsToPayoff}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {computedDebts.some(d => d.monthsToPayoff === Infinity) && (
                  <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
                    <p className="text-sm font-medium" style={{ color: '#991B1B' }}>
                      ⚠️ Some debts cannot be paid off with the current monthly payment. Consider increasing payments or seeking financial advice.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Phase comparison */}
            <div className="space-y-4">
              {phases.map((phase, idx) => (
                <div
                  key={idx}
                  className={`border-2 rounded-lg p-6 ${
                    idx === 0 ? '' : ''
                  }`}
                  style={{ 
                    borderColor: idx === 0 ? '#D1D5DB' : '#51CF66',
                    backgroundColor: idx > 0 ? 'rgba(129, 233, 154, 0.1)' : 'transparent'
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-lg" style={{ color: '#000000' }}>{phase.label}</p>
                      <p className="text-sm" style={{ color: '#666666' }}>
                        {phase.description.includes('Add') && currency ? 
                          `Add ${formatCurrency(parseFloat(phase.description.match(/\d+/)?.[0] || '0'), currency.code)}/month` :
                          phase.description
                        }
                      </p>
                    </div>
                    {idx > 0 && (
                      <div className="px-3 py-1 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: '#51CF66' }}>
                        Recommended
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm mb-1" style={{ color: '#666666' }}>Estimated Timeline</p>
                      <p className="text-2xl font-bold" style={{ color: '#37B24D' }}>
                        {phase.timelineMonths} months
                      </p>
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ color: '#666666' }}>Estimated Debt-Free Date</p>
                      <p className="text-2xl font-bold" style={{ color: '#37B24D' }}>
                        {formatDate(phase.debtFreeDate)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {habit.committed && debtProjection.timeSaved > 0 && (
              <div className="mt-6 border-2 rounded-lg p-6 text-center" style={{ backgroundColor: '#8CE99A', borderColor: '#51CF66' }}>
                <p className="text-lg font-semibold mb-2" style={{ color: '#000000' }}>
                  ⚡ By committing to {isCustomAmount ? 'your step-up strategy' : 'the 1% habit'}:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-2xl font-bold mb-1" style={{ color: '#37B24D' }}>
                      {debtProjection.timeSaved} months faster
                    </p>
                    <p className="text-sm" style={{ color: '#666666' }}>
                      {Math.floor(debtProjection.timeSaved / 12) > 0 && (
                        <>That's {Math.floor(debtProjection.timeSaved / 12)} year{Math.floor(debtProjection.timeSaved / 12) !== 1 ? 's' : ''} saved!</>
                      )}
                      {Math.floor(debtProjection.timeSaved / 12) === 0 && (
                        <>Time saved on your debt-free journey</>
                      )}
                    </p>
                  </div>
                  {interestSavings && interestSavings.interestSaved > 0 && (
                    <div>
                      <p className="text-2xl font-bold mb-1" style={{ color: '#37B24D' }}>
                        {formatCurrency(interestSavings.interestSaved, currency.code)} saved
                      </p>
                      <p className="text-sm" style={{ color: '#666666' }}>
                        Approximately in interest payments
                      </p>
                    </div>
                  )}
                </div>
                {interestSavings && interestSavings.interestSaved > 0 && (
                  <p className="text-xs mt-2" style={{ color: '#666666' }}>
                    * Interest calculation is approximate and based on average balance method
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (computedDebts.length === 0 || debtTotals.totalDebt === 0) ? (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#000000' }}>
              <Calendar style={{ color: '#51CF66' }} />
              Your Debt-Free Timeline
            </h2>
            <div className="text-center p-8">
              <p className="text-lg mb-4" style={{ color: '#666666' }}>
                No debts entered
              </p>
              <p className="text-sm" style={{ color: '#666666' }}>
                You can add debts later from your dashboard
              </p>
            </div>
          </div>
        ) : null}

        {/* Goal reminder */}
        {goal.label && (
          <div className="rounded-lg p-6 mb-6 text-center" style={{ backgroundColor: '#74C0FC' }}>
            <p className="text-lg mb-2" style={{ color: '#000000' }}>Your goal:</p>
            <p className="text-2xl font-bold" style={{ color: '#1C7ED6' }}>{goal.label}</p>
            {timeline.targetDate && (
              <p className="text-sm mt-2" style={{ color: '#666666' }}>
                Target: {formatDate(new Date(timeline.targetDate))}
              </p>
            )}
          </div>
        )}

        {/* Methodology & Disclaimer */}
        <div className="border rounded-lg p-6 mb-6" style={{ backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }}>
          <h3 className="text-lg font-bold mb-3" style={{ color: '#000000' }}>Calculation Methodology</h3>
          <div className="text-sm space-y-2 mb-4" style={{ color: '#374151' }}>
            <p><strong>Mortgages:</strong> Standard amortizing loans with fixed monthly payments calculated using the standard amortization formula. Interest is compounded monthly.</p>
            <p><strong>Credit Cards:</strong> Revolving credit calculations assume fixed monthly payments with interest applied to the remaining balance each month.</p>
            <p><strong>Installment Loans (Car, Personal, Student):</strong> Amortized loans calculated using the standard amortization formula with monthly compounding.</p>
            <p><strong>Assumptions:</strong> All calculations assume constant interest rates, fixed monthly payments, and no additional fees or charges. Extra payments are applied directly to principal reduction.</p>
          </div>
          <div className="border-t pt-4 text-sm text-center" style={{ borderColor: '#FCD34D' }}>
            <p style={{ color: '#374151' }}>
              <strong>Important:</strong> These are simplified estimates for planning purposes only. 
              Actual timelines depend on your specific situation, interest rates, and commitment. 
              This is not financial advice. Consult with a qualified financial advisor for personalized guidance.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => router.push('/onboarding/restore-code')}
            className="inline-flex items-center gap-3 text-white text-xl px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all mb-4"
            style={{ backgroundColor: '#37B24D' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2F9E44'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#37B24D'}
          >
            Save Your Progress
            <ArrowRight size={24} />
          </button>
          <p className="text-sm" style={{ color: '#666666' }}>
            Get your restore code to access this on any device
          </p>
        </div>
      </div>
    </div>
  );
}

