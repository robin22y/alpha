import { initializeCurrency } from './currency';

/**
 * Generate device ID for internal tracking
 * Format: timestamp-random (e.g., "1700140800000-a3f9k2x")
 * User never sees this - internal use only
 */
export function generateDeviceID(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

/**
 * Generate alphanumeric restore code
 * Format: 4 letters + 4 numbers (e.g., "HFKR7649")
 * Excludes confusing characters: I,O,S,Z (letters) and 0,1,2 (numbers)
 * 
 * Total combinations: 22^4 * 7^4 = 562,308,656 codes
 */
export function generateRestoreCode(): string {
  // Removed: I, O, S, Z (confusing with 1, 0, 5, 2)
  const letters = 'ABCDEFGHJKLMNPQRTUVWXY';
  
  // Removed: 0, 1, 2 (confusing with O, I, Z)
  const numbers = '3456789';
  
  let code = '';
  
  // 4 random letters
  for (let i = 0; i < 4; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // 4 random numbers
  for (let i = 0; i < 4; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return code; // e.g., "HFKR7649"
}

/**
 * Format restore code with dash for display
 * Input: "HFKR7649"
 * Output: "HFKR-7649"
 */
export function formatRestoreCode(code: string): string {
  if (code.length !== 8) return code;
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

/**
 * Validate restore code format
 * Must be: 4 uppercase letters + 4 numbers
 */
export function validateRestoreCode(code: string): boolean {
  const cleaned = code.replace('-', '').toUpperCase();
  const pattern = /^[A-Z]{4}[0-9]{4}$/;
  return pattern.test(cleaned);
}

/**
 * Initialize new user on first visit
 * Creates device ID and restore code, stores in localStorage
 * Also initializes currency
 * Returns all for immediate use
 */
export function initializeUser(): { 
  deviceID: string; 
  restoreCode: string;
  currency: string;
} {
  if (typeof window === 'undefined') {
    return { deviceID: '', restoreCode: '', currency: 'USD' };
  }
  
  // Check if already initialized
  const existing = localStorage.getItem('zdebt_device_id');
  if (existing) {
    return {
      deviceID: existing,
      restoreCode: localStorage.getItem('zdebt_restore_code') || '',
      currency: localStorage.getItem('zdebt_currency') || 'USD'
    };
  }
  
  const deviceID = generateDeviceID();
  const restoreCode = generateRestoreCode();
  
  // Initialize currency detection
  const currency = initializeCurrency();
  
  localStorage.setItem('zdebt_device_id', deviceID);
  localStorage.setItem('zdebt_restore_code', restoreCode);
  localStorage.setItem('zdebt_created_at', new Date().toISOString());
  localStorage.setItem('zdebt_storage_mode', 'local'); // 'local' or 'cloud'
  
  return { deviceID, restoreCode, currency };
}

/**
 * Get current user identifiers
 */
export function getUserIdentifiers(): { 
  deviceID: string | null; 
  restoreCode: string | null;
  createdAt: string | null;
  storageMode: 'local' | 'cloud';
  currency: string | null;
} {
  if (typeof window === 'undefined') {
    return {
      deviceID: null,
      restoreCode: null,
      createdAt: null,
      storageMode: 'local',
      currency: null
    };
  }
  
  return {
    deviceID: localStorage.getItem('zdebt_device_id'),
    restoreCode: localStorage.getItem('zdebt_restore_code'),
    createdAt: localStorage.getItem('zdebt_created_at'),
    storageMode: (localStorage.getItem('zdebt_storage_mode') as 'local' | 'cloud') || 'local',
    currency: localStorage.getItem('zdebt_currency')
  };
}

