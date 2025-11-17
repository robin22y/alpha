export interface IncomeBreakdown {
  activeIncome: number;
  passiveIncome: number;
  activePercentage: number;
  passivePercentage: number;
}

export interface DebtProjection {
  currentTimeline: number; // months
  with1Percent: number; // months
  timeSaved: number; // months
  debtFreeDate: Date;
  debtFreeDateWith1Percent: Date;
}

export interface Phase {
  label: string;
  description: string;
  monthlyPayment: number;
  timelineMonths: number;
  debtFreeDate: Date;
}

/**
 * Calculate income breakdown
 * For now, all income is considered "active" (from work)
 * Future: can track passive income separately
 */
export function calculateIncomeBreakdown(
  monthlyIncome: number,
  passiveIncome: number = 0
): IncomeBreakdown {
  const activeIncome = monthlyIncome - passiveIncome;
  const total = monthlyIncome;
  
  return {
    activeIncome,
    passiveIncome,
    activePercentage: total > 0 ? Math.round((activeIncome / total) * 100) : 100,
    passivePercentage: total > 0 ? Math.round((passiveIncome / total) * 100) : 0
  };
}

/**
 * Calculate simple debt-free timeline
 * Basic calculation: totalDebt / monthlyPayment = months
 * Does NOT account for interest (simplified for MVP)
 */
export function calculateDebtProjection(
  totalDebt: number,
  monthlyPayment: number,
  onePercentAmount: number = 0,
  habitCommitted: boolean = false
): DebtProjection {
  // Current timeline
  const currentTimeline = monthlyPayment > 0 
    ? Math.ceil(totalDebt / monthlyPayment) 
    : 999;
  
  // Timeline with 1% extra payment
  const extraPayment = habitCommitted ? onePercentAmount : 0;
  const totalWithExtra = monthlyPayment + extraPayment;
  const with1Percent = totalWithExtra > 0 
    ? Math.ceil(totalDebt / totalWithExtra) 
    : 999;
  
  const timeSaved = currentTimeline - with1Percent;
  
  // Calculate dates
  const today = new Date();
  const debtFreeDate = new Date(today);
  debtFreeDate.setMonth(debtFreeDate.getMonth() + currentTimeline);
  
  const debtFreeDateWith1Percent = new Date(today);
  debtFreeDateWith1Percent.setMonth(debtFreeDateWith1Percent.getMonth() + with1Percent);
  
  return {
    currentTimeline,
    with1Percent,
    timeSaved,
    debtFreeDate,
    debtFreeDateWith1Percent
  };
}

/**
 * Calculate phases for comparison
 */
export function calculatePhases(
  totalDebt: number,
  monthlyPayment: number,
  habitAmount: number,
  habitCommitted: boolean,
  isCustomAmount: boolean = false
): Phase[] {
  const phases: Phase[] = [];
  
  // Current pace phase
  if (monthlyPayment > 0) {
    const currentMonths = Math.ceil(totalDebt / monthlyPayment);
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + currentMonths);
    
    phases.push({
      label: 'Current pace',
      description: 'Continue as you are',
      monthlyPayment: monthlyPayment,
      timelineMonths: currentMonths,
      debtFreeDate: currentDate
    });
  }
  
  // With habit/step-up strategy phase
  if (habitCommitted && habitAmount > 0) {
    const extraPayment = monthlyPayment + habitAmount;
    const months = extraPayment > 0 ? Math.ceil(totalDebt / extraPayment) : 999;
    const habitDate = new Date();
    habitDate.setMonth(habitDate.getMonth() + months);
    
    // Use "Step-up strategy" if custom amount, otherwise "With 1% habit"
    const label = isCustomAmount ? 'Step-up strategy' : 'With 1% habit';
    // Description will be formatted in the UI with currency symbol
    const description = `Add ${habitAmount.toFixed(0)}/month`;
    
    phases.push({
      label: label,
      description: description,
      monthlyPayment: extraPayment,
      timelineMonths: months,
      debtFreeDate: habitDate
    });
  }
  
  return phases;
}


/**
 * Calculate week number since signup
 */
export function calculateWeekNumber(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks;
}

/**
 * Calculate approximate interest paid for a single debt
 * Uses simplified amortization: assumes average balance over the payback period
 */
export function calculateInterestForDebt(
  balance: number,
  monthlyPayment: number,
  annualInterestRate: number,
  months: number
): number {
  if (annualInterestRate === 0 || months === 0 || monthlyPayment === 0) {
    return 0;
  }
  
  // Simplified calculation: average balance * monthly rate * number of months
  // This is an approximation - actual amortization would be more complex
  const monthlyRate = annualInterestRate / 100 / 12;
  
  // Approximate average balance (starts at full balance, ends at 0)
  const averageBalance = balance / 2;
  
  // Total interest ≈ average balance * monthly rate * months
  const totalInterest = averageBalance * monthlyRate * months;
  
  return Math.max(0, totalInterest);
}

/**
 * Calculate total interest paid across all debts for a given timeline
 */
export function calculateTotalInterest(
  debts: Array<{ balance: number; monthlyPayment: number; interestRate: number }>,
  months: number
): number {
  let totalInterest = 0;
  
  for (const debt of debts) {
    if (debt.monthlyPayment > 0 && debt.interestRate > 0) {
      // Calculate how long this specific debt would take to pay off
      const debtMonths = Math.min(months, Math.ceil(debt.balance / debt.monthlyPayment));
      const interest = calculateInterestForDebt(
        debt.balance,
        debt.monthlyPayment,
        debt.interestRate,
        debtMonths
      );
      totalInterest += interest;
    }
  }
  
  return totalInterest;
}

/**
 * Calculate interest savings between two strategies
 */
export interface InterestSavings {
  currentInterest: number;
  strategyInterest: number;
  interestSaved: number;
}

export function calculateInterestSavings(
  debts: Array<{ balance: number; monthlyPayment: number; interestRate: number }>,
  currentMonths: number,
  strategyMonths: number,
  strategyExtraPayment: number
): InterestSavings {
  // Calculate interest for current pace
  const currentInterest = calculateTotalInterest(debts, currentMonths);
  
  // Calculate interest for strategy (with extra payment)
  // Adjust monthly payments by adding extra payment proportionally to each debt
  const totalMonthlyPayment = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  const adjustedDebts = debts.map(debt => ({
    ...debt,
    monthlyPayment: totalMonthlyPayment > 0 
      ? debt.monthlyPayment + (strategyExtraPayment * (debt.monthlyPayment / totalMonthlyPayment))
      : debt.monthlyPayment
  }));
  
  const strategyInterest = calculateTotalInterest(adjustedDebts, strategyMonths);
  
  return {
    currentInterest,
    strategyInterest,
    interestSaved: Math.max(0, currentInterest - strategyInterest)
  };
}

/**
 * Format date nicely
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric'
  });
}

