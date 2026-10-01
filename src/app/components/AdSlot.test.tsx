import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { AdSlot } from './AdSlot';

beforeEach(() => {
  delete (window as any).adsbygoogle;
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('AdSlot', () => {
  it('renders a labeled placeholder when ads are disabled (default)', () => {
    render(<AdSlot slot="times-banner" />);
    expect(screen.getByText('Anúncio')).toBeInTheDocument();
    expect(document.querySelector('ins.adsbygoogle')).toBeNull();
  });

  it('renders the real AdSense slot and pushes once when ads are enabled', () => {
    vi.stubEnv('PUBLIC_ADS_ENABLED', 'true');
    vi.stubEnv('PUBLIC_ADSENSE_CLIENT', 'ca-pub-123');
    render(<AdSlot slot="times-banner" />);
    const ins = document.querySelector('ins.adsbygoogle');
    expect(ins).not.toBeNull();
    expect(ins).toHaveAttribute('data-ad-client', 'ca-pub-123');
    expect(ins).toHaveAttribute('data-ad-slot', 'times-banner');
    expect(window.adsbygoogle).toHaveLength(1);
  });
});
