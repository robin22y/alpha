'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Shield, Calendar, Crown, Link2, Eye, EyeOff, BookOpen, Plus, Edit2, Trash2, X, Save, CreditCard, CheckCircle, XCircle, Clock, Smartphone } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { 
  getAllPartners, 
  getPublishedAffiliateIds, 
  setPublishedAffiliateIds, 
  addCustomAffiliate,
  updateCustomAffiliate,
  deleteCustomAffiliate,
  getCustomAffiliates,
  AffiliatePartner 
} from '@/lib/affiliates';
import { getAllStories, saveStories, addStory, updateStory, deleteStory, WeeklyStory } from '@/lib/checkIn';
import { 
  getAllPhones, 
  DEFAULT_PHONES,
  addCustomPhone, 
  updateCustomPhone, 
  deleteCustomPhone, 
  resetToDefaultPhones,
  PhoneModel 
} from '@/lib/calculators';
import { 
  getAllSubscriptions, 
  getProUsers, 
  setProStatus,
  setProStatusByRestoreCode,
  getDeviceTransferRequests,
  approveDeviceTransfer,
  rejectDeviceTransfer,
  SubscriptionStatus,
  DeviceTransferRequest
} from '@/lib/subscription';
import PrivacyBadge from '@/components/PrivacyBadge';

