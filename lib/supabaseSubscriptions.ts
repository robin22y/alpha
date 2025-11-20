/**
 * Subscription Management with Supabase
 * Syncs PRO subscriptions to Supabase for admin management
 */

import { getSupabaseClient, isSupabaseConfigured, SubscriptionRecord, DeviceTransferRecord } from './supabase';
import { SubscriptionStatus, DeviceTransferRequest } from './subscription';

/**
 * Sync subscription to Supabase
 */
export async function syncSubscriptionToSupabase(
  subscription: SubscriptionStatus
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true }; // Fallback to localStorage only
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    const record: Partial<SubscriptionRecord> = {
      device_id: subscription.deviceID,
      restore_code: subscription.restoreCode,
      is_pro: subscription.isPro,
      pro_since: subscription.proSince,
      pro_expires_at: subscription.proExpiresAt,
      last_device_change: subscription.lastDeviceChange,
      device_transfer_history: subscription.deviceTransferHistory,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('subscriptions')
      .upsert(record, {
        onConflict: 'device_id'
      });

    if (error) {
      console.error('Failed to sync subscription:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error syncing subscription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get subscription from Supabase
 */
export async function getSubscriptionFromSupabase(
  deviceID: string
): Promise<SubscriptionStatus | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('device_id', deviceID)
      .single();

    if (error || !data) return null;

    const record = data as SubscriptionRecord;
    return {
      deviceID: record.device_id,
      restoreCode: record.restore_code,
      isPro: record.is_pro,
      proSince: record.pro_since,
      proExpiresAt: record.pro_expires_at,
      lastDeviceChange: record.last_device_change,
      deviceTransferHistory: record.device_transfer_history || []
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
}

/**
 * Get subscription by restore code from Supabase
 */
export async function getSubscriptionByRestoreCodeFromSupabase(
  restoreCode: string
): Promise<SubscriptionStatus | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const normalizedCode = restoreCode.replace('-', '').toUpperCase();
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .ilike('restore_code', normalizedCode)
      .single();

    if (error || !data) return null;

    const record = data as SubscriptionRecord;
    return {
      deviceID: record.device_id,
      restoreCode: record.restore_code,
      isPro: record.is_pro,
      proSince: record.pro_since,
      proExpiresAt: record.pro_expires_at,
      lastDeviceChange: record.last_device_change,
      deviceTransferHistory: record.device_transfer_history || []
    };
  } catch (error) {
    console.error('Error getting subscription by restore code:', error);
    return null;
  }
}

/**
 * Get all subscriptions from Supabase (admin only)
 */
export async function getAllSubscriptionsFromSupabase(): Promise<SubscriptionStatus[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((record: SubscriptionRecord) => ({
      deviceID: record.device_id,
      restoreCode: record.restore_code,
      isPro: record.is_pro,
      proSince: record.pro_since,
      proExpiresAt: record.pro_expires_at,
      lastDeviceChange: record.last_device_change,
      deviceTransferHistory: record.device_transfer_history || []
    }));
  } catch (error) {
    console.error('Error getting all subscriptions:', error);
    return [];
  }
}

/**
 * Sync device transfer request to Supabase
 */
export async function syncTransferRequestToSupabase(
  request: DeviceTransferRequest
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true }; // Fallback to localStorage only
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    const record: Partial<DeviceTransferRecord> = {
      restore_code: request.restoreCode,
      old_device_id: request.oldDeviceID,
      new_device_id: request.newDeviceID,
      requested_at: request.requestedAt,
      status: request.status,
      approved_at: request.approvedAt,
      approved_by: request.approvedBy,
      rejection_reason: request.rejectionReason
    };

    const { error } = await supabase
      .from('device_transfers')
      .upsert(record, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Failed to sync transfer request:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error syncing transfer request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all device transfer requests from Supabase
 */
export async function getAllTransferRequestsFromSupabase(): Promise<DeviceTransferRequest[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('device_transfers')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error || !data) return [];

    return data.map((record: DeviceTransferRecord) => ({
      id: record.id?.toString() || '',
      restoreCode: record.restore_code,
      oldDeviceID: record.old_device_id,
      newDeviceID: record.new_device_id,
      requestedAt: record.requested_at,
      status: record.status,
      approvedAt: record.approved_at,
      approvedBy: record.approved_by,
      rejectionReason: record.rejection_reason
    }));
  } catch (error) {
    console.error('Error getting transfer requests:', error);
    return [];
  }
}

