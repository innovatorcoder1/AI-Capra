import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Code, GraduationCap, Search, HeartPulse, Briefcase } from 'lucide-react';
import { useAuth } from '../../config/AuthContext';
import './IndustryModal.css';

const industries = [
  { id: 'developer', label: 'Developer', icon: Code, desc: 'Software engineering, AI, and architecture' },
  { id: 'student', label: 'Student', icon: GraduationCap, desc: 'Learning, research, and academia' },
  { id: 'doctor', label: 'Doctor', icon: HeartPulse, desc: 'Healthcare, medical practice, and research' },
  { id: 'researcher', label: 'Researcher', icon: Search, desc: 'Data analysis, science, and exploration' },
  { id: 'other', label: 'Other', icon: Briefcase, desc: 'Business, creative, or other fields' },
];

export default function IndustryModal() {
  const { user, loginWithWebhook } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in and hasn't selected an industry
    if (user && !user.industry) {
      // Check local storage explicitly just in case
      const localUserStr = localStorage.getItem('ai_capra_user');
      if (localUserStr) {
        try {
          const localUser = JSON.parse(localUserStr);
          if (!localUser.industry) {
            setIsOpen(true);
          }
        } catch (e) {}
      } else {
        // Fallback if not in localstorage but in session
        setIsOpen(true);
      }
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedIndustry) return;

    setLoading(true);
    
    // Update local storage and context
    const localUserStr = localStorage.getItem('ai_capra_user');
    let updatedUser = { ...user, industry: selectedIndustry };
    
    if (localUserStr) {
      try {
        updatedUser = { ...JSON.parse(localUserStr), industry: selectedIndustry };
      } catch (e) {}
    }
    
    // Simulate a brief loading state for UX
    setTimeout(() => {
      loginWithWebhook(updatedUser);
      setIsOpen(false);
      setLoading(false);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="industry-overlay">
      <motion.div 
        className="industry-modal glass"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
      >
        <div className="industry-header">
          <h2>Welcome to AI Capra</h2>
          <p>Please select your primary industry to help us personalize your neural experience.</p>
        </div>

        <form onSubmit={handleSubmit} className="industry-form">
          <div className="industry-grid">
            {industries.map((ind) => {
              const Icon = ind.icon;
              return (
                <div 
                  key={ind.id} 
                  className={`industry-card ${selectedIndustry === ind.id ? 'selected' : ''}`}
                  onClick={() => setSelectedIndustry(ind.id)}
                >
                  <Icon className="industry-icon" size={24} />
                  <h3>{ind.label}</h3>
                  <p>{ind.desc}</p>
                </div>
              );
            })}
          </div>

          <button 
            type="submit" 
            className="btn-primary industry-submit" 
            disabled={!selectedIndustry || loading}
          >
            {loading ? (
              <span className="animate-pulse">Personalizing...</span>
            ) : (
              <>
                Continue to Dashboard
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
