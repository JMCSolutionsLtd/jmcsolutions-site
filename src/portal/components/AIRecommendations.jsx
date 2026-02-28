/**
 * AIRecommendations — generates contextual improvement recommendations based on
 * the client's latest assessment scores per category.
 *
 * Uses rule-based logic to provide specific, actionable advice tailored to the
 * score ranges (Red ≤33%, Amber ≤65%, Green >65%).
 */
import React from 'react';
import { Lightbulb, AlertTriangle, TrendingUp, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

/**
 * Recommendation templates keyed by short category name.
 * Each has arrays for red (≤33), amber (≤65), and green (>65) tiers.
 * We pick recommendations from matching tier.
 */
const RECOMMENDATIONS = {
  'Business Strategy': {
    red: [
      'Your AI strategy needs a clearer connection to business outcomes. Start by identifying 2–3 high-impact use cases tied directly to revenue or cost savings.',
      'Senior leadership buy-in appears limited. Consider scheduling an executive AI briefing to align AI investment with strategic priorities.',
      'There is no clear AI roadmap. We recommend developing a 12-month phased adoption plan with measurable KPIs at each stage.',
    ],
    amber: [
      'Your strategy foundations are in place but could be sharper. Review your AI use case pipeline and prioritise by expected ROI.',
      'Consider formalising a quarterly AI strategy review with leadership to ensure initiatives stay aligned with evolving business goals.',
      'Benchmark your AI adoption against competitors in your sector to identify areas where you could gain a strategic edge.',
    ],
    green: [
      'Strong strategic alignment — continue to iterate on your AI roadmap and share wins across the organisation to maintain momentum.',
      'Consider publishing an internal AI strategy update each quarter to keep all levels of the organisation engaged.',
    ],
  },
  'Org & Culture': {
    red: [
      'Cultural readiness is a significant barrier. Launch an AI awareness programme to demystify AI and address employee concerns.',
      'Change management for AI is critical. Appoint AI champions in each department to drive grassroots adoption.',
      'Resistance to AI is high — focus on quick-win use cases that demonstrate tangible benefits to frontline staff.',
    ],
    amber: [
      'Progress on culture but gaps remain. Expand AI training beyond technical teams — non-technical staff need targeted learning paths.',
      'Cross-department collaboration on AI is developing. Formalise AI working groups with representatives from key business units.',
      'Document and celebrate AI success stories internally to build confidence and reduce remaining resistance.',
    ],
    green: [
      'Excellent cultural foundation. Focus on retaining AI talent and ensuring knowledge transfer as your AI programme scales.',
      'Your team is receptive — consider introducing advanced AI literacy programmes for power users and department leads.',
    ],
  },
  'AI Strategy': {
    red: [
      'Your organisation lacks AI project experience. Start with a low-risk pilot (e.g., Copilot for Microsoft 365) to build confidence and generate learnings.',
      'Previous AI/automation lessons are undocumented. Create a lessons-learned register to prevent repeating mistakes in future projects.',
      'Evaluate your current use of AI assistants and workflow automation — quick deployment of existing tools can build a strong foundation.',
    ],
    amber: [
      'You have some AI experience but haven\'t scaled successfully. Review what blocked previous projects and create a playbook for future rollouts.',
      'Automation maturity is moderate. Explore extending Power Automate or Copilot Studio to additional departments or workflows.',
      'Document your AI project pipeline and assign owners to each initiative to maintain momentum.',
    ],
    green: [
      'Solid AI experience — focus on standardising your deployment processes and building reusable templates for future projects.',
      'Consider establishing an AI Centre of Excellence to codify best practices across the organisation.',
    ],
  },
  'Data Foundations': {
    red: [
      'Data readiness is a critical blocker. Conduct an urgent data audit to identify quality, access, and governance gaps.',
      'Your data is not AI-ready. Prioritise data cleansing, deduplication, and establishing a single source of truth for key datasets.',
      'Data silos are likely limiting AI potential. Develop a data integration strategy and invest in modern data pipelines.',
    ],
    amber: [
      'Data foundations are developing. Focus on improving data quality metrics and establishing automated data validation processes.',
      'Review data access permissions — ensure the right teams can access the data they need without compromising security.',
      'Consider implementing a data catalogue so teams can discover and understand available datasets for AI use cases.',
    ],
    green: [
      'Strong data foundations. Explore advanced data strategies such as real-time data pipelines, feature stores, or data mesh approaches.',
      'Continue investing in data literacy across business teams so they can self-serve for AI-driven insights.',
    ],
  },
  'Governance': {
    red: [
      'AI governance is severely lacking. Establish an AI ethics and responsible use policy as an immediate priority.',
      'You need clear guidelines on data privacy, bias monitoring, and AI decision transparency before scaling AI use.',
      'Create an AI governance committee with representation from IT, legal, compliance, and business stakeholders.',
    ],
    amber: [
      'Governance frameworks exist but need strengthening. Review your AI risk register and ensure all active AI projects are assessed.',
      'Implement regular bias and fairness audits for any AI models or copilot workflows processing sensitive data.',
      'Ensure your AI policies are clearly communicated and that all staff understand their responsibilities when using AI tools.',
    ],
    green: [
      'Excellent governance posture. Stay ahead of evolving regulations (e.g., EU AI Act) and ensure your frameworks remain compliant.',
      'Consider third-party audits of your AI governance practices to validate your approach and build stakeholder trust.',
    ],
  },
  'Infrastructure': {
    red: [
      'Your infrastructure is not ready for AI workloads. Assess cloud capacity, licensing, and integration readiness immediately.',
      'Copilot and AI tools require robust Microsoft 365 / Azure foundations. Review your tenant configuration and licensing posture.',
      'Network and security infrastructure need review — AI tools can increase data flow and require updated security controls.',
    ],
    amber: [
      'Infrastructure partially supports AI. Identify bottlenecks (e.g., compute limits, API rate limits) and create an upgrade plan.',
      'Review your Azure / cloud environment for cost optimisation — AI workloads can escalate costs if not managed properly.',
      'Ensure your DevOps and CI/CD pipelines can support rapid iteration of AI features and models.',
    ],
    green: [
      'Infrastructure is well-positioned. Focus on scalability planning and ensure cost monitoring is in place for AI-specific resource usage.',
      'Explore edge AI or hybrid deployment options if low-latency inference is important for your use cases.',
    ],
  },
  'Model Mgmt': {
    red: [
      'No model management practices in place. Start by cataloguing any AI models or Copilot agents currently deployed.',
      'Establish version control and monitoring for AI outputs — even low-code AI tools like Copilot Studio need oversight.',
      'Define clear ownership for each AI model or agent, including who is responsible for monitoring performance and accuracy.',
    ],
    amber: [
      'Some model oversight exists. Implement systematic model performance monitoring with alerts for drift or accuracy degradation.',
      'Create a model retirement policy — ensure outdated or underperforming AI models are decommissioned in a controlled way.',
      'Document your model lineage (data sources, training data, configuration) for each deployed AI agent or workflow.',
    ],
    green: [
      'Strong model management. Continue evolving your MLOps practices and consider automated retraining pipelines for critical models.',
      'Share your model management practices as templates for new AI projects to accelerate time-to-deployment.',
    ],
  },
};

const CATEGORY_KEY_MAP = {
  'AI Readiness: Business Strategy': 'Business Strategy',
  'AI Readiness: Organization and Culture': 'Org & Culture',
  'AI Readiness: AI Strategy and Experience': 'AI Strategy',
  'AI Readiness: Data Foundations': 'Data Foundations',
  'AI Readiness: AI Governance and Security': 'Governance',
  'AI Readiness: Infrastructure for AI': 'Infrastructure',
  'AI Readiness: Model Management': 'Model Mgmt',
};

function getTier(pct) {
  if (pct === null || pct === undefined) return null;
  if (pct <= 33) return 'red';
  if (pct <= 65) return 'amber';
  return 'green';
}

const TIER_CONFIG = {
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    label: 'Needs Attention',
    accent: 'border-l-red-400',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    icon: TrendingUp,
    iconColor: 'text-amber-500',
    label: 'Developing',
    accent: 'border-l-amber-400',
  },
  green: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    label: 'Strong',
    accent: 'border-l-emerald-400',
  },
};

