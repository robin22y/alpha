export interface Challenge {
  id: string;
  week: number;
  type: 'earn_more' | 'spend_less' | 'hybrid';
  title: string;
  description: string;
  targetAmount: number;
  accepted: boolean;
  completed: boolean;
  actualAmount?: number;
  completedDate?: string;
  ideas: string[];
}

export interface ChallengeStats {
  totalChallenges: number;
  completedChallenges: number;
  currentStreak: number;
  longestStreak: number;
  totalEarned: number;
  totalSaved: number;
}

/**
 * Generate challenge ideas based on 1% amount
 */
export function generateChallengeIdeas(
  onePercentAmount: number,
  type: 'earn_more' | 'spend_less' | 'hybrid'
): string[] {
  const earnMoreIdeas = [
    `Sell unused items online (aim for £${Math.round(onePercentAmount)})`,
    `Take on 2-3 hours of freelance work`,
    `Complete online surveys or user testing`,
    `Offer a service to neighbors (dog walking, gardening, etc.)`,
    `Sell handmade items or crafts`,
    `Participate in the gig economy (Uber, Deliveroo, etc.)`,
    `Tutor students online or in-person`,
    `Rent out parking space or storage`,
    `Take extra shifts at work if available`,
    `Complete one-off tasks on TaskRabbit or similar`,
  ];

  const spendLessIdeas = [
    `Skip takeaways this week (save £${Math.round(onePercentAmount)})`,
    `Cancel one unused subscription`,
    `Pack lunch instead of buying (5 days = £${Math.round(onePercentAmount * 0.8)})`,
    `Have a no-spend weekend`,
    `Use coupons/discounts for groceries`,
    `Skip one night out or social event`,
    `Make coffee at home instead of buying`,
    `Use comparison sites before purchases`,
    `Wait 24 hours before non-essential purchases`,
    `Shop from your pantry/freezer this week`,
  ];

  const hybridIdeas = [
    `Save £${Math.round(onePercentAmount / 2)} + earn £${Math.round(onePercentAmount / 2)}`,
    `Cut one expense + sell one item`,
    `Cook at home + do 2 hours side work`,
    `Cancel subscription + complete paid task`,
    `No-spend day + quick freelance gig`,
  ];

  if (type === 'earn_more') {
    return earnMoreIdeas.slice(0, 5);
  } else if (type === 'spend_less') {
    return spendLessIdeas.slice(0, 5);
  } else {
    return hybridIdeas.slice(0, 5);
  }
}

/**
 * Create a new challenge for the week
 */
export function createWeeklyChallenge(
  weekNumber: number,
  onePercentAmount: number,
  preferredType: 'earn_more' | 'spend_less' | 'hybrid' = 'hybrid'
): Challenge {
  const ideas = generateChallengeIdeas(onePercentAmount, preferredType);
  
  const titles = {
    earn_more: '1% Earn More Challenge',
    spend_less: '1% Spend Less Challenge',
    hybrid: '1% Combined Challenge'
  };
  
  const descriptions = {
    earn_more: `Find a way to earn an extra £${Math.round(onePercentAmount)} this week.`,
    spend_less: `Reduce your spending by £${Math.round(onePercentAmount)} this week.`,
    hybrid: `Improve your finances by £${Math.round(onePercentAmount)} this week—earn more, spend less, or both.`
  };

  return {
    id: `challenge_${weekNumber}`,
    week: weekNumber,
    type: preferredType,
    title: titles[preferredType],
    description: descriptions[preferredType],
    targetAmount: onePercentAmount,
    accepted: false,
    completed: false,
    ideas
  };
}

/**
 * Calculate challenge stats
 */
export function calculateChallengeStats(challenges: Challenge[]): ChallengeStats {
  const completedChallenges = challenges.filter(c => c.completed);
  
  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const sortedChallenges = [...challenges].sort((a, b) => b.week - a.week);
  
  for (let i = 0; i < sortedChallenges.length; i++) {
    if (sortedChallenges[i].completed) {
      tempStreak++;
      if (i === 0) currentStreak = tempStreak;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      if (currentStreak > 0) break; // End of current streak
      tempStreak = 0;
    }
  }
  
  // Calculate totals
  const totalEarned = completedChallenges
    .filter(c => c.type === 'earn_more' || c.type === 'hybrid')
    .reduce((sum, c) => sum + (c.actualAmount || 0), 0);
  
  const totalSaved = completedChallenges
    .filter(c => c.type === 'spend_less' || c.type === 'hybrid')
    .reduce((sum, c) => sum + (c.actualAmount || 0), 0);

  return {
    totalChallenges: challenges.length,
    completedChallenges: completedChallenges.length,
    currentStreak,
    longestStreak,
    totalEarned,
    totalSaved
  };
}

/**
 * Check if challenge should be triggered (Week 4+)
 */
export function shouldShowChallenge(weekNumber: number, challenges: Challenge[]): boolean {
  // Start challenges at Week 4
  if (weekNumber < 4) return false;
  
  // Check if already has challenge for this week
  const hasThisWeek = challenges.some(c => c.week === weekNumber);
  return !hasThisWeek;
}

/**
 * Get challenge for specific week
 */
export function getChallengeForWeek(challenges: Challenge[], weekNumber: number): Challenge | null {
  return challenges.find(c => c.week === weekNumber) || null;
}

