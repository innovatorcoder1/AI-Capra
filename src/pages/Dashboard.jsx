import React from 'react';
import { Sparkles, MessageSquare, Image, FileText, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import './Dashboard.css';

const quickStartCards = [
  {
    icon: MessageSquare,
    title: 'AI Chat',
    description: 'Start a conversation with advanced AI models including GPT-4, Claude, and Gemini',
    gradient: 'hover-cyan'
  },
  {
    icon: Image,
    title: 'Image Generation',
    description: 'Create stunning images from text descriptions using state-of-the-art AI models',
    gradient: 'hover-purple'
  },
  {
    icon: FileText,
    title: 'Document Analysis',
    description: 'Upload and analyze documents with AI-powered insights and summaries',
    gradient: 'hover-green'
  }
];

const trendingTools = [
  { name: 'Chat Arena', users: '12.5K', color: '#00c972' },
  { name: 'Video Gen', users: '8.3K', color: '#a855f7' },
  { name: 'Career Coach', users: '6.7K', color: '#15a7e0' },
  { name: 'Canva Pro', users: 'f59e0b' }
];

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      {/* Background Orbs */}
      <div className="orb orb-green"></div>
      <div className="orb orb-purple"></div>
      <div className="orb orb-blue"></div>

      <div className="dashboard-content">
        
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-badge">
            <Sparkles size={16} color="var(--accent-primary)" />
            <span>Pakistan's #1 AI Platform</span>
          </div>
          
          <h1 className="hero-title">Welcome To AI Capra</h1>
          <p className="hero-subtitle">
            bringing every AI tool under one roof.
          </p>

          <div className="stats-container">
            <div className="stat-box">
              <div className="stat-number stat-green">50K+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-box">
              <div className="stat-number stat-purple">1M+</div>
              <div className="stat-label">AI Generations</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-box">
              <div className="stat-number stat-blue">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section className="dashboard-section">
          <div className="section-header">
            <Zap size={24} color="var(--accent-primary)" />
            <h2>Quick Start</h2>
          </div>
          <p className="section-subtitle">Choose your AI tool and start creating</p>

          <div className="quick-start-grid">
            {quickStartCards.map((card, idx) => (
              <motion.button 
                key={idx} 
                whileHover={{ scale: 1.02, y: -5 }} 
                className={`qs-card glass ${card.gradient}`}
              >
                <div className="qs-glow"></div>
                <div className="qs-icon-box">
                  <card.icon size={24} color="#fff" />
                </div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Trending Tools */}
        <section className="dashboard-section">
          <div className="section-header">
            <TrendingUp size={24} color="var(--accent-primary)" />
            <h2>Trending Tools</h2>
          </div>
          
          <div className="trending-grid">
            {trendingTools.map((tool, idx) => (
              <motion.div key={idx} whileHover={{ scale: 1.02 }} className="trending-card glass cursor-pointer">
                <div className="trending-header">
                  <div className="trending-color" style={{ backgroundColor: tool.color || '#f59e0b' }}></div>
                  <span className="trending-users">{tool.users} users</span>
                </div>
                <div className="trending-name">{tool.name}</div>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* CTA */}
        <section className="cta-section">
           <h2>Ready to Get Started?</h2>
           <p>Join thousands of users leveraging AI to boost productivity and creativity</p>
           <motion.button whileHover={{ scale: 1.05 }} className="btn-cta">Start Creating Now</motion.button>
        </section>

      </div>
    </div>
  );
}
