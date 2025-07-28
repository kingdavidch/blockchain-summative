import { describe, it, expect } from 'vitest';

describe('Simple Tests', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should test string operations', () => {
    const str = 'MediChain';
    expect(str.toLowerCase()).toBe('medichain');
    expect(str.length).toBe(9);
  });

  it('should test array operations', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.includes(2)).toBe(true);
  });
});