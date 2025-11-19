'use client';

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface DebtSparklineProps {
  data: Array<{ month: number; balance: number }>;
  debtFreeDate: Date | null;
}

export default function DebtSparkline({ data, debtFreeDate }: DebtSparklineProps) {
  if (!data || data.length === 0 || !debtFreeDate) {
    return (
      <div className="w-full h-10 flex items-center justify-center text-gray-400 text-xs">
        No timeline data
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#22C55E"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <XAxis dataKey="month" hide />
            <YAxis hide />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-xs text-gray-600 whitespace-nowrap">
        {debtFreeDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
      </div>
    </div>
  );
}

