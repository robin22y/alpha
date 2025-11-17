'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, CheckCircle, AlertTriangle, Clock, Sparkles } from 'lucide-react';
import { LIFE_MOMENTS, getMomentsByAge, LifeMoment } from '@/lib/lifeMoments';
import Navigation from '@/components/Navigation';
import PrivacyBadge from '@/components/PrivacyBadge';

type AgeFilter = 'all' | '20s' | '30s' | '40s' | '50s+';
type CategoryFilter = 'all' | 'missed' | 'possible' | 'stress' | 'delayed';

export default function LifeMomentsPage() {
  const router = useRouter();
  const [ageFilter, setAgeFilter] = useState<AgeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // Filter moments
  let filteredMoments = LIFE_MOMENTS;
  
  if (ageFilter !== 'all') {
    filteredMoments = getMomentsByAge(ageFilter);
  }
  
  if (categoryFilter !== 'all') {
    filteredMoments = filteredMoments.filter(m => m.category === categoryFilter);
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'missed': return <Heart size={20} />;
      case 'possible': return <CheckCircle size={20} />;
      case 'stress': return <AlertTriangle size={20} />;
      case 'delayed': return <Clock size={20} />;
      default: return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'missed': return {
        bg: '#FEE2E2',
        text: '#991B1B',
        border: '#FCA5A5'
      };
      case 'possible': return {
        bg: '#D1FAE5',
        text: '#065F46',
        border: '#6EE7B7'
      };
      case 'stress': return {
        bg: '#FED7AA',
        text: '#9A3412',
        border: '#FDBA74'
      };
      case 'delayed': return {
        bg: '#DBEAFE',
        text: '#1E40AF',
        border: '#93C5FD'
      };
      default: return {
        bg: '#F3F4F6',
        text: '#374151',
        border: '#D1D5DB'
      };
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, white, #E9D5FF, #DBEAFE)' }}>
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
            <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#E9D5FF' }}>
              <Heart size={48} style={{ color: '#7C3AED' }} />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#000000' }}>
              Life Moments
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#666666' }}>
              Real situations people face at different life stages. 
              Educational examples to help you think about your own journey.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="border-2 rounded-lg p-4 mb-8 max-w-3xl mx-auto" style={{ backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }}>
            <p className="text-sm text-center" style={{ color: '#374151' }}>
              <strong>Educational content only.</strong> These are illustrative scenarios based on 
              common life situations. Not financial advice. Your circumstances are unique.
            </p>
          </div>

          {/* Age Filter */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="font-semibold mb-4" style={{ color: '#000000' }}>Filter by Age</h3>
            <div className="flex flex-wrap gap-2">
              {(['all', '20s', '30s', '40s', '50s+'] as AgeFilter[]).map(age => (
                <button
                  key={age}
                  onClick={() => setAgeFilter(age)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    ageFilter === age
                      ? ''
                      : ''
                  }`}
                  style={{
                    backgroundColor: ageFilter === age ? '#7C3AED' : '#F3F4F6',
                    color: ageFilter === age ? '#FFFFFF' : '#374151'
                  }}
                  onMouseEnter={(e) => {
                    if (ageFilter !== age) {
                      e.currentTarget.style.backgroundColor = '#E5E7EB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (ageFilter !== age) {
                      e.currentTarget.style.backgroundColor = '#F3F4F6';
                    }
                  }}
                >
                  {age === 'all' ? 'All Ages' : age}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="font-semibold mb-4" style={{ color: '#000000' }}>Filter by Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
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
                All Types
              </button>
              
              <button
                onClick={() => setCategoryFilter('missed')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  categoryFilter === 'missed'
                    ? ''
                    : ''
                }`}
                style={{
                  backgroundColor: categoryFilter === 'missed' ? '#DC2626' : '#FEE2E2',
                  color: categoryFilter === 'missed' ? '#FFFFFF' : '#991B1B'
                }}
                onMouseEnter={(e) => {
                  if (categoryFilter !== 'missed') {
                    e.currentTarget.style.backgroundColor = '#FECACA';
                  }
                }}
                onMouseLeave={(e) => {
                  if (categoryFilter !== 'missed') {
                    e.currentTarget.style.backgroundColor = '#FEE2E2';
                  }
                }}
              >
                <Heart size={16} />
                Missed
              </button>

              <button
                onClick={() => setCategoryFilter('possible')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  categoryFilter === 'possible'
                    ? ''
                    : ''
                }`}
                style={{
                  backgroundColor: categoryFilter === 'possible' ? '#16A34A' : '#D1FAE5',
                  color: categoryFilter === 'possible' ? '#FFFFFF' : '#065F46'
                }}
                onMouseEnter={(e) => {
                  if (categoryFilter !== 'possible') {
                    e.currentTarget.style.backgroundColor = '#A7F3D0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (categoryFilter !== 'possible') {
                    e.currentTarget.style.backgroundColor = '#D1FAE5';
                  }
                }}
              >
                <CheckCircle size={16} />
                Possible
              </button>

              <button
                onClick={() => setCategoryFilter('stress')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  categoryFilter === 'stress'
                    ? ''
                    : ''
                }`}
                style={{
                  backgroundColor: categoryFilter === 'stress' ? '#EA580C' : '#FED7AA',
                  color: categoryFilter === 'stress' ? '#FFFFFF' : '#9A3412'
                }}
                onMouseEnter={(e) => {
                  if (categoryFilter !== 'stress') {
                    e.currentTarget.style.backgroundColor = '#FCD34D';
                  }
                }}
                onMouseLeave={(e) => {
                  if (categoryFilter !== 'stress') {
                    e.currentTarget.style.backgroundColor = '#FED7AA';
                  }
                }}
              >
                <AlertTriangle size={16} />
                Stress
              </button>

              <button
                onClick={() => setCategoryFilter('delayed')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  categoryFilter === 'delayed'
                    ? ''
                    : ''
                }`}
                style={{
                  backgroundColor: categoryFilter === 'delayed' ? '#2563EB' : '#DBEAFE',
                  color: categoryFilter === 'delayed' ? '#FFFFFF' : '#1E40AF'
                }}
                onMouseEnter={(e) => {
                  if (categoryFilter !== 'delayed') {
                    e.currentTarget.style.backgroundColor = '#BFDBFE';
                  }
                }}
                onMouseLeave={(e) => {
                  if (categoryFilter !== 'delayed') {
                    e.currentTarget.style.backgroundColor = '#DBEAFE';
                  }
                }}
              >
                <Clock size={16} />
                Delayed
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p style={{ color: '#666666' }}>
              Showing <strong>{filteredMoments.length}</strong> moment{filteredMoments.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Moments Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {filteredMoments.map(moment => {
              const colors = getCategoryColor(moment.category);
              
              return (
                <div
                  key={moment.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Header */}
                  <div className="p-4 border-b-4" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.text }}>
                        {moment.ageRange}
                      </span>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full border" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                        {getCategoryIcon(moment.category)}
                        <span className="text-xs font-semibold capitalize" style={{ color: colors.text }}>
                          {moment.category}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold" style={{ color: '#000000' }}>{moment.title}</h3>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-4">
                      <p className="leading-relaxed mb-3" style={{ color: '#374151' }}>
                        {moment.scenario}
                      </p>
                      <div className="rounded-lg p-3" style={{ backgroundColor: '#F9FAFB' }}>
                        <p className="text-sm italic" style={{ color: '#666666' }}>
                          {moment.context}
                        </p>
                      </div>
                    </div>

                    {/* Reflection */}
                    <div className="border-l-4 rounded p-4" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                      <div className="flex items-start gap-2">
                        <Sparkles size={20} className="flex-shrink-0 mt-1" style={{ color: colors.text }} />
                        <div>
                          <p className="font-semibold text-sm mb-1" style={{ color: colors.text }}>Reflect:</p>
                          <p className="text-sm italic" style={{ color: '#374151' }}>
                            {moment.reflection}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="rounded-lg shadow-lg p-8 text-white text-center" style={{ background: 'linear-gradient(to right, #7C3AED, #2563EB)' }}>
            <h3 className="text-2xl font-bold mb-3">
              Your Journey Is Unique
            </h3>
            <p className="mb-6 max-w-2xl mx-auto">
              These scenarios aren't predictions or prescriptions. 
              They're prompts to help you think about what matters to you and what you're working toward.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 bg-white rounded-lg font-semibold transition-all"
              style={{ color: '#7C3AED' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

