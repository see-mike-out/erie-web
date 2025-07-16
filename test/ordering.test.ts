import { test, describe, expect } from 'vitest';
import { normalizeSpecification } from '../src/normalize';
import type { StreamingSpec } from '../src';

function makeOrderingSpec(ordering: any[] = [], overrides: any = {}): StreamingSpec {
  return {
    title: 'Test Spec',
    data: {
      stream: true,
      dummy: {
        values: [
          { x: 0, y: 1 },
          { x: 1, y: 2 }
        ]
      }
    },
    tone: { base_tone: true },
    encoding: {
      x: { field: 'x', type: 'quantitative' },
      y: { field: 'y', type: 'quantitative' },
      ...overrides
    },
    ordering
  };
}

describe('Ordering spec normalization', () => {
  test('omitted ordering defaults to full stream', async () => {
    const { normalized } = await normalizeSpecification(makeOrderingSpec(undefined));
    const ordering = normalized[0].ordering;
    expect(ordering).toBeDefined();
    expect(Array.isArray(ordering)).toBe(true);
    expect(ordering.length).toBeGreaterThan(0);
  });

  test('Text ordering resolves correctly', async () => {
    const ordering = [{ type: 'Text', text: 'Test text' }];
    const { normalized } = await normalizeSpecification(makeOrderingSpec(ordering));
    const item = normalized[0].ordering[0];
    expect(item.type).toBe('Text');
    expect(item.text).toBe('Test text');
  });

  test('Markup ordering supports role and markup', async () => {
    const ordering = [{
      type: 'Markup',
      markup: 'Markup text',
      specifier: { role: 'scale.description' }
    }];
    const { normalized } = await normalizeSpecification(makeOrderingSpec(ordering));
    const item = normalized.ordering;
    expect(item.type).toBe('Markup');
    expect(item.markup).toBe('Markup text');
    expect(item.specifier.role).toBe('scale.description');
  });

  test('Sound ordering uses specifier and notify', async () => {
    const ordering = [{
      type: 'Sound',
      specifier: { role: 'sound', stream: { index: 0 }, channel: 'x' },
      notify: { type: 'chime' }
    }];
    const { normalized } = await normalizeSpecification(makeOrderingSpec(ordering));
    const item = normalized.ordering;
    expect(item.type).toBe('Sound');
    expect(item.specifier.role).toBe('sound');
    expect(item.specifier.stream.index).toBe(0);
    expect(item.notify?.type).toBe('chime');
  });

  test('invalid stream index is preserved in output', async () => {
    const ordering = [{ type: 'Sound', specifier: { role: 'sound', stream: { index: 99 } } }];
    const { normalized } = await normalizeSpecification(makeOrderingSpec(ordering));
    const item = normalized.ordering[0];
    expect(item.specifier.stream.index).toBe(99);
  });

  test('duplicate specifiers do not crash normalization', async () => {
    const ordering = [
      { type: 'Sound', specifier: { role: 'sound', stream: { index: 0 } } },
      { type: 'Sound', specifier: { role: 'sound', stream: { index: 0 } } }
    ];
    const { normalized } = await normalizeSpecification(makeOrderingSpec(ordering));
    expect(normalized.ordering.length).toBe(2);
  });

  test('more than 50 ordering items normalize without failure', async () => {
    const ordering = Array.from({ length: 55 }, (_, i) => ({ type: 'Text', text: `Item ${i}` }));
    const { normalized } = await normalizeSpecification(makeOrderingSpec(ordering));
    expect(normalized.ordering.length).toBe(55);
  });
});
