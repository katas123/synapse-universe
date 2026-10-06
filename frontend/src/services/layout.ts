import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  forceCenter,
  forceX,
  forceY,
  forceZ,
} from 'd3-force-3d';
import { visibleLinks, type KnowledgeGraph, type KnowledgeNode } from '../types/graph';
export function computeLayout(graph: KnowledgeGraph): Record<string, KnowledgeNode['position']> {
  const nodes = graph.nodes.map((node) => ({
    id: node.id,
    ...node.position,
    ...(node.positionLocked
      ? { fx: node.position.x, fy: node.position.y, fz: node.position.z }
      : {}),
  }));
  if (nodes.length === 0) return {};
  const edges = visibleLinks(graph.links, new Set(nodes.map((node) => node.id))).map((link) => ({
    ...link,
  }));
  // Run bounded ticks off the render loop and stop d3's background timer.
  const simulation = forceSimulation(nodes, 3)
    .force(
      'link',
      forceLink(edges)
        .id((node) => node.id)
        .distance((link) => 8 - link.strength * 4)
        .strength((link) => link.strength * 0.65),
    )
    .force('charge', forceManyBody().strength(-1.5))
    .force('collision', forceCollide(1.65))
    .force('center', forceCenter(0, 0, 0))
    .force('x', forceX(0).strength(0.25))
    .force('y', forceY(0).strength(0.25))
    .force('z', forceZ(0).strength(0.25))
    .stop();
  simulation.tick(160);
  return Object.fromEntries(nodes.map((node) => [node.id, { x: node.x, y: node.y, z: node.z }]));
}
