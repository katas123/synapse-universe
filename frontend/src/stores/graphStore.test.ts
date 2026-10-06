import { describe, it, expect, vi } from 'vitest';
import { createGraphStore } from './graphStore';
import { createInitialGraph } from '../services/demo';
import type { GraphRepository } from '../db/repository';
import type { KnowledgeGraph } from '../types/graph';
function memoryRepository(): GraphRepository {
  let saved: KnowledgeGraph | null = createInitialGraph();
  return {
    load: vi.fn(async () => saved),
    save: vi.fn(async (graph) => {
      saved = structuredClone(graph);
    }),
  };
}
describe('store persistence and concurrency', () => {
  it('initializes once under concurrent mounts', async () => {
    const repository = memoryRepository(),
      store = createGraphStore(repository);
    await Promise.all([store.getState().init(), store.getState().init()]);
    expect(repository.load).toHaveBeenCalledTimes(1);
    expect(store.getState().graph.nodes).toHaveLength(16);
  });
  it('keeps state when import persistence fails', async () => {
    const repository = memoryRepository(),
      store = createGraphStore(repository);
    await store.getState().init();
    const before = store.getState().graph;
    repository.save = vi.fn(async () => {
      throw new Error('quota');
    });
    await expect(
      store.getState().replace({ version: '1.0', nodes: [], links: [] }, false),
    ).rejects.toThrow('quota');
    expect(store.getState().graph).toBe(before);
    expect(store.getState().busy).toBe(false);
  });
  it('serializes previous edits before replacement and blocks competing edits', async () => {
    const repository = memoryRepository(),
      store = createGraphStore(repository);
    await store.getState().init();
    const writes: KnowledgeGraph[] = [];
    let release: () => void = () => {};
    repository.save = vi.fn(async (graph) => {
      writes.push(graph);
      if (writes.length === 1)
        await new Promise<void>((resolve) => {
          release = resolve;
        });
    });
    const node = store.getState().graph.nodes[0];
    store.getState().edit(node.id, { summary: 'before import' });
    await vi.waitFor(() => expect(writes).toHaveLength(1));
    const replace = store.getState().replace({ version: '1.0', nodes: [], links: [] }, false);
    store.getState().edit(node.id, { summary: 'must not overwrite' });
    expect(store.getState().graph.nodes[0].summary).toBe('before import');
    release();
    await replace;
    expect(writes).toHaveLength(2);
    expect(writes[1].nodes).toEqual([]);
    expect(store.getState().graph.nodes).toEqual([]);
  });
  it('restores busy status after provider failure', async () => {
    const store = createGraphStore(memoryRepository(), {
      mode: 'demo',
      analyze: async () => {
        throw new Error('bad analysis');
      },
    });
    await store.getState().init();
    await store.getState().add('new term');
    expect(store.getState().busy).toBe(false);
    expect(store.getState().error).toContain('追加できません');
    expect(store.getState().graph.nodes).toHaveLength(16);
  });
  it('does not overwrite unreadable stored data at startup', async () => {
    const repository = {
      load: vi.fn(async () => {
        throw new Error('invalid data');
      }),
      save: vi.fn(async () => {}),
    };
    const store = createGraphStore(repository);
    await store.getState().init();
    expect(repository.save).not.toHaveBeenCalled();
    expect(store.getState().stored).toBe(false);
    expect(store.getState().error).not.toBeNull();
  });
  it('rejects invalid edited values before mutation', async () => {
    const store = createGraphStore(memoryRepository());
    await store.getState().init();
    const before = store.getState().graph;
    store.getState().edit(before.nodes[0].id, { keywords: ['x'.repeat(101)] });
    expect(store.getState().graph).toBe(before);
    expect(store.getState().error).not.toBeNull();
  });
});
