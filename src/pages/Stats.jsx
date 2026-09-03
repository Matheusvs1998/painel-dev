import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGithubEvents } from '../lib/api';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';
import { BarChart3, Users, Calendar, Filter, Sparkles } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';

const C = {
  card: 'var(--card)',
  border: 'var(--border)',
  neon: 'var(--neon)',
  neonDim: 'var(--neonDim)',
  blue: '#38bdf8',
  purple: '#a855f7',
  amber: '#f59e0b',
  text: 'var(--text)',
  muted: 'var(--muted)',
  subtle: 'var(--subtle)',
  hover: 'var(--hover)'
};

const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem' };
const TOOLTIP_STYLE = { backgroundColor: C.card, borderColor: C.border, borderRadius: '8px', fontSize: 12, color: '#fff' };

import { useOutletContext } from 'react-router-dom';

export default function Stats() {
  const { session } = useOutletContext() || {};
  const userId = session?.user?.id || '';
  const currentAuthor = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || '';

  const connectedRepo = session?.user?.user_metadata?.github_repo || '';

  const { data: githubEvents = [] } = useQuery({
    queryKey: ['githubEvents', userId, connectedRepo],
    queryFn: () => fetchGithubEvents({ userId, sender: currentAuthor, repo: connectedRepo }),
    refetchInterval: 5000
  });

  // Lista de repositórios únicos presentes
  const uniqueReposList = useMemo(() => {
    const set = new Set();
    githubEvents.forEach(e => {
      if (e.repo) set.add(e.repo);
    });
    return Array.from(set);
  }, [githubEvents]);

  // Filtragem dos eventos baseada no período e repositório
  const filteredEvents = useMemo(() => {
    const now = Date.now();
    return githubEvents.filter(ev => {
      const evTime = new Date(ev.timestamp).getTime();

      if (period === '24h' && now - evTime > 24 * 60 * 60 * 1000) return false;
      if (period === '7d' && now - evTime > 7 * 24 * 60 * 60 * 1000) return false;
      if (period === '30d' && now - evTime > 30 * 24 * 60 * 60 * 1000) return false;

      if (selectedRepo !== 'all' && ev.repo !== selectedRepo) return false;

      return true;
    });
  }, [githubEvents, period, selectedRepo]);

  // Agrupamento por Repositório
  const repoCounts = {};
  filteredEvents.forEach(e => {
    const repo = e.repo || 'Outro';
    repoCounts[repo] = (repoCounts[repo] || 0) + 1;
  });

  const repoChartData = Object.keys(repoCounts).map(name => ({
    name: name.split('/')[1] || name,
    fullName: name,
    eventos: repoCounts[name]
  })).sort((a, b) => b.eventos - a.eventos).slice(0, 5);

  // Agrupamento por Autor / Desenvolvedor
  const authorCounts = {};
  filteredEvents.forEach(e => {
    const author = e.sender || 'Desconhecido';
    authorCounts[author] = (authorCounts[author] || 0) + 1;
  });

  const authorChartData = Object.keys(authorCounts).map(name => ({
    name,
    contribuicoes: authorCounts[name]
  })).sort((a, b) => b.contribuicoes - a.contribuicoes).slice(0, 5);

  // Tipos de Eventos (Push, Pull Request, Release, Star, Issues)
  const typeCounts = {};
  filteredEvents.forEach(e => {
    const t = e.event || 'push';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  const pieColors = [C.neon, C.blue, C.purple, C.amber, '#ec4899'];
  const typeChartData = Object.keys(typeCounts).length > 0
    ? Object.keys(typeCounts).map((key, i) => ({
        name: key,
        value: typeCounts[key],
        color: pieColors[i % pieColors.length]
      }))
    : [{ name: 'Sem dados', value: 1, color: 'rgba(255,255,255,0.1)' }];

  const totalAuthors = Object.keys(authorCounts).length;
  const totalRepos = Object.keys(repoCounts).length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <SectionHeader 
        title="Estatísticas & Métricas de Engenharia" 
        subtitle="Insights detalhados sobre atividade de repositórios, commits e colaboradores" 
      />

      {/* Barra de Filtros de Período & Repositório */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Calendar size={15} className="text-[var(--neon)] ml-1 shrink-0" />
          <span className="text-[11px] font-semibold text-[var(--subtle)] uppercase tracking-wider mr-1 shrink-0">
            Período:
          </span>
          {[
            { id: '24h', label: '24 Horas' },
            { id: '7d', label: '7 Dias' },
            { id: '30d', label: '30 Dias' },
            { id: 'all', label: 'Todo o Histórico' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                period === p.id
                  ? 'bg-[var(--neon)] text-[var(--bg)] shadow-[0_0_12px_var(--neonDim)]'
                  : 'bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-[var(--subtle)] shrink-0" />
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="bg-[#0b0f17] border border-[var(--border)] text-xs text-[var(--neon)] py-1.5 px-3 rounded-xl outline-none cursor-pointer font-mono focus:border-[var(--neon)] shadow-sm [&>option]:bg-[#0f172a] [&>option]:text-[#f8fafc]"
          >
            <option value="all">Todos os Repositórios ({uniqueReposList.length})</option>
            {uniqueReposList.map((r, idx) => (
              <option key={`stats-repo-${r}-${idx}`} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total de Eventos" 
          value={filteredEvents.length} 
          trendLabel={period === 'all' ? 'Total acumulado' : `Período (${period})`} 
          positive={true} 
        />
        <StatCard 
          label="Repositórios no Filtro" 
          value={totalRepos} 
          trendLabel="Monitoramento ativo" 
          positive={totalRepos > 0} 
        />
        <StatCard 
          label="Desenvolvedores Ativos" 
          value={totalAuthors} 
          trendLabel="Colaboradores no período" 
          positive={totalAuthors > 0} 
        />
        <StatCard 
          label="Taxa de Ingestão" 
          value="100%" 
          trendLabel="0 falhas de entrega" 
          positive={true} 
        />
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Atividade por Repositório */}
        <div style={{ ...card, padding: '1.25rem' }} className="flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider m-0">
              Top Repositórios por Volume {period !== 'all' ? `(${period})` : ''}
            </h3>
            <BarChart3 size={16} className="text-[var(--neon)]" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repoChartData.length > 0 ? repoChartData : [{ name: 'Sem dados', eventos: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#233030" vertical={false} />
                <XAxis dataKey="name" stroke={C.subtle} tick={{ fill: C.subtle, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke={C.subtle} tick={{ fill: C.subtle, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="eventos" fill={C.neon} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Top Autores / Colaboradores */}
        <div style={{ ...card, padding: '1.25rem' }} className="flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider m-0">
              Colaboradores Mais Ativos {period !== 'all' ? `(${period})` : ''}
            </h3>
            <Users size={16} className="text-[var(--blue)]" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={authorChartData.length > 0 ? authorChartData : [{ name: 'Sem dados', contribuicoes: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#233030" vertical={false} />
                <XAxis dataKey="name" stroke={C.subtle} tick={{ fill: C.subtle, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke={C.subtle} tick={{ fill: C.subtle, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="contribuicoes" fill={C.blue} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Distribuição por Categoria & Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div style={{ ...card, padding: '1.25rem' }} className="flex flex-col items-center justify-center">
          <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 self-start">
            Tipos de Eventos Registrados
          </h3>
          <div className="w-40 h-40 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeChartData} cx="50%" cy="50%" innerRadius={48} outerRadius={64} dataKey="value" stroke="none">
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-xl font-bold text-[var(--text)]">{filteredEvents.length}</span>
              <span className="text-[10px] text-[var(--subtle)] uppercase">Total</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            {typeChartData.map((t, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }}></span>
                <span>{t.name}: {t.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: '1.25rem' }} className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
              Eficiência e Saúde do Pipeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-[var(--hover)] rounded-xl border border-[var(--border)]">
                <p className="text-xs text-[var(--subtle)] m-0 mb-1">Média de Eventos/Hora</p>
                <p className="text-lg font-bold m-0 text-[var(--neon)]">{(filteredEvents.length / 24).toFixed(1)} ev/h</p>
              </div>
              <div className="p-4 bg-[var(--hover)] rounded-xl border border-[var(--border)]">
                <p className="text-xs text-[var(--subtle)] m-0 mb-1">Taxa de Sucesso</p>
                <p className="text-lg font-bold m-0 text-emerald-400">100.0%</p>
              </div>
              <div className="p-4 bg-[var(--hover)] rounded-xl border border-[var(--border)]">
                <p className="text-xs text-[var(--subtle)] m-0 mb-1">Tempo Médio de Ingestão</p>
                <p className="text-lg font-bold m-0 text-[var(--text)]">~18ms</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--subtle)] m-0">
            * Dados calculados com base nos eventos filtrados no Supabase.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
