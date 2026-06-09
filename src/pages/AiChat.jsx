import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, ChevronDown, ChevronLeft, ChevronRight, Trophy, X, Pause, Play, Phone, PhoneOff, Square, Video, VideoOff, Settings, MicOff, Copy, Check, Edit2, ThumbsUp, ThumbsDown, Share2, RotateCcw, Download, Expand } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatArena.css';

import { AI_MODELS } from '../config/models';
import { useAuth } from '../config/AuthContext';
import { useLocation } from 'react-router';
import useLiveCall from '../hooks/useLiveCall';

function AudioVisualizer({ analyser, isSpeaking, volume }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    
    const draw = () => {
      animId = requestAnimationFrame(draw);
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      
      let dataArray = new Uint8Array(0);
      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);
      }
      
      ctx.lineWidth = 3;
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#a855f7');
      gradient.addColorStop(0.5, '#00c972');
      gradient.addColorStop(1, '#3b82f6');
      ctx.strokeStyle = gradient;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0, 201, 114, 0.4)';
      
      ctx.beginPath();
      
      if (analyser && dataArray.length > 0) {
        const sliceWidth = width / dataArray.length;
        let x = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
      } else {
        ctx.moveTo(0, height / 2);
        for (let x = 0; x < width; x++) {
          const freq = isSpeaking ? 0.05 : 0.01;
          const amp = isSpeaking ? 16 : (volume > 0 ? volume * 0.35 : 2);
          const y = height / 2 + Math.sin(x * freq + Date.now() * 0.005) * amp;
          ctx.lineTo(x, y);
        }
      }
      
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };
    
    draw();
    return () => cancelAnimationFrame(animId);
  }, [analyser, isSpeaking, volume]);
  
  return <canvas ref={canvasRef} width={300} height={80} className="call-visualizer-canvas" />;
}

