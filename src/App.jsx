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
              <Route path="inbox" element={<Inbox />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="*" element={<Overview />} />
            </Route>
          </Routes>
        </BrowserRouter>
      )}
    </QueryClientProvider>
  );
}
