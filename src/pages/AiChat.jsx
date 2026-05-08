import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, ChevronDown, Trophy, X, Pause, Play, Phone, PhoneOff, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatArena.css';

const AI_MODELS = [
  { provider: 'OpenAI', model: 'GPT-4o', color: '#00a67e', logo: '🤖' },
  { provider: 'Anthropic', model: 'Claude 3.5', color: '#d4a574', logo: '🧠' },
  { provider: 'Google', model: 'Gemini 1.5', color: '#4285f4', logo: '✨' },
  { provider: 'Mistral', model: 'Mistral Large', color: '#f2a73b', logo: '⚡' }
];

const WEBHOOK_URL = 'https://n8n.srv1196219.hstgr.cloud/webhook/AI-Capra';

function ChatPanel({ side, selectedModel, onSelectModel, messages }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="message assistant">
            <div className="message-content glass">
              Hello! I'm AI Capra, your intelligent assistant. How can I help you today?
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className={`message-content ${msg.role === 'assistant' ? 'markdown-content glass' : ''}`}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
              {msg.type === 'document' && msg.fileName && (
                <div className="message-attachment" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
                  <Paperclip size={12} /> {msg.fileName}
                </div>
              )}
              {msg.type === 'audio' && (
                <div className="message-attachment" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
                  <Mic size={12} /> Voice Message
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default function AiChat() {
  const [currentModel, setCurrentModel] = useState(AI_MODELS[0]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isCalling, setIsCalling] = useState(false);

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

  // Auto-resize textarea
  useEffect(() => {
    if (chatInputRef.current) {
      chatInputRef.current.style.height = 'auto';
      chatInputRef.current.style.height = `${chatInputRef.current.scrollHeight}px`;
    }
  }, [inputText]);

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
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Please allow microphone access to record audio.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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

        // Keep the last segment in the buffer if it doesn't end with a newline
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
            // Potentially partial or non-JSON line, continue
            console.warn("Parse error:", e, line);
          }
        }
      }

      // Process any remaining content in the buffer (or handle full JSON response)
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer);
          // Handle streaming item format
          if (data.type === 'item' && data.content) {
            assistantMessage = data.content;
          }
          // Handle full JSON array format as fallback
          else if (Array.isArray(data) && data[0] && data[0].output) {
            assistantMessage = data[0].output;
          }

          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = assistantMessage;
            return newMessages;
          });
        } catch (e) {
          // Final buffer might not be a complete JSON object
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && selectedFiles.length === 0 && !audioBlob) return;

    const type = audioBlob ? 'audio' : (selectedFiles.length > 0 ? 'document' : 'input');
    const userMessage = {
      role: 'user',
      content: inputText || (audioBlob ? "Voice Message" : "Uploaded Document"),
      type: type,
      fileName: selectedFiles.length > 0 ? selectedFiles[0].name : null
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSelectedFiles([]);
    setIsLoading(true);
    const currentAudioBlob = audioBlob; // Capture current blob for the request

    try {
      const formData = new FormData();
      formData.append('input', userMessage.content);
      formData.append('type', userMessage.type);
      formData.append('model', currentModel.model);

      if (userMessage.type === 'document' && selectedFiles.length > 0) {
        formData.append('file', selectedFiles[0]);
      }

      if (userMessage.type === 'audio' && currentAudioBlob) {
        formData.append('file', currentAudioBlob, 'audio.wav');
      }

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Network response was not ok');

      // Clear states only after successful start of request/streaming
      setInputText('');
      setSelectedFiles([]);
      setAudioBlob(null);

      const reader = response.body.getReader();
      await parseStreamingResponse(reader);

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

  return (
    <div className="chat-arena-container">
      <div className="panels-container">
        <ChatPanel
          side="single"
          selectedModel={currentModel}
          onSelectModel={setCurrentModel}
          messages={messages}
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
                <Paperclip size={14} />
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
                  handleSend();
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
                  onClick={() => setShowModelSelector(!showModelSelector)}
                >
                  <span>{currentModel.logo}</span>
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
                      style={{ bottom: '100%', top: 'auto', marginBottom: '0.5rem' }}
                    >
                      {AI_MODELS.map(model => (
                        <button
                          key={model.model}
                          className="model-dropdown-item"
                          onClick={() => {
                            setCurrentModel(model);
                            setShowModelSelector(false);
                          }}
                        >
                          <span className="model-logo">{model.logo}</span>
                          <div className="model-info">
                            <span className="model-provider">{model.provider}</span>
                            <span className="model-name">{model.model}</span>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                className="input-action-btn calling-btn"
                onClick={() => setIsCalling(true)}
                title="Live Call Agent"
              >
                <Phone size={20} />
              </button>
            </div>

            <div className="input-right-actions">
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

              <button
                className="send-btn"
                onClick={handleSend}
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
          <div className="call-agent-overlay" onClick={() => setIsCalling(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="call-agent-card glass"
              onClick={e => e.stopPropagation()}
            >
              <div className="agent-avatar-wrapper">
                <div className="pulse-ring"></div>
                <img src="/logo.png" alt="AI Agent" className="agent-avatar" />
              </div>
              <div className="call-status">Calling...</div>
              <div className="agent-name">Capra AI Agent</div>

              <div className="call-actions">
                <button className="end-call-btn" onClick={() => setIsCalling(false)}>
                  <PhoneOff size={24} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
