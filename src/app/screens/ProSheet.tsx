import React from 'react';

export interface ProSheetProps {
  open: boolean;
  onClose: () => void;
  onActivate: () => void;
}
export function ProSheet({ open }: ProSheetProps) {
  if (!open) return null;
  return <div>Tira times Pro</div>;
}
