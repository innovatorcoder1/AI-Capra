import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, ChevronDown, ChevronLeft, ChevronRight, Trophy, X, Pause, Play, Phone, PhoneOff, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatArena.css';

import { AI_MODELS } from '../config/models';

const WEBHOOK_URL = 'https://n8n.srv1196219.hstgr.cloud/webhook/AI-Capra';


function ChatPanel({ side, selectedModel, onSelectModel, messages }) {
  const [showSelector, setShowSelector] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="chat-panel">
      <div className="model-selector-bar">
        <div className="model-selector-wrapper">
          <button
            className="model-selector-btn glass"
            style={{ borderColor: showSelector ? selectedModel.color : 'transparent' }}
            onClick={() => {
              setShowSelector(!showSelector);
              setSelectedProvider(null);
            }}
          >
            <span className="model-logo" style={{ overflow: 'hidden', padding: selectedModel.logo.startsWith('http') ? '2px' : '0' }}>
              {selectedModel.logo.startsWith('http') ? (
                <img src={selectedModel.logo} alt={selectedModel.provider} style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px'}} />
              ) : (
                selectedModel.logo
              )}
            </span>
            <div className="model-info">
              <span className="model-provider">{selectedModel.provider}</span>
              <span className="model-name">{selectedModel.model}</span>
            </div>
            <ChevronDown size={14} className={`chevron ${showSelector ? 'up' : ''}`} />
          </button>

          <AnimatePresence>
            {showSelector && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="model-dropdown glass"
                style={{ maxHeight: '350px', overflowY: 'auto' }}
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
                        style={{ borderLeftColor: side === 'left' ? model.color : 'transparent' }}
                        onClick={() => {
                          onSelectModel(model);
                          setShowSelector(false);
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
      </div>


      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="message assistant">
            <div className="message-content glass">
              Waiting for your input to compare {selectedModel.model}...
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className={`message-content ${msg.role === 'assistant' ? 'markdown-content glass' : ''}`}>
              {msg.role === 'assistant' ? (
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
          </div>
        ))}
        {/* Spacer to ensure the last message is not hidden behind the floating bar */}
        <div className="chat-bottom-spacer" style={{ height: '160px', minHeight: '160px' }} />
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}


export default function ChatArena() {
  const [modelLeft, setModelLeft] = useState(AI_MODELS[0]);
  const [modelRight, setModelRight] = useState(AI_MODELS[1]);
  const [messagesLeft, setMessagesLeft] = useState([]);
  const [messagesRight, setMessagesRight] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [conversationIdLeft] = useState(() => crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36));
  const [conversationIdRight] = useState(() => crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36));

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
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
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
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Please allow microphone access to record audio.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
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

  const parseStreamingResponse = async (reader, setMessages) => {
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

  const handleSend = async () => {
    if (!inputText.trim() && selectedFiles.length === 0 && !audioBlob) return;

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
      content: inputText || (audioBlob ? "Voice Message" : "Uploaded Attachment"),
      type: type,
      fileName: selectedFiles.length > 0 ? selectedFiles[0].name : null
    };

    setMessagesLeft(prev => [...prev, userMessage]);
    setMessagesRight(prev => [...prev, userMessage]);

    const currentFiles = [...selectedFiles];
    const currentAudioBlob = audioBlob;

    setInputText('');
    setSelectedFiles([]);
    setAudioBlob(null);
    setIsLoading(true);

    const sendToModel = async (model, setMessages, convId) => {
      try {
        const formData = new FormData();
        formData.append('input', userMessage.content);
        formData.append('type', userMessage.type);
        formData.append('model', model.model);
        formData.append('provider', model.provider);
        formData.append('conversation_id', convId);

        if (userMessage.type === 'document' || userMessage.type === 'image') {
          if (currentFiles.length > 0) formData.append('file', currentFiles[0]);
        } else if (userMessage.type === 'voice') {
          if (currentAudioBlob) {
              const binaryBlob = new Blob([currentAudioBlob], { type: 'application/octet-stream' });
              formData.append('data', binaryBlob, 'audio.wav');
          }
        }

        const response = await fetch(WEBHOOK_URL, { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Network response not ok');

        const reader = response.body.getReader();
        await parseStreamingResponse(reader, setMessages);
      } catch (error) {
        console.error('Error sending:', error);
        setMessages(prev => [...prev, { role: 'assistant', content: "Error processing request.", type: 'text' }]);
      }
    };

    await Promise.all([
      sendToModel(modelLeft, setMessagesLeft, conversationIdLeft),
      sendToModel(modelRight, setMessagesRight, conversationIdRight)
    ]);

    setIsLoading(false);
  };

  return (
    <div className="chat-arena-container">
      <div className="panels-container">
        <ChatPanel
          side="left"
          selectedModel={modelLeft}
          onSelectModel={setModelLeft}
          messages={messagesLeft}
        />

        <div className="arena-divider">
          <motion.div whileHover={{ scale: 1.1 }} className="trophy-btn">
            <Trophy size={20} color="#f59e0b" />
          </motion.div>
        </div>

        <ChatPanel
          side="right"
          selectedModel={modelRight}
          onSelectModel={setModelRight}
          messages={messagesRight}
        />
      </div>

      <div className="chat-input-area">
        {(selectedFiles.length > 0 || audioBlob) && (
          <div className="file-preview-area">
            {audioBlob && (
              <div className="file-preview-item voice-preview">
                <Mic size={14} />
                <span>Voice Message ({formatTime(recordingTime)})</span>
                <button className="remove-file-btn" onClick={() => setAudioBlob(null)}><X size={14} /></button>
              </div>
            )}
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="file-preview-item">
                <Paperclip size={14} />
                <span>{file.name}</span>
                <button className="remove-file-btn" onClick={() => removeFile(idx)}><X size={14} /></button>
              </div>
            ))}
          </div>
        )}

        <div className="chat-input-bar">
          <div className="chat-input-top">
            <textarea
              ref={chatInputRef}
              className="chat-input"
              placeholder="Compare models by asking a question..."
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
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} multiple />
              <button className="input-action-btn" onClick={() => fileInputRef.current.click()} title="Attach file">
                <Paperclip size={20} />
              </button>
            </div>

            <div className="input-right-actions">
              {isRecording ? (
                <div className="recording-controls">
                  <span className="recording-time">{formatTime(recordingTime)}</span>
                  <button className="input-action-btn" onClick={isPaused ? resumeRecording : pauseRecording}>
                    {isPaused ? <Play size={16} /> : <Pause size={16} />}
                  </button>
                  <button className="input-action-btn stop-recording" onClick={stopRecording}>
                    <Square size={16} fill="currentColor" />
                  </button>
                </div>
              ) : (
                <button className="input-action-btn" onClick={startRecording} title="Voice message">
                  <Mic size={20} />
                </button>
              )}

              <button className="send-btn" onClick={handleSend} disabled={isLoading}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
