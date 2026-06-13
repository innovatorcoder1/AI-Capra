import React, { useState } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import Header from './Header';
import ParticleField from '../ui/ParticleField';
import HistoryModal from '../ui/HistoryModal';
import IndustryModal from '../auth/IndustryModal';

export default function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="root-layout">
      {/* Global Particle Background */}
      <ParticleField />

      <div className={`sidebar-container ${sidebarOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
      </div>

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Industry Selection Modal on First Login */}
      <IndustryModal />

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      <div className={`content-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