export default function AIRecommendations({ latest, categories }) {
  if (!latest?.scores?.overall) {
    return (
      <p className="text-sm text-slate-400 text-center py-6">
        Complete an assessment to receive tailored AI recommendations.
      </p>
    );
  }

  // Build recommendations sorted: red first, then amber, then green
  const recs = categories
    .map((cat) => {
      const key = CATEGORY_KEY_MAP[cat] || cat;
      const pct = latest.scores?.categories?.[cat]?.percent ?? null;
      const tier = getTier(pct);
      if (!tier) return null;
      const pool = RECOMMENDATIONS[key]?.[tier] || [];
      // Pick up to 2 recommendations per category
      const picks = pool.slice(0, 2);
      return { cat, key, pct, tier, picks };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const order = { red: 0, amber: 1, green: 2 };
      return (order[a.tier] ?? 3) - (order[b.tier] ?? 3);
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={14} className="text-amber-500" />
        <p className="text-xs text-slate-500">
          Personalised recommendations based on your latest assessment responses
        </p>
      </div>

      {recs.map(({ cat, key, pct, tier, picks }) => {
        const cfg = TIER_CONFIG[tier];
        const Icon = cfg.icon;
        return (
          <div key={cat} className={`rounded-lg border-l-4 ${cfg.accent} ${cfg.bg} border ${cfg.border} p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} className={cfg.iconColor} />
              <span className="text-sm font-bold text-slate-800">{key}</span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cfg.badge} ml-auto`}>
                {pct}% — {cfg.label}
              </span>
            </div>
            <ul className="space-y-2">
              {picks.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                  <ArrowRight size={12} className="text-slate-400 mt-0.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** Helper for CSV export */
export function getRecommendationsExportData(latest, categories) {
  if (!latest?.scores?.overall) return [];
  return categories
    .map((cat) => {
      const key = CATEGORY_KEY_MAP[cat] || cat;
      const pct = latest.scores?.categories?.[cat]?.percent ?? null;
      const tier = getTier(pct);
      if (!tier) return null;
      const pool = RECOMMENDATIONS[key]?.[tier] || [];
      return pool.slice(0, 2).map((rec) => ({
        Category: key,
        Score: pct != null ? `${pct}%` : '—',
        Status: TIER_CONFIG[tier].label,
        Recommendation: rec,
      }));
    })
    .filter(Boolean)
    .flat();
}
