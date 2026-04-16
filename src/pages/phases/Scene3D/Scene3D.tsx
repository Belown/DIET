import { Suspense, useMemo, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { defaultDataset } from "../../../data/dataset";
import type { BoundaryParams } from "../../../context/SimulatorContext";

// Map data (0-100) → Three.js (-5 to 5)
const d = (v: number) => (v - 50) / 10;

// Data-point sizes (3D) — tweak these to resize all markers at once
const DOT3D = { tpRadius: 0.09, fpSide: 0.14, fnRadius: 0.1, fnHeight: 0.1, tnRadius: 0.06 };

// Bounding box of ALL data points — planes span the full data range
const BOUNDS = {
  minTech: Math.min(...defaultDataset.map((s) => s.techScore)),
  maxTech: Math.max(...defaultDataset.map((s) => s.techScore)),
  minPort: Math.min(...defaultDataset.map((s) => s.softSkill)),
  maxPort: Math.max(...defaultDataset.map((s) => s.softSkill)),
};

// ─── Plane clipping ───────────────────────────────────────────────────────────
// For the blue plane (tech): y_blue = s1*x + i1  (independent of z)
// For the red  plane (port): y_red  = s2*z + i2  (independent of x)
// Blue is "dominant" where y_blue >= y_red  → s1*x - s2*z >= i2 - i1
// We clip each plane's XZ quad to only the half where it is dominant.
//
// Sutherland-Hodgman against the single clip edge:
//   blue clip: keep points where  s1*x - s2*z >= (i2 - i1)   (data-space x,z = techScore, softSkill)
//   red  clip: keep points where  s1*x - s2*z <= (i2 - i1)

type XZ = [number, number]; // data-space (techScore, softSkill)

function signedDist(p: XZ, s1: number, s2: number, rhs: number): number {
  return s1 * p[0] - s2 * p[1] - rhs; // positive = blue side
}

function intersectEdge(a: XZ, b: XZ, s1: number, s2: number, rhs: number): XZ {
  const da = signedDist(a, s1, s2, rhs);
  const db = signedDist(b, s1, s2, rhs);
  const t = da / (da - db);
  return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
}

function clipPolygon(poly: XZ[], keepPositive: boolean, s1: number, s2: number, rhs: number): XZ[] {
  if (poly.length === 0) return [];
  const out: XZ[] = [];
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i];
    const nxt = poly[(i + 1) % poly.length];
    const dc = signedDist(cur, s1, s2, rhs);
    const dn = signedDist(nxt, s1, s2, rhs);
    const curIn = keepPositive ? dc >= 0 : dc <= 0;
    const nxtIn = keepPositive ? dn >= 0 : dn <= 0;
    if (curIn) out.push(cur);
    if (curIn !== nxtIn) out.push(intersectEdge(cur, nxt, s1, s2, rhs));
  }
  return out;
}

// Convert an XZ polygon on a plane into 3D vertices
function xzToVertices(poly: XZ[], b: BoundaryParams, axis: "tech" | "softSkill"): number[] {
  return poly.flatMap(([x, z]) => {
    const yData = axis === "tech"
      ? b.slope * x + b.intercept
      : b.slope * z + b.intercept;
    return [d(x), d(yData), d(z)];
  });
}

// Triangulate a convex polygon (fan from vertex 0)
function triangulateFan(n: number): number[] {
  const idx: number[] = [];
  for (let i = 1; i < n - 1; i++) idx.push(0, i, i + 1);
  return idx;
}

// ─── Data points ──────────────────────────────────────────────────────────────

function DataPoints({ hiredSet }: { hiredSet: Set<number> }) {
  const groups = useMemo(() => {
    const tpA: number[] = [], tpB: number[] = [];
    const fpA: [number, number, number][] = [], fpB: [number, number, number][] = [];
    const tnA: number[] = [], tnB: number[] = [];
    const fnA: [number, number, number][] = [];
    const fnB: [number, number, number][] = [];

    for (const s of defaultDataset) {
      const pos: [number, number, number] = [d(s.techScore), d(s.experience), d(s.softSkill)];
      const hired = hiredSet.has(s.id);

      if (hired && s.qualified) {
        (s.group === "A" ? tpA : tpB).push(...pos);
      } else if (hired && !s.qualified) {
        (s.group === "A" ? fpA : fpB).push(pos);
      } else if (!hired && s.qualified) {
        (s.group === "A" ? fnA : fnB).push(pos);
      } else {
        (s.group === "A" ? tnA : tnB).push(...pos);
      }
    }

    return {
      tpA: new Float32Array(tpA), tpB: new Float32Array(tpB),
      fpA, fpB,
      tnA: new Float32Array(tnA), tnB: new Float32Array(tnB),
      fnA, fnB,
    };
  }, [hiredSet]);

  return (
    <>
      {/* TN: small dim spheres, group color */}
      <SphereCloud positions={groups.tnA} color="#494fdf" opacity={0.15} radius={DOT3D.tnRadius} />
      <SphereCloud positions={groups.tnB} color="#e61e49" opacity={0.15} radius={DOT3D.tnRadius} />
      {/* FP: amber cubes */}
      <FPPoints positions={groups.fpA} color="#e8a308" />
      <FPPoints positions={groups.fpB} color="#e8a308" />
      {/* TP: large solid spheres, group color */}
      <SphereCloud positions={groups.tpA} color="#494fdf" opacity={1} radius={DOT3D.tpRadius} />
      <SphereCloud positions={groups.tpB} color="#e61e49" opacity={1} radius={DOT3D.tpRadius} />
      {/* FN: amber diamonds */}
      <FNPoints positions={groups.fnA} color="#e8a308" />
      <FNPoints positions={groups.fnB} color="#e8a308" />
    </>
  );
}

