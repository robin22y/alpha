/**
 * Income Sources Management
 * Stores income sources in localStorage as array of { amount, type, name }
 */

export type IncomeSourceType = 'work' | 'assets' | 'other';

export interface IncomeSource {
  amount: number;
  type: IncomeSourceType;
  name: string;
}

const STORAGE_KEY = 'zdebt_income_sources';

/**
 * Get all income sources from localStorage
 */
export function getIncomeSources(): IncomeSource[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    
    return parsed.filter((item: any) => 
      item && 
      typeof item.amount === 'number' && 
      item.amount >= 0 &&
      ['work', 'assets', 'other'].includes(item.type) &&
      typeof item.name === 'string'
    );
  } catch {
    return [];
  }
}

/**
 * Save income sources to localStorage
 */
export function saveIncomeSources(sources: IncomeSource[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
  } catch (error) {
    console.error('Failed to save income sources:', error);
  }
}

/**
 * Add a new income source
 */
export function addIncomeSource(source: IncomeSource): void {
  const sources = getIncomeSources();
  sources.push(source);
  saveIncomeSources(sources);
}

/**
 * Update an existing income source by index
 */
export function updateIncomeSource(index: number, source: IncomeSource): void {
  const sources = getIncomeSources();
  if (index >= 0 && index < sources.length) {
    sources[index] = source;
    saveIncomeSources(sources);
  }
}

/**
 * Remove an income source by index
 */
export function removeIncomeSource(index: number): void {
  const sources = getIncomeSources();
  if (index >= 0 && index < sources.length) {
    sources.splice(index, 1);
    saveIncomeSources(sources);
  }
}

/**
 * Calculate totals by type
 */
export function calculateIncomeTotals(sources: IncomeSource[]): {
  totalWork: number;
  totalAssets: number;
  totalOther: number;
  total: number;
} {
  const totals = {
    totalWork: 0,
    totalAssets: 0,
    totalOther: 0,
    total: 0
  };
  
  for (const source of sources) {
    totals.total += source.amount;
    if (source.type === 'work') {
      totals.totalWork += source.amount;
    } else if (source.type === 'assets') {
      totals.totalAssets += source.amount;
    } else if (source.type === 'other') {
      totals.totalOther += source.amount;
    }
  }
  
  return totals;
}

/**
 * Initialize default income source from onboarding monthly income
 * Only called if no income sources exist
 */
export function initializeDefaultIncome(monthlyIncome: number): void {
  const existing = getIncomeSources();
  if (existing.length === 0 && monthlyIncome > 0) {
    addIncomeSource({
      amount: monthlyIncome,
      type: 'work',
      name: 'Main income'
    });
  }
}

