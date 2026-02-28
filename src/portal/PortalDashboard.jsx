/**
 * Portal Dashboard — fully redesigned with draggable, collapsible, exportable sections.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { portalApi } from './portalApi';
import { usePortalAuth } from './PortalContext';
import { getScoreColor } from './components/ScoreBadge';
import { OverallProgressChart, CategoryProgressChart } from './components/ProgressChart';
import HeroScoreCard from './components/HeroScoreCard';
import DeliveryChecklist, { getChecklistExportData } from './components/DeliveryChecklist';
import AdoptionStats, { getAdoptionExportData } from './components/AdoptionStats';
import ProjectDocuments from './components/ProjectDocuments';
import MilestoneHistory, { getMilestoneExportData } from './components/MilestoneHistory';
import SectionWrapper from './components/SectionWrapper';
import AIRecommendations, { getRecommendationsExportData } from './components/AIRecommendations';
import { exportToCsv } from './utils/exportCsv';
import { exportToPdf } from './utils/exportPdf';
import {
  FileText,
  Plus,
  Loader2,
  TrendingUp,
  Activity,
  ClipboardList,
  LogOut,
  ChevronRight,
  CheckCircle2,
  BarChart3,
  History,
  FolderOpen,
} from 'lucide-react';
import logo from '../assets/JMC Solutions_v2_1.png';

const CATEGORIES = [
  'AI Readiness: Business Strategy',
  'AI Readiness: Organization and Culture',
  'AI Readiness: AI Strategy and Experience',
  'AI Readiness: Data Foundations',
  'AI Readiness: AI Governance and Security',
  'AI Readiness: Infrastructure for AI',
  'AI Readiness: Model Management',
];

const SECTION_ORDER_KEY = 'portal_section_order';

const DEFAULT_SECTIONS = [
  'assessment',
  'checklist',
  'adoption',
  'charts',
  'scores',
  'milestones',
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
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [sectionOrder, setSectionOrder] = useState(loadSectionOrder);

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
                  return { Category: c.replace('AI Readiness: ', ''), Score: s ? `${s.percent}%` : '—', Answered: s?.answered ?? 0 };
                });
                exportToCsv(rows, 'ai-readiness-scores.csv');
              }}
              onExportPdf={() => exportToPdf('AI Readiness Assessment', sectionRefs.current.assessment)}
            >
              {/* Quick action cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Current assessment */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Current Assessment</h4>
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
                        className="w-full py-2 bg-blue-900 text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition flex items-center justify-center gap-1"
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
                        className="w-full py-2 bg-blue-900 text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Start
                      </button>
                    </>
                  )}
                </div>
                {/* New milestone */}
                {latest && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">New Milestone</h4>
                    <p className="text-xs text-slate-400 mb-2">Track progress since last review</p>
                    <button
                      onClick={handleNewAssessment}
                      disabled={creating}
                      className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-500 transition flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create
                    </button>
                  </div>
                )}
                {/* Count */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Total Assessments</h4>
                  <p className="text-3xl font-black text-slate-900">{milestones.length}</p>
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
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-4 flex items-center gap-1">
                    <TrendingUp size={14} /> Overall Score Trend
                  </h4>
                  <OverallProgressChart milestones={milestones} />
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-4 flex items-center gap-1">
                    <Activity size={14} /> Category Breakdown
                  </h4>
                  <CategoryProgressChart milestones={milestones} categories={CATEGORIES} />
                </div>
              </div>
            </SectionWrapper>
          </div>
        );

      case 'scores':
        if (!latest?.scores?.overall) return null;
        return (
          <div key={sectionId} ref={setRef} {...dragProps}>
            <SectionWrapper
              id="scores"
              title="AI Recommendations"
              icon={<ClipboardList size={18} />}
              accent="amber"
              onExportCsv={() => {
                exportToCsv(getRecommendationsExportData(latest, CATEGORIES), 'ai-recommendations.csv');
              }}
              onExportPdf={() => exportToPdf('AI Recommendations', sectionRefs.current.scores)}
            >
              <AIRecommendations latest={latest} categories={CATEGORIES} />
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header — slimmer, no score (moved to hero card) */}
      <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="JMC Solutions" className="h-14 w-auto" />
            <div>
              <h1 className="text-lg font-bold text-slate-900">{client?.name || 'Client Portal'}</h1>
              <p className="text-[11px] text-slate-400">AI Adoption & Readiness Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              JMC Home
            </a>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>
        )}

        {/* Hero Score Card — always visible, not draggable */}
        <HeroScoreCard milestones={milestones} categories={CATEGORIES} />

        {/* Drag-reorderable sections */}
        <p className="text-[10px] text-slate-400 text-center">
          Drag sections by the grip handle to reorder • Click header to collapse
        </p>

        {sectionOrder.map((id, idx) => renderSection(id, idx))}
      </div>
    </div>
  );
}
