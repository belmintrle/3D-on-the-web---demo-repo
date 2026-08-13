"use client";

// BEAT D — interaction. Backup for section 7 of the script.
// The scroll trap in D2 is demonstrable with a mouse wheel, so you don't have
// to get a phone working on stream to make the point land.

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ProductViewer } from "../components/three/ProductViewer";
import {
  COLORWAYS,
  ProceduralSneaker,
} from "../components/three/ProceduralSneaker";
import { StudioEnvironment } from "../components/three/StudioEnvironment";
import {
  Bar,
  Btn,
  Code,
  Frame,
  Label,
  Page,
  Say,
  Section,
  Toggle,
  Warn,
} from "../components/demo/kit";

const CONTROLS = {
  orbit: {
    label: "OrbitControls",
    say: "Moves the CAMERA around the scene. The default choice, and the wrong one for a hero element — it will happily let the user fly the camera into orbit around your product and never come back.",
  },
  presentation: {
    label: "PresentationControls",
    say: "Rotates the MODEL, not the camera, within limits you set, and springs back to centre when released. Vertical drags fall through to the page. For a hero this is almost always right and almost nobody uses it.",
  },
  none: {
    label: "none",
    say: "Sometimes correct. A slowly rotating product that nobody can grab is a perfectly good hero, and it's the cheapest option on the page.",
  },
};

export default function Demo4() {
  return (
    <Page time="0:32 – 0:40 · Beat D" title="Interaction, and not stealing the scroll">
      <WhichControl />
      <ScrollTrap />
      <ZoomBug />
      <PointerEvents />
    </Page>
  );
}

// ------------------------------------------------------------------ D1

function WhichControl() {
  const [controls, setControls] = useState("orbit");
  const [constrained, setConstrained] = useState(true);

  return (
    <Section n="D1" title="Move the camera, or move the model?">
      <Bar>
        {Object.entries(CONTROLS).map(([key, v]) => (
          <Btn
            key={key}
            active={controls === key}
            onClick={() => setControls(key)}
          >
            {v.label}
          </Btn>
        ))}
        <Toggle checked={constrained} onChange={setConstrained}>
          constrained
        </Toggle>
      </Bar>

      <Frame>
        <ProductViewer
          key={`${controls}-${constrained}`}
          controls={controls}
          constrained={constrained}
          environment="declarative"
          shadows="contact"
          demand={false}
          spin={controls === "none"}
        />
      </Frame>

      <div className="mt-6">
        <Code highlight={constrained ? "enableZoom={false}" : undefined}>
          {controls === "presentation"
            ? `<PresentationControls
  global={false}          // only drags that START on the model rotate it
  snap                    // springs back to centre on release
  polar={[-0.15, 0.35]}   // how far up/down they can go
  azimuth={[-0.7, 0.7]}   // how far left/right
>
  <Product />
</PresentationControls>`
            : controls === "orbit"
              ? `<OrbitControls
  makeDefault             // tells Stage/Bounds who owns the camera
  enableDamping           // inertia — without it the model stops dead
  dampingFactor={0.08}
  enableZoom={${!constrained}}
  enablePan={${!constrained}}
  minDistance={2.6}  maxDistance={7}
  minPolarAngle={${constrained ? "Math.PI / 3.4" : "0"}}
  maxPolarAngle={${constrained ? "Math.PI / 1.95" : "Math.PI"}}
/>`
              : `// no controls. autoRotate on a timer, or nothing at all.`}
        </Code>
      </div>

      <Say>{CONTROLS[controls].say}</Say>

      <Say>
        <code>makeDefault</code> tells drei&apos;s other components that this is
        the camera controller, so <code>&lt;Stage&gt;</code> and{" "}
        <code>&lt;Bounds&gt;</code> stop fighting you.{" "}
        <code>enableDamping</code> is inertia — without it the model stops dead
        when you release, which feels like dragging a spreadsheet. Same argument
        as easing in the motion session: nothing in the physical world stops
        instantly.
      </Say>
    </Section>
  );
}

// ------------------------------------------------------------------ D2

