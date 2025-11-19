'use client';

import { ReactNode } from 'react';

interface MetricCardProps {
  icon: ReactNode;
  iconBg: string;
  title: string;
  value: string;
  valueColor: string;
}

export default function MetricCard({ icon, iconBg, title, value, valueColor }: MetricCardProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm p-5 border border-gray-100 flex flex-col">
      {/* Icon + Title row */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <h3 className="font-semibold text-gray-800 text-sm">
          {title}
        </h3>
      </div>

      {/* Number */}
      <p className={`text-2xl font-semibold ${valueColor}`}>
        {value}
      </p>
    </div>
  );
}

