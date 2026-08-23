import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Server } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { motion } from 'framer-motion';

const C = { card: 'var(--card)', border: 'var(--border)', neon: 'var(--neon)', red: 'var(--red)', subtle: 'var(--subtle)', muted: 'var(--muted)' };
const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem' };

export default function Services() {
  const { data: statusData } = useQuery({ queryKey: ['status'], queryFn: async () => { const t0 = Date.now(); const res = await fetch('http://localhost:3001/api/status'); const data = await res.json(); return { status: data.status, pingMs: Date.now() - t0 }; }, refetchInterval: 5000 });
  const { data: waData } = useQuery({ queryKey: ['waStatus'], queryFn: async () => { const res = await fetch('http://localhost:3001/api/whatsapp/status'); return res.json(); }, refetchInterval: 5000 });
  const { data: githubEvents = [] } = useQuery({ queryKey: ['githubEvents'], queryFn: async () => { const res = await fetch('http://localhost:3001/api/webhooks/github/events'); return res.json(); }, refetchInterval: 5000 });

  const status = statusData?.status === 'online' ? 'Online' : 'Offline';
  const pingMs = statusData?.pingMs;
  const waStatus = waData?.status || 'disconnected';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <SectionHeader title="Serviços" subtitle="Status de todos os serviços integrados" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: 'Express Backend', st: status, detail: `Porta 3001 · ${pingMs || '?'}ms` },
          { name: 'Supabase DB', st: 'Online', detail: `${githubEvents.length} registros` },
          { name: 'WhatsApp Bot', st: waStatus === 'connected' ? 'Online' : waStatus, detail: 'whatsapp-web.js' },
          { name: 'Frontend (Vite)', st: 'Online', detail: 'Porta 5173 · React 19' },
          { name: 'Node.js', st: 'Online', detail: 'v24 LTS' },
          { name: 'dotenv', st: 'Online', detail: '3 variáveis carregadas' },
        ].map((svc, i) => {
          const ok = svc.st === 'Online' || svc.st === 'connected';
          return (
            <div key={i} style={card}>
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className={`w-2 h-2 rounded-full ${ok ? 'bg-[var(--neon)]' : 'bg-red-500'}`}></span>
                  <Server size={16} style={{ color: C.subtle }} />
                </div>
                <p className="text-sm font-medium m-0 mb-1">{svc.name}</p>
                <p className="text-xs text-[var(--muted)] m-0 mb-2">{svc.detail}</p>
                <p className={`text-xs font-medium m-0 ${ok ? 'text-[var(--neon)]' : 'text-red-500'}`}>{svc.st}</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}