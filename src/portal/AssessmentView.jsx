/**
 * AssessmentView — render the 72-question assessment grouped by category.
 * Supports editing (draft) and read-only (completed) modes.
 * Computes live scores client-side and persists server-side on save.
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
  'AI Readiness: Business Strategy',
  'AI Readiness: Organization and Culture',
  'AI Readiness: AI Strategy and Experience',
  'AI Readiness: Data Foundations',
  'AI Readiness: AI Governance and Security',
  'AI Readiness: Infrastructure for AI',
  'AI Readiness: Model Management',
];

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
  const [responses, setResponses] = useState({}); // { [questionId]: { score, notes } }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set(CATEGORIES));
  const saveMsgTimeout = useRef(null);

  // Load data
  useEffect(() => {
    Promise.all([portalApi.getAssessment(id), portalApi.getQuestions()])
      .then(([aData, qData]) => {
        setMilestone(aData.milestone);
        setQuestions(qData.questions);
        // Build response map from existing responses
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

  // Live client-side scores
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
      setSaveMsg({ type: 'success', text: finalise ? 'Assessment completed!' : 'Draft saved.' });
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
      // Clear message after 5s
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

  // Group questions by category
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
        <Loader2 size={32} className="animate-spin text-blue-900" />
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-lg text-slate-600 mb-4">Assessment not found.</p>
          <button
            onClick={() => navigate('/portal')}
            className="text-blue-900 font-bold hover:underline"
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
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/portal')}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={18} className="text-blue-900" />
                  {milestone.title}
                </h1>
                <p className="text-xs text-slate-500">
                  {answeredCount} of {totalQuestions} questions answered ({progressPercent}%)
                  {!isEditable && ' — Completed'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ScoreBadge percent={liveScores.overall?.percent ?? null} size="lg" />
              {isEditable && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(false)}
                    disabled={saving}
                    className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Draft
                  </button>
                  <button
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-900 text-white text-sm font-bold rounded-lg hover:bg-blue-800 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <CheckCircle2 size={14} />
                    Complete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-900 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Save status message */}
      {saveMsg && (
        <div
          className={`max-w-5xl mx-auto px-6 mt-4 ${
            saveMsg.type === 'success' ? 'text-green-700' : 'text-red-700'
          }`}
        >
          <div
            className={`p-3 rounded-lg text-sm font-medium ${
              saveMsg.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {saveMsg.text}
          </div>
        </div>
      )}

      {/* Live Category Scores Summary */}
      <div className="max-w-5xl mx-auto px-6 mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORIES.map((cat) => {
            const catScore = liveScores.categories?.[cat];
            const pct = catScore?.percent ?? null;
            const color = getScoreColor(pct);
            const bgMap = { red: 'bg-red-50 border-red-200', yellow: 'bg-yellow-50 border-yellow-200', green: 'bg-green-50 border-green-200', gray: 'bg-slate-50 border-slate-200' };
            return (
              <div key={cat} className={`p-3 rounded-lg border text-center ${bgMap[color]}`}>
                <p className="text-xs font-bold text-slate-500 truncate" title={cat}>
                  {cat.replace('AI Readiness: ', '')}
                </p>
                <p className="text-xl font-bold text-slate-900 mt-1">{pct !== null ? `${pct}%` : '—'}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Question Sections */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        {CATEGORIES.map((cat) => {
          const catQuestions = grouped[cat] || [];
          const isExpanded = expandedSections.has(cat);
          const catScore = liveScores.categories?.[cat];
          const answeredInCat = catQuestions.filter((q) => responses[q.id]?.score).length;

          return (
            <div key={cat} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(cat)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 text-left">
                  <h2 className="text-base font-bold text-slate-900">{cat}</h2>
                  <span className="text-xs text-slate-400">
                    {answeredInCat}/{catQuestions.length}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <ScoreBadge percent={catScore?.percent ?? null} />
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400" />
                  )}
                </div>
              </button>

              {/* Section Body */}
              {isExpanded && (
                <div className="border-t border-slate-100 divide-y divide-slate-50">
                  {catQuestions.map((q, idx) => {
                    const r = responses[q.id] || {};
                    return (
                      <div key={q.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <span className="text-xs font-bold text-slate-300 mt-1 w-6 shrink-0">
                            {idx + 1}
                          </span>
                          <div className="flex-1 space-y-3">
                            <p className="text-sm text-slate-800 leading-relaxed">{q.prompt}</p>

                            {/* Score Selection */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400 mr-1">Score:</span>
                              {[1, 2, 3, 4, 5].map((s) => {
                                const isSelected = r.score === s;
                                return (
                                  <button
                                    key={s}
                                    disabled={!isEditable}
                                    onClick={() => handleScoreChange(q.id, s)}
                                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                                      isSelected
                                        ? 'bg-blue-900 text-white shadow-md'
                                        : isEditable
                                        ? 'bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-900'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                                  >
                                    {s}
                                  </button>
                                );
                              })}
                              <span className="text-xs text-slate-400 ml-2">
                                {r.score ? '' : 'Not answered'}
                              </span>
                            </div>

                            {/* Notes (optional) */}
                            {isEditable ? (
                              <textarea
                                rows={1}
                                placeholder="Add a note (optional)…"
                                value={r.notes || ''}
                                onChange={(e) => handleNotesChange(q.id, e.target.value)}
                                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none"
                              />
                            ) : (
                              r.notes && (
                                <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                                  {r.notes}
                                </p>
                              )
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

        {/* Bottom Save Buttons (for convenience) */}
        {isEditable && (
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-6 py-3 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              Complete Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