function SphereCloud({ positions, color, opacity, radius }: {
  positions: Float32Array; color: string; opacity: number; radius: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = positions.length / 3;
  const geo = useMemo(() => new THREE.SphereGeometry(radius, 8, 6), [radius]);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color, transparent: true, opacity }),
    [color, opacity],
  );

  useEffect(() => {
    if (!meshRef.current || count === 0) return;
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      matrix.setPosition(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      meshRef.current.setMatrixAt(i, matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, count]);

  if (count === 0) return null;
  return <instancedMesh ref={meshRef} args={[geo, mat, count]} />;
}

// Elongated diamond (bipyramid): tall in Y, narrow in XZ — unmistakably ◆-shaped
function makeDiamondGeo(r: number, h: number): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  // 6 vertices: top, right, front, left, back, bottom
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([
     0,  h,  0,  // 0 top
     r,  0,  0,  // 1 right
     0,  0,  r,  // 2 front
    -r,  0,  0,  // 3 left
     0,  0, -r,  // 4 back
     0, -h,  0,  // 5 bottom
  ]), 3));
  geo.setIndex([
    0, 1, 2,  0, 2, 3,  0, 3, 4,  0, 4, 1,  // upper pyramid
    5, 2, 1,  5, 3, 2,  5, 4, 3,  5, 1, 4,  // lower pyramid
  ]);
  geo.computeVertexNormals();
  return geo;
}

function FNPoints({ positions, color }: {
  positions: [number, number, number][]; color: string;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => makeDiamondGeo(DOT3D.fnRadius, DOT3D.fnHeight), []);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.9 }),
    [color],
  );

  useEffect(() => {
    if (!meshRef.current || positions.length === 0) return;
    const matrix = new THREE.Matrix4();
    positions.forEach(([x, y, z], i) => {
      matrix.setPosition(x, y, z);
      meshRef.current!.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  if (positions.length === 0) return null;
  return <instancedMesh ref={meshRef} args={[geo, mat, positions.length]} />;
}

function FPPoints({ positions, color }: {
  positions: [number, number, number][]; color: string;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.BoxGeometry(DOT3D.fpSide, DOT3D.fpSide, DOT3D.fpSide), []);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.9 }),
    [color],
  );

  useEffect(() => {
    if (!meshRef.current || positions.length === 0) return;
    const matrix = new THREE.Matrix4();
    positions.forEach(([x, y, z], i) => {
      matrix.setPosition(x, y, z);
      meshRef.current!.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  if (positions.length === 0) return null;
  return <instancedMesh ref={meshRef} args={[geo, mat, positions.length]} />;
}

// ─── Boundary planes ──────────────────────────────────────────────────────────

function BoundaryPlane({ b1, b2, axis, color }: {
  b1: BoundaryParams; b2: BoundaryParams;
  axis: "tech" | "softSkill"; color: string;
}) {
  const geo = useMemo(() => {
    const { minTech, maxTech, minPort, maxPort } = BOUNDS;

    // Full XZ quad for this plane, in data space
    const quad: XZ[] = [
      [minTech, minPort],
      [maxTech, minPort],
      [maxTech, maxPort],
      [minTech, maxPort],
    ];

    // Clip condition: blue (tech) is dominant where s1*x - s2*z >= i2 - i1
    const rhs = b2.intercept - b1.intercept; // i2 - i1
    const s1 = b1.slope;  // blue slope on x
    const s2 = b2.slope;  // red  slope on z
    const keepPositive = axis !== "tech"; // blue keeps negative side, red keeps positive

    const clipped = clipPolygon(quad, keepPositive, s1, s2, rhs);
    if (clipped.length < 3) return null;

    const b = axis === "tech" ? b1 : b2;
    const verts = new Float32Array(xzToVertices(clipped, b, axis));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(verts, 3));
    g.setIndex(triangulateFan(clipped.length));
    g.computeVertexNormals();
    return g;
  }, [b1, b2, axis]);

  if (!geo) return null;

  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} opacity={0.28} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── Axes ─────────────────────────────────────────────────────────────────────

function Axes() {
  const floor = -5;
  return (
    <>
      <Line points={[[floor, floor, floor], [5, floor, floor]]} color="#c9c9cd" lineWidth={1} />
      <Html position={[5.4, floor, floor]} style={{ fontSize: 11, color: "#8d969e", whiteSpace: "nowrap" }}>Tech →</Html>

      <Line points={[[floor, floor, floor], [floor, 5, floor]]} color="#c9c9cd" lineWidth={1} />
      <Html position={[floor, 5.4, floor]} style={{ fontSize: 11, color: "#8d969e", whiteSpace: "nowrap" }}>Exp ↑</Html>

      <Line points={[[floor, floor, floor], [floor, floor, 5]]} color="#c9c9cd" lineWidth={1} />
      <Html position={[floor, floor, 5.4]} style={{ fontSize: 11, color: "#8d969e", whiteSpace: "nowrap" }}>Soft Skill →</Html>

      {[
        [[5, floor, floor], [5, 5, floor]],
        [[floor, 5, floor], [5, 5, floor]],
        [[5, floor, floor], [5, floor, 5]],
        [[floor, floor, 5], [5, floor, 5]],
        [[floor, floor, 5], [floor, 5, 5]],
        [[floor, 5, floor], [floor, 5, 5]],
        [[5, 5, floor], [5, 5, 5]],
        [[5, floor, 5], [5, 5, 5]],
        [[floor, 5, 5], [5, 5, 5]],
      ].map((pts, i) => (
        <Line key={i} points={pts as [number, number, number][]} color="#ebebef" lineWidth={0.5} />
      ))}
    </>
  );
}

// ─── Scene content ────────────────────────────────────────────────────────────

function SceneContent({ b1, b2, hiredSet }: {
  b1: BoundaryParams; b2: BoundaryParams; hiredSet: Set<number>;
}) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 10, 6]} intensity={0.6} />
      <OrbitControls enablePan screenSpacePanning minDistance={6} maxDistance={22} />

      <Axes />
      <BoundaryPlane b1={b1} b2={b2} axis="tech"      color="#494fdf" />
      <BoundaryPlane b1={b1} b2={b2} axis="softSkill" color="#e61e49" />
      <DataPoints hiredSet={hiredSet} />
    </>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

const legendStyle: React.CSSProperties = {
  position: "absolute", bottom: 12, left: 12,
  display: "flex", gap: 16, alignItems: "center",
  background: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)",
  borderRadius: 8, padding: "6px 14px",
  fontSize: 11, color: "#8d969e", pointerEvents: "none",
};

