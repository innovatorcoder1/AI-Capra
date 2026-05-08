import { useState, useEffect } from 'react';
import { 
  Shield, Zap, CircleDot, ChevronRight, Sparkles, 
  FileText, MessageSquare, Cpu, Globe, Users, 
  ArrowRight, CheckCircle2, Github, Twitter, Linkedin
} from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import './App.css';

const stats = [
  { label: 'Active Users', value: '50K+' },
  { label: 'AI Operations', value: '100M+' },
  { label: 'Accuracy Rate', value: '99.9%' },
  { label: 'Global Servers', value: '24/7' }
];

const features = [
  {
    title: 'Image Forge',
    tag: 'Creativity',
    desc: 'Generate stunning, photorealistic images from simple text prompts using our custom neural engines.',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000',
    points: ['4K Ultra Resolution', 'Custom Aspect Ratios', 'Style Transfer Technology']
  },
  {
    title: 'Document Architect',
    tag: 'Productivity',
    desc: 'Transform raw data and messy notes into professional, structured documents in seconds.',
    img: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=1000',
    points: ['Tone & Voice Control', 'Multi-format Support', 'Semantic Analysis']
  }
];

function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="app-container">
      <motion.div className="progress-bar" style={{ scaleX }} />

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <img src="/logo.png" alt="AI CAPRA" className="nav-logo" />
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>AI CAPRA</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it Works</a>
          <a href="#solutions">Solutions</a>
          <a href="#about">About</a>
        </div>
        <button className="btn-primary" onClick={() => window.location.href = '/dashboard'}>
          Launch App
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow"></div>
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
          >
            <img src="/logo.png" alt="AI Capra emblem" className="hero-logo" />
          </motion.div>
          
          <h1 className="hero-title">
            The Future of Intelligence <br />
            <span className="gold-text">Defined by AI CAPRA</span>
          </h1>
          
          <p className="hero-subtitle">
            Experience a new era of artificial intelligence. Built on an indestructible 
            framework of speed, security, and absolute precision. 
          </p>

          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => window.location.href = '/dashboard'}>
              Get Started Free <ChevronRight size={18} />
            </button>
            <button className="btn-secondary">View Documentation</button>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="stat-card"
            >
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="showcase-section">
        <div className="section-header">
          <span className="section-tag">Capabilities</span>
          <h2 className="section-title">Beyond Artificial Intelligence</h2>
        </div>

        {features.map((feature, i) => (
          <div key={i} className={`showcase-grid ${i % 2 !== 0 ? 'reverse' : ''}`} style={{ marginBottom: '10rem' }}>
            <motion.div 
              initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="showcase-content"
            >
              <span className="section-tag" style={{ color: '#64748b' }}>{feature.tag}</span>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
              <ul className="feature-list">
                {feature.points.map((point, j) => (
                  <li key={j}><CheckCircle2 size={18} color="var(--gold-accent)" /> {point}</li>
                ))}
              </ul>
              <button className="btn-secondary" style={{ marginTop: '2rem' }}>
                Learn More <ArrowRight size={18} />
              </button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="showcase-visual"
            >
              <img src={feature.img} alt={feature.title} className="showcase-img" />
            </motion.div>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div 
          className="cta-box"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Sparkles className="cta-icon" size={48} color="var(--gold-accent)" style={{ marginBottom: '2rem' }} />
          <h2>Ready to Evolve?</h2>
          <p className="hero-subtitle" style={{ margin: '0 auto 3rem' }}>
            Join 50,000+ pioneers building the future with AI CAPRA. 
            No credit card required. Cancel anytime.
          </p>
          <button className="btn-primary" style={{ padding: '1.25rem 3rem', fontSize: '1.1rem' }}>
            Initialize Your Account Now
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-info">
            <div className="nav-brand">
              <img src="/logo.png" alt="AI CAPRA" className="nav-logo" />
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>AI CAPRA</span>
            </div>
            <p>
              Leading the frontier of secure, high-performance artificial intelligence 
              for the next generation of digital pioneers.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <Twitter size={20} color="#64748b" />
              <Github size={20} color="#64748b" />
              <Linkedin size={20} color="#64748b" />
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Platform</h4>
            <div className="footer-links">
              <a href="#">Intelligence Engine</a>
              <a href="#">Security Protocols</a>
              <a href="#">API Reference</a>
              <a href="#">System Status</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Solutions</h4>
            <div className="footer-links">
              <a href="#">For Enterprises</a>
              <a href="#">Creative Studios</a>
              <a href="#">Data Analytics</a>
              <a href="#">Cybersecurity</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <div className="footer-links">
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; 2024 AI CAPRA Technologies. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <span>Built with Precision</span>
            <span>Version 2.4.0-Stable</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
