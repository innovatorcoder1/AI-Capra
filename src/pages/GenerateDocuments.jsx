import React, { useState } from 'react';
import { FileEdit, Wand2, CheckCircle2, AlertCircle, Copy, Download, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Documents.css';

export default function GenerateDocuments() {
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState('Professional');
  const [format, setFormat] = useState('Email');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [status, setStatus] = useState('idle'); // idle, success, error
  const [isExpanded, setIsExpanded] = useState(false);

  const parseResponse = (data) => {
    try {
      if (Array.isArray(data) && data[0]?.output && Array.isArray(data[0].output)) {
        const output = data[0].output[0];
        if (output?.content && Array.isArray(output.content)) {
          const content = output.content.find(c => c.type === 'output_text' || c.text);
          if (content?.text) return content.text;
        }
      }
      if (typeof data === 'string') return data;
      if (data.text) return data.text;
      if (data.content) return data.content;
      if (data.message) return data.message;
      return JSON.stringify(data, null, 2);
    } catch (e) {
      console.error('Parsing error:', e);
      return typeof data === 'string' ? data : JSON.stringify(data);
    }
  };

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setIsLoading(true);
    setStatus('idle');
    setGeneratedDoc('');

    try {
      const response = await fetch('https://n8n.srv1196219.hstgr.cloud/webhook/document-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'document description': description,
          'document tone': tone,
          'Document formation': format,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate document');

      const data = await response.json();
      const content = parseResponse(data);
      
      setGeneratedDoc(content);
      setStatus('success');
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDoc);
  };

  return (
    <div className="docs-container">
      <div className="generation-layout">
        
        {/* Input Section */}
        <div className="prompt-zone-wrapper">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="prompt-controls"
          >
            <div>
              <h1 className="section-title gold-text">AI Document Architect</h1>
              <p className="section-subtitle">Transform your ideas into professional documents in seconds.</p>
            </div>
            
            <div className="input-group">
              <label className="input-label">What should we write?</label>
              <textarea 
                className="prompt-textarea glass" 
                style={{ minHeight: '220px' }}
                placeholder="Example: A formal resignation letter for a Senior Developer role, focusing on career growth and gratitude..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="tone-selector">
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Tone & Voice</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    className="control-select glass"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                  >
                    <option>Professional</option>
                    <option>Casual</option>
                    <option>Academic</option>
                    <option>Persuasive</option>
                    <option>Empathetic</option>
                    <option>Executive</option>
                  </select>
                </div>
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Structure</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    className="control-select glass"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <option>Email</option>
                    <option>Official Report</option>
                    <option>Blog Post</option>
                    <option>Project Proposal</option>
                    <option>Meeting Minutes</option>
                    <option>Press Release</option>
                  </select>
                </div>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`generate-btn ${isLoading ? 'animate-pulse-subtle' : ''}`}
              onClick={handleGenerate}
              disabled={isLoading || !description.trim()}
            >
              {isLoading ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                  Architecting...
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  Generate Document
                </>
              )}
            </motion.button>

            {status === 'error' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
              >
                <AlertCircle size={16} />
                Failed to generate. Please try again.
              </motion.div>
            )}
          </motion.div>
        </div>
        
        {/* Preview Section */}
        <div className="results-zone">
          <div className="results-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileEdit size={20} />
              <h3>Live Document Canvas</h3>
            </div>
            
            {generatedDoc && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <motion.button 
                  whileHover={{ scale: 1.1 }} 
                  className="glass" 
                  style={{ padding: '0.5rem', color: 'var(--gold-accent)' }}
                  onClick={() => setIsExpanded(true)}
                  title="Expand to Full Screen"
                >
                  <Maximize2 size={18} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }} 
                  className="glass" 
                  style={{ padding: '0.5rem', color: 'var(--gold-accent)' }}
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                >
                  <Copy size={18} />
                </motion.button>
              </div>
            )}
          </div>
          
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="loader-container"
              >
                <div className="spinner"></div>
                <p className="gold-text" style={{ fontWeight: 600 }}>AI is weaving your document...</p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className={`paper-report ${isLoading ? 'loading' : ''}`}>
            {generatedDoc ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="document-content"
              >
                <div className="paper-header">
                  <div className="paper-meta">
                    <span className="meta-tag">{tone}</span>
                    <span className="meta-tag">{format}</span>
                  </div>
                  <div className="paper-date">{new Date().toLocaleDateString()}</div>
                </div>
                
                <div className="text-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {generatedDoc}
                  </ReactMarkdown>
                </div>
                
                <div className="paper-footer">
                  <div className="footer-line"></div>
                  <p>Generated by AI Capra Assistant</p>
                </div>
              </motion.div>
            ) : (
              <div className="placeholder-content">
                <div style={{ opacity: 0.1 }}>
                  <FileEdit size={120} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Your Canvas Awaits</h3>
                  <p style={{ maxWidth: '300px' }}>Enter details on the left to generate your professional document.</p>
                </div>
              </div>
            )}
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
                  <FileEdit size={24} color="var(--gold-accent)" />
                  <h2 className="gold-text">Document Full View</h2>
                </div>
                <div className="header-actions">
                  <button onClick={copyToClipboard} className="action-btn glass" title="Copy Text">
                    <Copy size={18} />
                  </button>
                  <button onClick={() => setIsExpanded(false)} className="action-btn close glass">
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="expanded-content">
                <div className="paper-report expanded-paper">
                   <div className="document-content">
                    <div className="paper-header">
                      <div className="paper-meta">
                        <span className="meta-tag">{tone}</span>
                        <span className="meta-tag">{format}</span>
                      </div>
                      <div className="paper-date">{new Date().toLocaleDateString()}</div>
                    </div>
                    
                    <div className="text-body large">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {generatedDoc}
                      </ReactMarkdown>
                    </div>
                    
                    <div className="paper-footer">
                      <div className="footer-line"></div>
                      <p>Generated by AI Capra Assistant • {new Date().toLocaleTimeString()}</p>
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


