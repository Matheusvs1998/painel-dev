import React from 'react';
import { GitBranch as Github, Cpu, Server, ShieldCheck } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { motion } from 'framer-motion';

const C = { card: 'var(--card)', border: 'var(--border)' };
const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem' };

const INTEGRATION_AGENTS = [
  { name: 'GitHub Webhook Listener', type: 'Ingestão de Eventos', status: 'active', desc: 'Processa push, PRs, issues e releases', icon: Github },
  { name: 'Supabase Realtime Sync', type: 'Database Service', status: 'active', desc: 'Sincronização instantânea PostgreSQL', icon: Server },
  { name: 'CI/CD Pipeline Monitor', type: 'DevOps Bot', status: 'active', desc: 'Monitoramento de builds e deploys', icon: Cpu },
  { name: 'Auth & Security Guard', type: 'Segurança', status: 'active', desc: 'Gestão de sessões e tokens JWT', icon: ShieldCheck }
];

export default function Contacts() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <SectionHeader title="Agentes & Integrações" subtitle="Serviços, bots e integradores ativos no ecossistema" />
      <div style={card} className="overflow-hidden">
        {INTEGRATION_AGENTS.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="flex items-center gap-4 p-5 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--hover)] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[var(--neonDim)] flex items-center justify-center text-[var(--neon)] shrink-0">
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold m-0 text-[var(--text)]">{c.name}</p>
                <p className="text-xs text-[var(--muted)] m-0">{c.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[0.7rem] px-2.5 py-1 rounded-full font-medium bg-[var(--neonDim)] text-[var(--neon)]">
                  {c.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}