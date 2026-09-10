import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, RefreshCw, LogIn, CheckCircle2, AlertCircle } from 'lucide-react';
import Logo from './Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import RotateButton from './RotateButton';

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

    if (!isSupabaseConfigured) {
      return setErrorMsg('Configuração do Supabase pendente. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no painel da Vercel (Settings -> Environment Variables).');
    }

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

  // Status de correspondência de senhas em tempo real
  const passwordsMatch = confirmPassword && password === confirmPassword;
  const passwordsMismatch = confirmPassword && password !== confirmPassword;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-3 sm:p-6 bg-[var(--bg)] text-[var(--text)] font-sans overflow-y-auto select-none">
      {/* Botão de Girar Tela Exclusivo para Mobile */}
      <div className="absolute top-4 right-4 z-20 md:hidden">
        <RotateButton variant="pill" />
      </div>

      {/* Elementos Decorativos de Fundo (Glow Orbs) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[var(--neonDim)] rounded-full blur-[140px] pointer-events-none opacity-40"></div>
      <div className="absolute -bottom-20 right-10 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Card Principal Glassmorphism - Formato Quadrado Equilibrado */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-[390px] p-7 sm:p-8 rounded-3xl bg-[var(--card)]/90 backdrop-blur-2xl border border-[var(--border)] shadow-[0_20px_50px_rgba(0,0,0,0.7)] my-auto"
      >
        {/* Cabeçalho */}
        <div className="text-center mb-5">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="w-12 h-12 mx-auto mb-2.5 rounded-2xl flex items-center justify-center bg-[var(--bg)] border border-[var(--neonBorder)] shadow-[0_0_25px_var(--neonDim)]"
          >
            <Logo size={26} />
          </motion.div>
          <h1 className="m-0 text-xl font-black tracking-tight text-[var(--text)] flex items-center justify-center gap-2">
            DevSystem
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)] tracking-wide">
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

        {!isSupabaseConfigured && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 leading-relaxed">
            <AlertCircle size={17} className="shrink-0 text-amber-400 mt-0.5" />
            <div>
              <strong className="block text-amber-300 font-semibold mb-0.5">Configuração Pendente</strong>
              Defina as variáveis do Supabase no painel da Vercel (Settings &rarr; Environment Variables).
            </div>
          </div>
        )}

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
          <form onSubmit={handleAuth} className="flex flex-col gap-3.5">
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

            {/* Alternância Elegante */}
            <div className="mt-3 pt-2.5 border-t border-[var(--border)] text-center">
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
