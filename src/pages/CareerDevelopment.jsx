import React from 'react';
import { Briefcase, Target, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import './Career.css';

export default function CareerDevelopment() {
  return (
    <div className="career-container">
      <div className="career-header">
        <Briefcase size={32} color="var(--accent-blue)" />
        <h1>Career Hub</h1>
        <p>AI-driven insights for your professional growth.</p>
      </div>

      <div className="career-grid">
        <div className="career-card glass">
           <div className="card-icon-3d bg-blue">
             <Target size={24} color="#fff" />
           </div>
           <h3>Skill Benchmarking</h3>
           <p>Compare your current skills with industry standards.</p>
           
           <div className="progress-section">
             <div className="progress-item">
               <div className="progress-labels">
                 <span>React / Frontend</span>
                 <span>85%</span>
               </div>
               <div className="progress-bar-bg">
                 <div className="progress-bar-fill" style={{ width: '85%', backgroundColor: 'var(--accent-blue)' }}></div>
               </div>
             </div>
             <div className="progress-item">
               <div className="progress-labels">
                 <span>System Design</span>
                 <span>60%</span>
               </div>
               <div className="progress-bar-bg">
                 <div className="progress-bar-fill" style={{ width: '60%', backgroundColor: 'var(--accent-blue)' }}></div>
               </div>
             </div>
           </div>
        </div>

        <div className="career-card glass">
           <div className="card-icon-3d bg-green">
             <TrendingUp size={24} color="#fff" />
           </div>
           <h3>Career Path Prediction</h3>
           <p>Discover potential career trajectories based on your profile.</p>
           <button className="career-btn">Analyze Profile</button>
        </div>

        <div className="career-card glass">
           <div className="card-icon-3d bg-gold">
             <Award size={24} color="#fff" />
           </div>
           <h3>Resume Optimization</h3>
           <p>AI will format and enhance your resume keywords.</p>
           <button className="career-btn">Upload Resume</button>
        </div>
      </div>
    </div>
  );
}
