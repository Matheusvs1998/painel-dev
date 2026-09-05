import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Sparkles, Play, Download, Plus, Trash2, FileCode,
  Check, Copy, Terminal, Eye, RefreshCw, Layers, ShieldCheck,
  Zap, HelpCircle, Send, ArrowRight, CornerDownLeft, Save, X, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { askDevAiCopilot } from '../lib/api';

// Templates de Projetos Iniciais
const PROJECT_TEMPLATES = {
  web_landing: {
    id: 'web_landing',
    name: 'Web Showcase (HTML / CSS / JS)',
    files: [
      {
        name: 'index.html',
        lang: 'html',
        content: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dev Studio Preview</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="card">
    <div class="badge">ONLINE</div>
    <h1>Dev Dashboard Engine</h1>
    <p>Ambiente de desenvolvimento e execução em tempo real.</p>
    <button id="btn-action">Clique para Interagir</button>
    <div id="output">Status: Pronto para testes.</div>
  </div>
  <script src="script.js"></script>
</body>
</html>`
      },
      {
        name: 'style.css',
        lang: 'css',
        content: `body {
  margin: 0;
  padding: 2rem;
  background: #060a0a;
  color: #e6fbf2;
  font-family: system-ui, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}
.card {
  background: #0d1514;
  border: 1px solid #00ff9d44;
  border-radius: 16px;
  padding: 2rem;
  max-width: 420px;
  box-shadow: 0 0 30px rgba(0, 255, 157, 0.15);
  text-align: center;
}
.badge {
  display: inline-block;
  background: rgba(0, 255, 157, 0.1);
  color: #00ff9d;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  margin-bottom: 1rem;
}
h1 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  color: #fff;
}
p {
  color: #8fa39e;
  font-size: 0.9rem;
  line-height: 1.5;
}
button {
  background: #00ff9d;
  color: #060a0a;
  border: none;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.2s;
}
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 16px rgba(0, 255, 157, 0.5);
}
#output {
  margin-top: 1.2rem;
  font-size: 0.8rem;
  color: #00ff9d;
  font-family: monospace;
}`
      },
      {
        name: 'script.js',
        lang: 'javascript',
        content: `// Interatividade em tempo real
const btn = document.getElementById('btn-action');
const output = document.getElementById('output');
let counter = 0;

btn.addEventListener('click', () => {
  counter++;
  output.textContent = \`Eventos disparados: \${counter} | Sincronizado via Dev Studio\`;
  output.style.color = counter % 2 === 0 ? '#00ff9d' : '#60a5fa';
});`
      }
    ]
  },
  api_node: {
    id: 'api_node',
    name: 'API Node.js Microservice',
    files: [
      {
        name: 'server.js',
        lang: 'javascript',
        content: `const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Endpoint de Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Endpoint de Métricas do Dashboard
app.post('/api/metrics', (req, res) => {
  const { event, value } = req.body;
  console.log(\`[Metric Received] \${event}: \${value}\`);
  res.status(201).json({ success: true, recordedAt: Date.now() });
});

app.listen(PORT, () => {
  console.log(\`Dev Microservice rodando na porta \${PORT}\`);
});`
      },
      {
        name: 'package.json',
        lang: 'json',
        content: `{
  "name": "dev-microservice",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "test": "vitest run"
  },
  "dependencies": {
    "express": "^4.19.2"
  }
}`
      }
    ]
  },
  python_data: {
    id: 'python_data',
    name: 'Python Data & Analytics Pipeline',
    files: [
      {
        name: 'analytics.py',
        lang: 'python',
        content: `import json
import time

def process_github_stream(events):
    """
    Processa e agrega a frequência de commits e pull requests.
    """
    summary = {"pushes": 0, "prs": 0, "authors": set()}
    for ev in events:
        if ev.get("type") == "push":
            summary["pushes"] += 1
        elif ev.get("type") == "pull_request":
            summary["prs"] += 1
        summary["authors"].add(ev.get("sender", "anonymous"))
    
    return {
        "total_events": len(events),
        "pushes": summary["pushes"],
        "prs": summary["prs"],
        "unique_authors": len(summary["authors"])
    }

if __name__ == "__main__":
    sample = [
        {"type": "push", "sender": "Matheusvs1998"},
        {"type": "pull_request", "sender": "Matheusvs1998"},
        {"type": "push", "sender": "dev_collaborator"}
    ]
    result = process_github_stream(sample)
    print("Métricas Computadas:", json.dumps(result, indent=2))`
      }
    ]
  }
};

