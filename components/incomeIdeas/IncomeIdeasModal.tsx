'use client';

import { X } from 'lucide-react';
import { useIncomeIdeas } from '@/hooks/useIncomeIdeas';
import IncomeIdeasFilter from './IncomeIdeasFilter';
import IncomeIdeaCard from './IncomeIdeaCard';

interface IncomeIdeasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IncomeIdeasModal({ isOpen, onClose }: IncomeIdeasModalProps) {
  const { ideas, loading, error, filterByCategory, activeCategory } = useIncomeIdeas();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Simple ways to boost your monthly income
            </h2>
            <p className="text-sm text-gray-600">
              These are general ideas anyone can try. Optional and educational only.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-4"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Filter */}
        <div className="mb-4">
          <IncomeIdeasFilter
            activeCategory={activeCategory}
            onCategoryChange={filterByCategory}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : ideas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No ideas available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {ideas.map((idea) => (
                <IncomeIdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          )}
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            This is not financial advice. These are optional examples only.
          </p>
        </div>
      </div>
    </div>
  );
}
