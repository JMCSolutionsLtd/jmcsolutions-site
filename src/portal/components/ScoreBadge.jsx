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
  red: 'bg-red-100 text-red-800 border-red-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  green: 'bg-green-100 text-green-800 border-green-300',
  gray: 'bg-slate-100 text-slate-500 border-slate-300',
};

const dotClasses = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  gray: 'bg-slate-400',
};

export default function ScoreBadge({ percent, label, size = 'md' }) {
  const color = getScoreColor(percent);
  const isNull = percent === null || percent === undefined;

  const sizeClasses = size === 'lg' ? 'px-4 py-2 text-base' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border font-semibold ${colorClasses[color]} ${sizeClasses}`}
    >
      <span className={`w-2.5 h-2.5 rounded-full ${dotClasses[color]}`} />
      {isNull ? 'Not started' : `${percent}%`}
      {label && <span className="font-normal opacity-70">— {label}</span>}
    </span>
  );
}
