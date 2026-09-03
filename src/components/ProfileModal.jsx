import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  X, RefreshCw, LogOut, Save, Upload, User, Settings, 
  Moon, Sun, Bell, Globe, Shield, CheckCircle2 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const C = {
  bg: 'var(--bg)',
  card: 'var(--card)',
  border: 'var(--border)',
  hover: 'var(--hover)',
  neon: 'var(--neon)',
  neonDim: 'var(--neonDim)',
  neonBorder: 'var(--neonBorder)',
  muted: 'var(--muted)',
  subtle: 'var(--subtle)',
  red: 'var(--red)',
  text: 'var(--text)',
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  background: C.bg,
  border: `1px solid ${C.border}`,
  borderRadius: '0.75rem',
  color: C.text,
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.85rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
};

export default function ProfileModal({ session, onClose }) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'preferences'
  const [loading, setLoading] = useState(false);
  
  // Dados do Perfil
  const [name, setName] = useState(session?.user?.user_metadata?.full_name || '');
  const [avatarSeed, setAvatarSeed] = useState(session?.user?.user_metadata?.avatar_seed || session?.user?.email || 'default');
  const [customAvatarUrl, setCustomAvatarUrl] = useState(session?.user?.user_metadata?.custom_avatar_url || '');
  
  // Preferências
  const [themePref, setThemePref] = useState(session?.user?.user_metadata?.preferred_theme || localStorage.getItem('theme') || 'dark');
  const [langPref, setLangPref] = useState(session?.user?.user_metadata?.preferred_lang || i18n.language || 'pt');
  const [notificationsSound, setNotificationsSound] = useState(session?.user?.user_metadata?.notify_sound ?? true);
  const [highPriorityAlerts, setHighPriorityAlerts] = useState(session?.user?.user_metadata?.notify_high_priority ?? true);

  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const updatedMetadata = {
        full_name: name,
        avatar_seed: avatarSeed,
        custom_avatar_url: customAvatarUrl,
        preferred_theme: themePref,
        preferred_lang: langPref,
        notify_sound: notificationsSound,
        notify_high_priority: highPriorityAlerts,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.auth.updateUser({
        data: updatedMetadata
      });

      if (error) throw error;

      // Aplica preferências imediatas de tema e idioma no cliente
      if (themePref !== localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', themePref);
        localStorage.setItem('theme', themePref);
      }
      if (langPref !== i18n.language) {
        i18n.changeLanguage(langPref);
      }

      toast.success('Perfil e preferências salvos com sucesso!');
      onClose();
    } catch (error) {
      setErrorMsg(error.message);
      toast.error('Erro ao salvar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.info('Sessão encerrada.');
      onClose();
    } catch (error) {
      toast.error('Erro ao sair: ' + error.message);
    }
  };

  const generateRandomSeed = () => {
    const randomString = Math.random().toString(36).substring(7);
    setAvatarSeed(randomString);
    setCustomAvatarUrl('');
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setCustomAvatarUrl(data.publicUrl);
      toast.success('Foto de perfil carregada!');
    } catch (error) {
      setErrorMsg('Erro no upload. O bucket "avatars" precisa existir no Supabase Storage: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none">
      <div className="relative w-full max-w-[460px] bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
        
        {/* Cabeçalho Modal */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)] bg-[var(--hover)]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--neonDim)] border border-[var(--neonBorder)] flex items-center justify-center text-[var(--neon)] shadow-[0_0_15px_var(--neonDim)]">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold m-0 text-[var(--text)]">Perfil & Preferências</h2>
              <p className="text-xs text-[var(--muted)] m-0">{session?.user?.email}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={18} />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-[var(--border)] px-6 pt-3 bg-[var(--bg)]/40 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 transition-all border-b-2 cursor-pointer bg-transparent ${
              activeTab === 'profile'
                ? 'border-[var(--neon)] text-[var(--neon)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <User size={14} /> Dados Pessoais
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 transition-all border-b-2 cursor-pointer bg-transparent ${
              activeTab === 'preferences'
                ? 'border-[var(--neon)] text-[var(--neon)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Settings size={14} /> Preferências do Sistema
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSave} className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh]">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center leading-relaxed">
              {errorMsg}
            </div>
          )}

          {activeTab === 'profile' ? (
            <>
              {/* Seção do Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  <img 
                    src={customAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                    alt="Avatar" 
                    className="w-20 h-20 rounded-2xl border-2 border-[var(--neon)] bg-[var(--bg)] object-cover shadow-[0_0_20px_var(--neonDim)]" 
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[var(--card)] flex items-center justify-center text-black" title="Ativo">
                    <CheckCircle2 size={13} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <label className="flex items-center gap-1.5 bg-[var(--neonDim)] hover:bg-[var(--neon)] text-[var(--neon)] hover:text-[var(--bg)] border border-[var(--neonBorder)] px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all">
                    <Upload size={13} /> Enviar Foto
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={loading} />
                  </label>
                  <button 
                    type="button" 
                    onClick={generateRandomSeed}
                    className="flex items-center gap-1.5 bg-[var(--hover)] hover:bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                  >
                    <RefreshCw size={13} /> Gerar Avatar
                  </button>
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--subtle)] mb-1.5">
                  Nome de Exibição
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  style={inputStyle}
                  className="focus:border-[var(--neon)] focus:shadow-[0_0_15px_var(--neonDim)]"
                />
              </div>

              {/* E-mail (Leitura) */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--subtle)] mb-1.5">
                  E-mail Vinculado
                </label>
                <input
                  type="email"
                  value={session?.user?.email || ''}
                  disabled
                  style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>
            </>
          ) : (
            <>
              {/* Aba Preferências com Segmented Controls Modernos no lugar de selects feios */}
              <div className="flex flex-col gap-4">
                {/* Tema com Botoes Estilizados */}
                <div className="flex items-center justify-between p-3.5 bg-[var(--hover)]/40 rounded-2xl border border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    {themePref === 'dark' ? <Moon size={18} className="text-[var(--neon)]" /> : <Sun size={18} className="text-amber-400" />}
                    <div>
                      <p className="text-xs font-semibold m-0 text-[var(--text)]">Tema Visual</p>
                      <p className="text-[10px] text-[var(--subtle)] m-0">Aparência do sistema</p>
                    </div>
                  </div>
                  
                  {/* Segmented Control Neon */}
                  <div className="flex bg-[var(--bg)] p-1 rounded-xl border border-[var(--border)] gap-1">
                    <button
                      type="button"
                      onClick={() => setThemePref('dark')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        themePref === 'dark'
                          ? 'bg-[var(--neonDim)] text-[var(--neon)] border-[var(--neonBorder)] shadow-[0_0_10px_var(--neonDim)]'
                          : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      <Moon size={12} /> Escuro
                    </button>
                    <button
                      type="button"
                      onClick={() => setThemePref('light')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        themePref === 'light'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                          : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      <Sun size={12} /> Claro
                    </button>
                  </div>
                </div>

                {/* Idioma com Botoes Estilizados */}
                <div className="flex items-center justify-between p-3.5 bg-[var(--hover)]/40 rounded-2xl border border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-[var(--neon)]" />
                    <div>
                      <p className="text-xs font-semibold m-0 text-[var(--text)]">Idioma do Painel</p>
                      <p className="text-[10px] text-[var(--subtle)] m-0">Linguagem da interface</p>
                    </div>
                  </div>

                  {/* Segmented Control Neon */}
                  <div className="flex bg-[var(--bg)] p-1 rounded-xl border border-[var(--border)] gap-1">
                    <button
                      type="button"
                      onClick={() => setLangPref('pt')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        langPref === 'pt'
                          ? 'bg-[var(--neonDim)] text-[var(--neon)] border-[var(--neonBorder)] shadow-[0_0_10px_var(--neonDim)]'
                          : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      🇧🇷 PT-BR
                    </button>
                    <button
                      type="button"
                      onClick={() => setLangPref('en')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        langPref === 'en'
                          ? 'bg-[var(--neonDim)] text-[var(--neon)] border-[var(--neonBorder)] shadow-[0_0_10px_var(--neonDim)]'
                          : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      🇺🇸 EN-US
                    </button>
                  </div>
                </div>

                {/* Notificações em Tempo Real */}
                <div className="flex items-center justify-between p-3.5 bg-[var(--hover)]/40 rounded-2xl border border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <Bell size={18} className="text-[var(--neon)]" />
                    <div>
                      <p className="text-xs font-semibold m-0 text-[var(--text)]">Notificações Instantâneas</p>
                      <p className="text-[10px] text-[var(--subtle)] m-0">Exibir toasts de novos eventos ao vivo</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsSound}
                    onChange={(e) => setNotificationsSound(e.target.checked)}
                    className="w-4 h-4 accent-[var(--neon)] cursor-pointer"
                  />
                </div>

                {/* Alertas Críticos */}
                <div className="flex items-center justify-between p-3.5 bg-[var(--hover)]/40 rounded-2xl border border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-emerald-400" />
                    <div>
                      <p className="text-xs font-semibold m-0 text-[var(--text)]">Filtro de Incidentes</p>
                      <p className="text-[10px] text-[var(--subtle)] m-0">Destacar alertas com alta criticidade</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={highPriorityAlerts}
                    onChange={(e) => setHighPriorityAlerts(e.target.checked)}
                    className="w-4 h-4 accent-[var(--neon)] cursor-pointer"
                  />
                </div>
              </div>
            </>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-3 border-t border-[var(--border)] mt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut size={15} /> Sair da Conta
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[var(--neon)] hover:opacity-95 text-[var(--bg)] font-bold text-xs shadow-[0_0_15px_var(--neonDim)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save size={15} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