function ScrollTrap() {
  const [zoom, setZoom] = useState(true);

  return (
    <Section n="D2" title="The scroll trap — the bit everyone skips">
      <Bar>
        <Toggle checked={zoom} onChange={setZoom}>
          enableZoom / enablePan
        </Toggle>
        <span className="text-xs text-neutral-600">
          scroll inside the box below, with the pointer over the shoe
        </span>
      </Bar>

      <div className="mx-auto h-[420px] w-full max-w-sm overflow-y-auto rounded-[28px] border-4 border-neutral-800 bg-neutral-950 p-4">
        <p className="pb-4 text-sm text-neutral-400">
          Scroll down. The viewer is below this paragraph, exactly where it
          would be on a real product page.
        </p>

        <div className="aspect-square overflow-hidden rounded-xl border border-neutral-900">
          <ProductViewer
            key={String(zoom)}
            controls="orbit"
            constrained={!zoom}
            environment="declarative"
            shadows="contact"
            demand={false}
          />
        </div>

        <p className="pt-4 text-sm text-neutral-400">
          …and here is the rest of the product page: description, size picker,
          reviews, the add-to-bag button. All of it below the fold, all of it
          unreachable if the canvas ate the scroll.
        </p>
        <p className="pt-4 text-sm text-neutral-600">
          If you got here without a fight, the guardrails are on.
        </p>
      </div>

      {zoom ? (
        <Warn>
          <strong>That&apos;s the trap.</strong> With zoom enabled, the wheel
          over the canvas zooms the camera and the page does not move. On a
          phone it&apos;s worse — a full-width canvas with orbit controls is a
          wall the user physically cannot scroll past, and they will leave. Turn
          the toggle off and scroll again.
        </Warn>
      ) : (
        <Say>
          Zoom and pan off: the wheel goes to the page, the drag goes to the
          model. The user can still rotate the product and still reach the
          add-to-bag button. That is the whole fix, and it is two props.
        </Say>
      )}

      <div className="mt-6 space-y-4">
        <div>
          <Label>Fix 1 — constrain what the control is allowed to do (best)</Label>
          <Code highlight="enableZoom={false}">
            {`<OrbitControls makeDefault enableDamping
  enableZoom={false}    // stop stealing pinch and wheel
  enablePan={false}     // stop stealing two-finger drag
  minPolarAngle={Math.PI / 3.4}
  maxPolarAngle={Math.PI / 1.95}
/>`}
          </Code>
        </div>
        <div>
          <Label>Fix 2 — for a hero, don&apos;t use a camera control at all</Label>
          <Code highlight="global={false}">
            {`<PresentationControls global={false} snap polar={[-0.15, 0.35]}>
  <Product />
</PresentationControls>`}
          </Code>
        </div>
        <div>
          <Label>Fix 3 — the blunt one, and it costs you something</Label>
          <Code highlight="touch-action: pan-y">
            {`canvas { touch-action: pan-y; }   /* vertical drags belong to the page */`}
          </Code>
        </div>
      </div>

      <Say>
        Fix 3 works, but you&apos;ve now made vertical rotation impossible on
        touch.{" "}
        <strong className="text-neutral-300">That&apos;s a trade, not a fix</strong>{" "}
        — make it deliberately. It&apos;s in this project&apos;s{" "}
        <code>globals.css</code>, with a comment saying exactly that.
      </Say>
    </Section>
  );
}

// ------------------------------------------------------------------ D3

function ZoomBug() {
  return (
    <Section n="D3" title="minDistance — one line, funniest bug report">
      <Frame className="!aspect-[16/7]">
        <ProductViewer
          controls="orbit"
          constrained={false}
          environment="declarative"
          shadows="contact"
          demand={false}
        />
      </Frame>

      <Say>
        Zoom all the way in with the wheel.{" "}
        <strong className="text-neutral-300">
          Without <code>minDistance</code> the camera goes inside the mesh
        </strong>
        , and because materials are single-sided by default you see straight
        through the back faces and the product appears to have exploded. It
        looks like catastrophic corruption. It is one missing prop.
      </Say>

      <Code highlight="minDistance={2.6} maxDistance={7}">
        {`<OrbitControls makeDefault minDistance={2.6} maxDistance={7} />`}
      </Code>

      <Say>
        Set both, always. <code>maxDistance</code> stops them flying away until
        the product is four pixels wide and concluding your site is broken.
      </Say>
    </Section>
  );
}

// ------------------------------------------------------------------ D4

function PointerEvents() {
  const keys = Object.keys(COLORWAYS);
  const [i, setI] = useState(0);
  const [hovered, setHovered] = useState(false);

  return (
    <Section n="D4" title="Pointer events you get for free">
      <Frame className="!aspect-[16/7]">
        <Canvas camera={{ position: [0.6, 0.8, 4.4], fov: 35 }} dpr={[1, 1.5]}>
          <StudioEnvironment />
          <group
            position={[0, -0.45, 0]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(true);
            }}
            onPointerOut={() => setHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              setI((v) => (v + 1) % keys.length);
            }}
          >
            <ProceduralSneaker
              colorway={keys[i]}
              scale={hovered ? 1.04 : 1}
              spin
            />
          </group>
          <OrbitControls
            makeDefault
            enableDamping
            enableZoom={false}
            enablePan={false}
          />
        </Canvas>
        <span className="absolute bottom-3 left-3 rounded-md bg-neutral-950/75 px-2 py-1 font-mono text-[11px] text-neutral-400 backdrop-blur">
          {hovered ? "hovered — click to change colourway" : keys[i]}
        </span>
      </Frame>

      <div className="mt-6">
        <Code highlight="e.stopPropagation()">
          {`<mesh
  onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
  onPointerOut={() => setHovered(false)}
  onClick={(e) => { e.stopPropagation(); setActive(!active); }}
/>`}
        </Code>
      </div>

      <Say>
        Full raycasting against the actual triangle you&apos;re pointing at, for
        free, with DOM-shaped event names.{" "}
        <strong className="text-neutral-300">
          <code>stopPropagation</code> matters
        </strong>{" "}
        — a ray passes through everything behind the thing you clicked, so
        without it your handler fires once per mesh along the ray. On this
        sneaker that&apos;s four times.
      </Say>

      <Say>
        ⚡ Raycasting every mesh on every pointer move is not free on a heavy
        model. drei&apos;s <code>&lt;Bvh&gt;</code> builds a spatial index and
        makes it roughly free; <code>meshBounds</code> is the cheap version that
        only tests bounding spheres. Reach for them when the model is big, not
        before.
      </Say>
    </Section>
  );
}
