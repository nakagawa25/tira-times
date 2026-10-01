import React, { useState } from 'react';
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

  const exportJson = JSON.stringify(buildExport(groupName, players, rules), null, 2);

  function handleImport() {
    const parsed = parseImport(importText);
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

  function handleDownload() {
    const blob = new Blob([exportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename(groupName);
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <AppBar title="Importar / Exportar" onBack={onBack} />
      <div className="pl-card">
        <p>{groupName}</p>
        <p>{players.length} jogadores</p>
        <pre>{exportJson}</pre>
        <Button variant="tonal" onClick={() => navigator.clipboard.writeText(exportJson)}>
          Copiar JSON
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          Baixar .json
        </Button>
      </div>
      <div className="pl-card">
        <TextField label="Colar JSON" value={importText} onChange={setImportText} hint={error ?? undefined} />
        <div role="radiogroup" aria-label="Modo de importação">
          <Button variant={mode === 'merge' ? 'primary' : 'outline'} onClick={() => setMode('merge')}>
            Mesclar com o elenco
          </Button>
          <Button variant={mode === 'replace' ? 'primary' : 'outline'} onClick={() => setMode('replace')}>
            Substituir tudo
          </Button>
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
