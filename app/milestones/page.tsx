'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Lock, CheckCircle, Target } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { MILESTONES, getNextMilestone, getProgressToNextMilestone } from '@/lib/progress';
import Navigation from '@/components/Navigation';
import PrivacyBadge from '@/components/PrivacyBadge';

export default function MilestonesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const milestonesReached = useUserStore((state) => state.milestonesReached);
  const progress = useUserStore((state) => state.progress);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const currentPercentage = progress.timeProgressPercentage || 0;
  const nextMilestone = getNextMilestone(currentPercentage);
  const progressToNext = getProgressToNextMilestone(currentPercentage);

  const hasReachedMilestone = (percentage: number) => {
    return milestonesReached.some(m => m.percentage === percentage);
  };

  const getMilestoneDate = (percentage: number) => {
    const milestone = milestonesReached.find(m => m.percentage === percentage);
    return milestone?.date;
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, white, #E9D5FF, #DBEAFE)' }}>
        <PrivacyBadge />
        
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 mb-6"
            style={{ color: '#666666' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#374151'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#666666'; }}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#FEF3C7' }}>
              <Trophy size={48} style={{ color: '#D97706' }} />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#000000' }}>
              Your Milestones
            </h1>
            <p className="text-lg" style={{ color: '#666666' }}>
              Celebrating your progress along the way
            </p>
          </div>

          {/* Current Progress */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
            <div className="text-center mb-6">
              <p className="text-sm mb-2" style={{ color: '#666666' }}>Current Progress</p>
              <p className="text-5xl font-bold mb-2" style={{ color: '#37B24D' }}>
                {currentPercentage}%
              </p>
              <p style={{ color: '#666666' }}>
                {milestonesReached.length} milestone{milestonesReached.length !== 1 ? 's' : ''} reached
              </p>
            </div>

            {/* Overall progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: '#000000' }}>Overall Progress</span>
                <span className="text-sm" style={{ color: '#000000' }}>{currentPercentage}%</span>
              </div>
              <div className="w-full rounded-full h-4" style={{ backgroundColor: '#E5E7EB' }}>
                <div 
                  className="h-4 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${currentPercentage}%`,
                    background: 'linear-gradient(to right, #51CF66, #4DABF7)'
                  }}
                />
              </div>
            </div>

            {/* Next milestone */}
            {nextMilestone && progressToNext && (
              <div className="rounded-lg p-4 mt-6" style={{ backgroundColor: '#DBEAFE' }}>
                <div className="flex items-center gap-3 mb-3">
                  <Target style={{ color: '#1C7ED6' }} size={24} />
                  <div>
                    <p className="font-semibold" style={{ color: '#000000' }}>Next Milestone</p>
                    <p className="text-sm" style={{ color: '#666666' }}>
                      {nextMilestone.emoji} {nextMilestone.label}
                    </p>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm" style={{ color: '#000000' }}>Progress to {nextMilestone.percentage}%</span>
                    <span className="text-sm font-semibold" style={{ color: '#000000' }}>{progressToNext.percentage}%</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: '#DBEAFE' }}>
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressToNext.percentage}%`, backgroundColor: '#4DABF7' }}
                    />
                  </div>
                </div>
                
                <p className="text-xs mt-2" style={{ color: '#666666' }}>
                  {nextMilestone.percentage - currentPercentage}% to go
                </p>
              </div>
            )}
          </div>

          {/* All Milestones */}
          <div className="space-y-3">
            {MILESTONES.map((milestone) => {
              const isReached = currentPercentage >= milestone.percentage;
              const hasAchievement = hasReachedMilestone(milestone.percentage);
              const achievementDate = getMilestoneDate(milestone.percentage);

              return (
                <div
                  key={milestone.percentage}
                  className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all ${
                    isReached ? 'border-2' : 'opacity-60'
                  }`}
                  style={{ borderColor: isReached ? '#51CF66' : undefined }}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                        isReached 
                          ? '' 
                          : ''
                      }`} style={{ backgroundColor: isReached ? '#8CE99A' : '#F3F4F6' }}>
                        {isReached ? milestone.emoji : <Lock className="text-gray-400" size={28} />}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold" style={{ color: '#000000' }}>{milestone.label}</h3>
                          {isReached && (
                            <CheckCircle style={{ color: '#51CF66' }} size={20} />
                          )}
                        </div>
                        <p className="text-2xl font-bold mb-1" style={{ color: '#37B24D' }}>
                          {milestone.percentage}%
                        </p>
                        {achievementDate && (
                          <p className="text-xs" style={{ color: '#666666' }}>
                            Reached on {new Date(achievementDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                        {!isReached && (
                          <p className="text-sm" style={{ color: '#999999' }}>
                            {milestone.percentage - currentPercentage}% away
                          </p>
                        )}
                      </div>

                      {/* Status badge */}
                      <div className={`flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm ${
                        isReached 
                          ? '' 
                          : ''
                      }`} style={{ 
                        backgroundColor: isReached ? '#51CF66' : '#E5E7EB',
                        color: isReached ? '#FFFFFF' : '#666666'
                      }}>
                        {isReached ? 'Achieved' : 'Locked'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Encouragement */}
          <div className="rounded-lg shadow-lg p-8 mt-8 text-white text-center" style={{ background: 'linear-gradient(to right, #51CF66, #4DABF7)' }}>
            <Trophy size={48} className="mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3">
              Every Milestone Matters
            </h3>
            <p className="max-w-2xl mx-auto">
              Progress isn't always linear, but every step forward is worth celebrating. 
              Keep going—you're building something meaningful.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

