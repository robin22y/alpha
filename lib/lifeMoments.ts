export interface LifeMoment {
  id: string;
  ageRange: '20s' | '30s' | '40s' | '50s+';
  category: 'missed' | 'possible' | 'stress' | 'delayed';
  title: string;
  scenario: string;
  context: string;
  reflection: string;
}

export const LIFE_MOMENTS: LifeMoment[] = [
  // 20s - Starting Out
  {
    id: 'moment_001',
    ageRange: '20s',
    category: 'missed',
    title: 'The Friend\'s Wedding',
    scenario: 'Your close friend gets married. You can\'t afford to attend because the £400 (travel + gift + outfit) isn\'t there. You send apologies.',
    context: 'Weddings in your 20s often cluster. Missing one can mean missing a milestone in a friendship.',
    reflection: 'What events matter to you? What would it take to say yes?'
  },
  {
    id: 'moment_002',
    ageRange: '20s',
    category: 'stress',
    title: 'The Unexpected Bill',
    scenario: 'Your laptop dies. You need it for work. The repair is £300. You don\'t have it. You put it on credit and worry about the payment for months.',
    context: 'In your 20s, emergencies feel more catastrophic because savings buffers are often thin.',
    reflection: 'How much breathing room do you have for the unexpected?'
  },
  {
    id: 'moment_003',
    ageRange: '20s',
    category: 'delayed',
    title: 'The Career Course',
    scenario: 'A professional qualification course costs £800. It would open doors. You can\'t justify it right now. You tell yourself "maybe next year."',
    context: 'Early career investments compound. Delaying them by years can shift your entire trajectory.',
    reflection: 'What opportunities are you postponing? For how long?'
  },
  {
    id: 'moment_004',
    ageRange: '20s',
    category: 'possible',
    title: 'The Weekend Away',
    scenario: 'Your friends plan a weekend trip—£200 total. You have it saved. You go, create memories, strengthen bonds. No debt, no regret.',
    context: 'Having money in your 20s isn\'t about being rich. It\'s about being able to participate in life.',
    reflection: 'What experiences would you want to say yes to?'
  },

  // 30s - Building Up
  {
    id: 'moment_005',
    ageRange: '30s',
    category: 'missed',
    title: 'The Baby Shower',
    scenario: 'Your sister has a baby. You want to buy something meaningful—£150 for the pram she needs. You can only manage £30. She says it\'s fine. You feel it.',
    context: 'In your 30s, life events accelerate. Weddings, babies, milestones. Being unable to participate fully hurts.',
    reflection: 'How do you want to show up for people you care about?'
  },
  {
    id: 'moment_006',
    ageRange: '30s',
    category: 'stress',
    title: 'The Nursery Fees',
    scenario: 'Childcare costs £1,000/month. One parent stops working because paying for care makes no sense. Career momentum stalls. Resentment builds.',
    context: 'The 30s squeeze: earning more but expenses surge. Childcare, mortgages, life costs all peak at once.',
    reflection: 'What trade-offs are you making? Are they sustainable?'
  },
  {
    id: 'moment_007',
    ageRange: '30s',
    category: 'delayed',
    title: 'The House Deposit',
    scenario: 'You want to buy. You need £25,000 for a deposit. At current savings rate, it\'s eight years away. You wonder if it\'ll ever happen.',
    context: 'Property goals dominate the 30s. Delays create compounding effects—rent paid is equity lost.',
    reflection: 'What big goal keeps getting pushed further out?'
  },
  {
    id: 'moment_008',
    ageRange: '30s',
    category: 'possible',
    title: 'The Promotion Accepted',
    scenario: 'You get a promotion requiring relocation. You can afford to move—£3,000 saved for deposits and costs. You take it. Career and income jump.',
    context: 'Financial stability creates flexibility. Flexibility creates opportunity.',
    reflection: 'What opportunities require financial readiness?'
  },

  // 40s - Looking Ahead
  {
    id: 'moment_009',
    ageRange: '40s',
    category: 'missed',
    title: 'The Parent\'s Care',
    scenario: 'Your parent needs help. You can\'t take time off work or afford extra support. They manage alone. You feel guilty but trapped.',
    context: 'In your 40s, you\'re often sandwiched—supporting kids and aging parents simultaneously.',
    reflection: 'Who depends on you? What would you need to help them?'
  },
  {
    id: 'moment_010',
    ageRange: '40s',
    category: 'stress',
    title: 'The Redundancy Panic',
    scenario: 'Your industry restructures. Redundancy is possible. You have two months\' expenses saved. The fear is constant. Sleep suffers. Health suffers.',
    context: 'Job security feels different at 40. Rebuilding takes longer. Stakes feel higher.',
    reflection: 'How much runway do you have if income stops?'
  },
  {
    id: 'moment_011',
    ageRange: '40s',
    category: 'delayed',
    title: 'The Pension Catch-Up',
    scenario: 'You realize retirement is 20 years away. Your pension pot is £40,000. Projections say you\'ll need £400,000. The gap is terrifying.',
    context: 'The 40s are when pension reality hits. Compound interest works—but time is shorter now.',
    reflection: 'Are you on track for the future you imagine?'
  },
  {
    id: 'moment_012',
    ageRange: '40s',
    category: 'possible',
    title: 'The Career Pivot',
    scenario: 'You want to retrain. The course is £5,000. You have it saved. You take the leap. Eighteen months later, you\'re in a career you love.',
    context: 'Financial space creates courage to change. Change creates fulfillment.',
    reflection: 'What would you do if money weren\'t the barrier?'
  },

  // 50s+ - Peace of Mind
  {
    id: 'moment_013',
    ageRange: '50s+',
    category: 'missed',
    title: 'The Grandchild\'s Birthday',
    scenario: 'Your grandchild asks if you can come to their birthday. It\'s a three-hour drive. Petrol is £60. You say you\'re busy. They\'re hurt. You\'re heartbroken.',
    context: 'In your 50s and beyond, relationships take priority. Missing moments with family cuts deep.',
    reflection: 'What memories do you want to create while you can?'
  },
  {
    id: 'moment_014',
    ageRange: '50s+',
    category: 'stress',
    title: 'The Unexpected Medical',
    scenario: 'You need dental work—£2,000 private to avoid a six-month NHS wait. The pain is constant. You can\'t afford it. You wait in discomfort.',
    context: 'Health becomes priority. Lack of funds for treatment means enduring suffering.',
    reflection: 'What health choices would you make if cost weren\'t a factor?'
  },
  {
    id: 'moment_015',
    ageRange: '50s+',
    category: 'delayed',
    title: 'The Retirement Dream',
    scenario: 'You always wanted to travel. Retirement arrives. Finances are tight. You realize you can\'t afford it. You stay home. The dream stays a dream.',
    context: 'Delayed gratification only works if the gratification eventually comes.',
    reflection: 'Are your plans realistic for the timeline you have?'
  },
  {
    id: 'moment_016',
    ageRange: '50s+',
    category: 'possible',
    title: 'The Grandchild\'s Education Fund',
    scenario: 'Your grandchild gets into university. You can help with costs—£5,000 saved specifically for this. The burden on their parents eases. The gratitude is immense.',
    context: 'Financial stability lets you be a source of support, not someone who needs support.',
    reflection: 'How do you want to be able to help those who come after you?'
  },

  // Universal Moments
  {
    id: 'moment_017',
    ageRange: '20s',
    category: 'stress',
    title: 'The Daily Anxiety',
    scenario: 'You check your bank balance before every purchase. Small treats feel risky. You say no to coffee with friends. The mental load is exhausting.',
    context: 'Constant financial stress isn\'t just about money. It\'s cognitive burden—decision fatigue, anxiety, shame.',
    reflection: 'What would change if small decisions didn\'t carry such weight?'
  },
  {
    id: 'moment_018',
    ageRange: '30s',
    category: 'possible',
    title: 'The Breathing Room',
    scenario: 'Your car needs new tires. You have £400 set aside. You book it, pay, done. No drama. No stress. Just a problem solved.',
    context: 'Financial peace isn\'t luxury. It\'s mundane problems staying mundane instead of becoming crises.',
    reflection: 'What would your life feel like without constant financial worry?'
  }
];

/**
 * Get moments for specific age range
 */
export function getMomentsByAge(ageRange: string): LifeMoment[] {
  return LIFE_MOMENTS.filter(m => m.ageRange === ageRange);
}

/**
 * Get moments by category
 */
export function getMomentsByCategory(category: string): LifeMoment[] {
  return LIFE_MOMENTS.filter(m => m.category === category);
}

/**
 * Get random moment
 */
export function getRandomMoment(): LifeMoment {
  return LIFE_MOMENTS[Math.floor(Math.random() * LIFE_MOMENTS.length)];
}

/**
 * Get moment by ID
 */
export function getMomentById(id: string): LifeMoment | undefined {
  return LIFE_MOMENTS.find(m => m.id === id);
}

