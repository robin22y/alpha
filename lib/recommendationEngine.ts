import { AffiliatePartner, getRelevantPartners, getUserAffiliateProfile } from './affiliates';

export interface ScoredPartner extends AffiliatePartner {
  relevanceScore: number;
}

export interface RecommendationContext {
  page: 'dashboard' | 'debt' | 'checkin' | 'challenge' | 'results';
  userWeek: number;
  hasSeenRecently: string[]; // Partner IDs seen in last session
}

/**
 * Score partners based on relevance to user
 */
export function scorePartners(
  partners: AffiliatePartner[],
  userData: {
    totalDebt: number;
    goal: { type: string | null };
    finances: { monthlyLeftover: number };
  }
): ScoredPartner[] {
  const profile = getUserAffiliateProfile(userData);
  
  return partners.map(partner => {
    let score = 0;
    
    // Base relevance
    if (profile.hasDebt && partner.relevantFor.hasDebt) score += 10;
    if (profile.wantsToInvest && partner.relevantFor.wantsToInvest) score += 8;
    if (profile.wantsToSave && partner.relevantFor.wantsToSave) score += 7;
    if (profile.needsBudgetHelp && partner.relevantFor.needsBudgetHelp) score += 9;
    if (profile.needsCreditHelp && partner.relevantFor.needsCreditHelp) score += 10;
    
    // Urgent needs get higher priority
    if (userData.totalDebt > 10000 && partner.category === 'credit') score += 5;
    if (userData.finances.monthlyLeftover < 0 && partner.category === 'budgeting') score += 5;
    if (userData.finances.monthlyLeftover > 200 && partner.category === 'investing') score += 3;
    
    return {
      ...partner,
      relevanceScore: score
    };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Get contextual recommendations for specific page
 */
export function getContextualRecommendations(
  userData: {
    totalDebt: number;
    goal: { type: string | null };
    finances: { monthlyLeftover: number };
  },
  context: RecommendationContext,
  maxRecommendations: number = 2
): ScoredPartner[] {
  const profile = getUserAffiliateProfile(userData);
  let relevantPartners = getRelevantPartners(profile);
  
  // Filter out recently seen
  relevantPartners = relevantPartners.filter(
    p => !context.hasSeenRecently.includes(p.id)
  );
  
  // Context-specific filtering
  switch (context.page) {
    case 'dashboard':
      // Show high-priority needs only
      relevantPartners = relevantPartners.filter(p => 
        p.category === 'credit' || p.category === 'budgeting'
      );
      break;
      
    case 'debt':
      // Focus on debt-related tools
      relevantPartners = relevantPartners.filter(p => 
        p.category === 'credit' || p.category === 'comparison'
      );
      break;
      
    case 'checkin':
      // After check-in, suggest progress tools
      relevantPartners = relevantPartners.filter(p => 
        p.category === 'budgeting' || p.category === 'saving'
      );
      break;
      
    case 'challenge':
      // Challenge context: earning/saving tools
      relevantPartners = relevantPartners.filter(p => 
        p.category === 'saving' || p.category === 'comparison'
      );
      break;
      
    case 'results':
      // Results: investment if they're ahead, debt help if behind
      if (userData.finances.monthlyLeftover > 100) {
        relevantPartners = relevantPartners.filter(p => 
          p.category === 'investing' || p.category === 'saving'
        );
      } else {
        relevantPartners = relevantPartners.filter(p => 
          p.category === 'credit' || p.category === 'budgeting'
        );
      }
      break;
  }
  
  // Score and return top N
  const scored = scorePartners(relevantPartners, userData);
  return scored.slice(0, maxRecommendations);
}

/**
 * Should show recommendations on this page view?
 * Implements frequency capping
 */
export function shouldShowRecommendations(
  context: RecommendationContext
): boolean {
  if (typeof window === 'undefined') return false;
  
  // Don't show in first 2 weeks
  if (context.userWeek < 3) return false;
  
  // Check last shown time
  const lastShown = localStorage.getItem('zdebt_last_rec_shown');
  if (lastShown) {
    const hoursSinceLastShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60);
    // Don't show more than once per 24 hours
    if (hoursSinceLastShown < 24) return false;
  }
  
  return true;
}

/**
 * Mark recommendations as shown
 */
export function markRecommendationsShown(partnerIds: string[]): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('zdebt_last_rec_shown', Date.now().toString());
  
  const recentlySeen = JSON.parse(localStorage.getItem('zdebt_recent_recs') || '[]');
  const updated = [...new Set([...recentlySeen, ...partnerIds])].slice(-10); // Keep last 10
  localStorage.setItem('zdebt_recent_recs', JSON.stringify(updated));
}

/**
 * Get recently seen partner IDs
 */
export function getRecentlySeenPartners(): string[] {
  if (typeof window === 'undefined') return [];
  
  return JSON.parse(localStorage.getItem('zdebt_recent_recs') || '[]');
}

