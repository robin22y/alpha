'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Zap, 
  CheckCircle, Flame, Target, Lightbulb 
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { formatCurrency, getCurrency } from '@/lib/currency';
import { calculateWeekNumber } from '@/lib/progress';
import { 
  shouldShowChallenge, 
  createWeeklyChallenge, 
  getChallengeForWeek,
  calculateChallengeStats,
  Challenge
} from '@/lib/challenges';
import Navigation from '@/components/Navigation';
import PrivacyBadge from '@/components/PrivacyBadge';

type ChallengeType = 'earn_more' | 'spend_less' | 'hybrid';

export default function ChallengePage() {
  const router = useRouter();
  const [currency, setCurrency] = useState<ReturnType<typeof getCurrency> | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedType, setSelectedType] = useState<ChallengeType>('hybrid');
  const [actualAmount, setActualAmount] = useState<string>('');
  const [showCompletion, setShowCompletion] = useState(false);
  
  const createdAt = useUserStore((state) => state.createdAt);
  const habit = useUserStore((state) => state.habit);
  const challenges = useUserStore((state) => state.challenges);
  const addChallenge = useUserStore((state) => state.addChallenge);
  const updateChallenge = useUserStore((state) => state.updateChallenge);

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
  const onePercent = habit.customAmount || habit.onePercentAmount || 0;
  
  // Check if challenge should be shown
  const canShowChallenge = shouldShowChallenge(currentWeek, challenges);
  const existingChallenge = getChallengeForWeek(challenges, currentWeek);
  const stats = calculateChallengeStats(challenges);

  // Show warning if too early, but still allow access for testing
  const isEarlyWeek = currentWeek < 4 && !existingChallenge;

  const handleAcceptChallenge = () => {
    const newChallenge = createWeeklyChallenge(currentWeek, onePercent, selectedType);
    addChallenge({ ...newChallenge, accepted: true });
  };

  const handleCompleteChallenge = () => {
    if (existingChallenge && actualAmount) {
      updateChallenge(existingChallenge.id, {
        completed: true,
        actualAmount: parseFloat(actualAmount),
        completedDate: new Date().toISOString()
      });
      setShowCompletion(true);
    }
  };

  const handleDeclineChallenge = () => {
    const newChallenge = createWeeklyChallenge(currentWeek, onePercent, selectedType);
    addChallenge({ ...newChallenge, accepted: false, completed: false });
  };

  // Show completion celebration
  if (showCompletion && existingChallenge) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen py-8 px-4 flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #8CE99A, #74C0FC)' }}>
          <PrivacyBadge />
          
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold mb-3" style={{ color: '#000000' }}>Challenge Complete!</h1>
              <p className="text-xl mb-6" style={{ color: '#666666' }}>
                You improved by {formatCurrency(parseFloat(actualAmount), currency.code)} this week!
              </p>

              <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: '#8CE99A' }}>
                <p className="text-sm mb-2" style={{ color: '#666666' }}>Total from challenges</p>
                <p className="text-4xl font-bold" style={{ color: '#37B24D' }}>
                  {formatCurrency(
                    (stats.totalEarned + stats.totalSaved + parseFloat(actualAmount)),
                    currency.code
                  )}
                </p>
              </div>

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

  // Existing accepted challenge
  if (existingChallenge && existingChallenge.accepted && !existingChallenge.completed) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, white, #74C0FC)' }}>
          <PrivacyBadge />
          
          <div className="max-w-3xl mx-auto">
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

            {isEarlyWeek && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold mb-1" style={{ color: '#92400E' }}>
                  ⚠️ Early Access (Testing Mode)
                </p>
                <p className="text-sm" style={{ color: '#78350F' }}>
                  Challenges normally start at Week 4. You're on Week {currentWeek}. This is available for testing purposes.
                </p>
              </div>
            )}

            <div className="text-center mb-8">
              <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#DBEAFE' }}>
                <Zap size={48} style={{ color: '#1C7ED6' }} />
              </div>
              
              <h1 className="text-3xl font-bold mb-3" style={{ color: '#000000' }}>
                Week {currentWeek} Challenge
              </h1>
              <p style={{ color: '#666666' }}>
                {existingChallenge.title}
              </p>
            </div>

            {/* Challenge Details */}
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
              <div className="text-center mb-6">
                <p className="text-sm mb-2" style={{ color: '#666666' }}>Your Target</p>
                <p className="text-5xl font-bold" style={{ color: '#1C7ED6' }}>
                  {formatCurrency(existingChallenge.targetAmount, currency.code)}
                </p>
                <p className="mt-2" style={{ color: '#666666' }}>
                  {existingChallenge.description}
                </p>
              </div>

              {/* Ideas */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#000000' }}>
                  <Lightbulb style={{ color: '#D97706' }} size={20} />
                  Ideas to Hit Your Target
                </h3>
                <ul className="space-y-2">
                  {existingChallenge.ideas.map((idea, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1" style={{ color: '#4DABF7' }}>•</span>
                      <span style={{ color: '#374151' }}>{idea}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Complete Challenge */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3" style={{ color: '#000000' }}>Complete Challenge</h3>
                <p className="text-sm mb-4" style={{ color: '#666666' }}>
                  How much did you actually improve by?
                </p>
                
                <div className="relative mb-4">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: '#999999' }}>
                    {currency.symbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={actualAmount}
                    onChange={(e) => setActualAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 text-lg border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: '#E5E7EB' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  />
                </div>

                <button
                  onClick={handleCompleteChallenge}
                  disabled={!actualAmount || parseFloat(actualAmount) <= 0}
                  className="w-full py-3 text-white rounded-lg font-semibold transition-all disabled:cursor-not-allowed"
                  style={{ backgroundColor: (!actualAmount || parseFloat(actualAmount) <= 0) ? '#D1D5DB' : '#37B24D' }}
                  onMouseEnter={(e) => {
                    if (actualAmount && parseFloat(actualAmount) > 0) {
                      e.currentTarget.style.backgroundColor = '#2F9E44';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (actualAmount && parseFloat(actualAmount) > 0) {
                      e.currentTarget.style.backgroundColor = '#37B24D';
                    }
                  }}
                >
                  Complete Challenge
                </button>
              </div>
            </div>

            {/* Stats */}
            {stats.totalChallenges > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-semibold mb-4" style={{ color: '#000000' }}>Your Challenge Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#1C7ED6' }}>{stats.completedChallenges}</p>
                    <p className="text-xs" style={{ color: '#666666' }}>Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#EA580C' }}>{stats.currentStreak}</p>
                    <p className="text-xs" style={{ color: '#666666' }}>Current Streak</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#10B981' }}>
                      {formatCurrency(stats.totalEarned, currency.code)}
                    </p>
                    <p className="text-xs" style={{ color: '#666666' }}>Total Earned</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#2563EB' }}>
                      {formatCurrency(stats.totalSaved, currency.code)}
                    </p>
                    <p className="text-xs" style={{ color: '#666666' }}>Total Saved</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // New challenge - choice screen
  return (
    <>
      <Navigation />
      <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, white, #DBEAFE, #8CE99A)' }}>
        <PrivacyBadge />
        
        <div className="max-w-3xl mx-auto">
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
            <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#4DABF7' }}>
              <Zap size={48} className="text-white" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#000000' }}>
              Week {currentWeek} Challenge
            </h1>
            <p className="text-lg" style={{ color: '#666666' }}>
              Improve by 1% this week
            </p>
          </div>

          {/* Challenge Info */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
            <div className="text-center mb-6">
              <p className="text-sm mb-2" style={{ color: '#666666' }}>Your 1% Target</p>
              <p className="text-5xl font-bold mb-4" style={{ color: '#1C7ED6' }}>
                {formatCurrency(onePercent, currency.code)}
              </p>
              <p style={{ color: '#666666' }}>
                Choose how you want to improve this week
              </p>
            </div>

            {/* Type Selection */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setSelectedType('earn_more')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedType === 'earn_more'
                    ? ''
                    : ''
                }`}
                style={{
                  borderColor: selectedType === 'earn_more' ? '#10B981' : '#E5E7EB',
                  backgroundColor: selectedType === 'earn_more' ? '#D1FAE5' : '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  if (selectedType !== 'earn_more') {
                    e.currentTarget.style.borderColor = '#9CA3AF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedType !== 'earn_more') {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <TrendingUp style={{ color: '#10B981' }} size={24} />
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: '#000000' }}>Earn More</p>
                    <p className="text-sm" style={{ color: '#666666' }}>
                      Find ways to bring in extra {formatCurrency(onePercent, currency.code)}
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedType('spend_less')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedType === 'spend_less'
                    ? ''
                    : ''
                }`}
                style={{
                  borderColor: selectedType === 'spend_less' ? '#2563EB' : '#E5E7EB',
                  backgroundColor: selectedType === 'spend_less' ? '#DBEAFE' : '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  if (selectedType !== 'spend_less') {
                    e.currentTarget.style.borderColor = '#9CA3AF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedType !== 'spend_less') {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <TrendingDown style={{ color: '#2563EB' }} size={24} />
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: '#000000' }}>Spend Less</p>
                    <p className="text-sm" style={{ color: '#666666' }}>
                      Cut expenses by {formatCurrency(onePercent, currency.code)} this week
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedType('hybrid')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedType === 'hybrid'
                    ? ''
                    : ''
                }`}
                style={{
                  borderColor: selectedType === 'hybrid' ? '#7C3AED' : '#E5E7EB',
                  backgroundColor: selectedType === 'hybrid' ? '#E9D5FF' : '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  if (selectedType !== 'hybrid') {
                    e.currentTarget.style.borderColor = '#9CA3AF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedType !== 'hybrid') {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <Zap style={{ color: '#7C3AED' }} size={24} />
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: '#000000' }}>Combined</p>
                    <p className="text-sm" style={{ color: '#666666' }}>
                      Mix of earning more and spending less
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Preview Ideas */}
            <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: '#F9FAFB' }}>
              <p className="font-semibold mb-2 text-sm" style={{ color: '#000000' }}>Example ideas for this approach:</p>
              <ul className="space-y-1 text-sm" style={{ color: '#374151' }}>
                {createWeeklyChallenge(currentWeek, onePercent, selectedType).ideas.slice(0, 3).map((idea, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-0.5" style={{ color: '#4DABF7' }}>•</span>
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDeclineChallenge}
                className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all"
                style={{ backgroundColor: '#E5E7EB', color: '#374151' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D1D5DB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
              >
                Skip This Week
              </button>
              
              <button
                onClick={handleAcceptChallenge}
                className="flex-1 px-6 py-3 text-white rounded-lg font-semibold transition-all"
                style={{ backgroundColor: '#4DABF7' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1C7ED6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4DABF7'}
              >
                Accept Challenge
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="border rounded-lg p-4 text-sm text-center" style={{ backgroundColor: '#DBEAFE', borderColor: '#93C5FD' }}>
            <p style={{ color: '#374151' }}>
              💡 Challenges are optional but help build momentum. Even small wins matter.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

