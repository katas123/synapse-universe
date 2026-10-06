import { describe, it, expect } from 'vitest';
import { computeLayout } from './layout';
import { createInitialGraph } from './demo';
describe('3D force layout', () => {
  it('keeps locked positions and returns finite coordinates', () => {
    const graph = createInitialGraph();
    graph.nodes[0].positionLocked = true;
    graph.nodes[0].position = { x: 12, y: 4, z: -2 };
    const result = computeLayout(graph);
    expect(result[graph.nodes[0].id]).toEqual(graph.nodes[0].position);
    expect(Object.values(result).every((p) => [p.x, p.y, p.z].every(Number.isFinite))).toBe(true);
  });
  it('does not mutate graph nodes or link endpoints', () => {
    const graph = createInitialGraph(),
      before = JSON.stringify(graph);
    computeLayout(graph);
    expect(JSON.stringify(graph)).toBe(before);
  });
  it('supports an empty universe', () =>
    expect(computeLayout({ version: '1.0', nodes: [], links: [] })).toEqual({}));
});
