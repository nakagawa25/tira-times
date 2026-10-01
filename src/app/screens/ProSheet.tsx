import React from 'react';
import { Button } from '../components/Button';

export interface ProSheetProps {
  open: boolean;
  onClose: () => void;
  onActivate: () => void;
}

const BENEFITS = ['Sem anúncios', 'Controle de mensalidades (com lembrete por Pix)', 'Histórico de sorteios', 'Estatísticas da galera'];

export function ProSheet({ open, onClose, onActivate }: ProSheetProps) {
  if (!open) return null;
  return (
    <div className="pl-sheet-scrim" role="presentation" onClick={onClose}>
      <div className="pl-sheet" role="dialog" aria-label="Tira times Pro" onClick={(e) => e.stopPropagation()}>
        <p>Para quem organiza</p>
        <p>R$ 9,90/mês</p>
        <ul>
          {BENEFITS.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <Button variant="primary" onClick={onActivate}>
          Ativar modo Pro (teste)
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Agora não
        </Button>
      </div>
    </div>
  );
}
