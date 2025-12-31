/**
 * Basic setup test to verify testing infrastructure
 *
 * @license Apache-2.0
 * Copyright (c) 2025 Anthropic, PBC
 */

import { describe, it, expect } from 'bun:test';

describe('Project Setup', () => {
  it('should have TypeScript support', () => {
    const testString: string = 'Hello, Auto-Terminal';
    expect(testString).toBe('Hello, Auto-Terminal');
  });

  it('should support ES2024 features', () => {
    // Test Object.groupBy (ES2024 feature)
    const inventory = [
      { name: 'asparagus', type: 'vegetables', quantity: 5 },
      { name: 'bananas', type: 'fruit', quantity: 0 },
      { name: 'goat', type: 'meat', quantity: 23 },
      { name: 'cherries', type: 'fruit', quantity: 5 },
    ];

    const result = Object.groupBy(inventory, ({ type }) => type);

    expect(result.vegetables).toBeDefined();
    expect(result.fruit).toBeDefined();
    expect(result.meat).toBeDefined();
  });

  it('should support Promise.withResolvers (ES2024)', () => {
    const { promise, resolve, reject } = Promise.withResolvers<string>();

    expect(promise).toBeInstanceOf(Promise);
    expect(typeof resolve).toBe('function');
    expect(typeof reject).toBe('function');

    resolve('test');
    return expect(promise).resolves.toBe('test');
  });
});
