import React from 'react';

export default function Logo({ size = 32, className = '' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--neon, #00f2fe)" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Traço Esquerdo < */}
      <path 
        d="M 48 30 L 22 60 L 48 90" 
        stroke="url(#logoNeonGrad)" 
        strokeWidth="11" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter="url(#logoGlow)"
      />
      
      {/* Barra Central Inclinada / */}
      <path 
        d="M 66 20 L 50 100" 
        stroke="url(#logoNeonGrad)" 
        strokeWidth="11" 
        strokeLinecap="round"
        filter="url(#logoGlow)"
      />
      
      {/* Traço Direito > */}
      <path 
        d="M 72 30 L 98 60 L 72 90" 
        stroke="url(#logoNeonGrad)" 
        strokeWidth="11" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter="url(#logoGlow)"
      />
    </svg>
  );
}
