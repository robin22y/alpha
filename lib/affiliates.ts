export interface AffiliatePartner {
  id: string;
  name: string;
  description: string;
  category: 'credit' | 'investing' | 'saving' | 'budgeting' | 'comparison';
  logo?: string;
  affiliateLink: string;
  benefits: string[];
  relevantFor: {
    hasDebt?: boolean;
    wantsToInvest?: boolean;
    wantsToSave?: boolean;
    needsBudgetHelp?: boolean;
    needsCreditHelp?: boolean;
  };
  disclaimer: string;
}

export const AFFILIATE_PARTNERS: AffiliatePartner[] = [
  // Credit Score & Monitoring
  {
    id: 'clearscore',
    name: 'ClearScore',
    description: 'Free credit score and report. Monitor your credit health.',
    category: 'credit',
    affiliateLink: 'https://www.clearscore.com', // Add affiliate params
    benefits: [
      'Free credit score check',
      'Credit report monitoring',
      'Personalized offers',
      'Identity protection alerts'
    ],
    relevantFor: {
      hasDebt: true,
      needsCreditHelp: true
    },
    disclaimer: 'Free service. We may earn a commission if you sign up.'
  },
  
  // Investment Platforms
  {
    id: 'trading212',
    name: 'Trading 212',
    description: 'Commission-free investing and trading platform.',
    category: 'investing',
    affiliateLink: 'https://www.trading212.com', // Add affiliate params
    benefits: [
      'Commission-free trades',
      'Fractional shares',
      'ISA available',
      'Easy mobile app'
    ],
    relevantFor: {
      wantsToInvest: true
    },
    disclaimer: 'Capital at risk. We may earn a commission if you sign up.'
  },
  
  {
    id: 'freetrade',
    name: 'Freetrade',
    description: 'Simple UK investing app. Start with as little as £2.',
    category: 'investing',
    affiliateLink: 'https://freetrade.io', // Add affiliate params
    benefits: [
      'Commission-free on UK/EU shares',
      'Fractional investing',
      'ISA & SIPP available',
      'User-friendly interface'
    ],
    relevantFor: {
      wantsToInvest: true
    },
    disclaimer: 'Capital at risk. We may earn a commission if you sign up.'
  },

  // Savings & Automation
  {
    id: 'chip',
    name: 'Chip',
    description: 'Automated savings app. Save money without thinking.',
    category: 'saving',
    affiliateLink: 'https://getchip.uk', // Add affiliate params
    benefits: [
      'Automatic savings',
      'Competitive interest rates',
      'Easy access ISA',
      'Smart algorithm saves for you'
    ],
    relevantFor: {
      wantsToSave: true
    },
    disclaimer: 'FSCS protected up to £85,000. We may earn a commission.'
  },

  // Price Comparison
  {
    id: 'moneysupermarket',
    name: 'MoneySuperMarket',
    description: 'Compare deals on insurance, credit cards, energy & more.',
    category: 'comparison',
    affiliateLink: 'https://www.moneysupermarket.com', // Add affiliate params
    benefits: [
      'Compare hundreds of deals',
      'Insurance quotes',
      'Credit card comparison',
      'Energy switching'
    ],
    relevantFor: {
      needsBudgetHelp: true,
      hasDebt: true
    },
    disclaimer: 'Comparison service. We may earn a commission from providers.'
  },

  // Balance Transfer Cards
  {
    id: 'balance_transfer',
    name: 'Balance Transfer Credit Cards',
    description: 'Find 0% balance transfer cards to reduce interest.',
    category: 'credit',
    affiliateLink: 'https://www.moneysavingexpert.com/credit-cards/balance-transfer-credit-cards/', // Add affiliate params
    benefits: [
      '0% interest periods',
      'Consolidate debt',
      'Reduce monthly interest',
      'Clear debt faster'
    ],
    relevantFor: {
      hasDebt: true,
      needsCreditHelp: true
    },
    disclaimer: 'Subject to credit approval. Representative example provided. We may earn a commission.'
  },

  // Budgeting Apps
  {
    id: 'snoop',
    name: 'Snoop',
    description: 'Track spending, find better deals, save money automatically.',
    category: 'budgeting',
    affiliateLink: 'https://www.snoop.app', // Add affiliate params
    benefits: [
      'Track all accounts in one place',
      'Find better deals',
      'Spending insights',
      'Bill reminders'
    ],
    relevantFor: {
      needsBudgetHelp: true,
      wantsToSave: true
    },
    disclaimer: 'Free app. We may earn a commission from partner offers.'
  }
];

/**
 * Get published affiliate IDs (admin-controlled)
 */
export function getPublishedAffiliateIds(): string[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('zdebt_published_affiliates');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Default: all affiliates published
  return AFFILIATE_PARTNERS.map(p => p.id);
}

/**
 * Set published affiliate IDs (admin only)
 */
export function setPublishedAffiliateIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('zdebt_published_affiliates', JSON.stringify(ids));
}

/**
 * Check if affiliate is published
 */
export function isAffiliatePublished(partnerId: string): boolean {
  const published = getPublishedAffiliateIds();
  return published.includes(partnerId);
}

/**
 * Get all published partners (static + custom)
 */
function getPublishedPartners(): AffiliatePartner[] {
  const publishedIds = getPublishedAffiliateIds();
  const allPartners = getAllPartners();
  return allPartners.filter(p => publishedIds.includes(p.id));
}

/**
 * Get relevant partners based on user profile (only published ones)
 */
