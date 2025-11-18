/**
 * Supabase Client Setup
 * Used for device ID tracking, subscription management, and optional cloud sync
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client (only if credentials are provided)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return !!supabase && !!supabaseUrl && !!supabaseAnonKey;
}

/**
 * Database Types
 */
export interface DeviceRecord {
  id?: number;
  device_id: string;
  restore_code: string;
  created_at: string;
  last_seen_at?: string;
  storage_mode: 'local' | 'cloud';
  currency?: string;
}

export interface SubscriptionRecord {
  id?: number;
  device_id: string;
  restore_code: string;
  is_pro: boolean;
  pro_since?: string;
  pro_expires_at?: string;
  last_device_change?: string;
  device_transfer_history?: any; // JSON array
  created_at?: string;
  updated_at?: string;
}

export interface DeviceTransferRecord {
  id?: number;
  restore_code: string;
  old_device_id: string;
  new_device_id: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
}

