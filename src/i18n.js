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
        whatsapp: 'WhatsApp',
        services: 'Services',
        contacts: 'Contacts',
        analytics: 'Analytics',
        stats: 'Statistics',
        channels: 'Channels',
        endpoints: 'Endpoints',
        reports: 'Reports'
      },
      header: {
        searchPlaceholder: 'Search here...',
        backendStatus: 'Backend',
        checking: 'Checking...',
        online: 'Online',
        offline: 'Offline',
        language: 'Language'
      },
      sidebar: {
        devSystem: 'Dev System',
        version: 'Ver. 1.0.0'
      },
      messages: {
        fillFields: 'Fill in number and message!',
        sentSuccess: '✅ Message sent!',
        errorPrefix: 'Error: ',
        reqError: 'Request error.'
      },
      dashboard: {
        inboxMsg1: 'New push event received',
        inboxMsg2: 'Backend started successfully',
        inboxMsg3: 'QR Code generated, waiting for scan',
        alertMsg1: 'WhatsApp disconnected — reconnect the bot',
        alertMsg2: 'Supabase: 0 vulnerabilities detected',
        alertMsg3: 'New endpoint /api/status available',
        days: {
          mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun'
        },
        endpoints: {
          serverStatus: 'Server status',
          waStatus: 'WhatsApp status',
          sendMsg: 'Send message',
          listGithub: 'List GitHub events',
          receiveGithub: 'Receive GitHub webhook'
        },
        overviewSubtitle: 'Real-time overview of your system',
        githubEvents: 'GitHub Events',
        thisWeek: '+12.5% this week',
        stable: 'Stable',
        failed: 'Failed',
        connected: 'Connected',
        disconnected: 'Disconnected',
        lastMeasurement: 'Last measurement',
        eventsPerDay: 'Events per day (simulated)',
        basedOnConnection: 'Based on connection',
        dbStatus: 'DB Status',
        supabaseConnected: 'Supabase Connected',
        recordsSaved: 'records saved',
        latestEvents: 'Latest Events',
        seeAll: 'See all',
        noEvents: 'No events received.',
        unreadMessages: 'unread messages',
        ago: 'ago',
        systemAlerts: 'System notifications and alerts',
        noAlerts: 'No alerts at the moment',
        sendWebhook: 'Send Webhook (Simulate)',
        numberExample: 'Number (Ex: 551199999999)',
        message: 'Message',
        send: 'Send',
        scanQrCode: 'Scan the QR Code to connect'
      }
    }
  },
  pt: {
    translation: {
      nav: {
        inbox: 'Inbox',
        alerts: 'Alertas',
        overview: 'Visão Geral',
        integrations: 'Integrações',
        github: 'GitHub',
        whatsapp: 'WhatsApp',
        services: 'Serviços',
        contacts: 'Contatos',
        analytics: 'Analytics',
        stats: 'Estatísticas',
        channels: 'Canais',
        endpoints: 'Endpoints',
        reports: 'Relatórios'
      },
      header: {
        searchPlaceholder: 'Buscar aqui...',
        backendStatus: 'Backend',
        checking: 'Verificando...',
        online: 'Online',
        offline: 'Offline',
        language: 'Idioma'
      },
      sidebar: {
        devSystem: 'Dev System',
        version: 'Ver. 1.0.0'
      },
      messages: {
        fillFields: 'Preencha número e mensagem!',
        sentSuccess: '✅ Mensagem enviada!',
        errorPrefix: 'Erro: ',
        reqError: 'Erro na requisição.'
      },
      dashboard: {
        inboxMsg1: 'Novo push event recebido',
        inboxMsg2: 'Backend iniciado com sucesso',
        inboxMsg3: 'QR Code gerado, aguardando scan',
        alertMsg1: 'WhatsApp desconectado — reconecte o bot',
        alertMsg2: 'Supabase: 0 vulnerabilidades detectadas',
        alertMsg3: 'Novo endpoint /api/status disponível',
        days: {
          mon: 'Seg', tue: 'Ter', wed: 'Qua', thu: 'Qui', fri: 'Sex', sat: 'Sab', sun: 'Dom'
        },
        endpoints: {
          serverStatus: 'Status do servidor',
          waStatus: 'Status do WhatsApp',
          sendMsg: 'Enviar mensagem',
          listGithub: 'Listar eventos GitHub',
          receiveGithub: 'Receber webhook GitHub'
        },
        overviewSubtitle: 'Visão geral em tempo real do seu sistema',
        githubEvents: 'Eventos GitHub',
        thisWeek: '+12.5% esta semana',
        stable: 'Estável',
        failed: 'Falha',
        connected: 'Conectado',
        disconnected: 'Desconectado',
        lastMeasurement: 'Última medição',
        eventsPerDay: 'Eventos por dia (simulado)',
        basedOnConnection: 'Baseado na conexão',
        dbStatus: 'Status DB',
        supabaseConnected: 'Supabase Conectado',
        recordsSaved: 'registros salvos',
        latestEvents: 'Últimos Eventos',
        seeAll: 'Ver todos',
        noEvents: 'Nenhum evento recebido.',
        unreadMessages: 'mensagens não lidas',
        ago: 'atrás',
        systemAlerts: 'Notificações e alertas do sistema',
        noAlerts: 'Sem alertas no momento',
        sendWebhook: 'Enviar Webhook (Simular)',
        numberExample: 'Número (Ex: 551199999999)',
        message: 'Mensagem',
        send: 'Enviar',
        scanQrCode: 'Escaneie o QR Code para conectar'
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
