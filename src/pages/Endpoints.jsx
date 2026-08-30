import React from 'react';
import SectionHeader from '../components/SectionHeader';
import { motion } from 'framer-motion';

const ENDPOINTS = [
  { method: 'GET', path: '/api/status', desc: 'Verifica integridade, uptime e latência da API', code: 200 },
  { method: 'GET', path: '/api/webhooks/github/events', desc: 'Retorna últimos 50 eventos do GitHub salvos no Supabase', code: 200 },
  { method: 'POST', path: '/api/webhooks/github', desc: 'Recebe payloads de Webhooks do GitHub com assinatura HMAC-SHA256', code: 200 },
  { method: 'POST', path: 'https://vdugwerpiuisyiwwkggg.supabase.co/functions/v1/github-webhook', desc: 'Edge Function direta do Supabase para ingestão de eventos GitHub', code: 200 }
];

export default function Endpoints() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <SectionHeader title="Endpoints & APIs" subtitle="Documentação dos endpoints REST e Edge Functions ativas" />
      <div className="glass-panel overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <div className="min-w-[650px] grid grid-cols-[100px_1.5fr_1.5fr_90px] gap-4 p-4 text-[0.65rem] text-[var(--subtle)] uppercase tracking-widest border-b border-[var(--border)] font-semibold">
          <span>Método</span><span>Endpoint / Path</span><span>Descrição</span><span>Status</span>
        </div>
        {ENDPOINTS.map((ep, i) => (
          <div key={i} className="min-w-[650px] grid grid-cols-[100px_1.5fr_1.5fr_90px] gap-4 p-4 items-center border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--hover)] transition-colors">
            <span className={`text-[0.7rem] font-mono font-bold px-2 py-1 rounded w-fit ${ep.method === 'GET' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-[var(--neon)]'}`}>
              {ep.method}
            </span>
            <span className="font-mono text-xs text-[var(--text)] truncate" title={ep.path}>{ep.path}</span>
            <span className="text-xs text-[var(--muted)]">{ep.desc}</span>
            <span className="flex items-center gap-1.5 text-[0.75rem] text-[var(--neon)] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)]"></span>{ep.code} OK
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}