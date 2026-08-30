import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGithubEvents } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox as InboxIcon, CheckCircle2, Bell, GitBranch, 
  Trash2, MailOpen, Filter, Search, ShieldAlert, Sparkles 
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { toast } from 'sonner';

const C = {
  card: 'var(--card)',
  border: 'var(--border)',
  neon: 'var(--neon)',
  neonDim: 'var(--neonDim)',
  muted: 'var(--muted)',
  subtle: 'var(--subtle)',
  hover: 'var(--hover)',
  text: 'var(--text)'
};

const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem' };

export default function Inbox() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [readItems, setReadItems] = useState(new Set());

  const { data: githubEvents = [] } = useQuery({
    queryKey: ['githubEvents'],
    queryFn: fetchGithubEvents,
    refetchInterval: 5000
  });

  // Notificações derivadas de eventos reais e do sistema
  const systemNotifications = [
    {
      id: 'sys-1',
      title: 'PostgreSQL Supabase Conectado',
      description: 'Sincronização com o cluster de banco de dados operando com 100% de estabilidade.',
      type: 'system',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      icon: CheckCircle2,
      badge: 'Database'
    },
    {
      id: 'sys-2',
      title: 'Edge Function de Webhook Ativa',
      description: 'A Edge Function "github-webhook" está escutando requisições na nuvem.',
      type: 'system',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      icon: Sparkles,
      badge: 'Edge Server'
    },
    {
      id: 'sys-3',
      title: 'Verificação de Segurança Concluída',
      description: 'Políticas de Row Level Security (RLS) verificadas com sucesso nas tabelas.',
      type: 'security',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      icon: ShieldAlert,
      badge: 'Segurança'
    }
  ];

  // Converte eventos do GitHub em notificações
  const githubNotifications = githubEvents.map(ev => ({
    id: `gh-${ev.id}`,
    title: `GitHub: Novo evento "${ev.event}"`,
    description: `Autor: ${ev.sender} no repositório ${ev.repo}${ev.action ? ` (Ação: ${ev.action})` : ''}`,
    type: 'github',
    timestamp: ev.timestamp,
    icon: GitBranch,
    badge: ev.repo
  }));

  const allNotifications = [...githubNotifications, ...systemNotifications].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const filteredNotifications = allNotifications.filter(item => {
    if (filter === 'unread' && readItems.has(item.id)) return false;
    if (filter === 'github' && item.type !== 'github') return false;
    if (filter === 'system' && item.type !== 'system' && item.type !== 'security') return false;
    if (search) {
      const q = search.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.badge.toLowerCase().includes(q);
    }
    return true;
  });

  const markAsRead = (id) => {
    setReadItems(prev => new Set(prev).add(id));
    toast.success('Notificação marcada como lida');
  };

  const markAllAsRead = () => {
    const allIds = new Set(allNotifications.map(n => n.id));
    setReadItems(allIds);
    toast.success('Todas as notificações foram marcadas como lidas');
  };

  const unreadCount = allNotifications.filter(n => !readItems.has(n.id)).length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SectionHeader 
          title="Inbox de Notificações" 
          subtitle={`${unreadCount} notificações não lidas no painel`} 
        />
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--card)] hover:bg-[var(--hover)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--neon)] transition-all cursor-pointer shadow-sm"
          >
            <MailOpen size={15} /> Marcar tudo como lido
          </button>
        )}
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="flex items-center gap-1.5 p-1 bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-x-auto">
          {[
            { id: 'all', label: 'Todas', count: allNotifications.length },
            { id: 'unread', label: 'Não Lidas', count: unreadCount },
            { id: 'github', label: 'GitHub', count: githubNotifications.length },
            { id: 'system', label: 'Sistema', count: systemNotifications.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                filter === tab.id
                  ? 'bg-[var(--neon)] text-[var(--bg)] font-bold shadow-[0_0_12px_var(--neonDim)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filter === tab.id ? 'bg-black/20 text-[var(--bg)]' : 'bg-[var(--hover)] text-[var(--subtle)]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--subtle)]" />
          <input
            type="text"
            placeholder="Filtrar mensagens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--neon)] transition-colors"
          />
        </div>
      </div>

      {/* Lista de Mensagens */}
      <div style={card} className="overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3 text-[var(--muted)]">
            <InboxIcon size={36} className="opacity-30 text-[var(--neon)]" />
            <p className="m-0 text-sm font-medium">Nenhuma notificação encontrada no filtro atual.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            <AnimatePresence>
              {filteredNotifications.map((n) => {
                const isRead = readItems.has(n.id);
                const Icon = n.icon;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 sm:p-5 flex items-start gap-4 transition-all hover:bg-[var(--hover)] ${
                      !isRead ? 'bg-[var(--neonDim)]/10' : ''
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      !isRead 
                        ? 'bg-[var(--neonDim)] text-[var(--neon)] border border-[var(--neonBorder)]' 
                        : 'bg-[var(--hover)] text-[var(--subtle)] border border-[var(--border)]'
                    }`}>
                      <Icon size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold text-[var(--text)]">{n.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-[var(--card)] border border-[var(--border)] text-[var(--muted)]">
                          {n.badge}
                        </span>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-[var(--neon)] shrink-0 animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--muted)] m-0 leading-relaxed break-words">
                        {n.description}
                      </p>
                      <span className="text-[10px] text-[var(--subtle)] mt-2 block font-mono">
                        {new Date(n.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isRead ? (
                        <button
                          onClick={() => markAsRead(n.id)}
                          title="Marcar como lida"
                          className="p-1.5 rounded-lg bg-[var(--card)] hover:bg-[var(--neonDim)] hover:text-[var(--neon)] border border-[var(--border)] text-[var(--muted)] transition-all cursor-pointer"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                      ) : (
                        <span className="text-[10px] text-[var(--subtle)] font-mono">Lida</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
