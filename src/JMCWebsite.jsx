import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Bot, 
  ArrowRight, 
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
  Check
} from 'lucide-react';

const JMCWebsite = () => {
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

  // Selection State
  const [selectedModules, setSelectedModules] = useState([]);

  // AI Feature States - Virtual Consultant Chatbot
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: "Hello! I'm the JMC Virtual Assistant. Ask me about Copilot, Automation, or how we can help your business." }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isChatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const toggleModule = (id) => {
    setSelectedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  // Module Data
  const serviceModules = [
    {
      id: 'copilot',
      title: 'Copilot 365 Jumpstart',
      icon: LayoutTemplate,
      desc: 'Give every employee a personal AI assistant inside Microsoft 365 apps.',
      includes: [
        'Organisation-wide Copilot setup',
        'Role-specific prompt libraries',
        'Optimised 365 environment & governance',
        'Team onboarding and training',
        '30-day usage review',
        'Optional Microsoft Graph external connectors'
      ]
    },
    {
      id: 'workflow',
      title: 'Workflow Automation',
      icon: Zap,
      desc: 'Eliminate manual work with automated, end-to-end workflows.',
      includes: [
        'Automation of key business processes',
        'Data transformation & scheduled tasks',
        'Approval flows integrated with Teams',
        'System & API integrations',
        'Real-time notifications'
      ]
    },
    {
      id: 'assistant',
      title: 'Internal AI Assistant',
      icon: Bot,
      desc: 'A custom AI assistant that understands your business and takes action.',
      includes: [
        'Custom multi-department assistant in Teams',
        'Live system connections (Salesforce, SQL, Databricks)',
        'Workflow execution through Power Automate',
        'Secure business knowledge integration',
        'Guardrails & governance'
      ]
    }
  ];

  // --- Gemini API Integration ---
  const apiKey = ""; // Injected at runtime

  const callGemini = async (prompt, systemPrompt) => {
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
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
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (error) {
        if (i === 4) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  };

  const handleGenerateInsights = async () => {
    if (!industryInput.trim()) return;
    
    setIsGeneratingInsights(true);
    setInsightError(null);
    setAiInsights(null);

    try {
      const systemPrompt = "You are a senior AI consultant at JMC Solutions. Your goal is to impress a potential client by suggesting 3 specific, high-value use cases for Microsoft Copilot or Power Automate in their specific industry. Keep it professional, concise, and focused on ROI. Output strictly as a JSON object with a 'use_cases' array, where each object has a 'title' and 'description'.";
      const userPrompt = `Industry: ${industryInput}. Generate 3 specific AI use cases.`;

      // Request JSON response
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json" }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(text);
      setAiInsights(parsed.use_cases);

    } catch (error) {
      console.error("AI Generation Error:", error);
      setInsightError("Unable to generate insights at this moment. Please try again.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleAutoDraft = async (e) => {
    e.preventDefault();
    setIsDrafting(true);
    
    // Grab other form values if available, otherwise generic
    const companyName = document.getElementById('companyName')?.value || "my company";
    
    // Get readable list of selected modules
    const selectedTitles = serviceModules
      .filter(m => selectedModules.includes(m.id))
      .map(m => m.title)
      .join(', ');

    const selectionContext = selectedTitles 
      ? `They are specifically interested in: Foundations (Mandatory) and ${selectedTitles}.` 
      : "They haven't selected specific modules yet, but are interested in AI consulting.";

    try {
      const systemPrompt = "You are a helpful AI assistant for JMC Solutions. Draft a professional, concise inquiry message from a potential client to JMC Solutions. They are interested in AI consulting. Keep it polite and business-appropriate.";
      const userPrompt = `Draft a message from a user at ${companyName} who wants to book a discovery call. ${selectionContext}`;
      
      const text = await callGemini(userPrompt, systemPrompt);
      setContactMessage(text);
    } catch (error) {
      console.error("Drafting Error:", error);
      setContactMessage("I'm interested in booking a discovery call to discuss how AI can benefit my business.");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const systemPrompt = `You are the Virtual Consultant for JMC Solutions Ltd. 
      We are a premium AI consultancy helping SMEs implement Microsoft Copilot, Power Automate, and Custom AI Assistants.
      
      Our Services:
      1. Copilot 365 Jumpstart: Enabling Copilot in Word, Excel, Teams.
      2. Workflow Automation: Automating manual tasks with Power Automate.
      3. Internal AI Assistant: Building custom chatbots with Copilot Studio.
      4. Foundations: Security and data audits.
      
      Founders: Fin (Tech/Data) and Amit (Change/Strategy).
      
      Goal: Answer questions briefly and professionally. Always encourage the user to 'Book a Discovery Call' for complex queries. 
      Keep responses under 50 words if possible.`;

      const aiResponse = await callGemini(userMsg, systemPrompt);
      setChatMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble connecting. Please try again shortly." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
      
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-slate-50 py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('hero')}>
            <div className="w-8 h-8 bg-blue-900 rounded-sm flex items-center justify-center text-white font-bold text-lg tracking-tighter">JMC</div>
            <span className="text-xl font-semibold tracking-tight text-slate-900">JMC Solutions Ltd.</span>
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
          <button 
            className="md:hidden text-slate-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
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
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative pt-24 pb-12 lg:pt-36 lg:pb-20 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-slate-50 to-white -z-10 opacity-50" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 opacity-60" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-slate-50 rounded-full blur-3xl -z-10" />

        {/* Hero Image with Gradient Overlay */}
        <div className="absolute inset-y-0 right-0 w-full md:w-3/5 lg:w-3/5 z-0">
          <img 
            src="https://images.unsplash.com/photo-1573496359142-b8d877341ace?q=80&w=2670&auto=format&fit=crop" 
            alt="Consultants in a meeting reviewing data" 
            className="w-full h-full object-cover object-left-top opacity-90" 
          />
          {/* Gradient Overlay: White (Left) -> Transparent (Right) */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent sm:via-white/40"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-transparent md:hidden"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10"> {/* Ensure content is above the image */}
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100 shadow-sm bg-white/80 backdrop-blur-sm">
              Enterprise AI Consulting
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-slate-900 mb-8 drop-shadow-sm">
              Practical AI for <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-blue-600">
                Real Businesses.
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl leading-relaxed mb-8 bg-white/60 backdrop-blur-sm md:bg-transparent p-2 md:p-0 rounded-lg">
              We deploy secure, reliable AI systems that improve efficiency, automate your workflows, and deliver measurable value for every employee.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => scrollToSection('contact')}
                className="px-8 py-4 bg-blue-900 text-white font-medium hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2"
              >
                Book a Discovery Call <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => scrollToSection('approach')}
                className="px-8 py-4 bg-white text-slate-800 border border-slate-200 font-medium hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                AI Readiness Audit
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ✨ NEW SECTION: AI Industry Insights ✨ */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-900"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100">
                <Sparkles size={14} className="fill-blue-900" /> Live AI Demo
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
                See What AI Can Do<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-blue-600">For Your Industry.</span>
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Not sure where to start? Enter your industry below, and our Gemini-powered consultant will generate three high-impact use cases tailored specifically for you.
              </p>

              <div className="bg-slate-50 p-2 rounded-md border border-slate-200 flex flex-col sm:flex-row gap-2 shadow-sm max-w-md">
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

            <div className="bg-slate-50 border border-slate-100 p-8 min-h-[400px] relative rounded-xl">
               {!aiInsights && !isGeneratingInsights && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-center p-8">
                   <Bot size={48} className="mb-4 opacity-20" />
                   <p>Enter your industry to unlock tailored AI strategies.</p>
                 </div>
               )}

               {isGeneratingInsights && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-900 p-8">
                    <Loader2 size={48} className="animate-spin mb-4 text-blue-600" />
                    <p className="font-medium animate-pulse">Consulting our knowledge base...</p>
                 </div>
               )}

               {aiInsights && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Recommended Strategy for {industryInput}</h3>
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
          </div>
        </div>
      </section>

      {/* Why You Need This */}
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

      {/* About Us */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Who We Are</h2>
            <h3 className="text-3xl lg:text-4xl font-bold text-slate-900">Experienced AI consultants with deep industry expertise.</h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Fin */}
            <div className="group relative bg-white border border-slate-100 p-8 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-900 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-xl font-bold text-slate-400">F</div>
                <div>
                  <h4 className="text-2xl font-bold text-slate-900">Fin</h4>
                  <p className="text-blue-800 font-medium">Co-Founder</p>
                </div>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Six years of AI implementation and data automation experience. Delivered enterprise AI, analytics, and automation projects for high-profile clients.
              </p>
              
              <div className="bg-slate-50 p-6 mb-6">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Trusted By</h5>
                <ul className="grid grid-cols-2 gap-3 text-sm font-medium text-slate-700">
                  <li className="flex items-center gap-2"><Briefcase size={14} className="text-blue-900"/> Kubrick Group</li>
                  <li className="flex items-center gap-2"><Briefcase size={14} className="text-blue-900"/> Schroders Personal Wealth</li>
                  <li className="flex items-center gap-2"><Briefcase size={14} className="text-blue-900"/> Lloyds Banking Group</li>
                  <li className="flex items-center gap-2"><Briefcase size={14} className="text-blue-900"/> Ascot Insurance</li>
                  <li className="flex items-center gap-2"><Briefcase size={14} className="text-blue-900"/> Millennium Management</li>
                  <li className="flex items-center gap-2"><Briefcase size={14} className="text-blue-900"/> Zoopla</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-bold text-slate-900">Specialisation</h5>
                <div className="flex flex-wrap gap-2">
                  {['Microsoft AI Ecosystem', 'Copilot Deployment', 'Data Automation', 'Workflow Engineering'].map((tag) => (
                    <span key={tag} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-sm text-slate-600">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Amit */}
            <div className="group relative bg-white border border-slate-100 p-8 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-900 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-xl font-bold text-slate-400">A</div>
                <div>
                  <h4 className="text-2xl font-bold text-slate-900">Amit</h4>
                  <p className="text-blue-800 font-medium">Co-Founder</p>
                </div>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Six years in digital transformation and organisational change. Expert in bridging the gap between technical capability and human adoption.
              </p>
              
              <div className="bg-slate-50 p-6 mb-6">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Experience</h5>
                <ul className="space-y-3 text-sm font-medium text-slate-700">
                  <li className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <span className="font-bold text-blue-900">Accenture</span>
                    <span className="text-slate-400">|</span> 
                    3 Years Digital Transformation
                  </li>
                  <li className="flex items-center gap-2 pb-2">
                    <span className="font-bold text-blue-900">Essjay Solutions</span>
                    <span className="text-slate-400">|</span> 
                    3 Years Change Management
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-bold text-slate-900">Specialisation</h5>
                <div className="flex flex-wrap gap-2">
                  {['Digital Strategy', 'Process Redesign', 'Stakeholder Management', 'Adoption & Change'].map((tag) => (
                    <span key={tag} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-sm text-slate-600">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MERGED: Services & Approach */}
      <section id="approach" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Our Services & Approach</h2>
            <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Flexible implementation, built on solid foundations.</h3>
            <p className="text-lg text-slate-600">
               We believe in a modular approach. Every engagement starts with a mandatory security audit. From there, you select the specific AI capabilities your business needs—whether that's just one module or all three.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Central Connector Line (Desktop) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2 hidden md:block -z-10"></div>

            {/* Step 1: Mandatory */}
            <div className="relative z-10 mb-16 text-center">
              <div className="inline-block bg-blue-900 text-white px-6 py-2 rounded-full font-bold text-sm mb-6 shadow-lg shadow-blue-900/20 ring-4 ring-white">
                Step 1: Mandatory Foundation
              </div>
              <div className="bg-white border-2 border-blue-100 p-8 rounded-2xl shadow-lg max-w-2xl mx-auto relative text-left">
                 <div className="flex items-center gap-4 justify-center mb-6 border-b border-slate-100 pb-6">
                   <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-900">
                     <ShieldCheck size={24} />
                   </div>
                   <h4 className="text-2xl font-bold text-slate-900">Foundations — Data & Permissions Audit</h4>
                 </div>
                 
                 <p className="text-center text-slate-600 mb-8 text-base italic leading-relaxed">
                   Prepare your data and access controls for compliant and effective AI adoption.
                 </p>

                 <div className="mb-2">
                   <h5 className="text-xs font-bold text-blue-900 uppercase mb-4 tracking-wider text-center sm:text-left">Includes:</h5>
                   <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                     {[
                       'Full data and content audit',
                       'Permissions review and clean-up',
                       'Role-based group access structuring',
                       'SharePoint, OneDrive, and Teams optimisation'
                     ].map((item, i) => (
                       <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                         <CheckCircle2 size={16} className="text-blue-600 mt-0.5 shrink-0" />
                         {item}
                       </li>
                     ))}
                   </ul>
                 </div>

                 {/* Connector Node */}
                 <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-b-2 border-r-2 border-blue-100 transform rotate-45"></div>
              </div>
            </div>

            {/* Fork Label */}
             <div className="relative z-10 text-center mb-12">
                <span className="bg-slate-100 text-slate-600 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-200 ring-4 ring-white">
                  Step 2: Select Your Modules (Click to add to proposal)
                </span>
             </div>

            {/* Step 2: Options Grid - SELECTABLE */}
            <div className="grid md:grid-cols-3 gap-6 relative z-10">
               {serviceModules.map((module) => {
                 const isSelected = selectedModules.includes(module.id);
                 const Icon = module.icon;
                 
                 return (
                   <div 
                     key={module.id}
                     onClick={() => toggleModule(module.id)}
                     className={`p-8 rounded-xl border shadow-sm transition-all group flex flex-col cursor-pointer relative ${
                       isSelected 
                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                        : 'bg-white border-slate-200 hover:shadow-xl hover:border-blue-300'
                     }`}
                   >
                      {isSelected && (
                        <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-1">
                          <Check size={16} />
                        </div>
                      )}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-transform ${
                        isSelected ? 'bg-blue-100 text-blue-700 scale-110' : 'bg-blue-50 text-blue-900 group-hover:scale-110'
                      }`}>
                        <Icon size={24} />
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">{module.title}</h4>
                      <p className="text-sm text-slate-500 italic mb-4 border-b border-slate-100 pb-4">
                        {module.desc}
                      </p>
                      <div className="flex-grow">
                        <h5 className="text-xs font-bold text-blue-900 uppercase mb-3 tracking-wider">Includes:</h5>
                        <ul className="space-y-2 mb-6">
                          {module.includes.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-600 text-xs">
                              <div className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${isSelected ? 'bg-blue-600' : 'bg-blue-400'}`}></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-auto pt-4 border-t border-slate-100">
                        <div className={`flex items-center gap-2 text-[10px] font-bold px-3 py-2 rounded-md transition-colors ${
                          isSelected ? 'bg-blue-100 text-blue-900' : 'bg-blue-50 text-blue-800'
                        }`}>
                          <CheckCircle2 size={12} /> Includes Training & Support
                        </div>
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section id="outcomes" className="py-16 bg-blue-900 text-white relative overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" 
            alt="Global data network" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-blue-900/80 mix-blend-multiply"></div>
        </div>
        
        {/* Geometric Decoration */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
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

      {/* Pricing / CTA */}
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
            <div className="flex flex-col h-full">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Get in touch.</h2>
              <p className="text-slate-600 mb-8">
                Ready to transform your business operations? Fill out the form, or reach out directly to schedule your audit.
              </p>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 flex items-center justify-center text-blue-900 rounded-full">
                    <Briefcase size={20} />
                  </div>
                  <span className="text-slate-700">hello@jmcsolutions.ltd</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 flex items-center justify-center text-blue-900 rounded-full">
                    <Users size={20} />
                  </div>
                  <span className="text-slate-700">+44 (0) 20 7123 4567</span>
                </div>
              </div>

              {/* Professional Image */}
              <div className="mt-auto rounded-xl overflow-hidden relative w-full shadow-lg flex-grow h-32 lg:h-48">
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop" 
                  alt="Professional consultation" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-end p-6">
                   <p className="text-white font-medium text-sm">"We partner with you to ensure sustainable adoption."</p>
                </div>
              </div>
            </div>

            <form className="space-y-4 relative">
              {/* Dynamic Selection Summary - Only shows if modules are selected */}
              {selectedModules.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <h5 className="text-xs font-bold text-blue-900 uppercase mb-2">Your Project Scope:</h5>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-white px-2 py-1 rounded border border-blue-200 text-slate-600 flex items-center gap-1">
                      <ShieldCheck size={12} className="text-blue-500"/> Foundations (Mandatory)
                    </span>
                    {selectedModules.map(id => {
                      const module = serviceModules.find(m => m.id === id);
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
                  <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                  <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Business Email</label>
                <input type="email" className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Company Name</label>
                <input id="companyName" type="text" className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors" />
              </div>
              <div className="space-y-1 relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
                  <button 
                    onClick={handleAutoDraft}
                    disabled={isDrafting}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50"
                  >
                     {isDrafting ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12} />}
                     {isDrafting ? 'Drafting...' : 'Auto-Draft with AI'}
                  </button>
                </div>
                <textarea 
                  rows={4} 
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors"
                ></textarea>
              </div>
              <button className="w-full py-4 bg-blue-900 text-white font-bold hover:bg-blue-800 transition-all mt-4 shadow-lg">
                Send Message
              </button>
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
          <div className="text-sm">
            &copy; {new Date().getFullYear()} JMC Solutions Ltd. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>

       {/* ✨ NEW FEATURE: AI Virtual Consultant Chatbot ✨ */}
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
                  <p className="text-blue-200 text-xs">Online | Powered by Gemini</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white/70 hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            <div className="h-80 overflow-y-auto p-4 bg-slate-50 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-900 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                  }`}>
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
