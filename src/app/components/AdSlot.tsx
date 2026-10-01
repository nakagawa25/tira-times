import React, { useEffect, useRef } from 'react';

export interface AdSlotProps {
  slot: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({ slot }: AdSlotProps) {
  const adsEnabled = import.meta.env.PUBLIC_ADS_ENABLED === 'true';
  const adsenseClient = import.meta.env.PUBLIC_ADSENSE_CLIENT as string | undefined;
  const pushed = useRef(false);

  useEffect(() => {
    if (!adsEnabled || pushed.current) return;
    pushed.current = true;
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, [adsEnabled]);

  if (!adsEnabled) {
    return (
      <div className="pl-ad-placeholder" role="img" aria-label="Espaço reservado para anúncio">
        Anúncio
      </div>
    );
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', minHeight: 100 }}
      data-ad-client={adsenseClient}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
      aria-label="Anúncio"
    />
  );
}
