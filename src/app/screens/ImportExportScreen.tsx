import React, { useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppBar } from '../components/AppBar';
import { Button } from '../components/Button';
import { parseImport, buildExport, exportFilename } from '../../domain/importExport';
import { sampleSquad } from '../../domain/sampleSquad';

export interface ImportExportScreenProps {
  onBack: () => void;
  onOpenPro: () => void;
}

export function ImportExportScreen({ onBack }: ImportExportScreenProps) {
  const groupName = useAppStore((s) => s.groupName);
  const players = useAppStore((s) => s.players);
  const rules = useAppStore((s) => s.rules);
  const importData = useAppStore((s) => s.importData);
  const clearPlayers = useAppStore((s) => s.clearPlayers);

  const [importText, setImportText] = useState('');
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
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
      <AppBar title="Importar / Exportar" subtitle="Leve o elenco para outro celular" onBack={onBack} />
      <div className="pl-section-title tt-mt4">Exportar</div>
      <div className="pl-card tt-cardpad">
        <div className="tt-exp-head">
          <span className="pl-toggle-icon tt-green-icon">
            <span className="pl-icon" aria-hidden="true">
              download
            </span>
          </span>
          <span>
            <div className="tt-exp-name">{groupName}</div>
            <div className="tt-muted-sm">{players.length} jogadores + regras</div>
          </span>
        </div>
        <pre className="tt-code" tabIndex={0}>
          {exportJson}
        </pre>
        <Button block icon="content_copy" onClick={handleCopyJson}>
          {copied ? 'Copiado!' : 'Copiar JSON'}
        </Button>
        <Button variant="outline" block onClick={handleDownload}>
          Baixar .json
        </Button>
        <div className="tt-hint">Cole no Tira times do outro celular, em Importar.</div>
      </div>

      <div className="pl-section-title">Importar</div>
      <div className="pl-card tt-cardpad">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileChange}
          hidden
          aria-label="Escolher arquivo .json"
        />
        <button type="button" className="tt-drop" onClick={() => fileInputRef.current?.click()}>
          <span className="pl-icon" style={{ fontSize: 30 }} aria-hidden="true">
            upload_file
          </span>
          <span className="tt-drop-t">Escolher arquivo .json</span>
          <span className="tt-muted-sm">ou cole o texto abaixo</span>
        </button>
        <textarea
          className="tt-paste"
          rows={3}
          placeholder='{ "app": "tira-times", "players": [ ... ] }'
          aria-label="Colar JSON"
          value={importText}
          onChange={(e) => {
            setImportText(e.target.value);
            setError(null);
          }}
        />
        <div role="radiogroup">
          <button type="button" role="radio" aria-checked={mode === 'merge'} className="tt-radio" onClick={() => setMode('merge')}>
            <span className={`tt-radio-dot${mode === 'merge' ? ' on' : ''}`} />
            <span className="tt-radio-text">
              <span className="tt-radio-t">Mesclar com o elenco</span>
              <span className="tt-radio-d">Atualiza quem já existe e adiciona os novos</span>
            </span>
          </button>
          <hr className="pl-divider" />
          <button type="button" role="radio" aria-checked={mode === 'replace'} className="tt-radio" onClick={() => setMode('replace')}>
            <span className={`tt-radio-dot${mode === 'replace' ? ' on' : ''}`} />
            <span className="tt-radio-text">
              <span className="tt-radio-t">Substituir tudo</span>
              <span className="tt-radio-d">Troca o elenco deste celular pelo do arquivo</span>
            </span>
          </button>
        </div>
        {(error || result) && (
          <div className={`tt-msg${error ? ' bad' : ''}`}>
            <span className="pl-icon pl-icon-fill" style={{ fontSize: 18 }} aria-hidden="true">
              {error ? 'error' : 'check_circle'}
            </span>
            {error ?? result}
          </div>
        )}
        <Button variant="tonal" block icon="upload" disabled={!importText.trim()} onClick={handleImport}>
          Importar texto colado
        </Button>
      </div>

      <div className="pl-section-title">Zona de risco</div>
      <div className="pl-card tt-cardpad tt-danger-zone">
        {confirmingClear ? (
          <div className="tt-confirm">
            <span>Excluir todo o elenco ({players.length} jogadores)? Essa ação não pode ser desfeita.</span>
            <div className="tt-row">
              <Button variant="outline" onClick={() => setConfirmingClear(false)}>
                Manter
              </Button>
              <button
                type="button"
                className="pl-btn tt-btn-del"
                onClick={() => {
                  clearPlayers();
                  setConfirmingClear(false);
                }}
              >
                <span className="pl-icon" aria-hidden="true">
                  delete_forever
                </span>
                Excluir
              </button>
            </div>
          </div>
        ) : (
          <Button variant="danger" block icon="delete_forever" onClick={() => setConfirmingClear(true)}>
            Excluir elenco inteiro
          </Button>
        )}
      </div>

      {import.meta.env.DEV && (
        <>
          <div className="pl-section-title">Demo</div>
          <div className="pl-card tt-cardpad">
            <div className="tt-muted-sm">Volta ao elenco de exemplo com 22 jogadores e as regras padrão.</div>
            <Button variant="outline" block icon="restart_alt" onClick={() => importData({ ok: true, players: sampleSquad, rules: {} }, 'replace')}>
              Restaurar exemplo
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
