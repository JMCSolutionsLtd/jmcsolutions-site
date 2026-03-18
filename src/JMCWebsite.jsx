import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  ShieldCheck,
  Cpu,
  Zap,
  Bot,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BarChart3,
  Users,
  LayoutTemplate,
  FileText,
  ChevronDown,
  Briefcase,
  Lock,
  Sparkles,
  Loader2,
  MessageSquarePlus,
  Send,
  MessageCircle,
  Check,
  Building2,
  Globe,
  Award,
  TrendingUp,
  ChevronUp,
  GraduationCap,
  RefreshCw,
  BrainCircuit,
  Package,
  User,
  ExternalLink,
  Phone
} from 'lucide-react';
import logo from './assets/JMC Solutions_v2_1.png';
import footerLogo from './assets/JMC Solutions_v2_4.png';

// --- Page Components ---

const PrivacyPolicy = ({ onBack }) => (
  <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
    <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800 mb-8 font-medium">
      <ArrowLeft size={16} className="mr-2" /> Back to Home
    </button>
    <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
    <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
      <p><strong>Last Updated:</strong> November 26, 2025</p>
      <p>JMC Solutions Ltd ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or engage with our consulting services.</p>

      <h3 className="text-xl font-bold text-slate-900 mt-8">1. Information We Collect</h3>
      <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Contact and Enquiry Data:</strong> Personally identifiable information, such as your name, business email address, company name, and the content of your enquiry, that you voluntarily provide when submitting a Discovery Call request or contacting us directly.</li>
        <li><strong>Client Portal Data:</strong> If you access our Client Portal, we collect your login credentials (stored securely using industry-standard hashing) and any assessment or project data you submit within the portal.</li>
        <li><strong>Technical Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, browser type, operating system, access times, and pages viewed. This is used for security and service improvement purposes only.</li>
      </ul>

      <h3 className="text-xl font-bold text-slate-900 mt-8">2. Use of Your Information</h3>
      <p>We use the information we collect solely for legitimate business purposes related to our consulting services. Specifically, we may use your information to:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Respond to your enquiry and arrange a Discovery Call or follow-up consultation.</li>
        <li>Deliver and manage the consulting services you have engaged us for.</li>
        <li>Provide access to and maintain your Client Portal account, including assessments and project documentation.</li>
        <li>Send service-related communications, such as project updates or account notifications.</li>
        <li>Compile anonymised, aggregate statistical data for internal analysis and service improvement.</li>
      </ul>
      <p>We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>

      <h3 className="text-xl font-bold text-slate-900 mt-8">3. Data Retention</h3>
      <p>We retain your personal data only for as long as is necessary to fulfil the purposes for which it was collected, including meeting any legal, accounting, or reporting obligations. Client Portal data is retained for the duration of the engagement and for a reasonable period thereafter unless you request deletion.</p>

      <h3 className="text-xl font-bold text-slate-900 mt-8">4. Your Rights (UK GDPR)</h3>
      <p>Under UK data protection law, you have rights including the right to access, correct, or request deletion of your personal data. To exercise any of these rights, please contact us at the address below. You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ico.org.uk</a>.</p>

      <h3 className="text-xl font-bold text-slate-900 mt-8">5. Data Security</h3>
      <p>We implement appropriate technical and organisational security measures to protect your personal information. These include encrypted storage of credentials, JWT-based authentication, and HTTPS-enforced data transmission. While we have taken reasonable steps to secure your data, no transmission method is guaranteed to be 100% secure.</p>

      <h3 className="text-xl font-bold text-slate-900 mt-8">6. Contact Us</h3>
      <p>If you have questions or comments about this Privacy Policy, or wish to exercise your data rights, please contact us at: <a href="mailto:contact@jmcsolutions.ai" className="text-blue-600 hover:underline">contact@jmcsolutions.ai</a></p>
    </div>
  </div>
);

const CookiePolicy = ({ onBack }) => (
  <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
    <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800 mb-8 font-medium">
      <ArrowLeft size={16} className="mr-2" /> Back to Home
    </button>
    <h1 className="text-4xl font-bold text-slate-900 mb-8">Cookie Policy</h1>
    <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
      <p>This Cookie Policy explains how JMC Solutions Ltd uses cookies and similar technologies to recognize you when you visit our website.</p>

      <h3 className="text-xl font-bold text-slate-900 mt-8">1. What are cookies?</h3>
      <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>

      <h3 className="text-xl font-bold text-slate-900 mt-8">2. Why do we use cookies?</h3>
      <p>We use first- and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties.</p>

      <h3 className="text-xl font-bold text-slate-900 mt-8">3. Types of Cookies We Use</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Essential Cookies:</strong> These are strictly necessary to provide you with services available through our Website and to use some of its features.</li>
        <li><strong>Performance and Functionality Cookies:</strong> These are used to enhance the performance and functionality of our Website but are non-essential to their use.</li>
        <li><strong>Analytics and Customization Cookies:</strong> These collect information that is used either in aggregate form to help us understand how our Website is being used or how effective our marketing campaigns are.</li>
      </ul>

      <h3 className="text-xl font-bold text-slate-900 mt-8">4. How can I control cookies?</h3>
      <p>You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. In addition, most advertising networks offer you a way to opt out of targeted advertising.</p>
    </div>
  </div>
);

