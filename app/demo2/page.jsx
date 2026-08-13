"use client";

// BEAT B — the model, and the bytes. Backup for section 5 of the script.
//
// The fallback chain is the demo here. Turn "use real model" on with no GLB
// in public/models and watch it degrade to primitives without a flicker —
// that IS the lesson, so a missing asset is a feature of this page.

import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Product } from "../components/three/Product";
import { ProceduralSneaker } from "../components/three/ProceduralSneaker";
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
  Slider,
  Toggle,
  Warn,
} from "../components/demo/kit";

export default function Demo2() {
  return (
    <Page time="0:15 – 0:24 · Beat B" title="The model, and the bytes">
      <TheFallbackChain />
      <TheBudget />
      <ThePipeline />
    </Page>
  );
}

// ------------------------------------------------------------------ B1

// Suspends for real, so the Suspense fallback is visible for as long as you
// want it to be. This is what a slow network does to your users.
function useSlowSuspense(ms, key) {
  return useMemo(() => {
    if (!ms) return null;
    let done = false;
    const promise = new Promise((r) =>
      setTimeout(() => {
        done = true;
        r();
      }, ms)
    );
    return {
      read() {
        if (!done) throw promise;
      },
    };
  }, [ms, key]);
}

function SlowGate({ resource, children }) {
  resource?.read();
  return children;
}

function TheFallbackChain() {
  const [useModel, setUseModel] = useState(false);
  const [slow, setSlow] = useState(0);
  const [runId, setRunId] = useState(0);
  const resource = useSlowSuspense(slow, runId);

  return (
    <Section n="B1" title="The fallback is not a spinner">
      <Bar>
        <Toggle checked={useModel} onChange={setUseModel}>
          use real model (/models/sneaker.glb)
        </Toggle>
        {[0, 1500, 4000].map((ms) => (
          <Btn key={ms} active={slow === ms} onClick={() => setSlow(ms)}>
            {ms === 0 ? "instant" : `${ms / 1000}s download`}
          </Btn>
        ))}
        <Btn tone="primary" onClick={() => setRunId((i) => i + 1)}>
          Replay
        </Btn>
      </Bar>

      <Frame>
        <Canvas camera={{ position: [0.6, 0.8, 4.4], fov: 35 }} dpr={[1, 1.5]}>
          <StudioEnvironment />
          <group position={[0, -0.45, 0]}>
            <Suspense fallback={<ProceduralSneaker colorway="bone" />}>
              <SlowGate key={runId} resource={resource}>
                <Product useModel={useModel} colorway="crimson" />
              </SlowGate>
            </Suspense>
          </group>
          <OrbitControls
            makeDefault
            enableDamping
            enablePan={false}
            minDistance={2.6}
            maxDistance={7}
          />
        </Canvas>
      </Frame>

      <div className="mt-6">
        <Code highlight="<ProceduralProduct />">
          {`<ModelBoundary fallback={<ProceduralProduct />}>   // it broke  -> primitives
  <Suspense fallback={<ProceduralProduct />}>       // it's slow -> primitives
    <GltfProduct />                                 // it worked -> the real thing
  </Suspense>
</ModelBoundary>`}
        </Code>
      </div>

      <Say>
        Read that out loud — it&apos;s the whole thesis in five lines. Hit a
        download delay and watch: the bone-coloured sneaker is the Suspense
        fallback.{" "}
        <strong className="text-neutral-300">
          The user sees a product the entire time.
        </strong>{" "}
        Never an empty box, never a spinner, never a layout shift.
      </Say>

      <Warn>
        <strong>Suspense does not catch a 404.</strong> It catches “still
        loading”. A missing or corrupt GLB <em>throws</em>, and an uncaught
        throw inside <code>&lt;Canvas&gt;</code> takes the whole canvas down and
        leaves a black rectangle on your product page. You need the error
        boundary as well as the Suspense — turn on “use real model” with no file
        in <code>public/models</code> and watch it land on the primitives
        silently. The console tells you; the customer doesn&apos;t.
      </Warn>

      <Say>
        A fallback that is a <em>smaller version of the real thing</em> beats a
        fallback that is a loading state, every time. You already built this one
        in Beat A, which is why it was there when you needed it.
      </Say>
    </Section>
  );
}

// ------------------------------------------------------------------ B2

