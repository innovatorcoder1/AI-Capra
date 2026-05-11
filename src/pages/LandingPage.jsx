import React from 'react';
import { 
  Shield, Zap, CircleDot, ChevronRight, Sparkles, 
  FileText, MessageSquare, Cpu, Globe, Users, 
  ArrowRight, CheckCircle2, Image, Video, Briefcase, Brain, BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import './LandingPage.css';

const functionalities = [
  {
    icon: MessageSquare,
    title: 'Multi-Model AI Chat',
    desc: 'Access GPT-4o, Claude 3.5, and Gemini Pro in a single, unified interface.',
    status: 'Live'
  },
  {
    icon: Image,
    title: 'Image Forge',
    desc: 'Generate hyper-realistic 4K images with custom styles and aspect ratios.',
    status: 'Live'
  },
  {
    icon: FileText,
    title: 'Smart Document Analysis',
    desc: 'Upload complex PDFs and get instant semantic insights and summaries.',
    status: 'Live'
  },
  {
    icon: Video,
    title: 'Video Synthesis',
    desc: 'Transform text prompts into high-fidelity cinematic video clips.',
    status: 'Coming Soon'
  },
  {
    icon: Briefcase,
    title: 'AI Career Coach',
    desc: 'Get personalized career roadmaps and interview preparation.',
    status: 'Beta'
  },
  {
    icon: Brain,
    title: 'Psychological Insights',
    desc: 'Deep psychological analysis for wellness and mental growth.',
    status: 'Beta'
  }
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="navbar glass">
        <div className="nav-brand">
          <img src="/logo.png" alt="AI CAPRA" className="nav-logo" />
          <span className="brand-name">AI CAPRA</span>
        </div>
        <div className="nav-links">
          <a href="#solutions">Solutions</a>
          <a href="#how-it-works">Process</a>
          <a href="#roadmap">Future</a>
        </div>
        <button className="btn-primary" onClick={() => navigate('/chat')}>
          Launch Intelligence
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow"></div>
        <div className="hero-grid">
          <motion.div 
            className="hero-info"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-badge">
               <Sparkles size={14} color="var(--gold)" />
               <span>The Next Frontier of Neural Excellence</span>
            </div>
            <h1 className="hero-title">
              Unleash the Power of <br />
              <span className="gold-text">Autonomous Intelligence</span>
            </h1>
            <p className="hero-subtitle">
              AI Capra is an elite ecosystem of generative engines, semantic analyzers, 
              and cognitive assistants. Built for those who demand absolute precision.
            </p>
            
            <ul className="hero-feature-list">
               <li><CheckCircle2 size={20} color="var(--gold)" /> Autonomous Neural Reasoning</li>
               <li><CheckCircle2 size={20} color="var(--gold)" /> Multi-Model Synthesis Engine</li>
               <li><CheckCircle2 size={20} color="var(--gold)" /> Enterprise Precision Analytics</li>
            </ul>

            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigate('/chat')}>
                Get Started Free <ChevronRight size={18} />
              </button>
              <button className="btn-secondary">Technical Specs</button>
            </div>
          </motion.div>

          <motion.div 
            className="hero-visual-box"
            initial={{ scale: 0.8, opacity: 0, x: 30 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
          >
            <div className="hero-img-wrapper glass">
              <img 
                src="/assets/landing/hero-natural.png" 
                alt="AI Capra Intelligence" 
                className="hero-main-img" 
              />
              <div className="img-overlay-text">
                <div className="overlay-badge">Neural Core v2.4</div>
                <span>System Active: Stable</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="features-section">
        <div className="section-header">
          <span className="section-tag">Core Engines</span>
          <h2 className="section-title">Superior Cognitive Capabilities</h2>
        </div>

        <div className="showcase-grid">
           <motion.div 
             className="showcase-item glass"
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
           >
              <div className="showcase-info">
                <h3>Image Forge Pro</h3>
                <p>Generate high-fidelity visual assets with our proprietary diffusion framework. 4K resolution, perfect lighting, and infinite styles.</p>
                <ul className="feature-list-simple">
                   <li><CheckCircle2 size={16} /> Ultra-HD Output</li>
                   <li><CheckCircle2 size={16} /> Style Consistency</li>
                   <li><CheckCircle2 size={16} /> Fast Inference</li>
                </ul>
              </div>
              <div className="showcase-visual-box">
                <img src="/assets/landing/image-forge.png" alt="Image Forge" />
              </div>
           </motion.div>

           <motion.div 
             className="showcase-item glass reverse"
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
           >
              <div className="showcase-info">
                <h3>Semantic Document Intelligence</h3>
                <p>Turn mountains of data into actionable insights. Our RAG-powered analyzer understands context, tone, and hidden patterns.</p>
                <ul className="feature-list-simple">
                   <li><CheckCircle2 size={16} /> Instant Summarization</li>
                   <li><CheckCircle2 size={16} /> Cross-Doc Referencing</li>
                   <li><CheckCircle2 size={16} /> Export to Pro Layouts</li>
                </ul>
              </div>
              <div className="showcase-visual-box">
                <img src="/assets/landing/doc-intel.png" alt="Doc Analysis" />
              </div>
           </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="how-it-works">
        <div className="section-header">
           <span className="section-tag">Workflow</span>
           <h2 className="section-title">Three Steps to Mastery</h2>
        </div>
        <div className="steps-container">
           <div className="step-card">
              <div className="step-num">01</div>
              <h4>Initialize Prompt</h4>
              <p>Define your vision or upload your complex datasets.</p>
           </div>
           <div className="step-card">
              <div className="step-num">02</div>
              <h4>Neural Processing</h4>
              <p>Our distributed engines process and refine your request.</p>
           </div>
           <div className="step-card">
              <div className="step-num">03</div>
              <h4>Execute Output</h4>
              <p>Receive professional-grade results in seconds.</p>
           </div>
        </div>
      </section>

      {/* Future Roadmap */}
      <section id="roadmap" className="roadmap-section">
        <div className="roadmap-box glass">
          <div className="roadmap-content">
            <span className="section-tag">Ecosystem Evolution</span>
            <h2>The Future Horizon</h2>
            <div className="roadmap-items">
              <div className="roadmap-item">
                <Zap size={20} color="var(--gold)" />
                <span>Video Synthesis Engine (v2.0)</span>
              </div>
              <div className="roadmap-item">
                <Globe size={20} color="var(--gold)" />
                <span>Global Multi-lingual Expansion</span>
              </div>
              <div className="roadmap-item">
                <Cpu size={20} color="var(--gold)" />
                <span>Decentralized AI Nodes</span>
              </div>
            </div>
          </div>
          <div className="roadmap-visual">
             <div className="roadmap-glow"></div>
             <motion.div
               animate={{ rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             >
                <Cpu size={140} color="var(--gold)" />
             </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Lead the Revolution?</h2>
        <p>Join the world's most advanced AI platform and transcend traditional limits.</p>
        <button className="btn-primary large" onClick={() => navigate('/chat')}>
          Get Early Access Now
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <img src="/logo.png" alt="AI CAPRA" className="nav-logo" />
            <h3>AI CAPRA</h3>
          </div>
          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>Engines</h4>
              <a href="#">Chat Arena</a>
              <a href="#">Image Forge</a>
              <a href="#">Doc Intel</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Security</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 AI CAPRA Technologies. Intelligence Redefined.</p>
        </div>
      </footer>
    </div>
  );
}
