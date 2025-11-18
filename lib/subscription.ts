/**
 * Subscription and Device Transfer Management
 * Syncs with Supabase when available, falls back to localStorage
 */

import {
  syncSubscriptionToSupabase,
  getSubscriptionFromSupabase,
  getSubscriptionByRestoreCodeFromSupabase,
  getAllSubscriptionsFromSupabase,
  syncTransferRequestToSupabase,
  getAllTransferRequestsFromSupabase
} from './supabaseSubscriptions';
import { isSupabaseConfigured } from './supabase';
import { getDeviceByRestoreCode } from './supabaseDevices';

export interface SubscriptionStatus {
  deviceID: string;
  restoreCode: string;
  isPro: boolean;
  proSince?: string; // ISO date
  proExpiresAt?: string; // ISO date (if applicable)
  lastDeviceChange?: string; // ISO date of last device transfer
  deviceTransferHistory: Array<{
    fromDeviceID: string;
    toDeviceID: string;
    date: string;
    approvedBy?: string; // Admin identifier
  }>;
}

export interface DeviceTransferRequest {
  id: string;
  restoreCode: string;
  oldDeviceID: string;
  newDeviceID: string;
  requestedAt: string; // ISO date
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

/**
 * Get all subscriptions (admin only)
 * Checks Supabase first, falls back to localStorage
 */
export async function getAllSubscriptions(): Promise<SubscriptionStatus[]> {
  if (typeof window === 'undefined') return [];
  
  // Try Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      const supabaseSubs = await getAllSubscriptionsFromSupabase();
      if (supabaseSubs.length > 0) {
        // Also sync to localStorage for offline access
        saveSubscriptions(supabaseSubs);
        return supabaseSubs;
      }
    } catch (error) {
      console.warn('Failed to get subscriptions from Supabase, using localStorage:', error);
    }
  }
  
  // Fallback to localStorage
  const stored = localStorage.getItem('zdebt_subscriptions');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  
  return [];
}

/**
 * Synchronous version for backward compatibility
 */
export function getAllSubscriptionsSync(): SubscriptionStatus[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('zdebt_subscriptions');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  
  return [];
}

/**
 * Save subscriptions (admin only)
 */
export function saveSubscriptions(subscriptions: SubscriptionStatus[]): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('zdebt_subscriptions', JSON.stringify(subscriptions));
}

/**
 * Get subscription for device ID
 */
export function getSubscription(deviceID: string): SubscriptionStatus | null {
  const subscriptions = getAllSubscriptionsSync();
  return subscriptions.find(s => s.deviceID === deviceID) || null;
}

/**
 * Check if device has PRO
 */
export function isDevicePro(deviceID: string): boolean {
  const subscription = getSubscription(deviceID);
  return subscription?.isPro || false;
}

/**
 * Set PRO status for device
 * Syncs to Supabase when available
 */
export async function setProStatus(deviceID: string, restoreCode: string, isPro: boolean): Promise<void> {
  const subscriptions = getAllSubscriptionsSync();
  const existing = subscriptions.findIndex(s => s.deviceID === deviceID);
  
  let subscription: SubscriptionStatus;
  
  if (existing !== -1) {
    subscriptions[existing].isPro = isPro;
    if (isPro && !subscriptions[existing].proSince) {
      subscriptions[existing].proSince = new Date().toISOString();
    }
    subscription = subscriptions[existing];
  } else {
    subscription = {
      deviceID,
      restoreCode,
      isPro,
      proSince: isPro ? new Date().toISOString() : undefined,
      deviceTransferHistory: []
    };
    subscriptions.push(subscription);
  }
  
  // Save to localStorage
  saveSubscriptions(subscriptions);
  
  // Sync to Supabase (non-blocking)
  if (isSupabaseConfigured()) {
    syncSubscriptionToSupabase(subscription).catch(err => {
      console.warn('Failed to sync subscription to Supabase:', err);
    });
  }
}

/**
 * Set PRO status by restore code only (admin function)
 * Finds subscription by restore code and grants/revokes PRO access
 * Checks Supabase first, falls back to localStorage
 */
