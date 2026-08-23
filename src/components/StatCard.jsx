import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const C = {
  card:      'var(--card)',
  border:    'var(--border)',
  neon:      'var(--neon)',
  muted:     'var(--muted)',
  red:       'var(--red)',
  text:      'var(--text)',
};

const card = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: '1rem',
};

export default function StatCard({ label, value, trendLabel, positive = true }) {
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
