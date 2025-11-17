'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Smartphone, TrendingUp, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import { 
  POPULAR_PHONES, 
  TYPICAL_CREDIT_RATES,
  compareOptions,
  formatMonthsAsYearsMonths,
  Comparison
} from '@/lib/calculators';
import { formatCurrency, getCurrency } from '@/lib/currency';
import Navigation from '@/components/Navigation';
import PrivacyBadge from '@/components/PrivacyBadge';

export default function PhoneCalculatorPage() {
  const router = useRouter();
  const [currency, setCurrency] = useState<ReturnType<typeof getCurrency> | null>(null);
  const [phonePrice, setPhonePrice] = useState<number>(799);
  const [selectedPhone, setSelectedPhone] = useState<string>('iPhone 16');
  const [monthlySavings, setMonthlySavings] = useState<number>(50);
  const [creditAPR, setCreditAPR] = useState<number>(21.9);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(50);
  const [comparison, setComparison] = useState<Comparison | null>(null);

  useEffect(() => {
    setCurrency(getCurrency());
  }, []);

  useEffect(() => {
    if (phonePrice > 0 && monthlySavings > 0 && monthlyPayment > 0 && currency) {
      const result = compareOptions(phonePrice, monthlySavings, creditAPR, monthlyPayment);
      setComparison(result);
    }
  }, [phonePrice, monthlySavings, creditAPR, monthlyPayment, currency]);

  const handlePhoneSelect = (phone: typeof POPULAR_PHONES[0]) => {
    setPhonePrice(phone.price);
    setSelectedPhone(`${phone.brand} ${phone.model}`);
  };

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
      <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, white, #DBEAFE, #E9D5FF)' }}>
        <PrivacyBadge />
        
        <div className="max-w-5xl mx-auto">
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
            <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#DBEAFE' }}>
              <Smartphone size={48} style={{ color: '#2563EB' }} />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#000000' }}>
              Dream Phone Calculator
            </h1>
            <p className="text-lg" style={{ color: '#666666' }}>
              Compare: Save first vs. buy on credit
            </p>
          </div>

          {/* Disclaimer */}
          <div className="border-2 rounded-lg p-4 mb-8 max-w-3xl mx-auto" style={{ backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }}>
            <p className="text-sm text-center" style={{ color: '#374151' }}>
              <strong>Educational tool only.</strong> This calculator uses simplified math 
              for illustration. Real credit terms vary. Not financial advice.
            </p>
          </div>

          {/* Input Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Phone Selection */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#000000' }}>
                <Smartphone style={{ color: '#2563EB' }} />
                Choose Your Phone
              </h3>

              {/* Popular phones */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>Popular Models</label>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_PHONES.map((phone) => (
                    <button
                      key={`${phone.brand}-${phone.model}`}
                      onClick={() => handlePhoneSelect(phone)}
                      className={`p-3 border-2 rounded-lg text-left transition-all ${
                        selectedPhone === `${phone.brand} ${phone.model}`
                          ? ''
                          : ''
                      }`}
                      style={{
                        borderColor: selectedPhone === `${phone.brand} ${phone.model}` ? '#2563EB' : '#E5E7EB',
                        backgroundColor: selectedPhone === `${phone.brand} ${phone.model}` ? '#DBEAFE' : '#FFFFFF'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedPhone !== `${phone.brand} ${phone.model}`) {
                          e.currentTarget.style.borderColor = '#9CA3AF';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedPhone !== `${phone.brand} ${phone.model}`) {
                          e.currentTarget.style.borderColor = '#E5E7EB';
                        }
                      }}
                    >
                      <p className="font-semibold text-sm" style={{ color: '#000000' }}>{phone.brand}</p>
                      <p className="text-xs" style={{ color: '#666666' }}>{phone.model}</p>
                      <p className="text-sm font-bold mt-1" style={{ color: '#2563EB' }}>
                        {formatCurrency(phone.price, currency.code)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom price */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>Or Enter Custom Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#999999' }}>
                    {currency.symbol}
                  </span>
                  <input
                    type="number"
                    value={phonePrice}
                    onChange={(e) => {
                      setPhonePrice(parseFloat(e.target.value) || 0);
                      setSelectedPhone('Custom');
                    }}
                    className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: '#E5E7EB' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#2563EB'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  />
                </div>
              </div>
            </div>

            {/* Your Numbers */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#000000' }}>Your Numbers</h3>

              {/* Monthly Savings */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#000000' }}>
                  <TrendingUp style={{ color: '#10B981' }} size={16} />
                  How much can you save per month?
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#999999' }}>
                    {currency.symbol}
                  </span>
                  <input
                    type="number"
                    value={monthlySavings}
                    onChange={(e) => setMonthlySavings(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: '#E5E7EB' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#10B981'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  />
                </div>
              </div>

              {/* Credit APR */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#000000' }}>
                  <CreditCard style={{ color: '#EA580C' }} size={16} />
                  Credit card APR (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={creditAPR}
                  onChange={(e) => setCreditAPR(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#E5E7EB' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#EA580C'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                />
                <div className="mt-2 text-xs">
                  <p className="mb-1" style={{ color: '#666666' }}>Typical UK rates:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(TYPICAL_CREDIT_RATES).map(([key, rate]) => (
                      <button
                        key={key}
                        onClick={() => setCreditAPR(rate)}
                        className="px-2 py-1 rounded transition-all"
                        style={{ backgroundColor: '#F3F4F6', color: '#374151' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Monthly Payment on Credit */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>
                  If buying on credit, monthly payment
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#999999' }}>
                    {currency.symbol}
                  </span>
                  <input
                    type="number"
                    value={monthlyPayment}
                    onChange={(e) => setMonthlyPayment(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: '#E5E7EB' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#EA580C'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Results */}
          {comparison && (
            <>
              {/* Side by Side Comparison */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Save First Option */}
                <div className={`bg-white rounded-lg shadow-lg overflow-hidden border-4 ${
                  comparison.winner === 'save' ? '' : ''
                }`} style={{ borderColor: comparison.winner === 'save' ? '#10B981' : '#E5E7EB' }}>
                  <div className={`p-4 ${
                    comparison.winner === 'save' ? '' : ''
                  }`} style={{ 
                    backgroundColor: comparison.winner === 'save' ? '#10B981' : '#D1FAE5',
                    color: comparison.winner === 'save' ? '#FFFFFF' : '#065F46'
                  }}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">Save First</h3>
                      {comparison.winner === 'save' && (
                        <div className="px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#FFFFFF', color: '#10B981' }}>
                          ✓ Better Option
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-sm mb-1" style={{ color: '#666666' }}>Timeline</p>
                      <p className="text-3xl font-bold" style={{ color: '#10B981' }}>
                        {formatMonthsAsYearsMonths(comparison.savings.monthsToSave)}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#999999' }}>
                        {comparison.savings.targetDate.toLocaleDateString('en-GB', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm mb-1" style={{ color: '#666666' }}>Monthly Amount</p>
                      <p className="text-2xl font-bold" style={{ color: '#000000' }}>
                        {formatCurrency(monthlySavings, currency.code)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm mb-1" style={{ color: '#666666' }}>Total Cost</p>
                      <p className="text-2xl font-bold" style={{ color: '#10B981' }}>
                        {formatCurrency(phonePrice, currency.code)}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#10B981' }}>
                        ✓ No interest paid
                      </p>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="flex-shrink-0 mt-0.5" style={{ color: '#10B981' }} size={20} />
                        <div>
                          <p className="text-sm font-semibold mb-1" style={{ color: '#000000' }}>Benefits:</p>
                          <ul className="text-xs space-y-1" style={{ color: '#666666' }}>
                            <li>• No debt</li>
                            <li>• No interest charges</li>
                            <li>• Own it outright immediately</li>
                            <li>• Builds saving habit</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buy on Credit Option */}
                <div className={`bg-white rounded-lg shadow-lg overflow-hidden border-4 ${
                  comparison.winner === 'credit' ? '' : ''
                }`} style={{ borderColor: comparison.winner === 'credit' ? '#EA580C' : '#E5E7EB' }}>
                  <div className={`p-4 ${
                    comparison.winner === 'credit' ? '' : ''
                  }`} style={{ 
                    backgroundColor: comparison.winner === 'credit' ? '#EA580C' : '#FED7AA',
                    color: comparison.winner === 'credit' ? '#FFFFFF' : '#9A3412'
                  }}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">Buy on Credit</h3>
                      {comparison.winner === 'credit' && (
                        <div className="px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#FFFFFF', color: '#EA580C' }}>
                          ✓ Better Option
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-sm mb-1" style={{ color: '#666666' }}>Timeline</p>
                      <p className="text-3xl font-bold" style={{ color: '#EA580C' }}>
                        {comparison.credit.monthsToPay > 99 
                          ? '10+ years'
                          : formatMonthsAsYearsMonths(comparison.credit.monthsToPay)
                        }
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#999999' }}>
                        {comparison.credit.payoffDate.toLocaleDateString('en-GB', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm mb-1" style={{ color: '#666666' }}>Monthly Payment</p>
                      <p className="text-2xl font-bold" style={{ color: '#000000' }}>
                        {formatCurrency(monthlyPayment, currency.code)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm mb-1" style={{ color: '#666666' }}>Total Cost</p>
                      <p className="text-2xl font-bold" style={{ color: '#EA580C' }}>
                        {formatCurrency(comparison.credit.totalPaid, currency.code)}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#DC2626' }}>
                        + {formatCurrency(comparison.credit.totalInterest, currency.code)} interest
                      </p>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="flex-shrink-0 mt-0.5" style={{ color: '#EA580C' }} size={20} />
                        <div>
                          <p className="text-sm font-semibold mb-1" style={{ color: '#000000' }}>Considerations:</p>
                          <ul className="text-xs space-y-1" style={{ color: '#666666' }}>
                            <li>• Immediate access to phone</li>
                            <li>• Ongoing monthly commitment</li>
                            <li>• Interest adds up over time</li>
                            <li>• Affects credit utilization</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Insights */}
              <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: '#000000' }}>The Difference</h3>

                <div className="grid md:grid-cols-3 gap-6 text-center mb-6">
                  <div>
                    <p className="text-sm mb-2" style={{ color: '#666666' }}>Time Difference</p>
                    <p className="text-3xl font-bold" style={{ color: '#2563EB' }}>
                      {Math.abs(comparison.timeDifference)} months
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#666666' }}>
                      {comparison.timeDifference > 0 
                        ? 'Saving takes longer'
                        : 'Credit takes longer'
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm mb-2" style={{ color: '#666666' }}>Cost Difference</p>
                    <p className="text-3xl font-bold" style={{ color: '#DC2626' }}>
                      {formatCurrency(comparison.costDifference, currency.code)}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#666666' }}>
                      Extra paid on credit
                    </p>
                  </div>

                  <div>
                    <p className="text-sm mb-2" style={{ color: '#666666' }}>Cost Increase</p>
                    <p className="text-3xl font-bold" style={{ color: '#EA580C' }}>
                      +{Math.round((comparison.costDifference / phonePrice) * 100)}%
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#666666' }}>
                      More expensive
                    </p>
                  </div>
                </div>

                {/* Visual Bar */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: '#000000' }}>Save First</span>
                      <span className="text-sm" style={{ color: '#000000' }}>{formatCurrency(phonePrice, currency.code)}</span>
                    </div>
                    <div className="w-full rounded-full h-4" style={{ backgroundColor: '#E5E7EB' }}>
                      <div 
                        className="h-4 rounded-full"
                        style={{ width: '100%', backgroundColor: '#10B981' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: '#000000' }}>Buy on Credit</span>
                      <span className="text-sm" style={{ color: '#000000' }}>{formatCurrency(comparison.credit.totalPaid, currency.code)}</span>
                    </div>
                    <div className="w-full rounded-full h-4" style={{ backgroundColor: '#E5E7EB' }}>
                      <div 
                        className="h-4 rounded-full"
                        style={{ width: `${Math.min((comparison.credit.totalPaid / phonePrice) * 100, 200)}%`, backgroundColor: '#EA580C' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Educational Note */}
              <div className="border-2 rounded-lg p-6 text-center" style={{ backgroundColor: '#DBEAFE', borderColor: '#93C5FD' }}>
                <p className="mb-2" style={{ color: '#374151' }}>
                  <strong>Remember:</strong> This is a simplified comparison for educational purposes.
                </p>
                <p className="text-sm" style={{ color: '#666666' }}>
                  Real credit terms vary. Your situation is unique. This tool helps you see patterns, 
                  not predict your exact costs. Not financial advice.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

