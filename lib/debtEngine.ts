export type DebtType =
  | "credit_card"
  | "personal_loan"
  | "car_loan"
  | "student_loan"
  | "mortgage";

export interface BaseDebtInput {
  id: string;           // stable key for React & storage
  name: string;
  debtType: DebtType;
}

/**
 * Generic "simple" debt with user-provided payment.
 * Use for legacy loans where we only know:
 *   balance, interest, monthlyPayment
 */
export interface SimpleDebtInput extends BaseDebtInput {
  debtType: Exclude<DebtType, "mortgage">;
  balance: number;          // current balance
  interestRate: number;     // APR, % per year
  monthlyPayment: number;   // user-entered
}

/**
 * Mortgage is treated as a standard amortising loan.
 * User sets principal, APR, total term in years.
 * We calculate the mathematically correct payment.
 */
export interface MortgageDebtInput extends BaseDebtInput {
  debtType: "mortgage";
  principal: number;        // loan amount (not house price)
  interestRate: number;     // APR, % per year
  termYears: number;        // total term, e.g. 30
  // optional override if the bank payment is different
  customMonthlyPayment?: number;
}

export type DebtInput = SimpleDebtInput | MortgageDebtInput;

export interface DebtComputed {
  id: string;                   // Explicitly include all BaseDebtInput properties
  name: string;
  debtType: DebtType;
  interestRate: number;
  balance?: number;             // For simple debts (credit cards, loans)
  principal?: number;           // For mortgages
  termYears?: number;           // For mortgages
  customMonthlyPayment?: number; // For mortgages (optional override)
  monthlyPayment: number;
  monthsToPayoff: number;      // Infinity if never repays at that payment
  totalPaid: number;           // principal + interest
  totalInterest: number;
}

/**
 * Amortised loan payment.
 * P: principal, annualRate: % per year, years: total term
 */
export function calcAmortisedPayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  const n = years * 12;
  if (n <= 0 || principal <= 0) return 0;

  const r = annualRate / 100 / 12;
  if (r === 0) return +(principal / n).toFixed(2);

  const numerator = r * Math.pow(1 + r, n);
  const denominator = Math.pow(1 + r, n) - 1;
  const m = principal * (numerator / denominator);

  return +m.toFixed(2);
}

/**
 * Credit-card style payoff: fixed payment, interest applied monthly.
 * Returns months required, or Infinity if payment <= monthly interest.
 */
export function calcCreditCardMonths(
  balance: number,
  monthlyPayment: number,
  annualRate: number
): number {
  const r = annualRate / 100 / 12;
  if (balance <= 0) return 0;

  // payment not even covering interest → never pays off
  if (r > 0 && monthlyPayment <= balance * r) return Infinity;

  if (r === 0) {
    return Math.ceil(balance / monthlyPayment);
  }

  // standard revolving credit payoff formula
  const months =
    (-1 / Math.log(1 + r)) *
    Math.log(1 - (balance * r) / monthlyPayment);

  return Math.ceil(months);
}

/**
 * Simple amortising loan months at given payment.
 * (Used for personal/car/student loans when user gives payment.)
 */
export function calcAmortisedMonths(
  principal: number,
  monthlyPayment: number,
  annualRate: number
): number {
  const r = annualRate / 100 / 12;
  if (principal <= 0) return 0;

  if (r === 0) {
    return Math.ceil(principal / monthlyPayment);
  }

  if (monthlyPayment <= principal * r) {
    return Infinity;
  }

  const months =
    Math.log(monthlyPayment / (monthlyPayment - principal * r)) /
    Math.log(1 + r);

  return Math.ceil(months);
}

/**
 * Given a single debt input, return a fully computed debt object.
 * This does NOT do snowball/avalanche – that can sit on top of this.
 */
export function computeDebt(d: DebtInput): DebtComputed {
  if (d.debtType === "mortgage") {
    const principal = Math.max(0, d.principal);
    const termYears = Math.max(0, d.termYears);
    const payment =
      d.customMonthlyPayment && d.customMonthlyPayment > 0
        ? d.customMonthlyPayment
        : calcAmortisedPayment(principal, d.interestRate, termYears);

    const monthsToPayoff = termYears * 12;
    const totalPaid = +(payment * monthsToPayoff).toFixed(2);
    const totalInterest = +(totalPaid - principal).toFixed(2);

    return {
      ...d,
      monthlyPayment: payment,
      monthsToPayoff,
      totalPaid,
      totalInterest,
    };
  }

  // Simple / legacy debts (including credit cards)
  const balance = Math.max(0, d.balance);
  const payment = Math.max(0, d.monthlyPayment);
  const rate = Math.max(0, d.interestRate);

  let monthsToPayoff: number;

  if (d.debtType === "credit_card") {
    monthsToPayoff = calcCreditCardMonths(balance, payment, rate);
  } else {
    // personal_loan, car_loan, student_loan → amortised
    monthsToPayoff = calcAmortisedMonths(balance, payment, rate);
  }

  const totalPaid =
    monthsToPayoff === Infinity
      ? Infinity
      : +(monthsToPayoff * payment).toFixed(2);
  const totalInterest =
    monthsToPayoff === Infinity
      ? Infinity
      : +(totalPaid - balance).toFixed(2);

  return {
    ...d,
    monthlyPayment: payment,
    monthsToPayoff,
    totalPaid,
    totalInterest,
  };
}

/**
 * Compute all debts in one go.
 * You can plug this into your snowball/avalanche engine later.
 */
export function computeAllDebts(debts: DebtInput[]): DebtComputed[] {
  return debts.map(computeDebt);
}

