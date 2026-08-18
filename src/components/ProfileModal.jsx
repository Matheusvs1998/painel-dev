import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, RefreshCw, LogOut, Save, Upload } from 'lucide-react';

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
  padding: '0.75rem',
  background: C.bg,
  border: `1px solid ${C.border}`,
  borderRadius: '0.5rem',
  color: C.text,
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
};

export default function ProfileModal({ session, onClose }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(session?.user?.user_metadata?.full_name || '');
  const [avatarSeed, setAvatarSeed] = useState(session?.user?.user_metadata?.avatar_seed || session?.user?.email || 'default');
  const [customAvatarUrl, setCustomAvatarUrl] = useState(session?.user?.user_metadata?.custom_avatar_url || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name, avatar_seed: avatarSeed, custom_avatar_url: customAvatarUrl }
      });
      if (error) throw error;
      onClose(); // Fecha o modal após salvar
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const generateRandomSeed = () => {
    const randomString = Math.random().toString(36).substring(7);
    setAvatarSeed(randomString);
    setCustomAvatarUrl(''); // Volta a usar o DiceBear se gerar aleatório
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setCustomAvatarUrl(data.publicUrl);
    } catch (error) {
      setErrorMsg('Erro no upload. Verifique se o bucket "avatars" é público: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: C.card, padding: '2rem', borderRadius: '1rem',
        border: `1px solid ${C.border}`, width: '100%', maxWidth: '380px', position: 'relative'
      }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: C.muted, cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <h2 style={{ margin: '0 0 1.5rem', color: C.text, fontSize: '1.25rem', fontWeight: 'bold' }}>Editar Perfil</h2>

        {errorMsg && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: `1px solid ${C.red}`, color: C.red, padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <img 
              src={customAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
              alt="Avatar Preview" 
              style={{ width: '5rem', height: '5rem', borderRadius: '50%', border: `2px solid ${C.neon}`, background: C.bg, objectFit: 'cover' }} 
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: C.neonDim, border: `1px solid ${C.neonBorder}`, color: C.neon, padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.75rem', cursor: 'pointer' }}>
                <Upload size={14} /> Enviar Foto
                <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={loading} />
              </label>
              <button 
                type="button" 
                onClick={generateRandomSeed}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: C.bg, border: `1px solid ${C.border}`, color: C.muted, padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                <RefreshCw size={14} /> Avatar
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: '0.75rem', marginBottom: '0.375rem' }}>Nome de Exibição</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Matheus Vasconcelos"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={handleLogout}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${C.red}`, background: 'rgba(248,113,113,0.1)', color: C.red, fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <LogOut size={16} /> Sair
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 2, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: C.neon, color: C.bg, fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Save size={16} /> {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
