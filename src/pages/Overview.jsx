import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronRight, GitBranch as Github } from 'lucide-react';
import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import { motion } from 'framer-motion';

const C = { neon: 'var(--neon)', neonDim: 'var(--neonDim)', subtle: 'var(--subtle)', muted: 'var(--muted)', card: 'var(--card)', border: 'var(--border)', text: 'var(--text)', yellow: '#facc15', red: 'var(--red)' };
const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem' };
const TOOLTIP_STYLE = { backgroundColor: C.card, borderColor: C.border, borderRadius: '8px', fontSize: 12, color: '#fff' };

export default function Overview() {
  const { t } = useTranslation();

  const { data: statusData } = useQuery({ queryKey: ['status'], queryFn: async () => { const t0 = Date.now(); const res = await fetch('http://localhost:3001/api/status'); const data = await res.json(); return { status: data.status, pingMs: Date.now() - t0 }; }, refetchInterval: 5000 });
  const { data: waData } = useQuery({ queryKey: ['waStatus'], queryFn: async () => { const res = await fetch('http://localhost:3001/api/whatsapp/status'); return res.json(); }, refetchInterval: 5000 });
  const { data: githubEvents = [] } = useQuery({ queryKey: ['githubEvents'], queryFn: async () => { const res = await fetch('http://localhost:3001/api/webhooks/github/events'); return res.json(); }, refetchInterval: 5000 });

  const status = statusData?.status === 'online' ? t('header.online') : t('header.offline');
  const waStatus = waData?.status || 'disconnected';
  const pingMs = statusData?.pingMs;

  const daysLabels = [t('dashboard.days.mon'), t('dashboard.days.tue'), t('dashboard.days.wed'), t('dashboard.days.thu'), t('dashboard.days.fri'), t('dashboard.days.sat'), t('dashboard.days.sun')];
  const chartData = daysLabels.map(name => ({ name, events: 0, errors: 0 }));
  githubEvents.forEach(ev => {
    let dayIndex = new Date(ev.timestamp).getDay() - 1;
    if (dayIndex === -1) dayIndex = 6;
    if (chartData[dayIndex]) chartData[dayIndex].events += 1;
  });

  const waPct = waStatus === 'connected' ? 100 : waStatus === 'qr_ready' ? 50 : 10;
  const pieData = [{ value: waPct }, { value: 100 - waPct }];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <SectionHeader title={t('nav.overview')} subtitle={t('dashboard.overviewSubtitle')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('dashboard.githubEvents')} value={githubEvents.length} trendLabel={t('dashboard.thisWeek')} />
        <StatCard label={t('header.backendStatus')} value={status} trendLabel={status === t('header.online') ? t('dashboard.stable') : t('dashboard.failed')} positive={status === t('header.online')} />
        <StatCard label={t('nav.whatsapp')} value={waStatus} trendLabel={waStatus === 'connected' ? t('dashboard.connected') : t('dashboard.disconnected')} positive={waStatus === 'connected'} />
        <StatCard label="Ping" value={pingMs ? `${pingMs} ms` : '—'} trendLabel={t('dashboard.lastMeasurement')} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 min-h-[280px]">
        <div style={{ ...card, padding: '1.25rem' }} className="flex-1 flex flex-col">
          <p style={{ fontSize: '0.7rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>{t('dashboard.eventsPerDay')}</p>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.neon} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={C.neon} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#233030" vertical={false} />
                <XAxis dataKey="name" stroke={C.subtle} tick={{ fill: C.subtle, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke={C.subtle} tick={{ fill: C.subtle, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="events" stroke={C.neon} strokeWidth={2} fill="url(#gEvents)" />
                <Line type="monotone" dataKey="errors" stroke="#f87171" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="w-full lg:w-[260px] flex flex-col gap-4">
          <div style={{ ...card, padding: '1.25rem' }} className="flex-1 flex flex-col items-center justify-center">
            <p style={{ fontSize: '0.7rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', alignSelf: 'flex-start' }}>WA Readiness</p>
            <div className="relative w-28 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={52} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                    <Cell fill={waStatus === 'connected' ? C.neon : C.red} />
                    <Cell fill="rgba(255,255,255,0.05)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-[var(--text)]">{waStatus === 'connected' ? '100%' : '0%'}</span>
              </div>
            </div>
          </div>
          <div style={{ ...card, padding: '1.25rem' }}>
            <p style={{ fontSize: '0.7rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{t('dashboard.dbStatus')}</p>
            <p style={{ fontSize: '0.875rem', fontWeight: '500', color: C.neon, margin: 0 }}>{t('dashboard.supabaseConnected')}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
