import jsPDF from 'jspdf';
import { DebtItem } from '@/store/useUserStore';
import { CheckIn } from '@/lib/checkIn';
import { Challenge } from '@/lib/challenges';

interface Milestone {
  percentage: number;
  date: string;
  label: string;
  emoji: string;
}

/**
 * Generate PDF for debts
 */
export function generateDebtsPDF(debts: DebtItem[]): jsPDF {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('zdebt - Debts Report', 20, 20);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 20, 30);
  
  // Debts table
  let y = 45;
  doc.setFontSize(12);
  doc.text('Current Debts', 20, y);
  y += 10;
  
  debts.forEach((debt, idx) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${idx + 1}. ${debt.name}`, 20, y);
    y += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Balance: £${debt.balance.toFixed(2)}`, 30, y);
    doc.text(`Rate: ${debt.interestRate}%`, 100, y);
    y += 6;
    
    doc.text(`Monthly Payment: £${debt.monthlyPayment.toFixed(2)}`, 30, y);
    y += 10;
  });
  
  // Total
  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Debt: £${totalDebt.toFixed(2)}`, 20, y);
  
  return doc;
}

/**
 * Generate PDF for check-ins
 */
export function generateCheckInsPDF(checkIns: CheckIn[]): jsPDF {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('zdebt - Check-Ins Report', 20, 20);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 20, 30);
  
  // Stats
  let y = 45;
  doc.setFontSize(12);
  doc.text('Summary', 20, y);
  y += 10;
  
  const totalCheckIns = checkIns.length;
  const totalExtraPayments = checkIns.reduce((sum, c) => sum + (c.extraPayment || 0), 0);
  const totalNewIncome = checkIns.reduce((sum, c) => sum + (c.newIncome || 0), 0);
  
  doc.setFontSize(10);
  doc.text(`Total Check-Ins: ${totalCheckIns}`, 20, y);
  y += 6;
  doc.text(`Total Extra Payments: £${totalExtraPayments.toFixed(2)}`, 20, y);
  y += 6;
  doc.text(`Total New Income: £${totalNewIncome.toFixed(2)}`, 20, y);
  y += 15;
  
  // Recent check-ins
  doc.setFontSize(12);
  doc.text('Recent Check-Ins', 20, y);
  y += 10;
  
  const recentCheckIns = checkIns.slice(-20).reverse();
  
  recentCheckIns.forEach((checkIn) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Week ${checkIn.week}`, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(checkIn.date).toLocaleDateString('en-GB'), 60, y);
    y += 6;
    
    if (checkIn.extraPayment) {
      doc.text(`Extra Payment: £${checkIn.extraPayment.toFixed(2)}`, 30, y);
      y += 6;
    }
    
    if (checkIn.newIncome) {
      doc.text(`New Income: £${checkIn.newIncome.toFixed(2)}`, 30, y);
      y += 6;
    }
    
    if (checkIn.notes) {
      doc.text(`Notes: ${checkIn.notes.substring(0, 60)}`, 30, y);
      y += 6;
    }
    
    y += 4;
  });
  
  return doc;
}

/**
 * Generate full comprehensive PDF
 */
export function generateFullPDF(data: {
  debts: DebtItem[];
  checkIns: CheckIn[];
  challenges: Challenge[];
  milestones: Milestone[];
  totalDebt: number;
  goal: { type: string | null; label: string };
  timeline: { months: number | null; label: string };
  finances: { monthlyIncome: number; monthlySpending: number; monthlyLeftover: number };
  createdAt: string;
}): jsPDF {
  const doc = new jsPDF();
  
  // Cover Page
  doc.setFontSize(24);
  doc.text('zdebt', 105, 60, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Financial Journey Report', 105, 75, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 105, 90, { align: 'center' });
  
  // Summary Page
  doc.addPage();
  let y = 20;
  
  doc.setFontSize(18);
  doc.text('Summary', 20, y);
  y += 15;
  
  doc.setFontSize(10);
  doc.text(`Journey Started: ${new Date(data.createdAt).toLocaleDateString('en-GB')}`, 20, y);
  y += 8;
  
  const goalType = data.goal.type ? data.goal.type.replace(/_/g, ' ') : 'Not set';
  doc.text(`Goal: ${goalType}`, 20, y);
  y += 8;
  
  const timelineMonths = data.timeline.months ? `${data.timeline.months} months` : 'Not set';
  doc.text(`Timeline: ${timelineMonths}`, 20, y);
  y += 15;
  
  // Finances
  doc.setFontSize(14);
  doc.text('Finances', 20, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.text(`Monthly Income: £${data.finances.monthlyIncome.toFixed(2)}`, 20, y);
  y += 6;
  doc.text(`Monthly Spending: £${data.finances.monthlySpending.toFixed(2)}`, 20, y);
  y += 6;
  doc.text(`Monthly Leftover: £${data.finances.monthlyLeftover.toFixed(2)}`, 20, y);
  y += 15;
  
  // Current Debt
  doc.setFontSize(14);
  doc.text('Current Debt', 20, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.text(`Total Debt: £${data.totalDebt.toFixed(2)}`, 20, y);
  y += 6;
  doc.text(`Number of Debts: ${data.debts.length}`, 20, y);
  y += 15;
  
  // Progress Metrics
  doc.setFontSize(14);
  doc.text('Progress', 20, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.text(`Check-Ins: ${data.checkIns.length}`, 20, y);
  y += 6;
  doc.text(`Challenges Completed: ${data.challenges.filter(c => c.completed).length}/${data.challenges.length}`, 20, y);
  y += 6;
  doc.text(`Milestones Reached: ${data.milestones.length}`, 20, y);
  y += 15;
  
  // Add detailed debt section
  if (data.debts.length > 0) {
    doc.addPage();
    y = 20;
    
    doc.setFontSize(14);
    doc.text('Debt Details', 20, y);
    y += 10;
    
    data.debts.forEach((debt, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}. ${debt.name}`, 20, y);
      y += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Balance: £${debt.balance.toFixed(2)}`, 30, y);
      doc.text(`Interest Rate: ${debt.interestRate}%`, 100, y);
      y += 6;
      
      doc.text(`Monthly Payment: £${debt.monthlyPayment.toFixed(2)}`, 30, y);
      y += 10;
    });
  }
  
  // Add check-ins section
  if (data.checkIns.length > 0) {
    doc.addPage();
    y = 20;
    
    doc.setFontSize(14);
    doc.text('Recent Check-Ins', 20, y);
    y += 10;
    
    const recentCheckIns = data.checkIns.slice(-10).reverse();
    
    recentCheckIns.forEach((checkIn) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Week ${checkIn.week}`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(checkIn.date).toLocaleDateString('en-GB'), 60, y);
      y += 6;
      
      if (checkIn.extraPayment) {
        doc.text(`Extra Payment: £${checkIn.extraPayment.toFixed(2)}`, 30, y);
        y += 6;
      }
      
      if (checkIn.notes) {
        doc.text(`Notes: ${checkIn.notes.substring(0, 50)}`, 30, y);
        y += 6;
      }
      
      y += 4;
    });
  }
  
  // Footer on all pages
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    doc.text('Generated by zdebt - Privacy-first debt tracking', 105, 290, { align: 'center' });
  }
  
  return doc;
}

/**
 * Download PDF file
 */
export function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(filename);
}

