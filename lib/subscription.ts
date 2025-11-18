/**
 * Subscription and Device Transfer Management
 */

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
 */
export function getAllSubscriptions(): SubscriptionStatus[] {
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
  const subscriptions = getAllSubscriptions();
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
 */
export function setProStatus(deviceID: string, restoreCode: string, isPro: boolean): void {
  const subscriptions = getAllSubscriptions();
  const existing = subscriptions.findIndex(s => s.deviceID === deviceID);
  
  if (existing !== -1) {
    subscriptions[existing].isPro = isPro;
    if (isPro && !subscriptions[existing].proSince) {
      subscriptions[existing].proSince = new Date().toISOString();
    }
  } else {
    subscriptions.push({
      deviceID,
      restoreCode,
      isPro,
      proSince: isPro ? new Date().toISOString() : undefined,
      deviceTransferHistory: []
    });
  }
  
  saveSubscriptions(subscriptions);
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
  const subscriptions = getAllSubscriptions();
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
  const subscriptions = getAllSubscriptions();
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
  return getAllSubscriptions().filter(s => s.isPro);
}

