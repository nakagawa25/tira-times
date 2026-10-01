import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppBar } from '../components/AppBar';
import { TextField } from '../components/TextField';
import { PlayerRow } from '../components/PlayerRow';
import { Button } from '../components/Button';
import { PlayerSheet } from './PlayerSheet';
import { ImportExportScreen } from './ImportExportScreen';
import { rating } from '../../domain/rating';

export interface ElencoScreenProps {
  onHideNavChange: (hide: boolean) => void;
  onOpenPro: () => void;
}

export function ElencoScreen({ onHideNavChange, onOpenPro }: ElencoScreenProps) {
  const players = useAppStore((s) => s.players);
  const showRatings = useAppStore((s) => s.showRatings);
  const addPlayer = useAppStore((s) => s.addPlayer);
  const updatePlayer = useAppStore((s) => s.updatePlayer);
  const removePlayer = useAppStore((s) => s.removePlayer);
  const setShowRatings = useAppStore((s) => s.setShowRatings);

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
    <div>
      <AppBar
        title="Elenco"
        subtitle={`${players.length} jogadores · ${monthlyCount} mensalistas`}
        large
        actions={[
          { icon: showRatings ? 'visibility' : 'visibility_off', label: 'Notas', onClick: () => setShowRatings(!showRatings) },
          {
            icon: 'swap_vert',
            label: 'Importar/Exportar',
            onClick: () => {
              setShowImportExport(true);
              onHideNavChange(true);
            },
          },
        ]}
      />
      <TextField icon="search" placeholder="Buscar jogador" value={query} onChange={setQuery} />
      {players.length === 0 ? (
        <div>
          <p>Nenhum jogador ainda</p>
          <Button onClick={() => setSheetFor('new')}>Cadastrar primeiro</Button>
        </div>
      ) : filtered.length === 0 ? (
        <p>Ninguém com esse nome</p>
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
      <Button variant="fab" icon="person_add" onClick={() => setSheetFor('new')}>
        Novo jogador
      </Button>
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
