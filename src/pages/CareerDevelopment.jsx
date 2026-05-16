import React, { useState, useRef } from 'react';
import { Briefcase, Target, Award, TrendingUp, UploadCloud, Loader2, AlertCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Career.css';

export default function CareerDevelopment() {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const parseResponse = (data) => {
    try {
      if (!data) return '';
      if (typeof data === 'string') return data;

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

    try {
      const response = await fetch('https://n8n.srv1196219.hstgr.cloud/webhook/Resume-Aanlyzer', {
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
              <div className="analysis-content" style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <div className="markdown-body" style={{ color: '#e2e8f0', lineHeight: '1.7' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {analysisResult}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
