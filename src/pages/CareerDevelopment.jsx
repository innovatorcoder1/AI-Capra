import React, { useState, useRef } from 'react';
import { Briefcase, Target, Award, TrendingUp, UploadCloud, Loader2, AlertCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../config/AuthContext';
import './Career.css';

export default function CareerDevelopment() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const parseResponse = (data) => {
    try {
      if (!data) return '';
      
      if (Array.isArray(data) && data.length > 0 && data[0]['Full Name']) {
        return data[0];
      }
      if (data && typeof data === 'object' && data['Full Name']) {
        return data;
      }
      
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]['Full Name']) {
            return parsed[0];
          }
          if (parsed && typeof parsed === 'object' && parsed['Full Name']) {
            return parsed;
          }
        } catch(e) {}
        return data;
      }

      const findText = (obj) => {
        if (!obj || typeof obj !== 'object') return null;
        if (typeof obj.output === 'string') return obj.output;
        if (typeof obj.text === 'string') return obj.text;
        if (typeof obj.message === 'string') return obj.message;
        if (typeof obj.content === 'string') return obj.content;

        if (Array.isArray(obj.output)) {
          for (const item of obj.output) {
            const found = findText(item);
            if (found) return found;
          }
        }

        if (Array.isArray(obj)) {
          for (const item of obj) {
            const found = findText(item);
            if (found) return found;
          }
        } else {
          for (const key in obj) {
            if (['metadata', 'settings', 'config'].includes(key)) continue;
            const found = findText(obj[key]);
            if (found) return found;
          }
        }
        return null;
      };

      const result = findText(data);
      return result || JSON.stringify(data, null, 2);
    } catch (err) {
      console.error('Parsing error:', err);
      return typeof data === 'string' ? data : JSON.stringify(data);
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysisResult(null);
      setError(null);
      await analyzeResume(selectedFile);
    }
  };

  const analyzeResume = async (selectedFile) => {
    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('data', selectedFile);
    formData.append('email', user?.email || '');
    formData.append('industry', user?.industry || 'other');

    try {
      const response = await fetch('https://n8n.srv1196219.hstgr.cloud/webhook/upload-cv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Resume analysis failed. Please try again.');

      const data = await response.json();
      const resultText = parseResponse(data);
      setAnalysisResult(resultText);
    } catch (err) {
      console.error('Analysis Error:', err);
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderAnalysisResult = (data) => {
    if (!data) return null;

    if (typeof data === 'string') {
      return (
        <div className="markdown-body" style={{ color: '#e2e8f0', lineHeight: '1.7' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {data}
          </ReactMarkdown>
        </div>
      );
    }

    const parseJSONField = (field) => {
      if (!field) return [];
      try {
        return typeof field === 'string' ? JSON.parse(field) : field;
      } catch (e) {
        return [];
      }
    };

    const experience = parseJSONField(data.Experience);
    const education = parseJSONField(data.Education);
    const projects = parseJSONField(data.Projects);

    return (
      <div className="resume-structured-content" style={{ color: '#e2e8f0' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--gold-accent)', margin: '0 0 0.5rem 0' }}>{data['Full Name'] || 'N/A'}</h1>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', margin: '0 0 1rem 0', fontWeight: '500' }}>{data['Job Title'] || ''}</h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.9rem', color: '#94a3b8' }}>
            {data.Email && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>✉️ {data.Email}</span>}
            {data.Phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>📱 {data.Phone}</span>}
            {data.Location && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>📍 {data.Location}</span>}
            {data.LinkedIn && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>🔗 {data.LinkedIn}</span>}
            {data.GitHub && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>💻 {data.GitHub}</span>}
            {data.Portfolio && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>🌐 {data.Portfolio}</span>}
          </div>
        </div>

        {/* Summary */}
        {data.Summary && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--accent-blue)', marginBottom: '0.5rem', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.25rem' }}>Professional Summary</h4>
            <p style={{ lineHeight: '1.6', fontSize: '0.95rem', margin: 0 }}>{data.Summary}</p>
          </div>
        )}

        {/* Skills */}
        {data.Skills && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--accent-blue)', marginBottom: '0.5rem', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.25rem' }}>Skills</h4>
            <p style={{ lineHeight: '1.6', fontSize: '0.95rem', margin: 0 }}>{data.Skills}</p>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--accent-blue)', marginBottom: '1rem', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.25rem' }}>Experience</h4>
            {experience.map((exp, idx) => (
              <div key={idx} style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{exp.job_title}</strong>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{exp.start_date} - {exp.end_date}</span>
                </div>
                <div style={{ color: 'var(--gold-accent)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{exp.company} {exp.location ? `- ${exp.location}` : ''}</div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, color: '#cbd5e1' }}>
                  {exp.responsibilities && exp.responsibilities.map((resp, i) => (
                    <li key={i} style={{ marginBottom: '0.25rem' }}>{resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--accent-blue)', marginBottom: '1rem', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.25rem' }}>Education</h4>
            {education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{edu.degree} {edu.field ? `in ${edu.field}` : ''}</strong>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{edu.start_date} - {edu.end_date}</span>
                </div>
                <div style={{ color: 'var(--gold-accent)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{edu.institution} {edu.location ? `- ${edu.location}` : ''}</div>
                {edu.details && <p style={{ fontSize: '0.9rem', margin: 0, color: '#cbd5e1', lineHeight: '1.5' }}>{edu.details}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--accent-blue)', marginBottom: '1rem', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.25rem' }}>Projects</h4>
            {projects.map((proj, idx) => (
              <div key={idx} style={{ marginBottom: '0.75rem' }}>
                <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{proj.title}</strong>
                <p style={{ fontSize: '0.9rem', margin: '0.25rem 0 0 0', lineHeight: '1.5', color: '#cbd5e1' }}>{proj.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Other Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {data.Certifications && (
            <div>
              <h4 style={{ color: 'var(--accent-blue)', marginBottom: '0.5rem', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.25rem' }}>Certifications</h4>
              <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: '1.5', color: '#cbd5e1' }}>{data.Certifications}</p>
            </div>
          )}
          {data.Languages && (
            <div>
              <h4 style={{ color: 'var(--accent-blue)', marginBottom: '0.5rem', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.25rem' }}>Languages</h4>
              <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: '1.5', color: '#cbd5e1' }}>{data.Languages}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

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
           
           <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleFileChange} 
             style={{ display: 'none' }} 
             accept=".pdf,.docx,.txt"
           />
           
           <button 
             className="career-btn" 
             onClick={() => fileInputRef.current?.click()}
             disabled={isAnalyzing}
             style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
           >
             {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
             {isAnalyzing ? 'Analyzing...' : 'Upload Resume'}
           </button>
        </div>
      </div>

      {/* Resume Analyzer Result Section */}
      <AnimatePresence>
        {(isAnalyzing || analysisResult || error) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="resume-analysis-section glass"
            style={{ marginTop: '3rem', padding: '2rem', borderRadius: '24px' }}
          >
            <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <FileText size={28} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Resume Optimization Results</h2>
            </div>
            
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {isAnalyzing && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 0' }}>
                <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
                <p style={{ color: 'var(--text-muted)' }}>AI is analyzing your resume and extracting keywords...</p>
              </div>
            )}

            {analysisResult && !isAnalyzing && (
              <div className="analysis-content" style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                {renderAnalysisResult(analysisResult)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
