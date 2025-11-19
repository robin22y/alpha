'use client';

import type { IncomeIdeaCategory } from '@/lib/supabase/incomeIdeas';

interface IncomeIdeasFilterProps {
  activeCategory: IncomeIdeaCategory | 'all';
  onCategoryChange: (category: IncomeIdeaCategory | 'all') => void;
}

const CATEGORIES: { key: IncomeIdeaCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'fast', label: 'Fast' },
  { key: 'local', label: 'Local' },
  { key: 'sell', label: 'Sell' },
  { key: 'digital', label: 'Digital' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'rent', label: 'Rent' },
  { key: 'home', label: 'Home' },
  { key: 'teach', label: 'Teach' },
  { key: 'weekend', label: 'Weekend' },
  { key: 'transport', label: 'Transport' },
  { key: 'homebiz', label: 'Home Biz' },
];

export default function IncomeIdeasFilter({ activeCategory, onCategoryChange }: IncomeIdeasFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onCategoryChange(cat.key)}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
            activeCategory === cat.key
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

