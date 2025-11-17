'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, DollarSign, TrendingUp, MessageSquare, Sparkles } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { formatCurrency, getCurrency } from '@/lib/currency';
import { calculateWeekNumber } from '@/lib/progress';
import { MOOD_EMOJIS, validateCheckIn, hasCheckedInThisWeek, CheckIn } from '@/lib/checkIn';
import Navigation from '@/components/Navigation';
import PrivacyBadge from '@/components/PrivacyBadge';

export default function CheckInPage() {
  const router = useRouter();
  const [currency, setCurrency] = useState<ReturnType<typeof getCurrency> | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const createdAt = useUserStore((state) => state.createdAt);
  const weeklyCheckIns = useUserStore((state) => state.weeklyCheckIns);
  const addCheckIn = useUserStore((state) => state.addCheckIn);
  const totalDebt = useUserStore((state) => state.totalDebt);
  
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [extraPayment, setExtraPayment] = useState<string>('');
  const [newIncome, setNewIncome] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setCurrency(getCurrency());
    setMounted(true);
  }, []);

  if (!mounted || !createdAt || !currency) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const currentWeek = calculateWeekNumber(createdAt);
  const alreadyCheckedIn = hasCheckedInThisWeek(weeklyCheckIns, currentWeek);

  const handleSubmit = () => {
    setError('');

    // Build check-in object
    const checkIn: Partial<CheckIn> = {
      week: currentWeek,
      date: new Date().toISOString(),
      moodEmoji: selectedMood,
      extraPayment: extraPayment ? parseFloat(extraPayment) : undefined,
      newIncome: newIncome ? parseFloat(newIncome) : undefined,
      notes: notes || undefined
    };

    // Validate
    const validation = validateCheckIn(checkIn);
    if (!validation.valid) {
      setError(validation.error || 'Invalid check-in');
      return;
    }

    // Save to store
    addCheckIn(checkIn as CheckIn);

    // Navigate to story
    router.push(`/check-in/story?week=${currentWeek}`);
  };

  // If already checked in
  if (alreadyCheckedIn) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, white, #74C0FC)' }}>
          <PrivacyBadge />
          
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 mb-6"
              style={{ color: '#666666' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>

            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#D1FAE5' }}>
                <Sparkles style={{ color: '#10B981' }} size={48} />
              </div>
              
              <h1 className="text-2xl font-bold mb-3" style={{ color: '#000000' }}>
                Already Checked In!
              </h1>
              <p className="mb-6" style={{ color: '#666666' }}>
                You've completed your check-in for Week {currentWeek}. 
                Come back next week for your next check-in.
              </p>

              <button
                onClick={() => router.push('/dashboard')}
                className="px-8 py-3 text-white rounded-lg font-semibold transition-all"
                style={{ backgroundColor: '#37B24D' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2F9E44'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#37B24D'}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, white, rgba(140, 233, 154, 0.2), rgba(116, 192, 252, 0.2))' }}>
        <PrivacyBadge />
        
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 mb-6"
            style={{ color: '#666666' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#51CF66' }}>
              <Calendar size={48} className="text-white" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#000000' }}>
              Week {currentWeek} Check-In
            </h1>
            <p className="text-lg" style={{ color: '#666666' }}>
              How was your financial week?
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
            {/* Mood Selection */}
            <div className="mb-8">
              <label className="block text-lg font-semibold mb-4" style={{ color: '#000000' }}>
                How are you feeling? *
              </label>
              <div className="grid grid-cols-5 gap-3">
                {MOOD_EMOJIS.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      selectedMood === mood.value
                        ? 'shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow'
                    }`}
                    style={{
                      borderColor: selectedMood === mood.value ? '#51CF66' : undefined,
                      backgroundColor: selectedMood === mood.value ? '#8CE99A' : undefined
                    }}
                  >
                    <div className="text-4xl mb-2">{mood.emoji}</div>
                    <div className="text-xs font-medium" style={{ color: '#374151' }}>
                      {mood.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Payment */}
            {totalDebt > 0 && (
              <div className="mb-6">
                <label className="block font-semibold mb-2 flex items-center gap-2" style={{ color: '#000000' }}>
                  <DollarSign style={{ color: '#51CF66' }} size={20} />
                  Extra debt payment this week? (Optional)
                </label>
                <p className="text-sm mb-3" style={{ color: '#666666' }}>
                  Any amount beyond your regular payment
                </p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg" style={{ color: '#999999' }}>
                    {currency.symbol}
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(e.target.value.replace(/[^\d.]/g, ''))}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-3 text-lg border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: '#E5E7EB' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#51CF66'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  />
                </div>
              </div>
            )}

            {/* New Income */}
            <div className="mb-6">
              <label className="block font-semibold mb-2 flex items-center gap-2" style={{ color: '#000000' }}>
                <TrendingUp style={{ color: '#4DABF7' }} size={20} />
                New income this week? (Optional)
              </label>
              <p className="text-sm mb-3" style={{ color: '#666666' }}>
                Side hustle, bonus, extra hours, selling items
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg" style={{ color: '#999999' }}>
                  {currency.symbol}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={newIncome}
                  onChange={(e) => setNewIncome(e.target.value.replace(/[^\d.]/g, ''))}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3 text-lg border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#E5E7EB' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block font-semibold mb-2 flex items-center gap-2" style={{ color: '#000000' }}>
                <MessageSquare style={{ color: '#666666' }} size={20} />
                Any notes? (Optional)
              </label>
              <p className="text-sm mb-3" style={{ color: '#666666' }}>
                Wins, challenges, observations
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Cancelled Netflix, saved £10. Felt good."
                rows={3}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none resize-none"
                style={{ borderColor: '#E5E7EB' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 border rounded-lg" style={{ backgroundColor: '#FEE2E2', borderColor: '#FECACA' }}>
                <p className="text-sm" style={{ color: '#991B1B' }}>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!selectedMood}
              className="w-full py-4 text-white rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none"
              style={{ backgroundColor: selectedMood ? '#37B24D' : '#D1D5DB' }}
              onMouseEnter={(e) => {
                if (selectedMood) {
                  e.currentTarget.style.backgroundColor = '#2F9E44';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedMood) {
                  e.currentTarget.style.backgroundColor = '#37B24D';
                }
              }}
            >
              Complete Check-In →
            </button>
          </div>

          {/* Info */}
          <div className="border rounded-lg p-4 text-sm text-center" style={{ backgroundColor: '#DBEAFE', borderColor: '#93C5FD' }}>
            <p style={{ color: '#374151' }}>
              💡 After completing your check-in, you'll see this week's story
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

