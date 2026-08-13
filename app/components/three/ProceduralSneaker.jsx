"use client";

// THE PRODUCT, BUILT FROM PRIMITIVES.
//
// Two jobs, and the second one is the important one:
//
//   1. Beat A teaching aid. You learn what a mesh is by making twelve of them.
//      Every part below is the same two things: a geometry and a material.
//
//   2. THE FALLBACK. This is what renders while the real GLB is downloading,
//      what renders if it 404s, and what renders on a device we've decided
//      shouldn't get the full model. Your fallback should exist before the
//      thing it falls back from.
//
// Zero bytes over the network. Ten meshes, four materials — so roughly ten
// draw calls, which is inside the budget with room to spare. Watch the HUD.

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export const COLORWAYS = {
  crimson: { upper: "#e11d48", accent: "#fda4af", sole: "#f5f5f5" },
  bone: { upper: "#e7e5e4", accent: "#a8a29e", sole: "#fafaf9" },
  midnight: { upper: "#1e293b", accent: "#38bdf8", sole: "#e2e8f0" },
  moss: { upper: "#3f6212", accent: "#bef264", sole: "#f7fee7" },
};

export function ProceduralSneaker({
  colorway = "crimson",
  spin = false,
  ...props
}) {
  const group = useRef();
  const c = COLORWAYS[colorway] ?? COLORWAYS.crimson;

  // useFrame runs 60x/second and does NOT re-render this component. We mutate
  // the three.js object through the ref. Multiply by delta or the model spins
  // at a different speed on a 120Hz display than a 60Hz one.
  useFrame((_, delta) => {
    if (spin && group.current) group.current.rotation.y += delta * 0.35;
  });

  return (
    <group ref={group} {...props}>
      {/* Outsole — the rubber that touches the ground */}
      <RoundedBox
        args={[2.2, 0.14, 0.86]}
        radius={0.07}
        smoothness={3}
        position={[0, 0.07, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#171717" roughness={0.85} metalness={0} />
      </RoundedBox>

      {/* Midsole — the thick foam wedge, taller at the heel */}
      <RoundedBox
        args={[2.14, 0.26, 0.83]}
        radius={0.12}
        smoothness={3}
        position={[0, 0.26, 0]}
        castShadow
      >
        <meshStandardMaterial color={c.sole} roughness={0.55} metalness={0} />
      </RoundedBox>
      <RoundedBox
        args={[0.75, 0.34, 0.8]}
        radius={0.15}
        smoothness={3}
        position={[-0.68, 0.34, 0]}
        castShadow
      >
        <meshStandardMaterial color={c.sole} roughness={0.55} metalness={0} />
      </RoundedBox>

      {/* Upper — the main body */}
      <RoundedBox
        args={[1.62, 0.52, 0.78]}
        radius={0.24}
        smoothness={4}
        position={[-0.12, 0.62, 0]}
        castShadow
      >
        <meshStandardMaterial color={c.upper} roughness={0.42} metalness={0.05} />
      </RoundedBox>

      {/* Toe box — a squashed sphere is the cheapest convincing curve there is */}
      <mesh position={[0.74, 0.5, 0]} scale={[0.46, 0.3, 0.39]} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={c.upper} roughness={0.42} metalness={0.05} />
      </mesh>

      {/* Heel counter */}
      <RoundedBox
        args={[0.46, 0.62, 0.76]}
        radius={0.21}
        smoothness={4}
        position={[-0.84, 0.7, 0]}
        castShadow
      >
        <meshStandardMaterial color={c.upper} roughness={0.42} metalness={0.05} />
      </RoundedBox>

      {/* Ankle collar — a torus reads as an opening for almost no triangles */}
      <mesh
        position={[-0.5, 0.94, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1, 0.62, 1]}
        castShadow
      >
        <torusGeometry args={[0.3, 0.07, 10, 28]} />
        <meshStandardMaterial color={c.accent} roughness={0.5} />
      </mesh>

      {/* Tongue */}
      <RoundedBox
        args={[0.52, 0.1, 0.5]}
        radius={0.045}
        smoothness={3}
        position={[-0.16, 0.92, 0]}
        rotation={[0, 0, -0.08]}
        castShadow
      >
        <meshStandardMaterial color={c.accent} roughness={0.6} />
      </RoundedBox>

      {/* Laces — four cylinders lying across the width */}
      {[0.22, 0.02, -0.18, -0.38].map((x, i) => (
        <mesh
          key={i}
          position={[x, 0.86 + i * 0.012, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.028, 0.028, 0.6, 8]} />
          <meshStandardMaterial color="#fafafa" roughness={0.75} />
        </mesh>
      ))}

      {/* Side stripe — one thin box per side, the cheapest branding there is */}
      {[0.4, -0.4].map((z) => (
        <RoundedBox
          key={z}
          args={[1.05, 0.15, 0.03]}
          radius={0.014}
          smoothness={2}
          position={[-0.1, 0.56, z]}
          rotation={[0, 0, -0.12]}
        >
          <meshStandardMaterial
            color={c.accent}
            roughness={0.3}
            metalness={0.15}
          />
        </RoundedBox>
      ))}
    </group>
  );
}
