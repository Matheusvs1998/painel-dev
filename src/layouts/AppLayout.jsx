import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ProfileModal from '../components/ProfileModal';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchApiStatus } from '../lib/api';

export default function AppLayout({ session }) {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const { data: statusData } = useQuery({
    queryKey: ['status'],
    queryFn: fetchApiStatus,
    refetchInterval: 5000,
  });

  const statusStr = statusData?.status === 'online' ? t('header.online') : t('header.offline');

  return (
    <div className="flex h-screen bg-[var(--bg)] text-[var(--text)] font-sans overflow-hidden flex-col md:flex-row">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
          session={session} 
          theme={theme} 
          setTheme={setTheme} 
          status={statusStr} 
          pingMs={statusData?.pingMs}
          setIsProfileOpen={setIsProfileOpen}
        />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <Outlet context={{ session }} />
        </div>
      </main>

      {isProfileOpen && (
        <ProfileModal session={session} onClose={() => setIsProfileOpen(false)} />
      )}
    </div>
  );
}
