// Typed boundary for the d3-force-3d APIs used by the graph renderer.
// The package currently ships no TypeScript declarations.
declare module 'd3-force-3d' {
  interface NodeDatum {
    id: string;
    x: number;
    y: number;
    z: number;
    fx?: number;
    fy?: number;
    fz?: number;
  }
  interface Force {
    strength(value: number): Force;
  }
  interface LinkDatum {
    source: string;
    target: string;
    strength: number;
  }
  interface LinkForce<T extends LinkDatum> {
    id(accessor: (node: NodeDatum) => string): LinkForce<T>;
    distance(accessor: (link: T) => number): LinkForce<T>;
    strength(accessor: (link: T) => number): LinkForce<T>;
  }
  interface Simulation {
    force(name: string, force: Force | LinkForce<LinkDatum>): Simulation;
    stop(): Simulation;
    tick(iterations?: number): Simulation;
  }
  export function forceSimulation(nodes: NodeDatum[], dimensions?: number): Simulation;
  export function forceLink<T extends LinkDatum>(links: T[]): LinkForce<T>;
  export function forceManyBody(): Force;
  export function forceCollide(radius: number): Force;
  export function forceCenter(x: number, y: number, z: number): Force;
  export function forceX(x: number): Force;
  export function forceY(y: number): Force;
  export function forceZ(z: number): Force;
}
