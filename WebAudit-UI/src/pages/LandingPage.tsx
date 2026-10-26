import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Globe, Eye, Compass, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { normaliseUrl } from '../utils/url';
import { auditService } from '../services/api';
import { AuthButton } from '../components/shared/AuthButton';

export const LandingPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleStartAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = normaliseUrl(url);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const targetUrl = result.url;
    setError('');
    setIsLoading(true);

    try {
      const data = await auditService.startAudit(targetUrl, 'PAGE');
      setIsLoading(false);
      if (data && data.id) {
        sessionStorage.setItem('audit_record_id', data.id.toString());
        sessionStorage.setItem('is_audit_started', 'true');
        sessionStorage.setItem('url', targetUrl);
        navigate(`/audit/${data.id}/review`);
      } else {
        navigate(`/audits`);
      }
    } catch {
      setIsLoading(false);
      const dynamicResult = await auditService.executeDynamicAuditForUrl(targetUrl);
      sessionStorage.setItem('audit_record_id', dynamicResult.record.id.toString());
      sessionStorage.setItem('url', targetUrl);
      navigate(`/audit/${dynamicResult.record.id}/review`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-charcoal-950 flex flex-col text-white">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center text-white">
            <Search size={20} />
          </div>
          <span className="text-xl font-semibold text-white tracking-tight">WebAudit</span>
        </div>
        <div className="w-32">
          <AuthButton />
        </div>
      </header>

      {/* Hero section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 -mt-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 mb-8">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          <span className="text-xs font-medium text-white/90">
            Open source · Engineered in public · WCAG 2.2
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white text-center max-w-3xl leading-tight tracking-tight">
          Audit your website the way a user{' '}
          <span className="text-brand-400">actually reads it.</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-white/70 text-center max-w-xl leading-relaxed">
          In HTML, in rendered pixels, and across the journeys between pages. Paste a URL — WebAudit
          walks the site like a real visitor and tells you where it falls apart.
        </p>

        {/* URL Input Form */}
        <form onSubmit={handleStartAudit} className="w-full max-w-2xl mt-10">
          <div className="bg-white rounded-2xl p-2 shadow-elevated flex items-center gap-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                <Globe size={20} />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter a website URL (e.g. https://www.example.com)"
                className="w-full pl-12 pr-4 py-4 text-base bg-transparent border-0 focus:ring-0 focus:outline-none placeholder-gray-400 text-gray-900"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-accent px-8 py-4 text-base font-semibold rounded-xl flex items-center gap-2 whitespace-nowrap disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin text-white" />
                  <span>Starting…</span>
                </>
              ) : (
                <span>Start Audit</span>
              )}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-3xl w-full">
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3 text-brand-400">
              <Eye size={24} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5">Rendered pixels</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Contrast, typography, and whitespace measured from what actually paints on screen — not
              from CSS rules that may be overridden.
            </p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3 text-brand-400">
              <Compass size={24} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5">Real user journeys</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              A headless browser drives login, checkout, and search — catching issues only visible
              mid-flow, not on the landing page.
            </p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3 text-brand-400">
              <BookOpen size={24} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5">Explanations that teach</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Every violation comes with the WCAG success criterion it fails and a plain-English
              reason it matters — not just a red flag.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-5 text-center text-xs text-white/40">
        <p>Open source, engineered in public, built to be looked at.</p>
      </footer>
    </div>
  );
};
