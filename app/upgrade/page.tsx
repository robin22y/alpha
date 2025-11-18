'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Crown, Sparkles, Info, Zap, BarChart3 } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { 
  PRICING_TIERS, 
  getTrialDaysRemaining, 
  getAnnualSavings,
  hasProAccess,
  getTrialStatusMessage 
} from '@/lib/proFeatures';
import { formatCurrency, getCurrency } from '@/lib/currency';
import Navigation from '@/components/Navigation';
import PrivacyBadge from '@/components/PrivacyBadge';

type BillingPeriod = 'monthly' | 'annual';

export default function UpgradePage() {
  const router = useRouter();
  const currency = getCurrency();
  const [mounted, setMounted] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('annual');
  
  const createdAt = useUserStore((state) => state.createdAt);
  const isPro = useUserStore((state) => state.isPro);
  const proExpiresAt = useUserStore((state) => state.proExpiresAt);
  const adminSettings = useUserStore((state) => state.adminSettings);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !createdAt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const hasPro = hasProAccess({ createdAt, isPro, proExpiresAt, adminSettings });
  const trialDays = getTrialDaysRemaining({ createdAt, isPro, adminSettings });
  const trialStatus = getTrialStatusMessage({ createdAt, isPro, adminSettings });
  const annualSavings = getAnnualSavings();

  const proTier = PRICING_TIERS[1];
  const currentPrice = billingPeriod === 'monthly' ? proTier.price.monthly : proTier.price.annual;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-white via-goal-light to-passive-light py-8 px-4">
        <PrivacyBadge />
        
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#37B24D' }}>
              <Crown size={48} className="text-white" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Upgrade to zdebt PRO
            </h1>
            <p className="text-gray-600 text-lg">
              Unlock powerful features. Support indie development.
            </p>

            {/* Trial Status */}
            {!hasPro && trialDays > 0 && (
              <div className="inline-block mt-4 px-6 py-3 bg-green-100 border-2 border-green-400 rounded-lg">
                <p className="text-green-800 font-semibold">
                  ✨ {trialStatus}
                </p>
              </div>
            )}

            {hasPro && (
              <div className="inline-block mt-4 px-6 py-3 rounded-lg border-2" style={{ backgroundColor: '#51CF66', borderColor: '#2F9E44' }}>
                <p className="text-white font-semibold">
                  👑 PRO Active
                </p>
              </div>
            )}
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-lg p-2 inline-flex gap-2">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  billingPeriod === 'monthly'
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={billingPeriod === 'monthly' ? { backgroundColor: '#37B24D' } : {}}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all relative ${
                  billingPeriod === 'annual'
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={billingPeriod === 'annual' ? { backgroundColor: '#37B24D' } : {}}
              >
                Annual
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save {formatCurrency(annualSavings, currency.code)}
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{formatCurrency(0, currency.code)}</span>
                <span className="text-gray-600">/forever</span>
              </div>

              <ul className="space-y-3 mb-6">
                {PRICING_TIERS[0].features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {PRICING_TIERS[0].limitations && (
                <div className="pt-6 border-t">
                  <p className="text-sm font-semibold mb-2 text-gray-600">Limitations:</p>
                  <ul className="space-y-2">
                    {PRICING_TIERS[0].limitations.map((limit, idx) => (
                      <li key={idx} className="text-sm text-gray-500">
                        • {limit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* PRO Tier */}
            <div className="rounded-lg shadow-2xl p-8 text-white relative overflow-hidden border-4" style={{ 
              background: 'linear-gradient(to bottom right, #37B24D, #2F9E44)',
              borderColor: '#2F9E44'
            }}>
              <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                POPULAR
              </div>

              <h3 className="text-2xl font-bold mb-2">PRO</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  {formatCurrency(currentPrice, currency.code)}
                </span>
                <span style={{ color: '#D1FAE5' }}>
                  /{billingPeriod === 'monthly' ? 'month' : 'year'}
                </span>
                {billingPeriod === 'annual' && (
                  <p className="text-sm mt-1" style={{ color: '#D1FAE5' }}>
                    That's {formatCurrency(currentPrice / 12, currency.code)}/month
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {proTier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="text-yellow-300 flex-shrink-0 mt-0.5" size={20} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {!hasPro && (
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full py-4 bg-white rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
                  style={{ color: '#2F9E44' }}
                >
                  Upgrade to PRO →
                </button>
              )}

              {hasPro && (
                <div className="text-center py-4 bg-white/20 rounded-lg">
                  <p className="font-semibold">You're already PRO! 👑</p>
                </div>
              )}
            </div>
          </div>

          {/* Why PRO? */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Why Upgrade?</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#D1FAE5' }}>
                  <Zap size={32} style={{ color: '#2F9E44' }} />
                </div>
                <h3 className="font-bold mb-2">No Limits</h3>
                <p className="text-sm text-gray-600">
                  Track unlimited debts, set custom goals, and access all features without restrictions.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#E7F5FF' }}>
                  <Sparkles size={32} style={{ color: '#1C7ED6' }} />
                </div>
                <h3 className="font-bold mb-2">Better Insights</h3>
                <p className="text-sm text-gray-600">
                  Advanced analytics, projections, and detailed breakdowns to understand your progress.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#F3E8FF' }}>
                  <BarChart3 size={32} style={{ color: '#9333EA' }} />
                </div>
                <h3 className="font-bold mb-2">Advanced Analytics</h3>
                <p className="text-sm text-gray-600">
                  Detailed insights, projections, and performance tracking to optimize your journey.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                  <Crown className="text-green-700" size={32} />
                </div>
                <h3 className="font-bold mb-2">Support Indie</h3>
                <p className="text-sm text-gray-600">
                  Built by one person. Your support keeps zdebt ad-free and privacy-first.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-6 max-w-3xl mx-auto">
              <div>
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Info size={20} style={{ color: '#37B24D' }} />
                  Can I try PRO before buying?
                </h3>
                <p className="text-gray-600 text-sm">
                  Yes! New users get 14 days of PRO features for free. No credit card required.
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Info size={20} style={{ color: '#37B24D' }} />
                  Can I cancel anytime?
                </h3>
                <p className="text-gray-600 text-sm">
                  Absolutely. Cancel anytime, no questions asked. You'll retain access until the end of your billing period.
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Info size={20} style={{ color: '#37B24D' }} />
                  What happens to my data if I downgrade?
                </h3>
                <p className="text-gray-600 text-sm">
                  Your data stays safe. Free tier limitations apply (3 debts max), but you won't lose anything. Export before downgrading if needed.
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Info size={20} style={{ color: '#37B24D' }} />
                  Is my payment information secure?
                </h3>
                <p className="text-gray-600 text-sm">
                  Yes. We use Stripe for secure payment processing. We never see or store your card details.
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Info size={20} style={{ color: '#37B24D' }} />
                  Why isn't zdebt completely free?
                </h3>
                <p className="text-gray-600 text-sm">
                  zdebt is built and maintained by one person. PRO subscriptions fund development, hosting, 
                  and keep the app ad-free and privacy-first. The free tier covers core debt tracking—PRO 
                  adds convenience and advanced features.
                </p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          {!hasPro && (
            <div className="rounded-lg shadow-lg p-8 text-white text-center" style={{ 
              background: 'linear-gradient(to right, #37B24D, #51CF66)'
            }}>
              <h2 className="text-3xl font-bold mb-3">
                Ready to Upgrade?
              </h2>
              <p className="mb-6" style={{ color: '#D1FAE5' }}>
                {trialDays > 0 
                  ? `You have ${trialDays} days left in your trial. Upgrade anytime to keep all features.`
                  : 'Unlock all features and support zdebt development.'
                }
              </p>
              <button
                onClick={() => router.push('/checkout')}
                className="px-8 py-4 bg-white rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-lg"
                style={{ color: '#2F9E44' }}
              >
                Upgrade to PRO →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

