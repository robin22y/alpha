import { DebtItem } from '@/store/useUserStore';
import { CheckIn } from '@/lib/checkIn';
import { Challenge } from '@/lib/challenges';

export interface ProgressSnapshot {
  week: number;
  date: string;
  totalDebt: number;
  totalPaid: number;
  percentComplete: number;
}

export interface PaymentVelocity {
  averageWeeklyPayment: number;
  averageExtraPayment: number;
  totalExtraPayments: number;
  velocityTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface ProjectedPayoff {
  currentPace: {
    weeksRemaining: number;
    dateEstimate: Date;
  };
  withExtraPayments: {
    weeksRemaining: number;
    dateEstimate: Date;
    weeksSaved: number;
  };
  bestCase: {
    weeksRemaining: number;
    dateEstimate: Date;
    weeksSaved: number;
  };
}

export interface SavingsAnalysis {
  totalInterestSaved: number;
  extraPaymentsSaved: number;
  challengeEarnings: number;
  totalSavings: number;
}

export interface WeeklyPerformance {
  week: number;
  checkedIn: boolean;
  extraPayment: number;
  challengeCompleted: boolean;
  challengeAmount: number;
  moodScore: number;
}

/**
 * Calculate progress snapshots over time
 */
export function calculateProgressSnapshots(
  debts: DebtItem[],
  checkIns: CheckIn[],
  startDate: string,
  originalTotalDebt: number
): ProgressSnapshot[] {
  const snapshots: ProgressSnapshot[] = [];
  const start = new Date(startDate);
  
  // Create weekly snapshots
  const now = new Date();
  const weeksSinceStart = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
  
  for (let week = 0; week <= weeksSinceStart; week++) {
    const snapshotDate = new Date(start);
    snapshotDate.setDate(snapshotDate.getDate() + (week * 7));
    
    // Calculate debt at this point
    // This is simplified - in reality, you'd track historical debt values
    const currentTotalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
    const totalPaid = originalTotalDebt - currentTotalDebt;
    const percentComplete = originalTotalDebt > 0 ? (totalPaid / originalTotalDebt) * 100 : 0;
    
    snapshots.push({
      week,
      date: snapshotDate.toISOString(),
      totalDebt: currentTotalDebt,
      totalPaid,
      percentComplete: Math.round(percentComplete)
    });
  }
  
  return snapshots;
}

/**
 * Calculate payment velocity metrics
 */
export function calculatePaymentVelocity(
  checkIns: CheckIn[]
): PaymentVelocity {
  if (checkIns.length === 0) {
    return {
      averageWeeklyPayment: 0,
      averageExtraPayment: 0,
      totalExtraPayments: 0,
      velocityTrend: 'stable'
    };
  }
  
  const extraPayments = checkIns
    .filter(c => c.extraPayment && c.extraPayment > 0)
    .map(c => c.extraPayment!);
  
  const averageWeeklyPayment = extraPayments.length > 0
    ? extraPayments.reduce((sum, p) => sum + p, 0) / checkIns.length
    : 0;
  
  const averageExtraPayment = extraPayments.length > 0
    ? extraPayments.reduce((sum, p) => sum + p, 0) / extraPayments.length
    : 0;
  
  const totalExtraPayments = extraPayments.reduce((sum, p) => sum + p, 0);
  
  // Calculate trend (last 4 weeks vs previous 4 weeks)
  let velocityTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  
  if (checkIns.length >= 8) {
    const sortedCheckIns = [...checkIns].sort((a, b) => b.week - a.week);
    const recentPayments = sortedCheckIns.slice(0, 4)
      .reduce((sum, c) => sum + (c.extraPayment || 0), 0);
    const olderPayments = sortedCheckIns.slice(4, 8)
      .reduce((sum, c) => sum + (c.extraPayment || 0), 0);
    
    if (recentPayments > olderPayments * 1.1) velocityTrend = 'increasing';
    else if (recentPayments < olderPayments * 0.9) velocityTrend = 'decreasing';
  }
  
  return {
    averageWeeklyPayment,
    averageExtraPayment,
    totalExtraPayments,
    velocityTrend
  };
}

/**
 * Project payoff scenarios
 */
export function calculateProjectedPayoff(
  debts: DebtItem[],
  monthlyLeftover: number,
  averageExtraPayment: number
): ProjectedPayoff {
  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinimumPayment = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  
  // Current pace (minimum payments only)
  const currentWeeklyPayment = totalMinimumPayment / 4.33;
  const currentWeeksRemaining = totalDebt > 0 ? Math.ceil(totalDebt / currentWeeklyPayment) : 0;
  const currentDate = new Date();
  const currentPayoffDate = new Date(currentDate);
  currentPayoffDate.setDate(currentPayoffDate.getDate() + (currentWeeksRemaining * 7));
  
  // With extra payments (based on average)
  const weeklyExtra = averageExtraPayment;
  const weeklyPaymentWithExtra = currentWeeklyPayment + weeklyExtra;
  const weeksWithExtra = totalDebt > 0 && weeklyPaymentWithExtra > 0 
    ? Math.ceil(totalDebt / weeklyPaymentWithExtra) 
    : currentWeeksRemaining;
  const extraPayoffDate = new Date(currentDate);
  extraPayoffDate.setDate(extraPayoffDate.getDate() + (weeksWithExtra * 7));
  
  // Best case (with all leftover)
  const weeklyLeftover = monthlyLeftover / 4.33;
  const bestCaseWeeklyPayment = currentWeeklyPayment + weeklyLeftover;
  const bestCaseWeeks = totalDebt > 0 && bestCaseWeeklyPayment > 0
    ? Math.ceil(totalDebt / bestCaseWeeklyPayment)
    : currentWeeksRemaining;
  const bestCaseDate = new Date(currentDate);
  bestCaseDate.setDate(bestCaseDate.getDate() + (bestCaseWeeks * 7));
  
  return {
    currentPace: {
      weeksRemaining: currentWeeksRemaining,
      dateEstimate: currentPayoffDate
    },
    withExtraPayments: {
      weeksRemaining: weeksWithExtra,
      dateEstimate: extraPayoffDate,
      weeksSaved: currentWeeksRemaining - weeksWithExtra
    },
    bestCase: {
      weeksRemaining: bestCaseWeeks,
      dateEstimate: bestCaseDate,
      weeksSaved: currentWeeksRemaining - bestCaseWeeks
    }
  };
}

/**
 * Calculate savings analysis
 */
export function calculateSavings(
  checkIns: CheckIn[],
  challenges: Challenge[],
  originalDebt: number,
  currentDebt: number
): SavingsAnalysis {
  // Total extra payments made
  const extraPaymentsSaved = checkIns
    .reduce((sum, c) => sum + (c.extraPayment || 0), 0);
  
  // Challenge earnings
  const challengeEarnings = challenges
    .filter(c => c.completed)
    .reduce((sum, c) => sum + (c.actualAmount || 0), 0);
  
  // Estimate interest saved (simplified calculation)
  // Assume average 20% APR on debt
  const averageAPR = 0.20;
  const paidSoFar = originalDebt - currentDebt;
  const estimatedInterestSaved = paidSoFar * (averageAPR / 52) * 4; // Rough estimate
  
  return {
    totalInterestSaved: estimatedInterestSaved,
    extraPaymentsSaved,
    challengeEarnings,
    totalSavings: estimatedInterestSaved + extraPaymentsSaved + challengeEarnings
  };
}

/**
 * Calculate weekly performance metrics
 */
export function calculateWeeklyPerformance(
  checkIns: CheckIn[],
  challenges: Challenge[]
): WeeklyPerformance[] {
  const performance: WeeklyPerformance[] = [];
  
  // Get unique weeks from check-ins and challenges
  const weeks = new Set([
    ...checkIns.map(c => c.week),
    ...challenges.map(c => c.week)
  ]);
  
  Array.from(weeks).sort((a, b) => a - b).forEach(week => {
    const checkIn = checkIns.find(c => c.week === week);
    const challenge = challenges.find(c => c.week === week);
    
    // Convert mood emoji to score
    const moodScore = checkIn ? getMoodScore(checkIn.moodEmoji) : 0;
    
    performance.push({
      week,
      checkedIn: !!checkIn,
      extraPayment: checkIn?.extraPayment || 0,
      challengeCompleted: challenge?.completed || false,
      challengeAmount: challenge?.completed ? (challenge.actualAmount || 0) : 0,
      moodScore
    });
  });
  
  return performance;
}

/**
 * Convert mood emoji to numeric score
 */
function getMoodScore(moodEmoji: string): number {
  const moodScores: Record<string, number> = {
    'great': 5,
    'good': 4,
    'okay': 3,
    'struggling': 2,
    'stressed': 1
  };
  
  return moodScores[moodEmoji] || 3;
}

/**
 * Calculate consistency score (0-100)
 */
export function calculateConsistencyScore(
  checkIns: CheckIn[],
  challenges: Challenge[],
  totalWeeks: number
): number {
  if (totalWeeks === 0) return 0;
  
  const checkInRate = (checkIns.length / totalWeeks) * 100;
  const challengeRate = challenges.length > 0 
    ? (challenges.filter(c => c.completed).length / challenges.length) * 100 
    : 0;
  
  // Weighted average: 60% check-ins, 40% challenges
  const consistencyScore = (checkInRate * 0.6) + (challengeRate * 0.4);
  
  return Math.round(Math.min(100, consistencyScore));
}

/**
 * Get insights based on analytics
 */
export function generateInsights(
  velocity: PaymentVelocity,
  performance: WeeklyPerformance[],
  consistencyScore: number
): string[] {
  const insights: string[] = [];
  
  // Velocity insights
  if (velocity.velocityTrend === 'increasing') {
    insights.push('📈 Your payment momentum is increasing! Keep it up.');
  } else if (velocity.velocityTrend === 'decreasing') {
    insights.push('📉 Payment momentum has slowed. Consider a weekly challenge boost.');
  }
  
  // Extra payment insights
  if (velocity.totalExtraPayments > 0) {
    insights.push(`💰 You've made £${velocity.totalExtraPayments.toFixed(0)} in extra payments!`);
  }
  
  // Consistency insights
  if (consistencyScore >= 80) {
    insights.push('🔥 Excellent consistency! You\'re building a strong habit.');
  } else if (consistencyScore < 50) {
    insights.push('💡 Try checking in more regularly to build momentum.');
  }
  
  // Recent mood trends
  if (performance.length >= 4) {
    const recentMoods = performance.slice(-4).map(p => p.moodScore);
    const avgMood = recentMoods.reduce((sum, m) => sum + m, 0) / recentMoods.length;
    
    if (avgMood >= 4) {
      insights.push('😊 Your mood has been positive recently. Financial progress feels good!');
    } else if (avgMood <= 2) {
      insights.push('💚 Remember: progress isn\'t always linear. Every step counts.');
    }
  }
  
  return insights;
}

