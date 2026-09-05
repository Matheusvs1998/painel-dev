import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Dropdown Customizado Cyberpunk com Design System Neon Emerald (#00ff9d).
 * Substitui os <select> nativos do HTML, eliminando menus azuis do sistema operacional.
 */
export default function CustomDropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Selecione...',
  icon: Icon,
  className = '',
  menuWidth = 'w-full min-w-[200px]'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fecha o dropdown ao clicar fora ou apertar Esc
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Normaliza opções para o formato { value, label }
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'object' && opt !== null) {
      return { value: opt.value, label: opt.label ?? opt.value };
    }
    return { value: opt, label: opt };
  });

  const selectedOption = normalizedOptions.find(opt => String(opt.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={`relative inline-block text-xs font-mono ${className}`} ref={dropdownRef}>
      {/* Botão de Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-[#0b0f17] border border-[var(--border)] hover:border-[var(--neonBorder)] text-[var(--neon)] hover:shadow-[0_0_12px_var(--neonDim)] transition-all cursor-pointer w-full text-left select-none focus:outline-none focus:border-[var(--neon)]"
      >
        <div className="flex items-center gap-1.5 truncate">
          {Icon && <Icon size={13} className="text-[var(--subtle)] shrink-0" />}
          <span className="truncate font-medium">{displayLabel}</span>
        </div>
        <ChevronDown
          size={14}
          className={`text-[var(--subtle)] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[var(--neon)]' : ''
          }`}
        />
      </button>

      {/* Menu Flutuante Customizado */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 mt-1.5 z-50 bg-[#0f172a] border border-[var(--border)] rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.85)] overflow-hidden py-1 max-h-60 overflow-y-auto no-scrollbar ${menuWidth}`}
          >
            {normalizedOptions.length === 0 ? (
              <div className="px-3 py-2 text-[11px] text-[var(--subtle)] text-center">
                Nenhuma opção disponível
              </div>
            ) : (
              normalizedOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={`${opt.value}-${idx}`}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-[var(--neonDim)] text-[var(--neon)] font-bold'
                        : 'text-[var(--text)] hover:bg-[var(--neonDim)]/50 hover:text-[var(--neon)]'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check size={13} className="text-[var(--neon)] ml-2 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
