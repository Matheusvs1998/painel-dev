import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Globe, GitBranch as GithubIcon } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { motion } from 'framer-motion';

const C = { bg: 'var(--bg)', border: 'var(--border)', card: 'var(--card)', neon: 'var(--neon)', neonBorder: 'var(--neonBorder)', subtle: 'var(--subtle)', muted: 'var(--muted)' };
const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem' };

export default function Github() {
  const { data: githubEvents = [] } = useQuery({ queryKey: ['githubEvents'], queryFn: async () => { const res = await fetch('http://localhost:3001/api/webhooks/github/events'); return res.json(); }, refetchInterval: 5000 });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <SectionHeader title="GitHub Webhooks" subtitle={`${githubEvents.length} eventos recebidos e salvos no Supabase`} />
      
      <div style={{ ...card, padding: '1.25rem', borderColor: C.neonBorder }}>
        <p className="text-sm font-medium m-0 mb-1">URL do Webhook</p>
        <p className="text-xs text-[var(--muted)] m-0 mb-3">Adicione no Settings → Webhooks do repositório GitHub:</p>
        <div className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)] font-mono text-[var(--neon)] flex items-center gap-3 text-sm overflow-x-auto">
          <Globe size={16} className="shrink-0" /> https://vdugwerpiuisyiwwkggg.supabase.co/functions/v1/github-webhook
        </div>
      </div>

      <div className="glass-panel overflow-x-auto">
        <div className="min-w-[600px] grid grid-cols-5 gap-4 p-4 text-[0.65rem] text-[var(--subtle)] uppercase tracking-widest border-b border-[var(--border)]">
          <span>Evento</span><span>Ação</span><span>Repositório</span><span>Autor</span><span>Horário</span>
        </div>
        
        {githubEvents.length === 0 ? (
          <div className="text-center text-[var(--subtle)] p-12 flex flex-col items-center gap-3">
            <GithubIcon size={32} className="opacity-30" />
            <p className="m-0">Nenhum evento recebido ainda.</p>
          </div>
        ) : githubEvents.map(ev => (
          <div key={ev.id} className="min-w-[600px] grid grid-cols-5 gap-4 p-4 items-center border-b border-[var(--border)]">
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)] shrink-0"></span>{ev.event}
            </span>
            <span className="text-sm text-[var(--muted)]">{ev.action || '—'}</span>
            <span className="text-sm text-[var(--muted)] overflow-hidden text-ellipsis whitespace-nowrap">{ev.repo}</span>
            <span className="text-sm text-[var(--muted)]">{ev.sender}</span>
            <span className="text-xs text-[var(--subtle)]">{new Date(ev.timestamp).toLocaleString('pt-BR')}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
