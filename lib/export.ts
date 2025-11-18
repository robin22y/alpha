import { DebtItem } from '@/store/useUserStore';
import { CheckIn } from '@/lib/checkIn';
import { Challenge } from '@/lib/challenges';

export type ExportFormat = 'csv' | 'pdf';
export type ExportType = 'full' | 'debts' | 'checkins' | 'challenges' | 'milestones';

export interface ExportOptions {
  format: ExportFormat;
  type: ExportType;
  includeHeaders?: boolean;
  filename?: string;
}

interface Milestone {
  percentage: number;
  date: string;
  label: string;
  emoji: string;
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(type: ExportType, format: ExportFormat): string {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `zdebt-${type}-${timestamp}.${format}`;
}

/**
 * Prepare debts data for export
 */
export function prepareDebtsData(debts: DebtItem[]): any[] {
  return debts.map(debt => ({
    'Debt Name': debt.name,
    'Debt Type': debt.type,
    'Balance': debt.balance,
    'Interest Rate (%)': debt.interestRate,
    'Monthly Payment': debt.monthlyPayment
  }));
}

/**
 * Prepare check-ins data for export
 */
export function prepareCheckInsData(checkIns: CheckIn[]): any[] {
  return checkIns.map(checkIn => ({
    'Week': checkIn.week,
    'Date': new Date(checkIn.date).toLocaleDateString('en-GB'),
    'Mood': checkIn.moodEmoji,
    'Extra Payment': checkIn.extraPayment || 0,
    'New Income': checkIn.newIncome || 0,
    'Notes': checkIn.notes || ''
  }));
}

/**
 * Prepare challenges data for export
 */
export function prepareChallengesData(challenges: Challenge[]): any[] {
  return challenges.map(challenge => ({
    'Week': challenge.week,
    'Type': challenge.type,
    'Title': challenge.title,
    'Target Amount': challenge.targetAmount,
    'Accepted': challenge.accepted ? 'Yes' : 'No',
    'Completed': challenge.completed ? 'Yes' : 'No',
    'Actual Amount': challenge.actualAmount || 0,
    'Completed Date': challenge.completedDate 
      ? new Date(challenge.completedDate).toLocaleDateString('en-GB')
      : ''
  }));
}

/**
 * Prepare milestones data for export
 */
export function prepareMilestonesData(milestones: Milestone[]): any[] {
  return milestones.map(milestone => ({
    'Percentage': milestone.percentage,
    'Label': milestone.label,
    'Emoji': milestone.emoji,
    'Date Achieved': new Date(milestone.date).toLocaleDateString('en-GB')
  }));
}

/**
 * Prepare full export data
 */
export function prepareFullExportData(data: {
  debts: DebtItem[];
  checkIns: CheckIn[];
  challenges: Challenge[];
  milestones: Milestone[];
  totalDebt: number;
  goal: { type: string | null; label: string };
  timeline: { months: number | null; label: string };
  finances: { monthlyIncome: number; monthlySpending: number; monthlyLeftover: number };
}): any {
  return {
    'Export Date': new Date().toISOString(),
    'Total Debt': data.totalDebt,
    'Goal Type': data.goal.type || 'N/A',
    'Goal Label': data.goal.label || 'N/A',
    'Timeline (Months)': data.timeline.months || 'N/A',
    'Timeline Label': data.timeline.label || 'N/A',
    'Monthly Income': data.finances.monthlyIncome,
    'Monthly Spending': data.finances.monthlySpending,
    'Monthly Leftover': data.finances.monthlyLeftover,
    'Debts Count': data.debts.length,
    'Check-Ins Count': data.checkIns.length,
    'Challenges Count': data.challenges.length,
    'Milestones Count': data.milestones.length
  };
}

/**
 * Convert data to CSV string
 */
export function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Escape values containing commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Track export event
 */
export function trackExport(type: ExportType, format: ExportFormat): void {
  if (typeof window === 'undefined') return;
  
  const exports = JSON.parse(localStorage.getItem('zdebt_exports') || '[]');
  exports.push({
    type,
    format,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('zdebt_exports', JSON.stringify(exports.slice(-50)));
}

