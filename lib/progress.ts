/**
 * Calculate week number since user created account
 */
export function calculateWeekNumber(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.ceil(diffDays / 7);
  return diffWeeks;
}

/**
 * Calculate total weeks in timeline
 */
export function calculateTotalWeeks(timelineMonths: number | null): number | null {
  if (timelineMonths === null) return null;
  return Math.ceil((timelineMonths * 30) / 7); // Approximate weeks
}

/**
 * Calculate days remaining to target date
 */
export function calculateDaysRemaining(targetDate: string | null): number | null {
  if (!targetDate) return null;
  
  const target = new Date(targetDate);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Calculate progress percentage based on time elapsed
 */
export function calculateTimeProgress(
  createdAt: string,
  targetDate: string | null
): number {
  if (!targetDate) return 0;
  
  const created = new Date(createdAt);
  const target = new Date(targetDate);
  const now = new Date();
  
  const totalTime = target.getTime() - created.getTime();
  const elapsed = now.getTime() - created.getTime();
  
  if (totalTime <= 0) return 100;
  
  const percentage = Math.round((elapsed / totalTime) * 100);
  return Math.min(Math.max(percentage, 0), 100);
}

/**
 * Calculate debt progress percentage
 */
export function calculateDebtProgress(
  originalDebt: number,
  currentDebt: number
): number {
  if (originalDebt === 0) return 0;
  
  const paid = originalDebt - currentDebt;
  const percentage = Math.round((paid / originalDebt) * 100);
  return Math.min(Math.max(percentage, 0), 100);
}

/**
 * Get milestone thresholds
 */
export const MILESTONES = [
  { percentage: 25, emoji: '🌱', label: 'First Quarter' },
  { percentage: 30, emoji: '🎯', label: '30% Complete' },
  { percentage: 35, emoji: '💪', label: 'Over a Third' },
  { percentage: 40, emoji: '🚀', label: '40% Done' },
  { percentage: 45, emoji: '⭐', label: 'Nearly Halfway' },
  { percentage: 50, emoji: '🎉', label: 'Halfway There!' },
  { percentage: 60, emoji: '🔥', label: '60% Complete' },
  { percentage: 70, emoji: '💎', label: '70% Done' },
  { percentage: 75, emoji: '🏆', label: 'Three Quarters' },
  { percentage: 80, emoji: '🌟', label: '80% Complete' },
  { percentage: 90, emoji: '🎊', label: '90% There!' },
  { percentage: 100, emoji: '✨', label: 'Complete!' }
];

/**
 * Check if milestone reached
 */
export function checkMilestone(
  currentPercentage: number,
  lastCheckedPercentage: number
): { reached: boolean; milestone?: typeof MILESTONES[0] } {
  for (const milestone of MILESTONES) {
    if (currentPercentage >= milestone.percentage && 
        lastCheckedPercentage < milestone.percentage) {
      return { reached: true, milestone };
    }
  }
  return { reached: false };
}

/**
 * Check if user has reached a new milestone
 * Compares current progress to last checked milestone
 */
export function checkForNewMilestone(
  currentPercentage: number,
  lastMilestonePercentage: number
): { reached: boolean; milestone?: typeof MILESTONES[0] } {
  // Find the highest milestone reached that hasn't been celebrated yet
  for (const milestone of MILESTONES) {
    if (currentPercentage >= milestone.percentage && 
        lastMilestonePercentage < milestone.percentage) {
      return { reached: true, milestone };
    }
  }
  return { reached: false };
}

/**
 * Get next milestone to reach
 */
export function getNextMilestone(currentPercentage: number): typeof MILESTONES[0] | null {
  for (const milestone of MILESTONES) {
    if (currentPercentage < milestone.percentage) {
      return milestone;
    }
  }
  return null;
}

/**
 * Get all milestones reached
 */
export function getMilestonesReached(currentPercentage: number): typeof MILESTONES[0][] {
  return MILESTONES.filter(m => currentPercentage >= m.percentage);
}

/**
 * Get percentage to next milestone
 */
export function getProgressToNextMilestone(currentPercentage: number): {
  current: number;
  next: number;
  percentage: number;
} | null {
  const nextMilestone = getNextMilestone(currentPercentage);
  
  if (!nextMilestone) {
    return null; // Already at 100%
  }
  
  // Find previous milestone
  const previousMilestone = MILESTONES
    .filter(m => m.percentage <= currentPercentage)
    .sort((a, b) => b.percentage - a.percentage)[0];
  
  const previousPercentage = previousMilestone?.percentage || 0;
  const range = nextMilestone.percentage - previousPercentage;
  const progress = currentPercentage - previousPercentage;
  const percentage = Math.round((progress / range) * 100);
  
  return {
    current: currentPercentage,
    next: nextMilestone.percentage,
    percentage: Math.max(0, Math.min(100, percentage))
  };
}

/**
 * Format week display
 */
export function formatWeekDisplay(
  currentWeek: number,
  totalWeeks: number | null
): string {
  if (totalWeeks === null) {
    return `Week ${currentWeek}`;
  }
  return `Week ${currentWeek} of ${totalWeeks}`;
}

/**
 * Get encouraging message based on week number
 */
export function getWeeklyMessage(weekNumber: number): string {
  if (weekNumber === 1) return "Welcome! Your journey begins.";
  if (weekNumber === 2) return "Building momentum.";
  if (weekNumber === 3) return "Starting to see patterns?";
  if (weekNumber === 4) return "One month in. Keep going!";
  if (weekNumber === 8) return "Two months. You're building habits.";
  if (weekNumber === 12) return "Three months. Real progress!";
  if (weekNumber === 26) return "Half a year. Impressive consistency.";
  if (weekNumber === 52) return "One year! This is a lifestyle now.";
  
  // Default messages
  const messages = [
    "Staying consistent.",
    "Building your future.",
    "Progress over perfection.",
    "Small steps matter.",
    "You're doing this.",
    "Keep the momentum."
  ];
  
  return messages[weekNumber % messages.length];
}

/**
 * Calculate streak (consecutive weeks with check-ins)
 * TODO: Implement when check-in system is built
 */
export function calculateStreak(checkIns: any[]): number {
  // Placeholder for now
  return 0;
}

