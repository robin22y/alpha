/**
 * Utility functions to convert between store DebtItem and debtEngine DebtInput
 */
import { DebtItem } from '@/store/useUserStore';
import { DebtInput, DebtComputed, computeAllDebts, type SimpleDebtInput, type MortgageDebtInput } from './debtEngine';

/**
 * Convert store DebtItem to debtEngine DebtInput
 */
export function convertDebtItemToInput(debt: DebtItem): DebtInput {
  if (debt.debtType === 'mortgage') {
    // Mortgage: use principal/loanAmount, termYears/mortgageTermYears
    const principal = debt.loanAmount || debt.balance || 0;
    const termYears = debt.mortgageTermYears || 30;
    
    return {
      id: debt.id,
      name: debt.name,
      debtType: 'mortgage',
      principal,
      interestRate: debt.interestRate || 0,
      termYears,
    } as MortgageDebtInput;
  } else {
    // Simple debts: credit cards, loans
    const balance = debt.balance || 0;
    
    return {
      id: debt.id,
      name: debt.name,
      debtType: debt.debtType || 'credit_card',
      balance,
      interestRate: debt.interestRate || 0,
      monthlyPayment: debt.monthlyPayment || 0,
    } as SimpleDebtInput;
  }
}

/**
 * Convert array of DebtItems to computed debts
 */
export function computeDebtsFromStore(debts: DebtItem[]): DebtComputed[] {
  const inputs = debts.map(convertDebtItemToInput);
  return computeAllDebts(inputs);
}

/**
 * Calculate totals from computed debts
 */
export function calculateDebtTotals(computedDebts: DebtComputed[]): {
  totalDebt: number;
  totalMonthlyPayment: number;
  totalInterest: number;
} {
  const totalDebt = computedDebts.reduce((sum, d) => {
    if (d.debtType === 'mortgage') {
      return sum + d.principal;
    } else {
      return sum + d.balance;
    }
  }, 0);

  const totalMonthlyPayment = computedDebts.reduce((sum, d) => sum + d.monthlyPayment, 0);

  const totalInterest = computedDebts.reduce((sum, d) => {
    if (d.totalInterest === Infinity) return sum;
    return sum + d.totalInterest;
  }, 0);

  return {
    totalDebt,
    totalMonthlyPayment,
    totalInterest,
  };
}

