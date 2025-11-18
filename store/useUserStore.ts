import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  calculateWeekNumber,
  calculateTotalWeeks,
  calculateDaysRemaining,
  calculateTimeProgress
} from '@/lib/progress';
import type { Challenge } from '@/lib/challenges';

export type GoalType = 
  | 'reduce_stress' 
  | 'build_stability' 
  | 'increase_savings' 
  | 'explore_income' 
  | 'plan_ahead';

export type TimelineMonths = 6 | 12 | 24 | 36 | 48 | null;

export interface DebtItem {
  id: string;
  type: string;
  name: string;
  debtType?: 'credit_card' | 'personal_loan' | 'car_loan' | 'student_loan' | 'mortgage';
  balance: number;
  interestRate: number;
  monthlyPayment: number;
  monthsToPayoff?: number;
  // For loans (personal/car/student)
  loanAmount?: number;
  loanTermYears?: number;
  // For mortgage
  homePrice?: number;
  downPayment?: number;
  mortgageTermYears?: number;
  startDate?: string;
}

interface UserData {
  // Identity (never shown to user)
  deviceID: string | null;
  restoreCode: string | null;
  createdAt: string | null;
  currency: string;
  
  // Onboarding selections
  goal: {
    type: GoalType | null;
    label: string;
  };
  
  timeline: {
    months: TimelineMonths;
    label: string;
    targetDate: string | null;
  };
  
  debts: DebtItem[];
  
  // Calculated
  totalDebt: number;
  totalMonthlyPayment: number;
  
  // Finances
  finances: {
    monthlyIncome: number;
    monthlySpending: number;
    monthlyLeftover: number;
    breakdown?: {
      housing: number;
      food: number;
      transport: number;
      utilities: number;
      entertainment: number;
      other: number;
    };
  };
  
  habit: {
    onePercentAmount: number;
    committed: boolean;
    customAmount?: number;
    reason?: string;
  };
  
  // Progress tracking
  progress: {
    currentWeek: number;
    totalWeeks: number | null;
    daysRemaining: number | null;
    timeProgressPercentage: number;
    debtProgressPercentage: number;
    lastMilestonePercentage: number;
  };
  
  // Weekly check-ins (for future use)
  weeklyCheckIns: Array<{
    week: number;
    date: string;
    moodEmoji: string;
    extraPayment?: number;
    newIncome?: number;
    notes?: string;
    storyShown?: string;
  }>;
  
  // Milestones reached
  milestonesReached: Array<{
    percentage: number;
    date: string;
    label: string;
    emoji: string;
  }>;
  
  // Challenges
  challenges: Challenge[];
  
  // Admin settings
  adminSettings?: {
    extendedTrial: boolean;
    trialExtensionDays: number;
    isPremiumOverride: boolean;
  };
  
  // Premium/PRO
  isPremium: boolean;
  isPro: boolean;
  proExpiresAt?: string;
  proSince?: string;
  storageMode: 'local' | 'cloud';
}

interface UserStore extends UserData {
  // Actions
  setGoal: (type: GoalType, label: string) => void;
  setTimeline: (months: TimelineMonths, label: string) => void;
  addDebt: (debt: DebtItem) => void;
  updateDebt: (id: string, updates: Partial<DebtItem>) => void;
  removeDebt: (id: string) => void;
  calculateTotals: () => void;
  setFinances: (income: number, spending: number, breakdown?: any) => void;
  setHabit: (committed: boolean, customAmount?: number, reason?: string) => void;
  updateProgress: () => void;
  addMilestone: (percentage: number, label: string, emoji: string) => void;
  addCheckIn: (checkIn: any) => void;
  addChallenge: (challenge: Challenge) => void;
  updateChallenge: (challengeId: string, updates: Partial<Challenge>) => void;
  setAdminSettings: (settings: Partial<typeof initialState.adminSettings>) => void;
  initializeFromLocalStorage: () => void;
  reset: () => void;
}

