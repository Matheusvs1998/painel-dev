import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Menu, Sun, Moon } from 'lucide-react';
import { supabase } from '../lib/supabase';

const C = {
  bg: 'var(--bg)',
  border: 'var(--border)',
  neon: 'var(--neon)',
  neonDim: 'var(--neonDim)',
  subtle: 'var(--subtle)',
  red: 'var(--red)',
  text: 'var(--text)',
  card: 'var(--card)'
};

export default function Header({ setIsMobileMenuOpen, session, theme, setTheme, status, pingMs, setIsProfileOpen }) {
  const { t, i18n } = useTranslation();

  const inputStyle = {
    background: C.bg,
    border: `1px solid ${C.border}`,
    color: C.text,
    outline: 'none',
  };

  return (
    <header className="flex justify-between items-center p-4 md:px-8 border-b border-[var(--border)] shrink-0 gap-4">
      <div className="flex items-center gap-3">
        <button className="md:hidden text-[var(--neon)]" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
        <div className="relative hidden sm:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--subtle)]" />
          <input type="text" placeholder={t('header.searchPlaceholder')} style={inputStyle} className="pl-9 pr-4 py-1.5 w-[200px] rounded-full text-sm font-sans" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full ${status === t('header.online') ? 'bg-[var(--neonDim)] text-[var(--neon)]' : 'bg-red-500/10 text-red-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status === t('header.online') ? 'bg-[var(--neon)]' : 'bg-red-500'}`}></span>
          {t('header.backendStatus')} {status} {pingMs ? `· ${pingMs}ms` : ''}
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium m-0 capitalize">
            {session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Usuário'}
          </p>
          <p className="text-[0.7rem] text-[var(--subtle)] m-0">
            {session?.user?.email}
          </p>
        </div>
        <img 
          src={session?.user?.user_metadata?.custom_avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.user_metadata?.avatar_seed || session?.user?.email || 'User'}`} 
          alt="User" 
          title="Editar Perfil"
          onClick={() => setIsProfileOpen(true)}
          className="w-9 h-9 rounded-full border-2 border-[var(--border)] bg-[var(--card)] cursor-pointer transition-colors hover:border-[var(--neon)] object-cover" 
        />
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{ transform: theme === 'dark' ? 'rotate(0deg)' : 'rotate(360deg)' }}
          className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-1.5 cursor-pointer text-[var(--neon)] flex items-center justify-center transition-all duration-500 hover:bg-[var(--hover)]"
          title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <select
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          style={inputStyle}
          className="py-1.5 px-2 rounded-lg cursor-pointer text-xs"
        >
          <option value="pt">PT-BR</option>
          <option value="en">EN-US</option>
        </select>
      </div>
    </header>
  );
}
