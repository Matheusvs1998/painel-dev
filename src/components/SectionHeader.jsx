import React from 'react';

const C = {
  text: 'var(--text)',
  muted: 'var(--muted)',
};

export default function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: C.text, margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: '0.875rem', color: C.muted, marginTop: '0.25rem' }}>{subtitle}</p>}
    </div>
  );
}