export function getRelevantPartners(userProfile: {
  hasDebt: boolean;
  wantsToInvest: boolean;
  wantsToSave: boolean;
  needsBudgetHelp: boolean;
  needsCreditHelp: boolean;
}): AffiliatePartner[] {
  const publishedPartners = getPublishedPartners();
  
  return publishedPartners.filter(partner => {
    const relevance = partner.relevantFor;
    
    // Check if any of the user's needs match the partner's relevance
    if (userProfile.hasDebt && relevance.hasDebt) return true;
    if (userProfile.wantsToInvest && relevance.wantsToInvest) return true;
    if (userProfile.wantsToSave && relevance.wantsToSave) return true;
    if (userProfile.needsBudgetHelp && relevance.needsBudgetHelp) return true;
    if (userProfile.needsCreditHelp && relevance.needsCreditHelp) return true;
    
    return false;
  });
}

/**
 * Get partners by category (only published ones)
 */
export function getPartnersByCategory(category: AffiliatePartner['category']): AffiliatePartner[] {
  const publishedPartners = getPublishedPartners();
  return publishedPartners.filter(p => p.category === category);
}

/**
 * Get single partner by ID (only if published)
 */
export function getPartnerById(id: string): AffiliatePartner | undefined {
  const allPartners = getAllPartners();
  const partner = allPartners.find(p => p.id === id);
  if (!partner) return undefined;
  
  // Only return if published
  if (isAffiliatePublished(id)) {
    return partner;
  }
  return undefined;
}

/**
 * Get custom affiliates from localStorage (admin-created)
 */
export function getCustomAffiliates(): AffiliatePartner[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('zdebt_custom_affiliates');
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
 * Save custom affiliates to localStorage
 */
export function saveCustomAffiliates(affiliates: AffiliatePartner[]): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('zdebt_custom_affiliates', JSON.stringify(affiliates));
}

/**
 * Add a new custom affiliate
 */
export function addCustomAffiliate(affiliate: AffiliatePartner): void {
  const custom = getCustomAffiliates();
  custom.push(affiliate);
  saveCustomAffiliates(custom);
}

/**
 * Update an existing custom affiliate
 */
export function updateCustomAffiliate(id: string, updates: Partial<AffiliatePartner>): boolean {
  const custom = getCustomAffiliates();
  const index = custom.findIndex(a => a.id === id);
  
  if (index === -1) return false;
  
  custom[index] = { ...custom[index], ...updates };
  saveCustomAffiliates(custom);
  return true;
}

/**
 * Delete a custom affiliate
 */
export function deleteCustomAffiliate(id: string): boolean {
  const custom = getCustomAffiliates();
  const filtered = custom.filter(a => a.id !== id);
  
  if (filtered.length === custom.length) return false;
  
  saveCustomAffiliates(filtered);
  
  // Also remove from published list if it was published
  const published = getPublishedAffiliateIds();
  const updatedPublished = published.filter(pid => pid !== id);
  setPublishedAffiliateIds(updatedPublished);
  
  return true;
}

/**
 * Get all partners (for admin - includes static and custom, published and unpublished)
 */
export function getAllPartners(): AffiliatePartner[] {
  const custom = getCustomAffiliates();
  return [...AFFILIATE_PARTNERS, ...custom];
}

/**
 * Get partner by ID (checks both static and custom)
 */
export function getPartnerByIdForAdmin(id: string): AffiliatePartner | undefined {
  // Check static first
  const staticPartner = AFFILIATE_PARTNERS.find(p => p.id === id);
  if (staticPartner) return staticPartner;
  
  // Check custom
  const custom = getCustomAffiliates();
  return custom.find(p => p.id === id);
}

/**
 * Track affiliate click (for analytics)
 */
export function trackAffiliateClick(partnerId: string): void {
  if (typeof window === 'undefined') return;
  
  // Store click event in localStorage for analytics
  const clicks = JSON.parse(localStorage.getItem('zdebt_affiliate_clicks') || '[]');
  clicks.push({
    partnerId,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('zdebt_affiliate_clicks', JSON.stringify(clicks));
}

/**
 * Get user's affiliate profile based on their data
 */
export function getUserAffiliateProfile(userData: {
  totalDebt: number;
  goal: { type: string | null };
  finances: { monthlyLeftover: number };
}): {
  hasDebt: boolean;
  wantsToInvest: boolean;
  wantsToSave: boolean;
  needsBudgetHelp: boolean;
  needsCreditHelp: boolean;
} {
  return {
    hasDebt: userData.totalDebt > 0,
    wantsToInvest: userData.goal.type === 'grow_investments' || userData.finances.monthlyLeftover > 100,
    wantsToSave: userData.goal.type === 'increase_savings' || userData.goal.type === 'build_stability',
    needsBudgetHelp: userData.finances.monthlyLeftover < 0 || userData.totalDebt > 0,
    needsCreditHelp: userData.totalDebt > 5000
  };
}

/**
 * Disclosure text (required for affiliate marketing)
 */
export const AFFILIATE_DISCLOSURE = {
  short: 'We may earn a commission if you sign up. This helps keep zdebt free.',
  long: `zdebt may earn a commission when you sign up for products through our links. This helps us keep zdebt free for everyone. We only recommend products we believe may be helpful. All product names, logos, and brands are property of their respective owners. zdebt is not endorsed by, directly affiliated with, maintained, authorized, or sponsored by any of these companies. Not financial advice—research products independently before signing up.`
};

