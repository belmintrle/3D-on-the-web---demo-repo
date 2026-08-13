"use client";

// BEAT A — the scene graph. Backup for section 4 of the script.
// Every "delete the lights and watch it break" moment is a toggle here.

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ProceduralSneaker } from "../components/three/ProceduralSneaker";
import { StudioEnvironment } from "../components/three/StudioEnvironment";
import { PerfProbe, PerfReadout } from "../components/three/PerfHUD";
import {
  Bar,
  Btn,
  Code,
  Frame,
  Label,
  Page,
  Say,
  Section,
  Slider,
  Toggle,
  Warn,
} from "../components/demo/kit";

const GEOMETRIES = {
  box: { label: "boxGeometry", args: "[1, 1, 1]" },
  sphere: { label: "sphereGeometry", args: "[0.7, 32, 16]" },
  torusKnot: { label: "torusKnotGeometry", args: "[0.5, 0.16, 128, 24]" },
};

const MATERIALS = {
  standard: {
    label: "meshStandardMaterial",
    say: "Physically based. Responds to light, has roughness and metalness. This is what you ship.",
  },
  basic: {
    label: "meshBasicMaterial",
    say: "Ignores light completely. Useless for a product — invaluable for answering “is my geometry even there?”",
  },
  normal: {
    label: "meshNormalMaterial",
    say: "Colours every face by which way it points. The fastest way to see whether your normals are inverted.",
  },
};

export default function Demo1() {
  return (
    <Page time="0:07 – 0:15 · Beat A" title="The scene graph">
      <TheBox />
      <TheLoop />
      <TheProduct />
    </Page>
  );
}

// ------------------------------------------------------------------ A1

function TheBox() {
  const [geometry, setGeometry] = useState("box");
  const [material, setMaterial] = useState("standard");
  const [lights, setLights] = useState(true);
  const [wireframe, setWireframe] = useState(false);

  const g = GEOMETRIES[geometry];
  const m = MATERIALS[material];

  const lightLines = lights
    ? '  <ambientLight intensity={0.4} />\n  <directionalLight position={[5, 5, 5]} intensity={2.4} />'
    : "  // lights deleted";

  return (
    <Section n="A1" title="A mesh is exactly two things">
      <Bar>
        {Object.entries(GEOMETRIES).map(([key, v]) => (
          <Btn
            key={key}
            active={geometry === key}
            onClick={() => setGeometry(key)}
          >
            {v.label}
          </Btn>
        ))}
      </Bar>
      <Bar>
        {Object.entries(MATERIALS).map(([key, v]) => (
          <Btn
            key={key}
            active={material === key}
            onClick={() => setMaterial(key)}
          >
            {v.label}
          </Btn>
        ))}
        <Toggle checked={lights} onChange={setLights}>
          lights
        </Toggle>
        <Toggle checked={wireframe} onChange={setWireframe}>
          wireframe
        </Toggle>
      </Bar>

      <Frame>
        <Canvas camera={{ position: [2.4, 1.6, 2.8], fov: 45 }} dpr={[1, 1.5]}>
          {lights && (
            <>
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 5, 5]} intensity={2.4} />
            </>
          )}
          <SpinningMesh
            geometry={geometry}
            material={material}
            wireframe={wireframe}
          />
          <OrbitControls makeDefault enableDamping enablePan={false} />
        </Canvas>
      </Frame>

      <div className="mt-6">
        <Code highlight={lights ? undefined : "// lights deleted"}>
          {`<Canvas camera={{ position: [2.4, 1.6, 2.8], fov: 45 }}>
${lightLines}
  <mesh>
    <${g.label} args={${g.args}} />
    <${m.label}${wireframe ? " wireframe" : ""} color="#e11d48" />
  </mesh>
</Canvas>`}
        </Code>
      </div>

      <Say>
        <strong className="text-neutral-300">
          A mesh is a geometry and a material. That&apos;s it.
        </strong>{" "}
        The shape, and how the surface responds to light. Every object you have
        ever seen in a 3D scene is that pair. <code>args</code> is the
        constructor arguments, positionally — an R3F convention that trips
        everyone exactly once.
      </Say>

      <Say>{m.say}</Say>

      {!lights && (
        <Warn>
          <strong>This is the #1 “my scene is broken” question</strong>, and the
          answer is always the same:{" "}
          <code>meshStandardMaterial</code> is physically based and there is no
          light. It isn&apos;t broken, it&apos;s midnight. Switch the material
          to <code>meshBasicMaterial</code> with the lights still off — the
          geometry was there the whole time.
        </Warn>
      )}
    </Section>
  );
}

function SpinningMesh({ geometry, material, wireframe }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4;
  });

  return (
    <mesh ref={ref}>
      {geometry === "box" && <boxGeometry args={[1, 1, 1]} />}
      {geometry === "sphere" && <sphereGeometry args={[0.7, 32, 16]} />}
      {geometry === "torusKnot" && (
        <torusKnotGeometry args={[0.5, 0.16, 128, 24]} />
      )}

      {material === "standard" && (
        <meshStandardMaterial
          color="#e11d48"
          roughness={0.35}
          wireframe={wireframe}
        />
      )}
      {material === "basic" && (
        <meshBasicMaterial color="#e11d48" wireframe={wireframe} />
      )}
      {material === "normal" && <meshNormalMaterial wireframe={wireframe} />}
    </mesh>
  );
}

// ------------------------------------------------------------------ A2