export async function setProStatusByRestoreCode(restoreCode: string, isPro: boolean): Promise<{ success: boolean; error?: string; deviceID?: string }> {
  // Normalize restore code (remove dashes, uppercase)
  const normalizedCode = restoreCode.replace('-', '').toUpperCase();
  
  let existing: SubscriptionStatus | null = null;
  
  // Try Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      existing = await getSubscriptionByRestoreCodeFromSupabase(restoreCode);
      
      // If no subscription found, check if device exists and create subscription
      if (!existing) {
        const device = await getDeviceByRestoreCode(restoreCode);
        if (device) {
          // Device exists but no subscription - create one
          existing = {
            deviceID: device.device_id,
            restoreCode: device.restore_code,
            isPro: false,
            deviceTransferHistory: []
          };
          // Save it to Supabase
          await syncSubscriptionToSupabase(existing);
        }
      }
    } catch (error) {
      console.warn('Failed to get subscription from Supabase, checking localStorage:', error);
    }
  }
  
  // Fallback to localStorage
  if (!existing) {
    const subscriptions = getAllSubscriptionsSync();
    existing = subscriptions.find(s => 
      s.restoreCode.replace('-', '').toUpperCase() === normalizedCode
    ) || null;
  }
  
  if (!existing) {
    return { 
      success: false, 
      error: 'No device found with this restore code. User may need to sign up first.' 
    };
  }
  
  // Update PRO status
  existing.isPro = isPro;
  if (isPro && !existing.proSince) {
    existing.proSince = new Date().toISOString();
  }
  
  // Save to localStorage
  const subscriptions = getAllSubscriptionsSync();
  const index = subscriptions.findIndex(s => s.deviceID === existing!.deviceID);
  if (index !== -1) {
    subscriptions[index] = existing;
  } else {
    subscriptions.push(existing);
  }
  saveSubscriptions(subscriptions);
  
  // Sync to Supabase (non-blocking)
  if (isSupabaseConfigured()) {
    syncSubscriptionToSupabase(existing).catch(err => {
      console.warn('Failed to sync subscription to Supabase:', err);
    });
  }
  
  return { 
    success: true, 
    deviceID: existing.deviceID 
  };
}

/**
 * Get subscription by restore code
 */
export function getSubscriptionByRestoreCode(restoreCode: string): SubscriptionStatus | null {
  const subscriptions = getAllSubscriptionsSync();
  const normalizedCode = restoreCode.replace('-', '').toUpperCase();
  
  return subscriptions.find(s => 
    s.restoreCode.replace('-', '').toUpperCase() === normalizedCode
  ) || null;
}

/**
 * Get all device transfer requests
 */
export function getDeviceTransferRequests(): DeviceTransferRequest[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('zdebt_transfer_requests');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  
  return [];
}

/**
 * Save device transfer requests
 */
export function saveDeviceTransferRequests(requests: DeviceTransferRequest[]): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('zdebt_transfer_requests', JSON.stringify(requests));
}

/**
 * Process device transfer automatically (after restore code verification)
 * This transfers the subscription immediately without admin approval
 */
export function processDeviceTransfer(
  restoreCode: string,
  oldDeviceID: string,
  newDeviceID: string
): { success: boolean; error?: string } {
  // Check cooling period
  const canTransfer = canRequestDeviceTransfer(oldDeviceID);
  if (!canTransfer.allowed) {
    return {
      success: false,
      error: `Device transfer is not available yet. Please wait ${canTransfer.daysRemaining} more day(s).`
    };
  }
  
  // Find subscription by restore code and old device ID
  const subscriptions = getAllSubscriptionsSync();
  const oldSub = subscriptions.find(s => 
    s.deviceID === oldDeviceID && 
    s.restoreCode.replace('-', '').toUpperCase() === restoreCode.replace('-', '').toUpperCase()
  );
  
  if (!oldSub) {
    return { success: false, error: 'Restore code does not match this device' };
  }
  
  // Create new subscription for new device
  const newSub: SubscriptionStatus = {
    deviceID: newDeviceID,
    restoreCode: oldSub.restoreCode,
    isPro: oldSub.isPro,
    proSince: oldSub.proSince,
    proExpiresAt: oldSub.proExpiresAt,
    lastDeviceChange: new Date().toISOString(),
    deviceTransferHistory: [
      ...oldSub.deviceTransferHistory,
      {
        fromDeviceID: oldDeviceID,
        toDeviceID: newDeviceID,
        date: new Date().toISOString(),
        approvedBy: 'automatic'
      }
    ]
  };
  
  // Remove old subscription
  const oldIndex = subscriptions.findIndex(s => s.deviceID === oldDeviceID);
  if (oldIndex !== -1) {
    subscriptions.splice(oldIndex, 1);
  }
  
  // Add new subscription
  subscriptions.push(newSub);
  saveSubscriptions(subscriptions);
  
  // Also create a record in transfer requests for admin visibility
  const requests = getDeviceTransferRequests();
  const request: DeviceTransferRequest = {
    id: `req_${Date.now()}`,
    restoreCode,
    oldDeviceID,
    newDeviceID,
    requestedAt: new Date().toISOString(),
    status: 'approved',
    approvedAt: new Date().toISOString(),
    approvedBy: 'automatic'
  };
  requests.push(request);
  saveDeviceTransferRequests(requests);
  
  return { success: true };
}

/**
 * Create device transfer request (legacy - kept for admin panel)
 */
export function createDeviceTransferRequest(
  restoreCode: string,
  oldDeviceID: string,
  newDeviceID: string
): DeviceTransferRequest {
  const requests = getDeviceTransferRequests();
  
  const request: DeviceTransferRequest = {
    id: `req_${Date.now()}`,
    restoreCode,
    oldDeviceID,
    newDeviceID,
    requestedAt: new Date().toISOString(),
    status: 'pending'
  };
  
  requests.push(request);
  saveDeviceTransferRequests(requests);
  
  return request;
}

/**
 * Check if device can request transfer (10-day cooling period)
 */
