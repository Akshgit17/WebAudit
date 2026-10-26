import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { AuditRecord } from '../types';
import { auditService } from '../services/api';
import { executeDynamicAudit } from '../services/auditEngine';
import { normaliseUrl } from '../utils/url';
import { ScoreBadge } from '../components/shared/ScoreBadge';
import { StatusChip } from '../components/shared/StatusChip';
import { Skeleton } from '../components/shared/Skeleton';
import { EmptyState } from '../components/shared/EmptyState';

export const AuditListPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [auditType, setAuditType] = useState<'PAGE' | 'DOMAIN'>('PAGE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [isLoadingAudits, setIsLoadingAudits] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    auditService
      .getAudits()
      .then((data) => {
        if (!mounted) return;
        setRecords(data || []);
        setIsLoadingAudits(false);
      })
      .catch((err) => {
        console.warn('Backend audits not reachable, loading dynamic records:', err);
        if (!mounted) return;
        const defaultDynamic = executeDynamicAudit('https://devdocs.io/fastapi/');
        setRecords([defaultDynamic.record]);
        setIsLoadingAudits(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
      const data = await auditService.startAudit(targetUrl, auditType);
      setIsLoading(false);
      if (data && data.id) {
        sessionStorage.setItem('audit_record_id', data.id.toString());
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

  const handleSelectAudit = (record: AuditRecord) => {
    sessionStorage.setItem('audit_record_id', record.id.toString());
    sessionStorage.setItem('url', record.url);
    if (record.level === 'DOMAIN') {
      navigate(`/audit/${record.id}/domain`);
    } else {
      navigate(`/audit/${record.id}/page`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">
      {/* Top Audit Form */}
      <div className="w-full flex justify-center pt-8 pb-6 px-4">
        <div className="w-full max-w-3xl">
          <form onSubmit={handleStartAudit}>
            <div className="card p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-sm">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                  <Globe size={18} />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter website URL (e.g. https://www.example.com)"
                  className="w-full pl-11 pr-4 py-3 text-sm bg-transparent border-0 focus:ring-0 focus:outline-none placeholder-gray-400"
                />
              </div>

              {/* Type Select */}
              <div className="flex-shrink-0">
                <select
                  value={auditType}
                  onChange={(e) => setAuditType(e.target.value as 'PAGE' | 'DOMAIN')}
                  className="border-0 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 py-2.5 px-4 focus:ring-2 focus:ring-brand-500 cursor-pointer w-full sm:w-auto"
                >
                  <option value="PAGE">Single Page</option>
                  <option value="DOMAIN">Entire Domain</option>
                </select>
              </div>

              {/* Start Button */}
              <div className="flex-shrink-0">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-accent px-6 py-2.5 w-full sm:w-auto flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-75"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Auditing…</span>
                    </>
                  ) : (
                    <span>Start Audit</span>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-2 ml-1 flex items-center gap-2 text-xs text-red-500">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2 ml-1">
              Enter a publicly accessible URL to analyze its UX, accessibility, and content quality.
            </p>
          </form>
        </div>
      </div>

      {/* Audit Table */}
      <div className="px-6 pb-12 max-w-6xl mx-auto w-full flex-1">
        {isLoadingAudits ? (
          <div className="mt-4">
            <Skeleton variant="row" rows={4} />
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            title="Run your first audit."
            body="Paste a URL above — we'll check accessibility, content quality, and visual design, and rank every issue by impact."
            compact={true}
          />
        ) : (
          <div>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">URL</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-center">Type</div>
              <div className="col-span-2 text-center">Content</div>
              <div className="col-span-2 text-center">Info Architecture</div>
              <div className="col-span-1 text-center">Aesthetic</div>
              <div className="col-span-1" />
            </div>

            {/* Audit Rows */}
            <div className="space-y-2 mt-2">
              {records.map((record) => (
                <div
                  key={record.id}
                  onClick={() => handleSelectAudit(record)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSelectAudit(record);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select audit for ${record.url}`}
                  className="card-interactive px-5 py-4 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* URL */}
                    <div className="col-span-4 truncate">
                      <p className="text-sm font-medium text-gray-900 truncate">{record.url}</p>
                    </div>

                    {/* Status */}
                    <div className="col-span-1 flex justify-center">
                      <StatusChip kind={record.status} size="sm" />
                    </div>

                    {/* Type */}
                    <div className="col-span-1 flex justify-center">
                      <span
                        className={`badge ${
                          record.level === 'PAGE'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {record.level}
                      </span>
                    </div>

                    {/* Content Score */}
                    <div className="col-span-2 flex justify-center">
                      <ScoreBadge
                        score={record.contentAuditScore}
                        loading={record.contentAuditScore < 1 && record.status === 'RUNNING'}
                        size="sm"
                      />
                    </div>

                    {/* Info Architecture Score */}
                    <div className="col-span-2 flex justify-center">
                      <ScoreBadge
                        score={record.infoArchScore}
                        loading={record.infoArchScore < 1 && record.status === 'RUNNING'}
                        size="sm"
                      />
                    </div>

                    {/* Aesthetic Score */}
                    <div className="col-span-1 flex justify-center">
                      <ScoreBadge
                        score={record.aestheticScore}
                        loading={record.aestheticScore < 1 && record.status === 'RUNNING'}
                        size="sm"
                      />
                    </div>

                    {/* Chevron */}
                    <div className="col-span-1 flex justify-center text-gray-400">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
