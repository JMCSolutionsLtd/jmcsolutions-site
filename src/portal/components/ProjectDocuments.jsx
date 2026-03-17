/**
 * ProjectDocuments — expected deliverables (greyed-out until uploaded) + drag-and-drop
 * for additional files. Files are stored server-side under data/uploads/{clientId}/.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { portalApi } from '../portalApi';
import {
  FileText,
  Download,
  FolderOpen,
  Upload,
  Trash2,
  Loader2,
  Clock,
  CheckCircle2,
  Plus,
} from 'lucide-react';

/* ── Expected deliverables per phase ─────────────────────────────────────── */
const EXPECTED_DOCS = [
  { phase: 'Onboarding', name: 'Welcome Pack', type: 'PDF' },
  { phase: 'D1: Data & Permissions Audit', name: 'AI Readiness Assessment Summary', type: 'PDF' },
  { phase: 'D1: Data & Permissions Audit', name: 'Risk & Remediation Document', type: 'XLSX' },
  { phase: 'D2: Governance & Policy', name: 'AI Governance Framework', type: 'PDF' },
  { phase: 'D2: Governance & Policy', name: 'Responsible Use Policy and Staff Handbook', type: 'PDF' },
  { phase: 'D3: Go-Live Readiness', name: 'Go-Live Readiness Summary', type: 'PDF' },
  { phase: 'D4: Copilot Enablement', name: 'Copilot Enablement Record', type: 'PDF' },
  { phase: 'D4: Copilot Enablement', name: 'Connector Enablement Record', type: 'PDF' },
  { phase: 'D4: Copilot Enablement', name: 'Connector Test Plan and Evidence Pack', type: 'PDF' },
  { phase: 'D4: Copilot Enablement', name: 'Connector Issue and Remediation Tracker', type: 'XLSX' },
  { phase: 'D5: Training', name: 'Participant Handbook', type: 'PDF' },
  { phase: 'D5: Training', name: 'Training Completion Summary', type: 'PDF' },
  { phase: 'D6: Prompt Library', name: 'Role-Based Prompt Library', type: 'PDF' },
  { phase: 'D6: Prompt Library', name: 'Copilot Usage Playbook', type: 'PDF' },
  { phase: 'D7: Review & Roadmap', name: 'Adoption and Performance Review Report', type: 'PDF' },
  { phase: 'D7: Review & Roadmap', name: 'Phase 2 Roadmap', type: 'PDF' },
];

const PHASES = [
  'Onboarding',
  'D1: Data & Permissions Audit',
  'D2: Governance & Policy',
  'D3: Go-Live Readiness',
  'D4: Copilot Enablement',
  'D5: Training',
  'D6: Prompt Library',
  'D7: Review & Roadmap',
  'General',
];

const TYPE_BADGE = {
  PDF:  'bg-red-100 text-red-700',
  XLSX: 'bg-green-100 text-green-700',
  DOCX: 'bg-blue-100 text-blue-700',
  PPTX: 'bg-orange-100 text-orange-700',
  ZIP:  'bg-slate-100 text-slate-700',
  PNG:  'bg-violet-100 text-violet-700',
  JPG:  'bg-violet-100 text-violet-700',
  CSV:  'bg-emerald-100 text-emerald-700',
  TXT:  'bg-slate-100 text-slate-700',
  FILE: 'bg-slate-100 text-slate-500',
};

const MIME_TO_LABEL = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'application/zip': 'ZIP',
  'application/x-zip-compressed': 'ZIP',
  'image/png': 'PNG',
  'image/jpeg': 'JPG',
  'text/csv': 'CSV',
  'text/plain': 'TXT',
};

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Fuzzy match: does an uploaded doc name look like an expected deliverable? */
function matchesExpected(uploadedName, expectedName) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return norm(uploadedName).includes(norm(expectedName)) || norm(expectedName).includes(norm(uploadedName));
}

