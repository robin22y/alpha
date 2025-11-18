// components/ExportHistory.tsx
'use client';

import { useEffect, useState } from 'react';
import { FileText, FileSpreadsheet, Calendar } from 'lucide-react';

interface ExportRecord {
  type: string;
  format: string;
  timestamp: string;
}

export default function ExportHistory() {
  const [exports, setExports] = useState<ExportRecord[]>([]);

  useEffect(() => {
    const exportHistory = JSON.parse(localStorage.getItem('zdebt_exports') || '[]');
    setExports(exportHistory.slice(-10).reverse());
  }, []);

  if (exports.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No exports yet. Create your first export above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {exports.map((exp, idx) => (
        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {exp.format === 'csv' ? (
              <FileSpreadsheet style={{ color: '#059669' }} size={24} />
            ) : (
              <FileText style={{ color: '#DC2626' }} size={24} />
            )}
            <div>
              <p className="font-semibold capitalize text-sm" style={{ color: '#000000' }}>
                {exp.type.replace('_', ' ')} - {exp.format.toUpperCase()}
              </p>
              <p className="text-xs flex items-center gap-1" style={{ color: '#666666' }}>
                <Calendar size={12} />
                {new Date(exp.timestamp).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

