/**
 * Safe Supabase Client Setup
 * Prevents Netlify & Next.js prerender crashes
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

/**
 * Lazily create the Supabase client ONLY when actually needed.
 * Never during build or prerender import time.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing environment variables. Returning null client.');
    return null;
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!url && !!key;
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
  device_transfer_history?: any;
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
