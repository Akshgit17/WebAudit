import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Compass } from 'lucide-react';
import { AuditRecord, AuditStats } from '../types';
import { auditService } from '../services/api';
import { ScoreGauge } from '../components/shared/ScoreGauge';
import { ScoreBadge } from '../components/shared/ScoreBadge';
import { Skeleton } from '../components/shared/Skeleton';

export const AuditDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const domainAuditId = parseInt(id || '1', 10);

  const [auditStats, setAuditStats] = useState<AuditStats>({
    accessibilityScore: 84,
    journeysExplored: 12,
    journeysTotal: 15,
    textContrastScore: 88,
    nonTextContrastScore: 92,
    seoScore: 95,
    linkScore: 82,
    writtenContentScore: 78,
    imageryScore: 85,
  });

  const [pageAudits, setPageAudits] = useState<AuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      auditService.getAuditStats(domainAuditId).catch(() => null),
      auditService.getPageAuditsForDomain(domainAuditId).catch(() => null),
    ]).then(([stats, audits]) => {
      if (!mounted) return;
      if (stats) setAuditStats(stats);
      if (audits) {
        setPageAudits(audits);
      } else {
        setPageAudits([
          {
            id: 1,
            key: 'page-1',
            url: 'https://example.com/',
            status: 'COMPLETE',
            level: 'PAGE',
            contentAuditScore: 92,
            infoArchScore: 88,
            aestheticScore: 80,
          },
          {
            id: 2,
            key: 'page-2',
            url: 'https://example.com/about',
            status: 'COMPLETE',
            level: 'PAGE',
            contentAuditScore: 85,
            infoArchScore: 82,
            aestheticScore: 76,
          },
          {
            id: 3,
            key: 'page-3',
            url: 'https://example.com/contact',
            status: 'COMPLETE',
            level: 'PAGE',
            contentAuditScore: 88,
            infoArchScore: 80,
            aestheticScore: 72,
          },
        ]);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [domainAuditId]);

  const auditCategories = [
    {
      name: 'Visual Design',
      description: 'Color contrast, visual balance, and typography hierarchy.',
      subcategories: [
        { label: 'Text Contrast', score: auditStats.textContrastScore },
        { label: 'Non-Text Contrast', score: auditStats.nonTextContrastScore },
      ],
    },
    {
      name: 'Information Architecture',
      description: 'Site structure, navigation paths, and SEO metadata.',
      subcategories: [
        { label: 'SEO Metadata', score: auditStats.seoScore },
        { label: 'Links & Navigation', score: auditStats.linkScore },
      ],
    },
    {
      name: 'Content Quality',
      description: 'Readability, heading structure, and image alt text.',
      subcategories: [
        { label: 'Written Content', score: auditStats.writtenContentScore },
        { label: 'Imagery & Graphics', score: auditStats.imageryScore },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/audit')}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          title="Back to audits"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Domain Audit Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">Comprehensive multi-page audit #{domainAuditId}</p>
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Overall Accessibility Score */}
        <div className="card p-6 flex flex-col items-center justify-center">
          <ScoreGauge score={auditStats.accessibilityScore} size={120} label="Accessibility Score" />
        </div>

        {/* Reviewed Interactions */}
        <div className="card p-6 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Compass size={22} />
          </div>
          <h4 className="text-sm font-semibold text-gray-500 mb-2">Reviewed Interactions</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{auditStats.journeysExplored}</span>
            <span className="text-sm text-gray-400">of</span>
            <span className="text-3xl font-bold text-gray-900">{auditStats.journeysTotal}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">user paths evaluated</p>
        </div>

        {/* Category breakdown cards */}
        {auditCategories.slice(0, 2).map((cat) => (
          <div key={cat.name} className="card p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{cat.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
            </div>
            <div className="space-y-3 border-t border-gray-100 pt-4 mt-4">
              {cat.subcategories.map((sub) => (
                <div key={sub.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{sub.label}</span>
                  <ScoreBadge score={sub.score} size="sm" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Page Audit List */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Audited Pages</h2>

        {isLoading ? (
          <Skeleton variant="row" rows={3} />
        ) : (
          <div className="space-y-2">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-5">URL</div>
              <div className="col-span-2 text-center">Content</div>
              <div className="col-span-2 text-center">Info Architecture</div>
              <div className="col-span-2 text-center">Aesthetic</div>
              <div className="col-span-1" />
            </div>

            {pageAudits.map((record) => (
              <div
                key={record.id}
                onClick={() => navigate(`/audit/${record.id}/page`)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(`/audit/${record.id}/page`);
                }}
                className="card-interactive px-5 py-4 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5 truncate">
                    <p className="text-sm font-medium text-gray-900 truncate">{record.url}</p>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <ScoreBadge score={record.contentAuditScore} size="sm" />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <ScoreBadge score={record.infoArchScore} size="sm" />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <ScoreBadge score={record.aestheticScore} size="sm" />
                  </div>
                  <div className="col-span-1 flex justify-center text-gray-400">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
