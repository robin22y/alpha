export type CurrencyCode = 'GBP' | 'USD' | 'EUR' | 'CAD' | 'AUD' | 'INR' | 'JPY';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
};

/**
 * Detect currency from browser locale
 * Falls back to USD if detection fails
 */
export function detectCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'USD';
  
  const locale = navigator.language || 'en-US';
  
  // Map common locales to currencies
  const localeMap: Record<string, CurrencyCode> = {
    'en-GB': 'GBP',
    'en-US': 'USD',
    'en-CA': 'CAD',
    'en-AU': 'AUD',
    'en-IN': 'INR',
    'ja-JP': 'JPY',
    'de-DE': 'EUR',
    'fr-FR': 'EUR',
    'es-ES': 'EUR',
    'it-IT': 'EUR',
    'nl-NL': 'EUR',
  };
  
  // Try exact match
  if (localeMap[locale]) {
    return localeMap[locale];
  }
  
  // Try language code only (e.g., "en" from "en-NZ")
  const lang = locale.split('-')[0];
  const countryCode = locale.split('-')[1];
  
  // Map country codes
  const countryMap: Record<string, CurrencyCode> = {
    'GB': 'GBP',
    'US': 'USD',
    'CA': 'CAD',
    'AU': 'AUD',
    'IN': 'INR',
    'JP': 'JPY',
    'DE': 'EUR',
    'FR': 'EUR',
    'ES': 'EUR',
    'IT': 'EUR',
    'NL': 'EUR',
    'BE': 'EUR',
    'AT': 'EUR',
    'IE': 'EUR',
    'PT': 'EUR',
  };
  
  if (countryCode && countryMap[countryCode]) {
    return countryMap[countryCode];
  }
  
  // Default to USD
  return 'USD';
}

/**
 * Initialize currency on first visit
 * Stores detected currency in localStorage
 */
export function initializeCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'USD';
  
  const stored = localStorage.getItem('zdebt_currency');
  
  if (stored && stored in CURRENCIES) {
    return stored as CurrencyCode;
  }
  
  const detected = detectCurrency();
  localStorage.setItem('zdebt_currency', detected);
  return detected;
}

/**
 * Get current currency info
 */
export function getCurrency(): CurrencyInfo {
  if (typeof window === 'undefined') return CURRENCIES.USD;
  
  const code = (localStorage.getItem('zdebt_currency') as CurrencyCode) || 'USD';
  return CURRENCIES[code];
}

/**
 * Set currency manually (user override)
 */
export function setCurrency(code: CurrencyCode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('zdebt_currency', code);
}

/**
 * Format amount with current currency
 * Examples:
 * - formatCurrency(1234.56, 'GBP') => "£1,234.56"
 * - formatCurrency(1234.56, 'USD') => "$1,234.56"
 * - formatCurrency(1234, 'JPY') => "¥1,234" (no decimals)
 */
export function formatCurrency(amount: number, currencyCode?: CurrencyCode): string {
  const currency = currencyCode ? CURRENCIES[currencyCode] : getCurrency();
  
  const formatted = new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.code === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency.code === 'JPY' ? 0 : 2,
  }).format(amount);
  
  return formatted;
}

/**
 * Format number with locale-specific thousands separator
 * Examples:
 * - formatNumber(1234567) => "1,234,567" (US)
 * - formatNumber(1234567) => "1.234.567" (DE)
 */
export function formatNumber(num: number): string {
  const currency = getCurrency();
  return new Intl.NumberFormat(currency.locale).format(num);
}

