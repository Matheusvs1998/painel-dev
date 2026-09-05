import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchApiStatus, fetchGithubEvents } from '../lib/api';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GitBranch as Github, Database, Activity, Server, Clock, CheckCircle2, Calendar, Filter, Search } from 'lucide-react';
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
  purple: '#c084fc',
  hover: 'var(--hover)'
};

const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem' };
const TOOLTIP_STYLE = { backgroundColor: C.card, borderColor: C.border, borderRadius: '8px', fontSize: 12, color: '#fff' };

import { useOutletContext } from 'react-router-dom';

export default function Overview() {
  const { session } = useOutletContext() || {};
  const userId = session?.user?.id || '';
  const currentAuthor = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || '';

  const { t } = useTranslation();
  const [period, setPeriod] = useState('all'); // '24h' | '7d' | '30d' | 'all'
  const [selectedRepo, setSelectedRepo] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const connectedRepo = session?.user?.user_metadata?.github_repo || '';

  const { data: statusData } = useQuery({
    queryKey: ['status'],
    queryFn: fetchApiStatus,
    refetchInterval: 5000
  });

  const { data: githubEvents = [] } = useQuery({
    queryKey: ['githubEvents', userId, connectedRepo],
    queryFn: () => fetchGithubEvents({ userId, sender: currentAuthor, repo: connectedRepo }),
    refetchInterval: 5000
  });

  const status = statusData?.status === 'online' ? t('header.online') : t('header.offline');
  const pingMs = statusData?.pingMs;

  // Lista de repositórios únicos presentes nos eventos
  const uniqueReposList = useMemo(() => {
    const set = new Set();
    githubEvents.forEach(e => {
      if (e.repo) set.add(e.repo);
    });
    return Array.from(set);
  }, [githubEvents]);

  // Filtragem dos eventos baseada no período, repositório e busca
  const filteredEvents = useMemo(() => {
    const now = Date.now();
    return githubEvents.filter(ev => {
      const evTime = new Date(ev.timestamp).getTime();

      // Filtro de período
      if (period === '24h' && now - evTime > 24 * 60 * 60 * 1000) return false;
      if (period === '7d' && now - evTime > 7 * 24 * 60 * 60 * 1000) return false;
      if (period === '30d' && now - evTime > 30 * 24 * 60 * 60 * 1000) return false;

      // Filtro de repositório
      if (selectedRepo !== 'all' && ev.repo !== selectedRepo) return false;

      // Filtro de busca
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchRepo = ev.repo?.toLowerCase().includes(q);
        const matchSender = ev.sender?.toLowerCase().includes(q);
        const matchEvent = ev.event?.toLowerCase().includes(q);
        const matchAction = ev.action?.toLowerCase().includes(q);
        if (!matchRepo && !matchSender && !matchEvent && !matchAction) return false;
      }

      return true;
    });
  }, [githubEvents, period, selectedRepo, searchTerm]);

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
  filteredEvents.forEach(ev => {
    let dayIndex = new Date(ev.timestamp).getDay() - 1;
    if (dayIndex === -1) dayIndex = 6;
    if (chartData[dayIndex]) chartData[dayIndex].events += 1;
  });

  // Agrupamento por tipos de eventos para o gráfico de pizza
  const eventTypesCount = {};
  filteredEvents.forEach(ev => {
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

  const activeReposCount = new Set(filteredEvents.map(e => e.repo)).size;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SectionHeader 
          title={t('nav.overview', 'Visão Geral')} 
          subtitle={t('dashboard.overviewSubtitle', 'Painel de métricas, eventos e integridade dos serviços')} 
        />
      </div>

      {/* BARRA DE FILTROS DE PERÍODO & REPOSITÓRIO */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0 pr-2">
          <Calendar size={15} className="text-[var(--neon)] ml-1 shrink-0" />
          <span className="text-[11px] font-semibold text-[var(--subtle)] uppercase tracking-wider mr-1 shrink-0">
            Período:
          </span>
          {[
            { id: '24h', label: '24 Horas', short: '24h' },
            { id: '7d', label: '7 Dias', short: '7d' },
            { id: '30d', label: '30 Dias', short: '30d' },
            { id: 'all', label: 'Todo o Histórico', short: 'Todos' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                period === p.id
                  ? 'bg-[var(--neon)] text-[var(--bg)] shadow-[0_0_12px_var(--neonDim)]'
                  : 'bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <span className="hidden sm:inline">{p.label}</span>
              <span className="sm:hidden">{p.short}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Seletor de Repositório */}
          <div className="flex items-center gap-1.5 flex-1 md:flex-initial">
            <Filter size={14} className="text-[var(--subtle)] shrink-0" />
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="bg-[#0b0f17] border border-[var(--border)] text-xs text-[var(--neon)] py-1.5 px-3 rounded-xl outline-none cursor-pointer w-full md:w-auto font-mono focus:border-[var(--neon)] shadow-sm [&>option]:bg-[#0f172a] [&>option]:text-[#f8fafc]"
            >
              <option value="all">Todos os Repositórios ({uniqueReposList.length})</option>
              {uniqueReposList.map((r, idx) => (
                <option key={`repo-${r}-${idx}`} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Busca Rápida Local */}
          <div className="relative flex-1 md:w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--subtle)]" />
            <input
              type="text"
              placeholder="Filtrar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--neon)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[var(--text)] outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Cards de Métricas (Dinamizados pelo filtro) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label={t('dashboard.githubEvents', 'Eventos GitHub')} 
          value={filteredEvents.length} 
          trendLabel={period === 'all' ? 'Total acumulado' : `Filtrado (${period})`} 
          positive={true}
        />
        <StatCard 
          label="Repositórios Ativos" 
          value={activeReposCount} 
          trendLabel="Monitorados via Webhook" 
          positive={activeReposCount > 0}
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
        {/* Gráfico de Atividade */}
        <div style={{ ...card, padding: '1.25rem' }} className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider m-0">
              {t('dashboard.eventsPerDay', 'Fluxo de Eventos por Dia')} {period !== 'all' ? `(${period})` : ''}
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
              Tipos de Eventos {period !== 'all' ? `(${period})` : ''}
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
                <span className="text-lg font-bold text-[var(--text)]">{filteredEvents.length}</span>
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

      {/* Tabela de Atividades Recentes (Filtrada) */}
      <div style={card} className="overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Github size={18} className="text-[var(--neon)]" />
            <h3 className="text-sm font-semibold m-0 text-[var(--text)]">Eventos Filtrados</h3>
          </div>
          <span className="text-xs text-[var(--muted)]">{filteredEvents.length} de {githubEvents.length} eventos</span>
        </div>
        
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--muted)]">
            Nenhum evento corresponde aos filtros selecionados.
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
                {filteredEvents.slice(0, 8).map((ev) => (
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
                      {new Date(ev.timestamp).toLocaleString('pt-BR')}
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