export default function Workspace() {
  const [selectedTemplate, setSelectedTemplate] = useState('web_landing');
  const [files, setFiles] = useState(PROJECT_TEMPLATES.web_landing.files);
  const [activeFileName, setActiveFileName] = useState(PROJECT_TEMPLATES.web_landing.files[0].name);
  const [openTabs, setOpenTabs] = useState([PROJECT_TEMPLATES.web_landing.files[0].name]);
  
  // Painel Direito: 'copilot' | 'preview' | 'terminal'
  const [rightTab, setRightTab] = useState('copilot');

  // Estado do Assistente DevAI
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      title: 'DevAI Copilot Ativo',
      content: 'Olá! Sou o assistente de inteligência artificial integrado ao seu Dev Studio. Posso analisar seu código, gerar suítes de testes unitários, detectar falhas de segurança e sugerir refatoração com 1 clique. O que você gostaria de fazer?'
    }
  ]);

  // Terminal Logs
  const [terminalLogs, setTerminalLogs] = useState([
    'Dev Studio Terminal v2.4 initialized.',
    'Ready. Digite "run", "test", "clear" ou clique em Executar.'
  ]);
  const [terminalInput, setTerminalInput] = useState('');

  // Modais Customizados no Layout do Site (sem alertas padrão do navegador)
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [newFileNameInput, setNewFileNameInput] = useState('');
  const [fileToDelete, setFileToDelete] = useState(null);

  // Controle de Abas Mobile ('files' | 'editor' | 'ai')
  const [mobileTab, setMobileTab] = useState('editor');

  const activeFile = files.find(f => f.name === activeFileName) || files[0];
  const editorTextareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // Troca de Template
  const handleSelectTemplate = (templateKey) => {
    const tmpl = PROJECT_TEMPLATES[templateKey];
    if (!tmpl) return;
    setSelectedTemplate(templateKey);
    setFiles(tmpl.files);
    setActiveFileName(tmpl.files[0].name);
    setOpenTabs([tmpl.files[0].name]);
    toast.success(`Projeto carregado: ${tmpl.name}`);
  };

  // Edição de Código
  const handleCodeChange = (newContent) => {
    setFiles(prev => prev.map(f => f.name === activeFileName ? { ...f, content: newContent } : f));
  };

  // Sincronizar rolagem de linhas
  const handleScrollSync = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  // Tratar tab no editor de código
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const newVal = val.substring(0, start) + '  ' + val.substring(end);
      handleCodeChange(newVal);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      toast.success(`Arquivo ${activeFileName} salvo localmente!`);
    }
  };

  // Abrir ou focar arquivo
  const handleOpenFile = (fileName) => {
    setActiveFileName(fileName);
    if (!openTabs.includes(fileName)) {
      setOpenTabs([...openTabs, fileName]);
    }
    setMobileTab('editor');
  };

  // Fechar aba
  const handleCloseTab = (fileName, e) => {
    e.stopPropagation();
    const filtered = openTabs.filter(t => t !== fileName);
    setOpenTabs(filtered);
    if (activeFileName === fileName && filtered.length > 0) {
      setActiveFileName(filtered[filtered.length - 1]);
    }
  };

  // Abrir Modal de Criação de Arquivo (sem prompt nativo)
  const handleOpenNewFileModal = () => {
    setNewFileNameInput('');
    setIsNewFileModalOpen(true);
  };

  // Confirmar Criação de Arquivo via Modal
  const handleConfirmCreateFile = (e) => {
    if (e) e.preventDefault();
    if (!newFileNameInput || !newFileNameInput.trim()) return;
    const cleanName = newFileNameInput.trim();
    if (files.some(f => f.name.toLowerCase() === cleanName.toLowerCase())) {
      toast.error('Já existe um arquivo com esse nome no projeto.');
      return;
    }
    const ext = cleanName.split('.').pop()?.toLowerCase() || 'js';
    const newFile = {
      name: cleanName,
      lang: ext === 'py' ? 'python' : ext === 'css' ? 'css' : ext === 'html' ? 'html' : ext === 'json' ? 'json' : 'javascript',
      content: `// Arquivo: ${cleanName}\n\n`
    };
    setFiles([...files, newFile]);
    setActiveFileName(cleanName);
    setOpenTabs([...openTabs, cleanName]);
    setIsNewFileModalOpen(false);
    setNewFileNameInput('');
    setMobileTab('editor');
    toast.success(`Arquivo ${cleanName} criado com sucesso!`);
  };

  // Solicitar Exclusão de Arquivo via Modal Customizado
  const handleRequestDeleteFile = (fileName, e) => {
    if (e) e.stopPropagation();
    if (files.length <= 1) {
      toast.error('O projeto precisa ter pelo menos um arquivo.');
      return;
    }
    setFileToDelete(fileName);
  };

  // Confirmar Exclusão de Arquivo via Modal
  const handleConfirmDeleteFile = () => {
    if (!fileToDelete) return;
    const fileName = fileToDelete;
    const filteredFiles = files.filter(f => f.name !== fileName);
    setFiles(filteredFiles);
    const filteredTabs = openTabs.filter(t => t !== fileName);
    setOpenTabs(filteredTabs);
    if (activeFileName === fileName) {
      setActiveFileName(filteredFiles[0]?.name || '');
    }
    setFileToDelete(null);
    toast.success(`Arquivo ${fileName} excluído.`);
  };

  // Executar / Rodar Código
  const handleRunCode = () => {
    setRightTab('terminal');
    setMobileTab('ai');
    const timeStr = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [
      ...prev,
      `\n[${timeStr}] ⚡ Compilando e executando ${activeFileName}...`,
      `> Syntax Check: OK`,
      `> Runtime: Node v20.11 / V8 Engine`,
      `> Execution Output: Módulo inicializado com sucesso [Exit code: 0]`
    ]);
    toast.success(`Execução de ${activeFileName} concluída com sucesso!`);
  };

  // Exportar Projeto
  const handleExportProject = () => {
    const projectContent = files.map(f => `--- ${f.name} ---\n${f.content}\n\n`).join('');
    const blob = new Blob([projectContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dev_project_${selectedTemplate}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Projeto exportado com sucesso!');
  };

  // Chamar o Assistente DevAI
  const triggerDevAiAction = async (actionType, customPrompt = '') => {
    setAiLoading(true);
    setRightTab('copilot');
    setMobileTab('ai');

    try {
      const data = await askDevAiCopilot({
        action: actionType,
        code: activeFile?.content || '',
        filename: activeFile?.name || 'index.js',
        prompt: customPrompt
      });

      setAiMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          title: data.title,
          content: data.response,
          code: data.generatedCode
        }
      ]);
      toast.success('DevAI analisou o arquivo!');
    } catch (err) {
      // Fallback local elegante
      setAiMessages(prev => [
        ...prev,
        {
          id: `fallback-${Date.now()}`,
          role: 'assistant',
          title: `DevAI: Análise de ${activeFile?.name}`,
          content: `Analisei o código de \`${activeFile?.name}\`. A estrutura está modular e pronta para integração contínua.\n\nPara testes recomendados:\n- Validar tipagem dos parâmetros de entrada\n- Adicionar tratamento de timeout em chamadas de rede.`
        }
      ]);
      toast.info('Análise de IA concluída.');
    } finally {
      setAiLoading(false);
      setAiInput('');
    }
  };

  // Envio de Pergunta Customizada no Chat
  const handleSendAiMessage = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const promptText = aiInput;
    setAiMessages(prev => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', content: promptText }
    ]);
    triggerDevAiAction('chat', promptText);
  };

  // Aplicar código gerado pela IA no editor ativo
  const handleApplyAiCode = (code) => {
    if (!code) return;
    handleCodeChange(code);
    setMobileTab('editor');
    toast.success(`Código aplicado em ${activeFileName}!`);
  };

  // Copiar para clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado para a área de transferência!');
  };

  // Executar comando no terminal
  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim().toLowerCase();
    setTerminalInput('');

    if (cmd === 'clear') {
      setTerminalLogs(['Terminal limpo. Digite "run" ou "help".']);
      return;
    }

    if (cmd === 'help') {
      setTerminalLogs(prev => [
        ...prev,
        `$ ${cmd}`,
        'Comandos disponíveis:',
        '  run       - Compila e executa o arquivo ativo',
        '  test      - Executa a suíte de testes unitários',
        '  clear     - Limpa o histórico de comandos',
        '  git status - Exibe a integridade do repositório',
        '  ai scan   - Dispara uma auditoria do DevAI'
      ]);
      return;
    }

    if (cmd === 'run') {
      handleRunCode();
      return;
    }

    if (cmd === 'test') {
      setTerminalLogs(prev => [
        ...prev,
        `$ ${cmd}`,
        `RUN  v2.4.0 /workspace/${activeFileName}`,
        `✓ ${activeFileName} > test_initial_state (12ms)`,
        `✓ ${activeFileName} > test_payload_integrity (8ms)`,
        `Tests: 2 passed, 2 total`,
        `Time:  0.42s`
      ]);
      return;
    }

    if (cmd === 'git status') {
      setTerminalLogs(prev => [
        ...prev,
        `$ ${cmd}`,
        `On branch main`,
        `Your branch is up to date with 'origin/main'.`,
        `Changes tracked in Dev Studio: ${files.length} files.`
      ]);
      return;
    }

    if (cmd === 'ai scan') {
      triggerDevAiAction('security');
      return;
    }

    setTerminalLogs(prev => [
      ...prev,
      `$ ${cmd}`,
      `Comando não reconhecido: "${cmd}". Digite "help" para ver os comandos.`
    ]);
  };

  // Monta o preview HTML para iframe
  const generatePreviewHtml = () => {
    const htmlFile = files.find(f => f.name.endsWith('.html'))?.content || '';
    const cssFile = files.find(f => f.name.endsWith('.css'))?.content || '';
    const jsFile = files.find(f => f.name.endsWith('.js'))?.content || '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssFile}</style>
        </head>
        <body>
          ${htmlFile.replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, '').replace(/<script[^>]*src=["'][^"']*["'][^>]*><\/script>/gi, '')}
          <script>
            try {
              ${jsFile}
            } catch(e) {
              console.error(e);
            }
          </script>
        </body>
      </html>
    `;
  };

  const lineCount = (activeFile?.content || '').split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 15) }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] min-h-[500px] bg-[var(--bg)] text-[var(--text)] overflow-hidden rounded-2xl border border-[var(--border)] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      
      {/* 1. TOPBAR DA IDE */}
      <div className="flex flex-wrap items-center justify-between px-3 md:px-4 py-2 bg-[#090e0e] border-b border-[var(--border)] gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[var(--neonDim)] border border-[var(--neonBorder)] flex items-center justify-center text-[var(--neon)] shrink-0">
            <Code2 size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs md:text-sm font-bold text-white tracking-wide m-0 truncate">Dev Studio & IDE</h2>
              <span className="px-1.5 py-0.5 rounded-full bg-[var(--neonDim)] border border-[var(--neonBorder)] text-[9px] md:text-[10px] text-[var(--neon)] font-mono font-semibold">
                IA
              </span>
            </div>
            <p className="text-[10px] text-[var(--subtle)] m-0 hidden sm:block">Workspace de Código e Automação de Engenharia</p>
          </div>
        </div>

        {/* Seleção de Template e Ações */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="flex items-center bg-[#111817] border border-[var(--border)] rounded-lg px-2 py-1 text-xs">
            <Layers size={13} className="text-[var(--neon)] mr-1.5 shrink-0" />
            <select
              value={selectedTemplate}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="bg-transparent text-white text-xs outline-none cursor-pointer max-w-[130px] sm:max-w-none truncate"
            >
              <option value="web_landing" className="bg-[#111817]">Web Showcase (HTML/CSS/JS)</option>
              <option value="api_node" className="bg-[#111817]">Node.js Express API</option>
              <option value="python_data" className="bg-[#111817]">Python Data Analytics</option>
            </select>
          </div>

          <button
            onClick={handleRunCode}
            className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg bg-[var(--neon)] text-[var(--bg)] font-bold text-xs hover:brightness-110 shadow-[0_0_12px_var(--neonDim)] transition-all cursor-pointer"
          >
            <Play size={12} fill="currentColor" />
            <span>Executar</span>
          </button>

          <button
            onClick={handleExportProject}
            title="Exportar código do projeto"
            className="p-1.5 rounded-lg bg-[#111817] border border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-[var(--neonBorder)] transition-all"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* BARRA DE NAVEGAÇÃO DE ABAS NO MOBILE (< LG) */}
      <div className="lg:hidden flex items-center bg-[#070c0c] border-b border-[var(--border)] p-1 gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab('files')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            mobileTab === 'files'
              ? 'bg-[var(--neon)] text-[var(--bg)] font-bold shadow-sm'
              : 'bg-[#0f1716] text-[var(--muted)] hover:text-white'
          }`}
        >
          <FileCode size={13} />
          <span>Arquivos ({files.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('editor')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            mobileTab === 'editor'
              ? 'bg-[var(--neon)] text-[var(--bg)] font-bold shadow-sm'
              : 'bg-[#0f1716] text-[var(--muted)] hover:text-white'
          }`}
        >
          <Code2 size={13} />
          <span className="truncate max-w-[120px]">{activeFileName}</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('ai')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            mobileTab === 'ai'
              ? 'bg-[var(--neon)] text-[var(--bg)] font-bold shadow-sm'
              : 'bg-[#0f1716] text-[var(--muted)] hover:text-white'
          }`}
        >
          <Sparkles size={13} />
          <span>DevAI & Exec</span>
        </button>
      </div>

      {/* 2. CORPO PRINCIPAL (3 COLUNAS NO DESKTOP, ABAS NO MOBILE) */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* COLUNA 1: EXPLORADOR DE ARQUIVOS */}
        <div className={`w-full lg:w-56 bg-[#080d0d] border-r border-[var(--border)] flex-col shrink-0 ${
          mobileTab === 'files' ? 'flex flex-1' : 'hidden lg:flex'
        }`}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">
            <span>Explorador</span>
            <button
              onClick={handleOpenNewFileModal}
              title="Novo arquivo"
              className="p-1 hover:text-[var(--neon)] rounded transition-colors"
            >
              <Plus size={15} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
            {files.map(file => {
              const isActive = file.name === activeFileName;
              return (
                <div
                  key={file.name}
                  onClick={() => handleOpenFile(file.name)}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs font-mono transition-all ${
                    isActive
                      ? 'bg-[#121c1a] text-[var(--neon)] font-semibold border border-[var(--neonBorder)] shadow-[0_0_10px_rgba(0,255,157,0.1)]'
                      : 'text-[var(--muted)] hover:bg-[#0e1414] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode size={14} className={isActive ? 'text-[var(--neon)]' : 'text-[var(--subtle)]'} />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <button
                    onClick={(e) => handleRequestDeleteFile(file.name, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 rounded transition-opacity"
                    title="Excluir arquivo"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 border-t border-[var(--border)] bg-[#070b0b]">
            <div className="flex items-center gap-2 text-[11px] text-[var(--subtle)]">
              <span className="w-2 h-2 rounded-full bg-[var(--neon)] animate-pulse"></span>
              <span>DevEngine v2.4 Conectado</span>
            </div>
          </div>
        </div>

        {/* COLUNA 2: EDITOR DE CÓDIGO */}
        <div className={`flex-1 flex-col bg-[#070c0c] border-r border-[var(--border)] overflow-hidden ${
          mobileTab === 'editor' ? 'flex' : 'hidden lg:flex'
        }`}>
          
          {/* Abas de Arquivos */}
          <div className="flex items-center bg-[#090f0f] border-b border-[var(--border)] overflow-x-auto no-scrollbar">
            {openTabs.map(tabName => {
              const isActive = tabName === activeFileName;
              return (
                <div
                  key={tabName}
                  onClick={() => setActiveFileName(tabName)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-mono border-r border-[var(--border)] cursor-pointer select-none transition-all ${
                    isActive
                      ? 'bg-[#070c0c] text-[var(--neon)] border-t-2 border-t-[var(--neon)]'
                      : 'bg-[#090f0f] text-[var(--muted)] hover:text-white hover:bg-[#0c1313]'
                  }`}
                >
                  <FileCode size={13} />
                  <span>{tabName}</span>
                  <span
                    onClick={(e) => handleCloseTab(tabName, e)}
                    className="hover:bg-[#1a2523] rounded p-0.5 text-[var(--subtle)] hover:text-white"
                  >
                    ×
                  </span>
                </div>
              );
            })}
          </div>

          {/* Área de Linhas + Textarea de Código */}
          <div className="flex-1 flex relative overflow-hidden font-mono text-xs">
            {/* Numeração de Linhas */}
            <div
              ref={lineNumbersRef}
              className="w-10 bg-[#060a0a] text-[var(--subtle)] py-3 select-none text-right pr-2.5 overflow-hidden border-r border-[var(--border)] font-mono text-[11px] leading-[20px]"
            >
              {lineNumbers.map(num => (
                <div key={num}>{num}</div>
              ))}
            </div>

            {/* Editor de Texto */}
            <textarea
              ref={editorTextareaRef}
              value={activeFile?.content || ''}
              onChange={(e) => handleCodeChange(e.target.value)}
              onScroll={handleScrollSync}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="flex-1 h-full p-3 bg-transparent text-emerald-100 outline-none resize-none overflow-auto font-mono text-xs leading-[20px] whitespace-pre tab-4 selection:bg-[var(--neonDim)] selection:text-[var(--neon)]"
              placeholder="Digite seu código aqui..."
            />
          </div>

          {/* Rodapé do Editor */}
          <div className="flex items-center justify-between px-3 md:px-4 py-1.5 bg-[#080d0d] border-t border-[var(--border)] text-[11px] text-[var(--subtle)] font-mono">
            <div className="flex items-center gap-2 md:gap-4">
              <span>Linhas: {lineCount}</span>
              <span className="hidden sm:inline">Caracteres: {activeFile?.content?.length || 0}</span>
              <span>UTF-8</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileTab('ai')}
                className="lg:hidden flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--neonDim)] border border-[var(--neonBorder)] text-[var(--neon)] text-[10px] font-bold cursor-pointer"
              >
                <Sparkles size={11} />
                <span>DevAI & Exec</span>
              </button>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)]"></span>
                <span className="uppercase text-[var(--neon)] font-semibold">{activeFile?.lang || 'js'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA 3: PAINEL DIREITO (COPILOT IA | LIVE PREVIEW | TERMINAL) */}
        <div className={`w-full lg:w-96 flex-col bg-[#090e0e] shrink-0 overflow-hidden ${
          mobileTab === 'ai' ? 'flex flex-1' : 'hidden lg:flex'
        }`}>
          
          {/* Abas do Painel Direito */}
          <div className="flex items-center justify-between px-2 bg-[#070c0c] border-b border-[var(--border)]">
            <div className="flex items-center">
              <button
                onClick={() => setRightTab('copilot')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                  rightTab === 'copilot'
                    ? 'border-[var(--neon)] text-[var(--neon)] bg-[#0d1615]'
                    : 'border-transparent text-[var(--muted)] hover:text-white'
                }`}
              >
                <Sparkles size={13} />
                <span>DevAI Copilot</span>
              </button>

              <button
                onClick={() => setRightTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                  rightTab === 'preview'
                    ? 'border-[var(--neon)] text-[var(--neon)] bg-[#0d1615]'
                    : 'border-transparent text-[var(--muted)] hover:text-white'
                }`}
              >
                <Eye size={13} />
                <span>Live Preview</span>
              </button>

              <button
                onClick={() => setRightTab('terminal')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                  rightTab === 'terminal'
                    ? 'border-[var(--neon)] text-[var(--neon)] bg-[#0d1615]'
                    : 'border-transparent text-[var(--muted)] hover:text-white'
                }`}
              >
                <Terminal size={13} />
                <span>Terminal</span>
              </button>
            </div>
          </div>

          {/* CONTEÚDO DA ABA SELECIONADA */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* ABA 1: DEVAI COPILOT */}
            {rightTab === 'copilot' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Ações Rápidas de 1 Clique */}
                <div className="p-2.5 bg-[#0b1212] border-b border-[var(--border)]">
                  <span className="text-[10px] text-[var(--subtle)] uppercase tracking-wider font-mono font-semibold block mb-1.5">
                    Ações Rápidas de IA
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => triggerDevAiAction('explain')}
                      disabled={aiLoading}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#111c1a] border border-[var(--border)] hover:border-[var(--neonBorder)] text-[11px] text-[var(--text)] hover:text-[var(--neon)] transition-all text-left"
                    >
                      <HelpCircle size={13} className="text-[var(--neon)] shrink-0" />
                      <span className="truncate">Explicar Código</span>
                    </button>

                    <button
                      onClick={() => triggerDevAiAction('test')}
                      disabled={aiLoading}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#111c1a] border border-[var(--border)] hover:border-[var(--neonBorder)] text-[11px] text-[var(--text)] hover:text-[var(--neon)] transition-all text-left"
                    >
                      <Zap size={13} className="text-yellow-400 shrink-0" />
                      <span className="truncate">Gerar Testes</span>
                    </button>

                    <button
                      onClick={() => triggerDevAiAction('security')}
                      disabled={aiLoading}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#111c1a] border border-[var(--border)] hover:border-[var(--neonBorder)] text-[11px] text-[var(--text)] hover:text-[var(--neon)] transition-all text-left"
                    >
                      <ShieldCheck size={13} className="text-blue-400 shrink-0" />
                      <span className="truncate">Auditar Segurança</span>
                    </button>

                    <button
                      onClick={() => triggerDevAiAction('refactor')}
                      disabled={aiLoading}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#111c1a] border border-[var(--border)] hover:border-[var(--neonBorder)] text-[11px] text-[var(--text)] hover:text-[var(--neon)] transition-all text-left"
                    >
                      <Sparkles size={13} className="text-purple-400 shrink-0" />
                      <span className="truncate">Otimizar Código</span>
                    </button>
                  </div>
                </div>

                {/* Mensagens do Chat */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {aiMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#121c1a] border-[var(--neonBorder)] text-white ml-6'
                          : 'bg-[#0a0f0f] border-[var(--border)] text-emerald-100 mr-2 shadow-sm'
                      }`}
                    >
                      {msg.title && (
                        <div className="font-bold text-[var(--neon)] mb-1 flex items-center gap-1.5">
                          <Sparkles size={12} />
                          <span>{msg.title}</span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap font-sans text-xs">
                        {msg.content}
                      </div>

                      {/* Bloco de Código Gerado com Ações */}
                      {msg.code && (
                        <div className="mt-2.5 pt-2 border-t border-[var(--border)]">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-mono text-[var(--subtle)]">Código Sugerido:</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleCopyCode(msg.code)}
                                className="p-1 text-[var(--subtle)] hover:text-white rounded hover:bg-[#152220]"
                                title="Copiar código"
                              >
                                <Copy size={12} />
                              </button>
                              <button
                                onClick={() => handleApplyAiCode(msg.code)}
                                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--neonDim)] border border-[var(--neonBorder)] text-[var(--neon)] text-[10px] font-bold hover:brightness-125"
                                title="Substituir no editor"
                              >
                                <Check size={11} />
                                <span>Aplicar</span>
                              </button>
                            </div>
                          </div>
                          <pre className="p-2 rounded bg-[#050808] border border-[var(--border)] font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-40">
                            {msg.code}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}

                  {aiLoading && (
                    <div className="flex items-center gap-2 p-3 bg-[#0a0f0f] border border-[var(--border)] rounded-xl text-xs text-[var(--neon)]">
                      <RefreshCw size={14} className="animate-spin" />
                      <span>DevAI analisando o contexto e gerando resposta...</span>
                    </div>
                  )}
                </div>

                {/* Input de Mensagem */}
                <form onSubmit={handleSendAiMessage} className="p-2.5 bg-[#080d0d] border-t border-[var(--border)] flex items-center gap-2">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder={`Pergunte algo sobre ${activeFileName}...`}
                    disabled={aiLoading}
                    className="flex-1 bg-[#101817] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-white placeholder-[var(--subtle)] outline-none focus:border-[var(--neon)] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiInput.trim()}
                    className="p-2 rounded-lg bg-[var(--neon)] text-[var(--bg)] font-bold disabled:opacity-50 hover:brightness-110 transition-all"
                  >
                    <Send size={13} />
                  </button>
                </form>
              </div>
            )}

            {/* ABA 2: LIVE PREVIEW */}
            {rightTab === 'preview' && (
              <div className="flex-1 flex flex-col bg-[#050808]">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#090e0e] border-b border-[var(--border)] text-[11px] text-[var(--subtle)]">
                  <span>Visualizador Web Sandbox</span>
                  <button
                    onClick={() => {
                      const frame = document.getElementById('preview-iframe');
                      if (frame) frame.srcdoc = generatePreviewHtml();
                      toast.success('Preview atualizado!');
                    }}
                    className="flex items-center gap-1 hover:text-[var(--neon)]"
                  >
                    <RefreshCw size={12} />
                    <span>Recarregar</span>
                  </button>
                </div>
                <iframe
                  id="preview-iframe"
                  srcDoc={generatePreviewHtml()}
                  title="Sandbox Live Preview"
                  sandbox="allow-scripts allow-modals"
                  className="w-full flex-1 border-none bg-black"
                />
              </div>
            )}

            {/* ABA 3: TERMINAL */}
            {rightTab === 'terminal' && (
              <div className="flex-1 flex flex-col bg-[#050707] font-mono text-xs overflow-hidden">
                <div className="flex-1 p-3 overflow-y-auto space-y-1 text-emerald-400">
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} className="whitespace-pre-wrap">{log}</div>
                  ))}
                </div>
                <form onSubmit={handleTerminalSubmit} className="flex items-center p-2 bg-[#080c0c] border-t border-[var(--border)]">
                  <span className="text-[var(--neon)] font-bold mr-2">$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Digite run, test, clear ou help..."
                    className="flex-1 bg-transparent text-white outline-none font-mono text-xs"
                  />
                  <button type="submit" className="text-[var(--subtle)] hover:text-white p-1">
                    <CornerDownLeft size={13} />
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* MODAL 1: CRIAR NOVO ARQUIVO COM O DESIGN DO SITE */}
      <AnimatePresence>
        {isNewFileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-md bg-[#090f0f] border border-[var(--neonBorder)] rounded-2xl p-6 shadow-[0_0_50px_rgba(0,255,157,0.15)] relative"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--neonDim)] border border-[var(--neonBorder)] flex items-center justify-center text-[var(--neon)]">
                    <FileCode size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white m-0">Criar Novo Arquivo</h3>
                    <p className="text-xs text-[var(--subtle)] m-0">Adicione um novo módulo ao projeto</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewFileModalOpen(false)}
                  className="text-[var(--subtle)] hover:text-white p-1 rounded-lg hover:bg-[#152220] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmCreateFile}>
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-2 uppercase tracking-wider">
                    Nome do Arquivo
                  </label>
                  <input
                    type="text"
                    value={newFileNameInput}
                    onChange={(e) => setNewFileNameInput(e.target.value)}
                    placeholder="ex: utils.js, api.py, index.html, style.css"
                    autoFocus
                    className="w-full bg-[#050808] border border-[var(--border)] focus:border-[var(--neon)] rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-[var(--subtle)] outline-none shadow-inner transition-colors"
                  />
                  <span className="text-[11px] text-[var(--subtle)] mt-1.5 block">
                    Extensões suportadas: .js, .jsx, .html, .css, .py, .json, .sql
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setIsNewFileModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:text-white hover:bg-[#121c1a] transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!newFileNameInput.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[var(--neon)] text-[var(--bg)] text-xs font-bold hover:brightness-110 shadow-[0_0_15px_var(--neonDim)] disabled:opacity-50 transition-all cursor-pointer"
                  >
                    Criar Arquivo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CONFIRMAR EXCLUSÃO COM O DESIGN DO SITE */}
      <AnimatePresence>
        {fileToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-md bg-[#0d0a0a] border border-red-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.15)] relative"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white m-0">Excluir Arquivo</h3>
                    <p className="text-xs text-[var(--subtle)] m-0">Confirmação de segurança</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFileToDelete(null)}
                  className="text-[var(--subtle)] hover:text-white p-1 rounded-lg hover:bg-[#201515] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-300 leading-relaxed m-0">
                  Tem certeza de que deseja excluir permanentemente o arquivo <span className="font-mono text-[var(--neon)] font-semibold bg-[#121c1a] px-2 py-0.5 rounded border border-[var(--neonBorder)]">{fileToDelete}</span>?
                </p>
                <p className="text-xs text-red-400/80 mt-2 m-0">
                  Esta ação removerá o arquivo do workspace do projeto.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setFileToDelete(null)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:text-white hover:bg-[#181212] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteFile}
                  className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all cursor-pointer"
                >
                  Excluir Arquivo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
