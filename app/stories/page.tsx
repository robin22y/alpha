'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Search, Filter } from 'lucide-react';
import { WEEKLY_STORIES, WeeklyStory } from '@/lib/checkIn';
import Navigation from '@/components/Navigation';
import PrivacyBadge from '@/components/PrivacyBadge';

type CategoryFilter = 'all' | 'success' | 'cautionary' | 'neutral';

export default function StoriesPage() {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter stories
  let filteredStories = WEEKLY_STORIES;

  if (categoryFilter !== 'all') {
    filteredStories = filteredStories.filter(s => s.category === categoryFilter);
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredStories = filteredStories.filter(s => 
      s.title.toLowerCase().includes(query) ||
      s.content.toLowerCase().includes(query) ||
      s.reflectionLine.toLowerCase().includes(query)
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'success':
        return {
          bg: '#D1FAE5',
          border: '#10B981',
          text: '#065F46',
          badge: { bg: '#10B981', text: '#FFFFFF' }
        };
      case 'cautionary':
        return {
          bg: '#FED7AA',
          border: '#EA580C',
          text: '#9A3412',
          badge: { bg: '#EA580C', text: '#FFFFFF' }
        };
      case 'neutral':
        return {
          bg: '#DBEAFE',
          border: '#2563EB',
          text: '#1E40AF',
          badge: { bg: '#2563EB', text: '#FFFFFF' }
        };
      default:
        return {
          bg: '#F3F4F6',
          border: '#6B7280',
          text: '#374151',
          badge: { bg: '#6B7280', text: '#FFFFFF' }
        };
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, white, #FED7AA, #E9D5FF)' }}>
        <PrivacyBadge />
        
        <div className="max-w-6xl mx-auto">
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
            <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#FED7AA' }}>
              <BookOpen size={48} style={{ color: '#EA580C' }} />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#000000' }}>
              Real Stories From Real People
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#666666' }}>
              Composite stories based on public financial statistics and common patterns. 
              Educational examples, not financial advice.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="border-2 rounded-lg p-4 mb-8 max-w-3xl mx-auto" style={{ backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }}>
            <p className="text-sm text-center" style={{ color: '#374151' }}>
              <strong>Important:</strong> These stories are composites based on publicly available 
              financial data and common experiences. Names are fictional. Situations are illustrative. 
              Not financial advice. Your situation is unique—consult professionals for guidance.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={20} style={{ color: '#9CA3AF' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stories..."
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#E5E7EB' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter size={20} style={{ color: '#666666' }} />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                  className="flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#E5E7EB' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                >
                  <option value="all">All Categories</option>
                  <option value="success">✨ Success Stories</option>
                  <option value="cautionary">⚠️ Cautionary Tales</option>
                  <option value="neutral">💭 Neutral</option>
                </select>
              </div>
            </div>

            {/* Category Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  categoryFilter === 'all'
                    ? ''
                    : ''
                }`}
                style={{
                  backgroundColor: categoryFilter === 'all' ? '#374151' : '#F3F4F6',
                  color: categoryFilter === 'all' ? '#FFFFFF' : '#374151'
                }}
                onMouseEnter={(e) => {
                  if (categoryFilter !== 'all') {
                    e.currentTarget.style.backgroundColor = '#E5E7EB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (categoryFilter !== 'all') {
                    e.currentTarget.style.backgroundColor = '#F3F4F6';
                  }
                }}
              >
                All Stories ({WEEKLY_STORIES.length})
              </button>

              <button
                onClick={() => setCategoryFilter('success')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  categoryFilter === 'success'
                    ? ''
                    : ''
                }`}
                style={{
                  backgroundColor: categoryFilter === 'success' ? '#10B981' : '#D1FAE5',
                  color: categoryFilter === 'success' ? '#FFFFFF' : '#065F46'
                }}
                onMouseEnter={(e) => {
                  if (categoryFilter !== 'success') {
                    e.currentTarget.style.backgroundColor = '#A7F3D0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (categoryFilter !== 'success') {
                    e.currentTarget.style.backgroundColor = '#D1FAE5';
                  }
                }}
              >
                ✨ Success ({WEEKLY_STORIES.filter(s => s.category === 'success').length})
              </button>

              <button
                onClick={() => setCategoryFilter('cautionary')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  categoryFilter === 'cautionary'
                    ? ''
                    : ''
                }`}
                style={{
                  backgroundColor: categoryFilter === 'cautionary' ? '#EA580C' : '#FED7AA',
                  color: categoryFilter === 'cautionary' ? '#FFFFFF' : '#9A3412'
                }}
                onMouseEnter={(e) => {
                  if (categoryFilter !== 'cautionary') {
                    e.currentTarget.style.backgroundColor = '#FCD34D';
                  }
                }}
                onMouseLeave={(e) => {
                  if (categoryFilter !== 'cautionary') {
                    e.currentTarget.style.backgroundColor = '#FED7AA';
                  }
                }}
              >
                ⚠️ Cautionary ({WEEKLY_STORIES.filter(s => s.category === 'cautionary').length})
              </button>

              <button
                onClick={() => setCategoryFilter('neutral')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  categoryFilter === 'neutral'
                    ? ''
                    : ''
                }`}
                style={{
                  backgroundColor: categoryFilter === 'neutral' ? '#2563EB' : '#DBEAFE',
                  color: categoryFilter === 'neutral' ? '#FFFFFF' : '#1E40AF'
                }}
                onMouseEnter={(e) => {
                  if (categoryFilter !== 'neutral') {
                    e.currentTarget.style.backgroundColor = '#BFDBFE';
                  }
                }}
                onMouseLeave={(e) => {
                  if (categoryFilter !== 'neutral') {
                    e.currentTarget.style.backgroundColor = '#DBEAFE';
                  }
                }}
              >
                💭 Neutral ({WEEKLY_STORIES.filter(s => s.category === 'neutral').length})
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p style={{ color: '#666666' }}>
              Showing <strong>{filteredStories.length}</strong> stor{filteredStories.length !== 1 ? 'ies' : 'y'}
            </p>
          </div>

          {/* Stories Grid */}
          {filteredStories.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <BookOpen className="mx-auto mb-4" size={48} style={{ color: '#9CA3AF' }} />
              <p className="mb-4" style={{ color: '#666666' }}>No stories match your search</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                }}
                className="px-6 py-3 text-white rounded-lg font-semibold transition-all"
                style={{ backgroundColor: '#4DABF7' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1C7ED6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4DABF7'}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {filteredStories.map(story => {
                const colors = getCategoryColor(story.category);
                
                return (
                  <div
                    key={story.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden border-2 hover:shadow-xl transition-shadow"
                    style={{ borderColor: colors.border }}
                  >
                    {/* Header */}
                    <div className="px-6 py-3" style={{ backgroundColor: colors.badge.bg }}>
                      <p className="font-semibold text-sm uppercase tracking-wide text-center" style={{ color: colors.badge.text }}>
                        {story.category === 'success' && '✨ Success Story'}
                        {story.category === 'cautionary' && '⚠️ Cautionary Tale'}
                        {story.category === 'neutral' && '💭 Food for Thought'}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-4" style={{ color: '#000000' }}>{story.title}</h3>
                      
                      <p className="leading-relaxed mb-4" style={{ color: '#374151' }}>
                        {story.content}
                      </p>

                      {/* Reflection */}
                      <div className="border-l-4 rounded p-4" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                        <p className="font-semibold text-sm mb-1" style={{ color: colors.text }}>
                          Reflect:
                        </p>
                        <p className="text-sm italic" style={{ color: '#374151' }}>
                          {story.reflectionLine}
                        </p>
                      </div>

                      {/* Source */}
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-center" style={{ color: '#999999' }}>
                          {story.source}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Info */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold mb-4 text-center" style={{ color: '#000000' }}>
              About These Stories
            </h3>
            <div className="max-w-3xl mx-auto space-y-4" style={{ color: '#374151' }}>
              <p>
                <strong>Where they come from:</strong> These stories are composites based on publicly 
                available financial statistics, UK debt data, and common financial patterns observed 
                across demographics.
              </p>
              <p>
                <strong>Why they matter:</strong> Real data shows these situations happen frequently. 
                Seeing patterns helps you recognize them in your own life and make informed choices.
              </p>
              <p>
                <strong>What they're NOT:</strong> Not guarantees, not predictions, not financial advice. 
                Your situation is unique and requires personalized consideration.
              </p>
              <p className="text-sm italic" style={{ color: '#666666' }}>
                If you need specific guidance, consult a qualified financial professional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

