import type { GraphRepository } from './repository';
import Dexie, { type Table } from 'dexie';
import {
  parseGraph,
  type KnowledgeGraph,
  type KnowledgeNode,
  type KnowledgeLink,
} from '../types/graph';
export class GraphDatabase extends Dexie implements GraphRepository {
  nodes!: Table<KnowledgeNode, string>;
  links!: Table<KnowledgeLink, string>;
  settings!: Table<{ key: string; value: unknown }, string>;
  constructor(name = 'synapse-universe-v1') {
    super(name);
    this.version(1).stores({
      nodes: 'id,term,category',
      links: 'id,source,target',
      settings: 'key',
    });
  }
  async load(): Promise<KnowledgeGraph | null> {
    return this.transaction('r', this.nodes, this.links, this.settings, async () => {
      const initialized = await this.settings.get('initialized');
      if (!initialized) return null;
      const order = await this.settings.get('order');
      const saved = order?.value as { nodes: string[]; links: string[] } | undefined;
      const nodes = await this.nodes.toArray(),
        links = await this.links.toArray();
      if (saved) {
        const ni = new Map(saved.nodes.map((id, i) => [id, i])),
          li = new Map(saved.links.map((id, i) => [id, i]));
        nodes.sort((a, b) => (ni.get(a.id) ?? 0) - (ni.get(b.id) ?? 0));
        links.sort((a, b) => (li.get(a.id) ?? 0) - (li.get(b.id) ?? 0));
      }
      return parseGraph({ version: '1.0', nodes, links });
    });
  }
  async save(graph: KnowledgeGraph) {
    const valid = parseGraph(graph);
    await this.transaction('rw', this.nodes, this.links, this.settings, async () => {
      await this.nodes.clear();
      await this.links.clear();
      await this.nodes.bulkPut(valid.nodes);
      await this.links.bulkPut(valid.links);
      await this.settings.put({ key: 'initialized', value: true });
      await this.settings.put({
        key: 'order',
        value: { nodes: valid.nodes.map((n) => n.id), links: valid.links.map((l) => l.id) },
      });
    });
  }
}
export const db = new GraphDatabase();
