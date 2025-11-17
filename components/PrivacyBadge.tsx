'use client';

import { Lock, Shield, Eye } from 'lucide-react';
import { useState } from 'react';

export default function PrivacyBadge() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Badge */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-4 right-4 rounded-lg p-3 shadow-lg hover:shadow-xl transition-shadow z-50 group"
        style={{ 
          backgroundColor: '#B2F2BB', 
          border: '2px solid #69DB7C' 
        }}
      >
        <div className="flex items-center gap-2">
          <Lock size={20} style={{ color: '#2F9E44' }} />
          <div className="hidden sm:block">
            <p className="font-semibold text-sm" style={{ color: '#2F9E44' }}>100% Anonymous</p>
            <p className="text-xs" style={{ color: '#2F9E44' }}>No name required</p>
          </div>
        </div>
        <p className="text-xs underline mt-1 hidden sm:block" style={{ color: '#69DB7C' }}>
          How it works
        </p>
      </button>

      {/* Privacy Explainer Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <Lock size={32} style={{ color: '#2F9E44' }} />
              <h2 className="text-2xl font-bold text-black">Privacy-First Design</h2>
            </div>

            <div className="space-y-6">
              {/* What we DON'T collect */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Eye size={24} style={{ color: '#69DB7C' }} />
                  <h3 className="font-semibold text-lg text-black">We NEVER Collect:</h3>
                </div>
                <ul className="space-y-2 ml-8 text-black">
                  <li>❌ Your name</li>
                  <li>❌ Your email (unless you choose cloud storage + PRO)</li>
                  <li>❌ Your address</li>
                  <li>❌ Your phone number</li>
                  <li>❌ Any identifying information</li>
                </ul>
              </div>

              {/* How it works */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={24} style={{ color: '#69DB7C' }} />
                  <h3 className="font-semibold text-lg text-black">How It Works:</h3>
                </div>
                <div className="space-y-3 ml-8 text-black">
                  <div>
                    <p className="font-semibold">📱 Device ID (Internal Only)</p>
                    <p className="text-sm">Random code like "1700140800000-a3f9k2x"</p>
                    <p className="text-sm text-gray-500">You never see this. We use it to organize data.</p>
                  </div>
                  
                  <div>
                    <p className="font-semibold">🔑 Restore Code (Your Key)</p>
                    <p className="text-sm">8 characters like "HFKR-7649"</p>
                    <p className="text-sm text-gray-500">Use this to restore data on new devices. Keep it safe!</p>
                  </div>
                  
                  <div className="p-4 rounded-lg mt-4" style={{ backgroundColor: '#B2F2BB' }}>
                    <p className="font-semibold mb-2 text-black">🔐 Why This Matters:</p>
                    <p className="text-sm text-black">
                      Even if our database is hacked, attackers would only see:
                      <br /><br />
                      <code className="bg-white px-2 py-1 rounded text-black">
                        "Device xyz123: £18,000 total, £450/month payments"
                      </code>
                      <br /><br />
                      <strong className="text-black">No names. No addresses. Nothing to identify you.</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Cloud storage note */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="font-semibold mb-2 text-black">📧 About Cloud Storage (PRO):</p>
                <p className="text-sm text-black">
                  If you upgrade to PRO and choose cloud storage, we store your email 
                  <strong> in a separate database</strong> from your financial data. 
                  We can't connect "email@example.com" to "Device xyz123" - they're isolated.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-6 text-white py-3 rounded-lg font-semibold"
              style={{ backgroundColor: '#69DB7C' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2F9E44'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#69DB7C'}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}

