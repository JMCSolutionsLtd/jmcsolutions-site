/**
 * Portal Dashboard — fully redesigned with draggable, collapsible, exportable sections.
 */
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { portalApi } from './portalApi';
import { usePortalAuth } from './PortalContext';
import { OverallProgressChart, CategoryProgressChart } from './components/ProgressChart';
import HeroScoreCard from './components/HeroScoreCard';
import DeliveryChecklist, { getChecklistExportData } from './components/DeliveryChecklist';
import AdoptionStats, { getAdoptionExportData } from './components/AdoptionStats';
import ProjectDocuments from './components/ProjectDocuments';
import MilestoneHistory, { getMilestoneExportData } from './components/MilestoneHistory';
import SectionWrapper from './components/SectionWrapper';
import SecuritySettings from './components/SecuritySettings';
import { exportToCsv } from './utils/exportCsv';
import { exportToPdf } from './utils/exportPdf';
import {
  FileText,
  Plus,
  Loader2,
  TrendingUp,
  Activity,
  LogOut,
  Shield,
  ChevronRight,
  CheckCircle2,
  BarChart3,
  History,
  FolderOpen,
} from 'lucide-react';
import logo from '../assets/JMC Solutions_v2_4.png';

const CATEGORIES = [
  'AI Readiness: Business Strategy',
  'AI Readiness: Organisation & Culture',
  'AI Readiness: AI Strategy & Experience',
  'AI Readiness: Data Foundations',
  'AI Readiness: AI Governance & Security',
  'AI Readiness: Technology & Infrastructure',
];

/* ── Bundle → Assessment Category mapping ── */
const SERVICE_CATEGORIES = {
  foundations: ['AI Readiness: Business Strategy', 'AI Readiness: Data Foundations'],
  copilot:    ['AI Readiness: AI Strategy & Experience'],
  training:   ['AI Readiness: Organisation & Culture'],
  automations: ['AI Readiness: Technology & Infrastructure', 'AI Readiness: AI Governance & Security'],
  ml:         ['AI Readiness: Technology & Infrastructure'],
};

const BUNDLES = {
  training:  { label: 'Training',     modules: ['training', 'retainer'] },
  airollout: { label: 'AI Rollout',   modules: ['foundations', 'copilot', 'training', 'retainer'] },
  automate:  { label: 'Automate',     modules: ['foundations', 'copilot', 'training', 'automations', 'retainer'] },
  complete:  { label: 'Complete',     modules: ['foundations', 'copilot', 'training', 'automations', 'ml', 'retainer'] },
};

const OFFERING_LABELS = {
  foundations: 'AI Foundations',
  copilot:    'Copilot 365',
  training:   'Training & Adoption',
  automations: 'AI Automations',
  ml:         'ML & Analytics',
};

function getCategoriesForFilter(filterValue) {
  if (!filterValue) return CATEGORIES;
  const modules = BUNDLES[filterValue]?.modules;
  const moduleList = modules || [filterValue];
  const cats = new Set();
  moduleList.forEach((mod) => {
    (SERVICE_CATEGORIES[mod] || []).forEach((cat) => cats.add(cat));
  });
  const filtered = CATEGORIES.filter((c) => cats.has(c));
  return filtered.length > 0 ? filtered : CATEGORIES;
}

function recomputeOverall(scores, filteredCats) {
  if (!scores?.categories) return null;
  let sumTotal = 0, countTotal = 0;
  for (const cat of filteredCats) {
    const cs = scores.categories[cat];
    if (cs?.answered > 0) {
      // Use raw sum if available (from server), otherwise reconstruct from percent
      const rawSum = cs.sum != null ? cs.sum : Math.round(cs.percent * cs.answered * 5 / 100);
      sumTotal += rawSum;
      countTotal += cs.answered;
    }
  }
  return countTotal > 0 ? { percent: Math.round((sumTotal / (countTotal * 5)) * 100), answered: countTotal } : null;
}

const SECTION_ORDER_KEY = 'portal_section_order_v4';

const DEFAULT_SECTIONS = [
  'charts',
  'assessment',
  'checklist',
  'milestones',
  'adoption',
  'documents',
];

function loadSectionOrder() {
  try {
    const raw = localStorage.getItem(SECTION_ORDER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all sections are present
      const merged = [...parsed, ...DEFAULT_SECTIONS.filter((s) => !parsed.includes(s))];
      return merged;
    }
  } catch { /* ignore */ }
  return [...DEFAULT_SECTIONS];
}

