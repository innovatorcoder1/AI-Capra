import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Building2, HelpCircle, ChevronDown, ArrowRight, ShieldCheck, Cpu, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../config/AuthContext';
import AuthModal from '../components/auth/AuthModal';
import ParticleField from '../components/ui/ParticleField';
import './Pricing.css';

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    desc: 'Basic neural access for individuals.',
    features: [
      'Access to GPT-4o Mini',
      '5 Document Analyses / mo',
      'Standard Image Generation',
      'Community Support',
      'Mobile App Access'
    ],
    icon: Cpu,
    color: '#94a3b8'
  },
  {
    name: 'Pro',
    price: { monthly: 29, yearly: 240 },
    desc: 'Advanced tools for creative professionals.',
    features: [
      'GPT-4o & Claude 3.5 Sonnet',
      '50 Document Analyses / mo',
      '4K Neural Image Forge',
      'Priority Queue Access',
      'Advanced API Access'
    ],
    icon: Zap,
    color: '#3b82f6',
    popular: true
  },
  {
    name: 'Ultimate',
    price: { monthly: 89, yearly: 720 },
    desc: 'Absolute cognitive dominance for power users.',
    features: [
      'GPT-5 (Preview Access)',
      'Unlimited Document Intel',
      '8K Cinematic Synthesis',
      'Private Compute Instances',
      '24/7 VIP Concierge'
    ],
    icon: Crown,
    color: 'var(--gold)',
    highlight: true
  },
  {
    name: 'Custom',
    price: { monthly: 'Custom', yearly: 'Custom' },
    desc: 'Enterprise-grade neural architectures.',
    features: [
      'Bespoke Model Fine-tuning',
      'Dedicated GPU Clusters',
      'Custom Security Protocols',
      'On-premise Deployment',
      'SLA & Success Manager'
    ],
    icon: Building2,
    color: '#a855f7'
  }
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLaunch = () => {
    if (user) {
      navigate('/chat');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const faqs = [
    { q: 'Can I switch plans anytime?', a: 'Yes, you can upgrade or downgrade your plan at any moment. Changes take effect immediately.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and crypto payments (BTC, ETH, SOL).' },
    { q: 'Is there a limit on image generation?', a: 'Free and Pro have soft limits, while Ultimate offers truly unlimited generation.' },
    { q: 'How secure is my data?', a: 'We use enterprise-grade AES-256 encryption and offer private compute for Ultimate users.' }
  ];

  return (
    <div className="pricing-page-wrapper">
      <ParticleField />
      
      <nav className="simple-nav glass">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to Home
        </button>
        <div className="nav-brand">
          <img src="/logo.png" alt="Logo" />
          <span>AI CAPRA</span>
        </div>
        <button className="btn-primary" onClick={handleLaunch}>
          Launch Intelligence
        </button>
      </nav>

      <div className="pricing-container">
      {/* Hero */}
      <section className="pricing-hero">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hero-content"
        >
          <div className="section-tag">Neural Economics</div>
          <h1>Cognitive Plans for <span className="gold-text">Every Ambition</span></h1>
          <p className="hero-subtitle">Transparent pricing for the world's most advanced AI ecosystem.</p>

          <div className="billing-toggle glass">
            <span className={!isYearly ? 'active' : ''}>Monthly</span>
            <button 
              className={`toggle-btn ${isYearly ? 'yearly' : ''}`}
              onClick={() => setIsYearly(!isYearly)}
            >
              <div className="toggle-handle"></div>
            </button>
            <span className={isYearly ? 'active' : ''}>Yearly <span className="discount-badge">Save 30%</span></span>
          </div>
        </motion.div>
      </section>

      {/* Plans Grid */}
      <div className="plans-grid">
        {plans.map((plan, idx) => (
          <motion.div 
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`plan-card glass ${plan.popular ? 'popular' : ''} ${plan.highlight ? 'ultimate' : ''}`}
          >
            {plan.popular && <div className="popular-tag">Most Popular</div>}
            
            <div className="plan-header">
              <div className="plan-icon-box" style={{ color: plan.color, backgroundColor: `${plan.color}15` }}>
                <plan.icon size={28} />
              </div>
              <h3>{plan.name}</h3>
              <p>{plan.desc}</p>
            </div>

            <div className="plan-price">
              {typeof plan.price.monthly === 'number' ? (
                <>
                  <span className="currency">$</span>
                  <span className="amount">{isYearly ? Math.floor(plan.price.yearly / 12) : plan.price.monthly}</span>
                  <span className="period">/mo</span>
                </>
              ) : (
                <span className="amount-text">{plan.price.monthly}</span>
              )}
            </div>

            <div className="plan-features">
              {plan.features.map((feature, i) => (
                <div key={i} className="feature-item">
                  <Check size={16} className="check-icon" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button 
              className={`plan-btn ${plan.highlight ? 'btn-gold' : 'btn-glass'}`}
              onClick={handleLaunch}
            >
              {plan.name === 'Custom' ? 'Contact Sales' : 'Select Plan'}
              <ArrowRight size={18} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Feature Matrix Preview */}
      <section className="matrix-preview glass">
        <div className="matrix-content">
          <div className="matrix-text">
            <h2>Compare Architectures</h2>
            <p>Deep-dive into the technical specifications of each neural tier.</p>
          </div>
          <button className="matrix-btn">View Detailed Matrix <ChevronDown size={18} /></button>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className="faq-grid">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className={`faq-item glass ${expandedFaq === i ? 'expanded' : ''}`}
              onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
            >
              <div className="faq-q">
                <span>{faq.q}</span>
                <ChevronDown size={18} className="faq-icon" />
              </div>
              <div className="faq-a">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security Banner */}
      <div className="security-banner glass">
        <ShieldCheck size={24} color="var(--gold)" />
        <span>Enterprise-grade security. AES-256 encryption. SOC2 Type II Compliant.</span>
      </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
