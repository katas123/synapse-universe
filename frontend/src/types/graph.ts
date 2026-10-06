import { z } from 'zod';
export const categories = ['Infrastructure', 'Frontend', 'Backend', 'Data', 'Concept'] as const;
export type Category = (typeof categories)[number];
export const colors: Record<string, string> = {
  Infrastructure: '#9befbc',
  Frontend: '#8eaaff',
  Backend: '#f7bf7c',
  Data: '#bf9afa',
  Concept: '#70d5df',
};
const text = z.string().max(20000);
export const nodeSchema = z.object({
  id: z.string().min(1).max(200),
  term: z.string().trim().min(1).max(100),
  category: z.string().min(1).max(100),
  summary: text,
  details: text,
  useCases: z.array(text).max(30),
  keywords: z.array(z.string().max(100)).max(30),
  position: z.object({
    x: z.number().finite().min(-10000).max(10000),
    y: z.number().finite().min(-10000).max(10000),
    z: z.number().finite().min(-10000).max(10000),
  }),
  positionLocked: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export const relationTypes = [
  'dependency',
  'prerequisite',
  'implementation',
  'alternative',
  'complementary',
  'protocol',
  'platform',
  'concept',
  'ecosystem',
  'related',
] as const;
export const linkSchema = z.object({
  id: z.string().min(1).max(200),
  source: z.string(),
  target: z.string(),
  strength: z.number().min(0).max(1),
  relationType: z.enum(relationTypes),
  reason: text,
  createdAt: z.iso.datetime(),
});
export const graphSchema = z
  .object({
    version: z.literal('1.0'),
    nodes: z.array(nodeSchema).max(500),
    links: z.array(linkSchema).max(3000),
  })
  .superRefine((g, ctx) => {
    const ids = new Set<string>(),
      terms = new Set<string>(),
      pairs = new Set<string>(),
      linkIds = new Set<string>();
    for (const n of g.nodes) {
      const term = n.term.toLocaleLowerCase();
      if (ids.has(n.id) || terms.has(term))
        ctx.addIssue({ code: 'custom', message: '知識が重複しています' });
      ids.add(n.id);
      terms.add(term);
    }
    for (const l of g.links) {
      const pair = JSON.stringify([l.source, l.target].sort());
      if (
        !ids.has(l.source) ||
        !ids.has(l.target) ||
        l.source === l.target ||
        pairs.has(pair) ||
        linkIds.has(l.id)
      )
        ctx.addIssue({ code: 'custom', message: '関連線が不正です' });
      pairs.add(pair);
      linkIds.add(l.id);
    }
  });
export type KnowledgeNode = z.infer<typeof nodeSchema>;
export type KnowledgeLink = z.infer<typeof linkSchema>;
export type KnowledgeGraph = z.infer<typeof graphSchema>;
export function parseGraph(input: unknown): KnowledgeGraph {
  return graphSchema.parse(input);
}
export function visibleLinks(links: KnowledgeLink[], ids: Set<string>) {
  return links.filter(
    (l) => l.strength >= 0.3 && ids.has(l.source) && ids.has(l.target) && l.source !== l.target,
  );
}
export function mergeGraphs(current: KnowledgeGraph, incoming: KnowledgeGraph): KnowledgeGraph {
  const nodes = [...current.nodes],
    mapping = new Map<string, string>();
  for (const n of incoming.nodes) {
    const same = nodes.find((x) => x.term.toLowerCase() === n.term.toLowerCase());
    if (same) {
      mapping.set(n.id, same.id);
      continue;
    }
    const id = nodes.some((x) => x.id === n.id) ? crypto.randomUUID() : n.id;
    mapping.set(n.id, id);
    nodes.push({ ...n, id });
  }
  const links = [...current.links],
    pairs = new Set(links.map((l) => JSON.stringify([l.source, l.target].sort())));
  for (const l of incoming.links) {
    const source = mapping.get(l.source)!,
      target = mapping.get(l.target)!,
      pair = JSON.stringify([source, target].sort());
    if (source === target || pairs.has(pair)) continue;
    links.push({ ...l, id: crypto.randomUUID(), source, target });
    pairs.add(pair);
  }
  return parseGraph({ version: '1.0', nodes, links });
}
