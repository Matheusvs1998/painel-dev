import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        inbox: 'Inbox',
        alerts: 'Alerts',
        overview: 'Overview',
        integrations: 'Integrations',
        github: 'GitHub',
        services: 'Services',
        contacts: 'Agents & Integrations',
        analytics: 'Analytics',
        stats: 'Statistics',
        channels: 'Channels',
        endpoints: 'Endpoints',
        reports: 'Reports',
        workspace: 'Dev Studio & IA'
      },
      header: {
        searchPlaceholder: 'Search anything...',
        backendStatus: 'Backend',
        checking: 'Checking...',
        online: 'Online',
        offline: 'Offline',
        language: 'Language'
      },
      sidebar: {
        devSystem: 'DevSystem Pro',
        version: 'v1.2.0 • Active'
      },
      dashboard: {
        overviewSubtitle: 'Real-time overview of your development ecosystem',
        githubEvents: 'GitHub Events',
        thisWeek: 'Total accumulated',
        eventsPerDay: 'Event Flow by Day',
        dbStatus: 'Database Status',
        supabaseConnected: 'Supabase Connected',
        days: {
          mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun'
        }
      }
    }
  },
  pt: {
    translation: {
      nav: {
        inbox: 'Inbox',
        alerts: 'Alertas',
        overview: 'Visão Geral',
        workspace: 'Dev Studio & IA',
        integrations: 'Integrações',
        github: 'GitHub',
        services: 'Serviços',
        contacts: 'Agentes & Integrações',
        analytics: 'Analytics',
        stats: 'Estatísticas',
        channels: 'Canais',
        endpoints: 'Endpoints',
        reports: 'Relatórios'
      },
      header: {
        searchPlaceholder: 'Buscar no sistema...',
        backendStatus: 'Backend',
        checking: 'Verificando...',
        online: 'Online',
        offline: 'Offline',
        language: 'Idioma'
      },
      sidebar: {
        devSystem: 'DevSystem Pro',
        version: 'v1.2.0 • Ativo'
      },
      dashboard: {
        overviewSubtitle: 'Visão geral em tempo real do ecossistema de desenvolvimento',
        githubEvents: 'Eventos GitHub',
        thisWeek: 'Total acumulado',
        eventsPerDay: 'Fluxo de Eventos por Dia',
        dbStatus: 'Status do Banco',
        supabaseConnected: 'Supabase Conectado',
        days: {
          mon: 'Seg', tue: 'Ter', wed: 'Qua', thu: 'Qui', fri: 'Sex', sat: 'Sáb', sun: 'Dom'
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
