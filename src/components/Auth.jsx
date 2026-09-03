import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, RefreshCw, LogIn, CheckCircle2, AlertCircle } from 'lucide-react';
import Logo from './Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function Auth() {
  // 'login' | 'signup' | 'verify_otp'
  const [authMode, setAuthMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Login ou Cadastro com Validação de Senha Idêntica
  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validação estrita de senhas no modo de cadastro
    if (authMode === 'signup') {
      if (password.length < 6) {
        return setErrorMsg('A senha deve conter pelo menos 6 caracteres.');
      }
      if (password !== confirmPassword) {
        return setErrorMsg('As senhas não coincidem. Digite a mesma senha nos dois campos para confirmar.');
      }
    }

    setLoading(true);

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Login realizado com sucesso!');
      } else if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // Se o Supabase exigir confirmação por e-mail
        if (!data.session) {
          setAuthMode('verify_otp');
          setSuccessMsg(`Enviamos um token de segurança para ${email}. Digite os 6 dígitos abaixo:`);
          toast.info('Código enviado para seu e-mail!');
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
    const cleanToken = otpToken.trim();
    if (!cleanToken || cleanToken.length < 6) {
      return setErrorMsg('Digite o token completo de 6 dígitos recebido por e-mail.');
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let res = await supabase.auth.verifyOtp({
        email,
        token: cleanToken,
        type: 'signup'
      });

      if (res.error) {
        res = await supabase.auth.verifyOtp({
          email,
          token: cleanToken,
          type: 'email'
        });
      }

      if (res.error && password) {
        const loginRes = await supabase.auth.signInWithPassword({ email, password });
        if (!loginRes.error) {
          toast.success('Conta confirmada com sucesso!');
          return;
        }
      }

      if (res.error) throw res.error;
      toast.success('Conta confirmada com sucesso! Bem-vindo ao DevSystem.');
    } catch (error) {
      console.error('Erro na validação:', error);
      if (error.message?.includes('expired') || error.message?.includes('invalid')) {
        setErrorMsg('O token digitado é inválido ou expirou. Clique em "Reenviar código" ou tente entrar direto se já clicou no link.');
      } else {
        setErrorMsg(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Tentar login direto
  const tryDirectLogin = async () => {
    if (!password) {
      setAuthMode('login');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      setErrorMsg('Não foi possível entrar direto. Por favor, reenvie o código ou verifique sua senha.');
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
      setOtpToken('');
      toast.success('Novo código de confirmação enviado!');
      setSuccessMsg(`Um novo código de 6 dígitos foi enviado para ${email}.`);
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

  // Status de correspondência de senhas em tempo real
  const passwordsMatch = confirmPassword && password === confirmPassword;
  const passwordsMismatch = confirmPassword && password !== confirmPassword;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#080d14] text-[var(--text)] font-sans overflow-hidden select-none">
      {/* Elementos Decorativos de Fundo (Glow Orbs) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[var(--neonDim)] rounded-full blur-[140px] pointer-events-none opacity-40"></div>
      <div className="absolute -bottom-20 right-10 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Card Principal Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-[430px] p-8 sm:p-10 rounded-3xl bg-[var(--card)]/90 backdrop-blur-2xl border border-[var(--border)] shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
      >
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-[var(--bg)] border border-[var(--neonBorder)] shadow-[0_0_25px_var(--neonDim)]"
          >
            <Logo size={36} />
          </motion.div>
          <h1 className="m-0 text-2xl font-black tracking-tight text-[var(--text)] flex items-center justify-center gap-2">
            DevSystem
          </h1>
          <p className="mt-1.5 text-xs text-[var(--muted)] tracking-wide">
            {authMode === 'verify_otp' 
              ? 'Verificação de Autenticidade' 
              : authMode === 'signup' 
                ? 'Crie sua conta no ecossistema de desenvolvimento' 
                : 'Painel de Controle & Monitoramento em Tempo Real'}
          </p>
        </div>

        {/* Mensagens de Alerta e Sucesso */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center leading-relaxed"
            >
              {errorMsg}
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 rounded-xl bg-[var(--neonDim)] border border-[var(--neonBorder)] text-[var(--neon)] text-xs text-center leading-relaxed font-medium"
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODO DE VERIFICAÇÃO DE TOKEN OTP */}
        {authMode === 'verify_otp' ? (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--subtle)] mb-2">
                Código de 6 dígitos recebido:
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
                placeholder="000000"
                className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--neon)] focus:shadow-[0_0_20px_var(--neonDim)] rounded-xl py-3.5 text-center text-2xl font-mono font-bold tracking-[0.5em] text-[var(--neon)] outline-none transition-all"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 rounded-xl bg-[var(--neon)] text-[var(--bg)] font-black text-sm tracking-wide shadow-[0_0_20px_var(--neonDim)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Validando código...' : 'Confirmar & Entrar'}
            </motion.button>

            <button
              type="button"
              onClick={tryDirectLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[var(--hover)] hover:bg-[var(--neonDim)] text-[var(--text)] hover:text-[var(--neon)] border border-[var(--border)] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn size={14} /> Já cliquei no link do e-mail (Entrar Direto)
            </button>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="bg-transparent border-none text-xs font-medium text-[var(--neon)] hover:underline flex items-center gap-1.5 cursor-pointer p-0"
              >
                <RefreshCw size={13} /> Reenviar novo código
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="bg-transparent border-none text-xs text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-1 cursor-pointer p-0 transition-colors"
              >
                <ArrowLeft size={13} /> Voltar ao login
              </button>
            </div>
          </form>
        ) : (
          /* MODO DE LOGIN / CADASTRO */
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--subtle)] mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--subtle)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu.email@empresa.com"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--neon)] focus:shadow-[0_0_15px_var(--neonDim)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--text)] outline-none transition-all"
                />
              </div>
            </div>

            {/* Campo de Senha */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--subtle)] mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--subtle)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--neon)] focus:shadow-[0_0_15px_var(--neonDim)] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[var(--text)] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--subtle)] hover:text-[var(--text)] bg-transparent border-none cursor-pointer p-0"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Campo CONFIRMAR SENHA (Somente no Cadastro) */}
            {authMode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--subtle)]">
                    Confirmar Senha
                  </label>
                  {passwordsMatch && (
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 size={12} /> Senhas conferem
                    </span>
                  )}
                  {passwordsMismatch && (
                    <span className="text-[10px] text-red-400 font-medium flex items-center gap-1">
                      <AlertCircle size={12} /> Senhas diferentes
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--subtle)]" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repita sua senha exatamente"
                    className={`w-full bg-[var(--bg)] border rounded-xl pl-10 pr-10 py-2.5 text-xs text-[var(--text)] outline-none transition-all ${
                      passwordsMismatch 
                        ? 'border-red-500/50 focus:border-red-500' 
                        : passwordsMatch 
                          ? 'border-emerald-500/50 focus:border-emerald-500' 
                          : 'border-[var(--border)] focus:border-[var(--neon)]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--subtle)] hover:text-[var(--text)] bg-transparent border-none cursor-pointer p-0"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 rounded-xl bg-[var(--neon)] text-[var(--bg)] font-black text-xs uppercase tracking-wider shadow-[0_0_20px_var(--neonDim)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Processando...' : (authMode === 'login' ? 'Entrar no Sistema' : 'Criar Conta')}
            </motion.button>

            {/* Divisor */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-[1px] bg-[var(--border)]"></div>
              <span className="text-[10px] uppercase tracking-widest text-[var(--subtle)] font-bold">ou</span>
              <div className="flex-1 h-[1px] bg-[var(--border)]"></div>
            </div>

            {/* Botão Oficial do Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg)] hover:bg-[var(--hover)] border border-[var(--border)] hover:border-[var(--neonBorder)] text-xs font-semibold text-[var(--text)] flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Continuar com Google
            </button>

            {/* Alternância Elegante */}
            <div className="mt-3 pt-3 border-t border-[var(--border)] text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setConfirmPassword('');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="bg-transparent border-none text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
              >
                {authMode === 'login' ? (
                  <span>Não possui uma conta? <strong className="text-[var(--neon)] font-bold ml-1 hover:underline">Cadastre-se gratuitamente</strong></span>
                ) : (
                  <span>Já possui cadastro? <strong className="text-[var(--neon)] font-bold ml-1 hover:underline">Fazer Login</strong></span>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
