'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { getStoryForWeek, markStoryShown, WeeklyStory } from '@/lib/checkIn';
import PrivacyBadge from '@/components/PrivacyBadge';

function StoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [story, setStory] = useState<WeeklyStory | null>(null);

  useEffect(() => {
    setMounted(true);
    
    const weekParam = searchParams.get('week');
    if (weekParam) {
      const week = parseInt(weekParam);
      const weekStory = getStoryForWeek(week);
      setStory(weekStory);
    }
  }, [searchParams]);

  // Mark story as shown in the last check-in
  useEffect(() => {
    if (mounted && story) {
      const weeklyCheckIns = useUserStore.getState().weeklyCheckIns;
      const lastCheckIn = weeklyCheckIns[weeklyCheckIns.length - 1];
      
      if (lastCheckIn && !lastCheckIn.storyShown) {
        const updatedCheckIn = markStoryShown(lastCheckIn, story.id);
        // Update in store
        const allCheckIns = weeklyCheckIns.slice(0, -1).concat(updatedCheckIn);
        useUserStore.setState({ weeklyCheckIns: allCheckIns });
      }
    }
  }, [mounted, story]);

  if (!mounted || !story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#51CF66' }}></div>
          <p style={{ color: '#666666' }}>Loading your story...</p>
        </div>
      </div>
    );
  }

  // Category colors
  const getCategoryColor = () => {
    switch (story.category) {
      case 'success':
        return {
          bg: 'linear-gradient(to bottom right, #8CE99A, #D1FAE5)',
          border: '#51CF66',
          icon: '#37B24D',
          badge: { bg: '#51CF66', text: '#FFFFFF' }
        };
      case 'cautionary':
        return {
          bg: 'linear-gradient(to bottom right, #FED7AA, #FEE2E2)',
          border: '#FB923C',
          icon: '#C2410C',
          badge: { bg: '#EA580C', text: '#FFFFFF' }
        };
      case 'neutral':
        return {
          bg: 'linear-gradient(to bottom right, #DBEAFE, #E9D5FF)',
          border: '#60A5FA',
          icon: '#1E40AF',
          badge: { bg: '#2563EB', text: '#FFFFFF' }
        };
    }
  };

  const colors = getCategoryColor();

  return (
    <div className="min-h-screen py-8 px-4 flex items-center justify-center" style={{ background: colors.bg }}>
      <PrivacyBadge />
      
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
            <BookOpen size={48} style={{ color: colors.icon }} />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#000000' }}>
            This Week's Story
          </h1>
          <p style={{ color: '#666666' }}>
            A moment from someone's financial journey
          </p>
        </div>

        {/* Story Card */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden mb-6" style={{ borderWidth: '4px', borderColor: colors.border }}>
          {/* Category Badge */}
          <div className="px-6 py-3 text-center" style={{ backgroundColor: colors.badge.bg }}>
            <p className="font-semibold text-sm uppercase tracking-wide" style={{ color: colors.badge.text }}>
              {story.category === 'success' && '✨ Success Story'}
              {story.category === 'cautionary' && '⚠️ Cautionary Tale'}
              {story.category === 'neutral' && '💭 Food for Thought'}
            </p>
          </div>

          {/* Story Content */}
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#000000' }}>
              {story.title}
            </h2>

            <div className="mb-6">
              <p className="leading-relaxed text-lg" style={{ color: '#374151' }}>
                {story.content}
              </p>
            </div>

            {/* Reflection */}
            <div className="rounded-lg p-6 mt-6" style={{ background: colors.bg, borderLeftWidth: '4px', borderLeftColor: colors.border }}>
              <div className="flex items-start gap-3">
                <Sparkles style={{ color: colors.icon }} size={24} />
                <div>
                  <p className="font-semibold mb-2" style={{ color: '#374151' }}>
                    Reflect:
                  </p>
                  <p className="text-lg italic" style={{ color: '#374151' }}>
                    {story.reflectionLine}
                  </p>
                </div>
              </div>
            </div>

            {/* Source */}
            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-xs" style={{ color: '#999999' }}>
                {story.source}
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-4 mb-6 text-sm text-center border">
          <p style={{ color: '#374151' }}>
            <strong>Educational content only.</strong> These stories are composites based on public 
            financial statistics and common patterns. Not financial advice. Your situation is unique.
          </p>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-3 text-white text-xl px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: '#37B24D' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2F9E44'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#37B24D'}
          >
            Continue to Dashboard
            <ArrowRight size={24} />
          </button>
        </div>

        {/* Next Story Hint */}
        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: '#666666' }}>
            💡 Check in next week for a new story
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#51CF66' }}></div>
          <p style={{ color: '#666666' }}>Loading your story...</p>
        </div>
      </div>
    }>
      <StoryContent />
    </Suspense>
  );
}