export default function PortalDashboard() {
  const { client, logout } = usePortalAuth();
  const [showSecurity, setShowSecurity] = useState(false);
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [sectionOrder, setSectionOrder] = useState(loadSectionOrder);
  const [bundleFilter, setBundleFilter] = useState('');

  const filteredCategories = useMemo(() => getCategoriesForFilter(bundleFilter), [bundleFilter]);

  const filteredMilestones = useMemo(() => {
    if (filteredCategories.length === CATEGORIES.length) return milestones;
    return milestones.map((m) => ({
      ...m,
      scores: {
        ...m.scores,
        overall: recomputeOverall(m.scores, filteredCategories) || m.scores?.overall,
      },
    }));
  }, [milestones, filteredCategories]);

  // Drag state
  const dragItem = useRef(null);
  const dragOver = useRef(null);

  // Ref map for PDF exports
  const sectionRefs = useRef({});

  const fetchMilestones = useCallback(() => {
    portalApi
      .listAssessments()
      .then((data) => setMilestones(data.milestones))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchMilestones(); }, [fetchMilestones]);

  const handleNewAssessment = async () => {
    setCreating(true);
    try {
      const data = await portalApi.createAssessment();
      navigate(`/portal/assessment/${data.milestone.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const latest = milestones.length > 0 ? milestones[milestones.length - 1] : null;

  /* ── Drag-and-Drop handlers ── */
  const handleDragStart = (idx) => { dragItem.current = idx; };
  const handleDragEnter = (idx) => { dragOver.current = idx; };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOver.current === null) return;
    const reordered = [...sectionOrder];
    const [moved] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOver.current, 0, moved);
    setSectionOrder(reordered);
    localStorage.setItem(SECTION_ORDER_KEY, JSON.stringify(reordered));
    dragItem.current = null;
    dragOver.current = null;
  };

  /* ── Section renderers ── */
  const renderSection = (sectionId, idx) => {
    const dragProps = {
      draggable: true,
      onDragStart: () => handleDragStart(idx),
      onDragEnter: () => handleDragEnter(idx),
      onDragEnd: handleDragEnd,
      onDragOver: (e) => e.preventDefault(),
    };

    const setRef = (el) => { sectionRefs.current[sectionId] = el; };

    switch (sectionId) {
      case 'assessment':
        return (
          <div key={sectionId} ref={setRef} {...dragProps}>
            <SectionWrapper
              id="assessment"
              title="AI Readiness Assessment"
              icon={<FileText size={18} />}
              accent="blue"
              onExportCsv={() => {
                if (!latest?.scores?.categories) return;
                const rows = CATEGORIES.map((c) => {
                  const s = latest.scores.categories[c];
                  return { Category: c.replace('AI Readiness: ', ''), Score: s ? `${s.percent}%` : '-', Answered: s?.answered ?? 0 };
                });
                exportToCsv(rows, 'ai-readiness-scores.csv');
              }}
              onExportPdf={() => exportToPdf('AI Readiness Assessment', sectionRefs.current.assessment)}
            >
              {/* Quick action cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Current assessment */}
                <div className="bg-slate-50/60 rounded-lg p-4 border border-slate-200/60">
                  <h4 className="text-[11px] font-semibold uppercase text-slate-500 mb-2 tracking-wider">Current Assessment</h4>
                  {latest ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600 truncate">{latest.title}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${latest.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {latest.status === 'completed' ? 'Done' : 'Draft'}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/portal/assessment/${latest.id}`)}
                        className="w-full py-2.5 bg-blue-900 text-white text-xs font-semibold rounded-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-1"
                      >
                        {latest.status === 'completed' ? 'View' : 'Continue'} <ChevronRight size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-slate-400 mb-2">No assessments yet</p>
                      <button
                        onClick={handleNewAssessment}
                        disabled={creating}
                        className="w-full py-2.5 bg-blue-900 text-white text-xs font-semibold rounded-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Start
                      </button>
                    </>
                  )}
                </div>
                {/* New milestone */}
                {latest && (
                  <div className="bg-slate-50/60 rounded-lg p-4 border border-slate-200/60">
                    <h4 className="text-[11px] font-semibold uppercase text-slate-500 mb-2 tracking-wider">New Milestone</h4>
                    <p className="text-xs text-slate-400 mb-2">Track progress since last review</p>
                    <button
                      onClick={handleNewAssessment}
                      disabled={creating}
                      className="w-full py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create
                    </button>
                  </div>
                )}
                {/* Count */}
                <div className="bg-slate-50/60 rounded-lg p-4 border border-slate-200/60">
                  <h4 className="text-[11px] font-semibold uppercase text-slate-500 mb-2 tracking-wider">Total Assessments</h4>
                  <p className="text-3xl font-bold text-slate-900">{milestones.length}</p>
                </div>
              </div>
            </SectionWrapper>
          </div>
        );

      case 'checklist':
        return (
          <div key={sectionId} ref={setRef} {...dragProps}>
            <SectionWrapper
              id="checklist"
              title="Delivery Checklist"
              icon={<CheckCircle2 size={18} />}
              accent="emerald"
              onExportCsv={() => {
                const el = sectionRefs.current.checklist;
                // Checklist exports via its own helper — we let it fetch from state
                // We access checklist state through the DeliveryChecklist exposed helper
                // For now we trigger a generic approach
              }}
              onExportPdf={() => exportToPdf('Delivery Checklist', sectionRefs.current.checklist)}
            >
              <DeliveryChecklist
                onExportCsv={(tasks) => {
                  exportToCsv(getChecklistExportData(tasks), 'delivery-checklist.csv');
                }}
              />
            </SectionWrapper>
          </div>
        );

      case 'adoption':
        return (
          <div key={sectionId} ref={setRef} {...dragProps}>
            <SectionWrapper
              id="adoption"
              title="AI Adoption Statistics"
              icon={<BarChart3 size={18} />}
              accent="violet"
              onExportCsv={() => exportToCsv(getAdoptionExportData(), 'adoption-stats.csv')}
              onExportPdf={() => exportToPdf('AI Adoption Statistics', sectionRefs.current.adoption)}
            >
              <AdoptionStats />
            </SectionWrapper>
          </div>
        );

      case 'charts':
        if (milestones.length === 0) return null;
        return (
          <div key={sectionId} ref={setRef} {...dragProps}>
            <SectionWrapper
              id="charts"
              title="Progress Charts"
              icon={<TrendingUp size={18} />}
              accent="sky"
              onExportPdf={() => exportToPdf('Progress Charts', sectionRefs.current.charts)}
            >
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-slate-50/60 rounded-lg p-4 border border-slate-200/60">
                  <h4 className="text-[11px] font-semibold uppercase text-slate-500 mb-4 flex items-center gap-1.5 tracking-wider">
                    <TrendingUp size={14} /> Overall Score Trend
                  </h4>
                  <OverallProgressChart milestones={filteredMilestones} />
                </div>
                <div className="bg-slate-50/60 rounded-lg p-4 border border-slate-200/60">
                  <h4 className="text-[11px] font-semibold uppercase text-slate-500 mb-4 flex items-center gap-1.5 tracking-wider">
                    <Activity size={14} /> Category Breakdown
                  </h4>
                  <CategoryProgressChart milestones={filteredMilestones} categories={filteredCategories} />
                </div>
              </div>
            </SectionWrapper>
          </div>
        );

      case 'milestones':
        if (milestones.length === 0) return null;
        return (
          <div key={sectionId} ref={setRef} {...dragProps}>
            <SectionWrapper
              id="milestones"
              title="Milestone History"
              icon={<History size={18} />}
              accent="slate"
              onExportCsv={() => exportToCsv(getMilestoneExportData(milestones), 'milestone-history.csv')}
              onExportPdf={() => exportToPdf('Milestone History', sectionRefs.current.milestones)}
            >
              <MilestoneHistory milestones={milestones} onRefresh={fetchMilestones} />
            </SectionWrapper>
          </div>
        );

      case 'documents':
        return (
          <div key={sectionId} ref={setRef} {...dragProps}>
            <SectionWrapper
              id="documents"
              title="Project Documents"
              icon={<FolderOpen size={18} />}
              accent="rose"
              onExportPdf={() => exportToPdf('Project Documents', sectionRefs.current.documents)}
            >
              <ProjectDocuments />
            </SectionWrapper>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 size={28} className="animate-spin text-blue-900 mb-3" />
        <p className="text-sm text-slate-400 font-medium">Loading portal…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blue-950/95 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <a href="/" title="Back to JMC Solutions homepage"><img src={logo} alt="JMC Solutions" className="h-10 sm:h-14 w-auto shrink-0" /></a>
            <div className="border-l border-white/10 pl-2 sm:pl-4 min-w-0">
              <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">{client?.name || 'Client Portal'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <a href="/" className="hidden sm:inline-block text-xs font-medium text-blue-200/80 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5">JMC Home</a>
            <a href="/" className="sm:hidden text-blue-200/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" title="JMC Home"><ChevronRight size={18} /></a>
            <button onClick={() => setShowSecurity(true)} className="text-blue-200/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" title="Security settings"><Shield size={18} /></button>
            <button onClick={logout} className="text-blue-200/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" title="Sign out"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5 animate-fade-in">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 animate-fade-in">{error}</div>
        )}

        <HeroScoreCard
          milestones={filteredMilestones}
          categories={filteredCategories}
          bundleFilter={bundleFilter}
          onBundleFilterChange={setBundleFilter}
          bundles={BUNDLES}
          offerings={OFFERING_LABELS}
        />

        <p className="text-[10px] text-slate-400/50 text-center font-medium tracking-wide">
          Drag sections to reorder · Click header to collapse
        </p>

        {sectionOrder.filter((id) => id !== 'scores').map((id, idx) => renderSection(id, idx))}
      </div>

      {showSecurity && <SecuritySettings onClose={() => setShowSecurity(false)} />}
    </div>
  );
}
