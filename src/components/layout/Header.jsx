import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router';
import { Coins, Settings, User, Bell, Menu, Shield, Moon, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Header.css';

export default function Header({ onMenuClick }) {
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const settingsItems = [
    { icon: User, label: 'My Profile', desc: 'Manage your personal info' },
    { icon: Shield, label: 'Security', desc: 'Password and protection' },
    { icon: Moon, label: 'Appearance', desc: 'Dark mode and themes' },
    { icon: LogOut, label: 'Sign Out', desc: 'Log out of your account', danger: true },
  ];

  return (
    <header className="header glass">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={24} color="#fff" />
        </button>
        <NavLink to="/" className="header-brand">
          <img src="/logo.png" alt="AI Capra Logo" style={{ height: '36px', filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.3))' }} />
          <span className="header-title animate-shimmer text-gradient">AI CAPRA</span>
        </NavLink>

        <nav className="header-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
          <a href="#blog" style={{ color: 'var(--text-muted)' }}>Blog</a>
          <a href="#pricing" style={{ color: 'var(--text-muted)' }}>Pricing</a>
        </nav>
      </div>

      <div className="header-right">
        <div className="credits-badge hide-mobile">
          <Coins size={16} color="var(--accent-primary)" />
          <span>1,250</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="icon-btn hide-mobile"
        >
          <Bell size={20} />
          <span className="notification-dot"></span>
        </motion.button>

        <div className="settings-container" ref={settingsRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`icon-btn hide-mobile ${showSettings ? 'active' : ''}`}
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={20} />
          </motion.button>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="settings-dropdown glass"
              >
                <div className="dropdown-header">
                  <span className="dropdown-title">Settings</span>
                  <span className="dropdown-subtitle">Quick preferences</span>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-items">
                  {settingsItems.map((item, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      className={`dropdown-item ${item.danger ? 'danger' : ''}`}
                    >
                      <div className="item-icon-bg">
                        <item.icon size={16} />
                      </div>
                      <div className="item-content">
                        <span className="item-label">{item.label}</span>
                        <span className="item-desc">{item.desc}</span>
                      </div>
                      <ChevronRight size={14} className="item-arrow" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="avatar-btn"
        >
          <User size={20} color="#000" />
        </motion.button>
      </div>
    </header>
  );
}
