'use client';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface ProgressChartProps {
  data: DataPoint[];
  title: string;
  maxValue?: number;
  showValues?: boolean;
}

export default function ProgressChart({ 
  data, 
  title, 
  maxValue, 
  showValues = true 
}: ProgressChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="font-bold mb-4">{title}</h3>
      
      <div className="space-y-3">
        {data.map((point, idx) => {
          const percentage = (point.value / max) * 100;
          const color = point.color || 'bg-goal';
          
          return (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{point.label}</span>
                {showValues && (
                  <span className="text-sm text-gray-600">{point.value}</span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${color}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

