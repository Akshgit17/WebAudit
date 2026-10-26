import React, { useEffect, useState } from 'react';
import { Domain } from '../types';
import { auditService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Globe, Plus, Sliders, CheckSquare, Share2 } from 'lucide-react';

export const DomainsPage: React.FC = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomainUrl, setNewDomainUrl] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      auditService
        .getDomains()
        .then((data) => setDomains(data || []))
        .catch(() => {
          setDomains([{ id: 1, url: 'https://example.com', host: 'example.com' }]);
        });
    }
  }, [isAuthenticated]);

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainUrl) return;
    const clean = newDomainUrl.replace(/^https?:\/\//, '');
    setDomains((prev) => [
      ...prev,
      { id: Date.now(), url: `https://${clean}`, host: clean },
    ]);
    setNewDomainUrl('');
    setShowAddModal(false);
  };

  if (!isAuthenticated) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Domain Management</h1>
          <p className="text-gray-500 mb-6 max-w-lg mx-auto">
            Create an account or sign in to audit entire domains, track user journeys, and monitor UX improvements over time.
          </p>
          <button onClick={() => loginWithRedirect()} className="btn-accent px-6 py-2.5">
            Sign in to manage domains
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 text-center card-hover">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              1
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Customize</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your website is made for a particular target audience. WebAudit tailors results to your specific requirements.
            </p>
          </div>

          <div className="card p-6 text-center card-hover">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              2
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Review</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Learn which pages need the most attention and how to improve ADA compliance and user conversion.
            </p>
          </div>

          <div className="card p-6 text-center card-hover">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              3
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Share</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Share UX audit results, element details, and accessibility reports with your engineering team and stakeholders.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Domain Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and configure ongoing UX audits across entire domain sites.
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-accent flex items-center gap-2">
          <Plus size={16} />
          <span>Add Domain</span>
        </button>
      </div>

      {domains.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <Globe size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-gray-800">No domains registered yet.</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Domain" above to register your website.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domains.map((dom) => (
            <div key={dom.id} className="card p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Globe size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{dom.host || dom.url}</h3>
                  <span className="text-2xs text-gray-400 font-mono">{dom.url}</span>
                </div>
              </div>
              <span className="badge bg-emerald-50 text-emerald-700">Active</span>
            </div>
          ))}
        </div>
      )}

      {/* Add Domain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-elevated p-6 z-50">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Register Domain</h2>
            <p className="text-xs text-gray-500 mb-4">
              Enter the root URL of your domain to monitor in WebAudit.
            </p>

            <form onSubmit={handleAddDomain} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={newDomainUrl}
                  onChange={(e) => setNewDomainUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  className="w-full text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn-accent">
                  Save Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