const TEXTURE_FORMATS = {
  png: { label: "PNG", wire: 1.8, vramCompressed: false },
  webp: { label: "WebP", wire: 0.14, vramCompressed: false },
  ktx2: { label: "KTX2 / Basis", wire: 0.25, vramCompressed: true },
};

const GEOMETRY_CODECS = {
  none: { label: "uncompressed", factor: 1, decoder: 0 },
  draco: { label: "DRACO", factor: 1 / 7, decoder: 200 },
  meshopt: { label: "meshopt", factor: 1 / 5, decoder: 30 },
};

function kb(bytes) {
  return bytes / 1024;
}

function fmt(bytes) {
  const k = kb(bytes);
  return k >= 1024 ? `${(k / 1024).toFixed(2)} MB` : `${Math.round(k)} KB`;
}

function TheBudget() {
  const [triangles, setTriangles] = useState(80000);
  const [textures, setTextures] = useState(4);
  const [resolution, setResolution] = useState(2048);
  const [format, setFormat] = useState("png");
  const [codec, setCodec] = useState("none");

  const f = TEXTURE_FORMATS[format];
  const c = GEOMETRY_CODECS[codec];

  // Rough, honest arithmetic. ~36 bytes per triangle of interleaved position/
  // normal/uv after indexing; texture bytes-per-pixel by format. These are
  // planning numbers — measure the real file in gltf.report.
  const geometryBytes = triangles * 36 * c.factor;
  const pixels = resolution * resolution * textures;
  const textureBytes = pixels * f.wire;
  const wire = geometryBytes + textureBytes + c.decoder * 1024;

  // VRAM is the number nobody checks. Unless the format stays compressed on
  // the GPU, every texture is expanded to RGBA8 plus ~33% for mipmaps.
  const vram = f.vramCompressed ? pixels * 0.25 * 1.33 : pixels * 4 * 1.33;

  const overBudget = wire > 2 * 1024 * 1024;

  return (
    <Section n="B2" title="Where the bytes actually are">
      <Bar>
        <Slider
          label="triangles"
          value={triangles}
          onChange={setTriangles}
          min={5000}
          max={500000}
          step={5000}
        />
        <Slider
          label="textures"
          value={textures}
          onChange={setTextures}
          min={0}
          max={12}
        />
      </Bar>
      <Bar>
        <span className="text-sm text-neutral-500">resolution</span>
        {[512, 1024, 2048, 4096].map((r) => (
          <Btn key={r} active={resolution === r} onClick={() => setResolution(r)}>
            {r}px
          </Btn>
        ))}
      </Bar>
      <Bar>
        <span className="text-sm text-neutral-500">texture format</span>
        {Object.entries(TEXTURE_FORMATS).map(([key, v]) => (
          <Btn key={key} active={format === key} onClick={() => setFormat(key)}>
            {v.label}
          </Btn>
        ))}
      </Bar>
      <Bar>
        <span className="text-sm text-neutral-500">geometry codec</span>
        {Object.entries(GEOMETRY_CODECS).map(([key, v]) => (
          <Btn key={key} active={codec === key} onClick={() => setCodec(key)}>
            {v.label}
          </Btn>
        ))}
      </Bar>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Geometry"
          value={fmt(geometryBytes)}
          note={codec === "none" ? "uncompressed" : `${c.label} + ${c.decoder}KB decoder`}
        />
        <Stat
          label="Textures"
          value={fmt(textureBytes)}
          note={`${textures} × ${resolution}² ${f.label}`}
          loud={textureBytes > geometryBytes * 2}
        />
        <Stat
          label="Total transfer"
          value={fmt(wire)}
          note="budget: 2 MB"
          bad={overBudget}
        />
      </div>

      <div className="mt-4">
        <Stat
          label="GPU memory once decoded"
          value={fmt(vram)}
          note={
            f.vramCompressed
              ? "stays compressed on the GPU — this is what KTX2 is for"
              : "expanded to RGBA8 + mipmaps, regardless of what it cost to download"
          }
          bad={!f.vramCompressed && vram > 64 * 1024 * 1024}
          wide
        />
      </div>

      <Say>
        Drag the triangle slider to half a million.{" "}
        <strong className="text-neutral-300">
          Now put the textures at four 4K PNGs.
        </strong>{" "}
        Geometry is a rounding error. It is nearly always the textures, and
        people spend a day decimating meshes and then ship four 4096-pixel PNGs.
      </Say>

      <Say>
        <strong className="text-neutral-300">
          Order of operations: resize the textures first.
        </strong>{" "}
        It&apos;s free, it needs no tooling, and it&apos;s usually the entire
        win. A 4K texture on a product that occupies 400 pixels of screen is
        nine-tenths waste. Then KTX2 if you&apos;re serious. DRACO is the famous
        one and it&apos;s usually the least of your problems.
      </Say>

      <Say>
        ⚡ <strong className="text-neutral-300">The number nobody checks:</strong>{" "}
        that GPU memory figure. A 2048² PNG might be 500KB on the wire and{" "}
        <strong className="text-neutral-300">22MB in VRAM</strong>, because the
        GPU stores it uncompressed with mipmaps. That&apos;s why phones with 3GB
        of RAM fall over on scenes that “only” downloaded 4MB. KTX2/Basis is the
        only one of these that stays compressed on the GPU — that&apos;s the
        whole reason it exists.
      </Say>

      <Say>
        And DRACO&apos;s decoder is itself ~200KB of WASM that decodes on the
        main thread by default. You can genuinely trade 2MB of download for a
        400ms main-thread block — better waterfall, worse experience. meshopt
        has a 30KB decoder and is the safer default now. Measure, don&apos;t
        cargo-cult.
      </Say>

      <p className="mt-5 text-xs text-neutral-600">
        These are order-of-magnitude planning numbers, not a substitute for
        measuring. Drop the real file into gltf.report and believe that instead.
      </p>
    </Section>
  );
}

