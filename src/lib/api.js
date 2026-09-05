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

export async function fetchGithubEvents(firstArg, senderArg, repoArg, githubUserArg) {
  try {
    const params = new URLSearchParams();
    if (typeof firstArg === 'object' && firstArg !== null) {
      const { userId, sender, repo, githubUser } = firstArg;
      if (userId) params.append('user_id', userId);
      if (sender) params.append('sender', sender);
      if (repo) params.append('repo', repo);
      if (githubUser) params.append('github_user', githubUser);
    } else {
      if (firstArg) params.append('user_id', firstArg);
      if (senderArg) params.append('sender', senderArg);
      if (repoArg) params.append('repo', repoArg);
      if (githubUserArg) params.append('github_user', githubUserArg);
    }
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/api/webhooks/github/events${qs}`);
    if (!res.ok) throw new Error('Falha ao buscar eventos do GitHub');
    return await res.json();
  } catch (error) {
    console.error('[API] Erro ao buscar eventos:', error);
    return [];
  }
}

export async function simulateGithubEvent(payload = {}) {
  try {
    const res = await fetch(`${API_BASE}/api/webhooks/github/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Falha ao simular evento');
    return await res.json();
  } catch (error) {
    console.error('[API] Erro ao simular evento:', error);
    throw error;
  }
}

export async function askDevAiCopilot({ action, code, filename, prompt }) {
  try {
    const res = await fetch(`${API_BASE}/api/ai/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, code, filename, prompt })
    });
    if (!res.ok) throw new Error('Falha ao comunicar com o DevAI');
    return await res.json();
  } catch (error) {
    console.warn('[API] Erro no DevAI Copilot:', error);
    throw error;
  }
}

export { API_BASE };
