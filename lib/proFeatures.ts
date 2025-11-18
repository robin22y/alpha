export interface PricingTier {
  id: 'free' | 'pro';
  name: string;
  price: {
    monthly: number;
    annual: number;
  };
  features: string[];
  limitations?: string[];
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: {
      monthly: 0,
      annual: 0
    },
    features: [
      'Core debt tracking',
      'Basic progress tracking',
      'Weekly check-ins',
      '1 weekly story',
      'Basic calculators',
      'Milestone celebrations',
      '1% weekly challenges',
      'Privacy-first (no cloud sync)'
    ],
    limitations: [
      'Limited to 3 debts',
      'Basic analytics only',
      'No export functionality',
      'No advanced calculators',
      'No custom goals',
      'Data stored locally only'
    ]
  },
  {
    id: 'pro',
    name: 'PRO',
    price: {
      monthly: 9.99,
      annual: 99 // 2 months free
    },
    features: [
      '✨ Everything in Free, plus:',
      'Unlimited debts tracking',
      'Advanced analytics & insights',
      'Export to CSV/PDF',
      'Custom goal setting',
      'Advanced calculators',
      'All weekly stories unlocked',
      'Priority email support',
      'Optional cloud backup (encrypted)',
      'Early access to new features'
    ]
  }
];

export interface ProFeature {
  id: string;
  name: string;
  description: string;
  requiresPro: boolean;
  category: 'tracking' | 'analytics' | 'content' | 'export' | 'support';
}

export const PRO_FEATURES: ProFeature[] = [
  {
    id: 'unlimited_debts',
    name: 'Unlimited Debts',
    description: 'Track as many debts as you need. Free plan limited to 3.',
    requiresPro: true,
    category: 'tracking'
  },
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Deep insights into your progress with charts and projections.',
    requiresPro: true,
    category: 'analytics'
  },
  {
    id: 'export_data',
    name: 'Export Data',
    description: 'Export your data to CSV or PDF for records.',
    requiresPro: true,
    category: 'export'
  },
  {
    id: 'custom_goals',
    name: 'Custom Goals',
    description: 'Set personalized financial goals beyond debt freedom.',
    requiresPro: true,
    category: 'tracking'
  },
  {
    id: 'all_stories',
    name: 'All Stories',
    description: 'Access all weekly stories, not just the weekly rotation.',
    requiresPro: true,
    category: 'content'
  },
  {
    id: 'cloud_backup',
    name: 'Cloud Backup',
    description: 'Optional encrypted cloud backup for your data.',
    requiresPro: true,
    category: 'tracking'
  },
  {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Get help faster with priority email support.',
    requiresPro: true,
    category: 'support'
  }
];

/**
 * Check if user has PRO access
 * Includes free trial and admin override logic
 */
export function hasProAccess(userData: {
  createdAt: string;
  isPro: boolean;
  proExpiresAt?: string;
  adminSettings?: {
    extendedTrial: boolean;
    trialExtensionDays: number;
    isPremiumOverride: boolean;
  };
}): boolean {
  // Admin override
  if (userData.adminSettings?.isPremiumOverride) {
    return true;
  }

  // Check if paid PRO
  if (userData.isPro) {
    if (!userData.proExpiresAt) return true;
    return new Date(userData.proExpiresAt) > new Date();
  }

  // Check free trial
  return isInFreeTrial(userData);
}

/**
 * Check if user is in free trial period
 */
export function isInFreeTrial(userData: {
  createdAt: string;
  isPro: boolean;
  adminSettings?: {
    extendedTrial: boolean;
    trialExtensionDays: number;
  };
}): boolean {
  if (userData.isPro) return false;

  const created = new Date(userData.createdAt);
  const now = new Date();
  const daysSinceCreation = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

  // Base trial: 14 days
  let trialDays = 14;

  // Add admin extension if enabled
  if (userData.adminSettings?.extendedTrial) {
    trialDays += userData.adminSettings.trialExtensionDays;
  }

  return daysSinceCreation < trialDays;
}

/**
 * Get days remaining in trial
 */
export function getTrialDaysRemaining(userData: {
  createdAt: string;
  isPro: boolean;
  adminSettings?: {
    extendedTrial: boolean;
    trialExtensionDays: number;
  };
}): number {
  if (userData.isPro || !isInFreeTrial(userData)) return 0;

  const created = new Date(userData.createdAt);
  const now = new Date();
  const daysSinceCreation = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

  let trialDays = 14;
  if (userData.adminSettings?.extendedTrial) {
    trialDays += userData.adminSettings.trialExtensionDays;
  }

  return trialDays - daysSinceCreation;
}

/**
 * Check if specific feature is available
 */
export function canUseFeature(
  featureId: string,
  userData: {
    createdAt: string;
    isPro: boolean;
    proExpiresAt?: string;
    adminSettings?: {
      extendedTrial: boolean;
      trialExtensionDays: number;
      isPremiumOverride: boolean;
    };
  }
): boolean {
  const feature = PRO_FEATURES.find(f => f.id === featureId);
  if (!feature) return true; // Unknown features are allowed
  if (!feature.requiresPro) return true; // Free features always allowed

  return hasProAccess(userData);
}

/**
 * Get appropriate upgrade message based on context
 */
export function getUpgradeMessage(featureId: string): {
  title: string;
  description: string;
  ctaText: string;
} {
  const messages: Record<string, { title: string; description: string; ctaText: string }> = {
    unlimited_debts: {
      title: 'Unlock Unlimited Debts',
      description: 'Track as many debts as you need. No limits on your journey.',
      ctaText: 'Upgrade to PRO'
    },
    advanced_analytics: {
      title: 'See Deeper Insights',
      description: 'Get advanced analytics, projections, and detailed breakdowns.',
      ctaText: 'Unlock Analytics'
    },
    export_data: {
      title: 'Export Your Data',
      description: 'Download your progress as CSV or PDF for your records.',
      ctaText: 'Upgrade to Export'
    },
    custom_goals: {
      title: 'Set Custom Goals',
      description: 'Beyond debt freedom—define your own financial milestones.',
      ctaText: 'Unlock Custom Goals'
    },
    all_stories: {
      title: 'Read All Stories',
      description: 'Access the complete collection of financial stories anytime.',
      ctaText: 'Unlock All Stories'
    },
    cloud_backup: {
      title: 'Secure Cloud Backup',
      description: 'Optional encrypted backup so you never lose your progress.',
      ctaText: 'Enable Cloud Backup'
    }
  };

  return messages[featureId] || {
    title: 'Upgrade to PRO',
    description: 'Unlock all features and support zdebt development.',
    ctaText: 'Upgrade Now'
  };
}

/**
 * Calculate savings for annual plan
 */
export function getAnnualSavings(): number {
  const monthly = PRICING_TIERS[1].price.monthly;
  const annual = PRICING_TIERS[1].price.annual;
  return (monthly * 12) - annual;
}

/**
 * Format trial status message
 */
export function getTrialStatusMessage(userData: {
  createdAt: string;
  isPro: boolean;
  adminSettings?: {
    extendedTrial: boolean;
    trialExtensionDays: number;
  };
}): string {
  if (userData.isPro) return 'PRO Active';

  const daysRemaining = getTrialDaysRemaining(userData);
  if (daysRemaining > 0) {
    return `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} of PRO trial remaining`;
  }

  return 'Trial ended';
}

