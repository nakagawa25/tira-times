import React, { useState } from 'react';
import type { Player, Position, Skills } from '../../domain/types';
import { rating, formatRating } from '../../domain/rating';
import { genId } from '../../domain/importExport';
import { TextField } from '../components/TextField';
import { PositionPicker } from '../components/PositionPicker';
import { MonthlySwitch } from '../components/MonthlySwitch';
import { StarRating } from '../components/StarRating';
import { Button } from '../components/Button';

export interface PlayerSheetProps {
  player: Player | null;
  onSave: (player: Player) => void;
  onSaveAndAddAnother?: (player: Player) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const DEFAULT_SKILLS: Skills = { attack: 3, defense: 3, speed: 3, skill: 3 };

export function PlayerSheet({ player, onSave, onSaveAndAddAnother, onDelete, onClose }: PlayerSheetProps) {
  const isNew = player === null;
  const [name, setName] = useState(player?.name ?? '');
  const [positions, setPositions] = useState<Position[]>(player?.positions ?? ['QQ']);
  const [monthly, setMonthly] = useState(player?.monthly ?? false);
  const [skills, setSkills] = useState<Skills>(player?.skills ?? DEFAULT_SKILLS);
  const [skillsOpen, setSkillsOpen] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function handleSubmit(andAnother: boolean) {
    if (!name.trim()) {
      setError('Digite o nome ou apelido do jogador.');
      return;
    }
    const result: Player = { id: player?.id ?? genId(), name: name.trim(), positions, monthly, skills };
    if (andAnother && onSaveAndAddAnother) {
      onSaveAndAddAnother(result);
      setName('');
      setPositions(['QQ']);
      setMonthly(false);
      setSkills(DEFAULT_SKILLS);
      setError(null);
    } else {
      onSave(result);
    }
  }

  return (
    <div className="pl-sheet-scrim" role="presentation" onClick={onClose}>
      <div className="pl-sheet" role="dialog" aria-label={isNew ? 'Novo jogador' : 'Editar jogador'} onClick={(e) => e.stopPropagation()}>
        <TextField
          label="Nome ou apelido"
          value={name}
          autoFocus={isNew}
          onChange={(v) => {
            setName(v);
            setError(null);
          }}
          hint={error ?? undefined}
        />
        <div>
          <p>Posição · pode escolher mais de uma</p>
          <PositionPicker value={positions} onChange={setPositions} />
        </div>
        <MonthlySwitch checked={monthly} onChange={setMonthly} />
        <button type="button" onClick={() => setSkillsOpen((v) => !v)}>
          Habilidades
        </button>
        {skillsOpen && (
          <div>
            <StarRating label="Ataque" icon="sports_soccer" value={skills.attack} onChange={(v) => setSkills((s) => ({ ...s, attack: v }))} />
            <StarRating label="Defesa" icon="shield" value={skills.defense} onChange={(v) => setSkills((s) => ({ ...s, defense: v }))} />
            <StarRating label="Velocidade" icon="bolt" value={skills.speed} onChange={(v) => setSkills((s) => ({ ...s, speed: v }))} />
            <StarRating label="Habilidade" icon="auto_awesome" value={skills.skill} onChange={(v) => setSkills((s) => ({ ...s, skill: v }))} />
            <p>Nota média: {formatRating(rating({ id: '', name: '', positions: [], monthly: false, skills }))}</p>
          </div>
        )}
        {!isNew && onDelete && player && (
          confirmingDelete ? (
            <div>
              <p>Excluir {player.name} do elenco?</p>
              <Button variant="outline" onClick={() => setConfirmingDelete(false)}>
                Manter
              </Button>
              <Button variant="danger" onClick={() => onDelete(player.id)}>
                Excluir
              </Button>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
              Excluir jogador
            </Button>
          )
        )}
        <div>
          {isNew && (
            <Button variant="tonal" onClick={() => handleSubmit(true)}>
              Salvar e + outro
            </Button>
          )}
          <Button variant="primary" onClick={() => handleSubmit(false)}>
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
