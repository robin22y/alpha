'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, TrendingUp, Target, DollarSign, 
  Clock, Settings, PlusCircle, BarChart3, Heart, BookOpen, Smartphone, CreditCard, Zap, Sparkles, Download, Crown
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { formatCurrency, getCurrency } from '@/lib/currency';
import { 
  calculateWeekNumber, 
  formatWeekDisplay,
  getWeeklyMessage,
  checkForNewMilestone
} from '@/lib/progress';
import { canUseFeature, hasProAccess } from '@/lib/proFeatures';
import { syncProStatusToStore } from '@/lib/subscription';
import { getUserIdentifiers } from '@/lib/deviceId';
import dynamic from 'next/dynamic';
import PrivacyBadge from '@/components/PrivacyBadge';
import Navigation from '@/components/Navigation';
import { getContextualRecommendations, shouldShowRecommendations, markRecommendationsShown, getRecentlySeenPartners } from '@/lib/recommendationEngine';
import AffiliateCard from '@/components/AffiliateCard';
import { computeDebtsFromStore, calculateDebtTotals } from '@/lib/debtUtils';
import type { DebtComputed } from '@/lib/debtEngine';

// Lazy load heavy components
const MilestoneCelebration = dynamic(() => import('@/components/MilestoneCelebration'), {
  ssr: false,
  loading: () => null,
});

