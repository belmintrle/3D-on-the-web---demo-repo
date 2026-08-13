# Shipping 3D — A Product Viewer You're Allowed To Deploy

**Format:** live coding, no slides · **Length:** 55 min (45-min cut path marked ✂️) · **Stack:** Next.js + Tailwind + React Three Fiber + drei
**Build target:** one `<ProductViewer />` — lazy-loaded, compressed, fallback-first, inside a stated performance budget.

---

## 0. Before you go live

**Terminal / editor**
- Next.js app already created (App Router, Tailwind, **JavaScript — say no to TS**), `npm i three @react-three/fiber @react-three/drei` already done. Do **not** install on stream.
- **`transpilePackages: ['three']` already in `next.config.mjs`.** This is the single most common "why won't it build" for R3F in Next. Have it done; mention it in one sentence.
- `app/page.jsx` open and **empty** except a default export returning `<main className="min-h-screen grid place-items-center bg-neutral-950">`. That's your stage.
- Claude Code open in a split terminal, already `cd`'d in, already authenticated.
- Font 18–20px. Browser at 125%. People are watching on phones.

**Browser / DevTools**
- Chrome DevTools docked right.
- **Network panel** with throttling ready — you will use **Fast 4G** and **Slow 4G**, and you will empty-cache-hard-reload more than once.
- **Lighthouse** panel ready on mobile preset. You're going to run it twice and the delta is a whole beat.
- Device toolbar (Cmd+Shift+M) with **iPhone 14 Pro** selected — the mobile fallback demo needs it.
- ⚠️ Turn **off** "Disable cache" when you're not demoing cold loads, or every reload re-downloads the model and you'll misread your own numbers.

**A real phone on the desk.** Not emulation. If you can screen-mirror it, do. The single most persuasive 20 seconds of this session is the model running on an actual phone.