function Stat({ label, value, note, bad, loud, wide }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        bad
          ? "border-red-500/30 bg-red-500/[0.06]"
          : loud
            ? "border-amber-500/25 bg-amber-500/[0.05]"
            : "border-neutral-900 bg-neutral-900/40"
      } ${wide ? "sm:col-span-3" : ""}`}
    >
      <p className="text-xs uppercase tracking-widest text-neutral-500">
        {label}
      </p>
      <p
        className={`mt-2 font-mono text-2xl tabular-nums ${
          bad ? "text-red-300" : loud ? "text-amber-200" : "text-neutral-100"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-neutral-500">{note}</p>
    </div>
  );
}

// ------------------------------------------------------------------ B3

function ThePipeline() {
  return (
    <Section n="B3" title="The pipeline, in four commands">
      <div className="space-y-4">
        <div>
          <Label>See where the bytes are — do this first, always</Label>
          <Code>{`# drag the .glb onto https://gltf.report — no install, compresses in-browser`}</Code>
        </div>
        <div>
          <Label>Optimise for real</Label>
          <Code highlight="--texture-compress webp">
            {`npx @gltf-transform/cli optimize in.glb sneaker.glb --texture-compress webp`}
          </Code>
        </div>
        <div>
          <Label>Turn it into an addressable component</Label>
          <Code highlight="--transform">
            {`npx gltfjsx sneaker.glb --transform`}
          </Code>
        </div>
      </div>

      <Say>
        <code>gltfjsx</code> turns a GLB into a JSX component with every mesh
        named and addressable — which is how you build a configurator, because
        now you can change the colour of one part.{" "}
        <code>--transform</code> runs the compression pipeline at the same time.
        For the capstone configurator bonus, that&apos;s the fast path.
      </Say>

      <Say>
        <strong className="text-neutral-300">Always take the .glb.</strong> Not
        OBJ, not FBX, not STL. glTF is the JPEG of 3D — it&apos;s the
        transmission format, it carries materials and animations, and it&apos;s
        the only one with a real compression story.
      </Say>

      <Say>
        Four places to get models, in the order you should try them:{" "}
        <strong className="text-neutral-300">Poly Pizza</strong> (free, low-poly,
        mostly CC0 — low-poly is a feature),{" "}
        <strong className="text-neutral-300">Khronos glTF Sample Assets</strong>{" "}
        (the reference models; DamagedHelmet lives there and is the right
        default for an assignment),{" "}
        <strong className="text-neutral-300">Quaternius and Kenney</strong>{" "}
        (CC0 packs), and{" "}
        <strong className="text-neutral-300">Sketchfab</strong> (enormous —
        filter by downloadable <em>and</em> check the licence per model, they
        are not uniform).
      </Say>
    </Section>
  );
}