const FAQPage = ({ onBack }) => {
  const [activeIdx, setActiveIdx] = useState(null);
  const faqs = [
    {
      category: "Training & Certification",
      items: [
        {
          q: "Do you offer different levels of training?",
          a: "Yes. We offer flexible training packages including 2-hour, 4-hour, 8-hour, and 16-hour sessions, delivered over a timeline that suits your organisation. All packages can include hands-on lab sessions for practical, real-world experience."
        },
        {
          q: "Can training be tailored to our industry or team?",
          a: "Yes. We customise content to reflect your sector, tools, and team roles. Training for a finance team looks different to training for an operations or HR team. We scope this during your Discovery Call and build a programme that maps to your actual workflows."
        },
        {
          q: "Do you offer ongoing or refresher training after the initial programme?",
          a: "Yes. AI tools evolve quickly and so do best practices. We offer scheduled refresher sessions, new-feature walkthroughs, and extended learning pathways for teams who want to continue developing their capability after the initial engagement."
        }
      ]
    },
    {
      category: "Services & Scope",
      items: [
        {
          q: "What services does JMC Solutions offer?",
          a: "We offer end-to-end AI enablement for businesses: AI Foundations (tenant readiness and governance), Microsoft Copilot Enablement, AI Training, Process Automation, and Machine Learning solutions. Our engagements range from focused Copilot rollouts to broader digital transformation programmes."
        },
        {
          q: "Do we need to already have Microsoft 365 Copilot licences?",
          a: "No. We can advise on licensing as part of our engagement, and our AI Foundations module prepares your environment before you activate Copilot. If you already have licences, we can start enablement immediately."
        },
        {
          q: "How long does a typical engagement take?",
          a: "It depends on your scope. A focused Copilot rollout (Foundations + Enablement + Training) typically spans 6-10 weeks. More complex programmes including automations or machine learning are scoped individually on your Discovery Call."
        },
        {
          q: "Can you work with our existing IT team or MSP?",
          a: "Yes. We regularly work alongside in-house IT teams and managed service providers. We focus on the AI strategy, governance, and adoption layers, while your existing team retains control of infrastructure and day-to-day IT operations."
        },
        {
          q: "Do you offer ongoing support after a project completes?",
          a: "Yes. We offer retainer-based support, periodic reviews, and new-feature enablement as Microsoft and other platforms continue to evolve. Many clients engage us on an ongoing basis as their AI landscape matures."
        }
      ]
    },
    {
      category: "Getting Started",
      items: [
        {
          q: "What does a Discovery Call involve?",
          a: "It's a free, no-obligation 30-minute conversation to understand your current environment, your goals, and the challenges you're facing. From there, we'll outline the most appropriate approach and a clear next step - no hard sell."
        },
        {
          q: "We're a small business - is this right for us?",
          a: "Absolutely. We specialise in helping SMEs access the same calibre of AI capability as enterprise organisations, without the overhead. Our services are modular so you can start small and scale as confidence and ROI grows."
        },
        {
          q: "How do you measure success?",
          a: "We define success metrics at the outset of every engagement - typically time saved per user per week, adoption rates, process cycle-time reductions, and qualitative feedback from teams. We build in checkpoints to track against these throughout the programme."
        },
        {
          q: "What happens if adoption is low after the initial rollout?",
          a: "Low adoption is the most common failure mode for AI tool deployments - it's exactly what we're built to prevent. If it does occur, we diagnose the root cause (skills gap, workflow mismatch, change resistance) and run targeted interventions. Our structured enablement model is designed to catch this early."
        }
      ]
    },
    {
      category: "About JMC Solutions",
      items: [
        {
          q: "How is JMC Solutions different from going directly to Microsoft?",
          a: "Microsoft provides the tools - we provide the strategy, governance, training, and change management to ensure those tools actually get used and deliver measurable value. Many organisations buy Copilot and see low adoption without structured enablement support."
        },
        {
          q: "Are you Microsoft-certified?",
          a: "Both co-founders hold industry certifications in AI and business transformation including the AI Business Professional Certification (AB-730). We stay current with Microsoft's evolving Copilot and Azure AI stack and maintain close familiarity with their licensing and deployment models."
        },
        {
          q: "What industries do you work in?",
          a: "We have experience across financial services, insurance, technology, professional services, and operations-heavy sectors. Our methodology is sector-agnostic but we tailor every engagement to the regulatory environment, tooling, and culture of your organisation."
        },
        {
          q: "Is JMC Solutions a registered UK company?",
          a: "Yes. JMC Solutions Ltd is registered in England and Wales. You can reach us at contact@jmcsolutions.ai for any formal enquiries."
        }
      ]
    }
  ];

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800 mb-8 font-medium">
        <ArrowLeft size={16} className="mr-2" /> Back to Home
      </button>
      <h1 className="text-4xl font-bold text-slate-900 mb-3">Frequently Asked Questions</h1>
      <p className="text-slate-500 mb-12 text-lg">Everything you need to know about working with JMC Solutions.</p>

      <div className="space-y-12">
        {faqs.map((section) => (
          <div key={section.category}>
            <h2 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-4">{section.category}</h2>
            <div className="space-y-3">
              {section.items.map((item, idx) => {
                const key = `${section.category}-${idx}`;
                return (
                  <div
                    key={key}
                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${activeIdx === key ? 'border-blue-300 shadow-sm' : 'border-slate-200'}`}
                  >
                    <button
                      onClick={() => setActiveIdx(activeIdx === key ? null : key)}
                      className="w-full text-left px-6 py-5 flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors"
                      aria-expanded={activeIdx === key}
                    >
                      <span className="font-semibold text-slate-900 text-base">{item.q}</span>
                      <ChevronDown
                        size={18}
                        className={`text-slate-400 shrink-0 transition-transform duration-200 ${activeIdx === key ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <div className={`transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden ${activeIdx === key ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <p className="px-6 py-4 text-slate-600 leading-relaxed text-sm">{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 bg-blue-50 rounded-xl border border-blue-100 text-center">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Still have questions?</h3>
        <p className="text-slate-600 mb-6">Book a free Discovery Call and we'll answer everything specific to your situation.</p>
        <button
          onClick={onBack}
          className="px-8 py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
        >
          Get in Touch
        </button>
      </div>
    </div>
  );
};

const JMCWebsite = () => {
  const [activePage, setActivePage] = useState('home');

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // AI Feature States - Industry Insights
  const [industryInput, setIndustryInput] = useState('');
  const [aiInsights, setAiInsights] = useState(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [insightError, setInsightError] = useState(null);

  // AI Feature States - Contact Form
  const [contactMessage, setContactMessage] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null); // 'success', 'error', or null

  // Selection State
  const [selectedModules, setSelectedModules] = useState([]);
  const [expandedModules, setExpandedModules] = useState([]);

  // AI Feature States - Joanna Chatbot
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: "Hello! I'm Joanna. Ask me about Copilot, Automation, or how we can help your business." }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [expandedPartnerCard, setExpandedPartnerCard] = useState(null);
  const [hoveredPartnerCard, setHoveredPartnerCard] = useState(null);
  const partnerCardsRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isChatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (partnerCardsRef.current && !partnerCardsRef.current.contains(event.target)) {
        setExpandedPartnerCard(null);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  const scrollToSection = (id) => {
    if (activePage !== 'home') setActivePage('home');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }, 0);
  };

  const toggleModuleSelection = (e, id) => {
    e.stopPropagation(); // Prevent toggling the accordion
    setSelectedModules((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const toggleAccordion = (id) => {
    setExpandedModules((prev) => 
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const bundles = {
    training: ['training', 'retainer'],
    airollout: ['foundations', 'copilot', 'training', 'retainer'],
    automate: ['foundations', 'copilot', 'training', 'automations', 'retainer'],
    complete: ['foundations', 'copilot', 'training', 'automations', 'ml', 'retainer']
  };

  // Determine active bundle based on current selections
  const getActiveBundle = () => {
    const activeKey = Object.keys(bundles).find(key => {
      const bundleServices = bundles[key];
      // Check if selectedModules contains exactly the same elements as bundleServices
      return bundleServices.length === selectedModules.length && 
             bundleServices.every(service => selectedModules.includes(service));
    });
    return activeKey || null;
  };

  const activeBundle = getActiveBundle();

  const handleBundleClick = (bundleKey) => {
    // If clicking the currently active bundle, deselect all
    if (activeBundle === bundleKey) {
      setSelectedModules([]);
    } else {
      // Otherwise select the new bundle
      setSelectedModules(bundles[bundleKey]);
    }
  };

  const isPartnerCardExpanded = (cardId) => hoveredPartnerCard === cardId || expandedPartnerCard === cardId;

  const handlePartnerCardToggle = (cardId) => {
    setExpandedPartnerCard((prev) => (prev === cardId ? null : cardId));
  };

  const serviceModules = [
    {
      id: 'foundations',
      title: 'AI Foundations',
      icon: ShieldCheck,
      badge: 'Recommended Foundation',
      summary: 'The solid starting point. We prepare your Microsoft 365 environment to ensure AI is accurate, secure, and compliant.',
      desc: 'Prepare the organisation’s Microsoft 365 environment so AI, automation, and intelligent agents can operate accurately, securely, and compliantly.',
      includes: [
        'Full Data Audit (SharePoint, OneDrive, Teams)',
        'Permissions Audit & Risk Assessment',
        'Governance Setup & Standardisation',
        'Remediation & Cleanup of high-risk items'
      ]
    },
    {
      id: 'copilot',
      title: 'Copilot 365 Enablement',
      icon: LayoutTemplate,
      summary: 'Technical deployment and configuration to get your environment ready for Microsoft 365 Copilot.',
      desc: 'We handle the technical setup, licensing verification, and environment configuration to ensure Copilot works perfectly from day one.',
      includes: [
        'Technical Setup & Indexing Validation',
        'Admin Configuration & Policy Setup',
        'Department-specific Prompt Libraries',
        'Security & Compliance Configuration'
      ]
    },
    {
      id: 'training',
      title: 'AI Training & Effective Adoption',
      icon: GraduationCap,
      summary: 'Ensure your investment pays off with tiered, role-based training and structured adoption programmes, tailored to your organisation.',
      desc: 'Deployment is not adoption. We offer multiple tiers of training, from foundational awareness sessions through to advanced, role-specific enablement. Every programme can be tailored to your organisation\'s needs, ensuring your staff learn how to use AI tools effectively in their specific roles to drive real, measurable productivity gains.',
      includes: [
        'Tiered Training Programmes (Foundation to Advanced)',
        'Role-specific & Bespoke Training Sessions',
        '30-day Adoption Tracking & Analytics',
        'Department-level Prompt Libraries & Use Cases',
        'Usage Optimisation Workshops',
        'Change Management Support'
      ]
    },
    {
      id: 'automations',
      title: 'AI Automations',
      icon: Zap,
      summary: 'Replace repetitive work with intelligent workflows and deploy secure, context-aware AI agents across Microsoft and external platforms.',
      desc: 'Eliminate manual, repetitive work with intelligent automation and purpose-built AI agents. From workflow automation and document processing to governed, context-aware agents capable of acting on behalf of your organisation, this service covers the full spectrum of AI-driven efficiency.',
      includes: [
        'Process Mapping & ROI Prioritisation',
        'Power Automate Workflows & Document Processing',
        'Voice Agents & Messaging Bots',
        'Cross-system Integrations & Website Creation',
        'Agent Blueprinting & Persona Design',
        'Knowledge Retrieval & Task Execution',
        'Secure Connectors (Salesforce, SQL, etc.)',
        'Guardrails & Safety Governance'
      ]
    },
    {
      id: 'ml',
      title: 'Machine Learning & Advanced Analytics',
      icon: BrainCircuit,
      summary: 'High-end, bespoke analytics and predictive modeling for complex business challenges.',
      desc: 'Deliver high-end, bespoke analytics and machine learning where pre-built AI and automation are insufficient.',
      includes: [
        'Custom Machine Learning Models',
        'Pattern & Anomaly Detection',
        'Python-based Analytics Pipelines',
        'Compliance-focused Deterministic Models'
      ]
    },
    {
      id: 'retainer',
      title: 'Ongoing Support & Optimisation',
      icon: RefreshCw,
      summary: 'Monthly training updates, with continuous optimisation and governance to ensure long-term value as your organisation evolves.',
      desc: 'AI does not deliver value through one-off deployment. Ongoing training, optimisation, and governance are essential to ensure AI systems remain accurate. We also keep you updated with the latest AI releases so you remain at the forefront of innovation.',
      includes: [
        'Regular Refresher Training',
        'Copilot Usage Analysis & Tuning',
        'Automation Reliability Improvements',
        'Agent Behaviour Refinement',
        'Updates on Latest AI Features & Releases'
      ]
    }
  ];

  // --- Gemini API Integration ---
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const callGemini = async (prompt, systemPrompt) => {
    if (!apiKey) {
      throw new Error('Missing VITE_GEMINI_API_KEY');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    let delay = 1000;
    for (let i = 0; i < 5; i++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } catch (error) {
        if (i === 4) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
    return '';
  };

  const handleGenerateInsights = async () => {
    if (!industryInput.trim()) return;
    if (!apiKey) {
      setInsightError('Live demo is not configured. Missing VITE_GEMINI_API_KEY.');
      return;
    }

    setIsGeneratingInsights(true);
    setInsightError(null);
    setAiInsights(null);

    try {
      const systemPrompt = `You are a senior AI consultant at JMC Solutions. For the given industry, return EXACTLY FOUR use cases, one in each of these categories:
1. "individual_productivity" — How Microsoft 365 Copilot can boost an individual employee's day-to-day productivity (e.g. drafting, summarising, data analysis).
2. "team_collaboration" — How Copilot can enhance team collaboration and communication (e.g. meeting recaps, shared knowledge, project coordination).
3. "workflow_automation" — A workflow automation or simple agentic AI use case such as an internal assistant, approvals bot, or document routing.
4. "data_analytics" — A machine learning or data analytics use case such as forecasting, anomaly detection, or performance dashboards.

        Rules:
        - Return exactly 4 items, no more and no less.
        - Output strictly as valid JSON with a top-level object containing a single key "use_cases" whose value is an array of 4 objects.
        - Each object must have these keys: "category" (one of: individual_productivity, team_collaboration, workflow_automation, data_analytics), "title" (short, 6-10 words max), and "description" (1-2 concise sentences focused on ROI and feasibility).
        - Order matters: individual_productivity first, then team_collaboration, workflow_automation, data_analytics.
        - Do not include any extra commentary, notes, or metadata outside the JSON object.`;
      const userPrompt = `Industry: ${industryInput}. Generate 4 tailored AI use cases covering individual productivity, team collaboration, workflow automation, and data analytics.`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: 'application/json' }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || `Gemini request failed (${response.status})`);
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed.use_cases) || parsed.use_cases.length === 0) {
        throw new Error('Gemini returned no use cases.');
      }
      setAiInsights(parsed.use_cases);
    } catch (error) {
      console.error('AI Generation Error:', error);
      setInsightError(error?.message || 'Unable to generate insights at this moment. Please try again.');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleAutoDraft = async (e) => {
    e.preventDefault();
    setIsDrafting(true);

    const companyName = document.getElementById('companyName')?.value || 'my company';

    const selectedTitles = serviceModules
      .filter((m) => selectedModules.includes(m.id))
      .map((m) => m.title)
      .join(', ');

    const selectionContext = selectedTitles
      ? `They are specifically interested in: ${selectedTitles}.`
      : "They haven't selected specific modules yet, but are interested in AI consulting.";

    try {
      const systemPrompt =
        'You are a helpful AI assistant for JMC Solutions. Draft a professional, concise inquiry message from a potential client to JMC Solutions. They are interested in AI consulting. Keep it polite and business-appropriate.';
      const userPrompt = `Draft a message from a user at ${companyName} who wants to book a discovery call. ${selectionContext}`;

      const text = await callGemini(userPrompt, systemPrompt);
      setContactMessage(text);
    } catch (error) {
      console.error('Drafting Error:', error);
      setContactMessage("I'm interested in booking a discovery call to discuss how AI can benefit my business.");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!contactForm.firstName || !contactForm.lastName || !contactForm.email || !contactForm.company || !contactMessage) {
      setSendStatus({ type: 'error', message: 'Please fill in all fields.' });
      return;
    }

    setIsSending(true);
    setSendStatus(null);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: contactForm.firstName,
          lastName: contactForm.lastName,
          email: contactForm.email,
          company: contactForm.company,
          message: contactMessage
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setSendStatus({ type: 'error', message: data.error || 'Failed to send email.' });
        return;
      }

      setSendStatus({ type: 'success', message: "Email sent! We'll be in touch soon." });
      // Reset form
      setContactForm({ firstName: '', lastName: '', email: '', company: '' });
      setContactMessage('');
    } catch (error) {
      console.error('Send email error:', error);
      setSendStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSending(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const systemPrompt = `You are Joanna, the AI assistant for JMC Solutions Ltd.
We are a premium AI consultancy helping SMEs implement Microsoft Copilot, Power Automate, and Custom AI Assistants.

Our Services:
1. AI Foundations: Data audits, security, and governance.
2. Copilot 365 Enablement: Technical setup and configuration.
3. AI Training & Effective Adoption: Tiered, role-based training programmes tailored to client needs, plus adoption tracking.
4. AI Automations: Intelligent workflow automation, AI agents, voice agents, and process automation across Microsoft and external platforms.
5. Machine Learning & Advanced Analytics: Bespoke models and predictive analytics.
6. Ongoing Support & Optimisation: Continuous optimization and updates.

Goal: Answer questions briefly and professionally. Always encourage the user to 'Book a Discovery Call' for complex queries.
Keep responses under 50 words if possible.`;

      const aiResponse = await callGemini(userMsg, systemPrompt);
      setChatMessages((prev) => [...prev, { role: 'assistant', text: aiResponse || "Book a Discovery Call and we'll tailor this to your setup." }]);
    } catch (error) {
      setChatMessages((prev) => [...prev, { role: 'assistant', text: "I'm having trouble connecting. Please try again shortly." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const tickerStyles = `
    @keyframes infinite-scroll {
      from { transform: translateX(0); }
      to { transform: translateX(-100%); }
    }
    .animate-infinite-scroll {
      animation: infinite-scroll 40s linear infinite;
    }
  `;

  const showHome = activePage === 'home';

  /** Render chat message with markdown formatting + CTA links */
  const renderChatMessage = (text) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      // Convert "Book a Discovery Call" into a hyperlink
      const ctaMatch = line.match(/book\s+a\s+discovery\s+call/i);
      if (ctaMatch) {
        const before = line.slice(0, ctaMatch.index);
        const after = line.slice(ctaMatch.index + ctaMatch[0].length);
        return (
          <span key={lineIdx}>
            {before && renderFormattedText(before)}
            <a
              href="#contact"
              onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
              className="text-blue-700 underline underline-offset-2 hover:text-blue-900 font-medium transition-colors"
            >
              Book a Discovery Call
            </a>
            {after && renderFormattedText(after)}
            {lineIdx < lines.length - 1 && <br />}
          </span>
        );
      }
      return (
        <span key={lineIdx}>
          {renderFormattedText(line)}
          {lineIdx < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  /** Convert markdown emphasis to styled elements: ***bold italic***, **bold**, *italic* */
  const renderFormattedText = (text) => {
    // Handle ***, **, then * in a single pass
    const parts = text.split(/(\*{1,3})(.*?)\1/g);
    const result = [];
    let i = 0;
    // split produces: [before, delimiter, content, after, delimiter, content, ...]
    // Use a regex-based approach instead for reliability
    const tokens = [];
    let remaining = text;
    const mdRegex = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*/g;
    let lastIndex = 0;
    let match;
    while ((match = mdRegex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ type: 'text', value: remaining.slice(lastIndex, match.index) });
      }
      if (match[1]) tokens.push({ type: 'bold-italic', value: match[1] });
      else if (match[2]) tokens.push({ type: 'bold', value: match[2] });
      else if (match[3]) tokens.push({ type: 'italic', value: match[3] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < remaining.length) {
      tokens.push({ type: 'text', value: remaining.slice(lastIndex) });
    }
    return tokens.map((tok, idx) => {
      if (tok.type === 'bold-italic') return <strong key={idx} className="font-semibold italic">{tok.value}</strong>;
      if (tok.type === 'bold') return <strong key={idx} className="font-semibold">{tok.value}</strong>;
      if (tok.type === 'italic') return <em key={idx}>{tok.value}</em>;
      return tok.value;
    });
  };

  const bundleConfig = {
    training: { 
      label: 'Training', 
      desc: 'Training & Support',
      colorClass: 'bg-red-50 border-red-200 hover:border-red-400',
      activeClass: 'ring-2 ring-red-500 border-red-500 bg-red-100'
    },
    airollout: { 
      label: 'AI Rollout', 
      desc: 'Copilot Setup & Training',
      colorClass: 'bg-orange-50 border-orange-200 hover:border-orange-400',
      activeClass: 'ring-2 ring-orange-500 border-orange-500 bg-orange-100'
    },
    automate: { 
      label: 'Automate', 
      desc: 'AI Rollout & Automations',
      colorClass: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400',
      activeClass: 'ring-2 ring-yellow-500 border-yellow-500 bg-yellow-100'
    },
    complete: { 
      label: 'Complete', 
      desc: 'Everything Including ML',
      colorClass: 'bg-green-50 border-green-200 hover:border-green-400',
      activeClass: 'ring-2 ring-green-500 border-green-500 bg-green-100'
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
      <style>{tickerStyles}</style>

      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-2' : 'bg-slate-50 py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center cursor-pointer" onClick={() => scrollToSection('hero')}>
            <img src={logo} alt="JMC Solutions Logo" className="h-16 md:h-20 w-auto max-w-xs object-contain" />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { name: 'Services & Approach', id: 'approach' },
              { name: 'About Us', id: 'about' }
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors"
              >
                {item.name}
              </button>
            ))}
            <button
              onClick={() => setActivePage('faq')}
              className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors"
            >
              FAQ
            </button>
            <a
              href="/portal"
              className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors"
            >
              Client Portal
            </a>
            <button
              onClick={() => scrollToSection('contact')}
              className="px-5 py-2.5 bg-blue-900 text-white text-sm font-medium hover:bg-blue-800 transition-all duration-300 shadow-lg shadow-blue-900/20"
            >
              Book Discovery Call
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-slate-900" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 md:hidden flex flex-col gap-4 shadow-xl">
            {[
              { name: 'Services & Approach', id: 'approach' },
              { name: 'About Us', id: 'about' },
              { name: 'Contact', id: 'contact' }
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.id)}
                className="text-left text-lg font-medium text-slate-800 py-2"
              >
                {item.name}
              </button>
            ))}
            <button onClick={() => { setActivePage('faq'); setIsMobileMenuOpen(false); }} className="text-left text-lg font-medium text-slate-800 py-2">
              FAQ
            </button>
            <a
              href="/portal"
              className="text-left text-lg font-medium text-blue-900 py-2"
            >
              Client Portal
            </a>
            <div className="pt-2 border-t border-slate-100 flex flex-col">
              <button onClick={() => setActivePage('privacy')} className="text-left text-lg font-medium text-slate-800 py-2">
                Privacy Policy
              </button>
              <button onClick={() => setActivePage('cookies')} className="text-left text-lg font-medium text-slate-800 py-2">
                Cookie Policy
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Pages */}
      {!showHome && (
        <>
          {activePage === 'privacy' && <PrivacyPolicy onBack={() => setActivePage('home')} />}
          {activePage === 'cookies' && <CookiePolicy onBack={() => setActivePage('home')} />}
          {activePage === 'faq' && <FAQPage onBack={() => setActivePage('home')} />}

          <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                <div className="flex items-center">
                  <img src={footerLogo} alt="JMC Solutions logo" className="h-10 w-auto object-contain" />
                </div>
                <div className="flex gap-6 text-sm font-medium">
                  <button onClick={() => setActivePage('faq')} className="hover:text-white transition-colors">
                    FAQ
                  </button>
                  <button onClick={() => setActivePage('privacy')} className="hover:text-white transition-colors">
                    Privacy Policy
                  </button>
                  <button onClick={() => setActivePage('cookies')} className="hover:text-white transition-colors">
                    Cookie Policy
                  </button>
                  <a href="https://www.linkedin.com/company/jmcsolutionsltd/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    LinkedIn
                  </a>
                </div>
              </div>
              <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500">
                <div>&copy; {new Date().getFullYear()} JMC Solutions Ltd. All rights reserved.</div>
                <div className="flex gap-4">
                  <span>Registered in England &amp; Wales</span>
                  <span>&middot;</span>
                  <a href="mailto:contact@jmcsolutions.ai" className="hover:text-slate-300 transition-colors">contact@jmcsolutions.ai</a>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Home */}
      {showHome && (
        <>
          {/* Hero Section */}
          <section id="hero" className="relative pt-[124px] sm:pt-28 pb-16 lg:pt-40 lg:pb-24 overflow-hidden bg-blue-900">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-blue-900 to-blue-950 -z-10 opacity-30" />
            <div className="absolute top-20 right-10 w-64 h-64 bg-blue-700 rounded-full blur-3xl -z-10 opacity-25" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-800 rounded-full blur-3xl -z-10 opacity-20" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="max-w-4xl">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-8 drop-shadow-lg">
                  Helping SMEs Adopt AI <br className="hidden lg:block" />
                  <span className="text-blue-100">
                    Safely and Effectively
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-blue-50 max-w-2xl leading-relaxed mb-8">
                  As a Microsoft Partner, we help to make your organisation future-ready with Microsoft 365 Copilot training and enablement, as well as through smart automations built compliantly around your data.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-3">
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="px-8 py-4 bg-white text-blue-900 font-bold hover:bg-blue-50 transition-all shadow-2xl flex items-center justify-center gap-2 rounded-lg"
                  >
                    Book a Discovery Call <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* AI Industry Insights */}
          <section className="py-16 bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-900" />
            <div className="max-w-7xl mx-auto px-6">
              <div className={`${aiInsights || isGeneratingInsights ? 'grid lg:grid-cols-2 gap-16' : 'max-w-3xl mx-auto text-center'} items-center transition-all duration-500`}>
                <div className="w-full">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100 ${aiInsights || isGeneratingInsights ? '' : 'mx-auto'}`}>
                    <Sparkles size={14} className="fill-blue-900" /> Live AI Demo
                  </div>
                  <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
                    See What AI Can Do<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-blue-600">For Your Industry</span>
                  </h2>
                  <p className="text-lg text-slate-600 mb-8">
                    Not sure where to start? Enter your industry below, and our AI assistant will generate four high-impact use cases tailored specifically for you.
                  </p>

                  <div className={`bg-slate-50 p-2 rounded-md border border-slate-200 flex flex-col sm:flex-row gap-2 shadow-sm max-w-md ${aiInsights || isGeneratingInsights ? '' : 'mx-auto'}`}>
                    <input
                      type="text"
                      placeholder="e.g. Legal, Construction, Retail..."
                      className="flex-1 bg-white border-none focus:ring-0 rounded-sm p-3 text-slate-900 placeholder:text-slate-400"
                      value={industryInput}
                      onChange={(e) => setIndustryInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerateInsights()}
                    />
                    <button
                      onClick={handleGenerateInsights}
                      disabled={isGeneratingInsights}
                      className="bg-blue-900 text-white px-6 py-3 rounded-sm font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[160px]"
                    >
                      {isGeneratingInsights ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} /> Generate
                        </>
                      )}
                    </button>
                  </div>
                  {insightError && <p className="text-red-500 text-sm mt-3">{insightError}</p>}
                </div>

                {(aiInsights || isGeneratingInsights) && (
                  <div className="bg-slate-50 border border-slate-100 p-8 min-h-[400px] relative rounded-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {isGeneratingInsights && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-900 p-8">
                        <Loader2 size={48} className="animate-spin mb-4 text-blue-600" />
                        <p className="font-medium animate-pulse">Consulting our knowledge base...</p>
                      </div>
                    )}

                    {aiInsights && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                          Recommended Strategy for {industryInput}
                        </h3>
                        {aiInsights.map((insight, idx) => (
                          <div key={idx} className="bg-white p-5 rounded-lg shadow-sm border border-slate-100 hover:border-blue-200 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="mt-1 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                                {idx + 1}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 mb-1">{insight.title}</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">{insight.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="pt-4 text-center">
                          <button onClick={() => scrollToSection('contact')} className="text-sm font-bold text-blue-900 hover:underline">
                            Book a call to implement these ideas &rarr;
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Why Choose JMC */}
          <section className="py-16 bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-900" />
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Why Choose JMC</h2>
                <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Practical AI, Built Around Your People</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  We combine practical technical delivery with real-world adoption and change support, ensuring AI is implemented safely and ethically, used effectively, and delivers genuine commercial value.
                </p>
              </div>

              <div ref={partnerCardsRef} className="grid md:grid-cols-3 gap-6 relative z-10">
                <button
                  type="button"
                  onClick={() => handlePartnerCardToggle('microsoft')}
                  onMouseEnter={() => setHoveredPartnerCard('microsoft')}
                  onMouseLeave={() => {
                    setHoveredPartnerCard(null);
                    setExpandedPartnerCard(null);
                  }}
                  onFocus={() => setHoveredPartnerCard('microsoft')}
                  onBlur={() => {
                    setHoveredPartnerCard(null);
                    setExpandedPartnerCard(null);
                  }}
                  aria-expanded={isPartnerCardExpanded('microsoft')}
                  aria-controls="partner-detail-microsoft"
                  className="group bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 bg-white rounded-full border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                    <svg width="30" height="30" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 0H10.5623V10.5623H0V0Z" fill="#F25022" />
                      <path d="M12.4377 0H23V10.5623H12.4377V0Z" fill="#7FBA00" />
                      <path d="M0 12.4377H10.5623V23H0V12.4377Z" fill="#00A4EF" />
                      <path d="M12.4377 12.4377H23V23H12.4377V12.4377Z" fill="#FFB900" />
                    </svg>
                  </div>
                  <h4 className="text-4xl font-bold leading-none text-blue-900 mb-2">Microsoft</h4>
                  <p className="font-bold text-slate-900 mb-2">Partner</p>
                  <p className="text-sm text-slate-500">Certified expertise delivering enterprise-grade Microsoft AI and Cloud solutions.</p>
                  <div
                    id="partner-detail-microsoft"
                    className={`w-full overflow-hidden text-left transition-all duration-300 ${
                      isPartnerCardExpanded('microsoft') ? 'max-h-32 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
                    }`}
                  >
                    <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      We align deployment, governance, and security controls to Microsoft best practice so your team can adopt Copilot and automation safely at scale.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePartnerCardToggle('enterprises')}
                  onMouseEnter={() => setHoveredPartnerCard('enterprises')}
                  onMouseLeave={() => {
                    setHoveredPartnerCard(null);
                    setExpandedPartnerCard(null);
                  }}
                  onFocus={() => setHoveredPartnerCard('enterprises')}
                  onBlur={() => {
                    setHoveredPartnerCard(null);
                    setExpandedPartnerCard(null);
                  }}
                  aria-expanded={isPartnerCardExpanded('enterprises')}
                  aria-controls="partner-detail-enterprises"
                  className="group bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-blue-900">
                    <Globe size={32} />
                  </div>
                  <h4 className="text-4xl font-bold leading-none text-blue-900 mb-2">15+</h4>
                  <p className="font-bold text-slate-900 mb-2">Global Enterprises</p>
                  <p className="text-sm text-slate-500">Delivering complex solutions for major financial, retail, and technology brands.</p>
                  <div
                    id="partner-detail-enterprises"
                    className={`w-full overflow-hidden text-left transition-all duration-300 ${
                      isPartnerCardExpanded('enterprises') ? 'max-h-32 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
                    }`}
                  >
                    <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      This delivery track record means we bring proven frameworks, governance discipline, and practical rollout methods tailored for fast-moving SME teams.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePartnerCardToggle('sme')}
                  onMouseEnter={() => setHoveredPartnerCard('sme')}
                  onMouseLeave={() => {
                    setHoveredPartnerCard(null);
                    setExpandedPartnerCard(null);
                  }}
                  onFocus={() => setHoveredPartnerCard('sme')}
                  onBlur={() => {
                    setHoveredPartnerCard(null);
                    setExpandedPartnerCard(null);
                  }}
                  aria-expanded={isPartnerCardExpanded('sme')}
                  aria-controls="partner-detail-sme"
                  className="group bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-blue-900">
                    <TrendingUp size={32} />
                  </div>
                  <h4 className="text-4xl font-bold leading-none text-blue-900 mb-2">SME</h4>
                  <p className="font-bold text-slate-900 mb-2">Specialised Focus</p>
                  <p className="text-sm text-slate-500">Bridging the gap for smaller organisations to adopt enterprise-grade AI safely.</p>
                  <div
                    id="partner-detail-sme"
                    className={`w-full overflow-hidden text-left transition-all duration-300 ${
                      isPartnerCardExpanded('sme') ? 'max-h-32 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
                    }`}
                  >
                    <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      We prioritise adoption outcomes, measurable ROI, and lightweight governance so smaller organisations can get value quickly without enterprise overhead.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* Services & Approach */}
          <section id="approach" className="py-16 bg-white relative">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Our Services & Approach</h2>
                <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Full Service Capabilities</h3>
                <p className="text-lg text-slate-600">
                  From laying the secure foundations to deploying advanced machine learning, we cover every stage of your AI journey.
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                  <h4 className="text-center text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">
                    Get better value by selecting one of our packages
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(bundleConfig).map(([id, config]) => (
                      <button
                        key={id}
                        onClick={() => handleBundleClick(id)}
                        className={`p-3 rounded-xl border transition-all duration-300 text-left relative overflow-hidden group h-full flex flex-col justify-center ${
                          activeBundle === id
                            ? config.activeClass
                            : config.colorClass
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="font-bold text-slate-900 text-base">{config.label}</div>
                          {activeBundle === id && <CheckCircle2 size={16} className="text-slate-900 shrink-0 ml-1" />}
                        </div>
                        <div className="text-xs text-slate-600 leading-tight opacity-90">{config.desc}</div>
                      </button>
                    ))}
                  </div>
                  <div className="text-center mt-10 relative">
                    <span className="bg-white px-4 text-slate-400 text-xs font-bold uppercase tracking-wider relative z-10">
                      OR Select your desired services below
                    </span>
                    <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100 -z-0"></div>
                  </div>
                </div>

                 {serviceModules.map((module) => {
                    const isSelected = selectedModules.includes(module.id);
                    const isExpanded = expandedModules.includes(module.id);
                    const Icon = module.icon;

                    return (
                      <div
                        key={module.id}
                        className={`mb-4 rounded-xl border transition-all duration-300 overflow-hidden ${
                          isSelected ? 'border-blue-500 ring-1 ring-blue-500 bg-white shadow-md' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        {/* Header Row */}
                        <div
                          onClick={() => toggleAccordion(module.id)}
                          className="flex items-center p-6 cursor-pointer"
                        >
                           <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-900'
                            }`}
                          >
                            <Icon size={24} />
                          </div>

                          <div className="ml-5 flex-grow">
                            <div className="flex items-center gap-3 mb-1">
                                <h4 className={`text-lg font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                                    {module.title}
                                </h4>
                                {module.badge && (
                                    <span className="hidden sm:inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border border-amber-200">
                                        {module.badge}
                                    </span>
                                )}
                            </div>
                            <p className="hidden md:block text-sm text-slate-500 pr-4">{module.summary}</p>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                             {/* Selection Toggle */}
                             <div
                                onClick={(e) => toggleModuleSelection(e, module.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                                    isSelected
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                                }`}
                             >
                                {isSelected ? <Check size={14} /> : null}
                                {isSelected ? 'Selected' : 'Select'}
                             </div>

                             {/* Chevron */}
                             <div className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                <ChevronDown size={20} />
                             </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        <div
                            className={`transition-[max-height,opacity] duration-300 ease-in-out ${
                                isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                        >
                            <div className="p-6 pt-0 border-t border-slate-100 bg-slate-50/50">
                                <div className="grid md:grid-cols-3 gap-8 pt-6">
                                    <div className="md:col-span-2">
                                        <h5 className="text-xs font-bold text-blue-900 uppercase mb-3 tracking-wider">Description</h5>
                                        <p className="text-sm text-slate-600 leading-relaxed mb-6">
                                            {module.desc}
                                        </p>
                                    </div>
                                    <div>
                                         <h5 className="text-xs font-bold text-blue-900 uppercase mb-3 tracking-wider">What's Included</h5>
                                         <ul className="space-y-2">
                                            {module.includes.map((item, i) => (
                                              <li key={i} className="flex items-start gap-2 text-slate-600 text-xs">
                                                <div className="w-1 h-1 rounded-full mt-1.5 shrink-0 bg-blue-500" />
                                                {item}
                                              </li>
                                            ))}
                                          </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>

          {/* Governance & Security (Moved Here) */}
          <section className="py-16 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                <div className="bg-white p-8 rounded-none border-l-4 border-blue-900 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-blue-50 flex items-center justify-center mb-6 text-blue-900">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">Governance & Security</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Copilot requires clean data permissions. We ensure your AI adoption doesn't expose sensitive information or create compliance risks.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-none border-l-4 border-blue-600 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-blue-50 flex items-center justify-center mb-6 text-blue-800">
                    <Zap size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">Automate & Centralise</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Intelligent automation eliminates repetitive tasks while centralising your business knowledge into an accessible, searchable hub, giving your team a competitive advantage in both speed and strategic focus.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-none border-l-4 border-blue-400 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-blue-50 flex items-center justify-center mb-6 text-blue-600">
                    <GraduationCap size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">Empower Employees</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Equip your team with structured, role-specific training, practical use cases, and tailored prompt libraries that turn AI tools into everyday productivity gains.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* About Us - Founders */}
          <section id="about" className="py-16 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-3xl mx-auto mb-14">
                <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">About Us</h2>
                <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Meet The Founders</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  JMC Solutions combines deep technical AI expertise with practical change management and business transformation experience, ensuring your AI initiatives are not only well-built, but genuinely adopted.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-10 lg:gap-16 max-w-5xl mx-auto">
                {/* Finlay - Headshot placeholder: replace the div below with an <img> when ready */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center">
                  <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-6 shadow-inner border-4 border-white">
                    <User size={56} className="text-blue-400" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-1">Finlay Coles</h4>
                  <p className="text-sm font-medium text-blue-600 mb-4">Co-Founder</p>
                  <ul className="text-sm text-slate-600 leading-relaxed mb-6 space-y-2 text-left">
                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />Six years of hands-on AI implementation and data automation across global enterprises in finance, insurance, and technology</li>
                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />Formally trained in applied AI, machine learning, change management, and agile delivery</li>
                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />Led complex modernisation projects from strategy through to production</li>
                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />Combines rigorous technical capability with a practical understanding of how organisations adopt new technology safely and effectively</li>
                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />Holds the AI Business Professional Certification (AB-730)</li>
                  </ul>
                  <a
                    href="https://www.linkedin.com/in/finlay-coles-9776b3161/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline transition-colors"
                  >
                    View LinkedIn Profile
                  </a>
                </div>

                {/* Amit - Headshot placeholder: replace the div below with an <img> when ready */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center">
                  <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-6 shadow-inner border-4 border-white">
                    <User size={56} className="text-blue-400" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-1">Amit Jaitly</h4>
                  <p className="text-sm font-medium text-blue-600 mb-4">Co-Founder</p>
                  <ul className="text-sm text-slate-600 leading-relaxed mb-6 space-y-2 text-left">
                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />Extensive experience in operations leadership, organisational change, and business transformation</li>
                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />Worked across stakeholder management, process improvement, and workforce change in regulated and consulting-led environments</li>
                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />Delivered training workshops to help teams adopt new ways of working with confidence</li>
                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />Grounded understanding of process, people, and implementation that ensures AI initiatives succeed in practice</li>
                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />Holds the AI Business Professional Certification (AB-730)</li>
                  </ul>
                  <a
                    href="https://www.linkedin.com/in/amit-jaitly-63ab4218a/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline transition-colors"
                  >
                    View LinkedIn Profile
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Outcomes */}
          <section id="outcomes" className="py-16 bg-blue-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 -z-10">
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
                alt="Global data network"
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-blue-900/80 mix-blend-multiply" />
            </div>

            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-2">The AI Opportunity</h2>
                <h3 className="text-3xl lg:text-4xl font-bold text-white">The Time To Adapt Is Now</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="p-6">
                  <div className="text-5xl font-bold text-blue-300 mb-2">88%</div>
                  <div className="text-lg font-medium opacity-90 mb-2">Global organisations using AI</div>
                  <div className="text-xs text-blue-400 opacity-75">McKinsey Global Survey, 2024</div>
                </div>
                <div className="p-6 border-t md:border-t-0 md:border-l border-blue-800">
                  <div className="text-5xl font-bold text-blue-300 mb-2">39%</div>
                  <div className="text-lg font-medium opacity-90 mb-2">Scaled AI enterprise-wide</div>
                  <div className="text-xs text-blue-400 opacity-75">McKinsey Global Survey, 2024</div>
                </div>
                <div className="p-6 border-t md:border-t-0 md:border-l border-blue-800">
                  <div className="text-5xl font-bold text-blue-300 mb-2">40h</div>
                  <div className="text-lg font-medium opacity-90 mb-2">Saved per department / month</div>
                  <div className="text-xs text-blue-400 opacity-75">Microsoft Copilot Impact Study, 2024</div>
                </div>
              </div>
              <div className="text-center mt-12 pt-12 border-t border-blue-800">
                <p className="text-xl font-light text-blue-100 max-w-2xl mx-auto leading-relaxed">
                  Organisations that act now gain a compounding advantage. Those that delay risk falling further behind as their competitors automate, accelerate, and scale.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-slate-50">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">Every Business Is Different</h2>
              <p className="text-xl text-slate-600 mb-10">
                We don't sell cookie-cutter solutions. Book a discovery call for a tailored plan aimed at your specific operational needs.
              </p>
              <div className="flex items-center justify-center">
                <button
                  onClick={() => scrollToSection('contact')}
                  className="w-full sm:w-auto px-10 py-4 rounded-lg bg-blue-900 text-white font-bold text-lg hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20"
                >
                  Speak To Us Today
                </button>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section id="contact" className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-16">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Get in touch.</h2>
                    <p className="text-slate-600 mb-8">
                      Ready to transform your business operations? Fill out the form, or reach out directly to schedule your Discovery Call.
                    </p>

                    <div className="space-y-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 flex items-center justify-center text-blue-900 rounded-full">
                          <Briefcase size={20} />
                        </div>
                        <a href="mailto:contact@jmcsolutions.ai" className="text-slate-700 hover:text-blue-900 transition-colors">contact@jmcsolutions.ai</a>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 flex items-center justify-center text-blue-900 rounded-full">
                          <Phone size={20} />
                        </div>
                        <a href="tel:07827337189" className="text-slate-700 hover:text-blue-900 transition-colors">07827 337 189</a>
                      </div>

                    </div>
                  </div>

                  <div className="mt-auto rounded-xl overflow-hidden relative w-full shadow-lg flex-grow min-h-[250px]">
                    <img
                      src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop"
                      alt="Professional consultation"
                      className="absolute inset-0 w-full h-full object-cover object-[center_20%] hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-end p-6">
                      <p className="text-white font-medium text-sm">"We partner with you to ensure sustainable adoption."</p>
                    </div>
                  </div>
                </div>

                <form className="space-y-4 relative flex flex-col h-full">
                  {selectedModules.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <h5 className="text-xs font-bold text-blue-900 uppercase mb-2">Your Project Scope:</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedModules.map((id) => {
                          const module = serviceModules.find((m) => m.id === id);
                          return (
                            <span key={id} className="text-xs bg-blue-600 text-white px-2 py-1 rounded border border-blue-600 flex items-center gap-1">
                              <Check size={12} /> {module?.title}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                      <input
                        type="text"
                        value={contactForm.firstName}
                        onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                      <input
                        type="text"
                        value={contactForm.lastName}
                        onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Business Email</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Company Name</label>
                    <input
                      type="text"
                      value={contactForm.company}
                      onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1 relative flex-grow">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
                      <button
                        onClick={handleAutoDraft}
                        disabled={isDrafting}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50"
                      >
                        {isDrafting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        {isDrafting ? 'Drafting...' : 'Auto-Draft with AI'}
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full h-full p-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors min-h-[120px]"
                    />
                  </div>

                  <button
                    onClick={handleSendEmail}
                    disabled={isSending}
                    className="w-full py-4 bg-blue-900 text-white font-bold hover:bg-blue-800 transition-all mt-4 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSending ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>

                  {sendStatus && (
                    <div className={`p-4 rounded-lg text-sm font-medium ${
                      sendStatus.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {sendStatus.message}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-16 bg-slate-50 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-900" />
            <div className="max-w-4xl mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-2">Common Questions</h2>
                <h3 className="text-3xl lg:text-4xl font-bold text-slate-900">Frequently Asked Questions</h3>
              </div>
              <div className="space-y-2">
                {[
                  { q: "What services does JMC Solutions offer?", a: "We offer end-to-end AI enablement for businesses: AI Foundations (tenant readiness and governance), Microsoft Copilot Enablement, AI Training, Process Automation, and Machine Learning solutions. Our engagements range from focused Copilot rollouts to broader digital transformation programmes." },
                  { q: "Do you offer different levels of training?", a: "Yes. We offer flexible training packages including 2-hour, 4-hour, 8-hour, and 16-hour sessions, delivered over a timeline that suits your organisation. All packages can include hands-on lab sessions for practical, real-world experience." },
                  { q: "Do we need to already have Microsoft 365 Copilot licences?", a: "No. We can advise on licensing as part of our engagement, and our AI Foundations module prepares your environment before you activate Copilot. If you already have licences, we can start enablement immediately." },
                  { q: "How long does a typical engagement take?", a: "It depends on your scope. A focused Copilot rollout (Foundations + Enablement + Training) typically spans 6-10 weeks. More complex programmes including automations or machine learning are scoped individually on your Discovery Call." },
                  { q: "What does a Discovery Call involve?", a: "It's a free, no-obligation 30-minute conversation to understand your current environment, your goals, and the challenges you're facing. From there, we'll outline the most appropriate approach and a clear next step." },
                  { q: "We're a small business, are JMC right for us?", a: "Absolutely. We specialise in helping SMEs access the same calibre of AI capability as enterprise organisations, without the overhead. Our services are modular so you can start small and scale as confidence and ROI grows." },
                  { q: "How is JMC Solutions different from going directly to Microsoft?", a: "Microsoft provides the tools - we provide the strategy, governance, training, and change management to ensure those tools actually get used and deliver measurable value. Many organisations buy Copilot and see low adoption without structured enablement support." },
                ].map((faq, i) => (
                  <div key={i} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                    <button
                      onClick={() => setActiveFaq(activeFaq === `home-${i}` ? null : `home-${i}`)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-sm font-semibold text-slate-800 pr-4">{faq.q}</span>
                      <ChevronDown size={18} className={`text-blue-600 shrink-0 transition-transform duration-200 ${activeFaq === `home-${i}` ? 'rotate-180' : ''}`} />
                    </button>
                    {activeFaq === `home-${i}` && (
                      <div className="px-5 pb-4 pt-0 border-t border-slate-100">
                        <p className="text-sm text-slate-600 leading-relaxed pt-3">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                <button
                  onClick={() => setActivePage('faq')}
                  className="text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors"
                >
                  View all FAQs &rarr;
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                <div className="flex items-center">
                  <img src={footerLogo} alt="JMC Solutions logo" className="h-10 w-auto object-contain" />
                </div>
                <div className="flex gap-6 text-sm font-medium">
                  <button onClick={() => setActivePage('faq')} className="hover:text-white transition-colors">FAQ</button>
                  <button onClick={() => setActivePage('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
                  <button onClick={() => setActivePage('cookies')} className="hover:text-white transition-colors">Cookie Policy</button>
                  <a href="https://www.linkedin.com/company/jmcsolutionsltd/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
                </div>
              </div>
              <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500">
                <div>&copy; {new Date().getFullYear()} JMC Solutions Ltd. All rights reserved.</div>
                <div className="flex gap-4">
                  <span>Registered in England &amp; Wales</span>
                  <span>&middot;</span>
                  <a href="mailto:contact@jmcsolutions.ai" className="hover:text-slate-300 transition-colors">contact@jmcsolutions.ai</a>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Joanna Chatbot */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className="mb-4 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
            <div className="bg-blue-900 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Joanna</h4>
                  <p className="text-blue-200 text-xs">Online</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white/70 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="h-80 overflow-y-auto p-4 bg-slate-50 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-3 rounded-lg text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-900 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.role === 'assistant' ? renderChatMessage(msg.text) : msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-3 rounded-lg rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-blue-900" />
                    <span className="text-xs text-slate-400">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about our services..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                className="bg-blue-900 text-white p-2 rounded-md hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-blue-900 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-blue-800 transition-all hover:scale-105 active:scale-95 group"
        >
          {isChatOpen ? <X size={24} /> : <MessageSquarePlus size={24} className="group-hover:animate-pulse" />}
        </button>
      </div>
    </div>
  );
};

export default JMCWebsite;
