import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Radio, Send, CheckCircle2, XCircle, 
  MessageSquare, Mail, Globe, Zap, Settings2 
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { toast } from 'sonner';

const C = {
  card: 'var(--card)',
  border: 'var(--border)',
  neon: 'var(--neon)',
  neonDim: 'var(--neonDim)',
  muted: 'var(--muted)',
  subtle: 'var(--subtle)'
};

const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem' };

export default function Channels() {
  const [channels, setChannels] = useState([
    {
      id: 'discord',
      name: 'Discord Webhook',
      description: 'Encaminha eventos de commits e deploys para o canal #dev-feed do Discord.',
      icon: MessageSquare,
      active: true,
      endpoint: 'https://discord.com/api/webhooks/1234/xyz...',
      events: ['push', 'pull_request', 'issues']
    },
    {
      id: 'slack',
      name: 'Slack Incoming Webhook',
      description: 'Notifica incidentes e falhas críticas no canal #eng-alerts.',
      icon: Zap,
      active: true,
      endpoint: 'https://hooks.slack.com/services/T00/B00/XXXX',
      events: ['alerts', 'critical']
    },
    {
      id: 'telegram',
      name: 'Telegram Bot Alert',
      description: 'Envia avisos instantâneos para o grupo de plantão DevOps.',
      icon: Send,
      active: false,
      endpoint: 'https://api.telegram.org/bot<TOKEN>/sendMessage',
      events: ['all']
    },
    {
      id: 'email',
      name: 'E-mail Digest (SMTP)',
      description: 'Relatório diário com sumário executivo de alterações de código.',
      icon: Mail,
      active: true,
      endpoint: 'devops-reports@empresa.com',
      events: ['daily_digest']
    },
    {
      id: 'custom',
      name: 'Custom Webhook POST',
      description: 'Dispara uma requisição HTTP POST para qualquer API externa ou pipeline CI/CD.',
      icon: Globe,
      active: false,
      endpoint: 'https://minha-api.com/webhooks/devsystem',
      events: ['all']
    }
  ]);

  const toggleChannel = (id) => {
    setChannels(prev => prev.map(c => {
      if (c.id === id) {
        const nextState = !c.active;
        toast.info(`${c.name} ${nextState ? 'ativado' : 'desativado'}`);
        return { ...c, active: nextState };
      }
      return c;
    }));
  };

  const testChannel = (channel) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: `Enviando payload de teste para ${channel.name}...`,
        success: `✅ Mensagem de teste entregue com sucesso no canal ${channel.name}!`,
        error: 'Erro ao enviar mensagem de teste'
      }
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <SectionHeader 
        title="Canais de Notificação & Webhooks" 
        subtitle="Gerencie para onde os alertas e eventos do GitHub devem ser despachados" 
      />

      <div className="grid grid-cols-1 gap-4">
        {channels.map((ch) => {
          const Icon = ch.icon;
          return (
            <div 
              key={ch.id} 
              style={card} 
              className={`p-5 transition-all duration-200 hover:border-[var(--neonBorder)] ${
                !ch.active ? 'opacity-60' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    ch.active ? 'bg-[var(--neonDim)] text-[var(--neon)]' : 'bg-[var(--hover)] text-[var(--subtle)]'
                  }`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-sm font-bold text-[var(--text)] m-0">{ch.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                        ch.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {ch.active ? 'Ativo' : 'Pausado'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] m-0 mb-2 leading-relaxed">
                      {ch.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[var(--subtle)] font-mono uppercase font-bold">Destino:</span>
                      <span className="text-[11px] font-mono text-[var(--text)] bg-[var(--hover)] px-2 py-0.5 rounded border border-[var(--border)] truncate max-w-xs md:max-w-md">
                        {ch.endpoint}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                  <button
                    onClick={() => testChannel(ch)}
                    disabled={!ch.active}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      ch.active 
                        ? 'bg-[var(--hover)] hover:bg-[var(--neonDim)] hover:text-[var(--neon)] border-[var(--border)] text-[var(--text)] cursor-pointer' 
                        : 'bg-transparent text-[var(--subtle)] border-transparent cursor-not-allowed'
                    }`}
                  >
                    <Send size={13} /> Testar Envio
                  </button>

                  <button
                    onClick={() => toggleChannel(ch.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      ch.active 
                        ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25' 
                        : 'bg-[var(--neon)] text-[var(--bg)] shadow-[0_0_12px_var(--neonDim)]'
                    }`}
                  >
                    {ch.active ? 'Pausar' : 'Ativar'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
