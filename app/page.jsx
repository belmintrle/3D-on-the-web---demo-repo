"use client";

import { Box, Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";

// THE STAGE. This is what's on screen when you go live.
// Beat A starts by putting a <Canvas> in here.
// The cold open lives at /demo — open it in a second tab.

export default function Page() {
  return (
    <main className="min-h-screen grid place-items-center bg-neutral-950">
      <Canvas>
        <OrbitControls></OrbitControls>
        <Environment preset="dawn"/>
        
        <mesh>
          <meshStandardMaterial color={"red"}></meshStandardMaterial>
          <torusGeometry></torusGeometry>
        </mesh>
      </Canvas>
    </main>
  );
}
