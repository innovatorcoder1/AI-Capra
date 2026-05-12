import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, Loader2, AlertCircle, Sparkles, Copy, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import './Documents.css';

export default function AnalyzeDocuments() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setReport(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('data', file);
    formData.append('fileName', file.name);

    try {
      const response = await fetch('https://n8n.srv1196219.hstgr.cloud/webhook/Analyze-documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Analysis failed. Please check your connection.');

      const data = await response.json();
      
      // Handle the nested response structure common in n8n
      let summaryText = '';
      if (Array.isArray(data)) {
        summaryText = data[0]?.output || data[0]?.text || data[0]?.message || JSON.stringify(data[0]);
      } else {
        summaryText = data.output || data.text || data.message || JSON.stringify(data);
      }

      setReport(summaryText);
    } catch (err) {
      console.error('Analysis Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (report) {
      navigator.clipboard.writeText(report);
      // Optional: Add toast notification
    }
  };

  return (
    <div className="docs-container">
      <div className="analysis-layout">
        
        {/* Upload Zone */}
        <div className="upload-zone-wrapper">
          <div className="prompt-controls">
            <span className="section-tag">Document Intelligence</span>
            <h1 className="section-title">Analyze Documents</h1>
            <p className="section-subtitle">Extract deep insights and summaries from your complex files in seconds.</p>

            <div className={`upload-zone glass ${file ? 'has-file' : ''}`} onClick={() => fileInputRef.current.click()}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                accept=".pdf,.docx,.txt"
              />
              <div className="upload-zone-inner aurora-border">
                <UploadCloud size={48} className={`upload-icon ${isLoading ? 'animate-bounce' : ''}`} />
                {file ? (
                  <div className="selected-file-info">
                    <FileText size={24} color="var(--gold-accent)" />
                    <h3>{file.name}</h3>
                    <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <h3>Drag & Drop your document here</h3>
                    <p>Supports PDF, DOCX, TXT. Max 50MB.</p>
                  </>
                )}
                
                <button className="btn-browse" onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}>
                  {file ? 'Change File' : 'Browse Files'}
                </button>
              </div>
            </div>

            <button 
              className="generate-btn" 
              onClick={handleUpload}
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Neural Processing...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Start AI Analysis
                </>
              )}
            </button>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="error-box glass"
              >
                <AlertCircle size={18} color="#ef4444" />
                <span>{error}</span>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Results Area */}
        <div className="results-zone glass">
           <div className="results-header">
             <div className="header-info">
               <FileText size={20} color="var(--accent-primary)" />
               <h3>Analysis Results</h3>
             </div>
             {report && (
               <div className="header-actions">
                 <button className="action-btn" onClick={handleCopy} title="Copy Summary">
                   <Copy size={18} />
                 </button>
                 <button className="action-btn" title="Download PDF">
                   <Download size={18} />
                 </button>
               </div>
             )}
           </div>
           
           <div className="paper-container">
             <AnimatePresence mode="wait">
               {isLoading ? (
                 <motion.div 
                   key="loading"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="loader-container"
                 >
                   <div className="spinner"></div>
                   <p className="animate-pulse-subtle">Deciphering context and semantics...</p>
                 </motion.div>
               ) : report ? (
                 <motion.div 
                   key="report"
                   initial={{ opacity: 0, y: 20, rotate: -1 }}
                   animate={{ opacity: 1, y: 0, rotate: 0 }}
                   className="paper-report"
                 >
                   <div className="paper-header">
                     <div className="paper-meta">
                       <span className="meta-tag">AI Summary</span>
                       <span className="paper-date">{new Date().toLocaleDateString()}</span>
                     </div>
                     <span className="gen-time">Analysis Complete</span>
                   </div>
                   
                   <div className="text-body">
                     <ReactMarkdown>
                       {report}
                     </ReactMarkdown>
                   </div>

                   <div className="paper-footer">
                     <div className="footer-line"></div>
                     <p>Generated by AI Capra Semantic Intelligence Engine v2.4.0-Stable</p>
                   </div>
                 </motion.div>
               ) : (
                 <motion.div 
                   key="placeholder"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="placeholder-content"
                 >
                   <div className="placeholder-icon-box glass">
                     <FileText size={48} />
                   </div>
                   <h3>Ready for Intelligence</h3>
                   <p>Upload a document to begin the deep analysis process.</p>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>

      </div>
    </div>
  );
}