export default function ProjectDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const [uploadPhase, setUploadPhase] = useState(null);
  const fileInputRef = useRef(null);

  const fetchDocuments = useCallback(() => {
    portalApi.listDocuments()
      .then((data) => setDocuments(data.documents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const handleUpload = async (files, phase) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        await portalApi.uploadDocument(file, phase);
      }
      fetchDocuments();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      setDragOver(null);
      setUploadPhase(null);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const blob = await portalApi.downloadDocument(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.original_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed: ' + err.message);
    }
  };

  const handleDelete = async (doc) => {
    if (!confirm(`Delete "${doc.original_name}"?`)) return;
    try {
      await portalApi.deleteDocument(doc.id);
      fetchDocuments();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleDrop = (e, phase) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length) handleUpload(files, phase);
  };

  const handleDragOverEvt = (e, phase) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(phase);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length && uploadPhase) handleUpload(files, uploadPhase);
    e.target.value = '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin text-blue-900" />
      </div>
    );
  }

  // Group uploaded documents by phase
  const grouped = {};
  for (const phase of PHASES) grouped[phase] = [];
  for (const doc of documents) {
    if (!grouped[doc.phase]) grouped[doc.phase] = [];
    grouped[doc.phase].push(doc);
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={handleFileInput}
      />

      {uploading && (
        <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
          <Loader2 size={14} className="animate-spin" /> Uploading...
        </div>
      )}

      {PHASES.map((phase) => {
        const phaseDocs = grouped[phase] || [];
        const expectedForPhase = EXPECTED_DOCS.filter((e) => e.phase === phase);
        const isOver = dragOver === phase;

        // Figure out which expected docs have been fulfilled by uploads
        const matchedUploadIds = new Set();
        const expectedWithStatus = expectedForPhase.map((exp) => {
          const match = phaseDocs.find(
            (d) => !matchedUploadIds.has(d.id) && matchesExpected(d.original_name, exp.name)
          );
          if (match) matchedUploadIds.add(match.id);
          return { ...exp, uploaded: match || null };
        });

        // Additional docs not matching any expected deliverable
        const additionalDocs = phaseDocs.filter((d) => !matchedUploadIds.has(d.id));

        return (
          <div
            key={phase}
            onDrop={(e) => handleDrop(e, phase)}
            onDragOver={(e) => handleDragOverEvt(e, phase)}
            onDragLeave={() => setDragOver(null)}
            className={`rounded-xl border transition-all ${
              isOver
                ? 'border-blue-400 bg-blue-50/50 shadow-md'
                : 'border-slate-200 bg-white'
            }`}
          >
            {/* Phase header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
              <FolderOpen size={14} className="text-slate-400" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex-1">{phase}</h4>
              <span className="text-[10px] text-slate-400 mr-2">
                {expectedForPhase.length > 0
                  ? `${expectedWithStatus.filter((e) => e.uploaded).length}/${expectedForPhase.length} deliverables`
                  : `${phaseDocs.length} file${phaseDocs.length !== 1 ? 's' : ''}`
                }
              </span>
              <button
                onClick={() => { setUploadPhase(phase); fileInputRef.current?.click(); }}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition-colors"
              >
                <Plus size={12} /> Add File
              </button>
            </div>

            {/* Content area */}
            <div className="p-2">
              {/* Expected deliverables */}
              {expectedWithStatus.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-1.5">
                  {expectedWithStatus.map((exp, i) => {
                    const uploaded = exp.uploaded;
                    const typeLabel = uploaded ? (MIME_TO_LABEL[uploaded.mimetype] || 'FILE') : exp.type;
                    const badgeCls = TYPE_BADGE[typeLabel] || TYPE_BADGE.FILE;

                    if (uploaded) {
                      // ── Fulfilled deliverable ──
                      return (
                        <div
                          key={`exp-${i}`}
                          className="flex items-start gap-2 px-2.5 py-2 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:border-emerald-300 hover:shadow-sm transition group overflow-hidden"
                        >
                          <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700 line-clamp-2 break-words" title={uploaded.original_name}>
                              {uploaded.original_name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${badgeCls}`}>
                                {typeLabel}
                              </span>
                              <span className="text-[9px] text-slate-400">{formatSize(uploaded.size)}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownload(uploaded)}
                            className="p-1 rounded text-slate-300 hover:text-blue-600 transition"
                            title="Download"
                          >
                            <Download size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(uploaded)}
                            className="p-1 rounded text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    }

                    // ── Pending deliverable (greyed out) ──
                    return (
                      <div
                        key={`exp-${i}`}
                        className="flex items-start gap-2 px-2.5 py-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 overflow-hidden"
                      >
                        <Clock size={15} className="text-slate-300 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-400 line-clamp-2 break-words">
                            {exp.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">
                              {exp.type}
                            </span>
                            <span className="text-[9px] text-slate-300">Pending</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Additional uploaded docs (not matching expected) */}
              {additionalDocs.length > 0 && (
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-1.5 ${expectedWithStatus.length > 0 ? 'mt-1' : ''}`}>
                  {additionalDocs.map((doc) => {
                    const typeLabel = MIME_TO_LABEL[doc.mimetype] || 'FILE';
                    const badgeCls = TYPE_BADGE[typeLabel] || TYPE_BADGE.FILE;
                    return (
                      <div
                        key={doc.id}
                        className="flex items-start gap-2 px-2.5 py-2 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition group overflow-hidden"
                      >
                        <FileText size={15} className="text-blue-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700 line-clamp-2 break-words" title={doc.original_name}>
                            {doc.original_name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${badgeCls}`}>
                              {typeLabel}
                            </span>
                            <span className="text-[9px] text-slate-400">{formatSize(doc.size)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-1 rounded text-slate-300 hover:text-blue-600 transition"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(doc)}
                          className="p-1 rounded text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty state for phases with no expected docs and no uploads (General) */}
              {expectedWithStatus.length === 0 && additionalDocs.length === 0 && (
                <p className="text-[10px] text-slate-300 text-center py-4">
                  {isOver ? 'Drop files here...' : 'Drag & drop files or click Add File'}
                </p>
              )}

              {/* Drop hint when dragging over */}
              {isOver && (expectedWithStatus.length > 0 || additionalDocs.length > 0) && (
                <div className="mt-2 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/50 py-3 text-center">
                  <p className="text-[10px] text-blue-500 font-medium">Drop files to upload to {phase}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Helper for CSV export */
export function getDocumentsExportData(documents) {
  if (!documents?.length) return [{ Phase: '', Document: 'No documents uploaded', Type: '', Size: '' }];
  return documents.map((d) => ({
    Phase: d.phase,
    Document: d.original_name,
    Type: MIME_TO_LABEL[d.mimetype] || d.mimetype,
    Size: formatSize(d.size),
    Uploaded: d.uploaded_at,
  }));
}