const iconStyle: React.CSSProperties = {
  display: "inline-block", width: 12, height: 12, verticalAlign: "middle", marginRight: 4,
};

function LegendIcon({ type }: { type: "tp" | "fp" | "fn" | "tn" }) {
  const A = "#494fdf";
  const B = "#e61e49";
  const amber = "#e8a308";
  if (type === "tp") {
    return (
      <svg viewBox="0 0 14 14" style={iconStyle}>
        <path d="M 7,1 A 6,6 0 0,0 7,13 Z" fill={A} opacity="0.9" />
        <path d="M 7,1 A 6,6 0 0,1 7,13 Z" fill={B} opacity="0.9" />
      </svg>
    );
  }
  if (type === "fp") {
    return (
      <svg viewBox="0 0 14 14" style={iconStyle}>
        <rect x="2" y="2" width="10" height="10" fill={amber} opacity="0.85" />
      </svg>
    );
  }
  if (type === "fn") {
    return (
      <svg viewBox="0 0 14 14" style={iconStyle}>
        <polygon points="7,0 14,7 7,14 0,7" fill={amber} opacity="0.9" />
      </svg>
    );
  }
  // tn
  return (
    <svg viewBox="0 0 14 14" style={iconStyle}>
      <path d="M 7,3 A 4,4 0 0,0 7,11 Z" fill={A} opacity="0.2" />
      <path d="M 7,3 A 4,4 0 0,1 7,11 Z" fill={B} opacity="0.2" />
    </svg>
  );
}

export function Scene3D({ b1, b2, hiredSet }: {
  b1: BoundaryParams; b2: BoundaryParams; hiredSet: Set<number>;
}) {
  return (
    <div style={{ position: "relative", width: "100%", height: 480, borderRadius: 12, overflow: "hidden", background: "#f8f8fb" }}>
      <Canvas camera={{ position: [9, 7, 9], fov: 48 }} gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <SceneContent b1={b1} b2={b2} hiredSet={hiredSet} />
        </Suspense>
      </Canvas>
      <div style={legendStyle}>
        <span><LegendIcon type="tp" />TP</span>
        <span><LegendIcon type="fp" />FP</span>
        <span><LegendIcon type="fn" />FN</span>
        <span><LegendIcon type="tn" />TN</span>
      </div>
    </div>
  );
}
