import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import Logo from './Logo';
import {
  Inbox, Bell, LayoutDashboard, GitBranch as Github,
  Users, BarChart2, Radio, Link2, FileText, User, X, Activity, Code2
} from 'lucide-react';

const C = {
  bg: 'var(--bg)',
  border: 'var(--border)',
  hover: 'var(--hover)',
  neon: 'var(--neon)',
  neonDim: 'var(--neonDim)',
  neonBorder: 'var(--neonBorder)',
  muted: 'var(--muted)',
  subtle: 'var(--subtle)',
  red: 'var(--red)',
  text: 'var(--text)',
};

function NavItem({ to, icon: Icon, label, badge, neonIcon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => `flex items-center justify-between w-full p-2.5 rounded-xl transition-all duration-150 ${isActive ? 'bg-[var(--neon)] text-[var(--bg)] font-semibold shadow-[0_0_14px_var(--neonBorder)]' : 'bg-transparent text-[var(--muted)] font-normal hover:bg-[var(--hover)] hover:text-white'}`}
    >
      {({ isActive }) => (
        <>
          <span className="flex items-center gap-2.5 text-sm">
            <Icon size={17} style={{ color: isActive ? C.bg : neonIcon ? C.neon : 'inherit' }} />
            {label}
          </span>
          {badge ? (
            <span className="bg-[var(--neonDim)] text-[var(--neon)] border border-[var(--neonBorder)] text-[0.65rem] px-2 py-0.5 rounded-full font-mono font-bold tracking-wider">
              {badge}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const { t } = useTranslation();

  const navGroups = [
    {
      items: [
        { id: 'inbox', to: '/inbox', icon: Inbox, label: t('nav.inbox') },
        { id: 'alerts', to: '/alerts', icon: Bell, label: t('nav.alerts') },
        { id: 'overview', to: '/', icon: LayoutDashboard, label: t('nav.overview') },
        { id: 'workspace', to: '/workspace', icon: Code2, label: t('nav.workspace'), neonIcon: true, badge: 'IA' },
      ],
    },
    {
      title: t('nav.integrations'),
      items: [
        { id: 'github', to: '/github', icon: Github, label: t('nav.github'), neonIcon: true },
        { id: 'services', to: '/services', icon: Activity, label: t('nav.services') },
        { id: 'contacts', to: '/contacts', icon: Users, label: t('nav.contacts') },
      ],
    },
    {
      title: t('nav.analytics'),
      items: [
        { id: 'stats', to: '/stats', icon: BarChart2, label: t('nav.stats'), neonIcon: true },
        { id: 'channels', to: '/channels', icon: Radio, label: t('nav.channels') },
        { id: 'endpoints', to: '/endpoints', icon: Link2, label: t('nav.endpoints') },
        { id: 'reports', to: '/reports', icon: FileText, label: t('nav.reports') },
      ],
    },
  ];

  return (
    <aside className={`fixed md:relative z-50 md:z-auto w-64 md:w-56 h-full flex flex-col py-6 px-4 overflow-y-auto shrink-0 transition-transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 bg-[var(--bg)] border-r border-[var(--border)]`}>
      <div className="flex items-center gap-3 mb-8 px-2 justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--card)] border border-[var(--border)] shadow-[0_0_15px_var(--neonDim)]">
            <Logo size={24} />
          </div>
          <div>
            <h1 className="m-0 text-[var(--text)] text-lg font-bold tracking-tight">DevSystem</h1>
            <span className="text-[10px] text-[var(--neon)] font-mono uppercase tracking-widest block -mt-1 font-semibold">Dashboard</span>
          </div>
        </div>
        <button className="md:hidden text-[var(--muted)]" onClick={() => setIsMobileMenuOpen(false)}>
          <X size={20} />
        </button>
      </div>

      {navGroups.map((group, gi) => (
        <div key={gi} className={`${gi > 0 ? 'mt-6' : ''} mb-2`}>
          {group.title && (
            <p className="text-[0.65rem] text-[var(--subtle)] font-semibold uppercase tracking-widest mb-2 px-2">
              {group.title}
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {group.items.map(item => (
              <NavItem
                key={item.id}
                to={item.to}
                icon={item.icon}
                label={item.label}
                badge={item.badge}
                neonIcon={item.neonIcon}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="mt-auto pt-6 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 p-2 rounded-xl cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-[var(--neonDim)] flex items-center justify-center text-[var(--neon)] shrink-0">
            <User size={18} />
          </div>
          <div>
            <p className="text-sm font-medium m-0">{t('sidebar.devSystem')}</p>
            <p className="text-[0.7rem] text-[var(--subtle)] m-0">{t('sidebar.version')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
