'use client';

import { PieChart, Pie, Cell } from 'recharts';

interface IncomeChartProps {
  active: number;
  passive: number;
}

const COLORS = ['#FF6B6B', '#D1D5DB']; // Active (red), Passive (gray)

export default function IncomeChart({ active, passive }: IncomeChartProps) {
  const total = active + passive;
  
  // If no income, show empty state
  if (total === 0) {
    return (
      <div className="w-[120px] h-[120px] flex items-center justify-center">
        <div className="w-[80px] h-[80px] rounded-full border-4 border-gray-200"></div>
      </div>
    );
  }

  const data = [
    { name: 'Active', value: active },
    { name: 'Passive', value: passive },
  ];

  const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;

  return (
    <div className="relative">
      <PieChart width={120} height={120}>
        <Pie
          data={data}
          cx={60}
          cy={60}
          innerRadius={40}
          outerRadius={55}
          paddingAngle={2}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{activePercent}%</div>
          <div className="text-xs text-gray-500">Active</div>
        </div>
      </div>
    </div>
  );
}