**Tabs to have open (drop in chat, don't read):**
1. https://r3f.docs.pmnd.rs
2. https://drei.docs.pmnd.rs
3. https://gltf.report
4. https://poly.pizza
5. https://github.com/KhronosGroup/glTF-Sample-Assets
6. https://discoverthreejs.com/tips-and-tricks

**Escape hatches:**
- The product renders from **primitives** by default — no asset, no network, no 404. If GLB loading dies on stream, you are still fully operational and the session continues.
- `/demo` through `/demo5` are click-through backups of every beat. See `SETUP.md`.

---

## 1. The shape of the session

| Time | Beat | Payload |
|---|---|---|
| 0:00–0:04 | Cold open | The same page, shipped two ways |
| 0:04–0:07 | Framing | Who this is for, what "production-safe" means |
| 0:07–0:15 | **Beat A** — the scene graph | Canvas, mesh, material, light, useFrame |
| 0:15–0:24 | **Beat B** — the model | GLTF, gltfjsx, DRACO/meshopt, where the bytes are |
| 0:24–0:32 | **Beat C** — staging & light | Why your model looks like grey plastic |
| 0:32–0:40 | **Beat D** — interaction | Orbit, damping, and not stealing the user's scroll |
| 0:40–0:50 | **Beat E** — shipping it | Lazy, budget, fallback, degrade. **The centrepiece.** |
| 0:50–0:55 | **Beat F** — AI for 3D | Where it helps, where it confidently lies |

✂️ **45-minute cut:** compress Beat A to 5 minutes (build the box, skip `useFrame` theory, springs of this session are not the point), and cut Beat C's shadow comparison to a single toggle. **Never cut Beat E.** Beat E is the entire reason this session is in the curriculum — everything before it is table stakes that a YouTube tutorial can teach, and everything in it is what stops a capstone from shipping a 12MB hero that tanks LCP.

---

## 2. Cold open (0:00–0:04)

Have the finished product page open. Desktop viewport. Then the phone.

> **Say (memorise this one):**
> "This is a product page with a 3D sneaker on it. I want to show you two numbers before I show you any code.
>
> First number: the Largest Contentful Paint on this page is 1.1 seconds. Second number: the 3D model is 4.2 megabytes.
>
> Those two facts are supposed to be incompatible. Getting them to both be true is the entire session."

Now do the reveal, in this order — it takes about ninety seconds and it is the whole argument:

1. **Empty cache, hard reload with the Network tab open.** Filter to `.glb`. Nothing. Zero 3D bytes.
2. **Scroll down to the viewer.** *Now* the request fires. Point at it.
3. **Switch to the phone / device toolbar.** The 3D is gone — it's a static image. Same URL, same code.
4. **Run Lighthouse on mobile.** Show the score.

> "The model is never on the critical path. It is not in the main bundle, it is not requested until you scroll to it, and on a low-power device it is never requested at all. That is what 'production-safe 3D' means, and it is about four techniques, none of which are hard."

Then the honest bit, because this is a capstone week:

> "I'm going to be straight with you about why this matters more than it looks. A 3D element is the single highest-leverage thing you can put in a capstone — it's the thing that makes a reviewer stop scrolling. It is *also* the single fastest way to ship something that scores 34 on Lighthouse and takes nine seconds to load on the phone your reviewer is actually holding. Same feature. The difference is entirely in the loading strategy, and that's what we're building."

---

## 3. Framing (0:04–0:07)

Say the levels out loud:

> "Two audiences.
>
> If you have never rendered a triangle: you're going to leave with a working viewer and a mental model — a scene is a tree, a mesh is a shape plus a surface, a light makes it visible. That's genuinely most of it. The API surface is large and the concepts are small.
>
> If you've done Three.js before: the parts for you are the asset pipeline and Beat E. Compression, draw calls, and the degradation strategy. Those are the parts that don't show up in tutorials because tutorials don't have users on a three-year-old Android.
>
> And everyone: **this connects directly to FE-10.** The audit you run in week 7 has a performance budget in it. Today we set that budget for 3D specifically and build something that fits inside it. If you ship a 3D element in your capstone, this is the checklist you'll be graded against."

Set the rule:

> "One rule for today: **every byte has to justify itself.** 3D is the most expensive thing you can put on a page — by an order of magnitude, not a little. So for everything we add, the question is 'what does this cost, and is the page still fast?' If you can't answer the first half, you're not allowed to ship it."

---

## 4. Beat A — the scene graph (0:07–0:15)

**Do not lecture the theory.** Get a box on screen in ninety seconds, then name the parts.

```jsx
// app/page.jsx
"use client";
import { Canvas } from "@react-three/fiber";

export default function Page() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <Canvas camera={{ position: [3, 2, 4], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#e11d48" />
        </mesh>
      </Canvas>
    </main>
  );
}
```

Then name the four things, pointing at the lines:

> "`<Canvas>` — that's a WebGL context and a render loop. Everything inside it is not React DOM. There's no div in there, nothing you write inside Canvas produces HTML.
>
> `<mesh>` — a thing in space. A mesh is exactly two things: **a geometry** (the shape, the vertices) and **a material** (how the surface responds to light). That's it. Every object you have ever seen in a 3D scene is that pair.
>
> `<boxGeometry args={[1,1,1]} />` — the shape. `args` is the constructor arguments, positionally. That's an R3F convention and it trips everyone once.
>
> `<meshStandardMaterial />` — physically-based surface. Takes colour, roughness, metalness.
>
> And the lights. **Delete the lights.**"

Delete them. Black screen.

> "That's the number one 'my scene is broken' question on every forum, and the answer is always the same: `meshStandardMaterial` is a *physically based* material and there is no light. It's not broken, it's midnight. `meshBasicMaterial` ignores light entirely — that's your 'is my geometry even there' debugging tool."

Put them back. Now make it move:

```jsx
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

function Product() {
  const ref = useRef();
  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.4;
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#e11d48" />
    </mesh>
  );
}
```

⚡ **Advanced aside — say this one, it's the R3F mental model:**
> "`useFrame` runs sixty times a second and it does **not** re-render the component. There's no `setState` in there and there must never be one. You're mutating the three.js object directly through a ref. R3F is a React *renderer* — the JSX describes a scene graph, React reconciles it, and then the render loop is completely outside React. If you put state in `useFrame` you will re-render sixty times a second and everything will die. This is the opposite of the rule in almost every other React context, and it's the thing people get wrong first."

> "Also `delta`. Multiply by `delta`, always. Otherwise your animation runs at a different speed on a 120Hz display than a 60Hz one, and you have shipped a bug that only exists on nice hardware."

✂️ **45-min cut:** stop Beat A here.

**Now build the product from primitives.** This matters — say why:

> "I'm going to build the sneaker out of boxes and spheres for a minute. Not because that's how you'd ship it, but because two things: one, you learn what a mesh is by making twelve of them. And two — this becomes our **fallback**. When we load the real model in ten minutes, this stays in the codebase, and it's what renders when the model fails, when the GPU is weak, or when the user has reduced motion on. Your fallback should be built before the thing it's falling back from."

*(This is on `/demo1` if you'd rather click through it.)*

---

## 5. Beat B — the model, and the bytes (0:15–0:24)

**This is where Claude Code enters.** Same split as always:

> "Claude writes the loader wiring. I decide the budget. Delegate the plumbing, own the constraints."

### 🤖 PROMPT 1 — the loader (paste into Claude Code)

```
Create app/components/three/GltfProduct.jsx in this Next.js + R3F project.
JavaScript, not TypeScript. No .ts/.tsx files.

- Load /models/sneaker.glb with useGLTF from @react-three/drei.
- Enable DRACO decoding using the hosted decoder at
  https://www.gstatic.com/draco/versioned/decoders/1.5.6/
- Export a component that renders <primitive object={scene} /> and takes
  standard object3D props (position, rotation, scale).
- Call useGLTF.preload() for the same path at module scope.
- Do NOT add lights, controls, or a Canvas. This component renders inside an
  existing scene only.
```

While it runs, talk about where models come from:

> "Four places, in the order you should try them. **Poly Pizza** — free, low-poly, mostly CC0, and low-poly is a feature not a compromise. **Khronos glTF Sample Assets** — the reference models, this is where DamagedHelmet lives, and it's the right default for an assignment. **Quaternius and Kenney** — CC0 packs, stylised, great for toy-like scenes. **Sketchfab** — enormous, but filter by downloadable *and* check the licence per model, they are not uniform."
>
> "And the format. **Always glTF, specifically `.glb`.** Not OBJ, not FBX, not STL. glTF is the JPEG of 3D — it's the transmission format, it carries materials and animations, and it's the only one with a real compression story."

### The bytes — this is the part they'll remember

Open **gltf.report**, drag the model in.

> "This is the tool. You drop a GLB in and it tells you exactly where the bytes are. And it's always the same answer: **it's the textures.** Geometry is usually a rounding error. People spend a day decimating meshes and then ship four 4096×4096 PNGs."

Walk the numbers on screen, then compress in the browser and show the delta.

| Technique | What it compresses | Typical | Cost |
|---|---|---|---|
| **DRACO** | geometry (vertices) | 5–10× on mesh data | decoder ~200KB, decode time on main thread |
| **meshopt** | geometry | slightly worse ratio, much faster decode | decoder ~30KB |
| **KTX2 / Basis** | **textures** | 4–8×, and stays compressed **in GPU memory** | encode step, slight quality loss |
| **Resize textures** | textures | linear and free | five minutes in any image editor |

> "Order of operations: **resize your textures first.** It's free, it needs no tooling, and it's usually the entire win. A 4K texture on a product that occupies 400 pixels of screen is nine-tenths waste. Then KTX2 if you're serious. DRACO on geometry is the famous one and it's usually the *least* of your problems."

⚡ **Advanced aside:**
> "DRACO's decoder is itself ~200KB of WASM and it decodes on the main thread unless you configure a worker. On a heavy model you can genuinely trade a 2MB download for a 400ms main-thread block, which is a worse experience even though the waterfall looks better. Meshopt is the safer default now — smaller decoder, much faster. Measure, don't cargo-cult."

**glTF-Transform** for the pipeline version:

```bash
npx @gltf-transform/cli optimize in.glb out.glb --texture-compress webp
```

**gltfjsx** — say it exists and what it's for:

```bash
npx gltfjsx sneaker.glb --transform
```

> "This turns a GLB into a JSX component with every mesh named and addressable — which is how you make a configurator, because now you can change the colour of one part. The `--transform` flag runs the compression pipeline at the same time. For the capstone configurator bonus, this is the fast path."

**Now wire the fallback**, and make the point explicitly:

```jsx
<Suspense fallback={<ProceduralProduct />}>
  <GltfProduct />
</Suspense>
```

> "Read that out loud: while the real model is loading, render the primitive one. Not a spinner — the *product*. The page is never empty, never jumps, and if the model 404s the error boundary keeps the primitive version forever and the user never knows. A fallback that is a smaller version of the real thing beats a fallback that is a loading state, every time."

---

## 6. Beat C — staging and light (0:24–0:32)

Load the model with the two lights from Beat A still in there. It looks terrible. Sit in it for a second.

> "This is the moment everybody hits. The model is correct — geometry's fine, materials are fine — and it looks like grey plastic in a car park. It is not a modelling problem. It's a *lighting* problem, and specifically it's a **reflection** problem."

### Environment maps — the actual answer

```jsx
import { Environment } from "@react-three/drei";

<Environment preset="city" />
```

One line. Show the before/after. Let it land.

> "That's an environment map — an HDRI, a photograph of a real place in every direction. Every reflective surface in your scene is now reflecting an actual room instead of nothing. **This is the single highest-ratio line of code in 3D on the web.** One line, and the difference between 'student project' and 'product page' is mostly this."

⚠️ **Now the trap — say this clearly, it's a real bug they will ship:**

> "And here's where I have to correct the internet. Every tutorial, and every AI, will tell you to use `preset`. Read drei's own docs: *'preset is not meant to be used in production environments and may fail as it relies on CDNs.'* That's a request to a GitHub-hosted HDRI on someone else's infrastructure, on your users' critical path, and one day it will be slow or gone.
>
> In production you self-host it:"

```jsx
// npm i @pmndrs/assets
import { suspend } from "suspend-react";
const city = import("@pmndrs/assets/hdri/city.exr").then((m) => m.default);

<Environment files={suspend(city)} />
```

> "Dynamic import so it's not in your main bundle. And an HDRI is a real download — a 1K HDR is around 1–2MB, which for a lot of pages is bigger than the model. Budget it like any other asset."

⚡ **Advanced:** the zero-network option — a declarative environment:

```jsx
<Environment resolution={256}>
  <Lightformer intensity={2} position={[0, 5, -9]} scale={[10, 10, 1]} />
  <Lightformer intensity={1} position={[-5, 1, -1]} scale={[10, 2, 1]} />
</Environment>
```

> "You can *build* the environment out of emissive planes and have drei render it to a cube map once. No download at all, full control over where the highlights land, and it's how a lot of the really polished product pages do it. That's what these demo pages use, which is why they work on aeroplane wifi."

### `<Stage>` — and when not to use it

```jsx
<Stage intensity={0.5} environment="city" shadows="contact" adjustCamera>
  <Product />
</Stage>
```

> "`<Stage>` is studio lighting, auto-centering, auto-framing and ground shadows in one component. For a product viewer it is close to correct out of the box, and you should absolutely start here."

> "But know what it's doing, because it's opinionated. It **moves your camera** — that's `adjustCamera`, and if you're also driving the camera yourself you'll fight it, so set `makeDefault` on your controls. It **wraps your model in `<Bounds>`** and rescales it. The day you need the product 20% off-centre, you stop using Stage and compose `<Environment>` + `<ContactShadows>` + your own lights by hand. Stage is a great starting point and a bad ending point."

### Shadows — the cheap one and the expensive one

| | Cost | Use when |
|---|---|---|
| `<ContactShadows />` | cheap — one render to a texture | almost always |
| `<AccumulativeShadows />` | expensive up front, free after | static scene, hero shot |
| Real shadow maps (`castShadow`) | per-frame, per-light | you need shadows that move |

> "For a product on a floor, contact shadows are 95% of the perceived quality for a fraction of the cost. Real shadow maps mean every shadow-casting light re-renders the scene from the light's point of view, every frame. On a product viewer that's usually money spent on nothing."

---

## 7. Beat D — interaction (0:32–0:40)

```jsx
import { OrbitControls } from "@react-three/drei";

<OrbitControls makeDefault enableDamping dampingFactor={0.08} />
```

> "`makeDefault` — tells drei's other components that this is the camera controller, so `<Stage>` and `<Bounds>` stop fighting you. `enableDamping` — inertia. Without it the model stops dead when you release, which feels like dragging a spreadsheet. With it, it glides. It's the same 'nothing in the physical world stops instantly' argument from the motion session."

**Now the part that matters and gets skipped.** Switch to the device toolbar and drag.

> "Watch what just happened. I tried to scroll the page, and instead I rotated the sneaker. The canvas ate my scroll. On a phone, a full-page-width canvas with orbit controls is a **scroll trap** — the user physically cannot get past your hero, and they will leave."

Three fixes, in order of preference:

```jsx
// 1. The good one: constrain what the control is allowed to do
<OrbitControls
  makeDefault
  enableDamping
  enableZoom={false}     // no pinch-to-zoom stealing pinch-to-zoom
  enablePan={false}      // no two-finger drag stealing scroll
  minPolarAngle={Math.PI / 2.6}
  maxPolarAngle={Math.PI / 1.9}   // no looking at the sole from underneath
/>
```

```jsx
// 2. The better one for a hero: don't use a camera control at all
import { PresentationControls } from "@react-three/drei";

<PresentationControls global={false} snap polar={[-0.2, 0.4]} azimuth={[-0.6, 0.6]}>
  <Product />
</PresentationControls>
```

> "`PresentationControls` rotates *the model*, not the camera, within limits you set, and `snap` springs it back to centre when released. Vertical drags fall through to the page. For a hero element this is almost always the right choice and almost nobody uses it, because every tutorial reaches for OrbitControls."

```css
/* 3. The blunt one, and know that it has a cost */
canvas { touch-action: pan-y; }
```

> "That tells the browser vertical drags belong to the page, horizontal ones to the canvas. It works, but you've now made vertical rotation impossible on touch. That's a trade, not a fix — make it deliberately."

⚡ **Advanced aside:**
> "Also: `minDistance` and `maxDistance`, always. Otherwise a user with a trackpad will zoom inside the mesh and see the inside of your product's back face, and because your material is single-sided it'll look like the model exploded. It's the single funniest bug report you'll get and it takes one line to prevent."

**Hover and click** — 20 seconds, because pointer events are the thing people don't realise they get free:

```jsx
<mesh
  onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
  onPointerOut={() => setHovered(false)}
  onClick={(e) => { e.stopPropagation(); setActive(!active); }}
/>
```

> "Full raycasting, on the actual triangle you're pointing at. `stopPropagation` matters — without it you hit every mesh behind the one you're pointing at, and your click handler fires four times."

---

## 8. Beat E — shipping it (0:40–0:50)

**This is the centrepiece. Slow down. This is the beat that's actually being graded.**

> "Everything up to here you could get from a YouTube tutorial. This is the part that isn't in the tutorials, because tutorials don't have a Lighthouse score."

Start by making the problem real. Comment out every guard, hard-reload, run Lighthouse mobile.

> "That's what shipping the naive version looks like. Now let's get it back."

### 1. It must not be in your main bundle

```jsx
import dynamic from "next/dynamic";

const ProductViewer = dynamic(() => import("./ProductViewer"), {
  ssr: false,
  loading: () => <ProductStill />,
});
```

> "`ssr: false` is not optional — there is no WebGL context on the server and three.js will throw on `window`. And look at `loading`: the fallback is the **static product photo**, at the same dimensions. So the layout never shifts, and the image is what gets measured as LCP. The 3D isn't racing your LCP; it's not in the race."

Show the bundle delta in the Network tab. three + R3F + drei is roughly **600–700KB gzipped** before you load a single model.

> "Say that number out loud to yourself when you're deciding whether the capstone needs 3D. That's your entire JS budget, spent, before the product shows up."

### 2. It must not load until it's visible

```jsx
const [ref, inView] = useInView({ rootMargin: "200px" });

<div ref={ref} className="aspect-square">
  {inView ? <ProductViewer /> : <ProductStill />}
</div>
```

> "IntersectionObserver, with `rootMargin` so it starts a beat before it's on screen and doesn't pop. If your viewer is below the fold — and on a product page it always is — this alone is most of the win. And notice the wrapper has a fixed aspect ratio: **reserve the space**. A canvas appearing later without reserved space is a CLS hit, and CLS is in the audit."

### 3. It must not render more pixels than it needs

```jsx
<Canvas
  dpr={[1, 1.5]}
  gl={{ antialias: false, powerPreference: "high-performance" }}
  frameloop={active ? "always" : "demand"}
>
```

> "`dpr={[1, 1.5]}` — device pixel ratio, clamped. A phone reports 3. Rendering a WebGL scene at 3× is **nine times** the pixels of 1×. Nine. You will not see the difference on a product viewer and you will absolutely feel it. This one line is the biggest single perf win in the file."
>
> "`antialias: false` — then get your edges back with a cheap post-process if you need them, or just don't; on a product on a plain background nobody notices.
>
> `frameloop="demand"` — **do not render frames when nothing is moving.** By default R3F renders continuously, forever, burning battery on a static product. On demand, it renders when something changes. If the model idles with a slow spin, that's `always` while hovered and `demand` when not."

### 4. It must not run at all on hardware that can't take it

```jsx
import { useDetectGPU } from "@react-three/drei";

const gpu = useDetectGPU();
if (gpu.tier < 2 || gpu.isMobile) return <ProductStill />;
```

> "drei ships `useDetectGPU` — you don't need another dependency, it's already installed. It classifies the GPU against a benchmark database and gives you a tier from 0 to 3. Tier 0 and 1 mean 'this device will render your scene at 12fps.'
>
> And be honest about what this is: **it's not a fallback, it's a decision.** You are deciding some users get the static image. That's correct. A fast static image is a better experience than a slow 3D one, and it is not a failure to serve it."

Plus the two you already know:

```jsx
const reduce = useReducedMotion();      // no auto-rotation, no float
if (saveData) return <ProductStill />;  // navigator.connection.saveData
```

### 5. It must be measurable

Show the perf HUD (`/demo5`) reading from `gl.info`:

| Number | Where | Budget for a product viewer |
|---|---|---|
| **Draw calls** | `gl.info.render.calls` | **< 50**, ideally < 20 |
| **Triangles** | `gl.info.render.triangles` | **< 150k** |
| **Textures** | `gl.info.memory.textures` | < 10 |
| **Programs** | `gl.info.programs.length` | < 15 — each one is a shader compile |
| **GLB transfer** | Network | **< 2MB** compressed |
| **FPS on a mid phone** | real device | **≥ 45** sustained |

> "Draw calls are the number to watch. Every material is a separate draw call — a model with 40 materials is 40 calls whether it's 200 triangles or 200,000. That's why merging materials in Blender is often a bigger win than decimating the mesh. Beginners: just watch that number and keep it small."

⚡ **Advanced:** `<Instances>`/`<Merged>` from drei for repeated geometry, `<Detailed>` for LOD, `<Bvh>` for raycast cost on heavy meshes, `<AdaptiveDpr>` to drop resolution automatically when the framerate sags, `<Preload all />` to force shader compilation during the loading screen instead of on the first frame the user sees.

> "That last one is subtle and it's a real bug: shaders compile lazily, on first render. So your scene loads, looks fine, and then hitches for 300ms the first time an object comes into view. `<Preload all />` moves that into the Suspense window where you already have a fallback on screen."

**Now re-run Lighthouse.** Both numbers on screen. That delta is the beat.

---

## 9. Beat F — AI for 3D (0:50–0:55)

**Run it live. It will be wrong in a specific, teachable way.**

### 🤖 PROMPT 2 — the naive one

```
Add a 3D product viewer to my Next.js page using react-three-fiber.
```

Diagnose the output out loud. It will do several of these:

| What it does | Why it's wrong |
|---|---|
| `<Environment preset="city" />` with no caveat | CDN dependency on your critical path — drei's own docs say not for production |
| Imports the Canvas directly, no `dynamic` | SSR crash, or 700KB in the main bundle |
| No `dpr` cap | 9× the pixels on any phone |
| `frameloop` untouched | renders forever, eats battery on a static product |
| Outdated three APIs — `outputEncoding`, `sRGBEncoding` | renamed to `outputColorSpace` / `SRGBColorSpace` in r152. Still all over the training data |
| drei APIs that moved or never existed | drei iterates fast; the model is confidently a year behind |
| Suggests `r3f-perf` | last published two years ago — check before you install |

> "Three.js has a **monthly** release cadence and it renames things. R3F went to v9 for React 19. drei reorganises constantly. So the training data for this specific ecosystem is unusually stale, and the failure mode is not 'it doesn't compile' — it's 'it compiles and silently renders in the wrong colour space,' which you won't catch unless you know what correct looks like."

> "This isn't a dunk. Ask it to explain what a UV map is, or why your normals are inverted, and it's genuinely excellent — better than most tutorials. It's a great **teacher** and an unreliable **API reference**. Use it for concepts and debugging; check it against the docs for anything with a version number attached."

### 🤖 PROMPT 3 — the specified one

```
Add a 3D product viewer to app/page.jsx using @react-three/fiber v9 and
@react-three/drei v10. JavaScript, not TypeScript.

Loading:
- next/dynamic with ssr: false; the loading fallback is <ProductStill />,
  a plain <img> at the same aspect ratio
- do not render the Canvas until it is in view (IntersectionObserver, 200px
  rootMargin); reserve the space with an aspect-ratio wrapper

Canvas:
- dpr={[1, 1.5]}, antialias: false, frameloop="demand"
- <Suspense> fallback is the procedural product, not a spinner

Scene:
- <Environment> with declarative <Lightformer> children — do NOT use the
  `preset` prop, it depends on a CDN
- <ContactShadows>, not real shadow maps
- <OrbitControls makeDefault enableDamping enableZoom={false} enablePan={false}>
  with minPolarAngle/maxPolarAngle limits

Degradation:
- useDetectGPU from drei; tier < 2 renders <ProductStill /> instead
- useReducedMotion disables auto-rotation

Budget: under 50 draw calls, under 150k triangles.
Do not add post-processing, physics, or any dependency not already installed.
```

> "Same point as always: that's not a prompt, it's a spec. And I could only write it because we spent fifty minutes learning what to ask for. **The prompt is the deliverable of understanding, not a substitute for it.**"

### 🤖 PROMPT 4 — the takeaway

> "Put this in a `CLAUDE.md` in your repo and you never write that spec again."

*(It's already in this repo — open `CLAUDE.md` and show it working.)*

---

## 10. Close (0:53–0:55)

> "What we built: a product viewer that is lazy, compressed, capped, measured, and that degrades to a photograph on hardware that can't take it. Four techniques. None of them hard, all of them skipped by default."

**Homework:**
> "Add **one** 3D element to your capstone. One. And in your README, document its cost: transfer size, draw calls, and the mobile Lighthouse score before and after. If the score moved more than five points, fix it before you call it done. That documentation *is* the assignment — the 3D is just the excuse."

**The shelf — drop in chat, don't read:**
> "If you read one thing: **Discover three.js**, the Tips and Tricks page — best perf checklist in the ecosystem, free. If 3D clicks for you and you want the deep version, **Three.js Journey** by Bruno Simon is the canonical course and it is worth the money. For R3F specifically, **Maxime Heckel's blog** is the best written material anywhere. And **Wawa Sensei** on YouTube is free and project-driven if you learn by building."

**Last line:**
> "3D is the easiest way to make a page memorable and the easiest way to make it unusable. The whole skill is knowing which one you just shipped. Go measure it."

---

## 11. The 3D perf budget (post this in the channel — it's the deliverable)

### Before you add 3D at all
- [ ] Can a video or an image sequence do this? (Often yes, for a tenth of the cost.)
- [ ] Is the 3D above the fold? (If yes, reconsider. If it must be, it must be tiny.)
- [ ] Have you budgeted **~600–700KB gzipped** for three + R3F + drei, before any model?

### The asset
- [ ] `.glb`, not OBJ/FBX
- [ ] Run through **gltf.report** — know where your bytes are
- [ ] Textures resized to what's actually on screen (do this first, it's free)
- [ ] Geometry compressed — meshopt preferred, DRACO acceptable
- [ ] Textures compressed — KTX2/Basis if you're serious
- [ ] **Transfer size < 2MB**

### The loading
- [ ] `next/dynamic` with `ssr: false`
- [ ] Not requested until in view (IntersectionObserver + `rootMargin`)
- [ ] Space reserved with a fixed aspect ratio — no CLS
- [ ] `<Suspense>` fallback is the product, not a spinner
- [ ] Error boundary → static fallback, never a blank canvas

### The runtime
- [ ] `dpr={[1, 1.5]}` capped
- [ ] `frameloop="demand"` unless something is genuinely always moving
- [ ] `antialias: false` unless you can prove you need it
- [ ] Draw calls **< 50**, triangles **< 150k**
- [ ] `<Preload all />` so shaders compile behind the fallback

### The degradation
- [ ] `useDetectGPU` — tier < 2 gets the static image
- [ ] `prefers-reduced-motion` — no auto-rotation, no float
- [ ] `navigator.connection.saveData` — respect it
- [ ] Tested on a **real phone**, not the device toolbar

### The proof (this is the FE-10 hook)
- [ ] Mobile Lighthouse before and after, both recorded
- [ ] LCP unchanged (3D must not be the LCP element)
- [ ] Cost documented in the README

---

## 12. Failure recovery lines

- **Model won't load:** "Good — this is exactly the failure we built the fallback for." *(The primitive product is still on screen. This is a genuinely great save; the fallback working live is more persuasive than the model loading.)*
- **Black screen:** it's the lights, or it's the camera inside the model. Say so out loud, add `<ambientLight />`, move on. Don't debug silently.
- **Build breaks on a three import:** `transpilePackages: ['three']`. Say it, fix it, note it's the most common R3F-in-Next issue.
- **Frame rate tanks on stream:** "Screen capture and WebGL fight for the GPU — that's the recording, not the scene." Then show the HUD, which is still telling the truth.
- **Claude Code output is enormous:** don't read it. "Scroll to the Canvas props, that's the only part that matters."
- **Running long at Beat D:** cut the hover/click bit and the third touch fix. Go to Beat E. Beat E is graded, Beat D is not.
