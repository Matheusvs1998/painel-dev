import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import AppLayout from './layouts/AppLayout';
import SplashScreen from './components/SplashScreen';

import Overview from './pages/Overview';
import Github from './pages/Github';
import Services from './pages/Services';
import Contacts from './pages/Contacts';
import Endpoints from './pages/Endpoints';
import Stats from './pages/Stats';
import Channels from './pages/Channels';
import Reports from './pages/Reports';
import Inbox from './pages/Inbox';
import Alerts from './pages/Alerts';
import Workspace from './pages/Workspace';

const queryClient = new QueryClient();

export default function App() {
  const [session, setSession] = useState(null);
  const [isSplashActive, setIsSplashActive] = useState(true);

  useEffect(() => {
    // Busca a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Tempo para a tela de abertura apresentar o logo animado
    const splashTimer = setTimeout(() => {
      setIsSplashActive(false);
    }, 1200);

    return () => {
      subscription.unsubscribe();
      clearTimeout(splashTimer);
    };
  }, []);

  // Forçar Orientação Paisagem (Landscape) para APK / Mobile
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);
  const [dismissRotateBanner, setDismissRotateBanner] = useState(false);

  useEffect(() => {
    const applyLandscape = async () => {
      try {
        if (window.screen?.orientation?.lock) {
          await window.screen.orientation.lock('landscape');
        }
      } catch (err) {
        // Exige fullscreen ou interação em alguns navegadores web
      }
    };

    applyLandscape();

    const handleInteraction = () => {
      applyLandscape();
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };

    window.addEventListener('touchstart', handleInteraction, { passive: true });
    window.addEventListener('click', handleInteraction, { passive: true });

    const checkOrientation = () => {
      const isMobile = window.innerWidth <= 768;
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsPortraitMobile(isMobile && isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const handleForceLandscape = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      if (window.screen?.orientation?.lock) {
        await window.screen.orientation.lock('landscape');
      }
    } catch (e) {
      toast.info('Vire seu celular para o modo horizontal.');
    }
  };

  // Supabase Realtime para escutar eventos do GitHub ao vivo
  useEffect(() => {
    if (!session) return;

    const currentAuthor = (session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || '').toLowerCase();

    const channel = supabase
      .channel('github_events_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'github_events' },
        (payload) => {
          const newEvent = payload.new;
          
          // Isolamento: só notifica se o evento for do perfil logado
          const matchesUser = newEvent.user_id && newEvent.user_id === session.user.id;
          const matchesAuthor = currentAuthor && newEvent.sender && newEvent.sender.toLowerCase().includes(currentAuthor);

          if (!matchesUser && !matchesAuthor && newEvent.user_id) {
            return;
          }

          toast.success(
            `🚀 GitHub: Novo evento "${newEvent.event_type || 'push'}" recebido!`,
            {
              description: `Autor: ${newEvent.sender || 'desconhecido'} no repo ${newEvent.repo || ''}`,
              duration: 5000,
            }
          );
          queryClient.invalidateQueries({ queryKey: ['githubEvents', session.user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster theme="dark" position="top-right" richColors />
      
      {/* Tela de Abertura Futurista com o Logo */}
      <AnimatePresence>
        {isSplashActive && <SplashScreen />}
      </AnimatePresence>

      {!session ? (
        <Auth />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout session={session} />}>
              <Route index element={<Overview />} />
              <Route path="github" element={<Github />} />
              <Route path="services" element={<Services />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="endpoints" element={<Endpoints />} />
              <Route path="stats" element={<Stats />} />
              <Route path="channels" element={<Channels />} />
              <Route path="reports" element={<Reports />} />
              <Route path="workspace" element={<Workspace />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="*" element={<Overview />} />
            </Route>
          </Routes>
        </BrowserRouter>
      )}

      {/* Aviso Inteligente para Rotação Paisagem no Mobile */}
      {session && isPortraitMobile && !dismissRotateBanner && (
        <div className="fixed bottom-3 left-3 right-3 z-50 flex items-center justify-between p-3 rounded-2xl bg-[#09110f] border border-[var(--neonBorder)] shadow-[0_0_25px_rgba(0,255,157,0.25)] text-xs text-white animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--neonDim)] flex items-center justify-center text-[var(--neon)] shrink-0 text-sm">
              📱
            </div>
            <div>
              <p className="font-bold text-[var(--neon)] m-0 leading-tight">Modo Paisagem Recomendado</p>
              <p className="text-[11px] text-[var(--subtle)] m-0 leading-tight">Gire seu celular na horizontal para o Dev Studio.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              onClick={handleForceLandscape}
              className="px-2.5 py-1.5 rounded-lg bg-[var(--neon)] text-[var(--bg)] font-bold text-[11px] hover:brightness-110 shadow-sm cursor-pointer"
            >
              Girar
            </button>
            <button
              onClick={() => setDismissRotateBanner(true)}
              className="p-1 text-[var(--subtle)] hover:text-white text-xs"
              title="Dispensar aviso"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </QueryClientProvider>
  );
}
