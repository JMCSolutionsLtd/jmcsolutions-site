/**
 * Client-side scoring for the website AI assessment.
 * Mirrors the server logic in server/routes/publicAssessments.js.
 */

export function computeScores(responses, questions) {
  const byCategory = {};
  let totalScore = 0;
  let totalAnswered = 0;

  for (const q of questions) {
    const score = responses[q.id];
    if (score == null) continue;
    const s = parseInt(score, 10);
    if (!Number.isInteger(s) || s < 1 || s > 5) continue;
    const cat = q.category;
    if (!byCategory[cat]) byCategory[cat] = { sum: 0, count: 0 };
    byCategory[cat].sum += s;
    byCategory[cat].count += 1;
    totalScore += s;
    totalAnswered += 1;
  }

  const categories = {};
  for (const [cat, d] of Object.entries(byCategory)) {
    categories[cat] = {
      percent: Math.round((d.sum / (d.count * 5)) * 100),
      answered: d.count,
      sum: d.sum,
    };
  }

  return {
    overall: totalAnswered > 0
      ? { percent: Math.round((totalScore / (totalAnswered * 5)) * 100), answered: totalAnswered }
      : null,
    categories,
  };
}

export function categoryColorClass(percent) {
  if (percent >= 70) return 'bg-emerald-600';
  if (percent >= 40) return 'bg-blue-600';
  return 'bg-amber-500';
}

export function categoryLabel(percent) {
  if (percent >= 70) return 'Strong foundations';
  if (percent >= 40) return 'Building';
  return 'Early days';
}
