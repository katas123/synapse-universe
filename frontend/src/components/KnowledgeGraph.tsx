import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  Component,
  type ReactNode,
  type ComponentRef,
} from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Line } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { computeLayout } from '../services/layout';
import { Vector3, Plane, Color, type Mesh, type Group } from 'three';
import { useGraph } from '../stores/graphStore';
import { colors, type KnowledgeNode } from '../types/graph';
export type GraphOptions = {
  category: string | null;
  labels: boolean;
  motion: boolean;
  reset: number;
};
class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="canvas-error">
        3D表示を起動できませんでした。
        <br />
        上部の「知識一覧」から内容を閲覧できます。
      </div>
    ) : (
      this.props.children
    );
  }
}
function Camera({ positions, reset }: { positions: Map<string, Vector3>; reset: number }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null),
    { camera } = useThree();
  const selected = useGraph((s) => s.selectedId),
    revision = useGraph((s) => s.focusRevision);
  const destination = useRef<{ p: Vector3; t: Vector3 } | null>(null);
  useEffect(() => {
    const t = selected ? positions.get(selected) : new Vector3();
    if (!t) return;
    const mobile = window.innerWidth < 760;
    const radius = Math.max(9, ...Array.from(positions.values(), (v) => v.length()));
    const distance = selected
      ? mobile
        ? 26
        : 19
      : Math.max(40, Math.min(95, radius * (mobile ? 4 : 3)));
    destination.current = {
      t: t.clone(),
      p: t.clone().add(new Vector3(0, mobile ? 4 : 2, distance)),
    };
  }, [revision, selected, reset]);
  useFrame((_, dt) => {
    if (!destination.current || !controls.current) return;
    const k = 1 - Math.exp(-dt * 3);
    camera.position.lerp(destination.current.p, k);
    controls.current.target.lerp(destination.current.t, k);
    controls.current.update();
    if (camera.position.distanceTo(destination.current.p) < 0.02) destination.current = null;
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={7}
      maxDistance={100}
      enablePan
      onStart={() => {
        destination.current = null;
      }}
    />
  );
}
function StarNode({
  node,
  p,
  dim,
  labels,
  motion,
  onDrag,
}: {
  node: KnowledgeNode;
  p: Vector3;
  dim: boolean;
  labels: boolean;
  motion: boolean;
  onDrag: (id: string, p: Vector3 | null) => void;
}) {
  const ref = useRef<Group>(null),
    mesh = useRef<Mesh>(null),
    [hover, setHover] = useState(false);
  const { camera, controls } = useThree();
  const birth = useRef(0),
    drag = useRef<{
      plane: Plane;
      offset: Vector3;
      start: Vector3;
      last: Vector3;
      moved: boolean;
    } | null>(null);
  const selected = useGraph((s) => s.selectedId === node.id);
  const c = colors[node.category] ?? colors.Concept;
  useEffect(() => {
    document.body.style.cursor = hover ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hover]);
  useFrame((_, dt) => {
    birth.current = Math.min(1, birth.current + dt * 1.8);
    if (ref.current) {
      const target = (hover ? 1.2 : 1) * Math.sin((birth.current * Math.PI) / 2);
      ref.current.scale.lerp(new Vector3(target, target, target), motion ? 0.14 : 1);
    }
    if (mesh.current) mesh.current.rotation.y += dt * 0.15;
  });
  function down(e: ThreeEvent<PointerEvent>) {
    if (e.button !== 0) return;
    e.stopPropagation();
    const plane = new Plane().setFromNormalAndCoplanarPoint(
      camera.getWorldDirection(new Vector3()),
      p,
    );
    const point = e.ray.intersectPlane(plane, new Vector3());
    if (!point) return;
    drag.current = {
      plane,
      offset: p.clone().sub(point),
      start: p.clone(),
      last: p.clone(),
      moved: false,
    };
    (e.target as Element).setPointerCapture(e.pointerId);
    if (controls && 'enabled' in controls) controls.enabled = false;
  }
  function move(e: ThreeEvent<PointerEvent>) {
    if (!drag.current) return;
    e.stopPropagation();
    const point = e.ray.intersectPlane(drag.current.plane, new Vector3());
    if (point) {
      point.add(drag.current.offset);
      if (point.distanceTo(drag.current.start) > 0.18) drag.current.moved = true;
      if (drag.current.moved) {
        drag.current.last.copy(point);
        onDrag(node.id, point);
      }
    }
  }
  function up(e: ThreeEvent<PointerEvent>) {
    if (!drag.current) return;
    e.stopPropagation();
    const moved = drag.current.moved,
      last = drag.current.last;
    drag.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
    if (controls && 'enabled' in controls) controls.enabled = true;
    if (moved) {
      useGraph.getState().move(node.id, { x: last.x, y: last.y, z: last.z });
      onDrag(node.id, null);
    } else useGraph.getState().select(node.id);
  }
  return (
    <group position={p} ref={ref}>
      <mesh
        ref={mesh}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
      >
        <sphereGeometry args={[node.term === 'Docker' ? 0.48 : 0.34, 20, 16]} />
        <meshStandardMaterial
          color={c}
          emissive={new Color(c)}
          emissiveIntensity={dim ? 0.12 : selected ? 3.6 : 1.6}
          transparent
          opacity={dim ? 0.16 : 1}
          roughness={0.25}
        />
      </mesh>
      {!dim && (
        <mesh scale={selected ? 2.3 : 1.8}>
          <sphereGeometry args={[0.34, 16, 12]} />
          <meshBasicMaterial
            color={c}
            transparent
            opacity={selected ? 0.09 : 0.035}
            depthWrite={false}
          />
        </mesh>
      )}
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.68, 0.7, 48]} />
          <meshBasicMaterial color={c} transparent opacity={0.65} side={2} />
        </mesh>
      )}
      {labels && (
        <Html
          center
          position={[0, -0.95, 0]}
          zIndexRange={[5, 0]}
          style={{ pointerEvents: 'none', whiteSpace: 'nowrap', opacity: dim ? 0.14 : 1 }}
        >
          <span className={'node-label' + (selected ? ' active' : '')}>{node.term}</span>
        </Html>
      )}
    </group>
  );
}
function Scene({ category, labels, motion, reset }: GraphOptions) {
  const graph = useGraph((s) => s.graph),
    selected = useGraph((s) => s.selectedId),
    [dragged, setDragged] = useState<Record<string, Vector3>>({});
  const layoutRevision = useGraph((s) => s.layoutRevision);
  const signature =
    layoutRevision +
    ':' +
    graph.nodes
      .map((n) => `${n.id}:${n.positionLocked ? JSON.stringify(n.position) : ''}`)
      .join('|') +
    graph.links.map((l) => `${l.id}:${l.strength}:${l.source}:${l.target}`).join('|');
  const positions = useMemo(() => {
    return new Map(
      Object.entries(computeLayout(graph)).map(([id, p]) => [id, new Vector3(p.x, p.y, p.z)]),
    );
  }, [signature]);
  useEffect(() => {
    const timer = setTimeout(() => {
      const p: Record<string, { x: number; y: number; z: number }> = {};
      positions.forEach((v, id) => (p[id] = { x: v.x, y: v.y, z: v.z }));
      useGraph.getState().saveLayout(p);
    }, 1000);
    return () => clearTimeout(timer);
  }, [positions]);
  const neighbors = new Set([selected]);
  if (selected)
    graph.links
      .filter((l) => l.strength >= 0.3)
      .forEach((l) => {
        if (l.source === selected) neighbors.add(l.target);
        if (l.target === selected) neighbors.add(l.source);
      });
  const shown = new Set(
    graph.nodes.filter((n) => !category || n.category === category).map((n) => n.id),
  );
  function onDrag(id: string, p: Vector3 | null) {
    if (p) {
      positions.set(id, p);
      setDragged((s) => ({ ...s, [id]: p }));
    } else
      setDragged((s) => {
        const next = { ...s };
        delete next[id];
        return next;
      });
  }
  return (
    <>
      <color attach="background" args={['#06090f']} />
      <ambientLight intensity={0.6} />
      <Stars
        radius={110}
        depth={80}
        count={window.innerWidth < 760 ? 1400 : 2600}
        factor={2.4}
        saturation={0}
        fade
        speed={motion ? 0.15 : 0}
      />
      {graph.links
        .filter((l) => l.strength >= 0.3 && shown.has(l.source) && shown.has(l.target))
        .map((l) => {
          const a = dragged[l.source] ?? positions.get(l.source),
            b = dragged[l.target] ?? positions.get(l.target);
          if (!a || !b) return null;
          const related = !selected || l.source === selected || l.target === selected;
          return (
            <Line
              key={l.id}
              points={[a, b]}
              color={related ? (l.strength >= 0.7 ? '#93bfa8' : '#476b68') : '#20322e'}
              lineWidth={l.strength >= 0.7 ? 1.3 : 0.7}
              transparent
              opacity={related ? (l.strength >= 0.7 ? 0.45 : 0.3) : 0.12}
            />
          );
        })}
      {graph.nodes
        .filter((n) => shown.has(n.id))
        .map((n) => (
          <StarNode
            key={n.id}
            node={n}
            p={dragged[n.id] ?? positions.get(n.id)!}
            dim={!!selected && !neighbors.has(n.id)}
            labels={labels}
            motion={motion}
            onDrag={onDrag}
          />
        ))}
      <Camera positions={positions} reset={reset} />
      {window.innerWidth >= 760 && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.9} intensity={0.6} mipmapBlur />
        </EffectComposer>
      )}
    </>
  );
}
export default function KnowledgeGraph(options: GraphOptions) {
  return (
    <CanvasBoundary>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 3, 44], fov: 52 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onPointerMissed={() => useGraph.getState().select(null)}
      >
        <Suspense fallback={null}>
          <Scene {...options} />
        </Suspense>
      </Canvas>
    </CanvasBoundary>
  );
}
