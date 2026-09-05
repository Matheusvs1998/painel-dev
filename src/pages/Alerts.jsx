import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApiStatus } from '../lib/api';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, AlertOctagon, CheckCircle2, ShieldCheck, 
  BellOff, RefreshCw, Activity, ArrowUpRight 
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';
import { toast } from 'sonner';

const C = {
  card: 'var(--card)',
  border: 'var(--border)',
  neon: 'var(--neon)',
  neonDim: 'var(--neonDim)',
  red: '#ef4444',
  yellow: '#f59e0b',
  blue: '#3b82f6',
  muted: 'var(--muted)',
  subtle: 'var(--subtle)'
};

const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem' };

export default function Alerts() {
  const { data: statusData } = useQuery({
    queryKey: ['status'],
    queryFn: fetchApiStatus,
    refetchInterval: 5000
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      title: 'Latência de Rede Acima da Média',
      source: 'Express REST API',
      severity: 'warning',
      timestamp: 'Há 5 minutos',
      status: 'active',
      desc: 'Tempo de resposta de requisições excedeu temporariamente 120ms na rota /api/status.'
    },
    {
      id: 2,
      title: 'Webhook HMAC Secret Não Definido',
      source: 'GitHub Webhook Engine',
      severity: 'info',
      timestamp: 'Há 1 hora',
      status: 'active',
      desc: 'GITHUB_WEBHOOK_SECRET está operando em modo aberto sem validação de assinatura.'
    },
    {
      id: 3,
      title: 'Sincronização de Banco de Dados Restabelecida',
      source: 'Supabase PostgreSQL',
      severity: 'resolved',
      timestamp: 'Há 3 horas',
      status: 'resolved',
      desc: 'Conexão restabelecida com sucesso. Todos os eventos foram salvos.'
    }
  ]);

  const resolveAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
    toast.success('Alerta marcado como resolvido!');
  };

  const isApiOnline = statusData?.status === 'online';
  const activeAlerts = alerts.filter(a => a.status === 'active');

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <SectionHeader 
        title="Central de Alertas & Incidentes" 
        subtitle="Monitoramento de integridade, falhas e alertas de segurança" 
      />

      {/* Cards de Status e SLA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Alertas Ativos" 
          value={activeAlerts.length} 
          trendLabel={activeAlerts.length === 0 ? 'Nenhum incidente crítico' : 'Requer atenção'} 
          positive={activeAlerts.length === 0} 
        />
        <StatCard 
          label="Uptime Geral" 
          value="99.98%" 
          trendLabel="Últimos 30 dias" 
          positive={true} 
        />
        <StatCard 
          label="Status da API" 
          value={isApiOnline ? 'Operacional' : 'Offline'} 
          trendLabel={statusData?.pingMs ? `${statusData.pingMs}ms de resposta` : 'Indisponível'} 
          positive={isApiOnline} 
        />
        <StatCard 
          label="Vulnerabilidades" 
          value="0" 
          trendLabel="Supabase RLS Ativo" 
          positive={true} 
        />
      </div>

      {/* Lista de Alertas */}
      <div style={card} className="overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--hover)]/40">
          <div className="flex items-center gap-2">
            <Activity size={17} className="text-[var(--neon)]" />
            <h3 className="text-sm font-semibold m-0 text-[var(--text)]">Incidentes & Alertas Registrados</h3>
          </div>
          <span className="text-xs text-[var(--muted)] font-mono">{alerts.length} registros no log</span>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {alerts.map((al) => {
            const isResolved = al.status === 'resolved';
            const isWarning = al.severity === 'warning';
            const isCritical = al.severity === 'critical';

            const badgeBg = isResolved 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : isCritical 
                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                : isWarning 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                  : 'bg-teal-500/10 text-teal-400 border-teal-500/20';

            return (
              <div 
                key={al.id} 
                className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-[var(--hover)] ${
                  isResolved ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${badgeBg}`}>
                    {isResolved ? (
                      <CheckCircle2 size={18} />
                    ) : isCritical ? (
                      <AlertOctagon size={18} />
                    ) : (
                      <AlertTriangle size={18} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                      <h4 className="text-sm font-semibold m-0 text-[var(--text)]">{al.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold border ${badgeBg}`}>
                        {isResolved ? 'Resolvido' : al.severity}
                      </span>
                      <span className="text-xs text-[var(--subtle)] font-mono">· {al.source}</span>
                    </div>
                    <p className="text-xs text-[var(--muted)] m-0 leading-relaxed max-w-2xl">
                      {al.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <span className="text-xs text-[var(--subtle)] font-mono">{al.timestamp}</span>
                  {!isResolved && (
                    <button
                      onClick={() => resolveAlert(al.id)}
                      className="px-3 py-1.5 bg-[var(--card)] hover:bg-[var(--neonDim)] hover:text-[var(--neon)] border border-[var(--border)] text-xs font-semibold rounded-lg transition-all cursor-pointer text-[var(--text)]"
                    >
                      Resolver
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
