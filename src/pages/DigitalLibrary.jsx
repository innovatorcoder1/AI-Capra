import React, { useState } from 'react';
import { BookOpen, Search, Play, Clock, User, ArrowLeft, Download, CheckCircle, Award, Sparkles, Filter, FileText, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './DigitalLibrary.css';

const LECTURES = [
  {
    id: 1,
    title: "Understanding Neural Networks & Transformer Architectures",
    category: "Artificial Intelligence",
    duration: "52 mins",
    author: "Dr. Elena Rostova, AI Research Lead",
    description: "Delve deep into self-attention mechanisms, query-key-value scaling matrices, and the structural foundations of state-of-the-art LLMs.",
    gradient: "linear-gradient(135deg, #a855f7, #6366f1)",
    completed: true,
    resources: ["Architecture_Slides.pdf", "Attention_Math_Guide.md", "Transformer_From_Scratch.ipynb"],
    notes: `### Lecture Notes: Transformers & Attention Mechanisms

In this session, Dr. Rostova explores the mathematical mechanics behind modern generative AI:

1. **The Core Formula of Self-Attention**:
   $$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$
   * **Queries (Q)**: What the token is looking for.
   * **Keys (K)**: What relevance the token offers to other tokens.
   * **Values (V)**: The actual content payload of the token.

2. **Why Scaling Matters**:
   Without the $\\sqrt{d_k}$ factor, dot products grow extremely large in high dimensions, pushing the softmax function into regions with dangerously small gradients.

3. **Multi-Head Attention (MHA)**:
   Allows the neural network to jointly attend to information from different representation subspaces at different positions.`
  },
  {
    id: 2,
    title: "CBT Frameworks for Cognitive Restructuring",
    category: "Mental Wellness",
    duration: "40 mins",
    author: "Sarah Jenkins, Clinical Psychologist",
    description: "Learn professional Cognitive Behavioral Therapy (CBT) techniques to map automatic negative thoughts and build healthy mindsets.",
    gradient: "linear-gradient(135deg, #f97316, #ef4444)",
    completed: false,
    resources: ["Cognitive_Distortion_CheatSheet.pdf", "Daily_Thought_Record.xlsx"],
    notes: `### Lecture Notes: Cognitive Behavioral Therapy (CBT)

Sarah Jenkins walks through the structured 3-Column CBT Technique for challenging automatic thoughts:

* **Column 1: The Trigger / Situation**:
  * Write down the objective event that triggered the emotional distress (e.g., "Received harsh feedback on project blueprint").
* **Column 2: The Automatic Negative Thought**:
  * Note the immediate, unhelpful cognitive framing (e.g., "I'm a failure, I will never succeed at this firm").
  * Identify cognitive distortions: *All-or-Nothing Thinking*, *Catastrophizing*, *Mind Reading*.
* **Column 3: The Rational Alternative Response**:
  * Formulate an evidence-based, compassionate rational counter-thought (e.g., "Feedback is a standard part of iterations. This is my first attempt, and I can improve this draft by addressing points A and B").`
  },
  {
    id: 3,
    title: "Mastering Responsive CSS layouts with Grid & Flexbox",
    category: "Software Engineering",
    duration: "35 mins",
    author: "Marcus Aurelius, Principal UX Engineer",
    description: "A comprehensive deep dive into modern CSS alignments, fluid typography rules, clamp properties, and responsive grid layouts.",
    gradient: "linear-gradient(135deg, #0ea5e9, #3b82f6)",
    completed: true,
    resources: ["Modern_CSS_Cheatsheet.pdf", "Grid_Layout_Examples.zip"],
    notes: `### Lecture Notes: Fluid CSS Layouts

Marcus Aurelius demonstrates modern, resilient layout engineering without relying on heavy frameworks:

1. **Fluid Typography with Clamp**:
   \`\`\`css
   h1 {
     font-size: clamp(2rem, 5vw + 1rem, 4.5rem);
   }
   \`\`\`
   * *Minimum Size*: 2rem (for small phone viewports).
   * *Ideal Size*: 5vw + 1rem (for fluid scaling matching screen width).
   * *Maximum Size*: 4.5rem (for large screen rendering).

2. **The Ultimate CSS Grid Autofill Trick**:
   \`\`\`css
   .grid-container {
     display: grid;
     grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
     gap: 1.5rem;
   }
   \`\`\`
   This creates a perfectly responsive grid that wraps cleanly without a single media query.`
  },
  {
    id: 4,
    title: "The SMART Path: Strategic Career Goal Setting",
    category: "Career Acceleration",
    duration: "28 mins",
    author: "Victoria Sterling, Career Executive Architect",
    description: "How to frame, structure, and divide ambitious professional milestones into actionable steps using psychology-backed frameworks.",
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    completed: false,
    resources: ["Career_Milestones_Blueprint.pdf", "Goal_Tracker_Template.docx"],
    notes: `### Lecture Notes: Career Milestone Strategy

Victoria Sterling details the SMART goal-setting architecture:

* **S - Specific**: Clearly state the objective (e.g., "Transition from Junior to Mid-level Front-End Engineer").
* **M - Measurable**: Quantifiable benchmarks (e.g., "Lead 3 project releases and resolve 50 critical tickets").
* **A - Achievable**: Ensuring it aligns with capabilities and current resources.
* **R - Relevant**: Ensuring the milestone supports your long-term vision.
* **T - Time-Bound**: A hard target (e.g., "Achieve in the next 12 months").

**Breaking it down**:
1. *Quarter 1*: Complete advanced certification in state machines and React.
2. *Quarter 2*: Shadow senior lead developers on enterprise blueprint drafts.`
  },
  {
    id: 5,
    title: "WebRTC and Audio Capture in Modern Web Applications",
    category: "Software Engineering",
    duration: "48 mins",
    author: "Liam Henderson, Tech Lead at Capra Tech",
    description: "An advanced look at getUserMedia audio/video streams, vanilla WebRTC ICE candidate gathering, and Web Audio analysers.",
    gradient: "linear-gradient(135deg, #f43f5e, #be123c)",
    completed: false,
    resources: ["WebRTC_Signaling_Code.js", "AudioContext_Visualizer.js"],
    notes: `### Lecture Notes: Realtime Browser WebRTC

Liam Henderson breaks down client-side voice streaming architecture:

1. **Acquiring Hardware Feeds**:
   \`\`\`javascript
   const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
   \`\`\`

2. **Web Audio Analyzer Integration**:
   \`\`\`javascript
   const ctx = new AudioContext();
   const source = ctx.createMediaStreamSource(stream);
   const analyser = ctx.createAnalyser();
   analyser.fftSize = 256;
   source.connect(analyser);
   \`\`\`

3. **Vanilla ICE Signaling Flow**:
   * Create \`RTCPeerConnection\` and load local mic tracks.
   * Generate SDP Offer: \`pc.createOffer()\`.
   * Wait for \`pc.iceGatheringState === 'complete'\`.
   * POST collected local SDP bundle directly to signaling endpoint.`
  },
  {
    id: 6,
    title: "Nervous System Regulation: Grounding Under Stress",
    category: "Mental Wellness",
    duration: "22 mins",
    author: "Sarah Jenkins, Clinical Psychologist",
    description: "Practical breathing practices and sensory exercises to calm autonomic nervous system hyper-activation in high-pressure situations.",
    gradient: "linear-gradient(135deg, #14b8a6, #0d9488)",
    completed: true,
    resources: ["Grounding_Guided_Audio.mp3", "Stress_Response_Summary.pdf"],
    notes: `### Lecture Notes: Down-Regulating Autonomic Stress

Sarah Jenkins guides you through immediate emergency grounding techniques:

1. **Box Breathing (4-4-4-4 Technique)**:
   * *Inhale* through nose for 4 seconds.
   * *Hold* lungs full for 4 seconds.
   * *Exhale* completely through mouth for 4 seconds.
   * *Hold* lungs empty for 4 seconds.
   * *Repeat* 4 times to stimulate the vagus nerve and slow heart rate.

2. **The 5-4-3-2-1 Sensory Grounding Method**:
   * Identify **5** things you can see.
   * Identify **4** things you can physically touch.
   * Identify **3** sounds you can hear.
   * Identify **2** things you can smell.
   * Identify **1** thing you can taste.`
  }
];

const CATEGORIES = ["All Categories", "Artificial Intelligence", "Mental Wellness", "Software Engineering", "Career Acceleration"];

export default function DigitalLibrary() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLecture, setActiveLecture] = useState(null);
  const [lecturesList, setLecturesList] = useState(LECTURES);

  // Statistics summaries
  const totalLectures = lecturesList.length;
  const completedCount = lecturesList.filter(l => l.completed).length;
  const totalTimeMinutes = lecturesList.reduce((sum, current) => {
    const mins = parseInt(current.duration.split(" ")[0]);
    return sum + mins;
  }, 0);
  const formattedTotalTime = `${Math.floor(totalTimeMinutes / 60)}h ${totalTimeMinutes % 60}m`;

  // Filters
  const filteredLectures = lecturesList.filter(lecture => {
    const matchesCategory = selectedCategory === "All Categories" || lecture.category === selectedCategory;
    const matchesSearch = lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lecture.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lecture.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleComplete = (id, e) => {
    e.stopPropagation();
    setLecturesList(prev => prev.map(lecture => 
      lecture.id === id ? { ...lecture, completed: !lecture.completed } : lecture
    ));
  };

  const markActiveCompleted = () => {
    if (!activeLecture) return;
    setLecturesList(prev => prev.map(lecture => 
      lecture.id === activeLecture.id ? { ...lecture, completed: true } : lecture
    ));
    setActiveLecture(prev => ({ ...prev, completed: true }));
  };

  return (
    <div className="library-container">
      {/* Premium Header Dashboard */}
      <div className="library-header glass">
        <div className="header-left">
          <span className="library-badge"><BookOpen size={16} /> LEARNING HUB</span>
          <h1 className="text-gradient">Digital Library</h1>
          <p className="header-sub">Access professional, high-fidelity lectures, expert seminar material, and companion research logs.</p>
        </div>
        
        {/* Interactive stats overview */}
        <div className="library-stats-container">
          <div className="stat-card glass">
            <span className="stat-title">Lectures</span>
            <span className="stat-value">{totalLectures}</span>
          </div>
          <div className="stat-card glass">
            <span className="stat-title">Watch Time</span>
            <span className="stat-value">{formattedTotalTime}</span>
          </div>
          <div className="stat-card glass">
            <span className="stat-title">Completed</span>
            <span className="stat-value" style={{ color: 'var(--accent-primary)' }}>
              {completedCount} <span className="stat-sub">/ {totalLectures}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="library-filter-panel glass">
        <div className="search-box glass">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search lectures, authors, or research topics..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-scroll">
          <Filter size={16} className="filter-icon" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="lectures-grid">
        <AnimatePresence mode="popLayout">
          {filteredLectures.map(lecture => (
            <motion.div
              key={lecture.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className={`lecture-card glass ${lecture.completed ? 'completed-border' : ''}`}
              onClick={() => setActiveLecture(lecture)}
            >
              {/* Thumbnail backdrop overlay */}
              <div className="lecture-thumbnail" style={{ background: lecture.gradient }}>
                <div className="thumbnail-lens"></div>
                <div className="play-button-overlay">
                  <Play size={24} fill="#fff" />
                </div>
                <span className="duration-tag"><Clock size={12} /> {lecture.duration}</span>
                <span className="category-tag">{lecture.category}</span>
              </div>

              <div className="lecture-body">
                <h3 className="lecture-title">{lecture.title}</h3>
                <span className="lecture-author"><User size={12} /> {lecture.author}</span>
                <p className="lecture-desc">{lecture.description}</p>
                
                <div className="lecture-footer">
                  <button 
                    className={`lecture-complete-checkbox ${lecture.completed ? 'completed' : ''}`}
                    onClick={(e) => toggleComplete(lecture.id, e)}
                    title={lecture.completed ? "Mark as Incomplete" : "Mark as Completed"}
                  >
                    {lecture.completed ? <CheckCircle size={16} /> : <div className="circle-checkbox"></div>}
                    <span>{lecture.completed ? "Completed" : "Mark Completed"}</span>
                  </button>
                  <ChevronRight size={16} className="card-chevron" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredLectures.length === 0 && (
          <div className="no-lectures glass">
            <BookOpen size={48} className="no-lectures-icon" />
            <h3>No Lecture Modules Found</h3>
            <p>Try resetting your search query or selecting a different category filter.</p>
            <button className="reset-filter-btn" onClick={() => { setSelectedCategory("All Categories"); setSearchQuery(""); }}>Reset Filters</button>
          </div>
        )}
      </div>

      {/* Immersive Lecture Playback Modal */}
      <AnimatePresence>
        {activeLecture && (
          <div className="lecture-modal-overlay" onClick={() => setActiveLecture(null)}>
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lecture-modal glass"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Top Nav */}
              <div className="modal-header">
                <button className="back-btn glass" onClick={() => setActiveLecture(null)}>
                  <ArrowLeft size={16} /> Back to Library
                </button>
                <div className="modal-actions">
                  {!activeLecture.completed ? (
                    <button className="mark-complete-btn glass" onClick={markActiveCompleted}>
                      <Check size={16} /> Complete Lecture
                    </button>
                  ) : (
                    <span className="badge-completed"><Award size={16} /> Lesson Finished</span>
                  )}
                  <button className="close-btn glass" onClick={() => setActiveLecture(null)}>×</button>
                </div>
              </div>

              {/* Main Content Layout */}
              <div className="modal-content-grid">
                {/* Left: Video Area & Resources */}
                <div className="modal-left-column">
                  <div className="video-player-mock" style={{ background: activeLecture.gradient }}>
                    <div className="video-lens"></div>
                    <div className="video-play-center">
                      <Play size={44} fill="#fff" className="pulse" />
                    </div>
                    {/* Simulated Player Controls overlay */}
                    <div className="player-controls glass">
                      <Play size={14} fill="#fff" />
                      <div className="progress-timeline">
                        <div className="progress-bar-fill" style={{ width: '45%' }}></div>
                      </div>
                      <span className="time-display">24:18 / {activeLecture.duration}</span>
                    </div>
                  </div>

                  <div className="lecture-meta-block">
                    <span className="lecture-category-badge">{activeLecture.category}</span>
                    <h2 className="modal-lecture-title">{activeLecture.title}</h2>
                    <span className="modal-lecture-author"><User size={14} /> {activeLecture.author}</span>
                    <p className="modal-lecture-desc">{activeLecture.description}</p>
                  </div>

                  {/* Resource Files checklist */}
                  <div className="resources-container glass">
                    <h3 className="resources-title"><Download size={16} /> Lecture Materials & Attachments</h3>
                    <div className="resources-list">
                      {activeLecture.resources.map((res, i) => (
                        <div key={i} className="resource-item glass" onClick={() => alert(`Starting download for: ${res}\n(Lecture Companion File)`)}>
                          <div className="resource-left">
                            <FileText size={16} className="file-icon" />
                            <span>{res}</span>
                          </div>
                          <button className="download-icon-btn"><Download size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Companion Markdown Notes */}
                <div className="modal-right-column glass">
                  <div className="notes-header">
                    <h3><FileText size={16} /> Expert Seminar Companion Notes</h3>
                    <span className="notes-badge"><Sparkles size={12} /> Real-time Notes</span>
                  </div>
                  <div className="notes-markdown-content">
                    {/* Render helper text mimicking high quality transcript */}
                    <div className="notes-markdown-body">
                      {activeLecture.notes.split('\n').map((line, idx) => {
                        if (line.startsWith('###')) {
                          return <h4 key={idx} className="notes-subhead">{line.replace('###', '')}</h4>;
                        }
                        if (line.startsWith('* **') || line.startsWith('   * **')) {
                          const boldPart = line.substring(line.indexOf('**') + 2, line.lastIndexOf('**'));
                          const restPart = line.substring(line.lastIndexOf('**') + 2);
                          return (
                            <li key={idx} className="notes-bullet">
                              <strong>{boldPart}</strong>{restPart}
                            </li>
                          );
                        }
                        if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
                          return <div key={idx} className="notes-ordered-item">{line}</div>;
                        }
                        if (line.startsWith('   * ')) {
                          return <li key={idx} className="notes-sub-bullet">{line.replace('   * ', '')}</li>;
                        }
                        if (line.startsWith('   `')) {
                          return <pre key={idx} className="notes-code-block"><code>{line.replace(/`/g, '')}</code></pre>;
                        }
                        if (line.trim() === '') {
                          return <div key={idx} style={{ height: '0.6rem' }} />;
                        }
                        return <p key={idx} className="notes-text">{line}</p>;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
