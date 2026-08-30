import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff } from 'lucide-react';
import Logo from './Logo';

// ── Design tokens ──────────────────────────────
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

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg('Conta criada com sucesso! Você já pode entrar.');
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw', height: '100vh', background: C.bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: C.card, padding: '2.5rem', borderRadius: '1.25rem',
        border: `1px solid ${C.border}`, width: '100%', maxWidth: '420px',
        boxShadow: `0 0 40px rgba(0,0,0,0.6)`
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '4rem', height: '4rem', background: C.bg, borderRadius: '1rem',
            margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${C.border}`,
            boxShadow: `0 0 25px ${C.neonDim}`
          }}>
            <Logo size={36} />
          </div>
          <h1 style={{ margin: 0, color: C.text, fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
            DevSystem
          </h1>
          <p style={{ margin: '0.5rem 0 0', color: C.muted, fontSize: '0.875rem' }}>
            {isLogin ? 'Faça login na sua conta' : 'Crie sua nova conta de desenvolvedor'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: `1px solid ${C.red}`, color: C.red, padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: C.neonDim, border: `1px solid ${C.neonBorder}`, color: C.neon, padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: '0.75rem', marginBottom: '0.375rem' }}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: '0.75rem', marginBottom: '0.375rem' }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingRight: '2.5rem' }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: C.subtle, cursor: 'pointer', padding: 0, display: 'flex'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: C.neon,
              color: C.bg,
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
              boxShadow: `0 0 15px ${C.neonDim}`
            }}
          >
            {loading ? 'Aguarde...' : (isLogin ? 'Entrar no Sistema' : 'Criar Conta')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: C.muted,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
