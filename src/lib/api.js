const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export async function fetchApiStatus() {
  const t0 = Date.now();
  try {
    const res = await fetch(`${API_BASE}/api/status`);
    if (!res.ok) throw new Error('Falha ao obter status');
    const data = await res.json();
    return {
      ...data,
      pingMs: Date.now() - t0,
    };
  } catch (error) {
    return {
      status: 'offline',
      error: error.message,
      pingMs: null,
    };
  }
}

export async function fetchGithubEvents() {
  try {
    const res = await fetch(`${API_BASE}/api/webhooks/github/events`);
    if (!res.ok) throw new Error('Falha ao buscar eventos do GitHub');
    return await res.json();
  } catch (error) {
    console.error('[API] Erro ao buscar eventos:', error);
    return [];
  }
}

export { API_BASE };
