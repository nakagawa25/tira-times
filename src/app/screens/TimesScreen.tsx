import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppBar } from '../components/AppBar';
import { Button } from '../components/Button';
import { TeamCard } from '../components/TeamCard';
import { AdSlot } from '../components/AdSlot';
import { describeGoalkeepers, buildShareText } from './shareText';

export interface TimesScreenProps {
  onOpenPro: () => void;
  onGoToPresenca: () => void;
}

export function TimesScreen({ onOpenPro, onGoToPresenca }: TimesScreenProps) {
  const groupName = useAppStore((s) => s.groupName);
  const draw = useAppStore((s) => s.draw);
  const pro = useAppStore((s) => s.web.pro);
  const runDraw = useAppStore((s) => s.runDraw);

  if (!draw) {
    return (
      <div>
        <AppBar title="Times" large />
        <p>Bora sortear?</p>
        <Button onClick={onGoToPresenca}>Marcar presença</Button>
      </div>
    );
  }

  const shareText = buildShareText(groupName, draw);

  return (
    <div>
      <AppBar title="Times" large />
      <p>Gol: {describeGoalkeepers(draw)}</p>
      {!pro && <AdSlot slot="times-banner" />}
      {draw.teams.map((team) => (
        <TeamCard key={team.color} name={team.name} color={team.color} players={team.players} goalkeeper={team.goalkeeper} missing={team.missing} />
      ))}
      {draw.bench.length > 0 && (
        <p>
          Próxima · {draw.bench.length}: {draw.bench.map((p) => p.name).join(', ')}
        </p>
      )}
      <div>
        <Button variant="tonal" icon="shuffle" onClick={() => runDraw()}>
          Sortear de novo
        </Button>
        <Button variant="outline" icon="content_copy" onClick={() => navigator.clipboard.writeText(shareText)}>
          Copiar
        </Button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button variant="outline" icon="ios_share" onClick={() => navigator.share({ text: shareText })}>
            Enviar
          </Button>
        )}
      </div>
      {!pro && (
        <Button variant="ghost" onClick={onOpenPro}>
          Remover anúncios
        </Button>
      )}
    </div>
  );
}
