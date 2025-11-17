'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Share2, Trophy } from 'lucide-react';

interface MilestoneCelebrationProps {
  milestone: {
    percentage: number;
    emoji: string;
    label: string;
  };
  onClose: () => void;
}

export default function MilestoneCelebration({ milestone, onClose }: MilestoneCelebrationProps) {
  useEffect(() => {
    // Fire confetti on mount
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    
    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Left side
      confetti({
        particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#51CF66', '#4DABF7', '#FCC419', '#FF6B6B', '#B197FC']
      });

      // Right side
      confetti({
        particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#51CF66', '#4DABF7', '#FCC419', '#FF6B6B', '#B197FC']
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'zdebt Milestone!',
        text: `I just reached ${milestone.percentage}% on my financial journey! ${milestone.emoji}`,
      }).catch(() => {
        // Silently fail if share cancelled
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `I just reached ${milestone.percentage}% on my financial journey! ${milestone.emoji}`
      );
      alert('Copied to clipboard!');
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[100]" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg transition-all z-10"
            style={{ color: '#666666' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="p-8 text-white text-center relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #51CF66, #4DABF7)' }}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            <div className="relative">
              <Trophy size={48} className="mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">
                Milestone Reached!
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                You're making real progress
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="text-8xl mb-4 animate-bounce">
                {milestone.emoji}
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#374151' }}>
                {milestone.label}
              </h3>
              <p className="text-5xl font-bold mb-2" style={{ color: '#37B24D' }}>
                {milestone.percentage}%
              </p>
              <p style={{ color: '#666666' }}>
                Complete
              </p>
            </div>

            {/* Encouraging message */}
            <div className="border-2 rounded-lg p-6 mb-6" style={{ backgroundColor: '#8CE99A', borderColor: '#51CF66' }}>
              <p className="font-medium mb-2" style={{ color: '#374151' }}>
                {getMilestoneMessage(milestone.percentage)}
              </p>
              <p className="text-sm" style={{ color: '#666666' }}>
                Keep going. Every step counts.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg font-semibold transition-all"
                style={{ backgroundColor: '#4DABF7' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1C7ED6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4DABF7'}
              >
                <Share2 size={20} />
                Share
              </button>
              
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 text-white rounded-lg font-semibold transition-all"
                style={{ backgroundColor: '#37B24D' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2F9E44'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#37B24D'}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </>
  );
}

/**
 * Get encouraging message based on milestone percentage
 */
function getMilestoneMessage(percentage: number): string {
  if (percentage === 25) return "You're a quarter of the way there!";
  if (percentage === 30) return "30% done—momentum is building!";
  if (percentage === 35) return "Over a third complete. Impressive!";
  if (percentage === 40) return "40% of the journey behind you!";
  if (percentage === 45) return "Nearly halfway—don't stop now!";
  if (percentage === 50) return "Halfway there! The finish line is in sight!";
  if (percentage === 60) return "60% complete—you're crushing it!";
  if (percentage === 70) return "70% done! The end is approaching!";
  if (percentage === 75) return "Three quarters finished—incredible progress!";
  if (percentage === 80) return "80% complete—you're almost there!";
  if (percentage === 90) return "90% done! Just one final push!";
  if (percentage === 100) return "100%! You've reached your goal!";
  
  return "Every step forward is progress!";
}