const initialState: UserData = {
  deviceID: null,
  restoreCode: null,
  createdAt: null,
  currency: 'USD',
  goal: {
    type: null,
    label: ''
  },
  timeline: {
    months: null,
    label: '',
    targetDate: null
  },
  debts: [],
  totalDebt: 0,
  totalMonthlyPayment: 0,
  finances: {
    monthlyIncome: 0,
    monthlySpending: 0,
    monthlyLeftover: 0
  },
  habit: {
    onePercentAmount: 0,
    committed: false
  },
  progress: {
    currentWeek: 1,
    totalWeeks: null,
    daysRemaining: null,
    timeProgressPercentage: 0,
    debtProgressPercentage: 0,
    lastMilestonePercentage: 0
  },
  weeklyCheckIns: [],
  milestonesReached: [],
  challenges: [],
  adminSettings: {
    extendedTrial: false,
    trialExtensionDays: 0,
    isPremiumOverride: false
  },
  isPremium: false,
  isPro: false,
  proExpiresAt: undefined,
  proSince: undefined,
  storageMode: 'local'
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setGoal: (type, label) => {
        set({
          goal: { type, label }
        });
      },
      
      setTimeline: (months, label) => {
        let targetDate: string | null = null;
        
        if (months !== null) {
          const date = new Date();
          date.setMonth(date.getMonth() + months);
          targetDate = date.toISOString();
        }
        
        set({
          timeline: { months, label, targetDate }
        });
      },
      
      addDebt: (debt) => {
        set((state) => ({
          debts: [...state.debts, debt]
        }));
        get().calculateTotals();
      },
      
      updateDebt: (id, updates) => {
        set((state) => ({
          debts: state.debts.map(debt => 
            debt.id === id ? { ...debt, ...updates } : debt
          )
        }));
        get().calculateTotals();
      },
      
      removeDebt: (id) => {
        set((state) => ({
          debts: state.debts.filter(debt => debt.id !== id)
        }));
        get().calculateTotals();
      },
      
      calculateTotals: () => {
        const state = get();
        const totalDebt = state.debts.reduce((sum, debt) => {
          if (debt.debtType === 'mortgage') {
            return sum + (debt.loanAmount || debt.balance || 0);
          } else if (debt.debtType === 'personal_loan' || debt.debtType === 'car_loan' || debt.debtType === 'student_loan') {
            return sum + (debt.loanAmount || debt.balance || 0);
          }
          return sum + (debt.balance || 0);
        }, 0);
        const totalMonthlyPayment = state.debts.reduce((sum, debt) => sum + (debt.monthlyPayment || 0), 0);
        
        set({ totalDebt, totalMonthlyPayment });
      },
      
      setFinances: (income, spending, breakdown) => {
        const leftover = income - spending;
        const onePercentAmount = income * 0.01;
        
        set({
          finances: {
            monthlyIncome: income,
            monthlySpending: spending,
            monthlyLeftover: leftover,
            breakdown
          },
          habit: {
            ...get().habit,
            onePercentAmount
          }
        });
      },
      
      setHabit: (committed, customAmount, reason) => {
        set((state) => ({
          habit: {
            ...state.habit,
            committed,
            customAmount,
            reason
          }
        }));
      },
      
      updateProgress: () => {
        const state = get();
        
        if (!state.createdAt) return;
        
        // Calculate metrics
        const currentWeek = calculateWeekNumber(state.createdAt);
        const totalWeeks = state.timeline.months 
          ? calculateTotalWeeks(state.timeline.months) 
          : null;
        const daysRemaining = calculateDaysRemaining(state.timeline.targetDate);
        const timeProgressPercentage = calculateTimeProgress(
          state.createdAt, 
          state.timeline.targetDate
        );
        
        // For debt progress, we'd need original debt stored
        // For now, use 0 as placeholder
        const debtProgressPercentage = 0;
        
        set({
          progress: {
            currentWeek,
            totalWeeks,
            daysRemaining,
            timeProgressPercentage,
            debtProgressPercentage,
            lastMilestonePercentage: state.progress.lastMilestonePercentage
          }
        });
      },
      
      addMilestone: (percentage, label, emoji) => {
        const milestone = {
          percentage,
          label,
          emoji,
          date: new Date().toISOString()
        };
        
        set((state) => ({
          milestonesReached: [...state.milestonesReached, milestone],
          progress: {
            ...state.progress,
            lastMilestonePercentage: percentage
          }
        }));
      },
      
      addCheckIn: (checkIn) => {
        set((state) => ({
          weeklyCheckIns: [...state.weeklyCheckIns, checkIn]
        }));
      },
      
      addChallenge: (challenge) => {
        set((state) => ({
          challenges: [...state.challenges, challenge]
        }));
      },
      
      updateChallenge: (challengeId, updates) => {
        set((state) => ({
          challenges: state.challenges.map(c =>
            c.id === challengeId ? { ...c, ...updates } : c
          )
        }));
      },
      
      setAdminSettings: (settings) => {
        set((state) => ({
          adminSettings: {
            ...state.adminSettings!,
            ...settings
          }
        }));
      },
      
      initializeFromLocalStorage: () => {
        if (typeof window === 'undefined') return;
        
        const deviceID = localStorage.getItem('zdebt_device_id');
        const restoreCode = localStorage.getItem('zdebt_restore_code');
        const createdAt = localStorage.getItem('zdebt_created_at');
        const currency = localStorage.getItem('zdebt_currency') || 'USD';
        const storageMode = (localStorage.getItem('zdebt_storage_mode') || 'local') as 'local' | 'cloud';
        const isPremium = localStorage.getItem('zdebt_is_premium') === 'true';
        
        set({
          deviceID,
          restoreCode,
          createdAt,
          currency,
          storageMode,
          isPremium
        });
      },
      
      reset: () => {
        set(initialState);
      }
    }),
    {
      name: 'zdebt-user-store',
      partialize: (state) => ({
        // Only persist user selections, not identity info
        goal: state.goal,
        timeline: state.timeline,
        debts: state.debts,
        totalDebt: state.totalDebt,
        totalMonthlyPayment: state.totalMonthlyPayment,
        finances: state.finances,
        habit: state.habit,
        progress: state.progress,
        weeklyCheckIns: state.weeklyCheckIns,
        milestonesReached: state.milestonesReached,
        challenges: state.challenges,
        adminSettings: state.adminSettings,
        isPro: state.isPro,
        proExpiresAt: state.proExpiresAt,
        proSince: state.proSince
      })
    }
  )
);

