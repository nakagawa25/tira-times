import React, { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { ElencoScreen } from './screens/ElencoScreen';
import { PresencaScreen } from './screens/PresencaScreen';
import { TimesScreen } from './screens/TimesScreen';
import { RegrasScreen } from './screens/RegrasScreen';
import { ProSheet } from './screens/ProSheet';
import { useAppStore } from './store/useAppStore';

type Tab = 'elenco' | 'presenca' | 'times' | 'regras';

export default function App() {
  const [tab, setTab] = useState<Tab>('elenco');
  const [hideNav, setHideNav] = useState(false);
  const [proOpen, setProOpen] = useState(false);
  const presentCount = useAppStore((s) => s.present.length);
  const setPro = useAppStore((s) => s.setPro);

  return (
    <div className="pl-app">
      {tab === 'elenco' && <ElencoScreen onHideNavChange={setHideNav} onOpenPro={() => setProOpen(true)} />}
      {tab === 'presenca' && <PresencaScreen />}
      {tab === 'times' && <TimesScreen onOpenPro={() => setProOpen(true)} />}
      {tab === 'regras' && <RegrasScreen />}
      {!hideNav && (
        <BottomNav
          active={tab}
          items={[
            { id: 'elenco', icon: 'groups', label: 'Elenco' },
            { id: 'presenca', icon: 'how_to_reg', label: 'Presença', badge: presentCount },
            { id: 'times', icon: 'shuffle', label: 'Times' },
            { id: 'regras', icon: 'tune', label: 'Regras' },
          ]}
          onChange={(id) => setTab(id as Tab)}
        />
      )}
      <ProSheet
        open={proOpen}
        onClose={() => setProOpen(false)}
        onActivate={() => {
          setPro(true);
          setProOpen(false);
        }}
      />
    </div>
  );
}
