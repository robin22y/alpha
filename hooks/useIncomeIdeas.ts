import { useState, useEffect } from 'react';
import { getIncomeIdeas, type IncomeIdea, type IncomeIdeaCategory } from '@/lib/supabase/incomeIdeas';

interface UseIncomeIdeasReturn {
  ideas: IncomeIdea[];
  loading: boolean;
  error: string | null;
  filterByCategory: (category: IncomeIdeaCategory | 'all') => void;
  activeCategory: IncomeIdeaCategory | 'all';
}

export function useIncomeIdeas(): UseIncomeIdeasReturn {
  const [ideas, setIdeas] = useState<IncomeIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<IncomeIdeaCategory | 'all'>('all');

  useEffect(() => {
    loadIdeas();
  }, [activeCategory]);

  const loadIdeas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getIncomeIdeas(activeCategory === 'all' ? undefined : activeCategory);
      // Sort by created_at DESC
      const sorted = data.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
      setIdeas(sorted);
    } catch (err) {
      setError('Failed to load income ideas');
      console.error('Error loading income ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = (category: IncomeIdeaCategory | 'all') => {
    setActiveCategory(category);
  };

  return {
    ideas,
    loading,
    error,
    filterByCategory,
    activeCategory,
  };
}

