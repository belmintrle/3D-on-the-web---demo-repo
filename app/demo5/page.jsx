"use client";

// BEAT E — shipping it. Backup for section 8 of the script.
//
// THIS IS THE CENTREPIECE. Everything before it is available on YouTube.
// This is the part that's actually being graded in FE-10.

import { useState } from "react";
import { ProductViewer } from "../components/three/ProductViewer";
import { LazyProductViewer } from "../components/three/LazyProductViewer";
import { PerfReadout } from "../components/three/PerfHUD";
import { useDeviceTier } from "../lib/useDeviceTier";
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

export default function Demo5() {
  return (
    <Page time="0:40 – 0:50 · Beat E" title="Shipping it">
      <Guardrails />
      <TheGate />
      <Checklist />
      <Finished />
    </Page>
  );
}

// ------------------------------------------------------------------ E1

function Guardrails() {
  const [dprCap, setDprCap] = useState(1.5);
  const [antialias, setAntialias] = useState(false);
  const [demand, setDemand] = useState(true);
  const [preload, setPreload] = useState(true);
  const [adaptiveDpr, setAdaptiveDpr] = useState(false);
  const [spin, setSpin] = useState(false);
  const [sample, setSample] = useState(null);

  // antialias and dpr are baked into the WebGL context, so changing them means
  // a new context. Keying the canvas is the honest way to do that.
  const canvasKey = `${dprCap}-${antialias}-${demand}-${preload}-${adaptiveDpr}`;

  return (
    <Section n="E1" title="The four numbers that decide whether this ships">
      <Bar>
        <Slider
          label="dpr cap"
          value={dprCap}
          onChange={setDprCap}
          min={0.5}
          max={3}
          step={0.25}
          suffix="×"
        />
        <Toggle checked={antialias} onChange={setAntialias}>
          antialias
        </Toggle>
        <Toggle checked={demand} onChange={setDemand}>
          frameloop=&quot;demand&quot;
        </Toggle>
        <Toggle checked={preload} onChange={setPreload}>
          &lt;Preload all /&gt;
        </Toggle>
        <Toggle checked={adaptiveDpr} onChange={setAdaptiveDpr}>
          &lt;AdaptiveDpr /&gt;
        </Toggle>
        <Toggle checked={spin} onChange={setSpin}>
          auto-rotate
        </Toggle>
      </Bar>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Frame>
          <ProductViewer
            key={canvasKey}
            dprCap={dprCap}
            antialias={antialias}
            demand={demand}
            preload={preload}
            adaptiveDpr={adaptiveDpr}
            spin={spin}
            environment="declarative"
            shadows="contact"
            onSample={setSample}
          />
        </Frame>

        <div className="rounded-xl border border-neutral-900 bg-neutral-900/40 p-5">
          <Label>Live, from gl.info</Label>
          <PerfReadout sample={sample} className="mt-4" />
          <p className="mt-5 text-xs leading-relaxed text-neutral-500">
            No dependency. <code>gl.info</code> is built into three.js and costs
            nothing to read. Twenty lines in{" "}
            <code>components/three/PerfHUD.jsx</code>.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-neutral-500">
            With <code>frameloop=&quot;demand&quot;</code> on and nothing moving,
            FPS reads low — that is <em>correct</em>. It means the renderer is
            asleep, not that it&apos;s slow. Drag the model to wake it.
          </p>
        </div>
      </div>

      <Say>
        <strong className="text-neutral-300">dpr is the big one.</strong> Push
        the slider to 3 — that&apos;s what a phone reports by default. Rendering
        WebGL at 3× is <strong className="text-neutral-300">nine times</strong>{" "}
        the pixels of 1×. Nine. You will not see the difference on a product
        viewer and you will absolutely feel it. One line:{" "}
        <code>dpr={"{[1, 1.5]}"}</code>.
      </Say>

      <Say>
        <strong className="text-neutral-300">frameloop=&quot;demand&quot;</strong>{" "}
        — by default R3F renders continuously, forever, burning battery on a
        product that isn&apos;t moving. On demand, it renders when something
        asks. Note what the code does when you turn on auto-rotate: it flips
        back to <code>&quot;always&quot;</code>, because something genuinely
        <em>is</em> always moving and pretending otherwise would just mean the
        animation silently doesn&apos;t run.
      </Say>

      <Say>
        <strong className="text-neutral-300">&lt;Preload all /&gt;</strong> is
        the subtle one. Shaders compile lazily, on first render — so your scene
        loads, looks fine, then hitches for ~300ms the first time an object
        comes into view. Preload moves that compile into the Suspense window,
        where you already have a fallback on screen.
      </Say>

      <Say>
        ⚡ <strong className="text-neutral-300">Draw calls is the number to
        watch.</strong> Every material is a separate draw call — a model with 40
        materials costs 40 calls whether it&apos;s 200 triangles or 200,000.
        That&apos;s why merging materials in Blender is often a bigger win than
        decimating the mesh. Beginners: just keep that number small.
      </Say>
    </Section>
  );
}

