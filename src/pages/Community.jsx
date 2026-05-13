import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, Image, Cpu, Shield, Globe, Search, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import './Community.css';

const communities = [
  {
    id: 'prompt-architects',
    name: 'Prompt Architects',
    desc: 'Master the art of neural communication. Optimize GPT-4o, Claude 3.5, and Gemini Pro with elite prompting strategies.',
    icon: MessageSquare,
    members: '12.4K',
    active: 842,
    category: 'Engineering',
    color: '#00a67e',
    tags: ['LLMs', 'Prompting', 'Optimization']
  },
  {
    id: 'visual-synthesis',
    name: 'Visual Synthesis Hub',
    desc: 'For the digital alchemists. Share and discover cutting-edge workflows for Midjourney v6, Stable Diffusion, and Image Forge.',
    icon: Image,
    members: '45.2K',
    active: 2105,
    category: 'Creative',
    color: 'var(--gold)',
    tags: ['Gen-Art', 'Diffusion', 'Styles']
  },
  {
    id: 'neural-devs',
    name: 'Neural Developers',
    desc: 'Building the next generation of AI apps. Discuss RAG architectures, fine-tuning, and the AI Capra API ecosystem.',
    icon: Cpu,
    members: '8.9K',
    active: 320,
    category: 'Development',
    color: '#3b82f6',
    tags: ['API', 'RAG', 'Fullstack']
  },
  {
    id: 'agi-researchers',
    name: 'AGI Research Circle',
    desc: 'Deep tech discussions on the path to AGI. Analyzing latest papers, safety protocols, and emergent behaviors.',
    icon: Globe,
    members: '5.6K',
    active: 112,
    category: 'Research',
    color: '#a855f7',
    tags: ['Deep Learning', 'Safety', 'Papers']
  },
  {
    id: 'ethics-governance',
    name: 'Ethics & Governance',
    desc: 'Shaping the future of responsible AI. Discussions on policy, regulation, and the societal impact of automation.',
    icon: Shield,
    members: '3.1K',
    active: 45,
    category: 'Policy',
    color: '#ef4444',
    tags: ['Compliance', 'Social Impact', 'Policy']
  }
];

export default function Community() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [joinedCommunities, setJoinedCommunities] = useState([]);

  const categories = ['All', 'Engineering', 'Creative', 'Development', 'Research', 'Policy'];

  const filteredCommunities = communities.filter(c => {
    const matchesTab = activeTab === 'All' || c.category === activeTab;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const toggleJoin = (id) => {
    if (joinedCommunities.includes(id)) {
      setJoinedCommunities(joinedCommunities.filter(cId => cId !== id));
    } else {
      setJoinedCommunities([...joinedCommunities, id]);
    }
  };

  return (
    <div className="community-container">
      {/* Hero Section */}
      <section className="community-hero">
        <div className="hero-glow"></div>
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="section-tag">AI Ecosystem</div>
          <h1 className="hero-title">Neural Hub <span className="gold-text">Communities</span></h1>
          <p className="hero-subtitle">
            Connect with the world's leading AI experts, researchers, and creators. 
            Collaborate across specialized hubs and accelerate your intelligence.
          </p>
        </motion.div>
      </section>

      {/* Control Bar */}
      <div className="community-controls glass">
        <div className="search-box glass">
          <Search size={18} color="#64748b" />
          <input 
            type="text" 
            placeholder="Search communities..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="category-tabs">
          {categories.map(cat => (
            <button 
              key={cat}
              className={`tab-btn ${activeTab === cat ? 'active' : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="community-grid">
        <AnimatePresence mode="popLayout">
          {filteredCommunities.map((comm, idx) => (
            <motion.div 
              key={comm.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="community-card glass"
            >
              <div className="card-accent" style={{ backgroundColor: comm.color }}></div>
              
              <div className="card-header">
                <div className="icon-box" style={{ color: comm.color, backgroundColor: `${comm.color}15` }}>
                  <comm.icon size={24} />
                </div>
                <div className="stats">
                  <span className="stat-item"><Users size={14} /> {comm.members}</span>
                  <span className="stat-item active"><CircleDot size={8} /> {comm.active} Online</span>
                </div>
              </div>

              <div className="card-body">
                <h3>{comm.name}</h3>
                <p>{comm.desc}</p>
                
                <div className="tag-cloud">
                  {comm.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
                </div>
              </div>

              <div className="card-footer">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`join-btn ${joinedCommunities.includes(comm.id) ? 'joined' : ''}`}
                  onClick={() => toggleJoin(comm.id)}
                >
                  {joinedCommunities.includes(comm.id) ? (
                    <><CheckCircle2 size={18} /> Joined</>
                  ) : (
                    <>Join Community <ArrowRight size={16} /></>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Featured Section */}
      <motion.section 
        className="featured-community glass"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="featured-content">
          <div className="featured-badge"><Zap size={14} /> Global Event</div>
          <h2>AI CAPRA Developer Summit 2026</h2>
          <p>Join the largest gathering of neural architects and researchers. Exclusive workshops on RAG and model fine-tuning.</p>
          <button className="btn-primary" disabled style={{ opacity: 0.7, cursor: 'not-allowed' }}>Coming Soon</button>
        </div>
        <div className="featured-visual">
          <div className="pulsing-brain">
            <Cpu size={80} color="var(--gold)" />
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function CircleDot({ size, ...props }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
