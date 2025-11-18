'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, FileText, FileSpreadsheet, Check, Lock } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { canUseFeature } from '@/lib/proFeatures';
import {
  ExportType,
  ExportFormat,
  generateFilename,
  prepareDebtsData,
  prepareCheckInsData,
  prepareChallengesData,
  prepareMilestonesData,
  prepareFullExportData,
  convertToCSV,
  downloadCSV,
  trackExport
} from '@/lib/export';
import {
  generateDebtsPDF,
  generateCheckInsPDF,
  generateFullPDF,
  downloadPDF
} from '@/lib/exportPDF';
import FeatureGate from '@/components/FeatureGate';
import Navigation from '@/components/Navigation';
import PrivacyBadge from '@/components/PrivacyBadge';
import ExportHistory from '@/components/ExportHistory';

export default function ExportPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedType, setSelectedType] = useState<ExportType>('full');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [exporting, setExporting] = useState(false);
  
  const createdAt = useUserStore((state) => state.createdAt);
  const isPro = useUserStore((state) => state.isPro);
  const proExpiresAt = useUserStore((state) => state.proExpiresAt);
  const adminSettings = useUserStore((state) => state.adminSettings);
  const debts = useUserStore((state) => state.debts);
  const totalDebt = useUserStore((state) => state.totalDebt);
  const weeklyCheckIns = useUserStore((state) => state.weeklyCheckIns);
  const challenges = useUserStore((state) => state.challenges);
  const milestonesReached = useUserStore((state) => state.milestonesReached);
  const goal = useUserStore((state) => state.goal);
  const timeline = useUserStore((state) => state.timeline);
  const finances = useUserStore((state) => state.finances);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !createdAt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const hasAccess = canUseFeature('export_data', {
    createdAt,
    isPro,
    proExpiresAt,
    adminSettings
  });

  // Feature gate for non-PRO users
  if (!hasAccess) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-white to-goal-light py-8 px-4">
          <PrivacyBadge />
          
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>

            <FeatureGate featureId="export_data" showInline>
              {/* This won't render due to feature gate */}
            </FeatureGate>
          </div>
        </div>
      </>
    );
  }

  const handleExport = async () => {
    setExporting(true);

    try {
      const filename = generateFilename(selectedType, selectedFormat);

      if (selectedFormat === 'csv') {
        let data: any[] = [];
        
        switch (selectedType) {
          case 'debts':
            data = prepareDebtsData(debts);
            break;
          case 'checkins':
            data = prepareCheckInsData(weeklyCheckIns);
            break;
          case 'challenges':
            data = prepareChallengesData(challenges);
            break;
          case 'milestones':
            data = prepareMilestonesData(milestonesReached);
            break;
          case 'full':
            const fullData = prepareFullExportData({
              debts,
              checkIns: weeklyCheckIns,
              challenges,
              milestones: milestonesReached,
              totalDebt,
              goal,
              timeline,
              finances
            });
            data = [fullData];
            break;
        }

        const csv = convertToCSV(data);
        downloadCSV(csv, filename);
      } else {
        // PDF export
        let doc;
        
        switch (selectedType) {
          case 'debts':
            doc = generateDebtsPDF(debts);
            break;
          case 'checkins':
            doc = generateCheckInsPDF(weeklyCheckIns);
            break;
          case 'full':
            doc = generateFullPDF({
              debts,
              checkIns: weeklyCheckIns,
              challenges,
              milestones: milestonesReached,
              totalDebt,
              goal,
              timeline,
              finances,
              createdAt
            });
            break;
          default:
            // For challenges/milestones, use full export
            doc = generateFullPDF({
              debts,
              checkIns: weeklyCheckIns,
              challenges,
              milestones: milestonesReached,
              totalDebt,
              goal,
              timeline,
              finances,
              createdAt
            });
        }

        downloadPDF(doc, filename);
      }

      trackExport(selectedType, selectedFormat);
      
      // Show success message
      setTimeout(() => {
        setExporting(false);
      }, 1000);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export. Please try again.');
      setExporting(false);
    }
  };

  const getItemCount = () => {
    switch (selectedType) {
      case 'debts': return debts.length;
      case 'checkins': return weeklyCheckIns.length;
      case 'challenges': return challenges.length;
      case 'milestones': return milestonesReached.length;
      case 'full': return 'All data';
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-white to-goal-light py-8 px-4">
        <PrivacyBadge />
        
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Download size={36} style={{ color: '#37B24D' }} />
              <h1 className="text-3xl md:text-4xl font-bold">Export Your Data</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Download your financial journey data for your records
            </p>
          </div>

          {/* Export Type Selection */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold mb-4">What to Export</h2>
            
            <div className="space-y-3">
              <button
                onClick={() => setSelectedType('full')}
                className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                  selectedType === 'full'
                    ? 'border-goal bg-goal-light'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={selectedType === 'full' ? { borderColor: '#37B24D', backgroundColor: '#D1FAE5' } : {}}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Full Export</p>
                    <p className="text-sm text-gray-600">Everything - debts, check-ins, challenges, milestones</p>
                  </div>
                  {selectedType === 'full' && <Check size={24} style={{ color: '#37B24D' }} />}
                </div>
              </button>

              <button
                onClick={() => setSelectedType('debts')}
                className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                  selectedType === 'debts'
                    ? 'border-goal bg-goal-light'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={selectedType === 'debts' ? { borderColor: '#37B24D', backgroundColor: '#D1FAE5' } : {}}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Debts Only</p>
                    <p className="text-sm text-gray-600">{debts.length} debt{debts.length !== 1 ? 's' : ''}</p>
                  </div>
                  {selectedType === 'debts' && <Check size={24} style={{ color: '#37B24D' }} />}
                </div>
              </button>

              <button
                onClick={() => setSelectedType('checkins')}
                className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                  selectedType === 'checkins'
                    ? 'border-goal bg-goal-light'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={selectedType === 'checkins' ? { borderColor: '#37B24D', backgroundColor: '#D1FAE5' } : {}}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Check-Ins Only</p>
                    <p className="text-sm text-gray-600">{weeklyCheckIns.length} check-in{weeklyCheckIns.length !== 1 ? 's' : ''}</p>
                  </div>
                  {selectedType === 'checkins' && <Check size={24} style={{ color: '#37B24D' }} />}
                </div>
              </button>

              <button
                onClick={() => setSelectedType('challenges')}
                className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                  selectedType === 'challenges'
                    ? 'border-goal bg-goal-light'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={selectedType === 'challenges' ? { borderColor: '#37B24D', backgroundColor: '#D1FAE5' } : {}}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Challenges Only</p>
                    <p className="text-sm text-gray-600">{challenges.length} challenge{challenges.length !== 1 ? 's' : ''}</p>
                  </div>
                  {selectedType === 'challenges' && <Check size={24} style={{ color: '#37B24D' }} />}
                </div>
              </button>

              <button
                onClick={() => setSelectedType('milestones')}
                className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                  selectedType === 'milestones'
                    ? 'border-goal bg-goal-light'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={selectedType === 'milestones' ? { borderColor: '#37B24D', backgroundColor: '#D1FAE5' } : {}}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Milestones Only</p>
                    <p className="text-sm text-gray-600">{milestonesReached.length} milestone{milestonesReached.length !== 1 ? 's' : ''}</p>
                  </div>
                  {selectedType === 'milestones' && <Check size={24} style={{ color: '#37B24D' }} />}
                </div>
              </button>
            </div>
          </div>

          {/* Format Selection */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold mb-4">Export Format</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedFormat('csv')}
                className={`p-6 border-2 rounded-lg transition-all ${
                  selectedFormat === 'csv'
                    ? 'border-goal bg-goal-light'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={selectedFormat === 'csv' ? { borderColor: '#37B24D', backgroundColor: '#D1FAE5' } : {}}
              >
                <FileSpreadsheet 
                  className="mx-auto mb-3" 
                  size={48} 
                  style={{ color: selectedFormat === 'csv' ? '#2F9E44' : '#9CA3AF' }}
                />
                <p className="font-semibold text-center">CSV</p>
                <p className="text-sm text-gray-600 text-center mt-1">
                  Spreadsheet format - open in Excel, Google Sheets, etc.
                </p>
              </button>

              <button
                onClick={() => setSelectedFormat('pdf')}
                className={`p-6 border-2 rounded-lg transition-all ${
                  selectedFormat === 'pdf'
                    ? 'border-goal bg-goal-light'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={selectedFormat === 'pdf' ? { borderColor: '#37B24D', backgroundColor: '#D1FAE5' } : {}}
              >
                <FileText 
                  className="mx-auto mb-3" 
                  size={48} 
                  style={{ color: selectedFormat === 'pdf' ? '#2F9E44' : '#9CA3AF' }}
                />
                <p className="font-semibold text-center">PDF</p>
                <p className="text-sm text-gray-600 text-center mt-1">
                  Document format - easy to read and print
                </p>
              </button>
            </div>
          </div>

          {/* Export Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold mb-4">Export Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Data Type:</span>
                <span className="font-semibold capitalize">{selectedType.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Format:</span>
                <span className="font-semibold uppercase">{selectedFormat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Items:</span>
                <span className="font-semibold">{getItemCount()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Filename:</span>
                <span className="font-semibold text-xs break-all">
                  {generateFilename(selectedType, selectedFormat)}
                </span>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-4 text-white rounded-lg font-bold text-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: exporting ? '#9CA3AF' : '#37B24D' }}
            onMouseEnter={(e) => {
              if (!exporting) {
                e.currentTarget.style.backgroundColor = '#2F9E44';
              }
            }}
            onMouseLeave={(e) => {
              if (!exporting) {
                e.currentTarget.style.backgroundColor = '#37B24D';
              }
            }}
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Preparing Export...</span>
              </>
            ) : (
              <>
                <Download size={24} />
                <span>Download {selectedFormat.toUpperCase()}</span>
              </>
            )}
          </button>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-6">
            <p className="text-sm text-gray-700 text-center">
              <strong>Privacy Note:</strong> Your data is exported directly to your device. 
              Nothing is sent to any servers. Your data stays yours.
            </p>
          </div>

          {/* Export History */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mt-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#000000' }}>Recent Exports</h2>
            
            <ExportHistory />
          </div>
        </div>
      </div>
    </>
  );
}

