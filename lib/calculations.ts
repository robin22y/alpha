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
 * Calculate debt-free timeline using proper amortization
 * Uses debt engine to account for interest rates properly
 */
export function calculateDebtProjection(
  computedDebts: Array<{
    debtType: string;
    balance?: number;
    principal?: number;
    monthlyPayment: number;
    interestRate: number;
    monthsToPayoff: number;
  }>,
  onePercentAmount: number = 0,
  habitCommitted: boolean = false
): DebtProjection {
  // Current timeline: use max months across all debts (when all are paid off)
  const currentTimeline = computedDebts.length > 0
    ? Math.max(...computedDebts.map(d => d.monthsToPayoff === Infinity ? 999 : d.monthsToPayoff))
    : 0;
  
  // Timeline with 1% extra payment: recalculate with extra payment applied proportionally
  let with1Percent = currentTimeline;
  
  if (habitCommitted && onePercentAmount > 0 && computedDebts.length > 0) {
    // Calculate total monthly payment
    const totalMonthlyPayment = computedDebts.reduce((sum, d) => sum + d.monthlyPayment, 0);
    
    // Apply extra payment proportionally to each debt and recalculate payoff
    const adjustedMonths = computedDebts.map(debt => {
      if (debt.monthsToPayoff === Infinity) return 999;
      
      // Calculate proportional extra payment for this debt
      const extraForThisDebt = totalMonthlyPayment > 0
        ? (onePercentAmount * debt.monthlyPayment) / totalMonthlyPayment
        : 0;
      
      const adjustedPayment = debt.monthlyPayment + extraForThisDebt;
      
      // Recalculate months to payoff with adjusted payment
      if (debt.debtType === 'mortgage') {
        // For mortgage, use amortization formula
        const principal = debt.principal || 0;
        const r = debt.interestRate / 100 / 12;
        if (r === 0) {
          return Math.ceil(principal / adjustedPayment);
        }
        if (adjustedPayment <= principal * r) {
          return 999; // Can't pay off
        }
        const months = Math.log(adjustedPayment / (adjustedPayment - principal * r)) / Math.log(1 + r);
        return Math.ceil(months);
      } else if (debt.debtType === 'credit_card') {
        // Credit card: revolving credit formula
        const balance = debt.balance || 0;
        const r = debt.interestRate / 100 / 12;
        if (r === 0) {
          return Math.ceil(balance / adjustedPayment);
        }
        if (adjustedPayment <= balance * r) {
          return 999;
        }
        const months = (-1 / Math.log(1 + r)) * Math.log(1 - (balance * r) / adjustedPayment);
        return Math.ceil(months);
      } else {
        // Amortized loan
        const balance = debt.balance || 0;
        const r = debt.interestRate / 100 / 12;
        if (r === 0) {
          return Math.ceil(balance / adjustedPayment);
        }
        if (adjustedPayment <= balance * r) {
          return 999;
        }
        const months = Math.log(adjustedPayment / (adjustedPayment - balance * r)) / Math.log(1 + r);
        return Math.ceil(months);
      }
    });
    
    with1Percent = Math.max(...adjustedMonths);
  }
  
  const timeSaved = Math.max(0, currentTimeline - with1Percent);
  
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
 * Calculate phases for comparison using proper amortization
 */
export function calculatePhases(
  computedDebts: Array<{
    debtType: string;
    balance?: number;
    principal?: number;
    monthlyPayment: number;
    interestRate: number;
    monthsToPayoff: number;
  }>,
  habitAmount: number,
  habitCommitted: boolean,
  isCustomAmount: boolean = false
): Phase[] {
  const phases: Phase[] = [];
  
  if (computedDebts.length === 0) return phases;
  
  // Current pace phase: use max months across all debts
  const totalMonthlyPayment = computedDebts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  const currentMonths = Math.max(...computedDebts.map(d => d.monthsToPayoff === Infinity ? 999 : d.monthsToPayoff));
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() + currentMonths);
  
  phases.push({
    label: 'Current pace',
    description: 'Continue as you are',
    monthlyPayment: totalMonthlyPayment,
    timelineMonths: currentMonths,
    debtFreeDate: currentDate
  });
  
  // With habit/step-up strategy phase
  if (habitCommitted && habitAmount > 0) {
    // Apply extra payment proportionally and recalculate
    const adjustedMonths = computedDebts.map(debt => {
      if (debt.monthsToPayoff === Infinity) return 999;
      
      const extraForThisDebt = totalMonthlyPayment > 0
        ? (habitAmount * debt.monthlyPayment) / totalMonthlyPayment
        : 0;
      
      const adjustedPayment = debt.monthlyPayment + extraForThisDebt;
      
      // Recalculate with adjusted payment
      if (debt.debtType === 'mortgage') {
        const principal = debt.principal || 0;
        const r = debt.interestRate / 100 / 12;
        if (r === 0) {
          return Math.ceil(principal / adjustedPayment);
        }
        if (adjustedPayment <= principal * r) {
          return 999;
        }
        const months = Math.log(adjustedPayment / (adjustedPayment - principal * r)) / Math.log(1 + r);
        return Math.ceil(months);
      } else if (debt.debtType === 'credit_card') {
        const balance = debt.balance || 0;
        const r = debt.interestRate / 100 / 12;
        if (r === 0) {
          return Math.ceil(balance / adjustedPayment);
        }
        if (adjustedPayment <= balance * r) {
          return 999;
        }
        const months = (-1 / Math.log(1 + r)) * Math.log(1 - (balance * r) / adjustedPayment);
        return Math.ceil(months);
      } else {
        const balance = debt.balance || 0;
        const r = debt.interestRate / 100 / 12;
        if (r === 0) {
          return Math.ceil(balance / adjustedPayment);
        }
        if (adjustedPayment <= balance * r) {
          return 999;
        }
        const months = Math.log(adjustedPayment / (adjustedPayment - balance * r)) / Math.log(1 + r);
        return Math.ceil(months);
      }
    });
    
    const months = Math.max(...adjustedMonths);
    const habitDate = new Date();
    habitDate.setMonth(habitDate.getMonth() + months);
    
    // Use "Step-up strategy" if custom amount, otherwise "With 1% habit"
    const label = isCustomAmount ? 'Step-up strategy' : 'With 1% habit';
    const description = `Add ${habitAmount.toFixed(0)}/month`;
    
    phases.push({
      label: label,
      description: description,
      monthlyPayment: totalMonthlyPayment + habitAmount,
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
 * Uses computed debts with proper amortization
 */
export function calculateTotalInterest(
  computedDebts: Array<{
    debtType: string;
    balance?: number;
    principal?: number;
    monthlyPayment: number;
    interestRate: number;
    monthsToPayoff: number;
    totalInterest?: number;
  }>,
  months: number
): number {
  let totalInterest = 0;
  
  for (const debt of computedDebts) {
    if (debt.monthsToPayoff === Infinity) continue;
    
    // Use the actual months to payoff (capped at the given timeline)
    const actualMonths = Math.min(debt.monthsToPayoff, months);
    
    // If we have totalInterest from the debt engine, use it proportionally
    if (debt.totalInterest !== undefined && debt.totalInterest !== Infinity) {
      // Calculate proportional interest based on actual months vs full payoff
      const proportionalInterest = actualMonths < debt.monthsToPayoff
        ? (debt.totalInterest * actualMonths) / debt.monthsToPayoff
        : debt.totalInterest;
      totalInterest += proportionalInterest;
    } else if (debt.monthlyPayment > 0 && debt.interestRate > 0) {
      // Fallback: calculate interest for the actual months
      const balance = debt.debtType === 'mortgage' ? (debt.principal || 0) : (debt.balance || 0);
      const interest = calculateInterestForDebt(
        balance,
        debt.monthlyPayment,
        debt.interestRate,
        actualMonths
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
  computedDebts: Array<{
    debtType: string;
    balance?: number;
    principal?: number;
    monthlyPayment: number;
    interestRate: number;
    monthsToPayoff: number;
    totalInterest?: number;
  }>,
  currentMonths: number,
  strategyMonths: number,
  strategyExtraPayment: number
): InterestSavings {
  // Calculate interest for current pace
  const currentInterest = calculateTotalInterest(computedDebts, currentMonths);
  
  // Calculate interest for strategy (with extra payment)
  // Adjust monthly payments by adding extra payment proportionally to each debt
  const totalMonthlyPayment = computedDebts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  
  // Recalculate debts with adjusted payments
  const adjustedDebts = computedDebts.map(debt => {
    const extraForThisDebt = totalMonthlyPayment > 0 
      ? (strategyExtraPayment * debt.monthlyPayment) / totalMonthlyPayment
      : 0;
    
    const adjustedPayment = debt.monthlyPayment + extraForThisDebt;
    
    // Recalculate months to payoff with adjusted payment
    let adjustedMonths = debt.monthsToPayoff;
    if (debt.debtType === 'mortgage') {
      const principal = debt.principal || 0;
      const r = debt.interestRate / 100 / 12;
      if (r > 0 && adjustedPayment > principal * r) {
        adjustedMonths = Math.ceil(Math.log(adjustedPayment / (adjustedPayment - principal * r)) / Math.log(1 + r));
      }
    } else if (debt.debtType === 'credit_card') {
      const balance = debt.balance || 0;
      const r = debt.interestRate / 100 / 12;
      if (r > 0 && adjustedPayment > balance * r) {
        adjustedMonths = Math.ceil((-1 / Math.log(1 + r)) * Math.log(1 - (balance * r) / adjustedPayment));
      }
    } else {
      const balance = debt.balance || 0;
      const r = debt.interestRate / 100 / 12;
      if (r > 0 && adjustedPayment > balance * r) {
        adjustedMonths = Math.ceil(Math.log(adjustedPayment / (adjustedPayment - balance * r)) / Math.log(1 + r));
      }
    }
    
    // Calculate adjusted total interest
    const adjustedTotalPaid = adjustedMonths === Infinity ? Infinity : adjustedMonths * adjustedPayment;
    const adjustedTotalInterest = adjustedTotalPaid === Infinity 
      ? Infinity 
      : adjustedTotalPaid - (debt.debtType === 'mortgage' ? (debt.principal || 0) : (debt.balance || 0));
    
    return {
      ...debt,
      monthlyPayment: adjustedPayment,
      monthsToPayoff: adjustedMonths,
      totalInterest: adjustedTotalInterest === Infinity ? undefined : adjustedTotalInterest
    };
  });
  
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

