/**
 * AssessmentView — JMC Solutions AI Readiness Assessment.
 * Professional advisory-grade assessment with auto-reveal question guidance.
 * Supports editing (draft) and read-only (completed) modes.
 * Questions auto-expand on hover (desktop) and on tap/focus (mobile).
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { portalApi } from './portalApi';
import ScoreBadge, { getScoreColor } from './components/ScoreBadge';
import {
  Loader2,
  Save,
  CheckCircle2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';

const CATEGORIES = [
  'Business Strategy & Goals',
  'People & Culture',
  'Data & Content Foundations',
  'Governance & Risk',
  'Technology & Microsoft 365 Readiness',
];

const CATEGORY_SHORT = {
  'Business Strategy & Goals': 'Business Strategy',
  'People & Culture': 'People & Culture',
  'Data & Content Foundations': 'Data Foundations',
  'Governance & Risk': 'Governance & Risk',
  'Technology & Microsoft 365 Readiness': 'Tech & M365',
};

function computeClientScores(responses, questions) {
  const byCategory = {};
  let totalScore = 0;
  let totalAnswered = 0;

  for (const q of questions) {
    const r = responses[q.id];
    if (r && r.score) {
      const score = parseInt(r.score, 10);
      if (!byCategory[q.category]) byCategory[q.category] = { sum: 0, count: 0 };
      byCategory[q.category].sum += score;
      byCategory[q.category].count += 1;
      totalScore += score;
      totalAnswered += 1;
    }
  }

  const categoryScores = {};
  for (const [cat, data] of Object.entries(byCategory)) {
    categoryScores[cat] = {
      percent: Math.round((data.sum / (data.count * 5)) * 100),
      answered: data.count,
    };
  }

  return {
    overall: totalAnswered > 0
      ? { percent: Math.round((totalScore / (totalAnswered * 5)) * 100), answered: totalAnswered }
      : null,
    categories: categoryScores,
  };
}

export default function AssessmentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [milestone, setMilestone] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set(CATEGORIES));
  const saveMsgTimeout = useRef(null);

  useEffect(() => {
    Promise.all([portalApi.getAssessment(id), portalApi.getQuestions()])
      .then(([aData, qData]) => {
        setMilestone(aData.milestone);
        setQuestions(qData.questions);
        const map = {};
        for (const r of aData.milestone.responses || []) {
          map[r.question_id] = { score: r.score, notes: r.notes || '' };
        }
        setResponses(map);
      })
      .catch((err) => {
        setSaveMsg({ type: 'error', text: err.message });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const liveScores = useMemo(
    () => computeClientScores(responses, questions),
    [responses, questions]
  );

  const handleScoreChange = useCallback((questionId, score) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], score: parseInt(score, 10), notes: prev[questionId]?.notes || '' },
    }));
  }, []);

  const handleNotesChange = useCallback((questionId, notes) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], notes, score: prev[questionId]?.score || null },
    }));
  }, []);

  const handleSave = async (finalise = false) => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const responseArray = Object.entries(responses)
        .filter(([, v]) => v.score)
        .map(([question_id, v]) => ({
          question_id,
          score: v.score,
          notes: v.notes || '',
        }));

      const status = finalise ? 'completed' : undefined;
      const data = await portalApi.saveAssessment(id, responseArray, status);
      setMilestone(data.milestone);
      setSaveMsg({ type: 'success', text: finalise ? 'Assessment completed.' : 'Draft saved.' });
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
      if (saveMsgTimeout.current) clearTimeout(saveMsgTimeout.current);
      saveMsgTimeout.current = setTimeout(() => setSaveMsg(null), 5000);
    }
  };

  const toggleSection = (cat) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const isEditable = milestone?.status !== 'completed';

  const grouped = useMemo(() => {
    const map = {};
    for (const cat of CATEGORIES) map[cat] = [];
    for (const q of questions) {
      if (map[q.category]) map[q.category].push(q);
    }
    return map;
  }, [questions]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={28} className="animate-spin text-blue-900" />
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-base text-slate-500 mb-4">Assessment not found.</p>
          <button
            onClick={() => navigate('/portal')}
            className="text-blue-900 font-semibold hover:underline text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.values(responses).filter((r) => r.score).length;
  const totalQuestions = questions.length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blue-950/95 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate('/portal')}
                className="text-blue-200/80 hover:text-white transition-colors shrink-0"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-white flex items-center gap-2 truncate">
                  <FileText size={15} className="text-blue-200/70 shrink-0" />
                  <span className="truncate">{milestone.title}</span>
                </h1>
                <p className="text-[11px] text-white/70">
                  {answeredCount}/{totalQuestions} answered ({progressPercent}%)
                  {!isEditable && ' \u00b7 Completed'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <ScoreBadge percent={liveScores.overall?.percent ?? null} size="lg" />
              {isEditable && (
                <div className="hidden sm:flex gap-2">
                  <button
                    onClick={() => handleSave(false)}
                    disabled={saving}
                    className="px-3 py-1.5 border border-white/15 text-blue-100 text-xs font-medium rounded-md hover:bg-white/5 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    Save
                  </button>
                  <button
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    className="px-3 py-1.5 bg-white text-blue-900 text-xs font-semibold rounded-md hover:bg-blue-50 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={13} />
                    Complete
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2.5 h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {saveMsg && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-4">
          <div className={`p-3 rounded-md text-sm font-medium ${
            saveMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {saveMsg.text}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {CATEGORIES.map((cat) => {
            const catScore = liveScores.categories?.[cat];
            const pct = catScore?.percent ?? null;
            const color = getScoreColor(pct);
            const bgMap = {
              red: 'bg-red-50 border-red-200 text-red-700',
              yellow: 'bg-amber-50 border-amber-200 text-amber-700',
              green: 'bg-emerald-50 border-emerald-200 text-emerald-700',
              gray: 'bg-slate-100 border-slate-200 text-slate-400',
            };
            return (
              <div key={cat} className={`p-2.5 sm:p-3 rounded-md border text-center ${bgMap[color]}`}>
                <p className="text-[10px] sm:text-[11px] font-medium truncate opacity-70" title={cat}>
                  {CATEGORY_SHORT[cat] || cat.replace('AI Readiness: ', '')}
                </p>
                <p className="text-lg font-bold mt-0.5">{pct !== null ? `${pct}%` : '\u2014'}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
        {CATEGORIES.map((cat) => {
          const catQuestions = grouped[cat] || [];
          const isExpanded = expandedSections.has(cat);
          const catScore = liveScores.categories?.[cat];
          const answeredInCat = catQuestions.filter((q) => responses[q.id]?.score).length;

          return (
            <div key={cat} className="bg-white rounded-lg border border-slate-200/60 shadow-card overflow-hidden">
              <button
                onClick={() => toggleSection(cat)}
                className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3 text-left min-w-0">
                  <h2 className="text-sm font-bold text-slate-800 truncate">
                    {CATEGORY_SHORT[cat] || cat}
                  </h2>
                  <span className="text-[11px] text-slate-400 shrink-0">{answeredInCat}/{catQuestions.length}</span>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <ScoreBadge percent={catScore?.percent ?? null} />
                  {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-100 divide-y divide-slate-100/80">
                  {catQuestions.map((q, idx) => {
                    const r = responses[q.id] || {};
                    const hasLevels = q.levels && q.levels.length === 5;

                    return (
                      <div
                        key={q.id}
                        className="px-4 sm:px-5 py-3.5"
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          <span className="text-xs font-bold text-slate-400 shrink-0 mt-3 w-6 text-right tabular-nums">{idx + 1}.</span>
                          <div className="flex-1 min-w-0">
                            {hasLevels ? (
                              <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-3 sm:p-4">
                                <p className="text-[13px] sm:text-sm text-slate-800 font-semibold leading-relaxed break-words mb-3">{q.prompt}</p>
                                <div className="border-t border-slate-200/60 pt-3 space-y-1.5">
                                  {q.levels.map((desc, i) => {
                                    const level = i + 1;
                                    const isLevelActive = r.score === level;
                                    return (
                                      <button
                                        key={i}
                                        type="button"
                                        disabled={!isEditable}
                                        onClick={() => handleScoreChange(q.id, level)}
                                        className={`w-full flex items-start gap-2.5 rounded-md px-2.5 py-2.5 transition-colors text-left ${
                                          isLevelActive
                                            ? 'bg-blue-50 border border-blue-200/60'
                                            : isEditable
                                            ? 'hover:bg-slate-100/60 border border-transparent'
                                            : 'border border-transparent cursor-not-allowed'
                                        }`}
                                      >
                                        <span
                                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-semibold shrink-0 mt-0.5 ${
                                            isLevelActive ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-500'
                                          }`}
                                        >
                                          {level}
                                        </span>
                                        <p className={`text-xs leading-relaxed break-words ${
                                          isLevelActive ? 'text-blue-900 font-medium' : 'text-slate-600'
                                        }`}>
                                          {desc}
                                        </p>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-slate-50 border border-slate-200/60 rounded-lg px-3 py-3">
                                <p className="text-[13px] sm:text-sm text-slate-800 font-semibold leading-relaxed break-words mb-3">{q.prompt}</p>
                                <div className="border-t border-slate-200/60 pt-3 flex items-center gap-1.5">
                                  {[1, 2, 3, 4, 5].map((s) => {
                                    const isSelected = r.score === s;
                                    return (
                                      <button
                                        key={s}
                                        disabled={!isEditable}
                                        onClick={() => handleScoreChange(q.id, s)}
                                        className={`w-8 h-8 rounded-md text-xs font-semibold transition-all duration-150 ${
                                          isSelected
                                            ? 'bg-blue-900 text-white shadow-sm'
                                            : isEditable
                                            ? 'bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-900'
                                            : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                        }`}
                                      >
                                        {s}
                                      </button>
                                    );
                                  })}
                                  {!r.score && <span className="text-[10px] text-slate-300 ml-1.5">Not answered</span>}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {isEditable && (
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 bg-white font-semibold rounded-md hover:bg-slate-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-900 text-white font-semibold rounded-md hover:bg-blue-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              <CheckCircle2 size={15} />
              Complete Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
