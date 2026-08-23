import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Wifi, WifiOff, CheckCircle, Send, Key } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const C = { neon: 'var(--neon)', neonDim: 'var(--neonDim)', subtle: 'var(--subtle)', muted: 'var(--muted)', card: 'var(--card)', border: 'var(--border)', text: 'var(--text)' };
const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem' };

export default function WhatsApp() {
  const { t } = useTranslation();
  const [waNumber, setWaNumber] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { data: waData } = useQuery({ queryKey: ['waStatus'], queryFn: async () => { const res = await fetch('http://localhost:3001/api/whatsapp/status'); return res.json(); }, refetchInterval: 5000 });
  const { data: waChatHistory = [], refetch: refetchHistory } = useQuery({ queryKey: ['waHistory'], queryFn: async () => { const res = await fetch('http://localhost:3001/api/whatsapp/messages'); return res.json(); }, refetchInterval: 3000, enabled: waData?.status === 'connected' });

  const waStatus = waData?.status || 'disconnected';

  const handleSend = async () => {
    if (!waNumber || !waMessage) return toast.error(t('messages.fillFields'));
    setIsSending(true);
    try {
      const res = await fetch('http://localhost:3001/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: waNumber, message: waMessage }),
      });
      const d = await res.json();
      if (d.success) { 
        toast.success(d.message || t('messages.sentSuccess')); 
        setWaMessage(''); 
        refetchHistory();
      }
      else toast.error(t('messages.errorPrefix') + d.error);
    } catch { toast.error(t('messages.reqError')); }
    setIsSending(false);
  };

  const inputStyle = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.875rem', color: C.text, outline: 'none' };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <SectionHeader title={t('dashboard.waAgent', 'WhatsApp Cloud API')} subtitle={t('dashboard.waSubtitle', 'Integração Oficial com o Meta for Developers')} />
      
      {waStatus === 'disconnected' && (
        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid var(--red)', color: 'var(--red)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
          <strong>Atenção:</strong> A API Oficial do WhatsApp não está configurada. Você precisa definir <code>WA_ACCESS_TOKEN</code> e <code>WA_PHONE_NUMBER_ID</code> no <code>.env</code> do backend.
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div style={{ ...card, padding: '1.5rem' }} className="flex-1 lg:max-w-xs flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${waStatus === 'connected' ? 'bg-[var(--neonDim)] text-[var(--neon)]' : 'bg-[var(--border)] text-[var(--subtle)]'}`}>
            {waStatus === 'connected' ? <Wifi size={28} /> : <WifiOff size={28} />}
          </div>
          <p className="text-[1.1rem] font-bold m-0 mb-1 capitalize">{waStatus === 'connected' ? 'API Configurada' : 'Não Configurado'}</p>
          <p className="text-sm text-[var(--muted)] m-0 mb-6">{waStatus === 'connected' ? 'Pronto para enviar e receber.' : 'Aguardando variáveis de ambiente.'}</p>
          
          <div className="w-full text-left bg-[var(--bg)] border border-[var(--border)] p-4 rounded-lg mb-4">
            <h4 className="text-[var(--text)] text-sm font-semibold mb-2 flex items-center gap-2"><Key size={14} /> Webhook Setup</h4>
            <p className="text-xs text-[var(--muted)] mb-2">Configure no painel da Meta:</p>
            <div className="mb-2">
                <span className="text-[10px] uppercase text-[var(--subtle)] font-bold">URL do Callback</span>
                <div className="bg-[var(--hover)] text-xs p-1.5 rounded text-[var(--text)] select-all truncate">https://seu-dominio.com/api/webhooks/whatsapp</div>
            </div>
            <div>
                <span className="text-[10px] uppercase text-[var(--subtle)] font-bold">Verify Token</span>
                <div className="bg-[var(--hover)] text-xs p-1.5 rounded text-[var(--text)] select-all truncate">Valor do seu WA_VERIFY_TOKEN</div>
            </div>
          </div>
        </div>

        <div style={{ ...card }} className="flex-1 flex flex-col overflow-hidden h-[500px]">
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {waChatHistory.length === 0 ? (
              <p className="text-[var(--subtle)] text-center m-auto">Nenhuma mensagem recente.</p>
            ) : waChatHistory.map(m => (
              <div key={m.id} className={`max-w-[80%] rounded-lg p-3 ${m.isMe ? 'bg-[var(--neonDim)] border border-[var(--neonBorder)] text-[var(--neon)] self-end' : 'bg-[var(--hover)] border border-[var(--border)] text-[var(--text)] self-start'}`}>
                <p className="text-xs opacity-70 mb-1">+{m.from}</p>
                <p className="text-sm whitespace-pre-wrap m-0">{m.body}</p>
              </div>
            ))}
          </div>
          
          <div className="border-t border-[var(--border)] p-4 flex flex-col gap-3 bg-[var(--card)]">
            <div className="flex gap-2">
              <input type="text" placeholder="5511999999999" value={waNumber} onChange={e => setWaNumber(e.target.value)} style={inputStyle} className="w-1/3" />
              <input type="text" placeholder="Mensagem..." value={waMessage} onChange={e => setWaMessage(e.target.value)} style={inputStyle} className="flex-1 min-w-0" onKeyDown={e => e.key === 'Enter' && handleSend()} />
              <button onClick={handleSend} disabled={isSending || waStatus !== 'connected'}
                className={`flex items-center justify-center px-4 rounded-lg border-none transition-all duration-200 ${waStatus === 'connected' ? 'bg-[var(--neon)] text-[var(--bg)] cursor-pointer' : 'bg-[var(--border)] text-[var(--subtle)] cursor-not-allowed'}`}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
