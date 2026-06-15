import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import {
    X, MessageSquare, Image, FileText, Trash2,
    ExternalLink, Clock, Calendar, Search, Loader2
} from 'lucide-react';
import './HistoryModal.css';
import { useAuth } from '../../config/AuthContext';

export default function HistoryModal({ isOpen, onClose }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && user?.email) {
            fetchHistory();
        }
    }, [isOpen, user?.email]);

    useEffect(() => {
        const handleRefresh = () => {
            if (user?.email) {
                fetchHistory();
            }
        };
        window.addEventListener('refresh-history', handleRefresh);
        return () => window.removeEventListener('refresh-history', handleRefresh);
    }, [user?.email]);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('https://n8n.srv1196219.hstgr.cloud/webhook/AI-Capra-History', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: user.email, industry: user.industry || 'other' })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch history');
            }

            const data = await response.json();
            
            // Client-side safety filter by user email
            const userEmail = user.email.toLowerCase();
            const filtered = Array.isArray(data)
                ? data.filter(row => row.email && row.email.toLowerCase() === userEmail)
                : [];

            // Group by conversation_id
            const groups = {};
            filtered.forEach(row => {
                if (!row.conversation_id) return;
                if (!groups[row.conversation_id]) {
                    groups[row.conversation_id] = {
                        id: row.conversation_id,
                        title: row.user_prompt || "Chat Conversation",
                        type: "chat",
                        category: "CHAT",
                        messages: [],
                        maxRow: row.row_number || 0
                    };
                }
                groups[row.conversation_id].messages.push(
                    { role: 'user', content: row.user_prompt || "", type: 'text' },
                    { role: 'assistant', content: row.output || "", type: 'text' }
                );
                if (row.row_number > groups[row.conversation_id].maxRow) {
                    groups[row.conversation_id].maxRow = row.row_number;
                    // Keep updating title to the initial prompt in the conversation
                    if (!groups[row.conversation_id].title) {
                        groups[row.conversation_id].title = row.user_prompt;
                    }
                }
            });

            // Sort grouped history by the latest row number first
            const sortedGroups = Object.values(groups).sort((a, b) => b.maxRow - a.maxRow);
            setHistory(sortedGroups);
        } catch (err) {
            console.error("Error loading chat history:", err);
            setError("Could not load history. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'chat': return MessageSquare;
            case 'image': return Image;
            case 'document': return FileText;
            default: return MessageSquare;
        }
    };

    const handleItemClick = (item) => {
        if (window.location.pathname !== '/chat') {
            // Redirect to single model AI Chat screen with state
            navigate('/chat', {
                state: {
                    conversationId: item.id,
                    messages: item.messages
                }
            });
        } else {
            // If already on /chat, just dispatch the event
            const event = new CustomEvent('load-chat', {
                detail: {
                    conversationId: item.id,
                    messages: item.messages
                }
            });
            window.dispatchEvent(event);
        }

        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="history-overlay" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="history-modal"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="history-header">
                            <div className="history-header-left">
                                <div className="item-icon-wrapper" style={{ background: 'var(--accent-primary)', color: '#000' }}>
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h2 className="history-title">Activity History</h2>
                                    <p className="dropdown-subtitle">Your recent interactions</p>
                                </div>
                            </div>
                            <button className="history-close-btn" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="history-content">
                            <div className="history-section">
                                <span className="history-section-title">Recent Activity</span>
                                
                                {loading && (
                                    <div className="history-empty" style={{ padding: '3rem 1rem' }}>
                                        <Loader2 className="animate-spin" size={32} style={{ color: 'var(--accent-primary)' }} />
                                        <p style={{ marginTop: '1rem' }}>Fetching history...</p>
                                    </div>
                                )}

                                {!loading && error && (
                                    <div className="history-empty" style={{ padding: '2rem 1rem', color: '#ef4444' }}>
                                        <p>{error}</p>
                                    </div>
                                )}

                                {!loading && !error && history.length === 0 && (
                                    <div className="history-empty">
                                        <MessageSquare size={32} style={{ opacity: 0.4 }} />
                                        <p>No activity history found for your account.</p>
                                    </div>
                                )}

                                {!loading && !error && history.length > 0 && (
                                    <div className="history-list">
                                        {history.map((item) => {
                                            const Icon = getTypeIcon(item.type);
                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    whileHover={{ x: 4 }}
                                                    className="history-item"
                                                    onClick={() => handleItemClick(item)}
                                                >
                                                    <div className="item-icon-wrapper">
                                                        <Icon size={18} />
                                                    </div>
                                                    <div className="item-details">
                                                        <span className="item-title">{item.title}</span>
                                                        <div className="item-meta">
                                                            <span className="item-tag">{item.category}</span>
                                                            <span className="item-time">{item.messages.length / 2} turn(s)</span>
                                                        </div>
                                                    </div>
                                                    <ExternalLink size={16} className="item-action" />
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="history-footer">
                            <button className="btn-clear-history" onClick={() => alert("History clearing is managed dynamically by your profile settings.")}>
                                <Trash2 size={16} />
                                Clear All History
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
