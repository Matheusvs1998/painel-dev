import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import AppLayout from './layouts/AppLayout';

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Supabase Realtime para escutar eventos do GitHub ao vivo
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('github_events_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'github_events' },
        (payload) => {
          const newEvent = payload.new;
          toast.success(
            `🚀 GitHub: Novo evento "${newEvent.event_type || 'push'}" recebido!`,
            {
              description: `Autor: ${newEvent.sender || 'desconhecido'} no repo ${newEvent.repo || ''}`,
              duration: 5000,
            }
          );
          queryClient.invalidateQueries({ queryKey: ['githubEvents'] });
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