// Simple password protection (for development only)
const ADMIN_PASSWORD = 'zdebt2024'; // Change this to something secure

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const adminSettings = useUserStore((state) => state.adminSettings);
  const setAdminSettings = useUserStore((state) => state.setAdminSettings);
  
  const [extendedTrial, setExtendedTrial] = useState(adminSettings?.extendedTrial || false);
  const [trialDays, setTrialDays] = useState(adminSettings?.trialExtensionDays || 0);
  const [premiumOverride, setPremiumOverride] = useState(adminSettings?.isPremiumOverride || false);
  
  // Affiliate management
  const [allPartners, setAllPartners] = useState<AffiliatePartner[]>(getAllPartners());
  const [publishedIds, setPublishedIds] = useState<string[]>([]);
  const [editingAffiliate, setEditingAffiliate] = useState<AffiliatePartner | null>(null);
  const [isAddingAffiliate, setIsAddingAffiliate] = useState(false);
  const [newAffiliate, setNewAffiliate] = useState<Partial<AffiliatePartner>>({
    id: '',
    name: '',
    description: '',
    category: 'credit',
    affiliateLink: '',
    benefits: [''],
    relevantFor: {},
    disclaimer: ''
  });
  
  // Story management
  const [stories, setStories] = useState<WeeklyStory[]>([]);
  const [editingStory, setEditingStory] = useState<WeeklyStory | null>(null);
  const [isAddingStory, setIsAddingStory] = useState(false);
  const [newStory, setNewStory] = useState<Partial<WeeklyStory>>({
    id: '',
    title: '',
    content: '',
    reflectionLine: '',
    category: 'success',
    source: 'Based on public financial statistics'
  });
  
  // Subscription management
  const [subscriptions, setSubscriptions] = useState<SubscriptionStatus[]>([]);
  const [transferRequests, setTransferRequests] = useState<DeviceTransferRequest[]>([]);
  const [newDeviceID, setNewDeviceID] = useState('');
  const [newRestoreCode, setNewRestoreCode] = useState('');
  const [newRestoreCodeOnly, setNewRestoreCodeOnly] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Phone management
  const [phones, setPhones] = useState<PhoneModel[]>(getAllPhones());
  const [editingPhone, setEditingPhone] = useState<PhoneModel | null>(null);
  const [isAddingPhone, setIsAddingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState<Partial<PhoneModel>>({
    brand: '',
    model: '',
    price: 0
  });

  useEffect(() => {
    if (adminSettings) {
      setExtendedTrial(adminSettings.extendedTrial || false);
      setTrialDays(adminSettings.trialExtensionDays || 0);
      setPremiumOverride(adminSettings.isPremiumOverride || false);
    }
  }, [adminSettings]);

  // Load published affiliates, stories, subscriptions, and phones
  useEffect(() => {
    if (authenticated) {
      setPublishedIds(getPublishedAffiliateIds());
      setStories(getAllStories());
      // Load subscriptions async
      getAllSubscriptions().then(subs => setSubscriptions(subs));
      setTransferRequests(getDeviceTransferRequests());
      setAllPartners(getAllPartners());
      setPhones(getAllPhones());
    }
  }, [authenticated]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const handleSave = () => {
    setAdminSettings({
      extendedTrial,
      trialExtensionDays: trialDays,
      isPremiumOverride: premiumOverride
    });
    
    // Save published affiliates
    setPublishedAffiliateIds(publishedIds);
    
    alert('Admin settings saved successfully!');
  };

  const toggleAffiliatePublished = (partnerId: string) => {
    if (publishedIds.includes(partnerId)) {
      setPublishedIds(publishedIds.filter(id => id !== partnerId));
    } else {
      setPublishedIds([...publishedIds, partnerId]);
    }
  };

  const publishAll = () => {
    setPublishedIds(allPartners.map(p => p.id));
  };

  const unpublishAll = () => {
    setPublishedIds([]);
  };

  const handleAddAffiliate = () => {
    if (!newAffiliate.name || !newAffiliate.description || !newAffiliate.affiliateLink) {
      alert('Please fill in name, description, and affiliate link');
      return;
    }

    const affiliate: AffiliatePartner = {
      id: newAffiliate.id || `custom_${Date.now()}`,
      name: newAffiliate.name,
      description: newAffiliate.description,
      category: newAffiliate.category || 'credit',
      affiliateLink: newAffiliate.affiliateLink,
      benefits: newAffiliate.benefits?.filter(b => b.trim()) || [],
      relevantFor: newAffiliate.relevantFor || {},
      disclaimer: newAffiliate.disclaimer || 'We may earn a commission if you sign up.'
    };

    addCustomAffiliate(affiliate);
    setAllPartners(getAllPartners());
    setIsAddingAffiliate(false);
    setNewAffiliate({
      id: '',
      name: '',
      description: '',
      category: 'credit',
      affiliateLink: '',
      benefits: [''],
      relevantFor: {},
      disclaimer: ''
    });
    alert('Affiliate partner added successfully!');
  };

  const handleUpdateAffiliate = () => {
    if (!editingAffiliate) return;

    const isCustom = getCustomAffiliates().some(a => a.id === editingAffiliate.id);
    if (!isCustom) {
      alert('Cannot edit built-in affiliates. Create a custom affiliate instead.');
      return;
    }

    if (updateCustomAffiliate(editingAffiliate.id, editingAffiliate)) {
      setAllPartners(getAllPartners());
      setEditingAffiliate(null);
      alert('Affiliate partner updated successfully!');
    } else {
      alert('Failed to update affiliate partner');
    }
  };

  const handleDeleteAffiliate = (id: string) => {
    const isCustom = getCustomAffiliates().some(a => a.id === id);
    if (!isCustom) {
      alert('Cannot delete built-in affiliates');
      return;
    }

    if (confirm('Are you sure you want to delete this affiliate partner?')) {
      if (deleteCustomAffiliate(id)) {
        setAllPartners(getAllPartners());
        setPublishedIds(getPublishedAffiliateIds()); // Refresh published list
        alert('Affiliate partner deleted successfully!');
      } else {
        alert('Failed to delete affiliate partner');
      }
    }
  };

  // Story management functions
  const handleAddStory = () => {
    if (!newStory.id || !newStory.title || !newStory.content || !newStory.reflectionLine) {
      alert('Please fill in all required fields');
      return;
    }
    
    const story: WeeklyStory = {
      id: newStory.id,
      title: newStory.title!,
      content: newStory.content!,
      reflectionLine: newStory.reflectionLine!,
      category: newStory.category || 'success',
      source: newStory.source || 'Based on public financial statistics'
    };
    
    addStory(story);
    setStories(getAllStories());
    setIsAddingStory(false);
    setNewStory({
      id: '',
      title: '',
      content: '',
      reflectionLine: '',
      category: 'success',
      source: 'Based on public financial statistics'
    });
  };

  const handleUpdateStory = () => {
    if (!editingStory) return;
    
    updateStory(editingStory.id, editingStory);
    setStories(getAllStories());
    setEditingStory(null);
  };

  const handleDeleteStory = (storyId: string) => {
    if (confirm('Are you sure you want to delete this story?')) {
      deleteStory(storyId);
      setStories(getAllStories());
    }
  };

  const startEditing = (story: WeeklyStory) => {
    setEditingStory({ ...story });
    setIsAddingStory(false);
  };

  const startAdding = () => {
    setIsAddingStory(true);
    setEditingStory(null);
    setNewStory({
      id: `story_${Date.now()}`,
      title: '',
      content: '',
      reflectionLine: '',
      category: 'success',
      source: 'Based on public financial statistics'
    });
  };

  // Phone management functions
  const handleAddPhone = () => {
    if (!newPhone.brand || !newPhone.model || !newPhone.price || newPhone.price <= 0) {
      alert('Please fill in all fields with valid values');
      return;
    }
    
    addCustomPhone({
      brand: newPhone.brand!,
      model: newPhone.model!,
      price: newPhone.price!
    });
    setPhones(getAllPhones());
    setIsAddingPhone(false);
    setNewPhone({ brand: '', model: '', price: 0 });
  };

  const handleUpdatePhone = () => {
    if (!editingPhone) return;
    
    // Check if it's a default phone (update creates a custom override)
    const isDefault = DEFAULT_PHONES.some(p => p.id === editingPhone.id);
    if (isDefault) {
      // Create a custom phone with same ID to override
      updateCustomPhone(editingPhone.id, editingPhone);
    } else {
      updateCustomPhone(editingPhone.id, editingPhone);
    }
    setPhones(getAllPhones());
    setEditingPhone(null);
  };

  const handleDeletePhone = (phoneId: string) => {
    const isDefault = DEFAULT_PHONES.some(p => p.id === phoneId);
    if (isDefault) {
      alert('Cannot delete default phones. You can edit them to override.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this phone model?')) {
      deleteCustomPhone(phoneId);
      setPhones(getAllPhones());
    }
  };

  const startEditingPhone = (phone: PhoneModel) => {
    setEditingPhone({ ...phone });
    setIsAddingPhone(false);
  };

  const startAddingPhone = () => {
    setIsAddingPhone(true);
    setEditingPhone(null);
    setNewPhone({ brand: '', model: '', price: 0 });
  };

  const handleResetPhones = () => {
    if (confirm('Reset all phones to default? This will remove all custom phones.')) {
      resetToDefaultPhones();
      setPhones(getAllPhones());
      alert('Phones reset to default');
    }
  };

  // Subscription management functions
  const handleSetProStatus = async (deviceID: string, restoreCode: string, isPro: boolean) => {
    await setProStatus(deviceID, restoreCode, isPro);
    const subs = await getAllSubscriptions();
    setSubscriptions(subs);
  };

  const handleApproveTransfer = async (requestId: string) => {
    const result = approveDeviceTransfer(requestId, 'admin');
    if (result.success) {
      setTransferRequests(getDeviceTransferRequests());
      const subs = await getAllSubscriptions();
      setSubscriptions(subs);
      alert('Transfer approved successfully!');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleRejectTransfer = (requestId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    const result = rejectDeviceTransfer(requestId, rejectionReason, 'admin');
    if (result.success) {
      setTransferRequests(getDeviceTransferRequests());
      setRejectionReason('');
      alert('Transfer rejected.');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom right, #F3F4F6, #E5E7EB)' }}>
        <PrivacyBadge />
        
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#374151' }}>
              <Lock size={48} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#000000' }}>Admin Access</h1>
            <p className="text-sm" style={{ color: '#666666' }}>Enter password to continue</p>
          </div>

          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Admin password"
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
              style={{ borderColor: '#E5E7EB' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#374151'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 border rounded text-sm" style={{ backgroundColor: '#FEE2E2', borderColor: '#FECACA', color: '#991B1B' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full py-3 text-white rounded-lg font-semibold transition-all"
            style={{ backgroundColor: '#374151' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F2937'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#374151'}
          >
            Login
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full mt-3 py-3 rounded-lg font-semibold transition-all"
            style={{ backgroundColor: '#E5E7EB', color: '#374151' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D1D5DB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, #F3F4F6, #E5E7EB)' }}>
      <PrivacyBadge />
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={32} style={{ color: '#374151' }} />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#000000' }}>Admin Panel</h1>
              <p style={{ color: '#666666' }}>Manage trial extensions and premium access</p>
            </div>
          </div>

          <div className="border-2 rounded-lg p-4 mb-6" style={{ backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }}>
            <p className="text-sm" style={{ color: '#374151' }}>
              <strong>⚠️ Development Tool:</strong> This panel is for testing only. 
              Remove before production or implement proper authentication.
            </p>
          </div>

          {/* Trial Extension */}
          <div className="mb-8 pb-8 border-b">
            <div className="flex items-center gap-3 mb-4">
              <Calendar style={{ color: '#2563EB' }} size={24} />
              <h2 className="text-xl font-bold" style={{ color: '#000000' }}>Trial Extension</h2>
            </div>

            <p className="mb-4" style={{ color: '#666666' }}>
              Extend the free trial period for testing or special circumstances.
            </p>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all" style={{ backgroundColor: '#F9FAFB' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}>
                <input
                  type="checkbox"
                  checked={extendedTrial}
                  onChange={(e) => setExtendedTrial(e.target.checked)}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-semibold" style={{ color: '#000000' }}>Enable Extended Trial</p>
                  <p className="text-sm" style={{ color: '#666666' }}>Allow additional trial days</p>
                </div>
              </label>

              {extendedTrial && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>
                    Additional Trial Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={trialDays}
                    onChange={(e) => setTrialDays(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: '#E5E7EB' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#2563EB'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  />
                  <p className="text-xs mt-1" style={{ color: '#999999' }}>
                    Add extra days to the free trial period
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Premium Override */}
          <div className="mb-8 pb-8 border-b">
            <div className="flex items-center gap-3 mb-4">
              <Crown style={{ color: '#D97706' }} size={24} />
              <h2 className="text-xl font-bold" style={{ color: '#000000' }}>Premium Override</h2>
            </div>

            <p className="mb-4" style={{ color: '#666666' }}>
              Grant premium access without payment for testing.
            </p>

            <label className="flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all" style={{ backgroundColor: '#F9FAFB' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}>
              <input
                type="checkbox"
                checked={premiumOverride}
                onChange={(e) => setPremiumOverride(e.target.checked)}
                className="w-5 h-5"
              />
              <div>
                <p className="font-semibold" style={{ color: '#000000' }}>Enable Premium Access</p>
                <p className="text-sm" style={{ color: '#666666' }}>
                  Grant all PRO features without payment
                </p>
              </div>
            </label>
          </div>

          {/* Affiliate Management */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Link2 style={{ color: '#059669' }} size={24} />
                <h2 className="text-xl font-bold" style={{ color: '#000000' }}>Affiliate Partners</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAddingAffiliate(true)}
                  className="px-3 py-1 text-xs rounded font-semibold transition-all flex items-center gap-1"
                  style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                >
                  <Plus size={14} />
                  Add New
                </button>
                <button
                  onClick={publishAll}
                  className="px-3 py-1 text-xs rounded font-semibold transition-all"
                  style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#A7F3D0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D1FAE5'}
                >
                  Publish All
                </button>
                <button
                  onClick={unpublishAll}
                  className="px-3 py-1 text-xs rounded font-semibold transition-all"
                  style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FECACA'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                >
                  Unpublish All
                </button>
              </div>
            </div>

            <p className="mb-4 text-sm" style={{ color: '#666666' }}>
              Control which affiliate partners are visible to users. Only published partners will appear in recommendations.
            </p>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {allPartners.map((partner) => {
                const isPublished = publishedIds.includes(partner.id);
                const isCustom = getCustomAffiliates().some(a => a.id === partner.id);
                return (
                  <div
                    key={partner.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isPublished ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold" style={{ color: '#000000' }}>{partner.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded" style={{ 
                            backgroundColor: isPublished ? '#D1FAE5' : '#F3F4F6',
                            color: isPublished ? '#065F46' : '#6B7280'
                          }}>
                            {partner.category}
                          </span>
                          {isCustom && (
                            <span className="text-xs px-2 py-0.5 rounded" style={{ 
                              backgroundColor: '#DBEAFE',
                              color: '#1E40AF'
                            }}>
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-sm mb-2" style={{ color: '#666666' }}>{partner.description}</p>
                        <div className="flex items-center gap-2 text-xs" style={{ color: '#999999' }}>
                          {isPublished ? (
                            <>
                              <Eye size={14} />
                              <span>Published - Visible to users</span>
                            </>
                          ) : (
                            <>
                              <EyeOff size={14} />
                              <span>Unpublished - Hidden from users</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {isCustom && (
                          <>
                            <button
                              onClick={() => setEditingAffiliate({ ...partner })}
                              className="p-2 rounded transition-all"
                              style={{ color: '#2563EB' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteAffiliate(partner.id)}
                              className="p-2 rounded transition-all"
                              style={{ color: '#DC2626' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isPublished}
                            onChange={() => toggleAffiliatePublished(partner.id)}
                            className="w-5 h-5"
                          />
                          <span className="text-sm font-medium" style={{ color: '#000000' }}>
                            {isPublished ? 'Published' : 'Unpublished'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#DBEAFE' }}>
              <p style={{ color: '#1E40AF' }}>
                <strong>Published:</strong> {publishedIds.length} / {allPartners.length} partners
              </p>
            </div>
          </div>

          {/* Story Management */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BookOpen style={{ color: '#7C3AED' }} size={24} />
                <h2 className="text-xl font-bold" style={{ color: '#000000' }}>Weekly Stories</h2>
              </div>
              <button
                onClick={startAdding}
                className="px-4 py-2 rounded font-semibold transition-all flex items-center gap-2"
                style={{ backgroundColor: '#7C3AED', color: '#FFFFFF' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6D28D9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
              >
                <Plus size={16} />
                Add Story
              </button>
            </div>

            <p className="mb-4 text-sm" style={{ color: '#666666' }}>
              Manage weekly stories shown to users after check-ins. Stories rotate based on week number.
            </p>

            {/* Add New Story Form */}
            {isAddingStory && (
              <div className="mb-6 p-6 rounded-lg border-2" style={{ backgroundColor: '#F3F4F6', borderColor: '#7C3AED' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold" style={{ color: '#000000' }}>Add New Story</h3>
                  <button
                    onClick={() => setIsAddingStory(false)}
                    className="p-1 rounded"
                    style={{ color: '#666666' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#000000' }}>Story ID *</label>
                    <input
                      type="text"
                      value={newStory.id}
                      onChange={(e) => setNewStory({ ...newStory, id: e.target.value })}
                      placeholder="story_001"
                      className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#E5E7EB' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#000000' }}>Title *</label>
                    <input
                      type="text"
                      value={newStory.title}
                      onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                      placeholder="The Coffee Shop Habit"
                      className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#E5E7EB' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#000000' }}>Content (60-80 words) *</label>
                    <textarea
                      value={newStory.content}
                      onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                      placeholder="Sarah, 32, realized she spent £180/month..."
                      rows={4}
                      className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none resize-none"
                      style={{ borderColor: '#E5E7EB' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#000000' }}>Reflection Line *</label>
                    <input
                      type="text"
                      value={newStory.reflectionLine}
                      onChange={(e) => setNewStory({ ...newStory, reflectionLine: e.target.value })}
                      placeholder="What small daily expense could you redirect?"
                      className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#E5E7EB' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: '#000000' }}>Category *</label>
                      <select
                        value={newStory.category}
                        onChange={(e) => setNewStory({ ...newStory, category: e.target.value as 'success' | 'cautionary' | 'neutral' })}
                        className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none"
                        style={{ borderColor: '#E5E7EB' }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                      >
                        <option value="success">Success</option>
                        <option value="cautionary">Cautionary</option>
                        <option value="neutral">Neutral</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: '#000000' }}>Source</label>
                      <input
                        type="text"
                        value={newStory.source}
                        onChange={(e) => setNewStory({ ...newStory, source: e.target.value })}
                        placeholder="Based on public financial statistics"
                        className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none"
                        style={{ borderColor: '#E5E7EB' }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#7C3AED'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddStory}
                      className="px-4 py-2 rounded font-semibold transition-all flex items-center gap-2"
                      style={{ backgroundColor: '#7C3AED', color: '#FFFFFF' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6D28D9'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
                    >
                      <Save size={16} />
                      Save Story
                    </button>
                    <button
                      onClick={() => setIsAddingStory(false)}
                      className="px-4 py-2 rounded font-semibold transition-all"
                      style={{ backgroundColor: '#E5E7EB', color: '#374151' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D1D5DB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stories List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {stories.map((story) => {
                const isEditing = editingStory?.id === story.id;
                const displayStory = isEditing ? editingStory! : story;
                
                return (
                  <div
                    key={story.id}
                    className="p-4 rounded-lg border-2"
                    style={{ 
                      backgroundColor: isEditing ? '#FEF3C7' : '#F9FAFB',
                      borderColor: isEditing ? '#FCD34D' : '#E5E7EB'
                    }}
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold" style={{ color: '#000000' }}>Editing: {story.id}</h3>
                          <button
                            onClick={() => setEditingStory(null)}
                            className="p-1 rounded"
                            style={{ color: '#666666' }}
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: '#000000' }}>Title</label>
                          <input
                            type="text"
                            value={displayStory.title}
                            onChange={(e) => setEditingStory({ ...editingStory!, title: e.target.value })}
                            className="w-full px-2 py-1 text-sm border rounded"
                            style={{ borderColor: '#D1D5DB' }}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: '#000000' }}>Content</label>
                          <textarea
                            value={displayStory.content}
                            onChange={(e) => setEditingStory({ ...editingStory!, content: e.target.value })}
                            rows={3}
                            className="w-full px-2 py-1 text-sm border rounded resize-none"
                            style={{ borderColor: '#D1D5DB' }}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: '#000000' }}>Reflection Line</label>
                          <input
                            type="text"
                            value={displayStory.reflectionLine}
                            onChange={(e) => setEditingStory({ ...editingStory!, reflectionLine: e.target.value })}
                            className="w-full px-2 py-1 text-sm border rounded"
                            style={{ borderColor: '#D1D5DB' }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: '#000000' }}>Category</label>
                            <select
                              value={displayStory.category}
                              onChange={(e) => setEditingStory({ ...editingStory!, category: e.target.value as 'success' | 'cautionary' | 'neutral' })}
                              className="w-full px-2 py-1 text-sm border rounded"
                              style={{ borderColor: '#D1D5DB' }}
                            >
                              <option value="success">Success</option>
                              <option value="cautionary">Cautionary</option>
                              <option value="neutral">Neutral</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: '#000000' }}>Source</label>
                            <input
                              type="text"
                              value={displayStory.source}
                              onChange={(e) => setEditingStory({ ...editingStory!, source: e.target.value })}
                              className="w-full px-2 py-1 text-sm border rounded"
                              style={{ borderColor: '#D1D5DB' }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdateStory}
                            className="px-3 py-1 text-xs rounded font-semibold transition-all flex items-center gap-1"
                            style={{ backgroundColor: '#7C3AED', color: '#FFFFFF' }}
                          >
                            <Save size={12} />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingStory(null)}
                            className="px-3 py-1 text-xs rounded font-semibold transition-all"
                            style={{ backgroundColor: '#E5E7EB', color: '#374151' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold" style={{ color: '#000000' }}>{story.title}</h3>
                              <span className="text-xs px-2 py-0.5 rounded" style={{
                                backgroundColor: story.category === 'success' ? '#D1FAE5' : story.category === 'cautionary' ? '#FEE2E2' : '#DBEAFE',
                                color: story.category === 'success' ? '#065F46' : story.category === 'cautionary' ? '#991B1B' : '#1E40AF'
                              }}>
                                {story.category}
                              </span>
                            </div>
                            <p className="text-sm mb-2" style={{ color: '#666666' }}>{story.content}</p>
                            <p className="text-xs italic mb-1" style={{ color: '#999999' }}>"{story.reflectionLine}"</p>
                            <p className="text-xs" style={{ color: '#999999' }}>ID: {story.id} | Source: {story.source}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => startEditing(story)}
                              className="p-2 rounded transition-all"
                              style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BFDBFE'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteStory(story.id)}
                              className="p-2 rounded transition-all"
                              style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FECACA'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#DBEAFE' }}>
              <p style={{ color: '#1E40AF' }}>
                <strong>Total Stories:</strong> {stories.length} (stories rotate based on week number)
              </p>
            </div>
          </div>

          {/* Phone Models Management */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Smartphone style={{ color: '#2563EB' }} size={24} />
                <h2 className="text-xl font-bold" style={{ color: '#000000' }}>Phone Models</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleResetPhones}
                  className="px-4 py-2 rounded font-semibold transition-all text-sm"
                  style={{ backgroundColor: '#E5E7EB', color: '#374151' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D1D5DB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                >
                  Reset to Default
                </button>
                <button
                  onClick={startAddingPhone}
                  className="px-4 py-2 rounded font-semibold transition-all flex items-center gap-2"
                  style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                >
                  <Plus size={16} />
                  Add Phone
                </button>
              </div>
            </div>

            <p className="mb-4 text-sm" style={{ color: '#666666' }}>
              Manage phone models shown in the Dream Phone Calculator. Edit default phones or add custom models.
            </p>

            {/* Add New Phone Form */}
            {isAddingPhone && (
              <div className="mb-6 p-6 rounded-lg border-2" style={{ backgroundColor: '#F3F4F6', borderColor: '#2563EB' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold" style={{ color: '#000000' }}>Add New Phone</h3>
                  <button
                    onClick={() => setIsAddingPhone(false)}
                    className="p-1 rounded"
                    style={{ color: '#666666' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#000000' }}>Brand *</label>
                    <input
                      type="text"
                      value={newPhone.brand || ''}
                      onChange={(e) => setNewPhone({ ...newPhone, brand: e.target.value })}
                      placeholder="iPhone"
                      className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#E5E7EB' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#2563EB'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#000000' }}>Model *</label>
                    <input
                      type="text"
                      value={newPhone.model || ''}
                      onChange={(e) => setNewPhone({ ...newPhone, model: e.target.value })}
                      placeholder="16 Pro"
                      className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#E5E7EB' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#2563EB'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#000000' }}>Price ($) *</label>
                    <input
                      type="number"
                      value={newPhone.price || 0}
                      onChange={(e) => setNewPhone({ ...newPhone, price: parseFloat(e.target.value) || 0 })}
                      placeholder="999"
                      className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#E5E7EB' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#2563EB'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAddPhone}
                    className="px-4 py-2 rounded font-semibold transition-all flex items-center gap-2"
                    style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                  >
                    <Save size={16} />
                    Add Phone
                  </button>
                  <button
                    onClick={() => setIsAddingPhone(false)}
                    className="px-4 py-2 rounded font-semibold transition-all"
                    style={{ backgroundColor: '#E5E7EB', color: '#374151' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Phone List */}
            <div className="space-y-3">
              {phones.map((phone) => {
                const isDefault = DEFAULT_PHONES.some(p => p.id === phone.id);
                const displayPhone = editingPhone?.id === phone.id ? editingPhone : phone;
                
                return (
                  <div
                    key={phone.id}
                    className="p-4 rounded-lg border-2"
                    style={{ 
                      backgroundColor: editingPhone?.id === phone.id ? '#F3F4F6' : '#FFFFFF',
                      borderColor: editingPhone?.id === phone.id ? '#2563EB' : '#E5E7EB'
                    }}
                  >
                    {editingPhone?.id === phone.id ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium" style={{ color: '#666666' }}>
                            {isDefault ? 'Default Phone' : 'Custom Phone'}
                          </span>
                          <button
                            onClick={() => setEditingPhone(null)}
                            className="p-1 rounded"
                            style={{ color: '#666666' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: '#000000' }}>Brand</label>
                            <input
                              type="text"
                              value={displayPhone.brand}
                              onChange={(e) => setEditingPhone({ ...editingPhone!, brand: e.target.value })}
                              className="w-full px-2 py-1 text-sm border rounded"
                              style={{ borderColor: '#D1D5DB' }}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: '#000000' }}>Model</label>
                            <input
                              type="text"
                              value={displayPhone.model}
                              onChange={(e) => setEditingPhone({ ...editingPhone!, model: e.target.value })}
                              className="w-full px-2 py-1 text-sm border rounded"
                              style={{ borderColor: '#D1D5DB' }}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: '#000000' }}>Price ($)</label>
                            <input
                              type="number"
                              value={displayPhone.price}
                              onChange={(e) => setEditingPhone({ ...editingPhone!, price: parseFloat(e.target.value) || 0 })}
                              className="w-full px-2 py-1 text-sm border rounded"
                              style={{ borderColor: '#D1D5DB' }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdatePhone}
                            className="px-3 py-1 text-xs rounded font-semibold transition-all flex items-center gap-1"
                            style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                          >
                            <Save size={12} />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPhone(null)}
                            className="px-3 py-1 text-xs rounded font-semibold transition-all"
                            style={{ backgroundColor: '#E5E7EB', color: '#374151' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-semibold" style={{ color: '#000000' }}>{phone.brand}</p>
                              <p className="text-sm" style={{ color: '#666666' }}>{phone.model}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg" style={{ color: '#2563EB' }}>${phone.price}</p>
                            </div>
                            {isDefault && (
                              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => startEditingPhone(phone)}
                            className="p-2 rounded transition-all"
                            style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BFDBFE'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                            title="Edit phone"
                          >
                            <Edit2 size={16} />
                          </button>
                          {!isDefault && (
                            <button
                              onClick={() => handleDeletePhone(phone.id)}
                              className="p-2 rounded transition-all"
                              style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FECACA'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                              title="Delete phone"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subscription Management */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard style={{ color: '#059669' }} size={24} />
              <h2 className="text-xl font-bold" style={{ color: '#000000' }}>Subscriptions & Payments</h2>
            </div>

            <p className="mb-4 text-sm" style={{ color: '#666666' }}>
              Manage PRO subscriptions and device transfers. One user = one device.
            </p>

            {/* Add PRO Subscription */}
            <div className="mb-6 p-4 rounded-lg border-2" style={{ backgroundColor: '#F3F4F6', borderColor: '#059669' }}>
              <h3 className="font-bold mb-3" style={{ color: '#000000' }}>Grant PRO Access</h3>
              
              {/* Quick Grant by Restore Code Only */}
              <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#D1FAE5', borderColor: '#6EE7B7' }}>
                <label className="block text-xs font-medium mb-2" style={{ color: '#000000' }}>
                  Quick Grant (Restore Code Only) ⚡
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRestoreCodeOnly}
                    onChange={(e) => setNewRestoreCodeOnly(e.target.value)}
                    placeholder="ABCD-1234 or ABCD1234"
                    className="flex-1 px-3 py-2 text-sm border-2 rounded-lg focus:outline-none font-mono"
                    style={{ borderColor: '#E5E7EB' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#059669'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && newRestoreCodeOnly) {
                        const result = await setProStatusByRestoreCode(newRestoreCodeOnly, true);
                        if (result.success) {
                          const subs = await getAllSubscriptions();
                          setSubscriptions(subs);
                          setNewRestoreCodeOnly('');
                          alert(`PRO access granted! Device ID: ${result.deviceID?.slice(0, 20)}...`);
                        } else {
                          alert(`Error: ${result.error}`);
                        }
                      }
                    }}
                  />
                  <button
                    onClick={async () => {
                      if (newRestoreCodeOnly) {
                        const result = await setProStatusByRestoreCode(newRestoreCodeOnly, true);
                        if (result.success) {
                          const subs = await getAllSubscriptions();
                          setSubscriptions(subs);
                          setNewRestoreCodeOnly('');
                          alert(`PRO access granted! Device ID: ${result.deviceID?.slice(0, 20)}...`);
                        } else {
                          alert(`Error: ${result.error}`);
                        }
                      } else {
                        alert('Please enter a restore code');
                      }
                    }}
                    className="px-4 py-2 rounded font-semibold transition-all"
                    style={{ backgroundColor: '#059669', color: '#FFFFFF' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                  >
                    Grant PRO
                  </button>
                </div>
                <p className="text-xs mt-2" style={{ color: '#666666' }}>
                  Enter restore code to grant PRO access. Works if user has already signed up.
                </p>
              </div>

              {/* Advanced: Device ID + Restore Code */}
              <details className="mb-3">
                <summary className="cursor-pointer text-sm font-medium mb-2" style={{ color: '#666666' }}>
                  Advanced: Device ID + Restore Code
                </summary>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#000000' }}>Device ID</label>
                    <input
                      type="text"
                      value={newDeviceID}
                      onChange={(e) => setNewDeviceID(e.target.value)}
                      placeholder="1700140800000-a3f9k2x"
                      className="w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none"
                      style={{ borderColor: '#E5E7EB' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#059669'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#000000' }}>Restore Code</label>
                    <input
                      type="text"
                      value={newRestoreCode}
                      onChange={(e) => setNewRestoreCode(e.target.value)}
                      placeholder="ABCD1234"
                      className="w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none font-mono"
                      style={{ borderColor: '#E5E7EB' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#059669'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                    />
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (newDeviceID && newRestoreCode) {
                      await handleSetProStatus(newDeviceID, newRestoreCode, true);
                      setNewDeviceID('');
                      setNewRestoreCode('');
                      alert('PRO access granted!');
                    } else {
                      alert('Please enter both Device ID and Restore Code');
                    }
                  }}
                  className="px-4 py-2 rounded font-semibold transition-all mt-2"
                  style={{ backgroundColor: '#059669', color: '#FFFFFF' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                >
                  Grant PRO
                </button>
              </details>
            </div>

            {/* PRO Users List */}
            <div className="mb-6">
              <h3 className="font-bold mb-3" style={{ color: '#000000' }}>PRO Users ({subscriptions.filter(s => s.isPro).length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {subscriptions.filter(s => s.isPro).map((sub) => (
                  <div
                    key={sub.deviceID}
                    className="p-3 rounded-lg border-2"
                    style={{ backgroundColor: '#D1FAE5', borderColor: '#6EE7B7' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Crown size={16} style={{ color: '#059669' }} />
                          <span className="font-mono text-xs font-semibold" style={{ color: '#000000' }}>
                            {sub.deviceID.slice(0, 20)}...
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#059669', color: '#FFFFFF' }}>
                            PRO
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: '#666666' }}>
                          Restore: {sub.restoreCode} | PRO since: {sub.proSince ? new Date(sub.proSince).toLocaleDateString() : 'N/A'}
                        </p>
                        {sub.lastDeviceChange && (
                          <p className="text-xs" style={{ color: '#999999' }}>
                            Last transfer: {new Date(sub.lastDeviceChange).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button
                          onClick={async () => {
                            if (confirm('Remove PRO access for this device?')) {
                              await handleSetProStatus(sub.deviceID, sub.restoreCode, false);
                            }
                          }}
                        className="px-3 py-1 text-xs rounded font-semibold transition-all"
                        style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FECACA'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                      >
                        Remove PRO
                      </button>
                    </div>
                  </div>
                ))}
                {subscriptions.filter(s => s.isPro).length === 0 && (
                  <p className="text-sm text-center py-4" style={{ color: '#999999' }}>No PRO users</p>
                )}
              </div>
            </div>

            {/* Device Transfer Requests */}
            <div>
              <h3 className="font-bold mb-3" style={{ color: '#000000' }}>
                Device Transfer Requests ({transferRequests.filter(r => r.status === 'pending').length} pending)
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transferRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 rounded-lg border-2"
                    style={{
                      backgroundColor: request.status === 'pending' ? '#FEF3C7' : request.status === 'approved' ? '#D1FAE5' : '#FEE2E2',
                      borderColor: request.status === 'pending' ? '#FCD34D' : request.status === 'approved' ? '#6EE7B7' : '#FCA5A5'
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Smartphone size={16} style={{ color: '#666666' }} />
                          <span className="font-semibold text-sm" style={{ color: '#000000' }}>
                            Request #{request.id.slice(-6)}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded" style={{
                            backgroundColor: request.status === 'pending' ? '#FCD34D' : request.status === 'approved' ? '#059669' : '#DC2626',
                            color: '#FFFFFF'
                          }}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-xs mb-1" style={{ color: '#666666' }}>
                          Restore Code: <span className="font-mono">{request.restoreCode}</span>
                        </p>
                        <p className="text-xs mb-1" style={{ color: '#666666' }}>
                          From: <span className="font-mono">{request.oldDeviceID.slice(0, 20)}...</span>
                        </p>
                        <p className="text-xs mb-1" style={{ color: '#666666' }}>
                          To: <span className="font-mono">{request.newDeviceID.slice(0, 20)}...</span>
                        </p>
                        <p className="text-xs" style={{ color: '#999999' }}>
                          Requested: {new Date(request.requestedAt).toLocaleString()}
                        </p>
                        {request.approvedAt && (
                          <p className="text-xs" style={{ color: '#999999' }}>
                            {request.status === 'approved' ? 'Approved' : 'Rejected'}: {new Date(request.approvedAt).toLocaleString()}
                            {request.approvedBy && ` by ${request.approvedBy}`}
                          </p>
                        )}
                        {request.rejectionReason && (
                          <p className="text-xs mt-1" style={{ color: '#991B1B' }}>
                            Reason: {request.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleApproveTransfer(request.id)}
                          className="px-3 py-1 text-xs rounded font-semibold transition-all flex items-center gap-1"
                          style={{ backgroundColor: '#059669', color: '#FFFFFF' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                        >
                          <CheckCircle size={12} />
                          Approve
                        </button>
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Rejection reason..."
                            className="flex-1 px-2 py-1 text-xs border rounded"
                            style={{ borderColor: '#D1D5DB' }}
                          />
                          <button
                            onClick={() => handleRejectTransfer(request.id)}
                            className="px-3 py-1 text-xs rounded font-semibold transition-all flex items-center gap-1"
                            style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                          >
                            <XCircle size={12} />
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {transferRequests.length === 0 && (
                  <p className="text-sm text-center py-4" style={{ color: '#999999' }}>No transfer requests</p>
                )}
              </div>
            </div>
          </div>

          {/* Current Settings Summary */}
          <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: '#DBEAFE' }}>
            <h3 className="font-bold mb-3" style={{ color: '#000000' }}>Current Settings</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: '#666666' }}>Extended Trial:</span>
                <span className="font-semibold" style={{ color: '#000000' }}>{extendedTrial ? 'Enabled' : 'Disabled'}</span>
              </div>
              {extendedTrial && (
                <div className="flex justify-between">
                  <span style={{ color: '#666666' }}>Additional Days:</span>
                  <span className="font-semibold" style={{ color: '#000000' }}>{trialDays} days</span>
                </div>
              )}
              <div className="flex justify-between">
                <span style={{ color: '#666666' }}>Premium Override:</span>
                <span className="font-semibold" style={{ color: '#000000' }}>{premiumOverride ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all"
              style={{ backgroundColor: '#E5E7EB', color: '#374151' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D1D5DB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 text-white rounded-lg font-semibold transition-all"
              style={{ backgroundColor: '#374151' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F2937'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            >
              Save Settings
            </button>
          </div>
        </div>

        {/* Warning */}
        <div className="border-2 rounded-lg p-4 text-center" style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }}>
          <p className="text-sm" style={{ color: '#991B1B' }}>
            <strong>Security Warning:</strong> This is a basic admin panel for development. 
            In production, implement proper authentication, server-side validation, and audit logging.
          </p>
        </div>
      </div>
    </div>
  );
}

