import React from 'react';
import { GitBranch as Github, MessageSquare, Server } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { motion } from 'framer-motion';

const C = { card: 'var(--card)', border: 'var(--border)' };
const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem' };

const MOCK_CONTACTS = [
  { name: 'GitHub Webhook Bot', type: 'Bot', status: 'active', events: 156 },
  { name: 'WhatsApp Assistant', type: 'Agente', status: 'connected', events: 34 },
  { name: 'Supabase Sync', type: 'Serviço', status: 'active', events: 890 }
];

export default function Contacts() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <SectionHeader title="Contatos" subtitle="Integrações e agentes conectados" />
      <div style={card}>
        {MOCK_CONTACTS.map((c, i) => {
          const ok = c.status === 'active' || c.status === 'connected';
          return (
            <div key={i} className="flex items-center gap-4 p-5 border-b border-[var(--border)] last:border-b-0">
              <div className="w-10 h-10 rounded-full bg-[var(--neonDim)] flex items-center justify-center text-[var(--neon)]">
                {c.type === 'Bot' ? <Github size={18} /> : c.type === 'Agente' ? <MessageSquare size={18} /> : <Server size={18} />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium m-0">{c.name}</p>
                <p className="text-xs text-[var(--muted)] m-0">{c.type}</p>
              </div>
              <div className="text-right">
                <span className={`text-[0.7rem] px-2 py-1 rounded-full ${ok ? 'bg-[var(--neonDim)] text-[var(--neon)]' : 'bg-[var(--border)] text-[var(--muted)]'}`}>
                  {c.status === 'active' ? 'Ativo' : c.status === 'connected' ? 'Conectado' : c.status}
                </span>
                <p className="text-[0.7rem] text-[var(--subtle)] m-0 mt-1">{c.events} eventos</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}