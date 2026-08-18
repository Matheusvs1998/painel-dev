import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Auth from './components/Auth';
import ProfileModal from './components/ProfileModal';
import { supabase } from './lib/supabase';
import {
  Inbox, Bell, LayoutDashboard, GitBranch as Github,
  Users, BarChart2, Radio, Link2, FileText, Search,
  Activity, ArrowUpRight, ArrowDownRight, MessageSquare,
  Wifi, WifiOff, Send, CheckCircle, AlertCircle, Globe, Zap,
  Server, ChevronRight, Clock, User, Sun, Moon
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar
} from 'recharts';

const API = 'http://localhost:3001';

// ── Design tokens ──────────────────────────────
const C = {
  bg:        'var(--bg)',
  card:      'var(--card)',
  border:    'var(--border)',
  hover:     'var(--hover)',
  neon:      'var(--neon)',
  neonDim:   'var(--neonDim)',
  neonBorder:'var(--neonBorder)',
  muted:     'var(--muted)',
  subtle:    'var(--subtle)',
  red:       'var(--red)',
  text:      'var(--text)',
  yellow:    '#facc15',
  blue:      '#60a5fa',
};

const card = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: '1rem',
};

const TOOLTIP_STYLE = {
  backgroundColor: C.card,
  borderColor: C.border,
  borderRadius: '8px',
  fontSize: 12,
  color: '#fff',
};

// ── NavItem ─────────────────────────────────────
function NavItem({ icon: Icon, label, badge, active, onClick, neonIcon }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0.55rem 0.75rem',
        borderRadius: '0.75rem',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.15s',
        background: active ? C.neon : 'transparent',
        color: active ? C.bg : C.muted,
        fontWeight: active ? '600' : '400',
        boxShadow: active ? `0 0 14px ${C.neonBorder}` : 'none',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = C.hover; e.currentTarget.style.color = '#fff'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; } }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem' }}>
        <Icon size={17} style={{ color: active ? C.bg : neonIcon ? C.neon : 'inherit' }} />
        {label}
      </span>
      {badge ? (
        <span style={{ background: 'rgba(248,113,113,0.15)', color: C.red, fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '9999px', fontWeight: 600 }}>
          {badge}
        </span>
      ) : null}
    </button>
  );
}

