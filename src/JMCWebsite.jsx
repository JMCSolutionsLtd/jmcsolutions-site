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
  Package
} from 'lucide-react';
import logo from './assets/JMC Solutions_v2_1.png';

// --- Page Components ---

const PrivacyPolicy = ({ onBack }) => (
  <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
    <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800 mb-8 font-medium">
      <ArrowLeft size={16} className="mr-2" /> Back to Home
    </button>
    <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
    <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
      <p><strong>Last Updated:</strong> November 26, 2025</p>
      <p>JMC Solutions Ltd ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website.</p>

      <h3 className="text-xl font-bold text-slate-900 mt-8">1. Information We Collect</h3>
      <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site (such as the "Discovery Call" form).</li>
        <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
      </ul>

      <h3 className="text-xl font-bold text-slate-900 mt-8">2. Use of Your Information</h3>
      <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Compile anonymous statistical data and analysis for use internally.</li>
        <li>Deliver targeted advertising, coupons, newsletters, and other information regarding promotions and the Site to you.</li>
        <li>Email you regarding your account or order.</li>
        <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
      </ul>

      <h3 className="text-xl font-bold text-slate-900 mt-8">3. Data Security</h3>
      <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

      <h3 className="text-xl font-bold text-slate-900 mt-8">4. Contact Us</h3>
      <p>If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:contact@jmcsolutions.ai" className="text-blue-600 hover:underline">contact@jmcsolutions.ai</a></p>
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

  // AI Feature States - Virtual Consultant Chatbot
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: "Hello! I'm the JMC Virtual Assistant. Ask me about Copilot, Automation, or how we can help your business." }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

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
    core: ['foundations', 'copilot', 'training', 'retainer'],
    plus: ['foundations', 'copilot', 'training', 'automations', 'retainer'],
    max: ['foundations', 'copilot', 'training', 'automations', 'agentic', 'retainer'],
    complete: ['foundations', 'copilot', 'training', 'automations', 'agentic', 'ml', 'retainer']
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
      title: 'AI Training and Effective Adoption',
      icon: GraduationCap,
      summary: 'Ensure your investment pays off with role-based training and structured adoption programmes.',
      desc: 'Deployment is not adoption. We train your staff on how to actually use these tools in their specific roles to drive real productivity gains.',
      includes: [
        'Role-based Team Training Sessions',
        '30-day Adoption Tracking & Analytics',
        'Usage Optimisation Workshops',
        'Change Management Support'
      ]
    },
    {
      id: 'automations',
      title: 'AI Automations',
      icon: Zap,
      summary: 'Replace repetitive, manual work with intelligent workflows across Microsoft and external platforms.',
      desc: 'Replace repetitive, manual work with intelligent automation. This pack includes any appropriate AI-driven automation, across Microsoft and external platforms.',
      includes: [
        'Process Mapping & ROI Prioritisation',
        'Power Automate Workflows & Document Processing',
        'Voice Agents & Messaging Bots',
        'Cross-system Integrations & Website Creation'
      ]
    },
    {
      id: 'agentic',
      title: 'Agentic AI',
      icon: Bot,
      summary: 'Design and deploy secure, context-aware AI agents that act on behalf of your organisation using Copilot Studio.',
      desc: 'Design and deploy secure, context-aware AI agents that act on behalf of the organisation. These are not chatbots; they are governed agents capable of execution.',
      includes: [
        'Agent Blueprinting & Persona Design',
        'Knowledge Retrieval & Task Execution Skills',
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
      summary: 'Continuous training, optimisation, and governance to ensure long-term value as your organisation evolves.',
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

    setIsGeneratingInsights(true);
    setInsightError(null);
    setAiInsights(null);

    try {
      const systemPrompt = `You are a senior AI consultant at JMC Solutions. For the given industry, return EXACTLY FOUR use cases, one in each of these categories: "copilot" (Microsoft 365 Copilot idea), "automation" (AI Automation / Power Automate-style workflow), "agentic" (agentic AI using Copilot Studio that can take actions), and "ml" (Machine Learning & Analytics idea such as predictive or anomaly detection).

        Rules:
        - Return exactly 4 items, no more and no less.
        - Output strictly as valid JSON with a top-level object containing a single key "use_cases" whose value is an array of 4 objects.
        - Each object must have these keys: "category" (one of: copilot, automation, agentic, machine learning), "title" (short, 6-10 words max), and "description" (1-2 concise sentences focused on ROI and feasibility).
        - Order does matter, categories must be unique (one per category).
        - Do not include any extra commentary, notes, or metadata outside the JSON object.`;
      const userPrompt = `Industry: ${industryInput}. Generate 4 specific AI use cases.`;

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
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const parsed = JSON.parse(text);
      setAiInsights(parsed.use_cases || []);
    } catch (error) {
      console.error('AI Generation Error:', error);
      setInsightError('Unable to generate insights at this moment. Please try again.');
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
      const systemPrompt = `You are the Virtual Consultant for JMC Solutions Ltd.
We are a premium AI consultancy helping SMEs implement Microsoft Copilot, Power Automate, and Custom AI Assistants.

Our Services:
1. AI Foundations: Data audits, security, and governance.
2. Copilot 365 Enablement: Technical setup and configuration.
3. AI Training and Effective Adoption: Role-based training and adoption tracking.
4. AI Automations: Workflows, voice agents, and process automation.
5. Agentic AI: Custom autonomous agents using Copilot Studio.
6. Machine Learning & Advanced Analytics: Bespoke models and predictive analytics.
7. Ongoing Support & Optimisation: Continuous optimization and updates.

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

  const bundleConfig = {
    core: { 
      label: 'Core', 
      desc: 'AI Set-Up & Adoption',
      colorClass: 'bg-red-50 border-red-200 hover:border-red-400',
      activeClass: 'ring-2 ring-red-500 border-red-500 bg-red-100'
    },
    plus: { 
      label: 'Automate Plus', 
      desc: 'Core + Automations',
      colorClass: 'bg-orange-50 border-orange-200 hover:border-orange-400',
      activeClass: 'ring-2 ring-orange-500 border-orange-500 bg-orange-100'
    },
    max: { 
      label: 'Automate Max', 
      desc: 'Plus + Agentic AI',
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
              { name: 'About', id: 'about' },
              { name: 'Services & Approach', id: 'approach' },
              { name: 'Outcomes', id: 'outcomes' }
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
              { name: 'About', id: 'about' },
              { name: 'Services & Approach', id: 'approach' },
              { name: 'Outcomes', id: 'outcomes' },
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

          <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-700 flex items-center justify-center text-white font-bold text-xs rounded-sm">JMC</div>
                <span className="text-slate-200 font-semibold">JMC Solutions Ltd.</span>
              </div>
              <div className="text-sm">&copy; {new Date().getFullYear()} JMC Solutions Ltd. All rights reserved.</div>
              <div className="flex gap-6 text-sm font-medium">
                <button onClick={() => setActivePage('privacy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
                <button onClick={() => setActivePage('cookies')} className="hover:text-white transition-colors">
                  Cookie Policy
                </button>
                <a href="#" className="hover:text-white transition-colors">
                  LinkedIn
                </a>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Home */}
      {showHome && (
        <>
          {/* Hero Section */}
          <section id="hero" className="relative pt-[108px] sm:pt-24 pb-12 lg:pt-36 lg:pb-20 overflow-hidden bg-blue-900">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-blue-900 to-blue-950 -z-10 opacity-30" />
            <div className="absolute top-20 right-10 w-64 h-64 bg-blue-700 rounded-full blur-3xl -z-10 opacity-25" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-800 rounded-full blur-3xl -z-10 opacity-20" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="max-w-4xl">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-8 drop-shadow-lg">
                  Secure AI Implementation <br className="hidden lg:block" />
                  <span className="text-blue-100">
                    Across Your Business.
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-blue-50 max-w-2xl leading-relaxed mb-8">
                  As a Microsoft Solutions Partner, we help SMEs adopt AI safely and compliantly, making your organisation future-ready with Microsoft 365 Copilot, smart automations, and agentic assistants built around your data.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
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
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-blue-600">For Your Industry.</span>
                  </h2>
                  <p className="text-lg text-slate-600 mb-8">
                    Not sure where to start? Enter your industry below, and our AI consultant will generate three high-impact use cases tailored specifically for you.
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

          {/* About (Moved Here) */}
          <section id="about" className="py-16 bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-900" />
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Who We Are</h2>
                <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">We’re a specialist AI consulting team.</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  With almost two decades of experience in AI implementation, workflow automation, and digital transformation, we have delivered programmes for more than 15 global organisations. Now, we bring that enterprise expertise to you.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 relative z-10">
                <div className="group bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-full border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                    <svg width="30" height="30" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 0H10.5623V10.5623H0V0Z" fill="#F25022" />
                      <path d="M12.4377 0H23V10.5623H12.4377V0Z" fill="#7FBA00" />
                      <path d="M0 12.4377H10.5623V23H0V12.4377Z" fill="#00A4EF" />
                      <path d="M12.4377 12.4377H23V23H12.4377V12.4377Z" fill="#FFB900" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold text-blue-900 mb-2">Microsoft</h4>
                  <p className="font-bold text-slate-900 mb-2">Solutions Partner</p>
                  <p className="text-sm text-slate-500">Certified expertise delivering enterprise-grade Microsoft AI and Cloud solutions.</p>
                </div>

                <div className="group bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-blue-900">
                    <Globe size={32} />
                  </div>
                  <h4 className="text-4xl font-bold text-blue-900 mb-2">15+</h4>
                  <p className="font-bold text-slate-900 mb-2">Global Enterprises</p>
                  <p className="text-sm text-slate-500">Delivering complex solutions for major financial, retail, and technology brands.</p>
                </div>

                <div className="group bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-blue-900">
                    <TrendingUp size={32} />
                  </div>
                  <h4 className="text-4xl font-bold text-blue-900 mb-2">SME</h4>
                  <p className="font-bold text-slate-900 mb-2">Specialised Focus</p>
                  <p className="text-sm text-slate-500">Bridging the gap for smaller organisations to adopt enterprise-grade AI safely.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Services & Approach */}
          <section id="approach" className="py-16 bg-white relative">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Our Services & Approach</h2>
                <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Full Service Capabilities.</h3>
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
                  <h3 className="text-xl font-bold mb-3 text-slate-900">Automate the Routine</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Workflow automation eliminates repetitive tasks. Let your team focus on strategy while our systems handle the manual labour.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-none border-l-4 border-blue-400 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-blue-50 flex items-center justify-center mb-6 text-blue-600">
                    <Bot size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">Centralised Intelligence</h3>
                  <p className="text-slate-600 leading-relaxed">
                    An internal assistant centralises business knowledge, giving early adopters a major competitive advantage in speed and accuracy.
                  </p>
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
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="p-6">
                  <div className="text-5xl font-bold text-blue-300 mb-2">40%</div>
                  <div className="text-lg font-medium opacity-90">Faster Document Processing</div>
                </div>
                <div className="p-6 border-t md:border-t-0 md:border-l border-blue-800">
                  <div className="text-5xl font-bold text-blue-300 mb-2">40h</div>
                  <div className="text-lg font-medium opacity-90">Saved Per Dept / Month</div>
                </div>
                <div className="p-6 border-t md:border-t-0 md:border-l border-blue-800">
                  <div className="text-5xl font-bold text-blue-300 mb-2">50%</div>
                  <div className="text-lg font-medium opacity-90">Fewer Manual Tasks</div>
                </div>
              </div>
              <div className="text-center mt-12 pt-12 border-t border-blue-800">
                <p className="text-xl font-light text-blue-100 max-w-2xl mx-auto">
                  "Clean, secure data across the business with instant access to searchable company knowledge."
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-slate-50">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">Every Business Is Different.</h2>
              <p className="text-xl text-slate-600 mb-10">
                We don't sell cookie-cutter solutions. Book a discovery call for a tailored proposal aimed at your specific operational needs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => scrollToSection('contact')}
                  className="w-full sm:w-auto px-10 py-4 bg-blue-900 text-white font-bold text-lg hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20"
                >
                  Book a Discovery Call
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="w-full sm:w-auto px-10 py-4 bg-white text-slate-900 font-medium border border-slate-300 hover:bg-slate-50 transition-all"
                >
                  Request Proposal
                </button>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section id="contact" className="py-16 bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-16">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Get in touch.</h2>
                    <p className="text-slate-600 mb-8">
                      Ready to transform your business operations? Fill out the form, or reach out directly to schedule your audit.
                    </p>

                    <div className="space-y-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 flex items-center justify-center text-blue-900 rounded-full">
                          <Briefcase size={20} />
                        </div>
                        <span className="text-slate-700">fin@jmcsolutions.ai</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 flex items-center justify-center text-blue-900 rounded-full">
                          <Users size={20} />
                        </div>
                        <span className="text-slate-700">+44 (0) 7827337189</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto rounded-xl overflow-hidden relative w-full shadow-lg flex-grow min-h-[250px]">
                    <img
                      src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop"
                      alt="Professional consultation"
                      className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
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

          {/* Footer */}
          <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-700 flex items-center justify-center text-white font-bold text-xs rounded-sm">JMC</div>
                <span className="text-slate-200 font-semibold">JMC Solutions Ltd.</span>
              </div>
              <div className="text-sm">&copy; {new Date().getFullYear()} JMC Solutions Ltd. All rights reserved.</div>
              <div className="flex gap-6 text-sm font-medium">
                <button onClick={() => setActivePage('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
                <button onClick={() => setActivePage('cookies')} className="hover:text-white transition-colors">Cookie Policy</button>
                <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Chatbot */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className="mb-4 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
            <div className="bg-blue-900 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">JMC Virtual Consultant</h4>
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
                    {msg.text}
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
