import React, { useState } from 'react';
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
  const [copied, setCopied] = useState(false);

  if (!draw) {
    return (
      <div className="pl-screen">
        <AppBar title="Times" large />
        <p>Bora sortear?</p>
        <Button onClick={onGoToPresenca}>Marcar presença</Button>
      </div>
    );
  }

  const shareText = buildShareText(groupName, draw);

  async function handleCopy() {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard write failed silently; no destructive effect, nothing to recover
    }
  }

  return (
    <div className="pl-screen tt-listpad">
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
        <Button variant="outline" icon="content_copy" onClick={handleCopy}>
          {copied ? 'Copiado!' : 'Copiar'}
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
