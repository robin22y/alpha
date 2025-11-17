'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, TrendingDown, AlertCircle, DollarSign } from 'lucide-react';
import { 
  calculateCredit,
  calculateMinimumPayment,
  formatMonthsAsYearsMonths,
  CreditCalculation
} from '@/lib/calculators';
import { formatCurrency, getCurrency } from '@/lib/currency';
import Navigation from '@/components/Navigation';
import PrivacyBadge from '@/components/PrivacyBadge';

export default function CreditCalculatorPage() {
  const router = useRouter();
  const [currency, setCurrency] = useState<ReturnType<typeof getCurrency> | null>(null);
  const [amount, setAmount] = useState<number>(1000);
  const [apr, setApr] = useState<number>(21.9);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(50);
  const [minPayment, setMinPayment] = useState<number>(0);
  const [calculation, setCalculation] = useState<CreditCalculation | null>(null);
  const [minCalculation, setMinCalculation] = useState<CreditCalculation | null>(null);

  useEffect(() => {
    setCurrency(getCurrency());
  }, []);

  useEffect(() => {
    if (amount > 0) {
      const min = calculateMinimumPayment(amount);
      setMinPayment(min);
    }
  }, [amount]);

  useEffect(() => {
    if (amount > 0 && monthlyPayment > 0 && currency) {
      const result = calculateCredit(amount, apr, monthlyPayment);
      setCalculation(result);
      
      if (minPayment > 0) {
        const minResult = calculateCredit(amount, apr, minPayment);
        setMinCalculation(minResult);
      }
    }
  }, [amount, apr, monthlyPayment, minPayment, currency]);

  if (!currency) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, white, #FED7AA, #FEE2E2)' }}>
        <PrivacyBadge />
        
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 mb-6"
            style={{ color: '#666666' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#374151'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#666666'; }}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#FED7AA' }}>
              <CreditCard size={48} style={{ color: '#EA580C' }} />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#000000' }}>
              Cost of Credit Calculator
            </h1>
            <p className="text-lg" style={{ color: '#666666' }}>
              See the real cost of buying on credit
            </p>
          </div>

          {/* Disclaimer */}
          <div className="border-2 rounded-lg p-4 mb-8" style={{ backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }}>
            <p className="text-sm text-center" style={{ color: '#374151' }}>
              <strong>Educational tool only.</strong> Simplified calculations for illustration. 
              Real terms vary. Not financial advice.
            </p>
          </div>

          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
            <h3 className="text-xl font-bold mb-6" style={{ color: '#000000' }}>Your Purchase</h3>

            <div className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>
                  Purchase Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: '#999999' }}>
                    {currency.symbol}
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-3 text-lg border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: '#E5E7EB' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#EA580C'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  />
                </div>
              </div>

              {/* APR */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>
                  Annual Interest Rate (APR %)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={apr}
                  onChange={(e) => setApr(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#E5E7EB' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#EA580C'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                />
                <p className="text-xs mt-1" style={{ color: '#999999' }}>
                  Typical UK credit card: 18-30%
                </p>
              </div>

              {/* Monthly Payment */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>
                  Monthly Payment
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: '#999999' }}>
                    {currency.symbol}
                  </span>
                  <input
                    type="number"
                    value={monthlyPayment}
                    onChange={(e) => setMonthlyPayment(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-3 text-lg border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: '#E5E7EB' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#EA580C'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: '#999999' }}>
                  Minimum payment would be: {formatCurrency(minPayment, currency.code)}
                </p>
              </div>
            </div>
          </div>

          {/* Results */}
          {calculation && (
            <>
              {/* Main Result */}
              <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
                <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: '#000000' }}>
                  Your Payment Plan
                </h3>

                <div className="grid md:grid-cols-3 gap-6 text-center mb-6">
                  <div>
                    <p className="text-sm mb-2" style={{ color: '#666666' }}>Time to Pay Off</p>
                    <p className="text-3xl font-bold" style={{ color: '#EA580C' }}>
                      {calculation.monthsToPay > 99 
                        ? '10+ years'
                        : formatMonthsAsYearsMonths(calculation.monthsToPay)
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm mb-2" style={{ color: '#666666' }}>Total Interest Paid</p>
                    <p className="text-3xl font-bold" style={{ color: '#DC2626' }}>
                      {formatCurrency(calculation.totalInterest, currency.code)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm mb-2" style={{ color: '#666666' }}>Total Amount Paid</p>
                    <p className="text-3xl font-bold" style={{ color: '#374151' }}>
                      {formatCurrency(calculation.totalPaid, currency.code)}
                    </p>
                  </div>
                </div>

                {/* Visual breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span style={{ color: '#000000' }}>Original Purchase</span>
                    <span style={{ color: '#000000' }}>{formatCurrency(amount, currency.code)}</span>
                  </div>
                  <div className="w-full rounded-full h-6 overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
                    <div className="flex h-full">
                      <div 
                        style={{ width: `${(amount / calculation.totalPaid) * 100}%`, backgroundColor: '#EA580C' }}
                      />
                      <div 
                        style={{ width: `${(calculation.totalInterest / calculation.totalPaid) * 100}%`, backgroundColor: '#DC2626' }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: '#000000' }}>+ Interest</span>
                    <span style={{ color: '#000000' }}>{formatCurrency(calculation.totalInterest, currency.code)}</span>
                  </div>
                </div>

                {/* Warning if interest is high */}
                {calculation.totalInterest > amount * 0.2 && (
                  <div className="mt-6 border-2 rounded-lg p-4" style={{ backgroundColor: '#FEE2E2', borderColor: '#FECACA' }}>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="flex-shrink-0" style={{ color: '#DC2626' }} size={24} />
                      <div>
                        <p className="font-semibold mb-1" style={{ color: '#991B1B' }}>
                          High Interest Cost
                        </p>
                        <p className="text-sm" style={{ color: '#7F1D1D' }}>
                          You'll pay {Math.round((calculation.totalInterest / amount) * 100)}% more 
                          than the original purchase price. Consider increasing your monthly payment 
                          or saving first if possible.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Minimum Payment Comparison */}
              {minCalculation && monthlyPayment > minPayment && (
                <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#000000' }}>
                    📊 Minimum Payment vs Your Payment
                  </h3>
                  <p className="mb-6" style={{ color: '#666666' }}>
                    See how much you save by paying more than the minimum
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Minimum Payment */}
                    <div className="p-4 border-2 rounded-lg" style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }}>
                      <p className="text-sm mb-2" style={{ color: '#666666' }}>Minimum Payment Only</p>
                      <p className="text-2xl font-bold mb-4" style={{ color: '#DC2626' }}>
                        {formatCurrency(minPayment, currency.code)}/month
                      </p>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span style={{ color: '#000000' }}>Timeline:</span>
                          <span className="font-semibold" style={{ color: '#000000' }}>
                            {minCalculation.monthsToPay > 99 
                              ? '10+ years'
                              : formatMonthsAsYearsMonths(minCalculation.monthsToPay)
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: '#000000' }}>Total Interest:</span>
                          <span className="font-semibold" style={{ color: '#DC2626' }}>
                            {formatCurrency(minCalculation.totalInterest, currency.code)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: '#000000' }}>Total Paid:</span>
                          <span className="font-semibold" style={{ color: '#000000' }}>
                            {formatCurrency(minCalculation.totalPaid, currency.code)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Your Payment */}
                    <div className="p-4 border-2 rounded-lg" style={{ backgroundColor: '#D1FAE5', borderColor: '#6EE7B7' }}>
                      <p className="text-sm mb-2" style={{ color: '#666666' }}>Your Payment</p>
                      <p className="text-2xl font-bold mb-4" style={{ color: '#10B981' }}>
                        {formatCurrency(monthlyPayment, currency.code)}/month
                      </p>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span style={{ color: '#000000' }}>Timeline:</span>
                          <span className="font-semibold" style={{ color: '#000000' }}>
                            {formatMonthsAsYearsMonths(calculation.monthsToPay)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: '#000000' }}>Total Interest:</span>
                          <span className="font-semibold" style={{ color: '#10B981' }}>
                            {formatCurrency(calculation.totalInterest, currency.code)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: '#000000' }}>Total Paid:</span>
                          <span className="font-semibold" style={{ color: '#000000' }}>
                            {formatCurrency(calculation.totalPaid, currency.code)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="mt-6 border-2 rounded-lg p-4 text-center" style={{ backgroundColor: '#D1FAE5', borderColor: '#10B981' }}>
                    <p className="text-sm mb-2" style={{ color: '#374151' }}>
                      By paying {formatCurrency(monthlyPayment - minPayment, currency.code)} more per month:
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold" style={{ color: '#10B981' }}>
                          {minCalculation.monthsToPay - calculation.monthsToPay} months
                        </p>
                        <p className="text-xs" style={{ color: '#666666' }}>Faster payoff</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold" style={{ color: '#10B981' }}>
                          {formatCurrency(minCalculation.totalInterest - calculation.totalInterest, currency.code)}
                        </p>
                        <p className="text-xs" style={{ color: '#666666' }}>Interest saved</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Educational Note */}
              <div className="border-2 rounded-lg p-6 text-center" style={{ backgroundColor: '#DBEAFE', borderColor: '#93C5FD' }}>
                <p style={{ color: '#374151' }}>
                  <strong>Key Insight:</strong> Small increases in monthly payments create 
                  large reductions in total interest paid. Even an extra £10-20/month matters.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

