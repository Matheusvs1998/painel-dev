import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchGithubEvents, simulateGithubEvent } from '../lib/api';
import { Globe, GitBranch as GithubIcon, Copy, Sparkles, RefreshCw, Send } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const C = { 
  bg: 'var(--bg)', 
  border: 'var(--border)', 
  card: 'var(--card)', 
  neon: 'var(--neon)', 
  neonDim: 'var(--neonDim)', 
  neonBorder: 'var(--neonBorder)', 
  subtle: 'var(--subtle)', 
  muted: 'var(--muted)',
  hover: 'var(--hover)'
};
const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem' };

export default function Github() {
  const queryClient = useQueryClient();
  const [simulating, setSimulating] = useState(false);

  const { data: githubEvents = [], isLoading, refetch } = useQuery({
    queryKey: ['githubEvents'],
    queryFn: fetchGithubEvents,
    refetchInterval: 5000
  });

  const webhookUrl = 'https://vdugwerpiuisyiwwkggg.supabase.co/functions/v1/github-webhook';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success('URL do Webhook copiada para a área de transferência!');
  };

  const handleSimulate = async (type = 'push') => {
    setSimulating(true);
    try {
      await simulateGithubEvent({ type, sender: 'Matheusvs1998', repo: 'Matheusvs1998/painel-dev' });
      await queryClient.invalidateQueries({ queryKey: ['githubEvents'] });
      toast.success(`Evento "${type.toUpperCase()}" simulado com sucesso!`);
    } catch (err) {
      toast.error('Erro ao simular evento: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SectionHeader 
          title="GitHub Webhooks" 
          subtitle={`${githubEvents.length} eventos monitorados em tempo real`} 
        />
        
        {/* Ações Rápidas: Simular Evento & Atualizar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleSimulate('push')}
            disabled={simulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--neonDim)] hover:bg-[var(--neon)] text-[var(--neon)] hover:text-[var(--bg)] border border-[var(--neonBorder)] text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
          >
            <Sparkles size={13} /> Simular Push
          </button>
          <button
            onClick={() => handleSimulate('pull_request')}
            disabled={simulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--hover)] hover:bg-[var(--card)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
          >
            <Send size={13} /> Simular PR
          </button>
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-xl bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] cursor-pointer transition-all"
            title="Recarregar eventos"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      
      {/* Box com a URL do Webhook */}
      <div style={{ ...card, padding: '1.25rem', borderColor: C.neonBorder }}>
        <p className="text-sm font-medium m-0 mb-1">URL do Webhook Oficial</p>
        <p className="text-xs text-[var(--muted)] m-0 mb-3">
          Adicione no seu repositório GitHub em <strong>Settings → Webhooks → Add webhook</strong>:
        </p>
        <div className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--border)] font-mono text-[var(--neon)] flex items-center justify-between gap-3 text-xs sm:text-sm overflow-x-auto">
          <div className="flex items-center gap-2 truncate">
            <Globe size={16} className="shrink-0" />
            <span className="truncate">{webhookUrl}</span>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1 bg-[var(--hover)] hover:bg-[var(--neonDim)] text-[var(--text)] hover:text-[var(--neon)] rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0"
          >
            <Copy size={13} /> Copiar
          </button>
        </div>
      </div>

      {/* Tabela de Eventos */}
      <div className="glass-panel overflow-x-auto">
        <div className="min-w-[600px] grid grid-cols-5 gap-4 p-4 text-[0.65rem] text-[var(--subtle)] uppercase tracking-widest border-b border-[var(--border)] font-semibold">
          <span>Evento</span><span>Ação</span><span>Repositório</span><span>Autor</span><span className="text-right">Horário</span>
        </div>
        
        {githubEvents.length === 0 ? (
          <div className="text-center text-[var(--subtle)] p-12 flex flex-col items-center gap-3">
            <GithubIcon size={32} className="opacity-30" />
            <p className="m-0">Nenhum evento recebido ainda.</p>
            <button
              onClick={() => handleSimulate('push')}
              className="mt-2 px-4 py-2 rounded-xl bg-[var(--neon)] text-[var(--bg)] text-xs font-bold cursor-pointer"
            >
              Clique para Gerar Evento de Teste
            </button>
          </div>
        ) : githubEvents.map(ev => (
          <div key={ev.id} className="min-w-[600px] grid grid-cols-5 gap-4 p-4 items-center border-b border-[var(--border)] hover:bg-[var(--hover)] transition-colors">
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)] shrink-0"></span>{ev.event}
            </span>
            <span className="text-sm text-[var(--muted)]">{ev.action || '—'}</span>
            <span className="text-sm text-[var(--muted)] overflow-hidden text-ellipsis whitespace-nowrap font-mono">{ev.repo}</span>
            <span className="text-sm text-[var(--text)]">@{ev.sender}</span>
            <span className="text-xs text-[var(--subtle)] text-right">{new Date(ev.timestamp).toLocaleString('pt-BR')}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
