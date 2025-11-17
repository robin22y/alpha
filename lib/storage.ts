import { GoalType, TimelineMonths } from '@/store/useUserStore';

export interface ZDebtData {
  version: string;
  exportedAt: string;
  
  // Identity
  deviceID: string;
  restoreCode: string;
  createdAt: string;
  currency: string;
  storageMode: 'local' | 'cloud';
  
  // User data
  goal: {
    type: GoalType | null;
    label: string;
  };
  
  timeline: {
    months: TimelineMonths;
    label: string;
    targetDate: string | null;
  };
  
  finances: {
    monthlyIncome: number;
    monthlySpending: number;
    monthlyLeftover: number;
    breakdown?: {
      housing: number;
      food: number;
      transport: number;
      utilities: number;
      entertainment: number;
      other: number;
    };
  };
  
  habit: {
    onePercentAmount: number;
    committed: boolean;
    customAmount?: number;
    reason?: string;
  };
  
  debts: Array<{
    id: string;
    type: string;
    name: string;
    balance: number;
    interestRate: number;
    monthlyPayment: number;
  }>;
  
  totalDebt: number;
  totalMonthlyPayment: number;
  
  // Premium
  isPremium: boolean;
  
  // Future: weekly check-ins, milestones, etc.
  weeklyCheckins?: any[];
  milestones?: any[];
}

const STORAGE_VERSION = '1.0.0';
const STORAGE_KEY = 'zdebt_data';

/**
 * Get all data from localStorage
 */
export function loadFromLocalStorage(): ZDebtData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    
    // Validate version
    if (!data.version) {
      console.warn('No version found in stored data');
      return null;
    }
    
    return data as ZDebtData;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * Save all data to localStorage
 */
export function saveToLocalStorage(data: Partial<ZDebtData>): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // Get existing data
    const existing = loadFromLocalStorage() || {} as ZDebtData;
    
    // Merge with new data
    const merged: ZDebtData = {
      ...existing,
      ...data,
      version: STORAGE_VERSION,
      exportedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

/**
 * Export data as downloadable JSON file
 */
export function exportToJSON(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data = loadFromLocalStorage();
    if (!data) {
      alert('No data to export');
      return;
    }
    
    // Create blob
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zdebt_backup_${Date.now()}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Data exported successfully');
  } catch (error) {
    console.error('Failed to export data:', error);
    alert('Failed to export data. Please try again.');
  }
}

/**
 * Import data from JSON file
 */
export function importFromJSON(file: File): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject('Not in browser environment');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as ZDebtData;
        
        // Validate data structure
        if (!data.version) {
          throw new Error('Invalid backup file: missing version');
        }
        
        if (!data.deviceID || !data.restoreCode) {
          throw new Error('Invalid backup file: missing required fields');
        }
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        
        // Also update individual localStorage keys for compatibility
        localStorage.setItem('zdebt_device_id', data.deviceID);
        localStorage.setItem('zdebt_restore_code', data.restoreCode);
        localStorage.setItem('zdebt_created_at', data.createdAt);
        localStorage.setItem('zdebt_currency', data.currency);
        localStorage.setItem('zdebt_storage_mode', data.storageMode);
        
        console.log('Data imported successfully');
        resolve(true);
      } catch (error) {
        console.error('Failed to import data:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject('Failed to read file');
    };
    
    reader.readAsText(file);
  });
}

/**
 * Delete all data from localStorage
 * DANGEROUS: Cannot be undone
 */
export function deleteAllData(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // Remove main data
    localStorage.removeItem(STORAGE_KEY);
    
    // Remove individual keys
    localStorage.removeItem('zdebt_device_id');
    localStorage.removeItem('zdebt_restore_code');
    localStorage.removeItem('zdebt_created_at');
    localStorage.removeItem('zdebt_currency');
    localStorage.removeItem('zdebt_storage_mode');
    localStorage.removeItem('zdebt_is_premium');
    
    // Clear Zustand persisted state
    localStorage.removeItem('zdebt-user-store');
    
    console.log('All data deleted');
    return true;
  } catch (error) {
    console.error('Failed to delete data:', error);
    return false;
  }
}

/**
 * Get data size in localStorage (for debugging)
 */
export function getStorageSize(): { bytes: number; kb: number } {
  if (typeof window === 'undefined') return { bytes: 0, kb: 0 };
  
  try {
    const data = localStorage.getItem(STORAGE_KEY) || '';
    const bytes = new Blob([data]).size;
    return {
      bytes,
      kb: Math.round(bytes / 1024 * 100) / 100
    };
  } catch (error) {
    console.error('Failed to get storage size:', error);
    return { bytes: 0, kb: 0 };
  }
}

/**
 * Validate restore code format
 */
export function validateBackupFile(file: File): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Check required fields
        if (!data.version) {
          resolve({ valid: false, error: 'Missing version number' });
          return;
        }
        
        if (!data.deviceID || !data.restoreCode) {
          resolve({ valid: false, error: 'Missing device ID or restore code' });
          return;
        }
        
        if (!data.createdAt) {
          resolve({ valid: false, error: 'Missing creation date' });
          return;
        }
        
        resolve({ valid: true });
      } catch (error) {
        resolve({ valid: false, error: 'Invalid JSON format' });
      }
    };
    
    reader.onerror = () => {
      resolve({ valid: false, error: 'Failed to read file' });
    };
    
    reader.readAsText(file);
  });
}

