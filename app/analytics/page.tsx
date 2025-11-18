'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, TrendingUp, Target, DollarSign, 
  Calendar, Award, Zap, BarChart3 
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { formatCurrency, getCurrency } from '@/lib/currency';
import { calculateWeekNumber } from '@/lib/progress';
import {
  calculatePaymentVelocity,
  calculateProjectedPayoff,
  calculateSavings,
  calculateWeeklyPerformance,
  calculateConsistencyScore,
  generateInsights
} from '@/lib/analytics';
import { canUseFeature } from '@/lib/proFeatures';
import FeatureGate from '@/components/FeatureGate';
import Navigation from '@/components/Navigation';
import PrivacyBadge from '@/components/PrivacyBadge';
import ProgressChart from '@/components/ProgressChart';

export default function AnalyticsPage() {
  const router = useRouter();
  const currency = getCurrency();
  const [mounted, setMounted] = useState(false);
  
  const createdAt = useUserStore((state) => state.createdAt);
  const isPro = useUserStore((state) => state.isPro);
  const proExpiresAt = useUserStore((state) => state.proExpiresAt);
  const adminSettings = useUserStore((state) => state.adminSettings);
  const debts = useUserStore((state) => state.debts);
  const totalDebt = useUserStore((state) => state.totalDebt);
  const finances = useUserStore((state) => state.finances);
  const weeklyCheckIns = useUserStore((state) => state.weeklyCheckIns);
  const challenges = useUserStore((state) => state.challenges);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !createdAt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const hasAccess = canUseFeature('advanced_analytics', {
    createdAt,
    isPro,
    proExpiresAt,
    adminSettings
  });

  // Feature gate for non-PRO users
  if (!hasAccess) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-white to-goal-light py-8 px-4">
          <PrivacyBadge />
          
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>

            <FeatureGate featureId="advanced_analytics" showInline>
              {/* This won't render due to feature gate */}
            </FeatureGate>
          </div>
        </div>
      </>
    );
  }

  // Calculate analytics
  const currentWeek = calculateWeekNumber(createdAt);
  const velocity = calculatePaymentVelocity(weeklyCheckIns);
  const projections = calculateProjectedPayoff(debts, finances.monthlyLeftover, velocity.averageExtraPayment);
  
  // Use a sensible original debt estimate
  const originalDebt = totalDebt + weeklyCheckIns.reduce((sum, c) => sum + (c.extraPayment || 0), 0);
  const savings = calculateSavings(weeklyCheckIns, challenges, originalDebt, totalDebt);
  const weeklyPerformance = calculateWeeklyPerformance(weeklyCheckIns, challenges);
  const consistencyScore = calculateConsistencyScore(weeklyCheckIns, challenges, currentWeek);
  const insights = generateInsights(velocity, weeklyPerformance, consistencyScore);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50 py-8 px-4">
        <PrivacyBadge />
        
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 size={36} style={{ color: '#9333EA' }} />
              <h1 className="text-3xl md:text-4xl font-bold">Analytics</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Deep insights into your financial journey
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-green-600" size={20} />
                <p className="text-sm text-gray-600">Consistency Score</p>
              </div>
              <p className="text-3xl font-bold text-green-600">{consistencyScore}%</p>
              <p className="text-xs text-gray-500 mt-1">Check-ins & challenges</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-blue-600" size={20} />
                <p className="text-sm text-gray-600">Avg Extra Payment</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(velocity.averageExtraPayment, currency.code)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Per week</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-orange-600" size={20} />
                <p className="text-sm text-gray-600">Payment Velocity</p>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {velocity.velocityTrend === 'increasing' && '📈'}
                {velocity.velocityTrend === 'stable' && '➡️'}
                {velocity.velocityTrend === 'decreasing' && '📉'}
              </p>
              <p className="text-xs text-gray-500 mt-1 capitalize">{velocity.velocityTrend}</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Award className="text-purple-600" size={20} />
                <p className="text-sm text-gray-600">Total Saved</p>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {formatCurrency(savings.totalSavings, currency.code)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Interest + extras</p>
            </div>
          </div>

          {/* Projections */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Target size={24} style={{ color: '#37B24D' }} />
              Payoff Projections
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Current Pace */}
              <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                <p className="text-sm font-semibold text-orange-800 mb-2">Current Pace</p>
                <p className="text-sm text-gray-600 mb-1">Minimum payments only</p>
                <p className="text-2xl font-bold text-orange-700 mb-2">
                  {Math.ceil(projections.currentPace.weeksRemaining / 4.33)} months
                </p>
                <p className="text-xs text-gray-600">
                  {projections.currentPace.dateEstimate.toLocaleDateString('en-GB', {
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>

              {/* With Extra Payments */}
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-800 mb-2">With Extra Payments</p>
                <p className="text-sm text-gray-600 mb-1">Based on your average</p>
                <p className="text-2xl font-bold text-blue-700 mb-2">
                  {Math.ceil(projections.withExtraPayments.weeksRemaining / 4.33)} months
                </p>
                <p className="text-xs text-green-600 font-semibold">
                  Save {projections.withExtraPayments.weeksSaved} weeks
                </p>
              </div>

              {/* Best Case */}
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-800 mb-2">Best Case</p>
                <p className="text-sm text-gray-600 mb-1">With all leftover</p>
                <p className="text-2xl font-bold text-green-700 mb-2">
                  {Math.ceil(projections.bestCase.weeksRemaining / 4.33)} months
                </p>
                <p className="text-xs text-green-600 font-semibold">
                  Save {projections.bestCase.weeksSaved} weeks
                </p>
              </div>
            </div>
          </div>

          {/* Savings Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Savings Breakdown</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-semibold">Interest Saved (Estimated)</p>
                  <p className="text-sm text-gray-600">By paying down faster</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(savings.totalInterestSaved, currency.code)}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-semibold">Extra Payments Made</p>
                  <p className="text-sm text-gray-600">Above minimum payments</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(savings.extraPaymentsSaved, currency.code)}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-semibold">Challenge Earnings</p>
                  <p className="text-sm text-gray-600">From 1% challenges</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(savings.challengeEarnings, currency.code)}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg text-white" style={{ 
                background: 'linear-gradient(to right, #51CF66, #37B24D)'
              }}>
                <div>
                  <p className="font-bold text-lg">Total Financial Impact</p>
                  <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Combined savings & earnings</p>
                </div>
                <p className="text-3xl font-bold">
                  {formatCurrency(savings.totalSavings, currency.code)}
                </p>
              </div>
            </div>
          </div>

          {/* Check-In Frequency Chart */}
          <div className="mb-8">
            <ProgressChart
              title="Check-In Frequency (Last 10 Weeks)"
              data={weeklyPerformance.slice(-10).reverse().map(week => ({
                label: `Week ${week.week}`,
                value: week.checkedIn ? 1 : 0,
                color: week.checkedIn ? 'bg-green-500' : 'bg-gray-300'
              }))}
              maxValue={1}
              showValues={false}
            />
          </div>

          {/* Weekly Performance */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Weekly Performance</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left py-2 px-2">Week</th>
                    <th className="text-center py-2 px-2">Check-In</th>
                    <th className="text-right py-2 px-2">Extra Payment</th>
                    <th className="text-center py-2 px-2">Challenge</th>
                    <th className="text-center py-2 px-2">Mood</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyPerformance.slice(-10).reverse().map((week) => (
                    <tr key={week.week} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 font-semibold">Week {week.week}</td>
                      <td className="text-center py-3 px-2">
                        {week.checkedIn ? '✓' : '—'}
                      </td>
                      <td className="text-right py-3 px-2">
                        {week.extraPayment > 0 
                          ? formatCurrency(week.extraPayment, currency.code)
                          : '—'
                        }
                      </td>
                      <td className="text-center py-3 px-2">
                        {week.challengeCompleted ? '✓' : '—'}
                      </td>
                      <td className="text-center py-3 px-2">
                        {getMoodEmoji(week.moodScore)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {weeklyPerformance.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No weekly data yet. Start checking in to see your performance!</p>
              </div>
            )}
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div className="rounded-lg shadow-lg p-6 md:p-8" style={{ 
              background: 'linear-gradient(to bottom right, #D1FAE5, #E7F5FF)'
            }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Zap size={24} style={{ color: '#2F9E44' }} />
                Insights & Recommendations
              </h2>

              <div className="space-y-3">
                {insights.map((insight, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4">
                    <p className="text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function getMoodEmoji(score: number): string {
  if (score >= 5) return '😊';
  if (score >= 4) return '🙂';
  if (score >= 3) return '😐';
  if (score >= 2) return '😟';
  return '😰';
}

