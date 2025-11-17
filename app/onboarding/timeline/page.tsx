'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, TrendingUp, Clock, Coffee, Zap } from 'lucide-react';
import { useUserStore, TimelineMonths } from '@/store/useUserStore';
import StepIndicator from '@/components/StepIndicator';
import PrivacyBadge from '@/components/PrivacyBadge';

interface TimelineOption {
  months: TimelineMonths;
  label: string;
  description: string;
  icon: React.ReactNode;
  effort: string;
  popular?: boolean;
}

const steps = ['Your Goal', 'Timeline', 'Details', 'Your Date'];

export default function TimelinePage() {
  const router = useRouter();
  const [selectedTimeline, setSelectedTimeline] = useState<TimelineMonths>(null);
  const setTimeline = useUserStore((state) => state.setTimeline);
  const goal = useUserStore((state) => state.goal);

  // Calculate target dates
  const getTargetDate = (months: number | null): string => {
    if (months === null) return 'No fixed deadline';
    
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    
    return date.toLocaleDateString('en-GB', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const timelineOptions: TimelineOption[] = [
    {
      months: 6,
      label: '6 months',
      description: 'Aggressive pace. High commitment needed.',
      icon: <Zap size={28} />,
      effort: 'High effort'
    },
    {
      months: 12,
      label: '1 year',
      description: 'Focused approach. Steady progress.',
      icon: <TrendingUp size={28} />,
      effort: 'Medium effort'
    },
    {
      months: 24,
      label: '2 years',
      description: 'Realistic and sustainable. Balanced lifestyle.',
      icon: <Calendar size={28} />,
      effort: 'Balanced',
      popular: true
    },
    {
      months: 48,
      label: '3-5 years',
      description: 'Gradual pace. Lower monthly pressure.',
      icon: <Coffee size={28} />,
      effort: 'Low pressure'
    },
    {
      months: null,
      label: 'No pressure',
      description: 'Take as long as you need. See what is possible.',
      icon: <Clock size={28} />,
      effort: 'Flexible'
    }
  ];

  const handleTimelineSelect = (option: TimelineOption) => {
    setSelectedTimeline(option.months);
  };

  const handleContinue = () => {
    if (selectedTimeline !== undefined) {
      const option = timelineOptions.find(o => o.months === selectedTimeline);
      if (option) {
        setTimeline(selectedTimeline, option.label);
        router.push('/onboarding/finances');
      }
    }
  };

  const handleBack = () => {
    router.push('/onboarding/goal');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-trust-light/30 to-goal-light/30 py-8 px-4">
      <PrivacyBadge />
      
      <div className="max-w-4xl mx-auto">
        {/* Step Indicator */}
        <StepIndicator currentStep={2} steps={steps} />
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-black">
            What's your timeline?
          </h1>
          <p className="text-black text-lg mb-2">
            When would you like to reach your goal?
          </p>
          {goal.label && (
            <p className="text-sm text-black">
              Goal: <span className="font-semibold text-passive-dark">{goal.label}</span>
            </p>
          )}
        </div>

        {/* Timeline Options */}
        <div className="space-y-3 mb-8">
          {timelineOptions.map((option) => {
            const isSelected = selectedTimeline === option.months;
            const targetDate = getTargetDate(option.months);
            
            return (
              <button
                key={option.label}
                onClick={() => handleTimelineSelect(option)}
                className={`w-full text-left p-5 rounded-lg border-2 transition-all hover:shadow-lg relative
                  ${isSelected 
                    ? 'border-passive bg-passive-light/20 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                {/* Popular badge */}
                {option.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-goal text-white px-3 py-1 rounded-full text-xs font-semibold">
                    ⭐ Most choose this
                  </div>
                )}
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg flex-shrink-0 ${
                    isSelected ? 'bg-passive text-white' : 'bg-goal-light text-goal-dark'
                  }`}>
                    {option.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold text-black">
                        {option.label}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isSelected ? 'bg-passive text-white' : 'bg-gray-100 text-black'
                      }`}>
                        {option.effort}
                      </span>
                    </div>
                    
                    <p className="text-black text-sm mb-2">
                      {option.description}
                    </p>
                    
                    <p className={`text-sm font-semibold ${
                      isSelected ? 'text-passive-dark' : 'text-goal-dark'
                    }`}>
                      {option.months !== null && '📅 '}
                      Estimated target: {targetDate}
                    </p>
                  </div>
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-passive flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-black text-center">
            💡 These are estimated target dates for planning purposes. 
            Actual timeline depends on your specific situation and commitments.
          </p>
        </div>

        {/* Privacy reminder */}
        <div className="text-center mb-6">
          <p className="text-sm text-black">
            🔒 Your timeline is private and stored on your device
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleBack}
            className="px-8 py-4 bg-gray-200 text-black rounded-lg font-semibold text-lg 
              hover:bg-gray-300 transition-all"
          >
            ← Back
          </button>
          
          <button
            onClick={handleContinue}
            disabled={selectedTimeline === undefined}
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
            onClick={() => router.push('/onboarding/finances')}
            className="text-sm text-black hover:text-gray-700 underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

