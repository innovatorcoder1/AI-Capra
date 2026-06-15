import React, { useState, useEffect } from 'react';
import { Video, Settings, Download, Expand, Wand2, X, Trash2, AlertCircle, Sparkles, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../config/AuthContext';
import './MediaGeneration.css';

export default function VideoGeneration() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('OpenAI Sora');
  const [cameraMotion, setCameraMotion] = useState('Pan Left to Right');
  const [duration, setDuration] = useState('4 Seconds');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null); // For modal
  const [error, setError] = useState(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai_capra_video_history');
    if (saved) {
      try {
        setGeneratedVideos(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('ai_capra_video_history', JSON.stringify(generatedVideos));
  }, [generatedVideos]);

  const parseResponse = (data) => {
    try {
      const target = Array.isArray(data) ? data[0] : data;
      if (!target) return null;

      // Handle the structure described by the user (n8n binary object pattern)
      // data: "base64...", mimeType: "video/mp4", etc.
      if (target.data && typeof target.data === 'string' && target.data.length > 100) {
        const mimeType = target.mimeType || target.mime_type || 'video/mp4';
        if (target.data.startsWith('data:')) return target.data;
        return `data:${mimeType};base64,${target.data}`;
      }

      // Existing checks
      if (target.url) return target.url;
      if (target.video_url) return target.video_url;
      if (target.avatar_vidoe_url) return target.avatar_vidoe_url;
      if (target.avatar_video_url) return target.avatar_video_url;
      if (target.output?.[0]?.url) return target.output[0].url;
      
      if (target.base64) {
        if (target.base64.startsWith('data:')) return target.base64;
        return `data:video/mp4;base64,${target.base64}`;
      }

      // If it's a direct URL string
      if (typeof data === 'string' && data.startsWith('http')) return data;

      // If it's a raw base64 string
      if (typeof data === 'string' && data.length > 1000) {
        if (data.startsWith('data:')) return data;
        return `data:video/mp4;base64,${data}`;
      }
      
      // Deep search for anything that looks like a URL or base64 data
      const findVideo = (obj) => {
        if (!obj || typeof obj !== 'object') return null;
        
        // Priority fields for URLs or base64 data
        const priorityFields = ['url', 'video_url', 'avatar_vidoe_url', 'avatar_video_url', 'data', 'base64', 'content'];
        for (const field of priorityFields) {
          if (obj[field] && typeof obj[field] === 'string') {
            if (obj[field].startsWith('http') || obj[field].startsWith('data:video')) {
              return obj[field];
            }
            if (field === 'data' && obj[field].length > 1000) {
              const mimeType = obj.mimeType || obj.mime_type || 'video/mp4';
              return `data:${mimeType};base64,${obj[field]}`;
            }
            if (field === 'base64' && obj[field].length > 1000) {
              return `data:video/mp4;base64,${obj[field]}`;
            }
          }
        }
        for (let key in obj) {
          if (typeof obj[key] === 'object') {
            const found = findVideo(obj[key]);
            if (found) return found;
          }
        }
        return null;
      };

      return findVideo(data) || null;
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
      const response = await fetch('https://n8n.srv1196219.hstgr.cloud/webhook/video-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          cameraMotion: cameraMotion,
          duration: duration,
          aspect_ratio: aspectRatio,
          model: model,
          email: user?.email || '',
          industry: user?.industry || 'other',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Generation failed: ${errorText || response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      let videoUrl = null;

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        videoUrl = parseResponse(data);
      } else if (contentType && contentType.includes('video/')) {
        // Direct binary response
        const blob = await response.blob();
        videoUrl = URL.createObjectURL(blob);
      } else {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          videoUrl = parseResponse(data);
        } catch (e) {
          if (text.startsWith('http') || text.startsWith('data:video')) {
            videoUrl = text;
          } else if (text.length > 1000) {
            videoUrl = `data:video/mp4;base64,${text}`;
          }
        }
      }

      if (videoUrl) {
        const newVideo = {
          id: Date.now(),
          url: videoUrl,
          prompt: prompt,
          model: model,
          cameraMotion: cameraMotion,
          duration: duration,
          aspectRatio: aspectRatio,
          timestamp: new Date().toISOString()
        };
        setGeneratedVideos([newVideo, ...generatedVideos]);
      } else {
        throw new Error('No video URL returned from AI');
      }
    } catch (err) {
      console.error('Error generating video:', err);
      setError('Failed to generate video. Please check your connection or try a different prompt.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadVideo = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename || 'generated-video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const deleteVideo = (id) => {
    setGeneratedVideos(generatedVideos.filter(vid => vid.id !== id));
  };

  return (
    <div className="media-gen-container">
      {/* Control Panel */}
      <div className="control-panel">
        <div className="control-header">
          <Sparkles size={24} color="#3b82f6" />
          <h3>Video Studio</h3>
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
                <option value="OpenAI Sora">OpenAI Sora</option>
              </optgroup>
              <optgroup label="Google">
                <option value="Google Veo">Google Veo</option>
                <option value="Gemini 1.5 Pro Video">Gemini 1.5 Pro Video</option>
              </optgroup>
            </select>
          </div>

          <div className="control-section">
            <label>Video Prompt</label>
            <textarea 
              className="prompt-textarea glass" 
              placeholder="A cinematic shot of a cyberpunk city at night, neon lights reflecting on wet streets, 4k, 60fps..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>
          </div>

          <div className="control-section">
            <label>Camera Motion</label>
            <select 
              className="control-select glass"
              value={cameraMotion}
              onChange={(e) => setCameraMotion(e.target.value)}
            >
              <option>Pan Left to Right</option>
              <option>Zoom In Slowly</option>
              <option>Drone Shot</option>
              <option>Static (No Motion)</option>
            </select>
          </div>

          <div className="control-section">
            <label>Aspect Ratio</label>
            <select 
              className="control-select glass"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
            >
              <option value="16:9">16:9 (Landscape)</option>
              <option value="9:16">9:16 (Portrait)</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="4:3">4:3 (Classic)</option>
            </select>
          </div>
          
          <div className="control-section">
            <label>Duration</label>
            <select 
              className="control-select glass"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option>2 Seconds</option>
              <option>4 Seconds</option>
              <option>8 Seconds (Pro)</option>
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
          className="generate-btn" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)' }}
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? (
            <>
              <div className="spinner" style={{ width: '20px', height: '20px', borderColor: '#fff', borderTopColor: 'transparent' }}></div>
              Rendering Video...
            </>
          ) : (
            <>
              <Wand2 size={20} />
              Generate Video
            </>
          )}
        </button>
      </div>

      {/* Preview Area */}
      <div className="preview-area">
        <div className="preview-header">
          <h2>Director's Cut</h2>
          <div className="gallery-stats" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            {generatedVideos.length} videos generated
          </div>
        </div>

        {generatedVideos.length === 0 && !isLoading ? (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <Video size={48} color="rgba(59, 130, 246, 0.2)" />
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Start Directing</h3>
              <p>Your AI-generated cinematic shots will appear here.</p>
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
                  style={{ aspectRatio: aspectRatio.replace(':', '/') }}
                >
                  <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
                  <p style={{ color: '#3b82f6', fontWeight: 600 }}>Rendering Frames...</p>
                </motion.div>
              )}

              {generatedVideos.map((vid) => (
                <motion.div 
                  key={vid.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="preview-card"
                  style={{ aspectRatio: vid.aspectRatio?.replace(':', '/') || '16/9' }}
                >
                  <video src={vid.url} className="preview-image" autoPlay loop muted playsInline />
                  
                  <div className="preview-overlay">
                    <div className="overlay-content">
                      <div className="image-meta">
                        <span className="meta-prompt">{vid.prompt}</span>
                        <span className="meta-details">{vid.model === 'sora' ? 'OpenAI Sora' : vid.model === 'veo' ? 'Google Veo' : vid.model === 'gemini-1.5-pro' ? 'Gemini 1.5 Pro Video' : vid.model || 'OpenAI Sora'} • {vid.cameraMotion} • {vid.duration} • {vid.aspectRatio || '16:9'}</span>
                      </div>
                      <div className="action-group">
                        <button 
                          className="icon-btn" 
                          onClick={() => downloadVideo(vid.url, `ai-capra-video-${vid.id}.mp4`)}
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          className="icon-btn" 
                          onClick={() => setSelectedVideo(vid)}
                          title="Expand"
                        >
                          <Expand size={16} />
                        </button>
                        <button 
                          className="icon-btn" 
                          style={{ background: 'rgba(239, 68, 68, 0.2)' }}
                          onClick={() => deleteVideo(vid.id)}
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

      {/* Expanded Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="image-modal-overlay"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content"
              onClick={e => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedVideo(null)}>
                <X size={32} />
              </button>
              <video src={selectedVideo.url} className="modal-image" controls autoPlay />
              <div className="modal-footer" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px' }}>
                <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{selectedVideo.prompt}</p>
                <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                  <span>Model: {selectedVideo.model === 'sora' ? 'OpenAI Sora' : selectedVideo.model === 'veo' ? 'Google Veo' : selectedVideo.model === 'gemini-1.5-pro' ? 'Gemini 1.5 Pro Video' : selectedVideo.model || 'OpenAI Sora'}</span>
                  <span>Motion: {selectedVideo.cameraMotion}</span>
                  <span>Duration: {selectedVideo.duration}</span>
                  <span>Ratio: {selectedVideo.aspectRatio || '16:9'}</span>
                  <span>Created: {new Date(selectedVideo.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
