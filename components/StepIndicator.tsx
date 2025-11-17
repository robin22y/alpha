'use client';

import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      {/* Progress bar */}
      <div className="relative">
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200" />
        <div 
          className="absolute top-5 left-0 h-1 bg-passive transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
        
        {/* Step circles */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            
            return (
              <div key={stepNumber} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all
                    ${isCompleted ? 'bg-passive text-white' : ''}
                    ${isCurrent ? 'bg-goal text-white ring-4 ring-goal-light' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-500' : ''}
                  `}
                >
                  {isCompleted ? <Check size={20} /> : stepNumber}
                </div>
                
                {/* Step label - hide on mobile for space */}
                <span className={`mt-2 text-xs md:text-sm font-medium text-center hidden sm:block
                  ${isCurrent ? 'text-goal-dark' : 'text-gray-500'}
                `}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

