import React, { useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppBar } from '../components/AppBar';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { parseImport, buildExport, exportFilename } from '../../domain/importExport';
import { sampleSquad } from '../../domain/sampleSquad';

export interface ImportExportScreenProps {
  onBack: () => void;
  onOpenPro: () => void;
}

export function ImportExportScreen({ onBack, onOpenPro }: ImportExportScreenProps) {
  const groupName = useAppStore((s) => s.groupName);
  const players = useAppStore((s) => s.players);
  const rules = useAppStore((s) => s.rules);
  const pro = useAppStore((s) => s.web.pro);
  const importData = useAppStore((s) => s.importData);

  const [importText, setImportText] = useState('');
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportJson = JSON.stringify(buildExport(groupName, players, rules), null, 2);

  function runImport(rawText: string) {
    const parsed = parseImport(rawText);
    if (!parsed.ok) {
      setError(parsed.error);
      setResult(null);
      return;
    }
    const existingIds = new Set(players.map((p) => p.id));
    const added = parsed.players.filter((p) => !existingIds.has(p.id)).length;
    const updated = parsed.players.length - added;
    importData(parsed, mode);
    setError(null);
    setResult(mode === 'replace' ? `${parsed.players.length} jogadores importados.` : `${added} adicionados e ${updated} atualizados.`);
  }

  function handleImport() {
    runImport(importText);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    // FileReader rather than file.text() — Blob.text() isn't implemented by
    // jsdom (the test environment), and FileReader works in both.
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      setImportText(text);
      runImport(text);
    };
    reader.readAsText(file);
  }

  function handleDownload() {
    const blob = new Blob([exportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename(groupName);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function handleCopyJson() {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(exportJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard write failed silently; no destructive effect, nothing to recover
    }
  }

  return (
    <div className="pl-screen">
      <AppBar title="Importar / Exportar" onBack={onBack} />
      <div className="pl-card">
        <p>{groupName}</p>
        <p>{players.length} jogadores</p>
        <pre>{exportJson}</pre>
        <Button variant="tonal" onClick={handleCopyJson}>
          {copied ? 'Copiado!' : 'Copiar JSON'}
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          Baixar .json
        </Button>
      </div>
      <div className="pl-card">
        <Button variant="outline" icon="upload_file" onClick={() => fileInputRef.current?.click()}>
          Escolher arquivo .json
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          aria-label="Escolher arquivo .json"
        />
        <TextField label="Colar JSON" value={importText} onChange={setImportText} hint={error ?? undefined} />
        <div className="tt-seg">
          <button
            type="button"
            className={`tt-seg-btn${mode === 'merge' ? ' on' : ''}`}
            aria-pressed={mode === 'merge'}
            onClick={() => setMode('merge')}
          >
            Mesclar com o elenco
          </button>
          <button
            type="button"
            className={`tt-seg-btn${mode === 'replace' ? ' on' : ''}`}
            aria-pressed={mode === 'replace'}
            onClick={() => setMode('replace')}
          >
            Substituir tudo
          </button>
        </div>
        <Button variant="primary" onClick={handleImport}>
          Importar
        </Button>
        {result && <p>{result}</p>}
      </div>
      {import.meta.env.DEV && (
        <Button variant="ghost" onClick={() => importData({ ok: true, players: sampleSquad, rules: {} }, 'replace')}>
          Restaurar exemplo
        </Button>
      )}
      <div className="pl-card">
        <p>Plano: {pro ? 'Pro' : 'Grátis'}</p>
        <Button variant="tonal" onClick={onOpenPro}>
          Conhecer o Pro
        </Button>
      </div>
    </div>
  );
}
