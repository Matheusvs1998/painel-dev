import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, KeyRound, Mail, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import Logo from './Logo';
import { toast } from 'sonner';

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
  padding: '0.75rem 1rem',
  background: C.bg,
  border: `1px solid ${C.border}`,
  borderRadius: '0.5rem',
  color: C.text,
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'all 0.2s',
  boxSizing: 'border-box'
};

export default function Auth() {
  // 'login' | 'signup' | 'verify_otp' | 'forgot_password'
  const [authMode, setAuthMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Login ou Cadastro
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Login realizado com sucesso!');
      } else if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // Se o Supabase exigir confirmação por e-mail (session null)
        if (!data.session) {
          setAuthMode('verify_otp');
          setSuccessMsg(`Enviamos um token de confirmação para ${email}. Digite o código abaixo para ativar sua conta:`);
          toast.info('Código de confirmação enviado para seu e-mail!');
        } else {
          toast.success('Conta criada e autenticada com sucesso!');
        }
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Verificação de Token OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpToken || otpToken.length < 6) {
      return setErrorMsg('Digite o token completo de 6 dígitos recebido por e-mail.');
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpToken.trim(),
        type: 'signup'
      });

      if (error) throw error;
      toast.success('Conta confirmada com sucesso! Bem-vindo.');
    } catch (error) {
      setErrorMsg(error.message || 'Token inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  // Reenviar Token OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });
      if (error) throw error;
      toast.success('Novo código de confirmação reenviado!');
      setSuccessMsg(`Reenviamos um novo código para ${email}.`);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Login com o Google (OAuth)
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      toast.error('Erro ao conectar com Google: ' + error.message);
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
        {/* Cabeçalho */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '3.75rem', height: '3.75rem', background: C.bg, borderRadius: '1rem',
            margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${C.border}`,
            boxShadow: `0 0 25px ${C.neonDim}`
          }}>
            <Logo size={34} />
          </div>
          <h1 style={{ margin: 0, color: C.text, fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
            DevSystem
          </h1>
          <p style={{ margin: '0.4rem 0 0', color: C.muted, fontSize: '0.85rem' }}>
            {authMode === 'verify_otp' 
              ? 'Confirmação de Segurança' 
              : authMode === 'signup' 
                ? 'Crie sua nova conta de desenvolvedor' 
                : 'Faça login na sua conta'}
          </p>
        </div>

        {/* Mensagens de Feedback */}
        {errorMsg && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: `1px solid ${C.red}`, color: C.red, padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: C.neonDim, border: `1px solid ${C.neonBorder}`, color: C.neon, padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center', lineHeight: '1.4' }}>
            {successMsg}
          </div>
        )}

        {/* TELA DE VERIFICAÇÃO DE TOKEN OTP */}
        {authMode === 'verify_otp' ? (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: C.muted, fontSize: '0.75rem', marginBottom: '0.375rem' }}>
                Token de 6 dígitos recebido por e-mail:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  maxLength={6}
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                  style={{
                    ...inputStyle,
                    letterSpacing: '8px',
                    fontSize: '1.25rem',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: C.neon,
                    fontFamily: 'monospace'
                  }}
                  placeholder="123456"
                />
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
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s',
                boxShadow: `0 0 15px ${C.neonDim}`
              }}
            >
              {loading ? 'Validando token...' : 'Confirmar Token & Entrar'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: C.neon,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RefreshCw size={12} /> Reenviar código
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: C.muted,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ArrowLeft size={12} /> Voltar ao login
              </button>
            </div>
          </form>
        ) : (
          /* TELA DE LOGIN / CADASTRO */
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
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s',
                boxShadow: `0 0 15px ${C.neonDim}`
              }}
            >
              {loading ? 'Aguarde...' : (authMode === 'login' ? 'Entrar no Sistema' : 'Criar Conta')}
            </button>

            {/* Divisor */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0', gap: '0.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: C.border }}></div>
              <span style={{ fontSize: '0.7rem', color: C.subtle, textTransform: 'uppercase' }}>ou</span>
              <div style={{ flex: 1, height: '1px', background: C.border }}></div>
            </div>

            {/* Botão Login com Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem',
                borderRadius: '0.5rem',
                background: C.bg,
                border: `1px solid ${C.border}`,
                color: C.text,
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              className="hover:border-[var(--neonBorder)]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Continuar com Google
            </button>

            {/* Alternar entre Login e Cadastro */}
            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: C.muted,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {authMode === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça Login'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
