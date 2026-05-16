import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Settings, Download, Expand, Wand2, X, Trash2, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './MediaGeneration.css';

const ratios = [
  { label: '1:1', desc: 'Square', value: '1:1' },
  { label: '16:9', desc: 'Landscape', value: '16:9' },
  { label: '9:16', desc: 'Portrait', value: '9:16' },
  { label: '4:3', desc: 'Classic', value: '4:3' }
];

const qualities = [
  { label: 'Standard (Fast)', value: 'standard' },
  { label: 'High (Detailed)', value: 'high' },
  { label: 'Ultra (4K)', value: 'ultra' }
];

export default function ImageGeneration() {
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [quality, setQuality] = useState('standard');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('dall-e-3');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // For modal
  const [error, setError] = useState(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai_capra_image_history');
    if (saved) {
      try {
        setGeneratedImages(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('ai_capra_image_history', JSON.stringify(generatedImages));
  }, [generatedImages]);

  const parseResponse = (data) => {
    try {
      // If data is an array (common in n8n)
      const target = Array.isArray(data) ? data[0] : data;
      
      if (!target) return null;

      // Handle the structure described by the user (n8n binary object pattern)
      // data: "base64...", mimeType: "image/png", etc.
      if (target.data && typeof target.data === 'string' && target.data.length > 100) {
        const mimeType = target.mimeType || target.mime_type || 'image/png';
        if (target.data.startsWith('data:')) return target.data;
        return `data:${mimeType};base64,${target.data}`;
      }

      // Existing checks
      if (target.url) return target.url;
      if (target.image_url) return target.image_url;
      if (target.avatar_url) return target.avatar_url;
      if (target.output?.[0]?.url) return target.output[0].url;
      if (target.base64) {
        if (target.base64.startsWith('data:')) return target.base64;
        return `data:image/png;base64,${target.base64}`;
      }
      
      // If it's a direct URL string
      if (typeof data === 'string' && data.startsWith('http')) return data;
      
      // If it's a raw base64 string
      if (typeof data === 'string' && data.length > 1000) {
        if (data.startsWith('data:')) return data;
        return `data:image/png;base64,${data}`;
      }

      // Deep search for anything that looks like a URL or large base64
      const findImage = (obj) => {
        if (!obj || typeof obj !== 'object') return null;
        
        // Priority fields
        const priorityFields = ['url', 'image_url', 'avatar_url', 'data', 'base64', 'content'];
        for (const field of priorityFields) {
          if (obj[field] && typeof obj[field] === 'string') {
            if (obj[field].startsWith('http') || obj[field].startsWith('data:image')) return obj[field];
            if (obj[field].length > 1000) return `data:image/png;base64,${obj[field]}`;
          }
        }

        for (let key in obj) {
          if (typeof obj[key] === 'object') {
            const found = findImage(obj[key]);
            if (found) return found;
          }
        }
        return null;
      };

      return findImage(data) || null;
    } catch (e) {
      console.error('Parsing error:', e);
      return null;
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://n8n.srv1196219.hstgr.cloud/webhook/Image-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          aspect_ratio: selectedRatio,
          quality: quality,
          model: model,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Generation failed: ${errorText || response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      let imageUrl = null;

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        imageUrl = parseResponse(data);
      } else if (contentType && contentType.includes('image/')) {
        // If it's a direct binary image response
        const blob = await response.blob();
        imageUrl = URL.createObjectURL(blob);
      } else {
        // Fallback for unexpected content types
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          imageUrl = parseResponse(data);
        } catch (e) {
          // If not JSON, maybe it's raw base64 or something else
          if (text.length > 100) {
            imageUrl = text.startsWith('data:') ? text : `data:image/png;base64,${text}`;
          }
        }
      }

      if (imageUrl) {
        const newImage = {
          id: Date.now(),
          url: imageUrl,
          prompt: prompt,
          model: model,
          ratio: selectedRatio,
          quality: quality,
          timestamp: new Date().toISOString()
        };
        setGeneratedImages([newImage, ...generatedImages]);
      } else {
        throw new Error('No image URL returned from AI');
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError('Failed to generate image. Please check your connection or try a different prompt.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename || 'generated-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const deleteImage = (id) => {
    setGeneratedImages(generatedImages.filter(img => img.id !== id));
  };

  return (
    <div className="media-gen-container">
      {/* Control Panel */}
      <div className="control-panel">
        <div className="control-header">
          <Sparkles size={24} color="#fbbf24" />
          <h3>Image Forge</h3>
        </div>

        <div className="control-scroll-area">
          <div className="control-section">
            <label>AI Model</label>
            <select 
              className="control-select glass"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <optgroup label="OpenAI">
                <option value="dall-e-3">DALL-E 3</option>
                <option value="dall-e-2">DALL-E 2</option>
              </optgroup>
              <optgroup label="Google">
                <option value="imagen-3">Imagen 3</option>
              </optgroup>
            </select>
          </div>

          <div className="control-section">
            <label>Prompt Description</label>
            <textarea 
              className="prompt-textarea glass" 
              placeholder="Describe what you want to see... (e.g., A cyberpunk samurai in a rain-slicked neon street, 8k resolution)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>
          </div>

          <div className="control-section">
            <label>Aspect Ratio</label>
            <div className="ratio-grid">
              {ratios.map(r => (
                <button 
                  key={r.label}
                  className={`ratio-btn ${selectedRatio === r.value ? 'active' : ''}`}
                  onClick={() => setSelectedRatio(r.value)}
                >
                  <span className="ratio-label">{r.label}</span>
                  <span className="ratio-desc">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="control-section">
            <label>Generation Quality</label>
            <select 
              className="control-select glass"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            >
              {qualities.map(q => (
                <option key={q.value} value={q.value}>{q.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0 1.5rem', marginBottom: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: '#ef4444', fontSize: '0.8rem', display: 'flex', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px' }}
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          </div>
        )}

        <button 
          className="generate-btn"
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? (
            <>
              <div className="spinner" style={{ width: '20px', height: '20px', borderColor: '#000', borderTopColor: 'transparent' }}></div>
              Forging Image...
            </>
          ) : (
            <>
              <Wand2 size={20} />
              Generate Magic
            </>
          )}
        </button>
      </div>

      {/* Preview Area */}
      <div className="preview-area">
        <div className="preview-header">
          <h2>Vision Gallery</h2>
          <div className="gallery-stats" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            {generatedImages.length} images generated
          </div>
        </div>

        {generatedImages.length === 0 && !isLoading ? (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <ImageIcon size={48} color="rgba(251, 191, 36, 0.2)" />
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Start Creating</h3>
              <p>Your AI-generated masterpieces will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="preview-grid">
            <AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="preview-card loading-card shimmer"
                  style={{ '--card-aspect': selectedRatio === '16:9' ? '16/9' : selectedRatio === '9:16' ? '9/16' : selectedRatio === '4:3' ? '4/3' : '1' }}
                >
                  <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
                  <p style={{ color: '#fbbf24', fontWeight: 600 }}>Casting Pixel Magic...</p>
                </motion.div>
              )}

              {generatedImages.map((img) => (
                <motion.div 
                  key={img.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="preview-card"
                  style={{ '--card-aspect': img.ratio === '16:9' ? '16/9' : img.ratio === '9:16' ? '9/16' : img.ratio === '4:3' ? '4/3' : '1' }}
                >
                  <img src={img.url} alt={img.prompt} className="preview-image" loading="lazy" />
                  
                  <div className="preview-overlay">
                    <div className="overlay-content">
                      <div className="image-meta">
                        <span className="meta-prompt">{img.prompt}</span>
                        <span className="meta-details">{img.model === 'dall-e-3' ? 'DALL-E 3' : img.model === 'dall-e-2' ? 'DALL-E 2' : img.model === 'imagen-3' ? 'Imagen 3' : img.model || 'DALL-E 3'} • {img.ratio} • {img.quality}</span>
                      </div>
                      <div className="action-group">
                        <button 
                          className="icon-btn" 
                          onClick={() => downloadImage(img.url, `ai-capra-${img.id}.png`)}
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          className="icon-btn" 
                          onClick={() => setSelectedImage(img)}
                          title="Expand"
                        >
                          <Expand size={16} />
                        </button>
                        <button 
                          className="icon-btn" 
                          style={{ background: 'rgba(239, 68, 68, 0.2)' }}
                          onClick={() => deleteImage(img.id)}
                          title="Delete"
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Expanded Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="image-modal-overlay"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content"
              onClick={e => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedImage(null)}>
                <X size={32} />
              </button>
              <img src={selectedImage.url} alt={selectedImage.prompt} className="modal-image" />
              <div className="modal-footer" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px' }}>
                <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{selectedImage.prompt}</p>
                <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                  <span>Model: {selectedImage.model === 'dall-e-3' ? 'DALL-E 3' : selectedImage.model === 'dall-e-2' ? 'DALL-E 2' : selectedImage.model === 'imagen-3' ? 'Imagen 3' : selectedImage.model || 'DALL-E 3'}</span>
                  <span>Ratio: {selectedImage.ratio}</span>
                  <span>Quality: {selectedImage.quality}</span>
                  <span>Created: {new Date(selectedImage.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
