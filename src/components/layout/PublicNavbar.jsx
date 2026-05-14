import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import './PublicNavbar.css';

export default function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (id) => {
    if (location.pathname === '/') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${id}`);
    }
  };

  return (
    <nav className="public-navbar glass">
      <div className="nav-brand" onClick={() => navigate('/')}>
        <img src="/logo.png" alt="AI CAPRA" className="nav-logo" />
        <span className="brand-name">AI CAPRA</span>
      </div>
      
      <div className="nav-links">
        <button onClick={() => handleNavClick('features')}>Features</button>
        <button onClick={() => handleNavClick('solutions')}>Solutions</button>
        <button onClick={() => handleNavClick('how-it-works')}>Process</button>
        <button onClick={() => navigate('/community')} className={location.pathname === '/community' ? 'active' : ''}>Community</button>
        <button onClick={() => navigate('/pricing')} className={location.pathname === '/pricing' ? 'active' : ''}>Pricing</button>
        <button onClick={() => handleNavClick('roadmap')}>Future</button>
      </div>

      <button className="btn-primary nav-cta" onClick={() => navigate('/chat')}>
        Launch Intelligence
      </button>
    </nav>
  );
}
