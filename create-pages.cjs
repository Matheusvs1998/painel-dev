const fs = require('fs');
const path = require('path');

const pages = [
  {
    name: 'Services',
    content: `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Server } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { motion } from 'framer-motion';

const C = { card: 'var(--card)', border: 'var(--border)', neon: 'var(--neon)', red: 'var(--red)', subtle: 'var(--subtle)', muted: 'var(--muted)' };
const card = { background: C.card, border: \`1px solid \${C.border}\`, borderRadius: '1rem' };

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
          { name: 'Express Backend', st: status, detail: \`Porta 3001 · \${pingMs || '?'}ms\` },
          { name: 'Supabase DB', st: 'Online', detail: \`\${githubEvents.length} registros\` },
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
                  <span className={\`w-2 h-2 rounded-full \${ok ? 'bg-[var(--neon)]' : 'bg-red-500'}\`}></span>
                  <Server size={16} style={{ color: C.subtle }} />
                </div>
                <p className="text-sm font-medium m-0 mb-1">{svc.name}</p>
                <p className="text-xs text-[var(--muted)] m-0 mb-2">{svc.detail}</p>
                <p className={\`text-xs font-medium m-0 \${ok ? 'text-[var(--neon)]' : 'text-red-500'}\`}>{svc.st}</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}`
  },
  {
    name: 'Contacts',
    content: `import React from 'react';
import { GitBranch as Github, MessageSquare, Server } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { motion } from 'framer-motion';

const C = { card: 'var(--card)', border: 'var(--border)' };
const card = { background: C.card, border: \`1px solid \${C.border}\`, borderRadius: '1rem' };

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
                <span className={\`text-[0.7rem] px-2 py-1 rounded-full \${ok ? 'bg-[var(--neonDim)] text-[var(--neon)]' : 'bg-[var(--border)] text-[var(--muted)]'}\`}>
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
}`
  },
  {
    name: 'Endpoints',
    content: `import React from 'react';
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
            <span className={\`text-[0.7rem] font-mono font-bold px-2 py-1 rounded w-fit \${ep.method === 'GET' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'}\`}>{ep.method}</span>
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
}`
  },
  {
    name: 'Placeholder',
    content: `import React from 'react';
import SectionHeader from '../components/SectionHeader';
import { motion } from 'framer-motion';

export default function Placeholder({ title, subtitle }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="p-8 border border-dashed border-[var(--border)] rounded-xl text-center text-[var(--muted)]">
        Página em construção.
      </div>
    </motion.div>
  );
}`
  }
];

const targetDir = path.join(__dirname, 'src', 'pages');

pages.forEach(p => {
  fs.writeFileSync(path.join(targetDir, p.name + '.jsx'), p.content);
});

console.log('Pages created successfully.');
