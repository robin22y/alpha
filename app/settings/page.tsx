'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Download, Upload, Trash2, Lock, Database, 
  Globe, Copy, Check, AlertTriangle, ArrowLeft, Smartphone, Clock, BarChart3
} from 'lucide-react';
import { getUserIdentifiers, formatRestoreCode } from '@/lib/deviceId';
import { 
  canRequestDeviceTransfer, 
  processDeviceTransfer,
  getDeviceTransferRequests 
} from '@/lib/subscription';
import { 
  exportToJSON, 
  importFromJSON, 
  deleteAllData, 
  getStorageSize,
  validateBackupFile 
} from '@/lib/storage';
import { getCurrency, setCurrency, CURRENCIES, CurrencyCode } from '@/lib/currency';
import { useUserStore } from '@/store/useUserStore';
import { hasProAccess } from '@/lib/proFeatures';
import PrivacyBadge from '@/components/PrivacyBadge';

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [storageSize, setStorageSize] = useState({ bytes: 0, kb: 0 });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [importing, setImporting] = useState(false);
  
  // Device transfer
  const [showTransferRequest, setShowTransferRequest] = useState(false);
  const [transferRestoreCode, setTransferRestoreCode] = useState('');
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [coolingPeriod, setCoolingPeriod] = useState<{ allowed: boolean; daysRemaining?: number } | null>(null);

  const identifiers = getUserIdentifiers();
  const currency = getCurrency();
  
  // Get PRO status
  const createdAt = useUserStore((state) => state.createdAt);
  const isPro = useUserStore((state) => state.isPro);
  const proExpiresAt = useUserStore((state) => state.proExpiresAt);
  const adminSettings = useUserStore((state) => state.adminSettings);
  
  const hasPro = createdAt ? hasProAccess({ createdAt, isPro, proExpiresAt, adminSettings }) : false;

  useEffect(() => {
    setStorageSize(getStorageSize());
    setSelectedCurrency(currency.code);
    
    // Check cooling period
    if (identifiers.deviceID) {
      const canTransfer = canRequestDeviceTransfer(identifiers.deviceID);
      setCoolingPeriod(canTransfer);
    }
  }, [currency.code, identifiers.deviceID]);

  const handleExport = () => {
    exportToJSON();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      // Validate file first
      const validation = await validateBackupFile(file);
      
      if (!validation.valid) {
        alert(`Invalid backup file: ${validation.error}`);
        setImporting(false);
        return;
      }

      // Import data
      await importFromJSON(file);
      
      alert('Data imported successfully! Reloading page...');
      window.location.reload();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import data. Please check the file and try again.');
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = () => {
    if (deleteInput.toLowerCase() === 'delete') {
      const success = deleteAllData();
      if (success) {
        alert('All data deleted. Redirecting to home...');
        window.location.href = '/';
      } else {
        alert('Failed to delete data. Please try again.');
      }
    }
  };

  const handleCopyCode = () => {
    if (identifiers.restoreCode) {
      navigator.clipboard.writeText(identifiers.restoreCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeviceTransferRequest = () => {
    setTransferError('');
    setTransferSuccess(false);
    
    if (!transferRestoreCode || !identifiers.restoreCode) {
      setTransferError('Please enter your restore code');
      return;
    }
    
    // Validate restore code matches
    const cleaned = transferRestoreCode.replace('-', '').toUpperCase();
    const currentCleaned = identifiers.restoreCode.replace('-', '').toUpperCase();
    
    if (cleaned !== currentCleaned) {
      setTransferError('Restore code does not match. Please check and try again.');
      return;
    }
    
    if (!identifiers.deviceID) {
      setTransferError('Device ID not found');
      return;
    }
    
    // Generate new device ID for transfer
    const newDeviceID = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    // Process transfer automatically (includes cooling period check)
    const result = processDeviceTransfer(
      identifiers.restoreCode,
      identifiers.deviceID,
      newDeviceID
    );
    
    if (!result.success) {
      setTransferError(result.error || 'Transfer failed');
      return;
    }
    
    // Update device ID in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('zdebt_device_id', newDeviceID);
    }
    
    setTransferSuccess(true);
    setTransferRestoreCode('');
    setShowTransferRequest(false);
    
    // Reload page after a short delay to apply new device ID
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleCurrencyChange = (code: CurrencyCode) => {
    setCurrency(code);
    setSelectedCurrency(code);
    alert('Currency updated! Page will reload to apply changes.');
    window.location.reload();
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, white, rgba(178, 242, 187, 0.3), rgba(116, 192, 252, 0.3))' }}>
      <PrivacyBadge />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 mb-4"
            style={{ color: '#6B7280' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#000000' }}>
            Settings & Privacy
          </h1>
          <p style={{ color: '#666666' }}>
            Manage your data and preferences
          </p>
        </div>

        {/* What We Know */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Database style={{ color: '#4DABF7' }} size={28} />
            <h2 className="text-xl font-bold" style={{ color: '#000000' }}>What We Know About You</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span style={{ color: '#666666' }}>Device ID:</span>
              <span className="font-mono text-xs">
                {identifiers.deviceID?.slice(0, 16)}...
              </span>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span style={{ color: '#666666' }}>Restore Code:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">
                  {identifiers.restoreCode ? formatRestoreCode(identifiers.restoreCode) : 'N/A'}
                </span>
                <button
                  onClick={handleCopyCode}
                  style={{ color: '#4DABF7' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#1C7ED6'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#4DABF7'}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span style={{ color: '#666666' }}>Created:</span>
              <span>
                {identifiers.createdAt 
                  ? new Date(identifiers.createdAt).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span style={{ color: '#666666' }}>Currency:</span>
              <span className="font-semibold">{currency.code} ({currency.symbol})</span>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span style={{ color: '#666666' }}>Storage Mode:</span>
              <span className="font-semibold capitalize">{identifiers.storageMode}</span>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span style={{ color: '#666666' }}>Email:</span>
              <span className="font-semibold" style={{ color: '#10B981' }}>
                Never collected ✓
              </span>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span style={{ color: '#666666' }}>Name:</span>
              <span className="font-semibold" style={{ color: '#10B981' }}>
                Never collected ✓
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span style={{ color: '#666666' }}>Data Size:</span>
              <span className="font-mono text-xs">
                {storageSize.kb} KB
              </span>
            </div>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe style={{ color: '#4DABF7' }} size={28} />
            <h2 className="text-xl font-bold" style={{ color: '#000000' }}>Currency</h2>
          </div>

          <p className="text-sm mb-4" style={{ color: '#666666' }}>
            Change how amounts are displayed. Your data is stored as percentages, 
            so switching currency won't affect your actual numbers.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.values(CURRENCIES).map((curr) => (
              <button
                key={curr.code}
                onClick={() => handleCurrencyChange(curr.code)}
                className={`p-3 border-2 rounded-lg transition-all ${
                  selectedCurrency === curr.code
                    ? ''
                    : ''
                }`}
                style={{
                  borderColor: selectedCurrency === curr.code ? '#4DABF7' : '#E5E7EB',
                  backgroundColor: selectedCurrency === curr.code ? '#74C0FC' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (selectedCurrency !== curr.code) {
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCurrency !== curr.code) {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }
                }}
              >
                <div className="text-2xl mb-1">{curr.symbol}</div>
                <div className="text-xs font-semibold">{curr.code}</div>
                <div className="text-xs" style={{ color: '#666666' }}>{curr.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Device Transfer */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone style={{ color: '#7C3AED' }} size={28} />
            <h2 className="text-xl font-bold" style={{ color: '#000000' }}>Device Transfer</h2>
          </div>

          <p className="text-sm mb-4" style={{ color: '#666666' }}>
            Moving to a new device? Transfer your account automatically by entering your restore code. 
            One user = one device. A 10-day cooling period applies between transfers.
          </p>

          {transferSuccess && (
            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#D1FAE5', borderColor: '#6EE7B7' }}>
              <p className="text-sm font-semibold" style={{ color: '#065F46' }}>
                ✓ Device transfer completed successfully!
              </p>
              <p className="text-xs mt-1" style={{ color: '#047857' }}>
                Your account has been transferred to this device. The page will reload shortly.
              </p>
            </div>
          )}

          {coolingPeriod && !coolingPeriod.allowed && (
            <div className="mb-4 p-4 rounded-lg border-2" style={{ backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }}>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={18} style={{ color: '#92400E' }} />
                <p className="text-sm font-semibold" style={{ color: '#92400E' }}>
                  Cooling Period Active
                </p>
              </div>
              <p className="text-xs" style={{ color: '#78350F' }}>
                You can transfer your device in {coolingPeriod.daysRemaining} more day(s).
              </p>
            </div>
          )}

          {!showTransferRequest && coolingPeriod?.allowed && (
            <button
              onClick={() => setShowTransferRequest(true)}
              className="w-full py-3 border-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              style={{ borderColor: '#7C3AED', color: '#7C3AED' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#7C3AED';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#7C3AED';
              }}
            >
              <Smartphone size={18} />
              Transfer to This Device
            </button>
          )}

          {showTransferRequest && (
            <div className="border-2 rounded-lg p-4" style={{ borderColor: '#7C3AED', backgroundColor: '#F3F4F6' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold" style={{ color: '#000000' }}>Device Transfer</h3>
                <button
                  onClick={() => {
                    setShowTransferRequest(false);
                    setTransferError('');
                    setTransferRestoreCode('');
                  }}
                  className="p-1 rounded"
                  style={{ color: '#666666' }}
                >
                  <AlertTriangle size={18} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>
                  Enter Your Restore Code *
                </label>
                <p className="text-xs mb-2" style={{ color: '#666666' }}>
                  This verifies you own the account. Your restore code: {identifiers.restoreCode ? formatRestoreCode(identifiers.restoreCode) : 'N/A'}
                </p>
                <input
                  type="text"
                  value={transferRestoreCode}
                  onChange={(e) => {
                    setTransferRestoreCode(e.target.value);
                    setTransferError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleDeviceTransferRequest();
                    }
                  }}
                  placeholder="ABCD-1234"
                  className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none font-mono"
                  style={{ borderColor: '#E5E7EB' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  autoComplete="off"
                />
              </div>

              {transferError && (
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2', borderColor: '#FECACA' }}>
                  <p className="text-sm" style={{ color: '#991B1B' }}>{transferError}</p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-xs" style={{ color: '#78350F' }}>
                  <strong>⚠️ Important:</strong> After transfer, your account will be moved to this device. 
                  You won't be able to access it on the old device anymore. A 10-day cooling period will apply before you can transfer again.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDeviceTransferRequest}
                  className="flex-1 py-2 rounded-lg font-semibold transition-all"
                  style={{ backgroundColor: '#7C3AED', color: '#FFFFFF' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6D28D9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
                >
                  Transfer Now
                </button>
                <button
                  onClick={() => {
                    setShowTransferRequest(false);
                    setTransferError('');
                    setTransferRestoreCode('');
                  }}
                  className="flex-1 py-2 rounded-lg font-semibold transition-all"
                  style={{ backgroundColor: '#E5E7EB', color: '#374151' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D1D5DB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock style={{ color: '#69DB7C' }} size={28} />
            <h2 className="text-xl font-bold" style={{ color: '#000000' }}>Your Data, Your Control</h2>
          </div>

          <div className="space-y-3">
            {/* Export */}
            <button
              onClick={handleExport}
              className="w-full p-4 border-2 rounded-lg transition-all text-left flex items-center gap-4"
              style={{ borderColor: '#E5E7EB' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4DABF7';
                e.currentTarget.style.backgroundColor = 'rgba(116, 192, 252, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#74C0FC' }}>
                <Download style={{ color: '#1C7ED6' }} size={24} />
              </div>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: '#000000' }}>Export All Data</p>
                <p className="text-sm" style={{ color: '#666666' }}>
                  Download everything as a JSON backup file
                </p>
              </div>
            </button>

            {/* Import */}
            <button
              onClick={handleImportClick}
              disabled={importing}
              className="w-full p-4 border-2 rounded-lg transition-all text-left flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: '#E5E7EB' }}
              onMouseEnter={(e) => {
                if (!importing) {
                  e.currentTarget.style.borderColor = '#4DABF7';
                  e.currentTarget.style.backgroundColor = 'rgba(116, 192, 252, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!importing) {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#DBEAFE' }}>
                <Upload style={{ color: '#1E40AF' }} size={24} />
              </div>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: '#000000' }}>
                  {importing ? 'Importing...' : 'Import Data'}
                </p>
                <p className="text-sm" style={{ color: '#666666' }}>
                  Restore from a backup JSON file
                </p>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Delete */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full p-4 border-2 rounded-lg transition-all text-left flex items-center gap-4"
              style={{ borderColor: '#FCA5A5' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#DC2626';
                e.currentTarget.style.backgroundColor = '#FEE2E2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#FCA5A5';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
                <Trash2 style={{ color: '#DC2626' }} size={24} />
              </div>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: '#991B1B' }}>Delete All Data</p>
                <p className="text-sm" style={{ color: '#B91C1C' }}>
                  Permanently erase everything (cannot be undone)
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        {hasPro && (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#000000' }}>Quick Actions</h2>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/export')}
                className="w-full p-4 border-2 rounded-lg transition-all flex items-center justify-between"
                style={{ borderColor: '#37B24D', backgroundColor: '#D1FAE5' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#37B24D';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#D1FAE5';
                  e.currentTarget.style.color = '#000000';
                }}
              >
                <div className="flex items-center gap-3">
                  <Download size={24} style={{ color: '#065F46' }} />
                  <div className="text-left">
                    <p className="font-semibold" style={{ color: '#000000' }}>Export Your Data</p>
                    <p className="text-sm opacity-80" style={{ color: '#666666' }}>Download as CSV or PDF</p>
                  </div>
                </div>
                <span style={{ color: '#666666' }}>→</span>
              </button>

              <button
                onClick={() => router.push('/analytics')}
                className="w-full p-4 border-2 rounded-lg transition-all flex items-center justify-between"
                style={{ borderColor: '#9333EA', backgroundColor: '#F3E8FF' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#9333EA';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3E8FF';
                  e.currentTarget.style.color = '#000000';
                }}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={24} style={{ color: '#9333EA' }} />
                  <div className="text-left">
                    <p className="font-semibold" style={{ color: '#000000' }}>View Analytics</p>
                    <p className="text-sm" style={{ color: '#666666' }}>Deep insights & projections</p>
                  </div>
                </div>
                <span style={{ color: '#666666' }}>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="border-2 rounded-lg p-6" style={{ backgroundColor: '#B2F2BB', borderColor: '#69DB7C' }}>
          <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#000000' }}>
            <Lock size={20} style={{ color: '#2F9E44' }} />
            Your Privacy
          </h3>
          <ul className="space-y-2 text-sm" style={{ color: '#374151' }}>
            <li>• All data stored locally on your device by default</li>
            <li>• Export/import lets you manage your own backups</li>
            <li>• We can't recover your data if you lose it (by design)</li>
            <li>• Your restore code is your only recovery method</li>
            <li>• Data is stored as percentages, not actual currency amounts</li>
          </ul>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle style={{ color: '#DC2626' }} size={32} />
              <h3 className="text-xl font-bold" style={{ color: '#000000' }}>Delete All Data?</h3>
            </div>

            <p className="mb-4" style={{ color: '#374151' }}>
              This will permanently delete:
            </p>
            <ul className="list-disc ml-6 mb-4 text-sm" style={{ color: '#374151' }}>
              <li>Your goals and timeline</li>
              <li>Financial information</li>
              <li>Debt details</li>
              <li>All progress and check-ins</li>
              <li>Your restore code</li>
            </ul>

            <div className="border rounded p-3 mb-4" style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }}>
              <p className="text-sm font-semibold" style={{ color: '#991B1B' }}>
                This cannot be undone. Make sure you have a backup!
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>
                Type "DELETE" to confirm:
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && deleteInput.toLowerCase() === 'delete') {
                    handleDelete();
                  }
                }}
                placeholder="DELETE"
                className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                style={{ borderColor: '#D1D5DB' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#DC2626'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
                autoComplete="off"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteInput('');
                }}
                className="flex-1 px-4 py-3 rounded-lg font-semibold"
                style={{ backgroundColor: '#E5E7EB', color: '#374151' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D1D5DB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteInput.toLowerCase() !== 'delete'}
                className="flex-1 px-4 py-3 text-white rounded-lg font-semibold disabled:cursor-not-allowed"
                style={{ backgroundColor: deleteInput.toLowerCase() === 'delete' ? '#DC2626' : '#D1D5DB' }}
                onMouseEnter={(e) => {
                  if (deleteInput.toLowerCase() === 'delete') {
                    e.currentTarget.style.backgroundColor = '#B91C1C';
                  }
                }}
                onMouseLeave={(e) => {
                  if (deleteInput.toLowerCase() === 'delete') {
                    e.currentTarget.style.backgroundColor = '#DC2626';
                  }
                }}
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

