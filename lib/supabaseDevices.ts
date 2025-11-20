/**
 * Device Management with Supabase
 * Syncs device IDs and restore codes to Supabase for admin management
 */

import { getSupabaseClient, isSupabaseConfigured, DeviceRecord } from './supabase';
import { syncSubscriptionToSupabase } from './supabaseSubscriptions';

/**
 * Register a new device in Supabase
 */
export async function registerDevice(
  deviceID: string,
  restoreCode: string,
  currency: string = 'USD'
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    // Fallback: just return success, data stays in localStorage
    return { success: true };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    const { error } = await supabase
      .from('devices')
      .upsert({
        device_id: deviceID,
        restore_code: restoreCode,
        created_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        storage_mode: 'local',
        currency
      }, {
        onConflict: 'device_id'
      });

    if (error) {
      console.error('Failed to register device:', error);
      return { success: false, error: error.message };
    }

    // Also create a subscription record (with is_pro = false)
    // This allows admin to grant PRO by restore code even if user hasn't been granted PRO yet
    try {
      await syncSubscriptionToSupabase({
        deviceID,
        restoreCode,
        isPro: false,
        deviceTransferHistory: []
      });
    } catch (subError) {
      // Non-critical: device is registered, subscription creation can fail silently
      console.warn('Failed to create initial subscription record:', subError);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error registering device:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update device last seen timestamp
 */
export async function updateDeviceLastSeen(deviceID: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await supabase
      .from('devices')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('device_id', deviceID);
  } catch (error) {
    console.error('Error updating device last seen:', error);
  }
}

/**
 * Get device by restore code
 */
export async function getDeviceByRestoreCode(
  restoreCode: string
): Promise<DeviceRecord | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const normalizedCode = restoreCode.replace('-', '').toUpperCase();
    
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .ilike('restore_code', normalizedCode)
      .single();

    if (error || !data) return null;
    return data as DeviceRecord;
  } catch (error) {
    console.error('Error getting device:', error);
    return null;
  }
}

/**
 * Get device by device ID
 */
export async function getDeviceByID(deviceID: string): Promise<DeviceRecord | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('device_id', deviceID)
      .single();

    if (error || !data) return null;
    return data as DeviceRecord;
  } catch (error) {
    console.error('Error getting device:', error);
    return null;
  }
}