// ── StatCard ────────────────────────────────────
function StatCard({ label, value, trendLabel, positive = true }) {
  return (
    <div style={{ ...card, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <p style={{ fontSize: '0.7rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: '700', color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
      <p style={{ fontSize: '0.7rem', color: positive ? C.neon : C.red, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
        {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {trendLabel}
      </p>
    </div>
  );
}

// ── SectionHeader ────────────────────────────────
function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: C.text, margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: '0.875rem', color: C.muted, marginTop: '0.25rem' }}>{subtitle}</p>}
    </div>
  );
}

// ── App ─────────────────────────────────────────
export default function App() {
  const { t, i18n } = useTranslation();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [activeTab, setActiveTab] = useState('overview');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [status, setStatus] = useState(t('header.checking'));
  const [waStatus, setWaStatus] = useState('disconnected');
  const [qrCode, setQrCode] = useState(null);
  const [githubEvents, setGithubEvents] = useState([]);
  const [waNumber, setWaNumber] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pingMs, setPingMs] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const inboxItems = useMemo(() => {
    return githubEvents.slice(0, 3).map((ev, i) => {
      const diffMs = Date.now() - new Date(ev.timestamp).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      let timeStr = `${diffMins} min`;
      if (diffMins > 60) timeStr = `${Math.floor(diffMins / 60)}h`;
      
      return {
        id: ev.id || i,
        from: 'GitHub',
        msg: `${ev.event} - ${ev.repo}`,
        time: timeStr,
        read: diffMins > 60
      };
    });
  }, [githubEvents]);

  const alerts = useMemo(() => {
    const arr = [];
    let id = 1;
    
    if (waStatus === 'disconnected') {
      arr.push({ id: id++, type: 'warning', msg: t('dashboard.alertMsg1', 'WhatsApp desconectado — reconecte o bot'), time: 'Agora' });
    } else if (waStatus === 'connected') {
      arr.push({ id: id++, type: 'success', msg: t('dashboard.waConnectedSuccess', 'Bot WhatsApp conectado com sucesso'), time: 'Agora' });
    }
    
    if (status === t('header.offline')) {
      arr.push({ id: id++, type: 'warning', msg: 'Backend offline', time: 'Agora' });
    } else {
      arr.push({ id: id++, type: 'success', msg: 'Backend online e estável', time: 'Agora' });
    }

    if (githubEvents.length > 0) {
      arr.push({ id: id++, type: 'info', msg: `${githubEvents.length} eventos capturados do GitHub`, time: 'Recente' });
    } else {
      arr.push({ id: id++, type: 'info', msg: 'Nenhum evento do GitHub capturado ainda', time: 'Recente' });
    }
    
    return arr;
  }, [waStatus, status, githubEvents.length, t]);

  const daysLabels = [t('dashboard.days.mon'), t('dashboard.days.tue'), t('dashboard.days.wed'), t('dashboard.days.thu'), t('dashboard.days.fri'), t('dashboard.days.sat'), t('dashboard.days.sun')];
  
  const chartData = useMemo(() => {
    const data = daysLabels.map(name => ({ name, events: 0, errors: 0 }));
    githubEvents.forEach(ev => {
      const date = new Date(ev.timestamp);
      let dayIndex = date.getDay() - 1;
      if (dayIndex === -1) dayIndex = 6;
      if (data[dayIndex]) data[dayIndex].events += 1;
    });
    return data;
  }, [githubEvents, daysLabels]);

  const statsBarData = useMemo(() => {
    const counts = {};
    githubEvents.forEach(ev => {
      counts[ev.event] = (counts[ev.event] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [githubEvents]);

  useEffect(() => {
    const fetchAll = () => {
      const t0 = Date.now();
      fetch(`${API}/api/status`)
        .then(r => r.json())
        .then(d => { setStatus(d.status === 'online' ? t('header.online') : t('header.offline')); setPingMs(Date.now() - t0); })
        .catch(() => setStatus(t('header.offline')));

      fetch(`${API}/api/whatsapp/status`)
        .then(r => r.json())
        .then(d => { setWaStatus(d.status); if (d.qr) setQrCode(d.qr); })
        .catch(() => {});

      fetch(`${API}/api/webhooks/github/events`)
        .then(r => r.json())
        .then(d => setGithubEvents(d))
        .catch(() => {});
    };
    fetchAll();
    const iv = setInterval(fetchAll, 3000);
    return () => clearInterval(iv);
  }, []);

  const handleSend = async () => {
    if (!waNumber || !waMessage) return alert(t('messages.fillFields'));
    setIsSending(true);
    try {
      const res = await fetch(`${API}/api/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: waNumber, message: waMessage }),
      });
      const d = await res.json();
      if (d.success) { alert(t('messages.sentSuccess')); setWaMessage(''); }
      else alert(t('messages.errorPrefix') + d.error);
    } catch { alert(t('messages.reqError')); }
    setIsSending(false);
  };

  const waPct = waStatus === 'connected' ? 100 : waStatus === 'qr_ready' ? 50 : 10;
  const pieData = [{ value: waPct }, { value: 100 - waPct }];

  const navGroups = [
    {
      items: [
        { id: 'inbox', icon: Inbox, label: t('nav.inbox'), badge: inboxItems.filter(i => !i.read).length || null },
        { id: 'alerts', icon: Bell, label: t('nav.alerts'), badge: alerts.filter(a => a.type === 'warning').length || null },
        { id: 'overview', icon: LayoutDashboard, label: t('nav.overview') },
      ],
    },
    {
      title: t('nav.integrations'),
      items: [
        { id: 'github', icon: Github, label: t('nav.github'), neonIcon: true },
        { id: 'whatsapp', icon: MessageSquare, label: t('nav.whatsapp') },
        { id: 'services', icon: Activity, label: t('nav.services') },
        { id: 'contacts', icon: Users, label: t('nav.contacts') },
      ],
    },
    {
      title: t('nav.analytics'),
      items: [
        { id: 'stats', icon: BarChart2, label: t('nav.stats'), badge: githubEvents.length > 0 ? githubEvents.length : null, neonIcon: true },
        { id: 'channels', icon: Radio, label: t('nav.channels') },
        { id: 'endpoints', icon: Link2, label: t('nav.endpoints') },
        { id: 'reports', icon: FileText, label: t('nav.reports') },
      ],
    },
  ];

  // ── Input style ─────────────────────────────────
  const inputStyle = {
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: '0.5rem',
    padding: '0.6rem 1rem',
    fontSize: '0.875rem',
    color: C.text,
    outline: 'none',
    width: '100%',
    fontFamily: 'Inter, sans-serif',
  };

  return (
    !session ? <Auth /> : (
    <div style={{ display: 'flex', height: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: '224px', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem', overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
          <div style={{ width: '2rem', height: '2rem', background: C.neon, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 10px ${C.neonBorder}` }}>
            <span style={{ color: C.bg, fontWeight: '900', fontSize: '1rem', letterSpacing: '-1px' }}>&lt;/&gt;</span>
          </div>
          <h1 style={{ margin: 0, color: C.text, fontSize: '1.25rem', fontWeight: 'bold' }}>DevSystem</h1>
        </div>

        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginTop: gi > 0 ? '1.5rem' : 0, marginBottom: '0.5rem' }}>
            {group.title && (
              <p style={{ fontSize: '0.65rem', color: C.subtle, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
                {group.title}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {group.items.map(item => (
                <NavItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  badge={item.badge}
                  active={activeTab === item.id}
                  neonIcon={item.neonIcon}
                  onClick={() => setActiveTab(item.id)}
                />
              ))}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: '0.75rem', cursor: 'pointer' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: C.neonDim, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.neon, flexShrink: 0 }}>
              <User size={18} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>{t('sidebar.devSystem')}</p>
              <p style={{ fontSize: '0.7rem', color: C.subtle, margin: 0 }}>{t('sidebar.version')}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: C.subtle }} />
            <input type="text" placeholder={t('header.searchPlaceholder')} style={{ ...inputStyle, paddingLeft: '2.25rem', width: '200px', borderRadius: '9999px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: '9999px', background: status === t('header.online') ? C.neonDim : 'rgba(248,113,113,0.1)', color: status === t('header.online') ? C.neon : C.red }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: status === t('header.online') ? C.neon : C.red, display: 'inline-block' }}></span>
              {t('header.backendStatus')} {status} {pingMs ? `· ${pingMs}ms` : ''}
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0, textTransform: 'capitalize' }}>
                {session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Usuário'}
              </p>
              <p style={{ fontSize: '0.7rem', color: C.subtle, margin: 0 }}>
                {session?.user?.email}
              </p>
            </div>
            <img 
              src={session?.user?.user_metadata?.custom_avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.user_metadata?.avatar_seed || session?.user?.email || 'User'}`} 
              alt="User" 
              title="Editar Perfil"
              onClick={() => setIsProfileOpen(true)}
              style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', border: `2px solid ${C.border}`, background: C.card, cursor: 'pointer', transition: 'border 0.2s', objectFit: 'cover' }} 
              onMouseEnter={(e) => e.currentTarget.style.borderColor = C.neon}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = C.border}
            />
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{ 
                background: C.card, border: `1px solid ${C.border}`, borderRadius: '0.5rem', 
                padding: '0.4rem', cursor: 'pointer', color: C.neon, display: 'flex', 
                alignItems: 'center', justifyContent: 'center', marginLeft: '0.5rem',
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease',
                transform: theme === 'dark' ? 'rotate(0deg)' : 'rotate(360deg)'
              }}
              title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              style={{ ...inputStyle, padding: '0.4rem 0.5rem', width: 'auto', borderRadius: '0.5rem', cursor: 'pointer', marginLeft: '0.5rem', fontSize: '0.75rem' }}
            >
              <option value="pt">PT-BR</option>
              <option value="en">EN-US</option>
            </select>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', position: 'relative' }}>

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SectionHeader title={t('nav.overview')} subtitle={t('dashboard.overviewSubtitle')} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <StatCard label={t('dashboard.githubEvents')} value={githubEvents.length} trendLabel={t('dashboard.thisWeek')} />
                <StatCard label={t('header.backendStatus')} value={status} trendLabel={status === t('header.online') ? t('dashboard.stable') : t('dashboard.failed')} positive={status === t('header.online')} />
                <StatCard label={t('nav.whatsapp')} value={waStatus} trendLabel={waStatus === 'connected' ? t('dashboard.connected') : t('dashboard.disconnected')} positive={waStatus === 'connected'} />
                <StatCard label="Ping" value={pingMs ? `${pingMs} ms` : '—'} trendLabel={t('dashboard.lastMeasurement')} />
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', minHeight: '280px' }}>
                <div style={{ ...card, padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontSize: '0.7rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>{t('dashboard.eventsPerDay')}</p>
                  <div style={{ flex: 1 }}>
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

                <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ ...card, padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: '0.7rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', alignSelf: 'flex-start' }}>WA Readiness</p>
                    <div style={{ position: 'relative', width: '112px', height: '112px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={52} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                            <Cell fill={waStatus === 'connected' ? C.neon : waStatus === 'qr_ready' ? C.yellow : C.red} />
                            <Cell fill="rgba(255,255,255,0.05)" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: C.text }}>{waPct}%</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: C.subtle, marginTop: '0.5rem' }}>{t('dashboard.basedOnConnection')}</p>
                  </div>
                  <div style={{ ...card, padding: '1.25rem' }}>
                    <p style={{ fontSize: '0.7rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{t('dashboard.dbStatus')}</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: C.neon, margin: 0 }}>{t('dashboard.supabaseConnected')}</p>
                    <p style={{ fontSize: '0.7rem', color: C.subtle, marginTop: '0.25rem' }}>{githubEvents.length} {t('dashboard.recordsSaved')}</p>
                  </div>
                </div>
              </div>

              <div style={{ ...card, padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>{t('dashboard.latestEvents')}</p>
                  <button onClick={() => setActiveTab('github')} style={{ background: 'none', border: 'none', color: C.neon, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    {t('dashboard.seeAll')} <ChevronRight size={12} />
                  </button>
                </div>
                {githubEvents.length === 0 ? (
                  <p style={{ color: C.subtle, fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>{t('dashboard.noEvents')}</p>
                ) : githubEvents.slice(0, 3).map(ev => (
                  <div key={ev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: C.neonDim, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.neon }}>
                        <Github size={14} />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>{ev.event} <span style={{ color: C.muted, fontWeight: '400' }}>· {ev.action || 'trigger'}</span></p>
                        <p style={{ fontSize: '0.7rem', color: C.subtle, margin: 0 }}>{ev.repo}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: C.subtle }}>{new Date(ev.timestamp).toLocaleTimeString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── INBOX ── */}
          {activeTab === 'inbox' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SectionHeader title={t('nav.inbox')} subtitle={`${inboxItems.filter(i => !i.read).length} ${t('dashboard.unreadMessages')}`} />
              <div style={card}>
                {inboxItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', borderBottom: `1px solid ${C.border}`, borderLeft: !item.read ? `3px solid ${C.neon}` : '3px solid transparent', cursor: 'pointer' }}>
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: !item.read ? C.neonDim : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', color: !item.read ? C.neon : C.muted, flexShrink: 0 }}>
                      {item.from === 'GitHub' ? <Github size={18} /> : item.from === 'WhatsApp' ? <MessageSquare size={18} /> : <Server size={18} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: !item.read ? '600' : '400', color: !item.read ? '#fff' : C.muted, margin: 0 }}>{item.from}</p>
                        <span style={{ fontSize: '0.7rem', color: C.subtle }}>{item.time} {t('dashboard.ago')}</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: C.muted, margin: '0.25rem 0 0' }}>{item.msg}</p>
                    </div>
                    {!item.read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.neon, flexShrink: 0 }}></span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ALERTS ── */}
          {activeTab === 'alerts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SectionHeader title={t('nav.alerts')} subtitle={t('dashboard.systemAlerts')} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {alerts.map(a => {
                  const color = a.type === 'warning' ? C.yellow : a.type === 'success' ? C.neon : C.blue;
                  return (
                    <div key={a.id} style={{ ...card, padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', borderLeft: `3px solid ${color}` }}>
                      <div style={{ color, marginTop: '2px' }}>{a.type === 'warning' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.875rem', color: '#fff', margin: 0 }}>{a.msg}</p>
                        <p style={{ fontSize: '0.7rem', color: C.subtle, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={11} /> {a.time} {t('dashboard.ago')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── GITHUB ── */}
          {activeTab === 'github' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SectionHeader title="GitHub Webhooks" subtitle={`${githubEvents.length} eventos recebidos e salvos no Supabase`} />
              <div style={{ ...card, padding: '1.25rem', borderColor: C.neonBorder }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: '0 0 0.25rem' }}>URL do Webhook</p>
                <p style={{ fontSize: '0.75rem', color: C.muted, margin: '0 0 0.75rem' }}>Adicione no Settings → Webhooks do repositório GitHub:</p>
                <div style={{ padding: '1.25rem', background: C.bg, borderRadius: '0.75rem', border: `1px solid ${C.border}`, fontFamily: 'monospace', color: C.neon, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <Globe size={16} /> https://vdugwerpiuisyiwwkggg.supabase.co/functions/v1/github-webhook
                </div>
              </div>
              <div style={card}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', padding: '1rem', fontSize: '0.65rem', color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: `1px solid ${C.border}` }}>
                  <span>Evento</span><span>Ação</span><span>Repositório</span><span>Autor</span><span>Horário</span>
                </div>
                {githubEvents.length === 0 ? (
                  <div style={{ textAlign: 'center', color: C.subtle, padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <Github size={32} style={{ opacity: 0.3 }} />
                    <p style={{ margin: 0 }}>Nenhum evento recebido ainda.</p>
                  </div>
                ) : githubEvents.map(ev => (
                  <div key={ev.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', padding: '1rem', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.neon, flexShrink: 0 }}></span>{ev.event}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: C.muted }}>{ev.action || '—'}</span>
                    <span style={{ fontSize: '0.875rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.repo}</span>
                    <span style={{ fontSize: '0.875rem', color: C.muted }}>{ev.sender}</span>
                    <span style={{ fontSize: '0.75rem', color: C.subtle }}>{new Date(ev.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── WHATSAPP ── */}
          {activeTab === 'whatsapp' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SectionHeader title={t('dashboard.waAgent', 'Agente WhatsApp')} subtitle={t('dashboard.waSubtitle', 'Conecte e gerencie seu bot de WhatsApp')} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ ...card, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: waStatus === 'connected' ? C.neonDim : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: waStatus === 'connected' ? C.neon : C.subtle }}>
                    {waStatus === 'connected' ? <Wifi size={28} /> : <WifiOff size={28} />}
                  </div>
                  <p style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 0.25rem', textTransform: 'capitalize' }}>{waStatus === 'connected' ? t('dashboard.connected') : waStatus === 'qr_ready' ? 'QR Code' : t('dashboard.disconnected')}</p>
                  <p style={{ fontSize: '0.875rem', color: C.muted, margin: '0 0 1.5rem' }}>
                    {waStatus === 'connected' ? t('dashboard.waReadyMsg', 'Bot pronto para enviar mensagens.') : waStatus === 'qr_ready' ? t('dashboard.scanQrCode') : t('dashboard.waConnecting', 'Iniciando conexão...')}
                  </p>
                  {waStatus === 'qr_ready' && qrCode && (
                    <div style={{ width: '192px', height: '192px', background: '#fff', borderRadius: '0.75rem', padding: '0.5rem', marginBottom: '1rem' }}>
                      <img src={qrCode} alt="QR Code" style={{ width: '100%', height: '100%' }} />
                    </div>
                  )}
                  {waStatus === 'connected' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.neon, fontSize: '0.875rem' }}>
                      <CheckCircle size={16} /> {t('dashboard.waConnectedSuccess', 'Bot conectado com sucesso')}
                    </div>
                  )}
                </div>

                <div style={{ ...card, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>{t('dashboard.sendTestMsg', 'Enviar Mensagem de Teste')}</p>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: C.muted, display: 'block', marginBottom: '0.375rem' }}>{t('dashboard.numberLabel', 'Número (DDI+DDD+Número)')}</label>
                    <input type="text" placeholder="5511999999999" value={waNumber} onChange={e => setWaNumber(e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', color: C.muted, display: 'block', marginBottom: '0.375rem' }}>{t('dashboard.message')}</label>
                    <textarea placeholder={t('dashboard.msgPlaceholder', 'Digite a mensagem...')} value={waMessage} onChange={e => setWaMessage(e.target.value)}
                      style={{ ...inputStyle, minHeight: '120px', resize: 'none' }} />
                  </div>
                  <button onClick={handleSend} disabled={isSending || waStatus !== 'connected'}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: waStatus === 'connected' ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: '500', background: waStatus === 'connected' ? C.neon : C.border, color: waStatus === 'connected' ? C.bg : C.subtle, boxShadow: waStatus === 'connected' ? `0 0 15px ${C.neonBorder}` : 'none', transition: 'all 0.2s' }}>
                    <Send size={15} /> {isSending ? t('dashboard.sending', 'Enviando...') : t('dashboard.send')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── SERVICES ── */}
          {activeTab === 'services' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SectionHeader title="Serviços" subtitle="Status de todos os serviços integrados" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
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
                      <div style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: ok ? C.neon : C.red, display: 'inline-block' }}></span>
                          <Server size={16} style={{ color: C.subtle }} />
                        </div>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: '0 0 0.25rem' }}>{svc.name}</p>
                        <p style={{ fontSize: '0.75rem', color: C.muted, margin: '0 0 0.5rem' }}>{svc.detail}</p>
                        <p style={{ fontSize: '0.75rem', fontWeight: '500', color: ok ? C.neon : C.red, margin: 0 }}>{svc.st}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── CONTACTS ── */}
          {activeTab === 'contacts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SectionHeader title="Contatos" subtitle="Integrações e agentes conectados" />
              <div style={card}>
                {contacts.map((c, i) => {
                  const ok = c.status === 'active' || c.status === 'connected';
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: C.neonDim, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.neon }}>
                        {c.type === 'Bot' ? <Github size={18} /> : c.type === 'Agente' ? <MessageSquare size={18} /> : <Server size={18} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>{c.name}</p>
                        <p style={{ fontSize: '0.75rem', color: C.muted, margin: 0 }}>{c.type}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', background: ok ? C.neonDim : C.border, color: ok ? C.neon : C.muted }}>
                          {c.status === 'active' ? 'Ativo' : c.status === 'connected' ? 'Conectado' : c.status}
                        </span>
                        <p style={{ fontSize: '0.7rem', color: C.subtle, margin: '0.25rem 0 0' }}>{c.events} eventos</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STATS ── */}
          {activeTab === 'stats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SectionHeader title="Estatísticas" subtitle="Análise detalhada dos eventos e uso" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ ...card, padding: '1.25rem', height: '280px', display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontSize: '0.7rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Eventos por Tipo</p>
                  <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statsBarData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#233030" vertical={false} />
                        <XAxis dataKey="name" stroke={C.subtle} tick={{ fill: C.subtle, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis stroke={C.subtle} tick={{ fill: C.subtle, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Bar dataKey="value" fill={C.neon} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div style={{ ...card, padding: '1.25rem', height: '280px', display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontSize: '0.7rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Tráfego Semanal</p>
                  <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#233030" vertical={false} />
                        <XAxis dataKey="name" stroke={C.subtle} tick={{ fill: C.subtle, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis stroke={C.subtle} tick={{ fill: C.subtle, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Line type="monotone" dataKey="events" stroke={C.neon} strokeWidth={3} dot={false} />
                        <Line type="monotone" dataKey="errors" stroke="#f87171" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <StatCard label="Total Eventos" value={githubEvents.length} trendLabel="Salvo no Supabase" />
                <StatCard label="Uptime Backend" value="99.9%" trendLabel="Últimas 24h" />
                <StatCard label="Ping Médio" value={pingMs ? `${pingMs}ms` : '—'} trendLabel="Tempo de resposta" />
              </div>
            </div>
          )}

          {/* ── CHANNELS ── */}
          {activeTab === 'channels' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SectionHeader title="Canais" subtitle="Canais de comunicação e integração ativos" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { name: 'GitHub Webhook', desc: 'Recebe eventos dos repositórios', active: true, Icon: Github },
                  { name: 'WhatsApp API', desc: 'Envio e recebimento de mensagens', active: waStatus === 'connected', Icon: MessageSquare },
                  { name: 'Supabase Realtime', desc: 'Sincronização em tempo real com o banco', active: true, Icon: Zap },
                  { name: 'REST API', desc: 'Express.js rodando na porta 3001', active: status === 'Online', Icon: Globe },
                ].map((ch, i) => (
                  <div key={i} style={{ ...card, padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', background: ch.active ? C.neonDim : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ch.active ? C.neon : C.subtle, flexShrink: 0 }}>
                      <ch.Icon size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>{ch.name}</p>
                        <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', background: ch.active ? C.neonDim : C.border, color: ch.active ? C.neon : C.subtle }}>
                          {ch.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: C.muted, margin: '0.25rem 0 0' }}>{ch.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ENDPOINTS ── */}
          {activeTab === 'endpoints' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SectionHeader title="Endpoints" subtitle="Todos os endpoints disponíveis na API" />
              <div style={card}>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 80px', gap: '1rem', padding: '1rem', fontSize: '0.65rem', color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: `1px solid ${C.border}` }}>
                  <span>Método</span><span>Path</span><span>Descrição</span><span>Status</span>
                </div>
                {endpoints.map((ep, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 80px', gap: '1rem', padding: '1rem', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', background: ep.method === 'GET' ? 'rgba(96,165,250,0.1)' : 'rgba(250,204,21,0.1)', color: ep.method === 'GET' ? C.blue : C.yellow, width: 'fit-content' }}>{ep.method}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{ep.path}</span>
                    <span style={{ fontSize: '0.875rem', color: C.muted }}>{ep.desc}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: ep.code === 200 ? C.neon : C.red }}>{ep.code}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── REPORTS ── */}
          {activeTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SectionHeader title="Relatórios" subtitle="Resumo consolidado das atividades do sistema" />
              <div style={{ ...card, padding: '1.5rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: '0 0 1rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${C.border}` }}>📊 Relatório Geral</p>
                {[
                  { label: 'Total de eventos GitHub recebidos', value: githubEvents.length },
                  { label: 'Status atual do Backend', value: status },
                  { label: 'Status atual do WhatsApp Bot', value: waStatus },
                  { label: 'Último ping medido', value: pingMs ? `${pingMs}ms` : 'N/A' },
                  { label: 'Banco de Dados', value: 'Supabase - Ativo' },
                  { label: 'Versão do sistema', value: 'v1.0.0' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: `1px solid rgba(22,30,30,0.5)` }}>
                    <span style={{ fontSize: '0.875rem', color: C.muted }}>{r.label}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#fff' }}>{r.value}</span>
                  </div>
                ))}
              </div>
              {githubEvents.length > 0 && (
                <div style={{ ...card, padding: '1.5rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: '0 0 1rem' }}>📋 Log de Eventos</p>
                  <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                    {githubEvents.map(ev => (
                      <div key={ev.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 120px 150px', gap: '1rem', fontSize: '0.75rem', color: C.muted, padding: '0.5rem 0', borderBottom: `1px solid rgba(22,30,30,0.4)` }}>
                        <span style={{ fontFamily: 'monospace', color: C.neon }}>{ev.event}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.repo}</span>
                        <span>{ev.sender}</span>
                        <span style={{ color: C.subtle }}>{new Date(ev.timestamp).toLocaleString('pt-BR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── FALLBACK FOR UNIMPLEMENTED TABS ── */}
          {!['overview', 'whatsapp', 'github', 'endpoints', 'reports'].includes(activeTab) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: C.muted }}>
              <div style={{ width: '5rem', height: '5rem', background: C.card, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.border}`, boxShadow: `0 0 20px ${C.neonDim}` }}>
                <Terminal size={32} color={C.neon} />
              </div>
              <h2 style={{ fontSize: '1.25rem', color: C.text, margin: 0, fontWeight: 'bold' }}>Módulo em Desenvolvimento</h2>
              <p style={{ fontSize: '0.875rem', textAlign: 'center', maxWidth: '300px' }}>
                A tela de <strong>{t(`nav.${activeTab}`)}</strong> ainda está sendo construída e chegará em futuras atualizações!
              </p>
            </div>
          )}

        </div>
      </main>

      {isProfileOpen && (
        <ProfileModal 
          session={session} 
          onClose={() => setIsProfileOpen(false)} 
        />
      )}

    </div>
    )
  );
}
