import { create } from 'zustand';
import { db } from '../db/database';
import type { GraphRepository } from '../db/repository';
import { createInitialGraph, makeNode } from '../services/demo';
import { demoProvider, type AnalysisProvider } from '../services/analysis';
import { mergeGraphs, parseGraph, type KnowledgeGraph, type KnowledgeNode } from '../types/graph';

interface GraphState {
  graph: KnowledgeGraph;
  selectedId: string | null;
  focusRevision: number;
  layoutRevision: number;
  ready: boolean;
  busy: boolean;
  stage: string;
  error: string | null;
  saving: boolean;
  stored: boolean;
  init: () => Promise<void>;
  select: (id: string | null) => void;
  add: (term: string) => Promise<void>;
  move: (id: string, position: KnowledgeNode['position']) => void;
  saveLayout: (positions: Record<string, KnowledgeNode['position']>) => void;
  edit: (
    id: string,
    patch: Partial<Pick<KnowledgeNode, 'summary' | 'details' | 'keywords' | 'useCases'>>,
  ) => void;
  replace: (graph: unknown, merge: boolean) => Promise<void>;
  reset: () => Promise<void>;
  persist: () => Promise<void>;
  clearError: () => void;
}
const emptyGraph = (): KnowledgeGraph => ({ version: '1.0', nodes: [], links: [] });

// Each instance owns its initialization and write queue. Repository and provider
// injection allow deterministic tests without touching the visitor's database.
export function createGraphStore(
  repository: GraphRepository = db,
  provider: AnalysisProvider = demoProvider,
) {
  let writeQueue = Promise.resolve();
  let initialization: Promise<void> | null = null;
  let pendingWrites = 0;
  function enqueue(graph: KnowledgeGraph) {
    const snapshot = parseGraph(graph);
    const operation = writeQueue.catch(() => {}).then(() => repository.save(snapshot));
    writeQueue = operation;
    return operation;
  }
  return create<GraphState>((set, get) => ({
    graph: emptyGraph(),
    selectedId: null,
    focusRevision: 0,
    layoutRevision: 0,
    ready: false,
    busy: false,
    stage: '',
    error: null,
    saving: false,
    stored: false,
    init: () => {
      if (initialization) return initialization;
      initialization = (async () => {
        try {
          const saved = await repository.load();
          set({ graph: saved ?? createInitialGraph(), ready: true, stored: !!saved });
          if (!saved) await get().persist();
        } catch {
          // Never overwrite unreadable persisted data with initial demo data.
          set({
            graph: createInitialGraph(),
            ready: true,
            error: 'ブラウザ内の保存領域を読み込めません。JSONでバックアップしてください。',
          });
        }
      })();
      return initialization;
    },
    select: (id) => set((state) => ({ selectedId: id, focusRevision: state.focusRevision + 1 })),
    clearError: () => set({ error: null }),
    persist: async () => {
      pendingWrites++;
      set({ saving: true });
      try {
        await enqueue(get().graph);
        set({ stored: true });
      } catch {
        set({ stored: false, error: '保存できませんでした。JSONでバックアップしてください。' });
      } finally {
        pendingWrites--;
        set({ saving: pendingWrites > 0 });
      }
    },
    add: async (input) => {
      const term = input.trim();
      if (get().busy || !term) return;
      if (get().graph.nodes.some((node) => node.term.toLowerCase() === term.toLowerCase())) {
        set({ error: 'この知識は登録済みです。検索から選択してください。' });
        return;
      }
      if (term.length > 100) {
        set({ error: '用語は100文字以内で入力してください。' });
        return;
      }
      if (!get().ready) return;
      if (get().graph.nodes.length >= 500) {
        set({ error: 'デモは最大500ノードです。' });
        return;
      }
      set({ busy: true, error: null, stage: `${term} の知識を準備中…` });
      try {
        const current = get().graph;
        const result = await provider.analyze(term, current.nodes);
        set({ stage: 'デモ辞書からつながりを検索中…' });
        const node = makeNode(result.analysis, current.nodes.length);
        const ids = new Set(current.nodes.map((existing) => existing.id));
        const seen = new Set<string>();
        const links = result.relations
          .filter((relation) => {
            if (
              !ids.has(relation.targetId) ||
              relation.strength < 0.3 ||
              seen.has(relation.targetId)
            )
              return false;
            seen.add(relation.targetId);
            return true;
          })
          .map((relation) => ({
            id: crypto.randomUUID(),
            source: node.id,
            target: relation.targetId,
            strength: relation.strength,
            relationType: relation.relationType,
            reason: relation.reason,
            createdAt: new Date().toISOString(),
          }));
        const graph = parseGraph({
          ...current,
          nodes: [...current.nodes, node],
          links: [...current.links, ...links],
        });
        set({ graph, selectedId: node.id, focusRevision: get().focusRevision + 1 });
        await get().persist();
      } catch {
        set({ error: '追加できませんでした。もう一度お試しください。' });
      } finally {
        set({ busy: false, stage: '' });
      }
    },
    move: (id, position) => {
      if (get().busy) return;
      try {
        const graph = parseGraph({
          ...get().graph,
          nodes: get().graph.nodes.map((node) =>
            node.id === id
              ? { ...node, position, positionLocked: true, updatedAt: new Date().toISOString() }
              : node,
          ),
        });
        set({ graph });
        void get().persist();
      } catch {
        set({ error: 'ノードの位置を保存できませんでした。' });
      }
    },
    saveLayout: (positions) => {
      if (get().busy) return;
      const nodes = get().graph.nodes.map((node) =>
        !node.positionLocked && positions[node.id]
          ? { ...node, position: positions[node.id] }
          : node,
      );
      const unchanged = nodes.every((node, i) => {
        const before = get().graph.nodes[i].position;
        return (
          node.position.x === before.x &&
          node.position.y === before.y &&
          node.position.z === before.z
        );
      });
      if (unchanged) return;
      try {
        set({ graph: parseGraph({ ...get().graph, nodes }) });
        void get().persist();
      } catch {
        set({ error: '自動配置の結果を保存できませんでした。' });
      }
    },
    edit: (id, patch) => {
      if (get().busy) return;
      try {
        set({
          graph: parseGraph({
            ...get().graph,
            nodes: get().graph.nodes.map((node) =>
              node.id === id ? { ...node, ...patch, updatedAt: new Date().toISOString() } : node,
            ),
          }),
        });
        void get().persist();
      } catch {
        set({ error: '入力内容を確認してください。説明やキーワードが長すぎる可能性があります。' });
      }
    },
    replace: async (input, merge) => {
      if (get().busy) throw new Error('GRAPH_BUSY');
      const incoming = parseGraph(input);
      const graph = merge ? mergeGraphs(get().graph, incoming) : incoming;
      set({ busy: true, saving: true });
      try {
        await enqueue(graph);
        set({
          graph,
          selectedId: null,
          stored: true,
          error: null,
          layoutRevision: get().layoutRevision + 1,
        });
      } finally {
        set({ busy: false, saving: pendingWrites > 0 });
      }
    },
    reset: async () => {
      if (get().busy) throw new Error('GRAPH_BUSY');
      const graph = emptyGraph();
      set({ busy: true, saving: true });
      try {
        await enqueue(graph);
        set({
          graph,
          selectedId: null,
          stored: true,
          error: null,
          layoutRevision: get().layoutRevision + 1,
        });
      } finally {
        set({ busy: false, saving: pendingWrites > 0 });
      }
    },
  }));
}
export const useGraph = createGraphStore();