function TheLoop() {
  const [hz, setHz] = useState(60);

  return (
    <Section n="A2" title="useFrame — and the delta bug you'll ship once">
      <Bar>
        <Slider
          label="display"
          value={hz}
          onChange={setHz}
          min={30}
          max={144}
          step={6}
          suffix="Hz"
        />
        <Btn onClick={() => setHz(60)}>Back to 60Hz</Btn>
      </Bar>

      <Frame className="!aspect-[16/6]">
        <Canvas camera={{ position: [0, 0, 5], fov: 40 }} dpr={[1, 1.5]}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 4, 4]} intensity={2.2} />
          <RateCube position={[-1.3, 0, 0]} hz={hz} useDelta={false} />
          <RateCube position={[1.3, 0, 0]} hz={hz} useDelta />
        </Canvas>
        <span className="absolute bottom-3 left-3 font-mono text-[11px] text-red-300">
          ❌ rotation.y += 0.02
        </span>
        <span className="absolute bottom-3 right-3 font-mono text-[11px] text-emerald-300">
          ✅ rotation.y += delta * 1.2
        </span>
      </Frame>

      <div className="mt-6">
        <Code highlight="delta">
          {`useFrame((state, delta) => {
  ref.current.rotation.y += delta * 1.2;   // seconds, not frames
});`}
        </Code>
      </div>

      <Say>
        Drag the slider. The left cube speeds up as the display gets faster,
        because it moves a fixed amount <em>per frame</em>. The right one
        doesn&apos;t, because <code>delta</code> is the seconds since the last
        frame.{" "}
        <strong className="text-neutral-300">
          Forget it and you ship a bug that only exists on nice hardware
        </strong>{" "}
        — which is to say, on the reviewer&apos;s machine and not yours.
      </Say>

      <Say>
        ⚡ <strong className="text-neutral-300">The R3F mental model:</strong>{" "}
        <code>useFrame</code> runs 60 times a second and does{" "}
        <strong className="text-neutral-300">not</strong> re-render the
        component. There is no <code>setState</code> in there and there must
        never be one — you mutate the three.js object through a ref. R3F is a
        React <em>renderer</em>: the JSX describes a scene graph, React
        reconciles it, and the render loop lives entirely outside React. This is
        the opposite of the rule in almost every other React context, and
        it&apos;s the thing people get wrong first.
      </Say>
    </Section>
  );
}

// Simulates a faster display by stepping the frame-rate-dependent cube as many
// times as that display would have. Same bug, visible on the hardware you have.
function RateCube({ hz, useDelta, ...props }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (!ref.current) return;
    if (useDelta) {
      ref.current.rotation.y += delta * 1.2;
    } else {
      const framesAtThatRate = delta * hz;
      ref.current.rotation.y += 0.02 * framesAtThatRate;
    }
  });

  return (
    <mesh ref={ref} {...props}>
      <boxGeometry args={[1.2, 1.2, 1.2]} />
      <meshStandardMaterial
        color={useDelta ? "#34d399" : "#f87171"}
        roughness={0.3}
      />
    </mesh>
  );
}

// ------------------------------------------------------------------ A3

function TheProduct() {
  const [sample, setSample] = useState(null);
  const [spin, setSpin] = useState(true);
  const [colorway, setColorway] = useState("crimson");

  return (
    <Section n="A3" title="Eleven meshes make a sneaker">
      <Bar>
        <Toggle checked={spin} onChange={setSpin}>
          spin
        </Toggle>
        {["crimson", "bone", "midnight", "moss"].map((c) => (
          <Btn key={c} active={colorway === c} onClick={() => setColorway(c)}>
            {c}
          </Btn>
        ))}
      </Bar>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Frame>
          <Canvas
            camera={{ position: [0.6, 0.8, 4.4], fov: 35 }}
            dpr={[1, 1.5]}
            frameloop="always"
          >
            <StudioEnvironment />
            <group position={[0, -0.45, 0]}>
              <ProceduralSneaker colorway={colorway} spin={spin} />
            </group>
            <OrbitControls
              makeDefault
              enableDamping
              enablePan={false}
              minDistance={2.6}
              maxDistance={7}
            />
            <PerfProbe onSample={setSample} />
          </Canvas>
        </Frame>

        <div className="rounded-xl border border-neutral-900 bg-neutral-900/40 p-5">
          <Label>What it costs</Label>
          <PerfReadout sample={sample} className="mt-4" />
          <p className="mt-5 text-xs leading-relaxed text-neutral-500">
            Boxes, spheres, a torus and four cylinders. Four materials, so
            roughly ten draw calls. No textures at all — which is why the
            texture count is zero and why this thing weighs nothing.
          </p>
        </div>
      </div>

      <Say>
        I&apos;m building the sneaker out of primitives for two reasons. One:
        you learn what a mesh is by making eleven of them.{" "}
        <strong className="text-neutral-300">
          Two — and this is the real reason — this is our fallback.
        </strong>{" "}
        When we load the real model in ten minutes, this stays in the codebase.
        It&apos;s what renders while the GLB downloads, what renders if it 404s,
        and what renders on hardware we&apos;ve decided shouldn&apos;t get the
        full thing.
      </Say>

      <Say>
        <strong className="text-neutral-300">
          Build your fallback before the thing it falls back from.
        </strong>{" "}
        If you do it in that order it always exists. If you do it the other way
        round it never gets written.
      </Say>
    </Section>
  );
}
