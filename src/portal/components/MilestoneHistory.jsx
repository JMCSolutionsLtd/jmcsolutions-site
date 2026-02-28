/**
 * MilestoneHistory — scrollable list of past assessment milestones.
 * Clicking a row navigates to the assessment. Includes a delete action.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { portalApi } from '../portalApi';
import ScoreBadge from './ScoreBadge';
import { ChevronRight, Trash2, Loader2 } from 'lucide-react';

export default function MilestoneHistory({ milestones = [], onRefresh }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this milestone? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await portalApi.deleteAssessment(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (milestones.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-6">No milestones recorded yet.</p>;
  }

  const sorted = [...milestones].reverse();

  return (
    <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
      {sorted.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-3 px-3 rounded-lg cursor-pointer transition-colors group"
          onClick={() => navigate(`/portal/assessment/${m.id}`)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                m.status === 'completed' ? 'bg-green-500' : 'bg-amber-400'
              }`}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{m.title}</p>
              <p className="text-xs text-slate-400">
                {new Date(m.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ScoreBadge percent={m.scores?.overall?.percent ?? null} />
            <button
              onClick={(e) => handleDelete(e, m.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition"
              title="Delete milestone"
            >
              {deleting === m.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
            <ChevronRight size={16} className="text-slate-300" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Helper for CSV export */
export function getMilestoneExportData(milestones) {
  return [...milestones].reverse().map((m) => ({
    Title: m.title,
    Status: m.status,
    'Overall Score': m.scores?.overall?.percent != null ? `${m.scores.overall.percent}%` : '—',
    Created: new Date(m.created_at).toLocaleDateString('en-GB'),
    Updated: new Date(m.updated_at).toLocaleDateString('en-GB'),
  }));
}
