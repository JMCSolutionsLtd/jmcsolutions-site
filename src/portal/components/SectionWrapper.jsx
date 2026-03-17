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
    blue: 'bg-blue-900',
    emerald: 'bg-emerald-700',
    violet: 'bg-violet-700',
    amber: 'bg-amber-600',
    rose: 'bg-rose-600',
    cyan: 'bg-cyan-700',
    sky: 'bg-sky-700',
    slate: 'bg-slate-600',
  };

  return (
    <div
      className="bg-white rounded-lg border border-slate-200/60 shadow-card overflow-hidden transition-shadow duration-200 hover:shadow-card-hover"
      data-section-id={id}
    >
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100">
        <div
          {...(dragHandleProps || {})}
          className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 transition-colors touch-none"
          title="Drag to reorder"
        >
          <GripVertical size={16} />
        </div>

        <div className={`w-7 h-7 rounded-md ${accentMap[accent] || accentMap.blue} flex items-center justify-center text-white shrink-0`}>
          {React.cloneElement(icon, { size: 14 })}
        </div>

        <h2 className="font-bold text-slate-800 flex-1 text-sm">{title}</h2>

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
        <div ref={contentRef} className="p-5 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
