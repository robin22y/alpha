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
import LifeBufferAsk from '@/components/LifeBufferAsk';
import HabitCard from '@/components/HabitCard';
import { getContextualRecommendations, shouldShowRecommendations, markRecommendationsShown, getRecentlySeenPartners } from '@/lib/recommendationEngine';
import AffiliateCard from '@/components/AffiliateCard';
import { computeDebtsFromStore, calculateDebtTotals } from '@/lib/debtUtils';
import type { DebtComputed } from '@/lib/debtEngine';
import DebtSparkline from '@/components/DebtSparkline';
import IncomeSourcesModal from '@/components/IncomeSourcesModal';
import MetricCard from '@/components/MetricCard';
import { 
  getIncomeSources, 
  saveIncomeSources, 
  calculateIncomeTotals,
  initializeDefaultIncome,
  type IncomeSource 
} from '@/lib/incomeSources';

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
  const [includeBuffer, setIncludeBuffer] = useState(false);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  
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
    
    // Check for life buffer choice
    const choice = localStorage.getItem("zdebt_life_buffer_choice");
    if (choice === "yes") setIncludeBuffer(true);
    
    // Load income sources
    const sources = getIncomeSources();
    if (sources.length === 0 && finances.monthlyIncome > 0) {
      // Initialize default from onboarding income
      initializeDefaultIncome(finances.monthlyIncome);
      const defaultSources = getIncomeSources();
      setIncomeSources(defaultSources);
    } else {
      setIncomeSources(sources);
    }
    
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
  const totalWeeks = progress.totalWeeks || 103;
  const daysRemaining = progress.daysRemaining || 730;
  const goalName = goal.label || 'Plan ahead';

  const hasDebt = debtTotals.totalDebt > 0;
  const hasHabit = habit.committed;
  const habitAmount = habit.customAmount || habit.onePercentAmount || 0;
  
  // Calculate monthly surplus (income - spending - debt payments)
  // Note: monthlySpending should NOT include debt payments (they're tracked separately)
  // If user included debt payments in monthlySpending, this will double-count them
  // The correct calculation: income - spending (excluding debts) - debt payments
  const monthlySurplus = finances.monthlyIncome - finances.monthlySpending - debtTotals.totalMonthlyPayment;
  const hasSurplusWarning = monthlySurplus < 0;
  
  // Find next debt to pay off (lowest balance for snowball, highest interest for avalanche)
  // Default to snowball (lowest balance)
  const nextDebtToPayoff = computedDebts.length > 0 
    ? computedDebts.reduce((prev, curr) => {
        const prevBalance = prev.debtType === 'mortgage' ? (prev.principal || 0) : (prev.balance || 0);
        const currBalance = curr.debtType === 'mortgage' ? (curr.principal || 0) : (curr.balance || 0);
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
        
        <div className="max-w-5xl mx-auto px-4 pb-10">
          {/* Settings Button */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-2">
              {hasPro && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#FFD700', color: '#000000' }}>
                  <Crown size={16} />
                  <span>PRO</span>
                </div>
              )}
              <button
                onClick={() => router.push('/settings')}
                className="p-3 bg-white rounded-lg shadow hover:shadow-lg transition-all"
              >
                <Settings size={24} style={{ color: '#666666' }} />
              </button>
            </div>
          </div>

          {/* Life Buffer Ask */}
          <LifeBufferAsk onSelect={(v) => setIncludeBuffer(v)} />

          {/* Hero / Journey Section */}
          <section className="mb-6">
            <div className="bg-gradient-to-r from-emerald-500 to-sky-500 rounded-3xl p-5 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide opacity-90">
                  Your journey
                </p>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Your Journey to Your Goal
                </h1>
                <p className="text-sm md:text-base mt-1">
                  Week {currentWeek} of {totalWeeks} • {daysRemaining} days to your target
                </p>
                <p className="text-sm mt-1 opacity-90">
                  Goal: <span className="font-semibold">{goalName}</span>
                </p>
              </div>
              <p className="text-xs md:text-sm bg-white/15 rounded-2xl px-3 py-2 md:max-w-xs">
                This page shows your money snapshot and tools for this week.
              </p>
            </div>
          </section>

          {/* Money Snapshot Section */}
          <section className="mb-6">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-800">
                Money Snapshot
              </h2>
            </div>

            {/* Top KPIs */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-4">
              {/* Monthly Income */}
              <MetricCard
                icon={<DollarSign className="text-blue-600" size={20} />}
                iconBg="bg-blue-100"
                title="Monthly Income"
                value={formatCurrency(finances.monthlyIncome, currency.code)}
                valueColor="text-blue-700"
              />

              {/* Monthly Surplus */}
              {monthlySurplus >= 0 ? (
                <MetricCard
                  icon={<TrendingUp className="text-green-600" size={20} />}
                  iconBg="bg-green-100"
                  title="Monthly Surplus"
                  value={formatCurrency(monthlySurplus, currency.code)}
                  valueColor="text-green-700"
                />
              ) : (
                <MetricCard
                  icon={<TrendingUp className="text-red-600" size={20} />}
                  iconBg="bg-red-100"
                  title="Monthly Surplus"
                  value={formatCurrency(monthlySurplus, currency.code)}
                  valueColor="text-red-700"
                />
              )}

              {/* Total Debt */}
              {hasDebt ? (
                <MetricCard
                  icon={<Target className="text-yellow-600" size={20} />}
                  iconBg="bg-yellow-100"
                  title="Total Debt Remaining"
                  value={formatCurrency(debtTotals.totalDebt, currency.code)}
                  valueColor="text-gray-900"
                />
              ) : (
                <MetricCard
                  icon={<Target className="text-green-600" size={20} />}
                  iconBg="bg-green-100"
                  title="Debt Status"
                  value="Debt Free! ✓"
                  valueColor="text-green-700"
                />
              )}
            </div>

            {/* Income vs Debt */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 auto-rows-fr">
          {/* Income Breakdown */}
          {(() => {
            const totals = calculateIncomeTotals(incomeSources);
            const maxCategory = Math.max(totals.totalWork, totals.totalAssets, totals.totalOther, 1);
            
            return (
              <div className="bg-white rounded-2xl shadow p-6 h-full flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="text-blue-600 text-xl">📊</div>
                  <div className="font-bold text-gray-900 text-lg">
                    Income Breakdown
                  </div>
                </div>

                <div className="text-4xl font-bold text-gray-900">
                  {formatCurrency(totals.total, currency.code)}
                </div>
                <div className="text-gray-500 text-sm -mt-2">
                  Total Monthly Income
                </div>

                {/* Money from Work Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-700 mb-1">
                    <span>Money from Work</span>
                    <span className="font-medium">{formatCurrency(totals.totalWork, currency.code)}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full">
                    <div
                      className="h-3 bg-blue-500 rounded-full transition-all"
                      style={{
                        width: `${(totals.totalWork / maxCategory) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Money from Assets Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-700 mb-1">
                    <span>Money from Assets</span>
                    <span className="font-medium">{formatCurrency(totals.totalAssets, currency.code)}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full">
                    <div
                      className="h-3 bg-green-500 rounded-full transition-all"
                      style={{
                        width: `${(totals.totalAssets / maxCategory) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Other Money Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-700 mb-1">
                    <span>Other Money</span>
                    <span className="font-medium">{formatCurrency(totals.totalOther, currency.code)}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full">
                    <div
                      className="h-3 bg-amber-500 rounded-full transition-all"
                      style={{
                        width: `${(totals.totalOther / maxCategory) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Add/Edit Income Sources Button */}
                <button
                  onClick={() => setShowIncomeModal(true)}
                  className="text-blue-600 hover:text-blue-800 underline text-sm text-left mt-1"
                >
                  + Add / Edit Income Sources
                </button>

                <div className="bg-blue-50 text-blue-700 text-xs rounded-xl p-3 mt-auto">
                  💡 Future: Track more income sources.
                </div>
              </div>
            );
          })()}

          {/* Debt Overview */}
          <div className="bg-white rounded-2xl shadow p-6 h-full flex flex-col gap-4">
            {hasDebt ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="text-orange-600 text-xl">💸</div>
                  <div className="font-bold text-gray-900 text-lg">
                    Debt Overview
                  </div>
                </div>

                <div className="text-4xl font-bold text-gray-900">
                  {formatCurrency(debtTotals.totalDebt, currency.code)}
                </div>
                <div className="text-gray-500 text-sm -mt-2">
                  Total Debt Remaining
                </div>

                {/* Progress Bar */}
                {(() => {
                  // Calculate percent paid (simplified - assume original debt was higher)
                  // For now, we'll show progress based on estimated original debt
                  const estimatedOriginalDebt = debtTotals.totalDebt * 1.1; // Rough estimate
                  const percentPaid = Math.max(0, Math.min(100, ((estimatedOriginalDebt - debtTotals.totalDebt) / estimatedOriginalDebt) * 100));
                  
                  return (
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{percentPaid.toFixed(0)}% paid</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-yellow-500 h-3 rounded-full transition-all"
                          style={{ width: `${percentPaid}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Payoff Timeline Sparkline */}
                {debtFreeDate && maxMonthsToPayoff > 0 && maxMonthsToPayoff < 999 && (() => {
                  // Generate sparkline data (simplified projection)
                  const sparklineData = [];
                  const months = Math.min(maxMonthsToPayoff, 12); // Show up to 12 months
                  for (let i = 0; i <= months; i++) {
                    const monthProgress = i / months;
                    const remainingBalance = debtTotals.totalDebt * (1 - monthProgress);
                    sparklineData.push({
                      month: i,
                      balance: Math.max(0, remainingBalance)
                    });
                  }
                  
                  return (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Payoff Timeline</div>
                      <DebtSparkline data={sparklineData} debtFreeDate={debtFreeDate} />
                    </div>
                  );
                })()}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly Payment</span>
                    <span className="font-medium text-gray-900">{formatCurrency(debtTotals.totalMonthlyPayment, currency.code)}</span>
                  </div>
                  
                  {debtFreeDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Debt-Free Date</span>
                      <span className="font-medium text-gray-900">
                        {debtFreeDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  
                  {nextDebtToPayoff && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Next to Pay Off</span>
                      <span className="font-medium text-gray-900">{nextDebtToPayoff.name}</span>
                    </div>
                  )}

                  {hasHabit && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Step-up Strategy</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(totalMonthlyPayment + habitAmount, currency.code)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Interest you're on track to pay
                  </p>
                  <p className="text-lg font-semibold text-gray-700">
                    {formatCurrency(debtTotals.totalInterest, currency.code)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    This will decrease if you increase your monthly payments.
                  </p>
                </div>

                <button
                  onClick={() => router.push('/onboarding/debts')}
                  className="w-full py-2 text-white rounded-xl text-sm font-semibold transition-all mt-auto"
                  style={{ backgroundColor: '#FFC107' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF9800'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFC107'}
                >
                  View Debt Details →
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="text-green-600 text-xl">📈</div>
                  <div className="font-bold text-gray-900 text-lg">
                    Your Commitment
                  </div>
                </div>

                {hasHabit ? (
                  <>
                    <div className="text-4xl font-bold text-gray-900">
                      {formatCurrency(habitAmount, currency.code)}
                    </div>
                    <div className="text-gray-500 text-sm -mt-2">
                      {habit.customAmount ? 'Step-up Strategy' : '1% Monthly Habit'}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Annual Impact</span>
                        <span className="font-medium text-gray-900">{formatCurrency(habitAmount * 12, currency.code)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-gray-900">
                      £0
                    </div>
                    <div className="text-gray-500 text-sm -mt-2">
                      No habit set yet
                    </div>

                    <button
                      onClick={() => router.push('/onboarding/habit')}
                      className="w-full py-2 text-white rounded-xl text-sm font-semibold transition-all mt-auto"
                      style={{ backgroundColor: '#4DABF7' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1C7ED6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4DABF7'}
                    >
                      Set 1% Habit
                    </button>
                  </>
                )}
              </>
            )}
          </div>
            </div>
          </section>

          {/* Progress & Check-ins Section */}
          <section className="mb-6">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-800">
                Progress & Check-ins
              </h2>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
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

              {currentWeek >= 4 && (
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
              )}

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
          </section>

          {/* Learn & Tools Section */}
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-800">
                Learn & Tools
              </h2>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            <button
              onClick={() => router.push('/life-moments')}
              className="bg-white rounded-2xl shadow p-4 flex items-center justify-between h-full hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                  <Heart size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Life Moments</div>
                  <div className="text-sm text-gray-500">Real situations at different ages</div>
                </div>
              </div>
              <div className="text-gray-400 text-xl ml-2">→</div>
            </button>

            {/* 1% Habit Card - where Real Stories was */}
            <HabitCard monthlyIncome={finances.monthlyIncome} />

            <button
              onClick={() => router.push('/stories')}
              className="bg-white rounded-2xl shadow p-4 flex items-center justify-between h-full hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                  <BookOpen size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Real Stories</div>
                  <div className="text-sm text-gray-500">Learn from others' experiences</div>
                </div>
              </div>
              <div className="text-gray-400 text-xl ml-2">→</div>
            </button>

            <button
              onClick={() => router.push('/recommendations')}
              className="bg-white rounded-2xl shadow p-4 flex items-center justify-between h-full hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Recommended Tools</div>
                  <div className="text-sm text-gray-500">Services that may help</div>
                </div>
              </div>
              <div className="text-gray-400 text-xl ml-2">→</div>
            </button>

            <button
              onClick={() => router.push('/analytics')}
              className="bg-white rounded-2xl shadow p-4 flex items-center justify-between h-full hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    Analytics
                    {!canUseFeature('advanced_analytics', { createdAt, isPro, proExpiresAt, adminSettings }) && (
                      <span className="text-xs text-white px-2 py-1 rounded-full" style={{ backgroundColor: '#37B24D' }}>PRO</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Deep insights & projections</div>
                </div>
              </div>
              <div className="text-gray-400 text-xl ml-2">→</div>
            </button>

            <button
              onClick={() => router.push('/export')}
              className="bg-white rounded-2xl shadow p-4 flex items-center justify-between h-full hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                  <Download size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    Export Data
                    {!canUseFeature('export_data', { createdAt, isPro, proExpiresAt, adminSettings }) && (
                      <span className="text-xs text-white px-2 py-1 rounded-full" style={{ backgroundColor: '#37B24D' }}>PRO</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Download as CSV or PDF</div>
                </div>
              </div>
              <div className="text-gray-400 text-xl ml-2">→</div>
            </button>
              <button
                onClick={() => router.push('/calculators/phone')}
                className="bg-white rounded-2xl shadow p-4 flex items-center justify-between h-full hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Dream Phone</div>
                    <div className="text-sm text-gray-500">Save vs credit comparison</div>
                  </div>
                </div>
                <div className="text-gray-400 text-xl ml-2">→</div>
              </button>

              <button
                onClick={() => router.push('/calculators/credit')}
                className="bg-white rounded-2xl shadow p-4 flex items-center justify-between h-full hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Cost of Credit</div>
                    <div className="text-sm text-gray-500">See the real cost</div>
                  </div>
                </div>
                <div className="text-gray-400 text-xl ml-2">→</div>
              </button>
            </div>

            {/* Contextual Recommendations */}
            {showRecs && recommendations.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-800">Tools That May Help</h3>
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
          </section>

          {/* Footer message */}
          <div className="text-center text-sm mt-8" style={{ color: '#999999' }}>
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

      {/* Income Sources Modal */}
      <IncomeSourcesModal
        isOpen={showIncomeModal}
        sources={incomeSources}
        monthlyIncome={finances.monthlyIncome}
        onClose={() => setShowIncomeModal(false)}
        onSave={(sources) => {
          saveIncomeSources(sources);
          setIncomeSources(sources);
        }}
      />
    </>
  );
}
