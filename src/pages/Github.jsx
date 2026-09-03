import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { fetchGithubEvents, simulateGithubEvent } from '../lib/api';
import { supabase } from '../lib/supabase';
import { 
  Globe, GitBranch as GithubIcon, Copy, Sparkles, RefreshCw, 
  Send, UserCheck, FolderGit2, Check, ExternalLink, HelpCircle 
} from 'lucide-react';
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
  const { session } = useOutletContext() || {};
  const queryClient = useQueryClient();
  const [simulating, setSimulating] = useState(false);
  const [savingRepo, setSavingRepo] = useState(false);

  const userId = session?.user?.id || '';
  const currentAuthor = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'autor';
  
  // Repositório que este perfil deseja monitorar (inicia vazio para novos perfis)
  const initialRepo = session?.user?.user_metadata?.github_repo || '';
  const [connectedRepo, setConnectedRepo] = useState(initialRepo);
  const [repoInput, setRepoInput] = useState(initialRepo);

  // Consulta de eventos com isolamento por usuário e repositório vinculado
  const { data: githubEvents = [], isLoading, refetch } = useQuery({
    queryKey: ['githubEvents', userId, connectedRepo],
    queryFn: () => fetchGithubEvents({
      userId,
      sender: currentAuthor,
      repo: connectedRepo
    }),
    refetchInterval: 5000
  });

  // URL Oficial Individualizada para o Webhook do GitHub
  const webhookUrl = `https://vdugwerpiuisyiwwkggg.supabase.co/functions/v1/github-webhook?user_id=${userId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success('URL oficial copiada! Cole no campo Payload URL do GitHub.');
  };

  const handleSaveRepo = async (e) => {
    e?.preventDefault();
    // Sanitiza se o usuário colou a URL completa do GitHub (ex: https://github.com/user/repo)
    let clean = repoInput.trim()
      .replace(/^https?:\/\/github\.com\//i, '')
      .replace(/\.git$/i, '')
      .replace(/^\/+|\/+$/g, '');

    setSavingRepo(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { github_repo: clean }
      });
      if (error) throw error;
      setConnectedRepo(clean);
      setRepoInput(clean);
      await queryClient.invalidateQueries({ queryKey: ['githubEvents'] });
      toast.success(`Repositório "${clean}" vinculado ao seu perfil com sucesso!`);
    } catch (err) {
      toast.error('Erro ao salvar repositório: ' + err.message);
    } finally {
      setSavingRepo(false);
    }
  };

  const handleSimulate = async (type = 'push') => {
    setSimulating(true);
    try {
      await simulateGithubEvent({ 
        type, 
        user_id: userId, 
        sender: currentAuthor, 
        repo: connectedRepo || `${currentAuthor}/meu-projeto` 
      });
      await queryClient.invalidateQueries({ queryKey: ['githubEvents'] });
      toast.success(`Evento "${type.toUpperCase()}" disparado e registrado!`);
    } catch (err) {
      toast.error('Erro ao registrar evento: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <SectionHeader 
            title="GitHub Webhooks Oficiais" 
            subtitle={`Monitoramento em tempo real para o perfil @${currentAuthor}`} 
          />
        </div>
        
        {/* Ações Rápidas: Teste do Autor & Atualizar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleSimulate('push')}
            disabled={simulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--neonDim)] hover:bg-[var(--neon)] text-[var(--neon)] hover:text-[var(--bg)] border border-[var(--neonBorder)] text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
            title="Disparar push de teste no repositório vinculado"
          >
            <Sparkles size={13} /> Testar Push (@{currentAuthor})
          </button>
          <button
            onClick={() => handleSimulate('pull_request')}
            disabled={simulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--hover)] hover:bg-[var(--card)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
          >
            <Send size={13} /> Testar PR
          </button>
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-xl bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] cursor-pointer transition-all"
            title="Recarregar meus eventos"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Card Unificado: Conectar Repositório & Webhook */}
      <div style={{ ...card, padding: '1.5rem', borderColor: C.neonBorder }} className="flex flex-col gap-4">
        {/* Cabeçalho do Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--neonDim)] text-[var(--neon)] flex items-center justify-center border border-[var(--neonBorder)] shrink-0">
              <FolderGit2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text)] m-0">Conectar Repositório do GitHub</h3>
              <p className="text-xs text-[var(--muted)] m-0">Vincule seu repositório e configure o webhook para monitoramento em tempo real</p>
            </div>
          </div>
          {connectedRepo ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[var(--neonDim)] text-[var(--neon)] border border-[var(--neonBorder)] self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)] animate-pulse"></span>
              Conectado: {connectedRepo}
            </span>
          ) : (
            <span className="text-[11px] font-mono text-[var(--subtle)] bg-[var(--hover)] px-2.5 py-0.5 rounded-full self-start sm:self-auto">
              Nenhum repositório vinculado
            </span>
          )}
        </div>

        {/* Passo 1: Digite seu Repositório */}
        <form onSubmit={handleSaveRepo} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[var(--neon)]">1.</span>
            <input
              type="text"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="Cole aqui seu repositório (ex: usuario/repositorio)"
              className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--neon)] focus:shadow-[0_0_15px_var(--neonDim)] rounded-xl pl-8 pr-4 py-2.5 text-xs font-mono text-[var(--text)] outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={savingRepo || !repoInput.trim() || repoInput === connectedRepo}
            className="px-5 py-2.5 rounded-xl bg-[var(--neon)] text-[var(--bg)] text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-[0_0_15px_var(--neonDim)]"
          >
            <Check size={14} /> {savingRepo ? 'Salvando...' : 'Vincular Repositório'}
          </button>
        </form>

        {/* Passo 2: Webhook para colar no GitHub */}
        <div className="pt-2 border-t border-[var(--border)]/50">
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="text-[11px] font-semibold text-[var(--subtle)] uppercase tracking-wider flex items-center gap-1.5">
              <span className="text-[var(--neon)] font-bold font-mono">2.</span> URL do Webhook (Cole no seu GitHub em Settings → Webhooks):
            </label>
          </div>
          <div className="p-2.5 sm:p-3 bg-[var(--bg)] rounded-xl border border-[var(--border)] font-mono text-[var(--neon)] flex items-center justify-between gap-3 text-xs overflow-x-auto">
            <div className="flex items-center gap-2 truncate">
              <Globe size={15} className="shrink-0 text-[var(--neon)]" />
              <span className="truncate">{webhookUrl}</span>
            </div>
            <button
              type="button"
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--neonDim)] hover:bg-[var(--neon)] text-[var(--neon)] hover:text-[var(--bg)] border border-[var(--neonBorder)] font-bold rounded-lg text-xs transition-all cursor-pointer shrink-0"
            >
              <Copy size={13} /> Copiar URL
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Eventos Filtrados por Perfil e Repositório */}
      <div className="glass-panel overflow-x-auto">
        <div className="min-w-[600px] grid grid-cols-5 gap-4 p-4 text-[0.65rem] text-[var(--subtle)] uppercase tracking-widest border-b border-[var(--border)] font-semibold">
          <span>Evento</span><span>Ação</span><span>Repositório</span><span>Autor Oficial</span><span className="text-right">Horário</span>
        </div>
        
        {githubEvents.length === 0 ? (
          <div className="text-center text-[var(--subtle)] p-12 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--hover)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)]">
              <GithubIcon size={24} className="opacity-40" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)] m-0">Aguardando eventos para o repositório "{connectedRepo}"</p>
              <p className="text-xs text-[var(--muted)] m-0 mt-1 max-w-md">
                Certifique-se de que cadastrou o Webhook no repositório correto no GitHub ou clique em <strong>Testar Push</strong> para disparar um evento imediatamente.
              </p>
            </div>
            <button
              onClick={() => handleSimulate('push')}
              className="mt-2 px-4 py-2 rounded-xl bg-[var(--neon)] text-[var(--bg)] text-xs font-bold cursor-pointer shadow-[0_0_15px_var(--neonDim)] flex items-center gap-2"
            >
              <Sparkles size={14} /> Disparar Teste Oficial
            </button>
          </div>
        ) : githubEvents.map(ev => (
          <div key={ev.id} className="min-w-[600px] grid grid-cols-5 gap-4 p-4 items-center border-b border-[var(--border)] hover:bg-[var(--hover)] transition-colors">
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)] shrink-0"></span>{ev.event}
            </span>
            <span className="text-sm text-[var(--muted)]">{ev.action || '—'}</span>
            <span className="text-sm text-[var(--muted)] overflow-hidden text-ellipsis whitespace-nowrap font-mono">{ev.repo}</span>
            <span className="text-sm text-[var(--neon)] font-medium">@{ev.sender}</span>
            <span className="text-xs text-[var(--subtle)] text-right">{new Date(ev.timestamp).toLocaleString('pt-BR')}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
