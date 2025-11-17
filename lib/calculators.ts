export interface SavingsCalculation {
  monthsToSave: number;
  totalSaved: number;
  targetDate: Date;
}

export interface CreditCalculation {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  monthsToPay: number;
  payoffDate: Date;
}

export interface Comparison {
  savings: SavingsCalculation;
  credit: CreditCalculation;
  timeDifference: number; // months
  costDifference: number; // money
  winner: 'save' | 'credit';
}

/**
 * Calculate how long to save for a purchase
 */
export function calculateSavings(
  targetAmount: number,
  monthlySavings: number
): SavingsCalculation {
  const monthsToSave = Math.ceil(targetAmount / monthlySavings);
  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + monthsToSave);
  
  return {
    monthsToSave,
    totalSaved: targetAmount,
    targetDate
  };
}

/**
 * Calculate credit cost
 * Using simple payment calculation (not compound interest)
 */
export function calculateCredit(
  amount: number,
  annualInterestRate: number,
  monthlyPayment: number
): CreditCalculation {
  if (monthlyPayment <= 0) {
    return {
      monthlyPayment: 0,
      totalInterest: 0,
      totalPaid: amount,
      monthsToPay: 0,
      payoffDate: new Date()
    };
  }

  const monthlyRate = annualInterestRate / 100 / 12;
  
  // Calculate months to pay off
  let balance = amount;
  let months = 0;
  let totalPaid = 0;
  
  // Cap at 120 months (10 years) for display
  while (balance > 0 && months < 120) {
    const interestCharge = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestCharge;
    
    if (principalPayment <= 0) {
      // Payment too small to cover interest
      months = 999;
      totalPaid = amount * 10; // Arbitrary high number
      break;
    }
    
    balance -= principalPayment;
    totalPaid += monthlyPayment;
    months++;
  }
  
  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + months);
  
  return {
    monthlyPayment,
    totalInterest: totalPaid - amount,
    totalPaid,
    monthsToPay: months,
    payoffDate
  };
}

/**
 * Compare saving vs credit
 */
export function compareOptions(
  price: number,
  monthlySavings: number,
  annualInterestRate: number,
  monthlyPayment: number
): Comparison {
  const savings = calculateSavings(price, monthlySavings);
  const credit = calculateCredit(price, annualInterestRate, monthlyPayment);
  
  const timeDifference = savings.monthsToSave - credit.monthsToPay;
  const costDifference = credit.totalPaid - price;
  
  // Determine winner based on total cost and reasonable timeline
  // If credit costs significantly more OR takes unreasonably long, saving wins
  const winner = (costDifference > price * 0.1 || credit.monthsToPay > 24) 
    ? 'save' 
    : 'credit';
  
  return {
    savings,
    credit,
    timeDifference,
    costDifference,
    winner
  };
}

/**
 * Calculate minimum payment for credit card
 * Typically 2-3% of balance or £5, whichever is greater
 */
export function calculateMinimumPayment(balance: number): number {
  const percentage = balance * 0.025; // 2.5%
  const minimum = 5; // £5 minimum
  return Math.max(percentage, minimum);
}

/**
 * Format months as years and months
 */
export function formatMonthsAsYearsMonths(months: number): string {
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  
  return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}

/**
 * Get popular phone models with prices (UK market)
 */
export const POPULAR_PHONES = [
  { brand: 'iPhone', model: '16 Pro', price: 999 },
  { brand: 'iPhone', model: '16', price: 799 },
  { brand: 'Samsung', model: 'Galaxy S24', price: 799 },
  { brand: 'Google', model: 'Pixel 9', price: 699 },
  { brand: 'OnePlus', model: '12', price: 649 },
  { brand: 'Nothing', model: 'Phone (2)', price: 579 },
  { brand: 'Samsung', model: 'Galaxy A55', price: 439 },
  { brand: 'Google', model: 'Pixel 8a', price: 499 }
];

/**
 * Typical credit card APRs in UK
 */
export const TYPICAL_CREDIT_RATES = {
  excellent: 18.9,
  good: 21.9,
  fair: 24.9,
  poor: 29.9,
  storeCard: 39.9
};

