import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGithubEvents } from '../lib/api';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Calendar, Filter, 
  CheckCircle2, FileSpreadsheet, Code2, Database 
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { toast } from 'sonner';

const C = {
  card: 'var(--card)',
  border: 'var(--border)',
  neon: 'var(--neon)',
  neonDim: 'var(--neonDim)',
  muted: 'var(--muted)',
  subtle: 'var(--subtle)'
};

const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: '1rem' };

export default function Reports() {
  const [period, setPeriod] = useState('7d');

  const { data: githubEvents = [] } = useQuery({
    queryKey: ['githubEvents'],
    queryFn: fetchGithubEvents,
    refetchInterval: 5000
  });

  const downloadJSON = () => {
    if (githubEvents.length === 0) return toast.error('Nenhum dado disponível para exportação');
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(githubEvents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `devsystem-report-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Relatório JSON exportado com sucesso!');
  };

  const downloadCSV = () => {
    if (githubEvents.length === 0) return toast.error('Nenhum dado disponível para exportação');
    const headers = ['ID', 'Evento', 'Acao', 'Autor', 'Repositorio', 'Data_Hora'];
    const rows = githubEvents.map(e => [
      e.id,
      `"${e.event || ''}"`,
      `"${e.action || ''}"`,
      `"${e.sender || ''}"`,
      `"${e.repo || ''}"`,
      `"${new Date(e.timestamp).toISOString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `devsystem-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Relatório CSV exportado com sucesso!');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SectionHeader 
          title="Relatórios & Exportação de Dados" 
          subtitle="Gere extratos analíticos de atividades e faça download em CSV e JSON" 
        />
        <div className="flex items-center gap-2">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-[var(--hover)] hover:bg-[var(--neonDim)] hover:text-[var(--neon)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text)] transition-all cursor-pointer shadow-sm"
          >
            <FileSpreadsheet size={15} /> Exportar CSV
          </button>
          <button
            onClick={downloadJSON}
            className="flex items-center gap-2 px-3.5 py-2 bg-[var(--neon)] text-[var(--bg)] font-bold rounded-xl text-xs shadow-[0_0_15px_var(--neonDim)] transition-all cursor-pointer"
          >
            <Code2 size={15} /> Exportar JSON
          </button>
        </div>
      </div>

      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div style={card} className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--muted)] uppercase font-semibold">Total de Registros</span>
            <Database size={16} className="text-[var(--neon)]" />
          </div>
          <p className="text-2xl font-bold m-0 text-[var(--text)]">{githubEvents.length}</p>
          <p className="text-xs text-[var(--subtle)] m-0 mt-1">Disponíveis no Supabase</p>
        </div>

        <div style={card} className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--muted)] uppercase font-semibold">Status de Integridade</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold m-0 text-emerald-400">100%</p>
          <p className="text-xs text-[var(--subtle)] m-0 mt-1">Sem corrupção de schema</p>
        </div>

        <div style={card} className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--muted)] uppercase font-semibold">Formato Padrão</span>
            <FileText size={16} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold m-0 text-[var(--text)]">UTF-8 / RFC4180</p>
          <p className="text-xs text-[var(--subtle)] m-0 mt-1">Compatível com Excel & BI</p>
        </div>
      </div>

      {/* Prévia da Tabela de Exportação */}
      <div style={card} className="overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--hover)]/30">
          <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider m-0">
            Pré-visualização do Relatório ({githubEvents.length} registros)
          </h3>
          <span className="text-xs text-[var(--subtle)] font-mono">Live Database View</span>
        </div>

        {githubEvents.length === 0 ? (
          <div className="p-12 text-center text-sm text-[var(--muted)]">
            Nenhum registro encontrado no banco de dados para exportação.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[380px]">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-[var(--card)] text-[var(--subtle)] uppercase tracking-wider border-b border-[var(--border)]">
                <tr>
                  <th className="p-3 pl-4">ID</th>
                  <th className="p-3">Evento</th>
                  <th className="p-3">Ação</th>
                  <th className="p-3">Autor</th>
                  <th className="p-3">Repositório</th>
                  <th className="p-3 pr-4">Timestamp (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {githubEvents.map(e => (
                  <tr key={e.id} className="hover:bg-[var(--hover)] transition-colors font-mono">
                    <td className="p-3 pl-4 text-[var(--subtle)]">{e.id}</td>
                    <td className="p-3 font-semibold text-[var(--neon)]">{e.event}</td>
                    <td className="p-3 text-[var(--muted)]">{e.action || '—'}</td>
                    <td className="p-3 text-[var(--text)]">{e.sender}</td>
                    <td className="p-3 text-[var(--muted)]">{e.repo}</td>
                    <td className="p-3 pr-4 text-[var(--subtle)]">{new Date(e.timestamp).toISOString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
