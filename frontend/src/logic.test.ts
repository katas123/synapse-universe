import 'fake-indexeddb/auto';
import { describe, it, expect, afterEach } from 'vitest';
import { GraphDatabase } from './db/database';
import { createInitialGraph, relationsFor, makeNode, demoEntry } from './services/demo';
import { parseGraph, mergeGraphs, visibleLinks } from './types/graph';
import { useGraph } from './stores/graphStore';
describe('graph import validation', () => {
  it('accepts full exported graph', () => {
    const graph = createInitialGraph();
    expect(
      parseGraph({ ...graph, metadata: { exportedAt: new Date().toISOString() } }).nodes.length,
    ).toBe(16);
  });
  it('rejects invalid strengths and unknown targets', () => {
    const graph = createInitialGraph();
    expect(() => parseGraph({ ...graph, links: [{ ...graph.links[0], strength: 1.1 }] })).toThrow();
    expect(() =>
      parseGraph({ ...graph, links: [{ ...graph.links[0], target: 'missing' }] }),
    ).toThrow();
  });
  it('rejects self references and duplicate nodes', () => {
    const graph = createInitialGraph();
    expect(() => parseGraph({ ...graph, nodes: [...graph.nodes, graph.nodes[0]] })).toThrow();
    expect(() =>
      parseGraph({
        ...graph,
        links: [{ ...graph.links[0], source: graph.nodes[0].id, target: graph.nodes[0].id }],
      }),
    ).toThrow();
  });
  it('rejects malformed input without altering graph', () => {
    const graph = createInitialGraph(),
      before = JSON.stringify(graph);
    expect(() => parseGraph({ version: '1.0', nodes: [{ term: 'x' }], links: [] })).toThrow();
    expect(JSON.stringify(graph)).toBe(before);
  });
  it('merges terms without duplicates and rewires references', () => {
    const a = createInitialGraph(),
      b = createInitialGraph();
    const merged = mergeGraphs(a, b);
    expect(merged.nodes).toHaveLength(a.nodes.length);
    expect(merged.links).toHaveLength(a.links.length);
    expect(() => parseGraph(merged)).not.toThrow();
  });
});
describe('relation filtering', () => {
  it('only returns existing targets above threshold', () => {
    const g = createInitialGraph();
    const docker = g.nodes.find((n) => n.term === 'Docker')!;
    const links = relationsFor(docker, g.nodes);
    expect(
      links.every(
        (l) =>
          l.strength >= 0.3 &&
          l.strength <= 1 &&
          l.target !== docker.id &&
          g.nodes.some((n) => n.id === l.target),
      ),
    ).toBe(true);
  });
  it('filters weak and dangling links', () => {
    const g = createInitialGraph(),
      ids = new Set(g.nodes.map((n) => n.id));
    expect(
      visibleLinks(
        [{ ...g.links[0], strength: 0.2 }, { ...g.links[0], target: 'no' }, g.links[0]],
        ids,
      ),
    ).toHaveLength(1);
  });
  it('does not fabricate analysis for unknown terms', () => {
    const n = makeNode(demoEntry('custom unknown'), 0);
    expect(n.keywords).toEqual([]);
    expect(relationsFor(n, createInitialGraph().nodes)).toEqual([]);
  });
});
describe('IndexedDB persistence', () => {
  const databases: GraphDatabase[] = [];
  afterEach(async () => {
    for (const d of databases) d.close();
    for (const d of databases) await d.delete();
    databases.length = 0;
  });
  it('restores nodes links and edited locked position after reopening', async () => {
    const name = 'test-' + crypto.randomUUID();
    const d = new GraphDatabase(name);
    databases.push(d);
    expect(await d.load()).toBeNull();
    const graph = createInitialGraph();
    graph.nodes[0].positionLocked = true;
    graph.nodes[0].position = { x: 9, y: 2, z: 1 };
    graph.nodes[0].summary = 'edited';
    await d.save(graph);
    d.close();
    const reopened = new GraphDatabase(name);
    databases.push(reopened);
    expect(await reopened.load()).toEqual(graph);
  });
  it('persists empty graph without reseeding', async () => {
    const d = new GraphDatabase('empty-' + crypto.randomUUID());
    databases.push(d);
    await d.save({ version: '1.0', nodes: [], links: [] });
    expect((await d.load())?.nodes).toEqual([]);
  });
  it('keeps existing data when validation fails', async () => {
    const d = new GraphDatabase('atomic-' + crypto.randomUUID());
    databases.push(d);
    const graph = createInitialGraph();
    await d.save(graph);
    await expect(
      d.save({ ...graph, links: [{ ...graph.links[0], target: 'invalid' }] }),
    ).rejects.toThrow();
    expect(await d.load()).toEqual(graph);
  });
});
describe('graph state', () => {
  it('rejects duplicate submission without mutating graph', async () => {
    const graph = createInitialGraph();
    useGraph.setState({ graph, busy: false, error: null });
    await useGraph.getState().add('docker');
    expect(useGraph.getState().graph).toBe(graph);
    expect(useGraph.getState().error).toContain('登録済み');
  });
  it('selects a node and updates focus revision', () => {
    useGraph.setState({ selectedId: null, focusRevision: 0 });
    useGraph.getState().select('some-id');
    expect(useGraph.getState().selectedId).toBe('some-id');
    expect(useGraph.getState().focusRevision).toBe(1);
  });
});
