import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Shield, Zap, Coins, Calendar, ChevronRight, Settings, ExternalLink } from 'lucide-react';
import { useAuth } from '../../config/AuthContext';
import './ProfileModal.css';

export default function ProfileModal({ isOpen, onClose }) {
  const { user } = useAuth();

  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || '?';
    return name.charAt(0).toUpperCase();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="profile-modal-overlay" onClick={onClose}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="profile-modal glass"
            onClick={e => e.stopPropagation()}
          >
            <div className="profile-header">
              <div className="avatar-section">
                <div className="profile-avatar-large">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" />
                  ) : (
                    <span className="avatar-initials">{getInitials()}</span>
                  )}
                  <div className="status-indicator"></div>
                </div>
                <div className="profile-title">
                  <h2>{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</h2>
                  <span className="user-role">
                    Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'May 2026'}
                  </span>
                </div>
              </div>
              <div className="header-actions">
                <div className="plan-badge-floating">
                  <Zap size={14} style={{ stroke: 'currentColor' }} />
                  <span>Pro Plan</span>
                </div>
                <button className="profile-close-btn" onClick={onClose} aria-label="Close profile modal">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="profile-content">
              <div className="profile-section">
                <h3 className="section-label">Account Information</h3>
                <div className="info-grid">
                  <div className="info-card glass">
                    <div className="info-icon">
                      <Mail size={18} />
                    </div>
                    <div className="info-details">
                      <label>Email Address</label>
                      <span title={user?.email}>{user?.email || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="info-card glass">
                    <div className="info-icon">
                      <Shield size={18} />
                    </div>
                    <div className="info-details">
                      <label>Account Security</label>
                      <span>Two-Factor Enabled</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h3 className="section-label">Subscription & Usage</h3>
                <div className="usage-grid">
                  <div className="usage-card glass">
                    <div className="usage-header">
                      <div className="usage-icon-box">
                        <Zap size={20} style={{ stroke: 'var(--accent-primary)' }} />
                      </div>
                      <div className="usage-title">
                        <h4>Current Plan</h4>
                        <p>Pro Neural Tier</p>
                      </div>
                      <button className="upgrade-link">
                        Manage <ExternalLink size={14} />
                      </button>
                    </div>
                    <div className="usage-stats">
                      <div className="stat-row">
                        <span>Monthly Progress</span>
                        <span>75%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '75%' }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="progress-bar-fill"
                        ></motion.div>
                      </div>
                    </div>
                  </div>

                  <div className="usage-card glass">
                    <div className="usage-header">
                      <div className="usage-icon-box">
                        <Coins size={20} style={{ stroke: 'var(--gold-accent)' }} />
                      </div>
                      <div className="usage-title">
                        <h4>Neural Credits</h4>
                        <p>Available Balance</p>
                      </div>
                      <span className="credit-count">1,250</span>
                    </div>
                    <button className="topup-btn">Top Up Credits</button>
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <button className="action-link glass">
                  <Settings size={18} />
                  <span>Account Settings</span>
                  <ChevronRight size={16} />
                </button>
                <button className="action-link glass">
                  <Calendar size={18} />
                  <span>Billing History</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
