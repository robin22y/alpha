export interface CheckIn {
  week: number;
  date: string;
  moodEmoji: string;
  extraPayment?: number;
  newIncome?: number;
  notes?: string;
  storyShown?: string; // ID of story shown this week
}

export interface WeeklyStory {
  id: string;
  title: string;
  content: string; // 60-80 words
  reflectionLine: string;
  category: 'success' | 'cautionary' | 'neutral';
  source: string; // e.g., "Based on public financial statistics"
}

// Mood emoji options
export const MOOD_EMOJIS = [
  { emoji: '😊', label: 'Great', value: 'great' },
  { emoji: '🙂', label: 'Good', value: 'good' },
  { emoji: '😐', label: 'Okay', value: 'okay' },
  { emoji: '😟', label: 'Struggling', value: 'struggling' },
  { emoji: '😰', label: 'Stressed', value: 'stressed' }
];

// Weekly stories - will rotate through these
export const WEEKLY_STORIES: WeeklyStory[] = [
  {
    id: 'story_001',
    title: 'The Coffee Shop Habit',
    content: 'Sarah, 32, realized she spent £180/month on takeaway coffee. She started making coffee at home and put that £180 toward her credit card. In 14 months, she cleared £2,500 in debt she\'d carried for years. The small daily change created space for bigger moves.',
    reflectionLine: 'What small daily expense could you redirect?',
    category: 'success',
    source: 'Based on public financial statistics'
  },
  {
    id: 'story_002',
    title: 'The Subscription Surprise',
    content: 'James, 28, audited his bank statements and found £47/month in subscriptions he rarely used. Netflix, Spotify, gym membership he hadn\'t visited in months. He cancelled three services. That £47 became his debt payment boost. Sixteen months later, his car loan was gone.',
    reflectionLine: 'When did you last review your subscriptions?',
    category: 'success',
    source: 'Based on public financial statistics'
  },
  {
    id: 'story_003',
    title: 'The Minimum Payment Trap',
    content: 'Lisa paid the minimum on her £3,000 credit card for five years. At 19.9% APR, she paid £2,100 in interest and still owed £2,400. When she increased payments by just £50/month, she cleared it in two years and saved £1,300 in interest. The math was brutal but clear.',
    reflectionLine: 'Are you paying more than the minimum?',
    category: 'cautionary',
    source: 'Based on public financial statistics'
  },
  {
    id: 'story_004',
    title: 'The Side Hustle £500',
    content: 'Marcus, 35, started dog walking three evenings a week. Two dogs, £25 each, three nights = £150/week. He put every penny toward his overdraft. In four months, he cleared £2,400 he\'d been carrying for three years. The dogs got exercise. He got freedom.',
    reflectionLine: 'What could you do for an extra £100-200/month?',
    category: 'success',
    source: 'Based on public financial statistics'
  },
  {
    id: 'story_005',
    title: 'The BNPL Snowball',
    content: 'Emma, 26, had five active Buy Now Pay Later plans totaling £680. "Interest-free" meant she kept adding more. One missed payment triggered late fees on all five. £680 became £920 in six weeks. She consolidated, paid it off in 10 months, and deleted all BNPL apps.',
    reflectionLine: 'How many payment plans are you juggling?',
    category: 'cautionary',
    source: 'Based on public financial statistics'
  },
  {
    id: 'story_006',
    title: 'The Raise That Vanished',
    content: 'Tom got a 10% raise—£3,600 more per year. Within three months, he couldn\'t say where it went. Bigger flat, more takeaways, new habits. A year later, he had the same debt as before. The raise never touched his goals because he never allocated it first.',
    reflectionLine: 'If you got a raise tomorrow, where would it go?',
    category: 'neutral',
    source: 'Based on public financial statistics'
  },
  {
    id: 'story_007',
    title: 'The Emergency That Wasn\'t',
    content: 'David kept a credit card "for emergencies." Over two years, he used it for a holiday (£1,200), Christmas gifts (£800), and a "great deal" on a TV (£600). All felt necessary at the time. None were emergencies. The card stayed maxed for three years.',
    reflectionLine: 'What counts as an emergency in your world?',
    category: 'cautionary',
    source: 'Based on public financial statistics'
  },
  {
    id: 'story_008',
    title: 'The Meal Prep £400',
    content: 'Rachel spent £120/week on lunches and dinners out. She started meal prepping on Sundays—£40 of groceries fed her all week. The £80/week savings went straight to her student loan. Eight months in, she\'d paid off £2,560. She still enjoyed food. Just planned better.',
    reflectionLine: 'How much do you spend eating out per week?',
    category: 'success',
    source: 'Based on public financial statistics'
  },
  {
    id: 'story_009',
    title: 'The Comparison Trap',
    content: 'Sophie, 29, saw friends posting holidays, new cars, designer bags. She kept up on credit. £8,000 in debt later, she learned three friends were also in debt, one was living with parents, another had family money. The Instagram version wasn\'t real. Her debt was.',
    reflectionLine: 'Whose lifestyle are you trying to match?',
    category: 'neutral',
    source: 'Based on public financial statistics'
  },
  {
    id: 'story_010',
    title: 'The Overtime Strategy',
    content: 'Jake worked four overtime shifts per month—eight extra hours each. At time-and-a-half, that was £480/month extra. Every penny went to his car loan. Ten months later, the £4,800 loan was cleared. He kept doing overtime for two more months and built a £960 buffer. Then he stopped.',
    reflectionLine: 'Could you do temporary extra work for a clear goal?',
    category: 'success',
    source: 'Based on public financial statistics'
  }
];

/**
 * Get story for current week
 * Rotates through stories based on week number
 */
export function getStoryForWeek(weekNumber: number): WeeklyStory {
  const index = (weekNumber - 1) % WEEKLY_STORIES.length;
  return WEEKLY_STORIES[index];
}

/**
 * Validate check-in data
 */
export function validateCheckIn(checkIn: Partial<CheckIn>): { valid: boolean; error?: string } {
  if (!checkIn.moodEmoji) {
    return { valid: false, error: 'Please select your mood' };
  }

  if (checkIn.extraPayment !== undefined && checkIn.extraPayment < 0) {
    return { valid: false, error: 'Extra payment cannot be negative' };
  }

  if (checkIn.newIncome !== undefined && checkIn.newIncome < 0) {
    return { valid: false, error: 'New income cannot be negative' };
  }

  return { valid: true };
}

/**
 * Calculate streak from check-ins
 */
export function calculateStreak(checkIns: CheckIn[]): number {
  if (checkIns.length === 0) return 0;

  // Sort by week descending
  const sorted = [...checkIns].sort((a, b) => b.week - a.week);
  
  let streak = 0;
  let expectedWeek = sorted[0].week;

  for (const checkIn of sorted) {
    if (checkIn.week === expectedWeek) {
      streak++;
      expectedWeek--;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get last check-in
 */
export function getLastCheckIn(checkIns: CheckIn[]): CheckIn | null {
  if (checkIns.length === 0) return null;
  return checkIns.sort((a, b) => b.week - a.week)[0];
}

/**
 * Check if user has checked in this week
 */
export function hasCheckedInThisWeek(checkIns: CheckIn[], currentWeek: number): boolean {
  return checkIns.some(c => c.week === currentWeek);
}

/**
 * Mark story as shown for this check-in
 */
export function markStoryShown(checkIn: CheckIn, storyId: string): CheckIn {
  return {
    ...checkIn,
    storyShown: storyId
  };
}

