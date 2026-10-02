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

const SKILLS: { id: keyof Skills; label: string; icon: string }[] = [
  { id: 'attack', label: 'Ataque', icon: 'sports_soccer' },
  { id: 'defense', label: 'Defesa', icon: 'shield' },
  { id: 'speed', label: 'Velocidade', icon: 'bolt' },
  { id: 'skill', label: 'Habilidade', icon: 'auto_awesome' },
];

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
    <div className="tt-sheet-wrap">
      <div className="tt-scrim" onClick={onClose} />
      <form
        className="tt-sheet"
        role="dialog"
        aria-label={isNew ? 'Novo jogador' : 'Editar jogador'}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(false);
        }}
      >
        <div className="tt-grip" />
        <div className="tt-sheet-head">
          <span className="tt-sheet-title">{isNew ? 'Novo jogador' : 'Editar jogador'}</span>
          <button type="button" className="pl-iconbtn" aria-label="Fechar" onClick={onClose}>
            <span className="pl-icon" aria-hidden="true">
              close
            </span>
          </button>
        </div>
        <div className="tt-sheet-body">
          <div>
            <TextField
              label="Nome ou apelido"
              value={name}
              autoFocus={isNew}
              onChange={(v) => {
                setName(v);
                setError(null);
              }}
            />
            {error && (
              <div className="tt-error">
                <span className="pl-icon" style={{ fontSize: 16 }} aria-hidden="true">
                  error
                </span>
                {error}
              </div>
            )}
          </div>
          <div>
            <div className="pl-field-label tt-mb8">Posição · pode escolher mais de uma</div>
            <PositionPicker value={positions} onChange={setPositions} />
          </div>
          <MonthlySwitch checked={monthly} onChange={setMonthly} />
          <div>
            <button type="button" className="tt-collapse" aria-expanded={skillsOpen} onClick={() => setSkillsOpen((v) => !v)}>
              <span className="tt-collapse-title">
                Habilidades <span className="tt-muted-sm">{skillsOpen ? '· toque de novo na estrela para diminuir' : '· opcional, começa em 3'}</span>
              </span>
              <span className="pl-icon" aria-hidden="true">
                {skillsOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {skillsOpen && (
              <div>
                {SKILLS.map((s) => (
                  <StarRating key={s.id} label={s.label} icon={s.icon} value={skills[s.id]} onChange={(v) => setSkills((prev) => ({ ...prev, [s.id]: v }))} />
                ))}
                <div className="tt-avg">
                  Nota média <b>{formatRating(rating({ id: '', name: '', positions: [], monthly: false, skills }))}</b>
                </div>
              </div>
            )}
          </div>
          {!isNew && onDelete && player && (
            <div className="tt-danger-zone">
              {confirmingDelete ? (
                <div className="tt-confirm">
                  <span>Excluir {player.name} do elenco?</span>
                  <div className="tt-row">
                    <Button variant="outline" onClick={() => setConfirmingDelete(false)}>
                      Manter
                    </Button>
                    <button type="button" className="pl-btn tt-btn-del" onClick={() => onDelete(player.id)}>
                      <span className="pl-icon" aria-hidden="true">
                        delete
                      </span>
                      Excluir
                    </button>
                  </div>
                </div>
              ) : (
                <Button variant="danger" icon="delete" onClick={() => setConfirmingDelete(true)}>
                  Excluir jogador
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="tt-sheet-foot">
          {isNew && (
            <Button variant="tonal" block onClick={() => handleSubmit(true)}>
              Salvar e + outro
            </Button>
          )}
          <button type="submit" className="pl-btn pl-btn-primary pl-btn-block">
            <span className="pl-icon" aria-hidden="true">
              check
            </span>
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
