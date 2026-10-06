import type { KnowledgeGraph } from '../types/graph';
export interface GraphRepository {
  load(): Promise<KnowledgeGraph | null>;
  save(graph: KnowledgeGraph): Promise<void>;
}