// ------------------------------------------------------------------ E2

function TheGate() {
  const [force, setForce] = useState(null);
  const device = useDeviceTier();

  return (
    <Section n="E2" title="Three gates, and the order matters">
      <Bar>
        <Btn active={force === null} onClick={() => setForce(null)}>
          real decision
        </Btn>
        <Btn active={force === true} onClick={() => setForce(true)}>
          force 3D
        </Btn>
        <Btn active={force === false} onClick={() => setForce(false)}>
          force static
        </Btn>
      </Bar>

      <div className="mb-6 rounded-xl border border-neutral-900 bg-neutral-900/40 p-5">
        <Label>What this browser looks like to us</Label>
        {device ? (
          <div className="mt-3 grid gap-x-8 gap-y-1.5 font-mono text-sm sm:grid-cols-2">
            <Row k="tier" v={`${device.tier} / 3`} />
            <Row k="pointer" v={device.isTouch ? "coarse (touch)" : "fine"} />
            <Row k="cores" v={device.cores ?? "not reported"} />
            <Row k="memory" v={device.memory ? `${device.memory} GB` : "not reported"} />
            <Row k="network" v={device.effectiveType ?? "not reported"} />
            <Row k="save-data" v={device.saveData ? "ON" : "off"} />
          </div>
        ) : (
          <p className="mt-3 font-mono text-sm text-neutral-600">measuring…</p>
        )}
        {device?.reasons.length > 0 && (
          <p className="mt-4 text-xs text-neutral-500">
            downgraded because: {device.reasons.join(", ")}
          </p>
        )}
      </div>

      <p className="mb-4 text-sm text-neutral-500">
        ↓ the viewer is deliberately below the fold — scroll to it and watch the
        badge change
      </p>
      <div className="h-64 rounded-xl border border-dashed border-neutral-900 bg-neutral-900/20" />

      <div className="mt-8">
        <LazyProductViewer
          force={force}
          debug
          environment="declarative"
          shadows="contact"
          controls="presentation"
          className="aspect-[16/9]"
        />
      </div>

      <div className="mt-6">
        <Code highlight="ssr: false">
          {`const ProductViewer = dynamic(() => import("./ProductViewer"), {
  ssr: false,                          // no WebGL on the server; three touches window
  loading: () => <ProductStill />,     // the static product, same aspect ratio
});

const [ref, inView] = useInView({ rootMargin: "200px" });
const device = useDeviceTier();        // runs BEFORE anything 3D is imported

<div ref={ref} className="aspect-[16/9]">        {/* reserve the space: no CLS */}
  {device.tier >= 2 && inView ? <ProductViewer /> : <ProductStill />}
</div>`}
        </Code>
      </div>

      <Warn>
        <strong>The trap that catches everyone.</strong> Every tutorial gates on
        drei&apos;s <code>useDetectGPU</code>:
        <br />
        <code className="mt-2 inline-block">
          import {"{ useDetectGPU }"} from &quot;@react-three/drei&quot;
        </code>
        <br />
        …in the page. But to call that hook you imported drei — so drei, three
        and R3F are already in the bundle you just shipped to the phone you were
        trying to protect.{" "}
        <strong>
          The gate has to run before anything 3D is imported, which means it
          cannot come from a 3D library.
        </strong>{" "}
        Hence <code>lib/useDeviceTier.js</code>: zero dependencies, a handful of
        browser signals. Once you&apos;ve decided you <em>are</em> loading the
        scene, <code>useDetectGPU</code> is the right tool to pick quality
        settings inside it. Two different jobs.
      </Warn>

      <Say>
        <strong className="text-neutral-300">
          Be honest about what the gate is: it&apos;s a decision, not a failure.
        </strong>{" "}
        You are deciding that some users get a photograph. That is correct. A
        fast static image is a better experience than a slow 3D one, and serving
        it is not a defeat.
      </Say>

      <Say>
        And note the wrapper has a fixed aspect ratio.{" "}
        <strong className="text-neutral-300">Reserve the space.</strong> A canvas
        that appears later without a reserved box is a layout shift, and CLS is
        in the audit.
      </Say>
    </Section>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-neutral-500">{k}</span>
      <span className="text-neutral-200">{String(v)}</span>
    </div>
  );
}

