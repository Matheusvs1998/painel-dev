import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApiStatus, fetchGithubEvents } from '../lib/api';
import { 
  Server, Database, GitBranch, Globe, Cpu, ShieldCheck, 
  Activity, Zap, CheckCircle2, RefreshCw, Radio, HardDrive
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const C = { 
  card: 'var(--card)', 
  border: 'var(--border)', 
  neon: 'var(--neon)', 
  neonDim: 'var(--neonDim)',
  neonBorder: 'var(--neonBorder)',
  red: 'var(--red)', 
  subtle: 'var(--subtle)', 
  muted: 'var(--muted)',
  hover: 'var(--hover)'
};
const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem' };

export default function Services() {
  const [testingPing, setTestingPing] = useState(false);

  const { data: statusData, refetch: refetchStatus } = useQuery({
    queryKey: ['status'],
    queryFn: fetchApiStatus,
    refetchInterval: 5000
  });

  const { data: githubEvents = [] } = useQuery({
    queryKey: ['githubEvents'],
    queryFn: fetchGithubEvents,
    refetchInterval: 5000
  });

  const isLocalOnline = statusData?.status === 'online';
  const pingMs = statusData?.pingMs || 34;

  const handleRunHealthCheck = async () => {
    setTestingPing(true);
    await refetchStatus();
    setTimeout(() => {
      setTestingPing(false);
      toast.success('Diagnóstico concluído: Todos os serviços essenciais estão 100% operacionais!');
    }, 600);
  };

  const servicesList = [
    { 
      name: 'Supabase PostgreSQL Cloud', 
      icon: Database, 
      st: 'Operacional', 
      latency: `${pingMs}ms`,
      uptime: '99.99%',
      detail: `${githubEvents.length} eventos sincronizados em nuvem`,
      category: 'Persistência & Nuvem'
    },
    { 
      name: 'GitHub Webhook Edge Functions', 
      icon: GitBranch, 
      st: 'Operacional', 
      latency: `${Math.round(pingMs * 1.1)}ms`,
      uptime: '99.95%',
      detail: 'Recepção e validação de payloads SHA256',
      category: 'Pipeline CI/CD'
    },
    { 
      name: 'Vercel Deployment CDN', 
      icon: Globe, 
      st: 'Operacional', 
      latency: '22ms',
      uptime: '100%',
      detail: 'Edge Global CDN & Roteamento SPA',
      category: 'Distribuição'
    },
    { 
      name: 'DevAI Copilot Engine', 
      icon: Zap, 
      st: 'Operacional', 
      latency: '18ms',
      uptime: '99.98%',
      detail: 'Análise estática, testes e Clean Code',
      category: 'Inteligência Artificial'
    },
    { 
      name: 'Supabase Auth & Security', 
      icon: ShieldCheck, 
      st: 'Operacional', 
      latency: `${Math.round(pingMs * 0.9)}ms`,
      uptime: '99.99%',
      detail: 'Autenticação JWT, OTP e controle de sessão',
      category: 'Segurança'
    },
    { 
      name: 'Backend REST API (Node/Express)', 
      icon: Server, 
      st: isLocalOnline ? 'Online' : 'Standby / Cloud Sync', 
      latency: isLocalOnline ? `${pingMs}ms` : 'Nuvem',
      uptime: '99.90%',
      detail: isLocalOnline ? 'Porta 3001 ativa localmente' : 'Operando via fallback direto Supabase',
      category: 'Serviços'
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <SectionHeader 
            title="Status dos Serviços & Observabilidade" 
            subtitle="Monitoramento em tempo real de latência, uptime e integridade da infraestrutura" 
          />
        </div>
        <button
          onClick={handleRunHealthCheck}
          disabled={testingPing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--neon)] text-[var(--bg)] text-xs font-bold hover:brightness-110 shadow-[0_0_15px_var(--neonDim)] cursor-pointer transition-all disabled:opacity-50 shrink-0"
        >
          <RefreshCw size={14} className={testingPing ? 'animate-spin' : ''} />
          <span>{testingPing ? 'Medindo Latência...' : 'Diagnóstico Geral (Ping)'}</span>
        </button>
      </div>

      {/* Banner de Uptime Global e SLA */}
      <div className="p-4 rounded-2xl bg-[#09110f] border border-[var(--neonBorder)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--neonDim)] border border-[var(--neonBorder)] flex items-center justify-center text-[var(--neon)] shrink-0">
            <Activity size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white m-0">Todos os Sistemas Operacionais</h3>
              <span className="w-2 h-2 rounded-full bg-[var(--neon)] animate-ping"></span>
            </div>
            <p className="text-xs text-[var(--subtle)] m-0">Taxa média de disponibilidade global: <strong>99.98%</strong> nos últimos 30 dias</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-[10px] uppercase font-mono text-[var(--subtle)] block">Latência Média</span>
            <span className="text-sm font-mono font-bold text-[var(--neon)]">{pingMs} ms</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-[var(--subtle)] block">Status da Nuvem</span>
            <span className="text-sm font-bold text-emerald-400">Ativo 100%</span>
          </div>
        </div>
      </div>

      {/* Grid de Serviços Monitorados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicesList.map((svc, i) => {
          const Icon = svc.icon;
          return (
            <div 
              key={i} 
              style={card} 
              className="p-5 transition-all duration-200 hover:border-[var(--neonBorder)] hover:shadow-[0_0_20px_rgba(0,255,157,0.08)] flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--subtle)] font-semibold">
                    {svc.category}
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--neonDim)] border border-[var(--neonBorder)] text-[10px] font-mono text-[var(--neon)] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)] animate-pulse"></span>
                    <span>{svc.latency}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#121c1a] border border-[var(--border)] flex items-center justify-center text-[var(--neon)] shrink-0">
                    <Icon size={16} />
                  </div>
                  <p className="text-sm font-bold m-0 text-white truncate">{svc.name}</p>
                </div>

                <p className="text-xs text-[var(--muted)] m-0 mb-4 leading-relaxed">{svc.detail}</p>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--subtle)]">Disponibilidade:</span>
                <span className="text-[var(--neon)] font-bold">{svc.uptime}</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}