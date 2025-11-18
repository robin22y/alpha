'use client';

import { ExternalLink, Check, AlertCircle } from 'lucide-react';
import { AffiliatePartner, trackAffiliateClick } from '@/lib/affiliates';

interface AffiliateCardProps {
  partner: AffiliatePartner;
  featured?: boolean;
}

export default function AffiliateCard({ partner, featured = false }: AffiliateCardProps) {
  const handleClick = () => {
    trackAffiliateClick(partner.id);
    window.open(partner.affiliateLink, '_blank', 'noopener,noreferrer');
  };

  const getCategoryColor = () => {
    switch (partner.category) {
      case 'credit': 
        return { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' };
      case 'investing': 
        return { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' };
      case 'saving': 
        return { bg: '#E9D5FF', text: '#6B21A8', border: '#C084FC' };
      case 'budgeting': 
        return { bg: '#FED7AA', text: '#9A3412', border: '#FDBA74' };
      case 'comparison': 
        return { bg: '#FCE7F3', text: '#9F1239', border: '#F9A8D4' };
      default: 
        return { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' };
    }
  };

  const categoryColors = getCategoryColor();

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl"
      style={featured ? { border: '2px solid #37B24D' } : {}}
    >
      {featured && (
        <div className="text-white px-4 py-2 text-center text-sm font-semibold" style={{ backgroundColor: '#37B24D' }}>
          ⭐ Recommended for You
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2" style={{ color: '#000000' }}>{partner.name}</h3>
            <p className="text-sm mb-3" style={{ color: '#666666' }}>
              {partner.description}
            </p>
            <span 
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: categoryColors.bg,
                color: categoryColors.text,
                borderColor: categoryColors.border
              }}
            >
              {partner.category.charAt(0).toUpperCase() + partner.category.slice(1).replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-4">
          <p className="text-sm font-semibold mb-2" style={{ color: '#000000' }}>Benefits:</p>
          <ul className="space-y-2">
            {partner.benefits.slice(0, 4).map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <Check className="flex-shrink-0 mt-0.5" size={16} style={{ color: '#37B24D' }} />
                <span style={{ color: '#374151' }}>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <button
          onClick={handleClick}
          className="w-full mb-3 py-3 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
          style={{ backgroundColor: '#37B24D' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2F9E44'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#37B24D'}
        >
          <span>Learn More</span>
          <ExternalLink size={16} />
        </button>

        {/* Disclosure */}
        <div 
          className="flex items-start gap-2 p-3 border rounded text-xs"
          style={{ 
            backgroundColor: '#FEF3C7', 
            borderColor: '#FDE68A' 
          }}
        >
          <AlertCircle className="flex-shrink-0 mt-0.5" size={14} style={{ color: '#92400E' }} />
          <p style={{ color: '#78350F' }}>
            {partner.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}

