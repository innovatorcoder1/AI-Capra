import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import './Documents.css';

export default function AnalyzeDocuments() {
  const [file, setFile] = useState(null);
  
  return (
    <div className="docs-container">
      <div className="analysis-layout">
        
        {/* Upload Zone */}
        <div className="upload-zone-wrapper">
          <div className="upload-zone glass">
            <div className="upload-zone-inner aurora-border">
              <UploadCloud size={64} className="upload-icon" />
              <h3>Drag & Drop your document here</h3>
              <p>Supports PDF, DOCX, TXT. Max 50MB.</p>
              
              <button className="btn-browse">
                Browse Files
              </button>
            </div>
          </div>
        </div>
        
        {/* Results Area */}
        <div className="results-zone glass">
           <div className="results-header">
             <FileText size={20} color="var(--accent-primary)" />
             <h3>Analysis Results</h3>
           </div>
           
           <div className="paper-report">
             <div className="paper-header">
               <h2>Document Summary</h2>
               <span>Generated in 1.2s</span>
             </div>
             
             <p>This is a placeholder for the extracted markdown report. The document appears to contain information regarding financial statements for Q3 2026.</p>
             
             <h3>Key Insights</h3>
             <ul>
               <li>Revenue increased by 14% YoY.</li>
               <li>Operating expenses decreased due to AI automation.</li>
               <li>Net profit margin stands at 22%.</li>
             </ul>
           </div>
        </div>

      </div>
    </div>
  );
}
