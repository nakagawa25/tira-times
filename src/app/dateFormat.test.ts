import { describe, it, expect } from 'vitest';
import { formatDateLong, formatTime } from './dateFormat';

describe('formatDateLong', () => {
  it('formats as "Weekday, day de month" in Portuguese', () => {
    expect(formatDateLong(new Date(2026, 9, 1))).toBe('Quinta, 1 de outubro');
  });
});

describe('formatTime', () => {
  it('formats as HH:mm', () => {
    const d = new Date(2026, 9, 1, 19, 42);
    expect(formatTime(d)).toBe('19:42');
  });
});
