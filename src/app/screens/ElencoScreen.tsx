import React from 'react';

export interface ElencoScreenProps {
  onHideNavChange: (hide: boolean) => void;
  onOpenPro: () => void;
}
export function ElencoScreen(_props: ElencoScreenProps) {
  return <div>Elenco</div>;
}
