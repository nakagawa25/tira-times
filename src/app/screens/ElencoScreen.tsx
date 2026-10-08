import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { TextField } from '../components/TextField';
import { PlayerRow } from '../components/PlayerRow';
import { Button } from '../components/Button';
import { Empty } from '../components/Empty';
import { PlayerSheet } from './PlayerSheet';
import { ImportExportScreen } from './ImportExportScreen';
import { rating } from '../../domain/rating';

export interface ElencoScreenProps {
  onHideNavChange: (hide: boolean) => void;
  onOpenPro: () => void;
}

export function ElencoScreen({ onHideNavChange, onOpenPro }: ElencoScreenProps) {
  const groupName = 'Fut de Sexta - Created By: Naka';
  const players = useAppStore((s) => s.players);
  const showRatings = useAppStore((s) => s.showRatings);
  const addPlayer = useAppStore((s) => s.addPlayer);
  const updatePlayer = useAppStore((s) => s.updatePlayer);
  const removePlayer = useAppStore((s) => s.removePlayer);
  const setShowRatings = useAppStore((s) => s.setShowRatings);
  const installDismissed = useAppStore((s) => s.web.installDismissed);
  const dismissInstall = useAppStore((s) => s.dismissInstall);

  const [query, setQuery] = useState('');
  const [sheetFor, setSheetFor] = useState<'closed' | 'new' | string>('closed');
  const [showImportExport, setShowImportExport] = useState(false);

  if (showImportExport) {
    return (
      <ImportExportScreen
        onBack={() => {
          setShowImportExport(false);
          onHideNavChange(false);
        }}
        onOpenPro={onOpenPro}
      />
    );
  }

  const monthlyCount = players.filter((p) => p.monthly).length;
  const sorted = [...players].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const filtered = query.trim() ? sorted.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase())) : sorted;
  const editingPlayer = sheetFor !== 'closed' && sheetFor !== 'new' ? (players.find((p) => p.id === sheetFor) ?? null) : null;

  return (
    <div className="pl-screen tt-listpad">
      <header className="tt-brandbar">
        <span className="tt-brand">
          <span className="tt-logo" aria-hidden="true">
            <span className="tt-logo-a" />
            <span className="tt-logo-b" />
          </span>
          <span>
            <span className="tt-brand-name">Tira times</span>
            <span className="tt-brand-group">{groupName}</span>
          </span>
        </span>
        <button
          type="button"
          className="pl-iconbtn"
          aria-label="Importar/Exportar"
          onClick={() => {
            setShowImportExport(true);
            onHideNavChange(true);
          }}
        >
          <span className="pl-icon" aria-hidden="true">
            swap_vert
          </span>
        </button>
      </header>
      <div className="tt-titlerow">
        <div className="tt-titlecol">
          <h1 className="tt-h1">Elenco</h1>
          <span className="tt-count">
            {players.length} jogadores · {monthlyCount} mensalistas
          </span>
        </div>
        <button type="button" className={`tt-eye${showRatings ? ' on' : ''}`} aria-pressed={showRatings} onClick={() => setShowRatings(!showRatings)}>
          <span className="pl-icon" aria-hidden="true">
            {showRatings ? 'visibility' : 'visibility_off'}
          </span>
          Notas
        </button>
      </div>
      {!installDismissed && (
        <div className="tt-install">
          <span className="tt-install-ic">
            <span className="pl-icon" aria-hidden="true">
              add_to_home_screen
            </span>
          </span>
          <span className="tt-install-t">
            <b>Instale na tela inicial</b>
            <span>No navegador, toque em Compartilhar ou ⋮ e depois em Adicionar à tela inicial.</span>
          </span>
          <button type="button" className="pl-iconbtn" aria-label="Dispensar" onClick={dismissInstall}>
            <span className="pl-icon" style={{ fontSize: 20 }} aria-hidden="true">
              close
            </span>
          </button>
        </div>
      )}
      <TextField icon="search" placeholder="Buscar jogador" value={query} onChange={setQuery} />
      {players.length === 0 ? (
        <Empty
          icon="group_add"
          title="Nenhum jogador ainda"
          text="Cadastre a galera. Só o nome é obrigatório."
          action={
            <Button icon="person_add" onClick={() => setSheetFor('new')}>
              Cadastrar primeiro
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <Empty icon="search_off" title="Ninguém com esse nome" text={`Confira a grafia ou cadastre "${query}".`} />
      ) : (
        filtered.map((p) => (
          <PlayerRow
            key={p.id}
            name={p.name}
            positions={p.positions}
            monthly={p.monthly}
            rating={showRatings ? rating(p) : undefined}
            onClick={() => setSheetFor(p.id)}
          />
        ))
      )}
      <div className="tt-fab">
        <Button variant="fab" icon="person_add" onClick={() => setSheetFor('new')}>
          Novo jogador
        </Button>
      </div>
      {sheetFor !== 'closed' && (
        <PlayerSheet
          player={editingPlayer}
          onSave={(player) => {
            if (editingPlayer) updatePlayer(player);
            else addPlayer(player);
            setSheetFor('closed');
          }}
          onSaveAndAddAnother={(player) => addPlayer(player)}
          onDelete={
            editingPlayer
              ? (id) => {
                  removePlayer(id);
                  setSheetFor('closed');
                }
              : undefined
          }
          onClose={() => setSheetFor('closed')}
        />
      )}
    </div>
  );
}
