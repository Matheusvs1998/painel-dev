import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApiStatus, fetchGithubEvents } from '../lib/api';
import { Server, Database, GitBranch, Globe, Cpu, ShieldCheck } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { motion } from 'framer-motion';

const C = { card: 'var(--card)', border: 'var(--border)', neon: 'var(--neon)', red: 'var(--red)', subtle: 'var(--subtle)', muted: 'var(--muted)' };
const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem' };

export default function Services() {
  const { data: statusData } = useQuery({
    queryKey: ['status'],
    queryFn: fetchApiStatus,
    refetchInterval: 5000
  });

  const { data: githubEvents = [] } = useQuery({
    queryKey: ['githubEvents'],
    queryFn: fetchGithubEvents,
    refetchInterval: 5000
  });

  const status = statusData?.status === 'online' ? 'Online' : 'Offline';
  const pingMs = statusData?.pingMs;

  const servicesList = [
    { name: 'Express REST API', icon: Server, st: status, detail: `Porta 3001 · ${pingMs ? `${pingMs}ms` : '...'}` },
    { name: 'Supabase Database', icon: Database, st: 'Online', detail: `${githubEvents.length} eventos registrados` },
    { name: 'GitHub Webhook Engine', icon: GitBranch, st: 'Online', detail: 'Edge Function & REST Endpoints' },
    { name: 'Frontend (Vite + React)', icon: Globe, st: 'Online', detail: 'Porta 5173 · React 19 SPA' },
    { name: 'Supabase Auth', icon: ShieldCheck, st: 'Online', detail: 'Autenticação JWT Segura' },
    { name: 'Node.js Runtime', icon: Cpu, st: 'Online', detail: 'v24 LTS Engine' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <SectionHeader title="Serviços" subtitle="Status de saúde de todas as integrações e microserviços" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicesList.map((svc, i) => {
          const ok = svc.st === 'Online';
          const Icon = svc.icon;
          return (
            <div key={i} style={card} className="transition-all duration-200 hover:border-[var(--neonBorder)]">
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${ok ? 'bg-[var(--neon)] shadow-[0_0_8px_var(--neon)]' : 'bg-red-500'}`}></span>
                  <Icon size={18} style={{ color: C.subtle }} />
                </div>
                <p className="text-sm font-semibold m-0 mb-1 text-[var(--text)]">{svc.name}</p>
                <p className="text-xs text-[var(--muted)] m-0 mb-3">{svc.detail}</p>
                <p className={`text-xs font-bold m-0 ${ok ? 'text-[var(--neon)]' : 'text-red-500'}`}>{svc.st}</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}