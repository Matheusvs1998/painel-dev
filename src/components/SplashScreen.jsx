import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#060a0a] select-none"
    >
      {/* Luz ambiente de fundo neon verde */}
      <div className="absolute w-[350px] h-[350px] rounded-full bg-[rgba(0,255,157,0.12)] blur-[120px] pointer-events-none animate-pulse"></div>

      {/* Ícone Centralizado em Destaque */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.16, 1, 0.3, 1],
          repeat: Infinity,
          repeatType: 'reverse',
          repeatDelay: 0.2
        }}
        className="relative z-10 w-24 h-24 rounded-3xl bg-[#0d1313] border border-[rgba(0,255,157,0.4)] flex items-center justify-center shadow-[0_0_45px_rgba(0,255,157,0.3)]"
      >
        <Logo size={56} />
      </motion.div>

      {/* Linha de Carregamento Futurista */}
      <div className="relative z-10 w-36 h-1 bg-[#161e1e] rounded-full mt-8 overflow-hidden">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full h-full bg-[#00ff9d] shadow-[0_0_12px_#00ff9d]"
        />
      </div>
    </motion.div>
  );
}