// ------------------------------------------------------------------ E3

const CHECKLIST = [
  ["Before you add 3D at all", [
    "Could a video or image sequence do this for a tenth of the cost?",
    "Is it below the fold? (If not, reconsider.)",
    "Budgeted ~600–700KB gzipped for three + R3F + drei, before any model?",
  ]],
  ["The asset", [
    ".glb, not OBJ/FBX",
    "Run through gltf.report — you know where your bytes are",
    "Textures resized to what's actually on screen (do this first, it's free)",
    "Geometry compressed — meshopt preferred, DRACO acceptable",
    "Transfer size under 2MB",
  ]],
  ["The loading", [
    "next/dynamic with ssr: false",
    "Not requested until in view (IntersectionObserver + rootMargin)",
    "Space reserved with a fixed aspect ratio — no CLS",
    "Suspense fallback is the product, not a spinner",
    "Error boundary → static fallback, never a blank canvas",
  ]],
  ["The runtime", [
    "dpr={[1, 1.5]} capped",
    'frameloop="demand" unless something is genuinely always moving',
    "antialias: false unless you can prove you need it",
    "Draw calls < 50, triangles < 150k",
    "<Preload all /> so shaders compile behind the fallback",
  ]],
  ["The degradation", [
    "Device gate that runs before three.js is imported",
    "prefers-reduced-motion — no auto-rotation",
    "navigator.connection.saveData respected",
    "Tested on a real phone, not the device toolbar",
  ]],
  ["The proof — this is the FE-10 hook", [
    "Mobile Lighthouse before and after, both recorded",
    "LCP unchanged — 3D must not be the LCP element",
    "Cost documented in the README",
  ]],
];

function Checklist() {
  const [done, setDone] = useState({});
  const total = CHECKLIST.reduce((n, [, items]) => n + items.length, 0);
  const count = Object.values(done).filter(Boolean).length;

  return (
    <Section n="E3" title="The 3D perf budget — the deliverable">
      <p className="mb-6 text-sm text-neutral-500">
        {count} / {total} — this is the one-pager that plugs into the FE-10
        audit. Post it in the channel.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {CHECKLIST.map(([group, items]) => (
          <div
            key={group}
            className="rounded-xl border border-neutral-900 bg-neutral-900/40 p-5"
          >
            <p className="mb-3 text-xs uppercase tracking-widest text-neutral-500">
              {group}
            </p>
            <ul className="space-y-2">
              {items.map((item) => {
                const id = `${group}:${item}`;
                return (
                  <li key={id}>
                    <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-neutral-300">
                      <input
                        type="checkbox"
                        checked={Boolean(done[id])}
                        onChange={(e) =>
                          setDone((d) => ({ ...d, [id]: e.target.checked }))
                        }
                        className="mt-1 accent-emerald-400"
                      />
                      <span className={done[id] ? "text-neutral-600 line-through" : ""}>
                        {item}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ------------------------------------------------------------------ E4

function Finished() {
  return (
    <Section n="✓" title="The finished component">
      <Frame className="!aspect-[16/9]">
        <ProductViewer />
      </Frame>

      <div className="mt-6">
        <Code>{`<ProductViewer />   // every default above is already the production setting`}</Code>
      </div>

      <Say>
        Lazy, compressed, capped, measured, and it degrades to a photograph on
        hardware that can&apos;t take it. Four techniques. None of them hard,
        all of them skipped by default.
      </Say>

      <Say>
        3D is the easiest way to make a page memorable and the easiest way to
        make it unusable. The whole skill is knowing which one you just shipped.
        Go measure it.
      </Say>
    </Section>
  );
}
