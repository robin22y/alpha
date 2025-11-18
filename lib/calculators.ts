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
 * Phone model interface
 */
export interface PhoneModel {
  id: string;
  brand: string;
  model: string;
  price: number;
}

/**
 * Default popular phone models with prices (UK market)
 */
export const DEFAULT_PHONES: PhoneModel[] = [
  { id: 'iphone-16-pro', brand: 'iPhone', model: '16 Pro', price: 999 },
  { id: 'iphone-16', brand: 'iPhone', model: '16', price: 799 },
  { id: 'samsung-s24', brand: 'Samsung', model: 'Galaxy S24', price: 799 },
  { id: 'google-pixel-9', brand: 'Google', model: 'Pixel 9', price: 699 },
  { id: 'oneplus-12', brand: 'OnePlus', model: '12', price: 649 },
  { id: 'nothing-phone-2', brand: 'Nothing', model: 'Phone (2)', price: 579 },
  { id: 'samsung-a55', brand: 'Samsung', model: 'Galaxy A55', price: 439 },
  { id: 'google-pixel-8a', brand: 'Google', model: 'Pixel 8a', price: 499 }
];

/**
 * Get custom phones from localStorage
 */
export function getCustomPhones(): PhoneModel[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('zdebt_custom_phones');
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Save custom phones to localStorage
 */
export function saveCustomPhones(phones: PhoneModel[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('zdebt_custom_phones', JSON.stringify(phones));
  } catch (error) {
    console.error('Failed to save custom phones:', error);
  }
}

/**
 * Get all phones (custom + default)
 * Custom phones override defaults if they have the same ID
 */
export function getAllPhones(): PhoneModel[] {
  const customPhones = getCustomPhones();
  if (customPhones.length === 0) {
    return DEFAULT_PHONES;
  }
  
  // Merge: custom phones override defaults
  const phoneMap = new Map<string, PhoneModel>();
  
  // Add defaults first
  DEFAULT_PHONES.forEach(phone => {
    phoneMap.set(phone.id, phone);
  });
  
  // Override with custom phones
  customPhones.forEach(phone => {
    phoneMap.set(phone.id, phone);
  });
  
  return Array.from(phoneMap.values());
}

/**
 * Add a custom phone
 */
export function addCustomPhone(phone: Omit<PhoneModel, 'id'>): PhoneModel {
  const customPhones = getCustomPhones();
  const newPhone: PhoneModel = {
    ...phone,
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
  customPhones.push(newPhone);
  saveCustomPhones(customPhones);
  return newPhone;
}

/**
 * Update a custom phone
 */
export function updateCustomPhone(id: string, updates: Partial<PhoneModel>): boolean {
  const customPhones = getCustomPhones();
  const index = customPhones.findIndex(p => p.id === id);
  if (index === -1) return false;
  
  customPhones[index] = { ...customPhones[index], ...updates };
  saveCustomPhones(customPhones);
  return true;
}

/**
 * Delete a custom phone
 */
export function deleteCustomPhone(id: string): boolean {
  const customPhones = getCustomPhones();
  const filtered = customPhones.filter(p => p.id !== id);
  if (filtered.length === customPhones.length) return false;
  
  saveCustomPhones(filtered);
  return true;
}

/**
 * Reset to default phones
 */
export function resetToDefaultPhones(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('zdebt_custom_phones');
}

/**
 * Get popular phone models (for backward compatibility)
 * Note: This is now a function call - use getAllPhones() directly for better performance
 * @deprecated Use getAllPhones() instead
 */
export function getPopularPhones() {
  return getAllPhones();
}

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

