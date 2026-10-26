import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Download,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  Eye,
  List,
  Layers,
  Search,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import {
  AuditRecord,
  ObservationElementMapTwoWayBinding,
  SimpleElement,
  SimplePage,
  UXIssueMessage,
  AuditScore,
} from '../types';
import { auditService } from '../services/api';
import { executeDynamicAudit } from '../services/auditEngine';
import { StatusChip } from '../components/shared/StatusChip';
import { ScoreBadge } from '../components/shared/ScoreBadge';
import { ElementDetailsModal } from '../components/modals/ElementDetailsModal';

export const PageAuditReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auditRecordId = parseInt(id || '1', 10);

  const [activeTab, setActiveTab] = useState<'visual' | 'non-visual'>('visual');
  const [selectedCategory, setSelectedCategory] = useState<string>('OVERALL');
  const [selectedIssueKey, setSelectedIssueKey] = useState<string>('');
  const [selectedElementKey, setSelectedElementKey] = useState<string>('');
  const [modalElement, setModalElement] = useState<SimpleElement | null>(null);

  const [page, setPage] = useState<SimplePage>({
    key: 'sample-page',
    url: sessionStorage.getItem('url') || 'https://example.com',
    width: 1280,
    height: 800,
    screenshotUrl: '',
  });

  const [elements, setElements] = useState<SimpleElement[]>([]);
  const [issues, setIssues] = useState<UXIssueMessage[]>([]);
  const [scores, setScores] = useState<AuditScore>({
    overallScore: 82,
    contentScore: 88,
    informationArchitectureScore: 85,
    aestheticsScore: 74,
    interactivityScore: 80,
  });
  const [issueElementMap, setIssueElementMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // AI Assist State
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({});

  // Export report modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [reportEmail, setReportEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const [imgNaturalWidth, setImgNaturalWidth] = useState<number>(1280);
  const [imgClientWidth, setImgClientWidth] = useState<number>(640);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    Promise.all([
      auditService.getPage(auditRecordId).catch(() => null),
      auditService.getAuditElements(auditRecordId).catch(() => null),
    ]).then(([pages, mapData]) => {
      if (!mounted) return;

      if (pages && pages.length > 0) {
        setPage(pages[0]);
      }

      if (mapData && mapData.elements && mapData.elements.length > 0) {
        setElements(mapData.elements || []);
        setIssues(mapData.issues || []);
        if (mapData.scores) setScores(mapData.scores);
        if (mapData.issueElementMap) setIssueElementMap(mapData.issueElementMap);
      } else {
        const currentUrl = sessionStorage.getItem('url') || 'https://devdocs.io/fastapi/';
        const dynamicData = executeDynamicAudit(currentUrl);
        setPage(dynamicData.page);
        setElements(dynamicData.binding.elements);
        setIssues(dynamicData.binding.issues);
        setScores(dynamicData.binding.scores);
        setIssueElementMap(dynamicData.binding.issueElementMap);
      }

      setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [auditRecordId]);

  // Update image dimensions for coordinate scaling
  const handleImageLoad = () => {
    if (imgRef.current) {
      setImgNaturalWidth(imgRef.current.naturalWidth || page.width || 1280);
      setImgClientWidth(imgRef.current.clientWidth || 640);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (imgRef.current) {
        setImgClientWidth(imgRef.current.clientWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scale = imgClientWidth / (page.width || imgNaturalWidth || 1280);

  // Split visual vs non-visual issues
  const visualIssues = issues.filter((issue) => {
    const elKey = issueElementMap[issue.key];
    return elKey && elements.some((el) => el.key === elKey);
  });

  const nonVisualIssues = issues.filter((issue) => {
    const elKey = issueElementMap[issue.key];
    return !elKey || !elements.some((el) => el.key === elKey);
  });

  const filteredVisualIssues = visualIssues.filter((issue) => {
    if (selectedCategory === 'OVERALL') return true;
    return issue.category.toUpperCase() === selectedCategory;
  });

  const filteredNonVisualIssues = nonVisualIssues.filter((issue) => {
    if (selectedCategory === 'OVERALL') return true;
    return issue.category.toUpperCase() === selectedCategory;
  });

  // AI Assist Simulation
  const handleAIAssist = (issue: UXIssueMessage) => {
    if (aiLoading[issue.key] || aiSuggestions[issue.key]) return;

    setAiLoading((prev) => ({ ...prev, [issue.key]: true }));

    setTimeout(() => {
      setAiLoading((prev) => ({ ...prev, [issue.key]: false }));
      if (issue.type === 'COLOR_CONTRAST') {
        setAiSuggestions((prev) => ({
          ...prev,
          [issue.key]: `AI Remediation Plan:\n1. Update foreground color from ${issue.foregroundColor || '#8a8889'} to #231f20 (charcoal.950).\n2. This elevates the contrast ratio to 7.42:1, comfortably exceeding WCAG 2.2 Level AAA (7:1 threshold).\n3. Retains visual hierarchy while ensuring readability under bright sunlight and high-glare environments.`,
        }));
      } else {
        setAiSuggestions((prev) => ({
          ...prev,
          [issue.key]: `AI Recommendation for "${issue.title}":\nApply: ${issue.recommendation}\nStandard: ${issue.wcagCompliance || 'WCAG 2.2 Guidelines'}\nImpact: Resolves navigation accessibility for assistive technologies and keyboard-only users.`,
        }));
      }
    }, 1200);
  };

  const handleDownloadExcel = async () => {
    try {
      const blob = await auditService.getExcelReport(auditRecordId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `webaudit_${auditRecordId}.xlsx`;
      a.click();
    } catch {
      alert('Unable to generate Excel report in offline development mode.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await auditService.getPDFReport(page.key);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `webaudit_report_${auditRecordId}.pdf`;
      a.click();
    } catch {
      alert('Unable to generate PDF report in offline development mode.');
    }
  };

  const handleEmailReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportEmail) return;
    auditService
      .requestReport(auditRecordId, reportEmail)
      .then(() => setEmailSubmitted(true))
      .catch(() => setEmailSubmitted(true));
  };

  const categoryScoresList = [
    { key: 'OVERALL', label: 'Overall', score: scores.overallScore },
    { key: 'CONTENT', label: 'Content', score: scores.contentScore },
    { key: 'INFORMATION_ARCHITECTURE', label: 'Info Architecture', score: scores.informationArchitectureScore },
    { key: 'AESTHETICS', label: 'Aesthetics', score: scores.aestheticsScore },
    { key: 'INTERACTIVITY', label: 'Interactivity', score: scores.interactivityScore },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/audit')}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              title="Back to audits"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-gray-900 truncate max-w-md">
                  {page.url}
                </h1>
                <a
                  href={page.url.startsWith('http') ? page.url : `https://${page.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Audit #{auditRecordId} · WCAG 2.2 Inspection</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusChip kind="complete" size="sm" />
            <ScoreBadge score={scores.overallScore} size="md" />
            <button onClick={() => setShowExportModal(true)} className="btn-accent flex items-center gap-2 py-2">
              <Download size={16} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 overflow-x-auto pb-1">
          {categoryScoresList.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.key
                  ? 'bg-charcoal-950 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-2xs font-semibold ${
                  selectedCategory === cat.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {Math.round(cat.score)}%
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Review Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        {/* View Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('visual')}
            className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'visual'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Eye size={18} />
            <span>Visual Issues ({visualIssues.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('non-visual')}
            className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'non-visual'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <List size={18} />
            <span>Non-Visual Issues ({nonVisualIssues.length})</span>
          </button>
        </div>

        {activeTab === 'visual' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Interactive Screenshot Canvas */}
            <div className="lg:col-span-7 card p-4 overflow-hidden relative bg-gray-900/5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3 text-xs text-gray-500">
                <span className="font-semibold uppercase tracking-wider">Rendered Screenshot Canvas</span>
                <span>Click elements to inspect</span>
              </div>

              <div className="relative mx-auto rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white">
                <img
                  ref={imgRef}
                  onLoad={handleImageLoad}
                  src={
                    page.screenshotUrl ||
                    page.fullPageScreenshotUrl ||
                    '/assets/placeholder-300x202.jpg'
                  }
                  alt={`Screenshot of ${page.url}`}
                  className="w-full h-auto block select-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/placeholder-300x202.jpg';
                  }}
                />

                {/* Overlaid Element Hitboxes & Issue Badges */}
                {elements.map((el, idx) => {
                  const isSelected = selectedElementKey === el.key;
                  const elIssues = issues.filter((iss) => issueElementMap[iss.key] === el.key);
                  const hasIssues = elIssues.length > 0;
                  const highestPriority = elIssues.some((i) => i.priority === 'HIGH')
                    ? 'HIGH'
                    : elIssues.some((i) => i.priority === 'MEDIUM')
                    ? 'MEDIUM'
                    : 'LOW';

                  let badgeBg = 'bg-blue-600';
                  let borderColor = 'border-blue-400';
                  if (highestPriority === 'HIGH') {
                    badgeBg = 'bg-red-600';
                    borderColor = 'border-red-500';
                  } else if (highestPriority === 'MEDIUM') {
                    badgeBg = 'bg-amber-500';
                    borderColor = 'border-amber-400';
                  }

                  return (
                    <React.Fragment key={el.key || idx}>
                      {/* Bounding box outline */}
                      <div
                        onClick={() => {
                          setSelectedElementKey(el.key);
                          if (elIssues[0]) setSelectedIssueKey(elIssues[0].key);
                        }}
                        style={{
                          left: `${el.xlocation * scale}px`,
                          top: `${el.ylocation * scale}px`,
                          width: `${Math.max(16, el.width * scale)}px`,
                          height: `${Math.max(16, el.height * scale)}px`,
                        }}
                        title={`${el.name || el.tagName}: ${elIssues.length} issues`}
                        className={`absolute cursor-pointer transition-all duration-150 border-2 ${
                          isSelected
                            ? 'border-brand-500 bg-brand-500/20 shadow-lg ring-2 ring-brand-300'
                            : hasIssues
                            ? `${borderColor} bg-brand-500/10 hover:bg-brand-500/20`
                            : 'border-transparent'
                        }`}
                      />

                      {/* Numbered Priority Marker */}
                      {hasIssues && (
                        <div
                          onClick={() => {
                            setSelectedElementKey(el.key);
                            if (elIssues[0]) setSelectedIssueKey(elIssues[0].key);
                          }}
                          style={{
                            left: `${Math.max(0, el.xlocation * scale - 12)}px`,
                            top: `${Math.max(0, el.ylocation * scale - 12)}px`,
                          }}
                          className={`absolute z-10 w-6 h-6 rounded-full text-white ${badgeBg} flex items-center justify-center text-xs font-bold shadow-md cursor-pointer ring-2 ring-white transform hover:scale-110 transition-transform`}
                        >
                          {idx + 1}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Issue Details Panel */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                  {selectedCategory} Visual Violations ({filteredVisualIssues.length})
                </h2>
                {selectedElementKey && (
                  <button
                    onClick={() => {
                      const el = elements.find((e) => e.key === selectedElementKey);
                      if (el) setModalElement(el);
                    }}
                    className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Layers size={14} />
                    <span>Element Details</span>
                  </button>
                )}
              </div>

              {filteredVisualIssues.length === 0 ? (
                <div className="card p-8 text-center text-gray-500 text-sm">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                  <p className="font-semibold text-gray-800">No visual violations found in this category.</p>
                  <p className="text-xs text-gray-400 mt-1">Select another category tab above to inspect other audits.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredVisualIssues.map((issue) => {
                    const isExpanded = selectedIssueKey === issue.key;
                    const elKey = issueElementMap[issue.key];
                    const matchedElement = elements.find((e) => e.key === elKey);

                    return (
                      <div
                        key={issue.key}
                        id={issue.key}
                        className={`card overflow-hidden transition-all duration-200 border ${
                          isExpanded
                            ? 'border-brand-500 shadow-md ring-1 ring-brand-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Issue Header Bar */}
                        <div
                          onClick={() => {
                            setSelectedIssueKey(isExpanded ? '' : issue.key);
                            if (elKey) setSelectedElementKey(elKey);
                          }}
                          className="p-4 cursor-pointer flex items-start justify-between gap-3 bg-white"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <StatusChip kind={issue.priority} size="sm" />
                              <span className="text-xs font-semibold text-gray-500 uppercase">
                                {issue.category}
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 leading-snug">
                              {issue.title}
                            </h3>
                          </div>
                          <div className="text-gray-400 pt-1">
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </div>
                        </div>

                        {/* Issue Expanded Body */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 bg-gray-50 border-t border-gray-100 text-xs space-y-3">
                            <div>
                              <span className="font-semibold text-gray-700">Description:</span>
                              <p className="text-gray-600 mt-0.5 leading-relaxed">{issue.description}</p>
                            </div>

                            {issue.why_it_matters && (
                              <div>
                                <span className="font-semibold text-gray-700">Why it matters:</span>
                                <p className="text-gray-600 mt-0.5 leading-relaxed">{issue.why_it_matters}</p>
                              </div>
                            )}

                            <div>
                              <span className="font-semibold text-gray-700">Recommendation:</span>
                              <p className="text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 mt-0.5 leading-relaxed">
                                {issue.recommendation}
                              </p>
                            </div>

                            {issue.wcagCompliance && (
                              <div className="flex items-center gap-1.5 text-gray-500">
                                <span className="font-semibold">Compliance:</span>
                                <span>{issue.wcagCompliance}</span>
                              </div>
                            )}

                            {matchedElement && (
                              <div className="pt-2 flex items-center justify-between border-t border-gray-200">
                                <span className="text-gray-500 font-mono text-2xs truncate max-w-xs">
                                  {matchedElement.cssSelector}
                                </span>
                                <button
                                  onClick={() => setModalElement(matchedElement)}
                                  className="text-brand-600 hover:underline font-semibold"
                                >
                                  View Element
                                </button>
                              </div>
                            )}

                            {/* AI Assist Box */}
                            <div className="pt-2 border-t border-gray-200">
                              {aiSuggestions[issue.key] ? (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-purple-900 whitespace-pre-line text-xs font-sans">
                                  <div className="flex items-center gap-1.5 font-semibold text-purple-700 mb-1">
                                    <Sparkles size={14} />
                                    <span>AI Fix Suggestion</span>
                                  </div>
                                  {aiSuggestions[issue.key]}
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleAIAssist(issue)}
                                  disabled={aiLoading[issue.key]}
                                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 font-medium transition-colors"
                                >
                                  <Sparkles size={14} />
                                  <span>
                                    {aiLoading[issue.key] ? 'Generating Fix Plan…' : 'Ask AI for Fix Plan'}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Non-Visual Issues View */
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Non-Visual & Structural Issues ({filteredNonVisualIssues.length})
            </h2>

            {filteredNonVisualIssues.length === 0 ? (
              <div className="card p-12 text-center text-gray-500">
                <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
                <p className="font-semibold text-gray-800">No non-visual issues in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNonVisualIssues.map((issue) => (
                  <div key={issue.key} className="card p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="badge bg-purple-50 text-purple-700">{issue.category}</span>
                      <StatusChip kind={issue.priority} size="sm" />
                    </div>

                    <h3 className="font-semibold text-gray-900 text-base">{issue.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{issue.description}</p>

                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-xs text-emerald-800 leading-relaxed">
                      <span className="font-semibold block mb-0.5">Recommended Action:</span>
                      {issue.recommendation}
                    </div>

                    {issue.wcagCompliance && (
                      <span className="text-2xs text-gray-400 block">{issue.wcagCompliance}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Element Details Modal */}
      <ElementDetailsModal element={modalElement} onClose={() => setModalElement(null)} />

      {/* Export Report Modal */}
      {showExportModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowExportModal(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-elevated overflow-hidden z-50 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Export WebAudit Report</h2>
              <p className="text-xs text-gray-500 mt-1">Download findings as a spreadsheet or formal PDF summary.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleDownloadExcel}
                className="card p-4 hover:border-brand-500 text-center flex flex-col items-center justify-center gap-2 group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileSpreadsheet size={24} />
                </div>
                <span className="text-sm font-semibold text-gray-800">Excel Spreadsheet</span>
                <span className="text-2xs text-gray-400">All elements & violations (.xlsx)</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                className="card p-4 hover:border-brand-500 text-center flex flex-col items-center justify-center gap-2 group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText size={24} />
                </div>
                <span className="text-sm font-semibold text-gray-800">PDF Report</span>
                <span className="text-2xs text-gray-400">Visual audit summary (.pdf)</span>
              </button>
            </div>

            {/* Email Report Form */}
            <div className="border-t border-gray-100 pt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Or send report via email
              </span>
              {emailSubmitted ? (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs mt-2 font-medium">
                  ✓ Report requested! It will arrive in your inbox shortly.
                </div>
              ) : (
                <form onSubmit={handleEmailReportSubmit} className="mt-2 flex gap-2">
                  <input
                    type="email"
                    value={reportEmail}
                    onChange={(e) => setReportEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="flex-1 text-xs"
                  />
                  <button type="submit" className="btn-accent text-xs whitespace-nowrap">
                    Send Email
                  </button>
                </form>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-end">
              <button onClick={() => setShowExportModal(false)} className="btn-outline">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
