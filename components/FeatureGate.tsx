'use client';

import { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { canUseFeature, getUpgradeMessage } from '@/lib/proFeatures';
import { useUserStore } from '@/store/useUserStore';

interface FeatureGateProps {
  featureId: string;
  children?: ReactNode;
  fallback?: ReactNode;
  showInline?: boolean; // Show inline message vs redirect
}

export default function FeatureGate({ 
  featureId, 
  children, 
  fallback,
  showInline = false 
}: FeatureGateProps) {
  const router = useRouter();
  
  const createdAt = useUserStore((state) => state.createdAt);
  const isPro = useUserStore((state) => state.isPro);
  const proExpiresAt = useUserStore((state) => state.proExpiresAt);
  const adminSettings = useUserStore((state) => state.adminSettings);

  if (!createdAt) return null;

  const hasAccess = canUseFeature(featureId, {
    createdAt,
    isPro,
    proExpiresAt,
    adminSettings
  });

  if (hasAccess) {
    return <>{children || null}</>;
  }

  // Track blocked attempt
  const trackBlockedAttempt = () => {
    const blocked = JSON.parse(localStorage.getItem('zdebt_blocked_features') || '[]');
    blocked.push({
      featureId,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('zdebt_blocked_features', JSON.stringify(blocked.slice(-20)));
  };

  if (fallback) {
    return <>{fallback}</>;
  }

  const upgradeMessage = getUpgradeMessage(featureId);

  if (showInline) {
    return (
      <div className="rounded-lg border-2 p-6 text-center" style={{ 
        background: 'linear-gradient(to bottom right, #D1FAE5, #E7F5FF)',
        borderColor: '#37B24D'
      }}>
        <div className="inline-block p-3 bg-white rounded-full mb-4">
          <Lock size={32} style={{ color: '#2F9E44' }} />
        </div>
        <h3 className="text-xl font-bold mb-2">{upgradeMessage.title}</h3>
        <p className="text-gray-600 mb-4">{upgradeMessage.description}</p>
        <button
          onClick={() => {
            trackBlockedAttempt();
            router.push('/upgrade');
          }}
          className="px-6 py-3 text-white rounded-lg font-semibold transition-all"
          style={{ backgroundColor: '#37B24D' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2F9E44'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#37B24D'}
        >
          {upgradeMessage.ctaText}
        </button>
      </div>
    );
  }

  return null;
}