function CameraPreview({ stream }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionStartRef = useRef({ x: 20, y: 20 });

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    positionStartRef.current = { ...position };
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      setPosition({
        x: positionStartRef.current.x - deltaX,
        y: positionStartRef.current.y - deltaY
      });
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartRef.current.x;
      const deltaY = touch.clientY - dragStartRef.current.y;
      setPosition({
        x: positionStartRef.current.x - deltaX,
        y: positionStartRef.current.y - deltaY
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    positionStartRef.current = { ...position };
  };

  return (
    <div 
      ref={containerRef}
      className="local-camera-preview"
      style={{
        bottom: `${position.y}px`,
        right: `${position.x}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      title="Drag to reposition feed"
    >
      <video ref={videoRef} autoPlay playsInline muted style={{ pointerEvents: 'none' }} />
    </div>
  );
}

const WEBHOOK_URL = 'https://n8n.srv1196219.hstgr.cloud/webhook/AI-Capra';

const downloadImage = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename || 'ai-capra-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    window.open(url, '_blank');
  }
};

function ChatPanel({ side, selectedModel, onSelectModel, messages, onEditMessage, onRegenerate, onFeedback }) {
  const messagesEndRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [sharedIndex, setSharedIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editContent, setEditContent] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleCopy = (idx, text) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleShare = (idx, text) => {
    const shareText = `Check out this response from AI Capra:\n\n${text}`;
    navigator.clipboard.writeText(shareText);
    setSharedIndex(idx);
    setTimeout(() => setSharedIndex(null), 2000);
  };

  const handleStartEdit = (idx, currentText) => {
    setEditingIndex(idx);
    setEditContent(currentText);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditContent('');
  };

  const handleSaveEdit = (idx) => {
    if (editContent.trim()) {
      onEditMessage(idx, editContent.trim());
    }
    setEditingIndex(null);
    setEditContent('');
  };

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="message assistant" style={{ width: '100%', justifyContent: 'center' }}>
            <div className="message-content glass gold-text" style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', margin: '3rem auto', padding: '1.5rem 2.5rem', maxWidth: '540px', lineHeight: '1.6', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)' }}>
              Hello! I'm AI Capra, your intelligent assistant. How can I help you today?
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
            {editingIndex === idx ? (
              <div className="message-edit-container" style={{ width: '100%', maxWidth: '85%', alignSelf: 'flex-end' }}>
                <textarea
                  className="message-edit-textarea"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)' }}
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-primary" 
                    style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', background: 'linear-gradient(135deg, var(--accent-primary), #00d2ff)', border: 'none', color: 'var(--bg-primary)', fontWeight: 'bold' }}
                    onClick={() => handleSaveEdit(idx)}
                  >
                    Save & Submit
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={`message-content ${msg.role === 'assistant' && msg.type !== 'image_result' ? 'markdown-content glass' : ''}`}>
                  {msg.role === 'assistant' && msg.type === 'image_result' ? (
                    <div className="chat-image-result glass" style={{ padding: '0.75rem', borderRadius: '16px', maxWidth: '360px' }}>
                      <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
                        <img
                          src={msg.content}
                          alt="AI processed image"
                          style={{ width: '100%', display: 'block', borderRadius: '12px', maxHeight: '320px', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                          padding: '0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem'
                        }}>
                          <button
                            onClick={() => downloadImage(msg.content, `ai-capra-${Date.now()}.png`)}
                            title="Download"
                            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}
                          >
                            <Download size={15} />
                          </button>
                          <button
                            onClick={() => window.open(msg.content, '_blank')}
                            title="Open full size"
                            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}
                          >
                            <Expand size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : msg.role === 'assistant' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content || "..."}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                  {msg.type === 'document' && msg.fileName && (
                    <div className="message-attachment" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
                      <Paperclip size={12} /> {msg.fileName}
                    </div>
                  )}
                  {msg.type === 'image' && msg.fileName && (
                    <div className="message-attachment" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
                      <Paperclip size={12} /> {msg.fileName}
                    </div>
                  )}
                  {msg.type === 'voice' && (
                    <div className="message-attachment" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
                      <Mic size={12} /> Voice Message
                    </div>
                  )}
                </div>
                
                {/* Actions Toolbar */}
                <div className="message-actions-bar">
                  {msg.role === 'user' ? (
                    <>
                      <button 
                        className="msg-action-btn" 
                        onClick={() => handleStartEdit(idx, msg.content)}
                        title="Edit query"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        className="msg-action-btn" 
                        onClick={() => handleCopy(idx, msg.content)}
                        title="Copy query"
                      >
                        {copiedIndex === idx ? <Check size={13} style={{ color: '#00c972' }} /> : <Copy size={13} />}
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className={`msg-action-btn ${msg.feedback === 'good' ? 'active-good' : ''}`} 
                        onClick={() => onFeedback(idx, 'good')}
                        title="Good response"
                      >
                        <ThumbsUp size={13} fill={msg.feedback === 'good' ? '#00c972' : 'none'} />
                      </button>
                      <button 
                        className={`msg-action-btn ${msg.feedback === 'bad' ? 'active-bad' : ''}`} 
                        onClick={() => onFeedback(idx, 'bad')}
                        title="Bad response"
                      >
                        <ThumbsDown size={13} fill={msg.feedback === 'bad' ? '#ff4d4d' : 'none'} />
                      </button>
                      <button 
                        className="msg-action-btn" 
                        onClick={() => handleCopy(idx, msg.content)}
                        title="Copy response"
                      >
                        {copiedIndex === idx ? <Check size={13} style={{ color: '#00c972' }} /> : <Copy size={13} />}
                      </button>
                      <button 
                        className="msg-action-btn" 
                        onClick={() => handleShare(idx, msg.content)}
                        title="Share response"
                      >
                        {sharedIndex === idx ? <Check size={13} style={{ color: '#00c972' }} /> : <Share2 size={13} />}
                      </button>
                      <button 
                        className="msg-action-btn" 
                        onClick={() => onRegenerate(idx)}
                        title="Try again"
                      >
                        <RotateCcw size={13} />
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
        {/* Spacer to ensure the last message is not hidden behind the floating bar */}
        <div className="chat-bottom-spacer" style={{ height: '160px', minHeight: '160px' }} />
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default function AiChat() {
  const { user } = useAuth();
  const [currentModel, setCurrentModel] = useState(AI_MODELS[0]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const {
    isCalling,
    callStatus,
    isMuted,
    isCameraOn,
    errorMessage,
    audioVolume,
    isSimulationMode,
    isAgentSpeaking,
    cameraStream,
    analyser,
    openCallScreen,
    startCall,
    endCall,
    toggleMute,
    toggleCamera
  } = useLiveCall('https://n8n.srv1196219.hstgr.cloud/webhook/Live-Call-Agent');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const location = useLocation();
  const [conversationId, setConversationId] = useState(() => crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36));

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Load chat from routing state if passed from navigation
  useEffect(() => {
    if (location.state?.conversationId && location.state?.messages) {
      setConversationId(location.state.conversationId);
      setMessages(location.state.messages);
      setInputText('');
      setSelectedFiles([]);
      setAudioBlob(null);
      // Clear location state history so refreshing page doesn't keep reloading it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Reset chat listener for sidebar "New Chat" button
  useEffect(() => {
    const handleNewChat = () => {
      setMessages([]);
      setInputText('');
      setSelectedFiles([]);
      setAudioBlob(null);
      setConversationId(crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36));
    };
    window.addEventListener('new-chat', handleNewChat);
    return () => window.removeEventListener('new-chat', handleNewChat);
  }, []);

  // Load chat listener for sidebar history / global history loads
  useEffect(() => {
    const handleLoadChat = (e) => {
      const { conversationId: loadedId, messages: loadedMessages } = e.detail;
      setConversationId(loadedId);
      setMessages(loadedMessages);
      setInputText('');
      setSelectedFiles([]);
      setAudioBlob(null);
    };
    window.addEventListener('load-chat', handleLoadChat);
    return () => window.removeEventListener('load-chat', handleLoadChat);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (chatInputRef.current) {
      chatInputRef.current.style.height = 'auto';
      chatInputRef.current.style.height = `${chatInputRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  const startAudioRecordingFallback = async () => {
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
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 100);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Please allow microphone access to record audio.");
    }
  };

  const startRecording = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = navigator.language || 'en-US';

        const initialText = inputText.trim() ? inputText.trim() + ' ' : '';

        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          setInputText(initialText + finalTranscript + interimTranscript);
        };

        recognition.onerror = (err) => {
          console.error("Speech recognition error:", err.error);
        };

        recognition.onend = () => {
          if (recognitionRef.current && isRecordingRef.current && !isPausedRef.current) {
            try {
              recognition.start();
            } catch (err) {
              console.error("Failed to restart speech recognition:", err);
            }
          }
        };

        recognitionRef.current = recognition;
        recognition.start();

        setIsRecording(true);
        setIsPaused(false);
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        setTimeout(() => {
          chatInputRef.current?.focus();
        }, 100);
      } catch (err) {
        console.error("Error starting Speech Recognition:", err);
        await startAudioRecordingFallback();
      }
    } else {
      await startAudioRecordingFallback();
    }
  };

  const pauseRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsPaused(true);
      clearInterval(timerRef.current);
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';

      const initialText = inputText.trim() ? inputText.trim() + ' ' : '';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setInputText(initialText + finalTranscript + interimTranscript);
      };

      recognition.onerror = (err) => {
        console.error("Speech recognition error:", err.error);
      };

      recognition.onend = () => {
        if (recognitionRef.current && isRecordingRef.current && !isPausedRef.current) {
          try {
            recognition.start();
          } catch (err) {
            console.error("Failed to restart speech recognition:", err);
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 100);
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerRef.current);
    } else if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerRef.current);
    }
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 50);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedFiles = files.filter(file =>
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf') ||
      file.type.startsWith('image/')
    );

    if (allowedFiles.length < files.length) {
      alert('Only PDF and image files are allowed.');
    }

    if (allowedFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...allowedFiles]);
    }
    
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const findTextInObject = (obj) => {
      if (typeof obj === 'string') return obj;
      if (!obj || typeof obj !== 'object') return null;
      
      if (obj.output && typeof obj.output === 'string') return obj.output;
      if (obj.text && typeof obj.text === 'string') return obj.text;
      
      if (Array.isArray(obj)) {
          for (const item of obj) {
              const res = findTextInObject(item);
              if (res) return res;
          }
      } else {
          for (const key in obj) {
              if (key === 'metadata') continue;
              const res = findTextInObject(obj[key]);
              if (res) return res;
          }
      }
      return null;
  };

  const parseStreamingResponse = async (reader) => {
    const decoder = new TextDecoder();
    let assistantMessage = "";
    let buffer = "";

    setMessages(prev => [...prev, { role: 'assistant', content: "", type: 'text' }]);

    const updateMessages = (content) => {
        let cleanContent = content
            .replace(/beginitem/g, '')
            .replace(/end/g, '');
        
        if (cleanContent.includes('","metadata":')) {
            cleanContent = cleanContent.split('","metadata":')[0];
        }

        // Strip trailing n8n execution/sheets/run metadata garbage
        cleanContent = cleanContent.replace(/(?:\s*"?row in sheet"?|\s*"?runIndex"?|\s*"?itemIndex"?|\s*"?metadata"?|\s*"?success"?)\s*:\s*\d+.*$/gi, '');
        cleanContent = cleanContent.replace(/\s*row in sheet.*$/gi, '');
        cleanContent = cleanContent.replace(/","runIndex".*$/gi, '');
        cleanContent = cleanContent.replace(/,"runIndex".*$/gi, '');
        cleanContent = cleanContent.replace(/,"itemIndex".*$/gi, '');
        cleanContent = cleanContent.replace(/}}$/g, '');

        setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages.length > 0) {
                newMessages[newMessages.length - 1].content = cleanContent;
            }
            return newMessages;
        });
    };

    const handleData = (data) => {
        if (data.type === 'item' && data.content) {
            assistantMessage += data.content;
        } else {
            const extracted = findTextInObject(data);
            if (extracted) {
                if (assistantMessage && extracted.startsWith(assistantMessage)) {
                    assistantMessage = extracted;
                } else if (assistantMessage && extracted.length < assistantMessage.length && assistantMessage.includes(extracted)) {
                   // Skip
                } else {
                    assistantMessage += extracted;
                }
            }
        }
        updateMessages(assistantMessage);
    };

    const handleChunk = (chunk) => {
        const regex = /beginitem([\s\S]*?)end/g;
        let match;
        let found = false;

        while ((match = regex.exec(chunk)) !== null) {
            found = true;
            const content = match[1];
            try {
                const data = JSON.parse(content);
                handleData(data);
            } catch (e) {
                if (content && !content.startsWith('{') && !content.startsWith('[')) {
                    assistantMessage += content;
                    updateMessages(assistantMessage);
                }
            }
        }

        if (!found && chunk.trim()) {
            try {
                const data = JSON.parse(chunk);
                handleData(data);
            } catch (e) {
                if (!chunk.includes('","metadata":') && !chunk.startsWith('{')) {
                    assistantMessage += chunk;
                    updateMessages(assistantMessage);
                }
            }
        }
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        if (buffer.includes('end')) {
            const parts = buffer.split('end');
            buffer = parts.pop() || "";
            parts.forEach(p => handleChunk(p + 'end'));
        } 
        else if (buffer.includes('\n')) {
          const lines = buffer.split('\n');
          buffer = lines.pop() || "";
          lines.forEach(handleChunk);
        }
      }

      if (buffer.trim()) {
          handleChunk(buffer);
      }
    } catch (error) {
      console.error("Streaming error:", error);
    }
  };

  const handleSend = async (overrideText = null) => {
    const textToSend = overrideText !== null ? overrideText : inputText;
    if (!textToSend.trim() && selectedFiles.length === 0 && !audioBlob) return;

    const getMessageType = () => {
        if (audioBlob) return 'voice';
        if (selectedFiles.length > 0) {
            const file = selectedFiles[0];
            return file.type.startsWith('image/') ? 'image' : 'document';
        }
        return 'text';
    };

    const type = getMessageType();
    const userMessage = {
      role: 'user',
      content: textToSend || (audioBlob ? "Voice Message" : "Uploaded Attachment"),
      type: type,
      fileName: selectedFiles.length > 0 ? selectedFiles[0].name : null
    };

    const currentFiles = [...selectedFiles];
    const currentAudioBlob = audioBlob;

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSelectedFiles([]);
    setAudioBlob(null);
    setIsLoading(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    try {
      const formData = new FormData();
      formData.append('input', userMessage.content);
      formData.append('type', userMessage.type);
      formData.append('model', currentModel.model);
      formData.append('provider', currentModel.provider);
      formData.append('conversation_id', conversationId);
      formData.append('email', user?.email || '');

      if (userMessage.type === 'document' || userMessage.type === 'image') {
        if (currentFiles.length > 0) formData.append('file', currentFiles[0]);
      } else if (userMessage.type === 'voice') {
        if (currentAudioBlob) {
            const binaryBlob = new Blob([currentAudioBlob], { type: 'audio/wav' });
            formData.append('data', binaryBlob, 'audio.wav');
        }
      }

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Network response was not ok');

      if (userMessage.type === 'image') {
        // Image upload: parse JSON response for avatar_url
        let imageUrl = null;
        try {
          const text = await response.text();
          let parsedData = null;
          
          try {
            parsedData = JSON.parse(text);
          } catch (e) {
            // Try to extract from chunked response if applicable
            const match = text.match(/beginitem([\s\S]*?)end/);
            if (match) {
              try {
                parsedData = JSON.parse(match[1]);
              } catch (e2) {}
            }
          }

          if (parsedData) {
            const target = Array.isArray(parsedData) ? parsedData[0] : parsedData;
            imageUrl =
              target?.avatar_url ||
              target?.url ||
              target?.image_url ||
              null;
          }

          // Fallback: regex search for a URL in the raw text
          if (!imageUrl && text) {
            const urlMatch = text.match(/https:\/\/[a-zA-Z0-9.\-_/]+\.(png|jpg|jpeg|gif|webp)/i) || 
                             text.match(/https:\/\/[^\s"'\\]+/);
            if (urlMatch) {
              imageUrl = urlMatch[0];
            }
          }
        } catch (e) {
          console.error('Error extracting image URL:', e);
        }

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: imageUrl || 'Image processed, but no result URL was returned.',
          type: imageUrl ? 'image_result' : 'text',
        }]);
      } else {
        const reader = response.body.getReader();
        await parseStreamingResponse(reader);
      }

      // Trigger background update of chat history
      window.dispatchEvent(new CustomEvent('refresh-history'));
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I encountered an error processing your request.",
        type: 'text'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMessage = async (index, newContent) => {
    const updatedMessages = messages.slice(0, index);
    setMessages(updatedMessages);
    await handleSend(newContent);
  };

  const handleRegenerate = async (index) => {
    let precedingUserMsgIndex = -1;
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        precedingUserMsgIndex = i;
        break;
      }
    }
    
    if (precedingUserMsgIndex === -1) return;
    
    const queryToRegenerate = messages[precedingUserMsgIndex].content;
    const updatedMessages = messages.slice(0, precedingUserMsgIndex);
    setMessages(updatedMessages);
    
    await handleSend(queryToRegenerate);
  };

  const handleFeedback = (index, rating) => {
    setMessages(prev => {
      const newMsgs = [...prev];
      if (newMsgs[index]) {
        if (newMsgs[index].feedback === rating) {
          const newMsg = { ...newMsgs[index] };
          delete newMsg.feedback;
          newMsgs[index] = newMsg;
        } else {
          newMsgs[index] = { ...newMsgs[index], feedback: rating };
        }
      }
      return newMsgs;
    });
  };

  const handleSendClick = async () => {
    if (isRecordingRef.current) {
      stopRecording();
      setTimeout(() => {
        handleSend();
      }, 100);
    } else {
      handleSend();
    }
  };

  return (
    <div className="chat-arena-container">
      <div className="panels-container">
        <ChatPanel
          side="single"
          selectedModel={currentModel}
          onSelectModel={setCurrentModel}
          messages={messages}
          onEditMessage={handleEditMessage}
          onRegenerate={handleRegenerate}
          onFeedback={handleFeedback}
        />
      </div>

      <div className="chat-input-area">
        {(selectedFiles.length > 0 || audioBlob) && (
          <div className="file-preview-area">
            {audioBlob && (
              <div className="file-preview-item voice-preview">
                <Mic size={14} />
                <span>Voice Message ({formatTime(recordingTime)})</span>
                <button className="remove-file-btn" onClick={() => setAudioBlob(null)}>
                  <X size={14} />
                </button>
              </div>
            )}
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="file-preview-item">
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    style={{ width: '20px', height: '20px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                  />
                ) : (
                  <Paperclip size={14} />
                )}
                <span>{file.name}</span>
                <button className="remove-file-btn" onClick={() => removeFile(idx)}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="chat-input-bar">
          <div className="chat-input-top">
            <textarea
              ref={chatInputRef}
              className="chat-input"
              placeholder="How can AI Capra help you today?"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendClick();
                }
              }}
            />
          </div>

          <div className="chat-input-bottom">
            <div className="input-left-actions">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".pdf,application/pdf,image/*"
                multiple
              />
              <button
                className="input-action-btn"
                onClick={() => fileInputRef.current.click()}
                title="Attach file"
              >
                <Paperclip size={20} />
              </button>

              <div className="model-selector-wrapper">
                <button
                  className="model-selector-compact"
                  onClick={() => {
                    setShowModelSelector(!showModelSelector);
                    setSelectedProvider(null);
                  }}
                >
                  {currentModel.logo.startsWith('http') ? (
                    <img src={currentModel.logo} alt={currentModel.provider} style={{width: '20px', height: '20px', borderRadius: '4px', objectFit: 'contain'}} />
                  ) : (
                    <span>{currentModel.logo}</span>
                  )}
                  <span>{currentModel.model}</span>
                  <ChevronDown size={14} />
                </button>

                <AnimatePresence>
                  {showModelSelector && (
                    <motion.div
                      key="model-selector"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="model-dropdown glass"
                      style={{ bottom: '100%', top: 'auto', marginBottom: '0.5rem', maxHeight: '350px', overflowY: 'auto' }}
                    >
                      {!selectedProvider ? (
                        <>
                          {Array.from(new Set(AI_MODELS.map(m => m.provider))).map(provider => (
                            <button
                              key={provider}
                              className="provider-item"
                              onClick={() => setSelectedProvider(provider)}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <img src={AI_MODELS.find(m => m.provider === provider).logo} alt={provider} style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'contain' }} />
                                <span className="provider-name">{provider}</span>
                              </div>
                              <ChevronRight size={14} />
                            </button>
                          ))}
                        </>
                      ) : (
                        <>
                          <button className="back-btn" onClick={() => setSelectedProvider(null)}>
                            <ChevronLeft size={14} /> Back to Providers
                          </button>
                          {AI_MODELS.filter(m => m.provider === selectedProvider).map(model => (
                            <button
                              key={model.model}
                              className="model-dropdown-item"
                              onClick={() => {
                                setCurrentModel(model);
                                setShowModelSelector(false);
                                setSelectedProvider(null);
                              }}
                            >
                              <span className="model-logo" style={{ overflow: 'hidden', padding: model.logo.startsWith('http') ? '2px' : '0' }}>
                                {model.logo.startsWith('http') ? (
                                  <img src={model.logo} alt={model.provider} style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px'}} />
                                ) : (
                                  model.logo
                                )}
                              </span>
                              <div className="model-info">
                                <span className="model-name">{model.model}</span>
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isRecording ? (
                <div className="recording-controls">
                  <span className="recording-time">{formatTime(recordingTime)}</span>
                  <button
                    className="input-action-btn"
                    onClick={isPaused ? resumeRecording : pauseRecording}
                  >
                    {isPaused ? <Play size={16} /> : <Pause size={16} />}
                  </button>
                  <button
                    className="input-action-btn stop-recording"
                    onClick={stopRecording}
                  >
                    <Square size={16} fill="currentColor" />
                  </button>
                </div>
              ) : (
                <button
                  className="input-action-btn"
                  onClick={startRecording}
                  title="Voice message"
                >
                  <Mic size={20} />
                </button>
              )}
            </div>

            <div className="input-right-actions">
              <button
                className="input-action-btn calling-btn"
                onClick={() => {
                  openCallScreen();
                  startCall('Capra AI Agent');
                }}
                title="Live Call Agent"
              >
                <Phone size={20} />
              </button>

              <button
                className="send-btn"
                onClick={handleSendClick}
                disabled={isLoading}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isCalling && (
          <div className="call-agent-overlay" onClick={endCall}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="call-agent-card glass"
              onClick={e => e.stopPropagation()}
            >
              <div className={`hyper-avatar-container ${isAgentSpeaking ? 'speaking' : ''} ${isSimulationMode ? 'fallback' : ''}`}>
                <div className="pulse-ring" style={{ transform: `scale(${1 + audioVolume / 100})`, opacity: isAgentSpeaking ? 0.8 : 0.4 }}></div>
                <div className="pulse-ring" style={{ transform: `scale(${1.2 + audioVolume / 80})`, opacity: isAgentSpeaking ? 0.5 : 0.2, animationDelay: '0.5s' }}></div>
                
                <div className="hyper-avatar-frame" style={{ borderColor: isSimulationMode ? '#f59e0b' : 'var(--accent-primary)' }}>
                  <div className="hyper-avatar-lighting"></div>
                  <img 
                    src="/avatar-premium.png" 
                    alt="Realistic AI Assistant" 
                    className={`hyper-avatar-img ${isAgentSpeaking ? 'speaking' : ''}`} 
                    style={{ 
                      transform: isAgentSpeaking ? `scale(${1 - audioVolume / 1000}, ${1 + audioVolume / 250}) translateY(${audioVolume / 450}px)` : 'scale(1) translateY(0)'
                    }} 
                  />
                </div>
              </div>
              
              <div className="call-status">
                {callStatus === 'idle' && "Ready to Connect"}
                {callStatus === 'connecting' && "Establishing Secure WebRTC Line..."}
                {callStatus === 'connected' && (isSimulationMode ? "Live Audio (Secure Fallback)" : "Live Audio Session Connected")}
                {callStatus === 'error' && "Connection Error"}
              </div>
              
              <div className="agent-name">Capra AI Agent</div>

              {/* Dynamic waveform visualizer */}
              <AudioVisualizer analyser={analyser} isSpeaking={isAgentSpeaking} volume={audioVolume} />

              {/* Error readout */}
              {errorMessage && <div className="call-error-message">{errorMessage}</div>}

              {/* Floating Camera Preview inside overlay */}
              {isCameraOn && cameraStream && <CameraPreview stream={cameraStream} />}

              {/* Call Controls Panel */}
              <div className="call-actions">
                <button 
                  className={`call-action-btn ${isMuted ? 'active' : ''}`} 
                  onClick={toggleMute}
                  title={isMuted ? "Unmute Mic" : "Mute Mic"}
                >
                  {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>

                <button 
                  className="start-call-btn" 
                  onClick={() => startCall('Capra AI Agent')} 
                  title="Start/Reconnect Call"
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    background: '#00c972', 
                    border: 'none', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(0, 201, 114, 0.4)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Phone size={26} />
                </button>

                <button className="end-call-btn" onClick={endCall} title="End Call">
                  <PhoneOff size={28} />
                </button>

                <button 
                  className={`call-action-btn ${isCameraOn ? 'camera-on' : ''}`} 
                  onClick={toggleCamera}
                  title={isCameraOn ? "Camera Off" : "Camera On"}
                >
                  {isCameraOn ? <Video size={22} /> : <VideoOff size={22} />}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