export default function DashboardPage() {
  const router = useRouter();
  const [currency, setCurrency] = useState<ReturnType<typeof getCurrency> | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [celebrateMilestone, setCelebrateMilestone] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showRecs, setShowRecs] = useState(false);
  
  // Get store data - use individual selectors to prevent unnecessary re-renders
  const createdAt = useUserStore((state) => state.createdAt);
  const goal = useUserStore((state) => state.goal);
  const timeline = useUserStore((state) => state.timeline);
  const finances = useUserStore((state) => state.finances);
  const habit = useUserStore((state) => state.habit);
  const debts = useUserStore((state) => state.debts);
  const totalDebt = useUserStore((state) => state.totalDebt);
  const totalMonthlyPayment = useUserStore((state) => state.totalMonthlyPayment);
  const progress = useUserStore((state) => state.progress);
  
  // Compute debts using debt engine - recalculate when debts array changes
  const computedDebts: DebtComputed[] = useMemo(() => {
    if (!mounted || !debts || debts.length === 0) return [];
    try {
      const computed = computeDebtsFromStore(debts);
      console.log('Dashboard useMemo - Debts:', debts);
      console.log('Dashboard useMemo - Computed:', computed);
      return computed;
    } catch (error) {
      console.error('Error computing debts:', error);
      return [];
    }
  }, [mounted, debts.length, JSON.stringify(debts.map(d => ({ id: d.id, debtType: d.debtType, balance: d.balance, loanAmount: d.loanAmount })))]);
  
  const debtTotals = useMemo(() => {
    if (computedDebts.length === 0) {
      return {
        totalDebt: 0,
        totalMonthlyPayment: 0,
        totalInterest: 0
      };
    }
    return calculateDebtTotals(computedDebts);
  }, [computedDebts]);
  const updateProgress = useUserStore((state) => state.updateProgress);
  const initializeFromLocalStorage = useUserStore((state) => state.initializeFromLocalStorage);
  const addMilestone = useUserStore((state) => state.addMilestone);
  const isPro = useUserStore((state) => state.isPro);
  const proExpiresAt = useUserStore((state) => state.proExpiresAt);
  const adminSettings = useUserStore((state) => state.adminSettings);

  // Initialize on mount - only run once
  useEffect(() => {
    setCurrency(getCurrency());
    initializeFromLocalStorage();
    setMounted(true);
    
    // Sync PRO status from Supabase
    const identifiers = getUserIdentifiers();
    if (identifiers.deviceID) {
      syncProStatusToStore(identifiers.deviceID).then((proStatus) => {
        // Update store with synced PRO status
        const store = useUserStore.getState();
        useUserStore.setState({
          ...store,
          isPro: proStatus.isPro,
          proExpiresAt: proStatus.proExpiresAt,
          proSince: proStatus.proSince
        });
      }).catch(err => {
        console.warn('Failed to sync PRO status:', err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Recalculate totals when debts change
  useEffect(() => {
    if (mounted) {
      // Force recalculation in store whenever debts change
      useUserStore.getState().calculateTotals();
      console.log('Dashboard - Debts array:', debts);
      console.log('Dashboard - Debts count:', debts.length);
      if (debts.length > 0) {
        const computed = computeDebtsFromStore(debts);
        const totals = calculateDebtTotals(computed);
        console.log('Dashboard - Computed debts:', computed);
        console.log('Dashboard - Debt totals:', totals);
        console.log('Dashboard - Has debt?', totals.totalDebt > 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, debts.length]); // Only depend on debts.length to avoid infinite loops

  // Update progress on mount and when data changes
  useEffect(() => {
    if (mounted && createdAt) {
      updateProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, createdAt, timeline?.months, timeline?.targetDate]); // Only depend on actual values, not functions

  // Check for milestone after updating progress
  useEffect(() => {
    if (mounted && createdAt && progress.timeProgressPercentage > 0) {
      const milestoneCheck = checkForNewMilestone(
        progress.timeProgressPercentage,
        progress.lastMilestonePercentage
      );
      
      if (milestoneCheck.reached && milestoneCheck.milestone) {
        // Show celebration
        setCelebrateMilestone(milestoneCheck.milestone);
        setShowMilestone(true);
        
        // Save milestone to store
        addMilestone(
          milestoneCheck.milestone.percentage,
          milestoneCheck.milestone.label,
          milestoneCheck.milestone.emoji
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, createdAt, progress.timeProgressPercentage, progress.lastMilestonePercentage]); // Remove function from deps

  // Redirect if not initialized
  useEffect(() => {
    if (mounted && !createdAt) {
      router.push('/');
    }
  }, [mounted, createdAt, router]);

  // Load contextual recommendations
  useEffect(() => {
    if (mounted && createdAt) {
      const currentWeek = calculateWeekNumber(createdAt);
      const context = {
        page: 'dashboard' as const,
        userWeek: currentWeek,
        hasSeenRecently: getRecentlySeenPartners()
      };
      
      if (shouldShowRecommendations(context)) {
        const recs = getContextualRecommendations(
          { totalDebt, goal, finances },
          context,
          2 // Max 2 on dashboard
        );
        
        if (recs.length > 0) {
          setRecommendations(recs);
          setShowRecs(true);
          markRecommendationsShown(recs.map(r => r.id));
        }
      }
    }
  }, [mounted, createdAt, totalDebt, goal, finances]);

  if (!mounted || !createdAt || !currency) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, white, #74C0FC)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#4DABF7' }}></div>
          <p style={{ color: '#666666' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const currentWeek = calculateWeekNumber(createdAt);
  const weekDisplay = formatWeekDisplay(currentWeek, progress.totalWeeks);
  const weeklyMessage = getWeeklyMessage(currentWeek);

  const hasDebt = debtTotals.totalDebt > 0;
  const hasHabit = habit.committed;
  const habitAmount = habit.customAmount || habit.onePercentAmount || 0;
  
  // Calculate monthly surplus (income - expenses - debt payments)
  const monthlySurplus = finances.monthlyIncome - finances.monthlySpending - debtTotals.totalMonthlyPayment;
  const hasSurplusWarning = monthlySurplus < 0;
  
  // Find next debt to pay off (lowest balance for snowball, highest interest for avalanche)
  // Default to snowball (lowest balance)
  const nextDebtToPayoff = computedDebts.length > 0 
    ? computedDebts.reduce((prev, curr) => {
        const prevBalance = prev.debtType === 'mortgage' ? prev.principal : prev.balance;
        const currBalance = curr.debtType === 'mortgage' ? curr.principal : curr.balance;
        return currBalance < prevBalance ? curr : prev;
      })
    : null;
  
  // Calculate debt-free date (simplified - uses longest payoff time)
  const maxMonthsToPayoff = computedDebts.length > 0
    ? Math.max(...computedDebts.map(d => d.monthsToPayoff === Infinity ? 999 : d.monthsToPayoff))
    : 0;
  const debtFreeDate = maxMonthsToPayoff > 0 && maxMonthsToPayoff < 999
    ? new Date(Date.now() + maxMonthsToPayoff * 30 * 24 * 60 * 60 * 1000)
    : null;
  
  // Check PRO status
  const hasPro = createdAt ? hasProAccess({ createdAt, isPro, proExpiresAt, adminSettings }) : false;

  return (
    <>
      <Navigation />
      <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, white, rgba(178, 242, 187, 0.2), rgba(116, 192, 252, 0.2))' }}>
        <PrivacyBadge />
        
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold" style={{ color: '#000000' }}>
                Your Dashboard
              </h1>
              {hasPro && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#FFD700', color: '#000000' }}>
                  <Crown size={16} />
                  <span>PRO</span>
                </div>
              )}
            </div>
            <p style={{ color: '#666666' }}>
              {weeklyMessage}
            </p>
          </div>
          
          <button
            onClick={() => router.push('/settings')}
            className="p-3 bg-white rounded-lg shadow hover:shadow-lg transition-all"
          >
            <Settings size={24} style={{ color: '#666666' }} />
          </button>
        </div>

        {/* Week Banner */}
        <div className="rounded-lg shadow-lg p-6 md:p-8 mb-6 text-white" style={{ background: 'linear-gradient(to right, #51CF66, #4DABF7)' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="mb-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>You're on</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-2">
                {weekDisplay}
              </h2>
              {progress.daysRemaining !== null && (
                <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  {progress.daysRemaining} days remaining to your target
                </p>
              )}
            </div>
            
            {goal.label && (
              <div className="text-center md:text-right">
                <p className="mb-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Your goal</p>
                <p className="text-2xl font-bold">{goal.label}</p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {progress.timeProgressPercentage > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Time Progress</span>
                <span className="text-sm font-semibold">
                  {progress.timeProgressPercentage}%
                </span>
              </div>
              <div className="w-full rounded-full h-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
                <div 
                  className="h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${progress.timeProgressPercentage}%`,
                    backgroundColor: '#FFFFFF'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Monthly Income */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#74C0FC' }}>
                <DollarSign style={{ color: '#1C7ED6' }} size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm" style={{ color: '#666666' }}>Monthly Income</p>
                <p className="text-2xl font-bold" style={{ color: '#1C7ED6' }}>
                  {formatCurrency(finances.monthlyIncome, currency.code)}
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Surplus (after debt payments) */}
          <div className={`rounded-lg shadow p-6 ${
            monthlySurplus >= 0 ? 'bg-white' : ''
          }`} style={{ backgroundColor: monthlySurplus >= 0 ? '#FFFFFF' : '#FEE2E2' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${
                monthlySurplus >= 0 ? '' : ''
              }`} style={{ backgroundColor: monthlySurplus >= 0 ? '#8CE99A' : '#FECACA' }}>
                <TrendingUp style={{ color: monthlySurplus >= 0 ? '#37B24D' : '#DC2626' }} size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm" style={{ color: '#666666' }}>Monthly Surplus</p>
                <p className={`text-2xl font-bold ${
                  monthlySurplus >= 0 ? '' : ''
                }`} style={{ color: monthlySurplus >= 0 ? '#37B24D' : '#DC2626' }}>
                  {formatCurrency(monthlySurplus, currency.code)}
                </p>
                {hasSurplusWarning && (
                  <p className="text-xs mt-1" style={{ color: '#DC2626' }}>
                    ⚠️ Debt payments exceed surplus
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Total Debt */}
          {hasDebt ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#FFE066' }}>
                  <Target style={{ color: '#FF9800' }} size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm" style={{ color: '#666666' }}>Total Debt</p>
                  <p className="text-2xl font-bold" style={{ color: '#FF9800' }}>
                    {formatCurrency(debtTotals.totalDebt, currency.code)}
                  </p>
                  {debtTotals.totalInterest > 0 && (
                    <p className="text-xs mt-1" style={{ color: '#666666' }}>
                      Interest: {formatCurrency(debtTotals.totalInterest, currency.code)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#D1FAE5' }}>
                  <Target style={{ color: '#10B981' }} size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm" style={{ color: '#666666' }}>Debt Status</p>
                  <p className="text-xl font-bold" style={{ color: '#10B981' }}>
                    Debt Free! ✓
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Income Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#000000' }}>
              <BarChart3 style={{ color: '#4DABF7' }} />
              Income Breakdown
            </h3>

            <div className="mb-6">
              {/* Simple visual representation */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-40 h-40">
                  {/* Circular progress - all active for now */}
                  <svg className="transform -rotate-90" width="160" height="160">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#E5E7EB"
                      strokeWidth="20"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#FF6B6B"
                      strokeWidth="20"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset="0"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold" style={{ color: '#FF6B6B' }}>100%</p>
                      <p className="text-xs" style={{ color: '#666666' }}>Active</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: '#FFA8A8' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF6B6B' }}></div>
                    <span className="font-medium" style={{ color: '#000000' }}>Active Income (Job)</span>
                  </div>
                  <span className="font-bold" style={{ color: '#E03131' }}>
                    {formatCurrency(finances.monthlyIncome, currency.code)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded opacity-50" style={{ backgroundColor: '#F9FAFB' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#51CF66' }}></div>
                    <span className="font-medium" style={{ color: '#000000' }}>Passive Income</span>
                  </div>
                  <span className="font-bold" style={{ color: '#666666' }}>
                    {formatCurrency(0, currency.code)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border rounded p-3 text-sm" style={{ backgroundColor: '#DBEAFE', borderColor: '#93C5FD' }}>
              <p style={{ color: '#374151' }}>
                💡 <strong>Future:</strong> Track passive income sources (investments, rentals, etc.) 
                to see your progress toward financial freedom.
              </p>
            </div>
          </div>

          {/* Debt Summary or Habit Reminder */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {hasDebt ? (
              <>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#000000' }}>
                  <Target style={{ color: '#FFC107' }} />
                  Debt Overview
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#FFE066' }}>
                    <p className="text-sm mb-1" style={{ color: '#666666' }}>Total Remaining</p>
                    <p className="text-3xl font-bold" style={{ color: '#FF9800' }}>
                      {formatCurrency(debtTotals.totalDebt, currency.code)}
                    </p>
                    {debtTotals.totalInterest > 0 && (
                      <p className="text-xs mt-1" style={{ color: '#666666' }}>
                        Total Interest: {formatCurrency(debtTotals.totalInterest, currency.code)}
                      </p>
                    )}
                  </div>

                  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                    <p className="text-sm mb-1" style={{ color: '#666666' }}>Monthly Payment</p>
                    <p className="text-2xl font-bold" style={{ color: '#374151' }}>
                      {formatCurrency(debtTotals.totalMonthlyPayment, currency.code)}
                    </p>
                  </div>
                  
                  {debtFreeDate && (
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#DBEAFE' }}>
                      <p className="text-sm mb-1" style={{ color: '#666666' }}>Debt-Free Date</p>
                      <p className="text-xl font-bold" style={{ color: '#1C7ED6' }}>
                        {debtFreeDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                  
                  {nextDebtToPayoff && (
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
                      <p className="text-sm mb-1" style={{ color: '#666666' }}>Next to Pay Off</p>
                      <p className="text-lg font-bold" style={{ color: '#92400E' }}>
                        {nextDebtToPayoff.name}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#666666' }}>
                        {formatCurrency(
                          nextDebtToPayoff.debtType === 'mortgage' ? nextDebtToPayoff.principal : nextDebtToPayoff.balance,
                          currency.code
                        )} remaining
                      </p>
                    </div>
                  )}

                  {hasHabit && (
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#8CE99A' }}>
                      <p className="text-sm mb-1" style={{ color: '#666666' }}>With {habit.customAmount ? 'Step-up Strategy' : '1% Habit'}</p>
                      <p className="text-2xl font-bold" style={{ color: '#37B24D' }}>
                        {formatCurrency(
                          totalMonthlyPayment + habitAmount, 
                          currency.code
                        )}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#666666' }}>
                        +{formatCurrency(habitAmount, currency.code)}/month
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => router.push('/onboarding/debts')}
                  className="w-full py-3 text-white rounded-lg font-semibold transition-all"
                  style={{ backgroundColor: '#FFC107' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF9800'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFC107'}
                >
                  View Debt Details →
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#000000' }}>
                  <TrendingUp style={{ color: '#51CF66' }} />
                  Your Commitment
                </h3>

                {hasHabit ? (
                  <div className="space-y-4">
                    <div className="border-2 rounded-lg p-6 text-center" style={{ backgroundColor: '#8CE99A', borderColor: '#51CF66' }}>
                      <p className="text-sm mb-2" style={{ color: '#666666' }}>{habit.customAmount ? 'Step-up Strategy' : '1% Monthly Habit'}</p>
                      <p className="text-4xl font-bold mb-2" style={{ color: '#37B24D' }}>
                        {formatCurrency(habitAmount, currency.code)}
                      </p>
                      <p className="text-sm" style={{ color: '#374151' }}>
                        Improving by this amount each month
                      </p>
                    </div>

                    <div className="border rounded p-4 text-sm" style={{ backgroundColor: '#DBEAFE', borderColor: '#93C5FD' }}>
                      <p className="font-semibold mb-2" style={{ color: '#000000' }}>📈 Annual Impact:</p>
                      <p style={{ color: '#374151' }}>
                        {formatCurrency(habitAmount * 12, currency.code)} per year
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg p-6 text-center" style={{ backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }}>
                    <p className="mb-4" style={{ color: '#374151' }}>
                      You haven't committed to the 1% habit yet.
                    </p>
                    <button
                      onClick={() => router.push('/onboarding/habit')}
                      className="px-6 py-3 text-white rounded-lg font-semibold"
                      style={{ backgroundColor: '#4DABF7' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1C7ED6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4DABF7'}
                    >
                      Set 1% Habit
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => router.push('/check-in')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg transition-all" style={{ backgroundColor: '#8CE99A' }}>
                  <PlusCircle style={{ color: '#37B24D' }} size={28} />
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: '#000000' }}>Weekly Check-In</p>
                  <p className="text-sm" style={{ color: '#666666' }}>Update your progress</p>
                </div>
              </div>
              <div className="transition-all" style={{ color: '#999999' }}>→</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/challenge')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg transition-all" style={{ backgroundColor: '#FEF3C7' }}>
                  <Zap style={{ color: '#D97706' }} size={28} />
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: '#000000' }}>1% Weekly Challenge</p>
                  <p className="text-sm" style={{ color: '#666666' }}>Optional boost this week</p>
                </div>
              </div>
              <div className="transition-all" style={{ color: '#999999' }}>→</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/milestones')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg transition-all" style={{ backgroundColor: '#74C0FC' }}>
                  <Target style={{ color: '#1C7ED6' }} size={28} />
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: '#000000' }}>View Milestones</p>
                  <p className="text-sm" style={{ color: '#666666' }}>Track your achievements</p>
                </div>
              </div>
              <div className="transition-all" style={{ color: '#999999' }}>→</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/check-in/history')}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg transition-all" style={{ backgroundColor: '#DBEAFE' }}>
                  <Calendar style={{ color: '#2563EB' }} size={28} />
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: '#000000' }}>Check-In History</p>
                  <p className="text-sm" style={{ color: '#666666' }}>View past weeks</p>
                </div>
              </div>
              <div className="transition-all" style={{ color: '#999999' }}>→</div>
            </div>
          </button>
        </div>

        {/* Resources Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#000000' }}>Educational Resources</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/life-moments')}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg transition-all" style={{ backgroundColor: '#E9D5FF' }}>
                    <Heart style={{ color: '#7C3AED' }} size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-lg" style={{ color: '#000000' }}>Life Moments</p>
                    <p className="text-sm" style={{ color: '#666666' }}>Real situations at different ages</p>
                  </div>
                </div>
                <div className="transition-all" style={{ color: '#999999' }}>→</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/stories')}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg transition-all" style={{ backgroundColor: '#FED7AA' }}>
                    <BookOpen style={{ color: '#EA580C' }} size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-lg" style={{ color: '#000000' }}>Real Stories</p>
                    <p className="text-sm" style={{ color: '#666666' }}>Learn from others' experiences</p>
                  </div>
                </div>
                <div className="transition-all" style={{ color: '#999999' }}>→</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/recommendations')}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg transition-all" style={{ backgroundColor: '#D1FAE5' }}>
                    <Sparkles style={{ color: '#065F46' }} size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-lg" style={{ color: '#000000' }}>Recommended Tools</p>
                    <p className="text-sm" style={{ color: '#666666' }}>Services that may help</p>
                  </div>
                </div>
                <div className="transition-all" style={{ color: '#999999' }}>→</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/analytics')}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg transition-all group-hover:bg-purple-500" style={{ backgroundColor: '#F3E8FF' }}>
                    <BarChart3 className="group-hover:text-white transition-all" style={{ color: '#9333EA' }} size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-lg flex items-center gap-2" style={{ color: '#000000' }}>
                      Analytics
                      {!canUseFeature('advanced_analytics', { createdAt, isPro, proExpiresAt, adminSettings }) && (
                        <span className="text-xs text-white px-2 py-1 rounded-full" style={{ backgroundColor: '#37B24D' }}>PRO</span>
                      )}
                    </p>
                    <p className="text-sm" style={{ color: '#666666' }}>Deep insights & projections</p>
                  </div>
                </div>
                <div className="transition-all group-hover:text-purple-500" style={{ color: '#999999' }}>→</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/export')}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg transition-all group-hover:bg-green-500" style={{ backgroundColor: '#D1FAE5' }}>
                    <Download className="group-hover:text-white transition-all" style={{ color: '#065F46' }} size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-lg flex items-center gap-2" style={{ color: '#000000' }}>
                      Export Data
                      {!canUseFeature('export_data', { createdAt, isPro, proExpiresAt, adminSettings }) && (
                        <span className="text-xs text-white px-2 py-1 rounded-full" style={{ backgroundColor: '#37B24D' }}>PRO</span>
                      )}
                    </p>
                    <p className="text-sm" style={{ color: '#666666' }}>Download as CSV or PDF</p>
                  </div>
                </div>
                <div className="transition-all group-hover:text-green-500" style={{ color: '#999999' }}>→</div>
              </div>
            </button>
          </div>
        </div>

        {/* Calculators Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#000000' }}>Calculators</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/calculators/phone')}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg transition-all" style={{ backgroundColor: '#DBEAFE' }}>
                    <Smartphone style={{ color: '#2563EB' }} size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-lg" style={{ color: '#000000' }}>Dream Phone</p>
                    <p className="text-sm" style={{ color: '#666666' }}>Save vs credit comparison</p>
                  </div>
                </div>
                <div className="transition-all" style={{ color: '#999999' }}>→</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/calculators/credit')}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg transition-all" style={{ backgroundColor: '#FED7AA' }}>
                    <CreditCard style={{ color: '#EA580C' }} size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-lg" style={{ color: '#000000' }}>Cost of Credit</p>
                    <p className="text-sm" style={{ color: '#666666' }}>See the real cost</p>
                  </div>
                </div>
                <div className="transition-all" style={{ color: '#999999' }}>→</div>
              </div>
            </button>
          </div>
        </div>

        {/* Contextual Recommendations */}
        {showRecs && recommendations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold" style={{ color: '#000000' }}>Tools That May Help</h2>
              <button
                onClick={() => router.push('/recommendations')}
                className="text-sm font-semibold transition-all"
                style={{ color: '#37B24D' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#2F9E44'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#37B24D'}
              >
                View All →
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              {recommendations.map((rec) => (
                <AffiliateCard key={rec.id} partner={rec} />
              ))}
            </div>
            
            <div className="text-center">
              <button
                onClick={() => setShowRecs(false)}
                className="text-sm underline transition-all"
                style={{ color: '#666666' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
              >
                Hide recommendations
              </button>
            </div>
          </div>
        )}

        {/* Footer message */}
        <div className="text-center text-sm" style={{ color: '#999999' }}>
          <p>🔒 All data stored locally on your device</p>
        </div>
        </div>
      </div>

      {/* Milestone Celebration */}
      {showMilestone && celebrateMilestone && (
        <MilestoneCelebration
          milestone={celebrateMilestone}
          onClose={() => setShowMilestone(false)}
        />
      )}
    </>
  );
}
