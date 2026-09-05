import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Menu, Sun, Moon, LayoutDashboard, GitBranch, 
  Inbox, Bell, BarChart2, Radio, FileText, Activity, Link2, 
  X, ArrowRight, ExternalLink, Command, Keyboard, Sparkles, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchGithubEvents } from '../lib/api';

const C = {
  bg: 'var(--bg)',
  border: 'var(--border)',
  neon: 'var(--neon)',
  neonDim: 'var(--neonDim)',
  subtle: 'var(--subtle)',
  red: 'var(--red)',
  text: 'var(--text)',
  card: 'var(--card)',
  hover: 'var(--hover)'
};

export default function Header({ setIsMobileMenuOpen, session, theme, setTheme, setIsProfileOpen }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const searchRef = useRef(null);

  const userId = session?.user?.id || '';
  const currentAuthor = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || '';
  const connectedRepo = session?.user?.user_metadata?.github_repo || '';

  const { data: githubEvents = [] } = useQuery({
    queryKey: ['githubEvents', userId, connectedRepo],
    queryFn: () => fetchGithubEvents({ userId, sender: currentAuthor, repo: connectedRepo }),
    refetchInterval: 5000
  });

  // Lista de páginas do sistema para busca rápida
  const systemPages = [
    { title: 'Visão Geral (Overview)', path: '/', icon: LayoutDashboard, category: 'Navegação' },
    { title: 'GitHub Webhooks', path: '/github', icon: GitBranch, category: 'Navegação' },
    { title: 'Inbox de Mensagens', path: '/inbox', icon: Inbox, category: 'Navegação' },
    { title: 'Central de Alertas', path: '/alerts', icon: Bell, category: 'Navegação' },
    { title: 'Estatísticas & Métricas', path: '/stats', icon: BarChart2, category: 'Navegação' },
    { title: 'Canais de Notificação', path: '/channels', icon: Radio, category: 'Navegação' },
    { title: 'Relatórios & Exportação', path: '/reports', icon: FileText, category: 'Navegação' },
    { title: 'Status dos Serviços', path: '/services', icon: Activity, category: 'Navegação' },
    { title: 'Endpoints da API', path: '/endpoints', icon: Link2, category: 'Navegação' },
  ];

  // Filtra páginas e eventos
  const filteredPages = searchTerm.trim() 
    ? systemPages.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const filteredEvents = searchTerm.trim()
    ? githubEvents.filter(e => 
        (e.repo && e.repo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.sender && e.sender.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.event && e.event.toLowerCase().includes(searchTerm.toLowerCase()))
      ).slice(0, 4)
    : [];

  // Fechar busca ao clicar fora ou apertar Esc / Abrir atalhos com Ctrl + /
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsShortcutsOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
        setIsSearchOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === '/' || e.key === ';')) {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectPage = (path) => {
    navigate(path);
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  const handleSelectEvent = () => {
    navigate('/github');
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  const inputStyle = {
    background: C.bg,
    border: `1px solid ${C.border}`,
    color: C.text,
    outline: 'none',
  };

  return (
    <header className="relative flex justify-between items-center p-4 md:px-8 border-b border-[var(--border)] shrink-0 gap-4">
      {/* Busca Global e Mobile Menu */}
      <div className="flex items-center gap-3 relative flex-1 max-w-md" ref={searchRef}>
        <button className="md:hidden text-[var(--neon)]" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>

        <div className="relative w-full">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--subtle)] pointer-events-none" />
          <input 
            type="text" 
            placeholder={t('header.searchPlaceholder', 'Buscar no sistema...')} 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            style={inputStyle} 
            className="w-full pl-9 pr-4 lg:pr-14 py-1.5 rounded-full text-xs font-sans focus:border-[var(--neon)] focus:shadow-[0_0_15px_var(--neonDim)] transition-all placeholder:text-[var(--subtle)]" 
          />
          <span className="hidden lg:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] text-[var(--subtle)] pointer-events-none">
            Ctrl+K
          </span>
        </div>

        {/* Dropdown de Resultados da Busca Global */}
        {isSearchOpen && searchTerm.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-50 overflow-hidden flex flex-col divide-y divide-[var(--border)] animate-in fade-in zoom-in-95 duration-150">
            {filteredPages.length === 0 && filteredEvents.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--muted)]">
                Nenhum resultado encontrado para "{searchTerm}".
              </div>
            ) : (
              <>
                {/* Seção Páginas */}
                {filteredPages.length > 0 && (
                  <div className="p-2">
                    <p className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--subtle)] font-bold m-0">
                      Páginas & Recursos
                    </p>
                    {filteredPages.map((page, idx) => {
                      const Icon = page.icon;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectPage(page.path)}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--hover)] cursor-pointer text-xs transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-[var(--neonDim)] text-[var(--neon)] flex items-center justify-center">
                              <Icon size={13} />
                            </div>
                            <span className="text-[var(--text)] group-hover:text-[var(--neon)] font-medium">
                              {page.title}
                            </span>
                          </div>
                          <ArrowRight size={13} className="text-[var(--subtle)] group-hover:text-[var(--neon)] transition-transform group-hover:translate-x-0.5" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Seção Eventos do GitHub */}
                {filteredEvents.length > 0 && (
                  <div className="p-2 bg-[var(--bg)]/50">
                    <p className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--subtle)] font-bold m-0">
                      Eventos GitHub Coincidentes
                    </p>
                    {filteredEvents.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={handleSelectEvent}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--hover)] cursor-pointer text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)] shrink-0"></span>
                          <span className="font-semibold text-[var(--neon)] truncate">{ev.event}</span>
                          <span className="text-[var(--muted)] truncate font-mono text-[11px]">{ev.repo}</span>
                          <span className="text-[var(--subtle)] text-[11px]">por @{ev.sender}</span>
                        </div>
                        <ExternalLink size={12} className="text-[var(--subtle)] shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Lado Direito: Atalhos, Status, Usuário, Tema e Idioma */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Botão Atalhos de Teclado */}
        <button
          onClick={() => setIsShortcutsOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--card)] hover:bg-[var(--hover)] border border-[var(--border)] hover:border-[var(--neonBorder)] text-xs text-[var(--text)] font-mono transition-all cursor-pointer shadow-sm"
          title="Atalhos de Teclado (Ctrl + /)"
        >
          <Command size={14} className="text-[var(--neon)]" />
          <span className="text-[11px] text-[var(--subtle)]">Ctrl+/</span>
        </button>

        <div className="text-right hidden md:block">
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
          className="w-9 h-9 rounded-full border-2 border-[var(--border)] bg-[var(--card)] cursor-pointer transition-colors hover:border-[var(--neon)] object-cover shadow-[0_0_10px_var(--neonDim)]" 
        />

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{ transform: theme === 'dark' ? 'rotate(0deg)' : 'rotate(360deg)' }}
          className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-1.5 cursor-pointer text-[var(--neon)] flex items-center justify-center transition-all duration-500 hover:bg-[var(--hover)]"
          title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'pt' ? 'en' : 'pt')}
          className="bg-[var(--card)] hover:bg-[var(--hover)] border border-[var(--border)] hover:border-[var(--neonBorder)] rounded-lg py-1.5 px-2.5 cursor-pointer text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 transition-all shadow-sm"
          title="Alternar Idioma (PT / EN)"
        >
          <span className="text-sm leading-none">{i18n.language === 'pt' ? '🇧🇷' : '🇺🇸'}</span>
          <span className="font-mono text-[11px] text-[var(--neon)] font-bold uppercase">{i18n.language === 'pt' ? 'PT' : 'EN'}</span>
        </button>
      </div>

      {/* Modal de Atalhos de Teclado / Dev CheatSheet */}
      <AnimatePresence>
        {isShortcutsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--hover)]/40">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[var(--neonDim)] text-[var(--neon)]">
                    <Keyboard size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text)] m-0">Atalhos de Teclado do Sistema</h3>
                    <p className="text-[11px] text-[var(--subtle)] m-0">Produtividade de Engenharia & Dev CheatSheet</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsShortcutsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--subtle)] hover:text-[var(--text)] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* Seção 1: Navegação */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--neon)] font-bold">
                    ⚡ Navegação Rápida
                  </span>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                      <span className="text-[var(--text)]">Abrir Busca Global de Páginas & Eventos</span>
                      <kbd className="px-2 py-0.5 rounded bg-[var(--hover)] text-[var(--neon)] border border-[var(--border)] font-mono text-[11px] font-bold">
                        Ctrl + K
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                      <span className="text-[var(--text)]">Exibir / Ocultar Este CheatSheet</span>
                      <kbd className="px-2 py-0.5 rounded bg-[var(--hover)] text-[var(--neon)] border border-[var(--border)] font-mono text-[11px] font-bold">
                        Ctrl + /
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                      <span className="text-[var(--text)]">Fechar Janelas Modais & Busca</span>
                      <kbd className="px-2 py-0.5 rounded bg-[var(--hover)] text-[var(--muted)] border border-[var(--border)] font-mono text-[11px]">
                        Esc
                      </kbd>
                    </div>
                  </div>
                </div>

                {/* Seção 2: Produtividade & IA */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--neon)] font-bold">
                    🤖 Engenharia & Inteligência Artificial
                  </span>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                      <span className="text-[var(--text)]">Disparar DevAI Studio Prompt</span>
                      <kbd className="px-2 py-0.5 rounded bg-[var(--hover)] text-[var(--neon)] border border-[var(--border)] font-mono text-[11px] font-bold">
                        Ctrl + Enter
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                      <span className="text-[var(--text)]">Gerar Release Notes Automáticas com IA</span>
                      <span className="text-[11px] text-[var(--muted)]">Botão na tela GitHub</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                      <span className="text-[var(--text)]">Diagnóstico de Latência & Ping em Tempo Real</span>
                      <span className="text-[11px] text-[var(--muted)]">Botão na tela Serviços</span>
                    </div>
                  </div>
                </div>

                {/* Dica de Rodapé */}
                <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--subtle)]">
                  <span>DEVSYSTEM v2.4 • Matheus Vasconcelos</span>
                  <span className="font-mono text-[var(--neon)]">Online & Polled</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
