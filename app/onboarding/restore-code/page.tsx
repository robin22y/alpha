
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, Lock, Mail, AlertTriangle, ArrowRight } from 'lucide-react';
import { getUserIdentifiers, formatRestoreCode } from '@/lib/deviceId';
import PrivacyBadge from '@/components/PrivacyBadge';

export default function RestoreCodePage() {
  const router = useRouter();
  const { restoreCode } = getUserIdentifiers();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const formattedCode = restoreCode ? formatRestoreCode(restoreCode) : '';

  const handleCopy = () => {
    if (restoreCode) {
      navigator.clipboard.writeText(restoreCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendEmail = async () => {
    // TODO: Implement email sending in future
    // For MVP, just show confirmation
    setEmailSent(true);
  };

  const handleContinue = () => {
    if (saved) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, #B2F2BB, rgba(129, 233, 154, 0.3), rgba(116, 192, 252, 0.3))' }}>
      <PrivacyBadge />
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#69DB7C' }}>
            <Lock size={48} style={{ color: '#FFFFFF' }} />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#000000' }}>
            Your Restore Code
          </h1>
          <p className="text-lg" style={{ color: '#666666' }}>
            This is your key to access your data anywhere
          </p>
        </div>

        {/* Restore code display */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <p className="text-sm mb-3" style={{ color: '#666666' }}>Your unique code:</p>
            <div className="rounded-lg p-6 mb-4" style={{ backgroundColor: '#F9FAFB' }}>
              <p className="text-4xl md:text-5xl font-bold font-mono tracking-wider" style={{ color: '#2F9E44' }}>
                {formattedCode || 'Not available'}
              </p>
            </div>
            
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold transition-all"
              style={{ backgroundColor: '#69DB7C' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2F9E44'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#69DB7C'}
              disabled={!restoreCode}
            >
              {copied ? (
                <>
                  <Check size={20} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={20} />
                  Copy Code
                </>
              )}
            </button>
          </div>

          {/* Explainer */}
          <div className="rounded-lg p-4" style={{ backgroundColor: '#B2F2BB' }}>
            <p className="font-semibold mb-2 text-center" style={{ color: '#000000' }}>🔑 What is this?</p>
            <ul className="space-y-2 text-sm" style={{ color: '#374151' }}>
              <li>• Use it to restore your data on any device</li>
              <li>• Works on phone, tablet, or computer</li>
              <li>• Not linked to your name or email</li>
              <li>• Keep it safe (treat it like a password)</li>
            </ul>
          </div>
        </div>

        {/* Optional email */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <Mail style={{ color: '#4DABF7' }} className="mt-1" size={24} />
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2" style={{ color: '#000000' }}>
                Optional: Email me my code
              </h3>
              <p className="text-sm mb-4" style={{ color: '#666666' }}>
                We'll send your restore code to your email. 
                We won't use it for anything else.
              </p>
              
              {!emailSent ? (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-2 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: '#E5E7EB' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#4DABF7'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  />
                  <button
                    onClick={handleSendEmail}
                    disabled={!email}
                    className="px-6 py-2 text-white rounded-lg font-semibold transition-all"
                    style={{ backgroundColor: email ? '#4DABF7' : '#D1D5DB' }}
                    onMouseEnter={(e) => {
                      if (email) e.currentTarget.style.backgroundColor = '#1C7ED6';
                    }}
                    onMouseLeave={(e) => {
                      if (email) e.currentTarget.style.backgroundColor = '#4DABF7';
                    }}
                  >
                    Send
                  </button>
                </div>
              ) : (
                <div className="border rounded-lg p-3 text-center" style={{ backgroundColor: '#D1FAE5', borderColor: '#10B981' }}>
                  <p className="text-sm flex items-center justify-center gap-2" style={{ color: '#065F46' }}>
                    <Check size={16} />
                    Code sent to {email}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-3 mt-4" style={{ backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }}>
            <p className="text-xs flex items-start gap-2" style={{ color: '#374151' }}>
              <Lock size={14} className="mt-0.5 flex-shrink-0" />
              <span>
                <strong>Privacy note:</strong> If you provide email, we store it 
                separately from your financial data. We can't connect 
                "email@example.com" to "Device xyz123".
              </span>
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="border-2 rounded-lg p-6 mb-6" style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="flex-shrink-0 mt-1" size={24} style={{ color: '#DC2626' }} />
            <div>
              <p className="font-bold mb-2" style={{ color: '#991B1B' }}>
                Important: Save this code!
              </p>
              <p className="text-sm" style={{ color: '#7F1D1D' }}>
                Without this code, you cannot restore your data on a new device. 
                We cannot recover it for you (by design, for your privacy).
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation checkbox */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={saved}
              onChange={(e) => setSaved(e.target.checked)}
              className="mt-1 w-5 h-5"
              style={{ accentColor: '#69DB7C' }}
            />
            <span style={{ color: '#374151' }}>
              I have saved my restore code. I understand I need it to access my data on other devices.
            </span>
          </label>
        </div>

        {/* Continue button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!saved}
            className="inline-flex items-center gap-3 text-white text-xl px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed disabled:shadow-none"
            style={{ backgroundColor: saved ? '#37B24D' : '#D1D5DB' }}
            onMouseEnter={(e) => {
              if (saved) e.currentTarget.style.backgroundColor = '#2F9E44';
            }}
            onMouseLeave={(e) => {
              if (saved) e.currentTarget.style.backgroundColor = '#37B24D';
            }}
          >
            Go to Dashboard
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

