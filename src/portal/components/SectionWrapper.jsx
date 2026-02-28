/**
 * SectionWrapper — draggable, collapsible, exportable card wrapper for dashboard sections.
 */
import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, GripVertical, Download, FileText, FileSpreadsheet } from 'lucide-react';

export default function SectionWrapper({
  id,
  title,
  icon,
  children,
  onExportCsv,
  onExportPdf,
  dragHandleProps,
  defaultCollapsed = false,
  accent = 'blue',
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const contentRef = useRef(null);
  const exportRef = useRef(null);

  const accentMap = {
    blue: 'from-blue-900 to-blue-700',
    emerald: 'from-emerald-700 to-emerald-500',
    violet: 'from-violet-700 to-violet-500',
    amber: 'from-amber-600 to-amber-400',
    rose: 'from-rose-600 to-rose-400',
    cyan: 'from-cyan-700 to-cyan-500',
    sky: 'from-sky-700 to-sky-500',
    slate: 'from-slate-700 to-slate-500',
  };

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md"
      data-section-id={id}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        {/* Drag handle */}
        <div
          {...(dragHandleProps || {})}
          className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors touch-none"
          title="Drag to reorder"
        >
          <GripVertical size={18} />
        </div>

        {/* Accent strip + icon */}
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accentMap[accent] || accentMap.blue} flex items-center justify-center text-white shrink-0`}>
          {icon}
        </div>

        <h2 className="font-bold text-slate-900 flex-1 text-sm sm:text-base">{title}</h2>

        {/* Export dropdown */}
        {(onExportCsv || onExportPdf) && (
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              title="Export"
            >
              <Download size={16} />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
                {onExportCsv && (
                  <button
                    onClick={() => { onExportCsv(); setShowExportMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FileSpreadsheet size={14} /> Export CSV
                  </button>
                )}
                {onExportPdf && (
                  <button
                    onClick={() => { onExportPdf(contentRef.current); setShowExportMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FileText size={14} /> Export PDF
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
        >
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div ref={contentRef} className="p-5">
          {children}
        </div>
      )}
    </div>
  );
}
