import type { KnowledgeNode, KnowledgeLink } from '../types/graph';
import { demoEntry, makeNode, relationsFor } from './demo';
export type NodeAnalysis = Pick<
  KnowledgeNode,
  'term' | 'category' | 'summary' | 'details' | 'useCases' | 'keywords'
>;
export type AnalysisRelation = {
  targetId: string;
  strength: number;
  relationType: KnowledgeLink['relationType'];
  reason: string;
};
export interface AnalysisProvider {
  readonly mode: 'demo';
  analyze(
    term: string,
    existing: KnowledgeNode[],
  ): Promise<{ analysis: NodeAnalysis; relations: AnalysisRelation[] }>;
}
// Offline provider. A future HTTP provider can implement this boundary without
// introducing Codex RPC into the components or graph store.
export const demoProvider: AnalysisProvider = {
  mode: 'demo',
  async analyze(term, existing) {
    const analysis = demoEntry(term);
    return {
      analysis,
      relations: relationsFor(makeNode(analysis, existing.length), existing).map((link) => ({
        targetId: link.target,
        strength: link.strength,
        relationType: link.relationType,
        reason: link.reason,
      })),
    };
  },
};
