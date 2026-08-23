import React from 'react';
import SectionHeader from '../components/SectionHeader';
import { motion } from 'framer-motion';

const MOCK_ENDPOINTS = [
  { method: 'GET', path: '/api/status', desc: 'Verifica status da API', code: 200 },
  { method: 'GET', path: '/api/whatsapp/messages', desc: 'Histórico', code: 200 },
  { method: 'POST', path: '/api/whatsapp/send', desc: 'Envia mensagem', code: 200 },
  { method: 'POST', path: '/api/webhooks/github', desc: 'Recebe payloads', code: 200 },
  { method: 'GET', path: '/api/webhooks/github/events', desc: 'Retorna eventos', code: 200 }
];

export default function Endpoints() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <SectionHeader title="Endpoints" subtitle="Todos os endpoints disponíveis na API" />
      <div className="glass-panel overflow-x-auto">
        <div className="min-w-[500px] grid grid-cols-[100px_1fr_1fr_80px] gap-4 p-4 text-[0.65rem] text-[var(--subtle)] uppercase tracking-widest border-b border-[var(--border)]">
          <span>Método</span><span>Path</span><span>Descrição</span><span>Status</span>
        </div>
        {MOCK_ENDPOINTS.map((ep, i) => (
          <div key={i} className="min-w-[500px] grid grid-cols-[100px_1fr_1fr_80px] gap-4 p-4 items-center border-b border-[var(--border)] last:border-b-0">
            <span className={`text-[0.7rem] font-mono font-bold px-2 py-1 rounded w-fit ${ep.method === 'GET' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{ep.method}</span>
            <span className="font-mono text-sm">{ep.path}</span>
            <span className="text-sm text-[var(--muted)]">{ep.desc}</span>
            <span className="flex items-center gap-1.5 text-[0.75rem] text-[var(--neon)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)]"></span>{ep.code}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}