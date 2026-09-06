import React, { useState } from 'react';
import { RotateCw } from 'lucide-react';
import { toggleScreenOrientation } from '../utils/orientation';

export default function RotateButton({ variant = 'floating', className = '' }) {
  const [rotating, setRotating] = useState(false);

  const handleClick = async () => {
    setRotating(true);
    await toggleScreenOrientation();
    setTimeout(() => setRotating(false), 600);
  };

  // Só visível no mobile (md:hidden)
  if (variant === 'header') {
    return (
      <button
        onClick={handleClick}
        className={`md:hidden bg-[var(--card)] hover:bg-[var(--hover)] border border-[var(--border)] hover:border-[var(--neonBorder)] rounded-lg p-2 cursor-pointer text-[var(--neon)] flex items-center justify-center transition-all shadow-sm active:scale-90 ${className}`}
        title="Girar Tela (Horizontal / Vertical)"
        aria-label="Girar Tela"
      >
        <RotateCw size={16} className={`transition-transform duration-500 ${rotating ? 'rotate-180' : ''}`} />
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        onClick={handleClick}
        className={`md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--card)]/90 backdrop-blur-md border border-[var(--neonBorder)] text-[var(--neon)] text-xs font-semibold shadow-[0_0_15px_var(--neonDim)] active:scale-95 transition-all cursor-pointer ${className}`}
        title="Girar Tela"
        aria-label="Girar Tela"
      >
        <RotateCw size={13} className={`transition-transform duration-500 ${rotating ? 'rotate-180' : ''}`} />
        <span>Girar</span>
      </button>
    );
  }

  // Floating button (padrão)
  return (
    <button
      onClick={handleClick}
      className={`md:hidden fixed bottom-5 right-5 z-40 p-3 rounded-full bg-[#0a1512]/90 backdrop-blur-xl border border-[var(--neonBorder)] text-[var(--neon)] shadow-[0_0_25px_rgba(0,255,157,0.3)] hover:shadow-[0_0_35px_rgba(0,255,157,0.5)] active:scale-90 transition-all cursor-pointer flex items-center justify-center ${className}`}
      title="Girar Tela"
      aria-label="Girar Tela"
    >
      <RotateCw size={20} className={`transition-transform duration-500 ${rotating ? 'rotate-180' : ''}`} />
    </button>
  );
}
