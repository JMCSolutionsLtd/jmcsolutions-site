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
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // read from environment

  const callGemini = async (prompt, systemPrompt) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

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
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
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
      {/* the rest of your component exactly as you pasted, omitted here for brevity */}
    </div>
  );
};

export default JMCWebsite;
