import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import AppLayout from './layouts/AppLayout';

import Overview from './pages/Overview';
import WhatsApp from './pages/WhatsApp';
import Github from './pages/Github';
import Services from './pages/Services';
import Contacts from './pages/Contacts';
import Endpoints from './pages/Endpoints';
import Placeholder from './pages/Placeholder';

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

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster theme="dark" position="top-right" />
      {!session ? (
        <Auth />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout session={session} />}>
              <Route index element={<Overview />} />
              <Route path="whatsapp" element={<WhatsApp />} />
              <Route path="github" element={<Github />} />
              <Route path="services" element={<Services />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="endpoints" element={<Endpoints />} />
              <Route path="stats" element={<Placeholder title="Estatísticas" subtitle="Estatísticas do sistema" />} />
              <Route path="channels" element={<Placeholder title="Canais" subtitle="Canais ativos" />} />
              <Route path="reports" element={<Placeholder title="Relatórios" subtitle="Relatórios e dados" />} />
              <Route path="inbox" element={<Placeholder title="Inbox" subtitle="Caixa de Entrada" />} />
              <Route path="alerts" element={<Placeholder title="Alertas" subtitle="Alertas do Sistema" />} />
              <Route path="*" element={<Overview />} />
            </Route>
          </Routes>
        </BrowserRouter>
      )}
    </QueryClientProvider>
  );
}
