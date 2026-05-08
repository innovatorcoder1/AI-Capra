import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, MessageSquare, Image, FileText, Trash2,
    ExternalLink, Clock, Calendar, Search
} from 'lucide-react';
import './HistoryModal.css';

const MOCK_HISTORY = [
    {
        id: 1,
        title: "Market Analysis for Q2 2026",
        type: "chat",
        category: "CHAT",
        time: "2 hours ago",
        date: "Today"
    },
    {
        id: 2,
        title: "Abstract Geometric Wallpaper",
        type: "image",
        category: "IMAGE",
        time: "5 hours ago",
        date: "Today"
    },
    {
        id: 3,
        title: "Legal Document Breakdown",
        type: "document",
        category: "DOCUMENTS",
        time: "Yesterday, 4:15 PM",
        date: "Yesterday"
    },
    {
        id: 4,
        title: "React Performance Optimization",
        type: "chat",
        category: "CHAT",
        time: "2 days ago",
        date: "This Week"
    }
];

export default function HistoryModal({ isOpen, onClose }) {
    const getTypeIcon = (type) => {
        switch (type) {
            case 'chat': return MessageSquare;
            case 'image': return Image;
            case 'document': return FileText;
            default: return MessageSquare;
        }
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
                                <div className="history-list">
                                    {MOCK_HISTORY.map((item) => {
                                        const Icon = getTypeIcon(item.type);
                                        return (
                                            <motion.div
                                                key={item.id}
                                                whileHover={{ x: 4 }}
                                                className="history-item"
                                            >
                                                <div className="item-icon-wrapper">
                                                    <Icon size={18} />
                                                </div>
                                                <div className="item-details">
                                                    <span className="item-title">{item.title}</span>
                                                    <div className="item-meta">
                                                        <span className="item-tag">{item.category}</span>
                                                        <span className="item-time">{item.time}</span>
                                                    </div>
                                                </div>
                                                <ExternalLink size={16} className="item-action" />
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="history-footer">
                            <button className="btn-clear-history">
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
