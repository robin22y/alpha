'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, X, Save, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { 
  getAllIncomeIdeas, 
  createIncomeIdea, 
  updateIncomeIdea, 
  deleteIncomeIdea, 
  toggleIncomeIdeaActive,
  type IncomeIdea,
  type IncomeIdeaCategory,
  type IncomeIdeaDifficulty
} from '@/lib/supabase/incomeIdeas';
import PrivacyBadge from '@/components/PrivacyBadge';

const CATEGORIES: { key: IncomeIdeaCategory; label: string }[] = [
  { key: 'fast', label: 'Fast' },
  { key: 'local', label: 'Local' },
  { key: 'sell', label: 'Sell' },
  { key: 'digital', label: 'Digital' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'rent', label: 'Rent' },
  { key: 'home', label: 'Home' },
  { key: 'teach', label: 'Teach' },
  { key: 'weekend', label: 'Weekend' },
  { key: 'transport', label: 'Transport' },
  { key: 'homebiz', label: 'Home Biz' },
  { key: 'resell', label: 'Resell' },
];

const DIFFICULTIES: { key: IncomeIdeaDifficulty; label: string }[] = [
  { key: 'easy', label: 'Easy' },
  { key: 'moderate', label: 'Moderate' },
];

export default function IncomeIdeasAdminPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<IncomeIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState<Omit<IncomeIdea, 'id' | 'created_at'>>({
    title: '',
    description: '',
    category: 'fast',
    difficulty: 'easy',
    is_active: true,
  });

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    setLoading(true);
    const data = await getAllIncomeIdeas();
    setIdeas(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('error', 'Please fill in all fields');
      return;
    }

    if (editingId) {
      const result = await updateIncomeIdea(editingId, formData);
      if (result.success) {
        showToast('success', 'Idea updated successfully');
        setEditingId(null);
        resetForm();
        loadIdeas();
      } else {
        showToast('error', 'Failed to update idea');
      }
    } else {
      const result = await createIncomeIdea(formData);
      if (result.success) {
        showToast('success', 'Idea created successfully');
        setShowAddForm(false);
        resetForm();
        loadIdeas();
      } else {
        showToast('error', 'Failed to create idea');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this idea?')) {
      const result = await deleteIncomeIdea(id);
      if (result.success) {
        showToast('success', 'Idea deleted successfully');
        loadIdeas();
      } else {
        showToast('error', 'Failed to delete idea');
      }
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const result = await toggleIncomeIdeaActive(id, !currentStatus);
    if (result.success) {
      showToast('success', `Idea ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      loadIdeas();
    } else {
      showToast('error', 'Failed to update idea status');
    }
  };

  const handleEdit = (idea: IncomeIdea) => {
    setFormData({
      title: idea.title,
      description: idea.description,
      category: idea.category,
      difficulty: idea.difficulty,
      is_active: idea.is_active,
    });
    setEditingId(idea.id);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'fast',
      difficulty: 'easy',
      is_active: true,
    });
    setEditingId(null);
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredIdeas = showActiveOnly ? ideas.filter(i => i.is_active) : ideas;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 py-8 px-4">
      <PrivacyBadge />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Income Ideas Management</h1>
            <p className="text-gray-600">Manage income improvement ideas for users</p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            ← Back to Admin
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Show active only</span>
            </label>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add New Idea
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Idea' : 'Add New Idea'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                  placeholder="e.g., Sell unused items online"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                  placeholder="Brief description of the idea"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as IncomeIdeaCategory })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 bg-white"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as IncomeIdeaDifficulty })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 bg-white"
                  >
                    {DIFFICULTIES.map(diff => (
                      <option key={diff.key} value={diff.key}>{diff.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700 cursor-pointer">
                  Active (visible to users)
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Save size={20} />
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ideas List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ideas...</p>
          </div>
        ) : filteredIdeas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No ideas found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredIdeas.map((idea) => (
                    <tr key={idea.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{idea.title}</p>
                          <p className="text-sm text-gray-500 mt-1">{idea.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                          {CATEGORIES.find(c => c.key === idea.category)?.label || idea.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          idea.difficulty === 'easy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {idea.difficulty === 'easy' ? 'Easy' : 'Moderate'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(idea.id, idea.is_active)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            idea.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {idea.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                          {idea.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(idea)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(idea.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

