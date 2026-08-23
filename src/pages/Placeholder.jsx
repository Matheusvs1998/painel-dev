import React from 'react';
import SectionHeader from '../components/SectionHeader';
import { motion } from 'framer-motion';

export default function Placeholder({ title, subtitle }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="p-8 border border-dashed border-[var(--border)] rounded-xl text-center text-[var(--muted)]">
        Página em construção.
      </div>
    </motion.div>
  );
}