/**
 * DeliveryChecklist — interactive checklist grouped by delivery phase.
 * Fetches tasks from the server, allows status toggling, notes editing, and shows progress bars.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { portalApi } from '../portalApi';
import {
  CheckCircle2,
  Clock,
  Circle,
  ChevronDown,
  ChevronRight,
  Loader2,
  MessageSquare,
} from 'lucide-react';

const STATUS_CYCLE = ['pending', 'in-progress', 'complete'];
const STATUS_CONFIG = {
  complete: { icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200', label: 'Done' },
  'in-progress': { icon: Clock, color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200', label: 'In Progress' },
  pending: { icon: Circle, color: 'text-slate-400', bg: 'bg-slate-100', border: 'border-slate-200', label: 'Pending' },
};

export default function DeliveryChecklist() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState(new Set());
  const [editingNotes, setEditingNotes] = useState(null); // task id

  useEffect(() => {
    portalApi
      .getChecklist()
      .then((data) => {
        setTasks(data.tasks);
        // Expand the first non-complete category by default
        const cats = [...new Set(data.tasks.map((t) => t.category))];
        const firstActive = cats.find((c) =>
          data.tasks.some((t) => t.category === c && t.status !== 'complete')
        );
        if (firstActive) setExpandedCats(new Set([firstActive]));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleCategory = (cat) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const cycleStatus = useCallback(async (task) => {
    const currentIdx = STATUS_CYCLE.indexOf(task.status);
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );
    try {
      await portalApi.updateChecklistTask(task.id, { status: nextStatus });
    } catch (err) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
    }
  }, []);

  const saveNotes = useCallback(async (taskId, notes) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, notes } : t))
    );
    setEditingNotes(null);
    try {
      await portalApi.updateChecklistTask(taskId, { notes });
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-blue-900" />
      </div>
    );
  }

  // Group tasks by category preserving order
  const categories = [];
  const seen = new Set();
  for (const t of tasks) {
    if (!seen.has(t.category)) {
      seen.add(t.category);
      categories.push(t.category);
    }
  }

  // Flatten for export
  const allTasks = tasks;

  return (
    <div className="space-y-3">
      {/* Overall progress */}
      <OverallProgress tasks={allTasks} />

      {/* Category groups */}
      {categories.map((cat) => {
        const catTasks = tasks.filter((t) => t.category === cat);
        const doneCount = catTasks.filter((t) => t.status === 'complete').length;
        const pct = Math.round((doneCount / catTasks.length) * 100);
        const isExpanded = expandedCats.has(cat);

        return (
          <div key={cat} className="border border-slate-200 rounded-lg overflow-hidden">
            {/* Category header */}
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
              {isExpanded ? (
                <ChevronDown size={16} className="text-slate-400 shrink-0" />
              ) : (
                <ChevronRight size={16} className="text-slate-400 shrink-0" />
              )}
              <span className="font-bold text-sm text-slate-800 flex-1">{cat}</span>
              <span className="text-xs text-slate-500 shrink-0">
                {doneCount}/{catTasks.length}
              </span>
              <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden shrink-0">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>

            {/* Expanded tasks */}
            {isExpanded && (
              <div className="divide-y divide-slate-100">
                {/* Group by sub_category */}
                {groupBySubCategory(catTasks).map(([subCat, subTasks]) => (
                  <div key={subCat}>
                    <div className="px-4 py-1.5 bg-slate-50/50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{subCat}</span>
                    </div>
                    {subTasks.map((task) => {
                      const cfg = STATUS_CONFIG[task.status];
                      const StatusIcon = cfg.icon;
                      const isEditingThis = editingNotes === task.id;

                      return (
                        <div key={task.id} className="px-4 py-2.5 hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-start gap-3">
                            {/* Status toggle button */}
                            <button
                              onClick={() => cycleStatus(task)}
                              className={`mt-0.5 shrink-0 p-0.5 rounded transition-colors ${cfg.color} hover:opacity-70`}
                              title={`Click to change status (currently: ${cfg.label})`}
                            >
                              <StatusIcon size={18} />
                            </button>

                            {/* Task text */}
                            <div className="flex-1 min-w-0">
                              <span
                                className={`text-[13px] ${task.status === 'complete' ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                              >
                                {task.task}
                              </span>

                              {/* Notes */}
                              {isEditingThis ? (
                                <textarea
                                  autoFocus
                                  defaultValue={task.notes || ''}
                                  onBlur={(e) => saveNotes(task.id, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      saveNotes(task.id, e.target.value);
                                    }
                                  }}
                                  placeholder="Add a note…"
                                  className="mt-1 w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none resize-none"
                                  rows={2}
                                />
                              ) : task.notes ? (
                                <p
                                  onClick={() => setEditingNotes(task.id)}
                                  className="mt-0.5 text-xs text-slate-400 cursor-pointer hover:text-slate-600"
                                >
                                  📝 {task.notes}
                                </p>
                              ) : null}
                            </div>

                            {/* Status badge + notes toggle */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {!isEditingThis && (
                                <button
                                  onClick={() => setEditingNotes(task.id)}
                                  className="text-slate-300 hover:text-slate-500 transition-colors p-1"
                                  title="Add note"
                                >
                                  <MessageSquare size={13} />
                                </button>
                              )}
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                {cfg.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function OverallProgress({ tasks }) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'complete').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-slate-500">{done} of {total} tasks complete</span>
          <span className="text-xs font-black text-slate-700">{pct}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={14} /> {done} Done
        </span>
        <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
          <Clock size={14} /> {inProgress} Active
        </span>
        <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
          <Circle size={14} /> {total - done - inProgress} Pending
        </span>
      </div>
    </div>
  );
}

function groupBySubCategory(tasks) {
  const map = new Map();
  for (const t of tasks) {
    if (!map.has(t.sub_category)) map.set(t.sub_category, []);
    map.get(t.sub_category).push(t);
  }
  return [...map.entries()];
}

/** Helper to get tasks as flat export data */
export function getChecklistExportData(tasks) {
  return tasks.map((t) => ({
    Category: t.category,
    'Sub-Category': t.sub_category,
    Task: t.task,
    Status: t.status,
    Notes: t.notes || '',
  }));
}
