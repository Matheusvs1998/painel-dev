import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchApiStatus, fetchGithubEvents } from '../lib/api';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GitBranch as Github, Database, Activity, Server, Clock, CheckCircle2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import { motion } from 'framer-motion';

const C = {
  neon: 'var(--neon)',
  neonDim: 'var(--neonDim)',
  subtle: 'var(--subtle)',
  muted: 'var(--muted)',
  card: 'var(--card)',
  border: 'var(--border)',
  text: 'var(--text)',
  yellow: '#facc15',
  red: 'var(--red)',
  blue: '#60a5fa',
  purple: '#c084fc'
};

const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem' };
const TOOLTIP_STYLE = { backgroundColor: C.card, borderColor: C.border, borderRadius: '8px', fontSize: 12, color: '#fff' };

export default function Overview() {
  const { t } = useTranslation();

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

  const status = statusData?.status === 'online' ? t('header.online') : t('header.offline');
  const pingMs = statusData?.pingMs;

  // Dias da semana para o gráfico de área
  const daysLabels = [
    t('dashboard.days.mon', 'Seg'),
    t('dashboard.days.tue', 'Ter'),
    t('dashboard.days.wed', 'Qua'),
    t('dashboard.days.thu', 'Qui'),
    t('dashboard.days.fri', 'Sex'),
    t('dashboard.days.sat', 'Sáb'),
    t('dashboard.days.sun', 'Dom')
  ];
  
  const chartData = daysLabels.map(name => ({ name, events: 0 }));
  githubEvents.forEach(ev => {
    let dayIndex = new Date(ev.timestamp).getDay() - 1;
    if (dayIndex === -1) dayIndex = 6;
    if (chartData[dayIndex]) chartData[dayIndex].events += 1;
  });

  // Agrupamento por tipos de eventos para o gráfico de pizza
  const eventTypesCount = {};
  githubEvents.forEach(ev => {
    const type = ev.event || 'push';
    eventTypesCount[type] = (eventTypesCount[type] || 0) + 1;
  });

  const pieColors = [C.neon, C.blue, C.purple, C.yellow, '#fb923c'];
  const pieData = Object.keys(eventTypesCount).length > 0 
    ? Object.keys(eventTypesCount).map((key, i) => ({
        name: key,
        value: eventTypesCount[key],
        color: pieColors[i % pieColors.length]
      }))
    : [{ name: 'Sem dados', value: 1, color: 'rgba(255,255,255,0.1)' }];

  // Contagem de repositórios distintos
  const uniqueRepos = new Set(githubEvents.map(e => e.repo)).size;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <SectionHeader title={t('nav.overview', 'Visão Geral')} subtitle={t('dashboard.overviewSubtitle', 'Painel de métricas, eventos e integridade dos serviços')} />

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label={t('dashboard.githubEvents', 'Eventos GitHub')} 
          value={githubEvents.length} 
          trendLabel={t('dashboard.thisWeek', 'Total acumulado')} 
          positive={true}
        />
        <StatCard 
          label="Repositórios Ativos" 
          value={uniqueRepos} 
          trendLabel="Monitorados via Webhook" 
          positive={uniqueRepos > 0}
        />
        <StatCard 
          label={t('header.backendStatus', 'API Backend')} 
          value={status} 
          trendLabel={status === t('header.online') ? 'Porta 3001 Ativa' : 'Offline'} 
          positive={status === t('header.online')} 
        />
        <StatCard 
          label="Latência (Ping)" 
          value={pingMs ? `${pingMs} ms` : '—'} 
          trendLabel="Resposta da API" 
          positive={pingMs ? pingMs < 100 : true}
        />
      </div>

      {/* Gráficos Principais */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[300px]">
        {/* Gráfico de Atividade Semanal */}
        <div style={{ ...card, padding: '1.25rem' }} className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider m-0">
              {t('dashboard.eventsPerDay', 'Fluxo de Eventos por Dia')}
            </p>
            <span className="text-xs text-[var(--neon)] font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--neon)] animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.neon} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={C.neon} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#233030" vertical={false} />
                <XAxis dataKey="name" stroke={C.subtle} tick={{ fill: C.subtle, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke={C.subtle} tick={{ fill: C.subtle, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="events" stroke={C.neon} strokeWidth={2} fill="url(#gEvents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição de Eventos & Status do Banco */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4">
          <div style={{ ...card, padding: '1.25rem' }} className="flex-1 flex flex-col items-center justify-center">
            <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider mb-2 self-start">
              Tipos de Eventos
            </p>
            <div className="relative w-28 h-28 my-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={50} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-lg font-bold text-[var(--text)]">{githubEvents.length}</span>
                <span className="text-[10px] text-[var(--subtle)] uppercase">Total</span>
              </div>
            </div>
            <div className="w-full flex flex-wrap gap-2 justify-center mt-2">
              {pieData.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1 text-[11px] text-[var(--muted)]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...card, padding: '1.25rem' }} className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider mb-1 m-0">
                {t('dashboard.dbStatus', 'Supabase Database')}
              </p>
              <p className="text-sm font-semibold text-[var(--neon)] m-0 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Conectado & Operacional
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--neonDim)] flex items-center justify-center text-[var(--neon)]">
              <Database size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Atividades Recentes */}
      <div style={card} className="overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Github size={18} className="text-[var(--neon)]" />
            <h3 className="text-sm font-semibold m-0 text-[var(--text)]">Últimos Eventos Recebidos</h3>
          </div>
          <span className="text-xs text-[var(--muted)]">{githubEvents.length} eventos registrados</span>
        </div>
        
        {githubEvents.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--muted)]">
            Nenhum evento registrado ainda. Envie um webhook do GitHub para visualizar aqui.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--hover)] text-[var(--subtle)] uppercase tracking-wider border-b border-[var(--border)]">
                <tr>
                  <th className="p-3 pl-4">Evento</th>
                  <th className="p-3">Ação</th>
                  <th className="p-3">Repositório</th>
                  <th className="p-3">Autor</th>
                  <th className="p-3 pr-4 text-right">Horário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {githubEvents.slice(0, 5).map((ev) => (
                  <tr key={ev.id} className="hover:bg-[var(--hover)] transition-colors">
                    <td className="p-3 pl-4 font-semibold text-[var(--neon)]">
                      <span className="inline-block px-2 py-0.5 rounded bg-[var(--neonDim)]">
                        {ev.event}
                      </span>
                    </td>
                    <td className="p-3 text-[var(--muted)]">{ev.action || '—'}</td>
                    <td className="p-3 font-mono text-[var(--text)]">{ev.repo}</td>
                    <td className="p-3 text-[var(--muted)]">{ev.sender}</td>
                    <td className="p-3 pr-4 text-right text-[var(--subtle)]">
                      {new Date(ev.timestamp).toLocaleTimeString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
