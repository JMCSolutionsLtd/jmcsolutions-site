/**
 * ScoreBadge — displays a percentage score with colour banding.
 *
 * Colour bands:
 *   <= 33%  → red
 *   > 33% and < 66%  → yellow/amber
 *   >= 66%  → green
 */
import React from 'react';

export function getScoreColor(percent) {
  if (percent === null || percent === undefined) return 'gray';
  if (percent <= 33) return 'red';
  if (percent < 66) return 'yellow';
  return 'green';
}

const colorClasses = {
  red: 'bg-red-50 text-red-700 border-red-200',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  gray: 'bg-slate-50 text-slate-500 border-slate-200',
};

const dotClasses = {
  red: 'bg-red-500',
  yellow: 'bg-amber-500',
  green: 'bg-emerald-500',
  gray: 'bg-slate-400',
};

export default function ScoreBadge({ percent, label, size = 'md' }) {
  const color = getScoreColor(percent);
  const isNull = percent === null || percent === undefined;

  const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-semibold ${colorClasses[color]} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[color]}`} />
      {isNull ? 'Not started' : `${percent}%`}
      {label && <span className="font-normal opacity-70">· {label}</span>}
    </span>
  );
}
