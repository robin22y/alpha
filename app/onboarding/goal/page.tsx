
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Shield, PiggyBank, Lightbulb, Calendar } from 'lucide-react';
import { useUserStore, GoalType } from '@/store/useUserStore';
import StepIndicator from '@/components/StepIndicator';
import PrivacyBadge from '@/components/PrivacyBadge';

interface Goal {
  type: GoalType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const goals: Goal[] = [
  {
    type: 'reduce_stress',
    label: 'Reduce stress',
    description: 'Less worry about monthly payments. More peace of mind.',
    icon: <Heart size={32} />,
    color: 'bg-red-100 text-red-600'
  },
  {
    type: 'build_stability',
    label: 'Build stability',
    description: 'Create a solid foundation. Feel more secure.',
    icon: <Shield size={32} />,
    color: 'bg-trust-light text-trust-dark'
  },
  {
    type: 'increase_savings',
    label: 'Increase savings',
    description: 'Free up money each month. Build your safety net.',
    icon: <PiggyBank size={32} />,
    color: 'bg-passive-light text-passive-dark'
  },
  {
    type: 'explore_income',
    label: 'Explore extra income',
    description: 'See options to earn more. Speed up progress.',
    icon: <Lightbulb size={32} />,
    color: 'bg-yellow-100 text-yellow-700'
  },
  {
    type: 'plan_ahead',
    label: 'Plan ahead',
    description: 'Get clarity on your timeline. Make informed choices.',
    icon: <Calendar size={32} />,
    color: 'bg-goal-light text-goal-dark'
  }
];

const steps = ['Your Goal', 'Your Timeline', 'Your Income & Spending', 'Your Debt-Free Date'];

export default function GoalPage() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);
  const setGoal = useUserStore((state) => state.setGoal);

  const handleGoalSelect = (goal: Goal) => {
    setSelectedGoal(goal.type);
  };

  const handleContinue = () => {
    if (selectedGoal) {
      const goal = goals.find(g => g.type === selectedGoal);
      if (goal) {
        setGoal(selectedGoal, goal.label);
        router.push('/onboarding/timeline');
      }
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: '#F5F5F7' }}>
      <PrivacyBadge />
      
      <div className="max-w-4xl mx-auto">
        {/* Step Indicator */}
        <StepIndicator currentStep={1} steps={steps} />
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-black">
            What's your main goal?
          </h1>
          <p className="text-black text-lg">
            Choose what matters most to you right now
          </p>
        </div>

        {/* Goal Options */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {goals.map((goal) => (
            <button
              key={goal.type}
              onClick={() => handleGoalSelect(goal)}
              className={`text-left p-6 rounded-lg border-2 transition-all hover:shadow-lg
                ${selectedGoal === goal.type 
                  ? 'border-passive bg-passive-light/20 shadow-lg' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-lg ${goal.color} flex-shrink-0`}>
                  {goal.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-black">
                      {goal.label}
                    </h3>
                    {selectedGoal === goal.type && (
                      <div className="w-6 h-6 rounded-full bg-passive flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-black text-sm">
                    {goal.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Privacy reminder */}
        <div className="text-center mb-6">
          <p className="text-sm text-black">
            🔒 Your selection stays on your device
          </p>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedGoal}
            className="px-8 py-4 bg-passive-dark text-white rounded-lg font-semibold text-lg 
              disabled:bg-gray-300 disabled:cursor-not-allowed
              hover:bg-passive transition-all shadow-lg hover:shadow-xl
              disabled:shadow-none"
          >
            Continue →
          </button>
        </div>

        {/* Skip option */}
        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/onboarding/timeline')}
            className="text-sm text-black hover:text-gray-700 underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

