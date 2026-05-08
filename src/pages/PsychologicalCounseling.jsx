import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


import { Brain, Heart, Target, Award, TrendingUp, Smile, X, Mic, Send, PhoneOff, Settings, Sparkles, User, Info, Phone } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import './Career.css';


function LiveSession({ session, onClose }) {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Welcome to your ${session.title}. I am your professional AI Counselor. How are you feeling today?` }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const WEBHOOK_URL = "https://n8n.srv1196219.hstgr.cloud/webhook/Psychological";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const parseStreamingResponse = async (reader) => {
    const decoder = new TextDecoder();
    let assistantMessage = "";
    let buffer = "";

    setMessages(prev => [...prev, { role: 'assistant', content: "", type: 'text' }]);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.type === 'item' && data.content) {
              assistantMessage += data.content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantMessage;
                return newMessages;
              });
            }
          } catch (e) {
            console.warn("Parse error:", e);
          }
        }
      }

      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer);
          if (data.type === 'item' && data.content) {
            assistantMessage = data.content;
          } else if (Array.isArray(data) && data[0] && data[0].output) {
            assistantMessage = data[0].output;
          }
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = assistantMessage;
            return newMessages;
          });
        } catch (e) { }
      }
    } catch (error) {
      console.error("Streaming error:", error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && !audioBlob) return;

    const userMessage = {
      role: 'user',
      content: inputText || "Voice Message",
      type: audioBlob ? 'audio' : 'input'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    const currentAudioBlob = audioBlob;

    try {
      const formData = new FormData();
      formData.append('input', userMessage.content);
      formData.append('type', userMessage.type);
      formData.append('session_type', session.title);

      if (userMessage.type === 'audio' && currentAudioBlob) {
        formData.append('file', currentAudioBlob, 'audio.wav');
      }

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Network response was not ok');
      setAudioBlob(null);

      const reader = response.body.getReader();
      await parseStreamingResponse(reader);

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        type: 'text'
      }]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="session-overlay glass-immersive"
    >
      <div className="session-container">
        {/* Header */}
        <div className="session-header">
          <div className="agent-info">
            <div className="agent-avatar-mini">
              <div className="pulse-mini"></div>
              <Brain size={20} color="#fff" />
            </div>
            <div className="agent-text">
              <h4>AI Counselor</h4>
              <span>Professional Session Active</span>
            </div>
          </div>
          <button className="close-session-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="session-main">
          <AnimatePresence mode="wait">
            {!isCalling ? (
              <motion.div
                key="chat-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={{ width: '100%' }}
              >
                <div className="persona-display">
                  <div className="persona-avatar-wrapper">
                    <div className={`persona-pulse ${isRecording ? 'active' : ''}`}></div>
                    <div className="persona-avatar glass">
                      <Brain size={64} color="var(--accent-primary)" />
                    </div>
                  </div>
                  <h3 className="text-gradient">Career Clarity Agent</h3>
                  <p className="session-context">{session.desc}</p>
                </div>

                <div className="session-messages-container">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`session-message ${msg.role}`}
                    >
                      <div className="session-message-bubble glass">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                    </motion.div>
                  ))}
                  {isLoading && messages[messages.length - 1].role === 'user' && (
                    <div className="session-message assistant">
                      <div className="session-message-bubble glass typing-animation">
                        <span>.</span><span>.</span><span>.</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

              </motion.div>
            ) : (
              <motion.div
                key="call-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="session-call-view"
              >
                <div className="call-avatar-wrapper">
                  <div className="call-pulse-ring ring-1"></div>
                  <div className="call-pulse-ring ring-2"></div>
                  <div className="call-pulse-ring ring-3"></div>
                  <div className="persona-avatar-large glass">
                    <Brain size={80} color="var(--accent-primary)" />
                  </div>
                </div>
                <div className="call-info">
                  <h2 className="text-gradient">AI counselor</h2>
                  <div className="call-status-pill">
                    <span className="dot"></span>
                    Live Audio Session
                  </div>
                </div>
                <div className="call-waveform-mock">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [10, Math.random() * 40 + 10, 10] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.05 }}
                      className="wave-bar"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer/Input */}
        <div className="session-footer">
          <div className="session-input-wrapper glass">
            {!isCalling ? (
              <>
                <button
                  className={`session-mic-btn ${isRecording ? 'active' : ''}`}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  <Mic size={20} />
                </button>
                <input
                  type="text"
                  placeholder={isRecording ? "Listening..." : "Speak or type your thoughts..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="session-input"
                  disabled={isLoading || isRecording}
                />
                <button
                  className="input-action-btn calling-btn"
                  onClick={() => setIsCalling(true)}
                  title="Live Call Agent"
                >
                  <Phone size={20} />
                </button>
                <button className="session-send-btn" onClick={handleSend} disabled={isLoading || isRecording}>
                  {isLoading ? <Sparkles size={18} className="spin" /> : <Send size={18} />}
                </button>
              </>
            ) : (

              <div className="call-actions-centered">
                <button className="call-action-btn mute"><Mic size={22} /></button>
                <button className="call-end-btn" onClick={() => setIsCalling(false)}>
                  <PhoneOff size={28} />
                </button>
                <button className="call-action-btn"><Settings size={22} /></button>
              </div>
            )}
          </div>
          <div className="session-controls">
            <button className="control-btn"><Info size={16} /> Guidelines</button>
            <button className="end-session-btn" onClick={onClose}>
              <PhoneOff size={18} /> End Session
            </button>
            <button className="control-btn"><Settings size={16} /> Audio</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


export default function PsychologicalCounseling() {
  const [activeSession, setActiveSession] = useState(null);

  const agents = [
    {
      title: "Career Clarity Session",
      desc: "Discover your true career calling through guided self-reflection",
      icon: <Brain size={24} color="#fff" />,
      gradient: "linear-gradient(135deg, #d946ef, #8b5cf6)"
    },
    {
      title: "Stress Management",
      desc: "Learn techniques to manage workplace stress and anxiety",
      icon: <Heart size={24} color="#fff" />,
      gradient: "linear-gradient(135deg, #f97316, #ef4444)"
    },
    {
      title: "Goal Setting Workshop",
      desc: "Set achievable career goals with psychological frameworks",
      icon: <Target size={24} color="#fff" />,
      gradient: "linear-gradient(135deg, #0ea5e9, #3b82f6)"
    },
    {
      title: "Confidence Building",
      desc: "Build professional confidence through proven methods",
      icon: <Award size={24} color="#fff" />,
      gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)"
    },
    {
      title: "Growth Mindset",
      desc: "Develop a mindset that embraces challenges and learning",
      icon: <TrendingUp size={24} color="#fff" />,
      gradient: "linear-gradient(135deg, #14b8a6, #22c55e)"
    },
    {
      title: "Work-Life Balance",
      desc: "Find harmony between career ambitions and personal well-being",
      icon: <Smile size={24} color="#fff" />,
      gradient: "linear-gradient(135deg, #84cc16, #eab308)"
    }
  ];

  return (
    <div className="career-container">
      <div className="career-header" style={{ alignItems: 'flex-start', textAlign: 'left', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Mental Wellness Toolkit</h2>
      </div>

      <div className="wellness-grid">
        {agents.map((agent, index) => (
          <motion.div
            key={index}
            className="career-card glass"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem', alignItems: 'flex-start' }}
          >
            <div
              className="card-icon-3d"
              style={{ background: agent.gradient, width: '48px', height: '48px', borderRadius: '12px', marginBottom: '0.5rem' }}
            >
              {agent.icon}
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#fff', margin: 0 }}>{agent.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5', margin: 0, flex: 1 }}>{agent.desc}</p>

            <button
              onClick={() => setActiveSession(agent)}
              style={{
                background: 'transparent', border: 'none', color: '#c084fc',
                fontWeight: '600', padding: 0, marginTop: '1rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem'
              }}
            >
              Start Session <span style={{ fontSize: '1.1em' }}>↗</span>
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeSession && (
          <LiveSession
            session={activeSession}
            onClose={() => setActiveSession(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

