'use client';

import type { IncomeIdea } from '@/lib/supabase/incomeIdeas';

interface IncomeIdeaCardProps {
  idea: IncomeIdea;
}

export default function IncomeIdeaCard({ idea }: IncomeIdeaCardProps) {
  // Truncate description to 90 chars
  const truncatedDescription = idea.description.length > 90 
    ? idea.description.substring(0, 90) + '...'
    : idea.description;

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition cursor-pointer">
      <h3 className="font-semibold text-gray-900 text-base">
        {idea.title}
      </h3>
      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
        {truncatedDescription}
      </p>
      <div className="flex gap-2 mt-3">
        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full capitalize">
          {idea.category}
        </span>
        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full capitalize">
          {idea.difficulty}
        </span>
      </div>
    </div>
  );
}
