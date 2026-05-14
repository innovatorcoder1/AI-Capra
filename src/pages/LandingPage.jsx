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
    title: 'Elite Neural Chat',
    desc: 'Engage with GPT-5.2, Claude 4.5, and Gemini 3 Pro in a single high-performance arena. Absolute cognitive dominance.',
    status: 'Live',
    color: 'var(--accent-primary)'
  },
  {
    icon: Image,
    title: 'Neural Image Forge',
    desc: 'Synthesize hyper-realistic 8K visual assets with our proprietary diffusion frameworks. Total creative control.',
    status: 'Live',
    color: 'var(--gold)'
  },
  {
    icon: FileText,
    title: 'Semantic Intelligence',
    desc: 'Extract deep ontological insights from complex datasets with RAG-powered semantic analysis and real-time processing.',
    status: 'Live',
    color: '#00c972'
  },
  {
    icon: Briefcase,
    title: 'Neural Document Architect',
    desc: 'Transform abstract concepts into structured, professional documents with AI-driven precision and formatting.',
    status: 'Live',
    color: '#15a7e0'
  },
  {
    icon: Video,
    title: 'Cinematic Synthesis',
    desc: 'Transform complex prompts into ultra-high-fidelity cinematic video sequences. The future of media generation.',
    status: 'Coming Soon',
    color: '#a855f7'
  },
  {
    icon: Brain,
    title: 'Cognitive Development',
    desc: 'Deep psychological modeling and personalized career roadmaps for peak performance and professional evolution.',
    status: 'Beta',
    color: '#f59e0b'
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
          <a href="#features">Features</a>
          <a href="#solutions">Solutions</a>
          <a href="#how-it-works">Process</a>
          <button onClick={() => navigate('/community')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'color 0.3s' }}>Community</button>
          <button onClick={() => navigate('/pricing')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'color 0.3s' }}>Pricing</button>
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

      {/* Features Grid Section */}
      <section id="features" className="features-grid-section">
        <div className="section-header">
          <span className="section-tag">Neural Ecosystem</span>
          <h2 className="section-title">The Apex of AI Capabilities</h2>
          <p className="section-subtitle">Six specialized engines designed to transcend traditional limits and redefine what is possible.</p>
        </div>

        <div className="features-grid-container">
          {functionalities.map((feature, idx) => (
            <motion.div 
              key={idx}
              className="feature-card glass"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="card-glow" style={{ background: `radial-gradient(circle at center, ${feature.color}15 0%, transparent 70%)` }}></div>
              <div className="feature-icon-box" style={{ color: feature.color }}>
                <feature.icon size={32} />
              </div>
              <div className="feature-status-tag">{feature.status}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
              <button className="feature-link" onClick={() => navigate('/chat')}>
                Initialize Engine <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="features-section">
        <div className="section-header">
          <span className="section-tag">Elite Architect</span>
          <h2 className="section-title">Superior Cognitive Architectures</h2>
          <p className="section-subtitle">Deep-dive into our specialized frameworks for high-stakes execution.</p>
        </div>

        <div className="showcase-grid">
           <motion.div 
             className="showcase-item glass"
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
           >
              <div className="showcase-info">
                <h3>Neural Image Forge Pro</h3>
                <p>Synthesize high-fidelity visual assets with our proprietary diffusion framework. 8K resolution, dynamic lighting, and infinite stylistic depth.</p>
                <ul className="feature-list-simple">
                   <li><CheckCircle2 size={16} /> Ultra-HD Cinematic Output</li>
                   <li><CheckCircle2 size={16} /> Stylistic Consistency Engine</li>
                   <li><CheckCircle2 size={16} /> Real-time Neural Inference</li>
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
                <p>Transform chaotic datasets into actionable executive summaries. Our RAG-powered analyzer deciphers context, intent, and complex patterns with total precision.</p>
                <ul className="feature-list-simple">
                   <li><CheckCircle2 size={16} /> Instant Ontological Summarization</li>
                   <li><CheckCircle2 size={16} /> Multi-Document Cognitive Mapping</li>
                   <li><CheckCircle2 size={16} /> Professional PDF Synthesis</li>
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
           <span className="section-tag">Strategic Workflow</span>
           <h2 className="section-title">Three Phases of Intelligence</h2>
        </div>
        <div className="steps-container">
           <div className="step-card glass">
              <div className="step-num">01</div>
              <h4>Initialize Matrix</h4>
              <p>Define your core vision or upload complex datasets for neural ingestion.</p>
           </div>
           <div className="step-card glass">
              <div className="step-num">02</div>
              <h4>Neural Refinement</h4>
              <p>Our distributed engines synthesize and optimize every parameter of your request.</p>
           </div>
           <div className="step-card glass">
              <div className="step-num">03</div>
              <h4>Execute Deployment</h4>
              <p>Receive professional-grade, actionable results in hyper-accelerated timelines.</p>
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
              <a onClick={() => navigate('/pricing')} style={{ cursor: 'pointer' }}>Pricing</a>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Security</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 AI CAPRA Technologies. Intelligence Redefined.</p>
        </div>
      </footer>
    </div>
  );
}
