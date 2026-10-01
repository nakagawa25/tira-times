import { describe, it, expect, vi, afterEach } from 'vitest';
import { safeStorage } from './safeStorage';

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('safeStorage', () => {
  it('reads and writes through localStorage normally', () => {
    safeStorage.setItem('k', 'v');
    expect(safeStorage.getItem('k')).toBe('v');
  });

  it('returns null instead of throwing when getItem fails', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(safeStorage.getItem('k')).toBeNull();
  });

  it('does not throw when setItem fails (quota exceeded, private mode)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => safeStorage.setItem('k', 'v')).not.toThrow();
  });

  it('does not throw when removeItem fails', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => safeStorage.removeItem('k')).not.toThrow();
  });
});
