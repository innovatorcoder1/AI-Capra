import React, { useState } from 'react';
import { NavLink } from 'react-router';
import {
  MessageSquare, Image, Video, FileText, FileEdit,
  Briefcase, Brain, BookOpen, Plus, History, X, Menu
} from 'lucide-react';
import { motion } from 'framer-motion';
import './Sidebar.css';

const navCategories = [
  {
    title: 'CHAT',
    items: [
      { icon: MessageSquare, label: 'AI Chat', path: '/chat' },
      { icon: MessageSquare, label: 'Chat Arena', path: '/chat-arena' }
    ]
  },
  {
    title: 'IMAGE & VIDEO',
    items: [
      { icon: Image, label: 'Image Generation', path: '/image-generation' },
      { icon: Video, label: 'Video Generation', path: '/video-generation', badge: 'New' }
    ]
  },
  {
    title: 'DOCUMENTS',
    items: [
      { icon: FileText, label: 'Analyze Documents', path: '/analyze-documents' },
      { icon: FileEdit, label: 'Generate Documents', path: '/generate-documents' }
    ]
  },
  {
    title: 'CAREER',
    items: [
      { icon: Briefcase, label: 'Career Development', path: '/career-development' },
      { icon: Brain, label: 'Psychological Counseling', path: '/psychological-counseling' }
    ]
  },
  {
    title: 'LIBRARY',
    items: [
      { icon: BookOpen, label: 'Digital Library', path: '/library' }
    ]
  }
];

export default function Sidebar({ onClose, isCollapsed, onToggle, onOpenHistory }) {
  return (
    <>
      <aside className={`sidebar glass ${isCollapsed ? 'collapsed' : ''}`}>
        <button className="mobile-close-btn" onClick={onClose}>
          <X size={24} color="#fff" />
        </button>

        <div className="sidebar-header">
          <div className="sidebar-top-row">
            <button className="toggle-btn hide-mobile" onClick={onToggle}>
              <Menu size={20} />
            </button>
            <div className="logo-container">
              <img src="/logo.png" alt="AI Capra Logo" style={{ height: '40px', filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.3))' }} />
              {!isCollapsed && (
                <div className="logo-text-container">
                  <h1 className="logo-text text-gradient animate-shimmer" style={{ marginTop: '4px' }}>AI CAPRA</h1>
                  <span className="logo-subtitle">INTELLIGENCE REDEFINED</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav text-muted">
          {navCategories.map((cat, idx) => (
            <div key={idx} className="nav-group">
              <div className="nav-group-title" style={{ color: 'var(--accent-primary)' }}>
                {isCollapsed ? '' : cat.title}
              </div>
              {cat.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="active-indicator"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <item.icon size={18} className="nav-icon" />
                      {!isCollapsed && <span className="nav-label">{item.label}</span>}
                      {item.badge && !isCollapsed && <span className="nav-badge" style={{ color: '#000' }}>{item.badge}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-new-chat">
            <Plus size={18} /> {!isCollapsed && 'New Chat'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-history"
            onClick={onOpenHistory}
          >
            <History size={18} /> {!isCollapsed && 'History'}
          </motion.button>
        </div>
      </aside>
    </>
  );
}