export function canRequestDeviceTransfer(deviceID: string): { allowed: boolean; daysRemaining?: number } {
  const subscription = getSubscription(deviceID);
  
  if (!subscription?.lastDeviceChange) {
    return { allowed: true };
  }
  
  const lastChange = new Date(subscription.lastDeviceChange);
  const now = new Date();
  const daysSince = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSince >= 10) {
    return { allowed: true };
  }
  
  return {
    allowed: false,
    daysRemaining: 10 - daysSince
  };
}

/**
 * Approve device transfer request (admin only)
 */
export function approveDeviceTransfer(
  requestId: string,
  approvedBy: string
): { success: boolean; error?: string } {
  const requests = getDeviceTransferRequests();
  const request = requests.find(r => r.id === requestId);
  
  if (!request) {
    return { success: false, error: 'Request not found' };
  }
  
  if (request.status !== 'pending') {
    return { success: false, error: 'Request already processed' };
  }
  
  // Check cooling period
  const canTransfer = canRequestDeviceTransfer(request.oldDeviceID);
  if (!canTransfer.allowed) {
    return {
      success: false,
      error: `Cooling period active. ${canTransfer.daysRemaining} days remaining.`
    };
  }
  
  // Update request
  request.status = 'approved';
  request.approvedAt = new Date().toISOString();
  request.approvedBy = approvedBy;
  
  // Update subscription
  const subscriptions = getAllSubscriptionsSync();
  const oldSub = subscriptions.find(s => s.deviceID === request.oldDeviceID);
  
  if (oldSub) {
    // Create new subscription for new device
    const newSub: SubscriptionStatus = {
      deviceID: request.newDeviceID,
      restoreCode: request.restoreCode,
      isPro: oldSub.isPro,
      proSince: oldSub.proSince,
      proExpiresAt: oldSub.proExpiresAt,
      lastDeviceChange: new Date().toISOString(),
      deviceTransferHistory: [
        ...oldSub.deviceTransferHistory,
        {
          fromDeviceID: request.oldDeviceID,
          toDeviceID: request.newDeviceID,
          date: new Date().toISOString(),
          approvedBy
        }
      ]
    };
    
    // Remove old subscription
    const oldIndex = subscriptions.findIndex(s => s.deviceID === request.oldDeviceID);
    if (oldIndex !== -1) {
      subscriptions.splice(oldIndex, 1);
    }
    
    // Add new subscription
    subscriptions.push(newSub);
    saveSubscriptions(subscriptions);
  }
  
  saveDeviceTransferRequests(requests);
  
  return { success: true };
}

/**
 * Reject device transfer request (admin only)
 */
export function rejectDeviceTransfer(
  requestId: string,
  reason: string,
  approvedBy: string
): { success: boolean; error?: string } {
  const requests = getDeviceTransferRequests();
  const request = requests.find(r => r.id === requestId);
  
  if (!request) {
    return { success: false, error: 'Request not found' };
  }
  
  if (request.status !== 'pending') {
    return { success: false, error: 'Request already processed' };
  }
  
  request.status = 'rejected';
  request.approvedAt = new Date().toISOString();
  request.approvedBy = approvedBy;
  request.rejectionReason = reason;
  
  saveDeviceTransferRequests(requests);
  
  return { success: true };
}

/**
 * Get PRO users (admin only)
 */
export function getProUsers(): SubscriptionStatus[] {
  return getAllSubscriptionsSync().filter(s => s.isPro);
}

/**
 * Sync PRO status from subscription system to user store
 * Call this when user logs in or when admin grants PRO access
 * Checks Supabase first, then localStorage
 */
export async function syncProStatusToStore(deviceID: string): Promise<{ isPro: boolean; proExpiresAt?: string; proSince?: string }> {
  let subscription: SubscriptionStatus | null = null;
  
  // Try Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      subscription = await getSubscriptionFromSupabase(deviceID);
    } catch (error) {
      console.warn('Failed to get subscription from Supabase, checking localStorage:', error);
    }
  }
  
  // Fallback to localStorage
  if (!subscription) {
    subscription = getSubscription(deviceID);
  }
  
  if (!subscription) {
    return { isPro: false };
  }
  
  // Update localStorage directly (Zustand will pick it up)
  if (typeof window !== 'undefined') {
    const storeData = localStorage.getItem('zdebt_user_store');
    if (storeData) {
      try {
        const parsed = JSON.parse(storeData);
        parsed.state.isPro = subscription.isPro;
        parsed.state.proExpiresAt = subscription.proExpiresAt;
        parsed.state.proSince = subscription.proSince;
        localStorage.setItem('zdebt_user_store', JSON.stringify(parsed));
        
        // Also update the Zustand store if it's already initialized
        // This triggers a re-render
        const { useUserStore } = await import('@/store/useUserStore');
        useUserStore.setState({
          isPro: subscription.isPro,
          proExpiresAt: subscription.proExpiresAt,
          proSince: subscription.proSince
        });
      } catch (error) {
        console.warn('Failed to update store:', error);
      }
    }
  }
  
  return {
    isPro: subscription.isPro,
    proExpiresAt: subscription.proExpiresAt,
    proSince: subscription.proSince
  };
}

