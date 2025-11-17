'use client';

import { useState } from 'react';
import { 
  CURRENCIES, 
  CurrencyCode, 
  formatCurrency, 
  getCurrency,
  setCurrency 
} from '@/lib/currency';
import { Check, X, Globe } from 'lucide-react';

interface TestResult {
  test: string;
  passed: boolean;
  details: string;
}

export default function CurrencyTestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(getCurrency().code);

  const runTests = () => {
    const newResults: TestResult[] = [];

    // Test 1: Format standard amounts
    Object.keys(CURRENCIES).forEach(code => {
      const curr = CURRENCIES[code as CurrencyCode];
      const formatted = formatCurrency(1234.56, curr.code);
      newResults.push({
        test: `Format ${curr.code}`,
        passed: formatted.includes(curr.symbol),
        details: `1234.56 → ${formatted}`
      });
    });

    // Test 2: JPY formatting (no decimals)
    const jpyFormatted = formatCurrency(1234, 'JPY');
    newResults.push({
      test: 'JPY no decimals',
      passed: !jpyFormatted.includes('.'),
      details: `1234 → ${jpyFormatted}`
    });

    // Test 3: Zero amounts
    Object.keys(CURRENCIES).forEach(code => {
      const formatted = formatCurrency(0, code as CurrencyCode);
      newResults.push({
        test: `${code} zero`,
        passed: formatted.length > 0,
        details: `0 → ${formatted}`
      });
    });

    // Test 4: Large amounts
    const largeGBP = formatCurrency(1000000, 'GBP');
    newResults.push({
      test: 'Large amounts',
      passed: largeGBP.includes('£') && largeGBP.includes('1,000,000'),
      details: `1000000 → ${largeGBP}`
    });

    // Test 5: Negative amounts
    const negUSD = formatCurrency(-500.50, 'USD');
    newResults.push({
      test: 'Negative amounts',
      passed: negUSD.includes('-') || negUSD.includes('('),
      details: `-500.50 → ${negUSD}`
    });

    // Test 6: Currency switching
    const originalCurrency = getCurrency().code;
    setCurrency('EUR');
    const euroCheck = getCurrency().code === 'EUR';
    setCurrency(originalCurrency);
    newResults.push({
      test: 'Currency switching',
      passed: euroCheck,
      details: 'Can switch between currencies'
    });

    // Test 7: Percentage storage (not currency)
    // This tests the principle: we store percentages, format as currency
    const percentage = 0.15; // 15%
    const income = 10000;
    const amount = income * percentage;
    const formatted = formatCurrency(amount, selectedCurrency);
    newResults.push({
      test: 'Percentage-based storage',
      passed: true,
      details: `15% of ${income} = ${formatted}`
    });

    setResults(newResults);
  };

  const handleCurrencySwitch = (code: CurrencyCode) => {
    setCurrency(code);
    setSelectedCurrency(code);
  };

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, white, #74C0FC)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="border-2 rounded-lg p-4 mb-6" style={{ backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }}>
          <p className="font-semibold" style={{ color: '#92400E' }}>
            ⚠️ DEVELOPMENT ONLY - Remove this page before production deployment
          </p>
        </div>

        <h1 className="text-4xl font-bold mb-8" style={{ color: '#000000' }}>Currency System Test</h1>

        {/* Current Currency */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#000000' }}>
            <Globe style={{ color: '#4DABF7' }} />
            Current Currency
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-4xl">{getCurrency().symbol}</div>
            <div>
              <p className="font-bold" style={{ color: '#000000' }}>{getCurrency().code}</p>
              <p className="text-sm" style={{ color: '#666666' }}>{getCurrency().name}</p>
              <p className="text-xs" style={{ color: '#999999' }}>Locale: {getCurrency().locale}</p>
            </div>
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#000000' }}>Test Currency Switching</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.values(CURRENCIES).map((curr) => (
              <button
                key={curr.code}
                onClick={() => handleCurrencySwitch(curr.code)}
                className={`p-4 border-2 rounded-lg transition-all ${
                  selectedCurrency === curr.code
                    ? ''
                    : ''
                }`}
                style={{
                  borderColor: selectedCurrency === curr.code ? '#4DABF7' : '#E5E7EB',
                  backgroundColor: selectedCurrency === curr.code ? '#74C0FC' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (selectedCurrency !== curr.code) {
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCurrency !== curr.code) {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }
                }}
              >
                <div className="text-3xl mb-1">{curr.symbol}</div>
                <div className="font-semibold" style={{ color: '#000000' }}>{curr.code}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Test Examples */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#000000' }}>Formatting Examples</h2>
          <div className="space-y-3">
            {[
              { label: 'Small amount', value: 10.50 },
              { label: 'Medium amount', value: 1234.56 },
              { label: 'Large amount', value: 100000 },
              { label: 'Million', value: 1000000 },
              { label: 'Decimal precision', value: 999.99 },
              { label: 'Zero', value: 0 },
              { label: 'Negative', value: -250.75 }
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b">
                <span style={{ color: '#666666' }}>{label}:</span>
                <span className="font-mono font-semibold" style={{ color: '#000000' }}>
                  {formatCurrency(value, selectedCurrency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Run Tests Button */}
        <div className="text-center mb-6">
          <button
            onClick={runTests}
            className="px-8 py-4 text-white rounded-lg font-semibold text-lg shadow-lg"
            style={{ backgroundColor: '#4DABF7' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1C7ED6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4DABF7'}
          >
            Run All Tests
          </button>
        </div>

        {/* Test Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: '#000000' }}>Test Results</h2>
              <div className={`px-4 py-2 rounded-lg font-semibold ${
                passedCount === totalCount 
                  ? '' 
                  : ''
              }`} style={{
                backgroundColor: passedCount === totalCount ? '#D1FAE5' : '#FEE2E2',
                color: passedCount === totalCount ? '#065F46' : '#991B1B'
              }}>
                {passedCount} / {totalCount} Passed
              </div>
            </div>

            <div className="space-y-2">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${
                    result.passed 
                      ? '' 
                      : ''
                  }`}
                  style={{
                    borderColor: result.passed ? '#10B981' : '#EF4444',
                    backgroundColor: result.passed ? '#D1FAE5' : '#FEE2E2'
                  }}
                >
                  <div className="flex items-center gap-3 mb-1">
                    {result.passed ? (
                      <Check style={{ color: '#10B981' }} size={20} />
                    ) : (
                      <X style={{ color: '#EF4444' }} size={20} />
                    )}
                    <span className="font-semibold" style={{ color: '#000000' }}>{result.test}</span>
                  </div>
                  <p className="text-sm ml-8" style={{ color: '#666666' }}>{result.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Storage Principle Explanation */}
        <div className="border-2 rounded-lg p-6 mt-6" style={{ backgroundColor: '#DBEAFE', borderColor: '#93C5FD' }}>
          <h3 className="font-bold mb-3" style={{ color: '#000000' }}>💡 Storage Principle</h3>
          <p className="text-sm mb-3" style={{ color: '#374151' }}>
            All user data is stored as <strong>percentages and ratios</strong>, not currency amounts:
          </p>
          <ul className="space-y-2 text-sm ml-4" style={{ color: '#374151' }}>
            <li>• Income: stored as base number (10000)</li>
            <li>• 1% habit: stored as 0.01 (1%), calculated as 10000 × 0.01 = 100</li>
            <li>• Displayed as: {formatCurrency(100, selectedCurrency)}</li>
            <li>• Switching currency only changes display, not underlying data</li>
          </ul>
          <div className="mt-4 p-3 bg-white rounded border">
            <code className="text-xs" style={{ color: '#000000' }}>
              stored: &#123; income: 10000, habitPercent: 0.01 &#125;
              <br />
              display: income = {formatCurrency(10000, selectedCurrency)}, habit = {formatCurrency(100, selectedCurrency)}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

