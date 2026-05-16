import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, Loader2, AlertCircle, Sparkles, Copy, Download, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2pdf from 'html2pdf.js';
import './Documents.css';

export default function AnalyzeDocuments() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef(null);
  const reportRef = useRef(null);
  const expandedReportRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setReport(null);
      setError(null);
    }
  };

  const parseResponse = (data) => {
    try {
      if (!data) return '';

      // If it's already a string, return it
      if (typeof data === 'string') return data;

      // Handle common n8n/AI nested structures
      const findText = (obj) => {
        if (!obj || typeof obj !== 'object') return null;

        // Priority fields
        if (typeof obj.output === 'string') return obj.output;
        if (typeof obj.text === 'string') return obj.text;
        if (typeof obj.message === 'string') return obj.message;
        if (typeof obj.content === 'string') return obj.content;

        // If output is an array (common in some n8n nodes)
        if (Array.isArray(obj.output)) {
          for (const item of obj.output) {
            const found = findText(item);
            if (found) return found;
          }
        }

        // Recursive search for other fields
        if (Array.isArray(obj)) {
          for (const item of obj) {
            const found = findText(item);
            if (found) return found;
          }
        } else {
          for (const key in obj) {
            // Avoid metadata or large objects that aren't likely to be the main text
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

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('data', file);

    // Extract document type for backend flow separation
    const fileType = file.name.split('.').pop().toLowerCase();
    const webhookUrl = `https://n8n.srv1196219.hstgr.cloud/webhook/Analyze-documents?fileType=${fileType}`;

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Analysis failed. Please check your connection.');

      const data = await response.json();
      const summaryText = parseResponse(data);

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
    }
  };

  const handleDownload = () => {
    if (!report) return;

    // Choose the ref based on whether we are in expanded mode or not
    const element = isExpanded ? expandedReportRef.current : reportRef.current;
    if (!element) return;

    const opt = {
      margin: [15, 15],
      filename: `analysis-${file?.name?.split('.')[0] || 'summary'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
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
                    <p>Supports PDF, DOCX, TXT. Max 20MB.</p>
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
            </div>
            {report && (
              <div className="header-actions">
                <button className="action-btn" onClick={() => setIsExpanded(true)} title="Expand to Full Screen">
                  <Maximize2 size={18} />
                </button>
                <button className="action-btn" onClick={handleCopy} title="Copy Summary">
                  <Copy size={18} />
                </button>
                <button className="action-btn" onClick={handleDownload} title="Download Results">
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
                  ref={reportRef}
                  initial={{ opacity: 0, y: 20, rotate: -1 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  className="paper-report"
                >
                  <div className="text-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {report}
                    </ReactMarkdown>
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

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="expanded-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="expanded-card glass"
            >
              <div className="expanded-header">
                <div className="header-left">
                  <FileText size={24} color="var(--gold-accent)" />
                </div>
                <div className="header-actions">
                  <button onClick={handleCopy} className="action-btn glass" title="Copy Text">
                    <Copy size={18} />
                  </button>
                  <button onClick={handleDownload} className="action-btn glass" title="Download Results">
                    <Download size={18} />
                  </button>
                  <button onClick={() => setIsExpanded(false)} className="action-btn close glass">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="expanded-content">
                <div className="paper-report expanded-paper" ref={expandedReportRef}>
                  <div className="document-content">

                    <div className="text-body large">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {report}
                      </ReactMarkdown>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
