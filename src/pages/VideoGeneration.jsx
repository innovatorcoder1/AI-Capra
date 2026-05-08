import React, { useState } from 'react';
import { Video, Settings, Download, Expand, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import './MediaGeneration.css';

export default function VideoGeneration() {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="media-gen-container">
      {/* Control Panel */}
      <div className="control-panel glass">
        <div className="control-header">
          <Video size={20} color="var(--accent-blue)" />
          <h3>Video Generation</h3>
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
          <select className="control-select glass">
            <option>Pan Left to Right</option>
            <option>Zoom In Slowly</option>
            <option>Drone Shot</option>
            <option>Static (No Motion)</option>
          </select>
        </div>
        
        <div className="control-section">
          <label>Duration</label>
          <select className="control-select glass">
            <option>2 Seconds</option>
            <option>4 Seconds</option>
            <option>8 Seconds (Pro)</option>
          </select>
        </div>

        <motion.button whileHover={{ scale: 1.02 }} className="generate-btn accent-blue animate-pulse-subtle">
          <Wand2 size={18} />
          Generate Video
        </motion.button>
      </div>

      {/* Preview Area */}
      <div className="preview-area">
        <div className="preview-grid flex-col">
          {/* Mock Generated Video */}
          <div className="preview-card glass" style={{aspectRatio: '16/9'}}>
            <div className="preview-image-placeholder">
               <Video size={48} color="rgba(255,255,255,0.1)" />
            </div>
            <div className="preview-overlay">
              <button className="icon-btn"><Download size={18} /></button>
              <button className="icon-btn"><Expand size={18} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
