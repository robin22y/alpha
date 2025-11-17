'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, TrendingUp, DollarSign, MessageSquare, Flame } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { formatCurrency, getCurrency } from '@/lib/currency';
import { calculateStreak, MOOD_EMOJIS } from '@/lib/checkIn';
import Navigation from '@/components/Navigation';
import PrivacyBadge from '@/components/PrivacyBadge';

export default function CheckInHistoryPage() {
  const router = useRouter();
  const [currency, setCurrency] = useState<ReturnType<typeof getCurrency> | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const weeklyCheckIns = useUserStore((state) => state.weeklyCheckIns);

  useEffect(() => {
    setCurrency(getCurrency());
    setMounted(true);
  }, []);

  if (!mounted || !currency) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Filter out incomplete check-ins and ensure type safety
  const validCheckIns = weeklyCheckIns.filter((c): c is { week: number; date: string; moodEmoji: string; extraPayment?: number; newIncome?: number; notes?: string; storyShown?: string } => 
    !!c.moodEmoji
  );
  
  const streak = calculateStreak(validCheckIns);
  const sortedCheckIns = [...validCheckIns].sort((a, b) => b.week - a.week);

  const getMoodEmoji = (moodValue: string) => {
    return MOOD_EMOJIS.find(m => m.value === moodValue)?.emoji || '😐';
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, white, #74C0FC)' }}>
        <PrivacyBadge />
        
        <div className="max-w-4xl mx-auto">
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

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#000000' }}>
              Check-In History
            </h1>
            <p style={{ color: '#666666' }}>
              Your weekly progress over time
            </p>
          </div>

          {/* Streak Badge */}
          {streak > 0 && (
            <div className="rounded-lg shadow-lg p-6 mb-6 text-white" style={{ background: 'linear-gradient(to right, #FB923C, #EF4444)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Flame size={48} />
                  <div>
                    <p className="text-3xl font-bold">{streak} Week Streak!</p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Keep the momentum going</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-sm mb-1" style={{ color: '#666666' }}>Total Check-Ins</p>
              <p className="text-3xl font-bold" style={{ color: '#37B24D' }}>
                {validCheckIns.length}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-sm mb-1" style={{ color: '#666666' }}>Extra Payments</p>
              <p className="text-3xl font-bold" style={{ color: '#1C7ED6' }}>
                {formatCurrency(
                  validCheckIns.reduce((sum, c) => sum + (c.extraPayment || 0), 0),
                  currency.code
                )}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-sm mb-1" style={{ color: '#666666' }}>New Income</p>
              <p className="text-3xl font-bold" style={{ color: '#10B981' }}>
                {formatCurrency(
                  validCheckIns.reduce((sum, c) => sum + (c.newIncome || 0), 0),
                  currency.code
                )}
              </p>
            </div>
          </div>

          {/* Check-In List */}
          {sortedCheckIns.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <Calendar className="mx-auto mb-4" size={48} style={{ color: '#9CA3AF' }} />
              <p className="mb-4" style={{ color: '#666666' }}>No check-ins yet</p>
              <button
                onClick={() => router.push('/check-in')}
                className="px-6 py-3 text-white rounded-lg font-semibold transition-all"
                style={{ backgroundColor: '#37B24D' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2F9E44'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#37B24D'}
              >
                Complete Your First Check-In
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedCheckIns.map((checkIn, index) => (
                <div
                  key={`${checkIn.week}-${index}`}
                  className="bg-white rounded-lg shadow-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1" style={{ color: '#000000' }}>
                        Week {checkIn.week}
                      </h3>
                      <p className="text-sm" style={{ color: '#666666' }}>
                        {new Date(checkIn.date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    <div className="text-4xl">
                      {getMoodEmoji(checkIn.moodEmoji)}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    {checkIn.extraPayment && checkIn.extraPayment > 0 && (
                      <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#8CE99A' }}>
                        <DollarSign style={{ color: '#37B24D' }} size={20} />
                        <div className="flex-1">
                          <p className="text-sm" style={{ color: '#666666' }}>Extra Payment</p>
                          <p className="font-semibold" style={{ color: '#37B24D' }}>
                            {formatCurrency(checkIn.extraPayment, currency.code)}
                          </p>
                        </div>
                      </div>
                    )}

                    {checkIn.newIncome && checkIn.newIncome > 0 && (
                      <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#D1FAE5' }}>
                        <TrendingUp style={{ color: '#10B981' }} size={20} />
                        <div className="flex-1">
                          <p className="text-sm" style={{ color: '#666666' }}>New Income</p>
                          <p className="font-semibold" style={{ color: '#10B981' }}>
                            {formatCurrency(checkIn.newIncome, currency.code)}
                          </p>
                        </div>
                      </div>
                    )}

                    {checkIn.notes && (
                      <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#DBEAFE' }}>
                        <MessageSquare className="mt-0.5" style={{ color: '#2563EB' }} size={20} />
                        <div className="flex-1">
                          <p className="text-sm mb-1" style={{ color: '#666666' }}>Notes</p>
                          <p style={{ color: '#374151' }}>{checkIn.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

