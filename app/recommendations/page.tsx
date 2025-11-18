'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, AlertCircle, TrendingUp, CreditCard, PiggyBank, BarChart3 } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { 
  getRelevantPartners, 
  getUserAffiliateProfile,
  getPartnersByCategory,
  AFFILIATE_DISCLOSURE,
  AffiliatePartner
} from '@/lib/affiliates';
import AffiliateCard from '@/components/AffiliateCard';
import Navigation from '@/components/Navigation';
import PrivacyBadge from '@/components/PrivacyBadge';

export default function RecommendationsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const totalDebt = useUserStore((state) => state.totalDebt);
  const goal = useUserStore((state) => state.goal);
  const finances = useUserStore((state) => state.finances);

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

  // Get user profile
  const userProfile = getUserAffiliateProfile({ totalDebt, goal, finances });
  const relevantPartners = getRelevantPartners(userProfile);

  // Categorize partners
  const creditPartners = relevantPartners.filter(p => p.category === 'credit');
  const investingPartners = relevantPartners.filter(p => p.category === 'investing');
  const savingPartners = relevantPartners.filter(p => p.category === 'saving');
  const budgetingPartners = relevantPartners.filter(p => p.category === 'budgeting');
  const comparisonPartners = relevantPartners.filter(p => p.category === 'comparison');

  // Featured partners (top 3 most relevant)
  const featuredPartners = relevantPartners.slice(0, 3);

  return (
    <>
      <Navigation />
      <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, white, #DBEAFE, #E9D5FF)' }}>
        <PrivacyBadge />
        
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 mb-6"
            style={{ color: '#666666' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#8CE99A' }}>
              <Sparkles size={48} style={{ color: '#37B24D' }} />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#000000' }}>
              Tools That May Help
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#666666' }}>
              Based on your situation, these services might support your goals. 
              We earn a commission if you sign up—this keeps zdebt free.
            </p>
          </div>

          {/* Full Disclosure */}
          <div className="border-2 rounded-lg p-6 mb-8 max-w-4xl mx-auto" style={{ backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }}>
            <div className="flex items-start gap-3">
              <AlertCircle className="flex-shrink-0 mt-1" size={24} style={{ color: '#92400E' }} />
              <div>
                <p className="font-semibold mb-2" style={{ color: '#78350F' }}>Affiliate Disclosure</p>
                <p className="text-sm" style={{ color: '#78350F' }}>
                  {AFFILIATE_DISCLOSURE.long}
                </p>
              </div>
            </div>
          </div>

          {/* Featured Recommendations */}
          {featuredPartners.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#000000' }}>Recommended for You</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {featuredPartners.map((partner) => (
                  <AffiliateCard key={partner.id} partner={partner} featured />
                ))}
              </div>
            </div>
          )}

          {/* Credit & Debt */}
          {creditPartners.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard size={32} style={{ color: '#1E40AF' }} />
                <h2 className="text-2xl font-bold" style={{ color: '#000000' }}>Credit & Debt Help</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creditPartners.map((partner) => (
                  <AffiliateCard key={partner.id} partner={partner} />
                ))}
              </div>
            </div>
          )}

          {/* Investing */}
          {investingPartners.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={32} style={{ color: '#065F46' }} />
                <h2 className="text-2xl font-bold" style={{ color: '#000000' }}>Investing Platforms</h2>
              </div>
              <p className="text-sm mb-6" style={{ color: '#666666' }}>
                ⚠️ Capital at risk. Only invest money you can afford to lose. Past performance doesn't guarantee future results.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {investingPartners.map((partner) => (
                  <AffiliateCard key={partner.id} partner={partner} />
                ))}
              </div>
            </div>
          )}

          {/* Saving */}
          {savingPartners.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <PiggyBank size={32} style={{ color: '#6B21A8' }} />
                <h2 className="text-2xl font-bold" style={{ color: '#000000' }}>Saving Tools</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savingPartners.map((partner) => (
                  <AffiliateCard key={partner.id} partner={partner} />
                ))}
              </div>
            </div>
          )}

          {/* Budgeting */}
          {budgetingPartners.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 size={32} style={{ color: '#9A3412' }} />
                <h2 className="text-2xl font-bold" style={{ color: '#000000' }}>Budgeting Apps</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgetingPartners.map((partner) => (
                  <AffiliateCard key={partner.id} partner={partner} />
                ))}
              </div>
            </div>
          )}

          {/* Comparison */}
          {comparisonPartners.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#000000' }}>Price Comparison</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comparisonPartners.map((partner) => (
                  <AffiliateCard key={partner.id} partner={partner} />
                ))}
              </div>
            </div>
          )}

          {/* No recommendations */}
          {relevantPartners.length === 0 && (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <Sparkles className="mx-auto mb-4" size={48} style={{ color: '#9CA3AF' }} />
              <p className="mb-4" style={{ color: '#666666' }}>
                No specific recommendations right now. Keep progressing!
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 text-white rounded-lg font-semibold transition-all"
                style={{ backgroundColor: '#37B24D' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2F9E44'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#37B24D'}
              >
                Back to Dashboard
              </button>
            </div>
          )}

          {/* Bottom disclaimer */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-sm mb-2" style={{ color: '#374151' }}>
              <strong>Not Financial Advice</strong>
            </p>
            <p className="text-xs" style={{ color: '#666666' }}>
              These are tools that may help based on your stated goals. 
              Research independently before signing up. We don't provide financial advice. 
              Consult a qualified professional for personalized guidance.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

