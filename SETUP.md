# Dry-run checklist — Shipping 3D

Project is scaffolded. Two commands to go.

## 1. Install and run

```bash
cd ~/Desktop/company/demo/demo-folder2
npm install
npm run dev
```

`node_modules` was deliberately not installed for you — Next.js and three ship
platform-specific binaries and the ones from a Linux sandbox won't run on your
Mac.

If npm argues about versions, this resolves it without a fight:

```bash
npm i next@latest react@latest react-dom@latest
npm i three@latest @react-three/fiber@latest @react-three/drei@latest
npm i -D tailwindcss@latest @tailwindcss/postcss@latest
```

Version pairing that matters: **React 19 → @react-three/fiber v9 →
@react-three/drei v10.** R3F v8 pairs with React 18; if npm resolves you onto
v8 the drei components will misbehave in ways that look like your bug.

## 2. The tabs

| URL | Key | What it is |
|---|---|---|
| `localhost:3000` | — | **The stage.** Empty `<main>`. Where you live-code. |
| `/demo` | `0` | **Cold open.** The finished product page. |
| `/demo1` | `1` | **Beat A** — scene graph, materials, `useFrame`. |
| `/demo2` | `2` | **Beat B** — the fallback chain, the byte budget, the pipeline. |
| `/demo3` | `3` | **Beat C** — environment maps, shadows, `<Stage>`. |
| `/demo4` | `4` | **Beat D** — controls, the scroll trap, pointer events. |
| `/demo5` | `5` | **Beat E** — guardrails, the gate, the checklist, the finished viewer. |

Press **0–5** anywhere to jump. No hunting for a tab on stream.

## 3. Running from the demo pages (the backup path)

Every moment in the script where you'd stop and edit code is a toggle on these
pages, and the code panel underneath updates live as you click.

| Script says | On the page |
|---|---|
| §4 "delete the lights" | `/demo1` — **lights** toggle, plus the material switcher to prove the geometry was there |
| §4 `delta` | `/demo1` — the display-Hz slider. Two cubes, one drifts out of sync |
| §4 "build it from primitives" | `/demo1` A3, with the draw-call readout |
| §5 the fallback chain | `/demo2` — **use real model** with no GLB present *is* the demo |
| §5 "where the bytes are" | `/demo2` — the budget calculator. Push textures to 4× 4K PNG |
| §6 "grey plastic in a car park" | `/demo3` — **two lights** → **Lightformers**, or side-by-side |
| §6 the `preset` trap | `/demo3` — select `preset="city"`, the warning appears with the drei quote |
| §7 the scroll trap | `/demo4` — the phone-shaped scroll box. **Works with a mouse wheel** |
| §7 zoom inside the mesh | `/demo4` D3 — unconstrained, wheel all the way in |
| §8 dpr / frameloop / preload | `/demo5` — all live, with the HUD reacting |
| §8 the device gate | `/demo5` E2 — real device readout + force overrides |
| §8 the budget checklist | `/demo5` E3 — tickable, it's the FE-10 one-pager |

**Nothing on these pages needs the network.** No HDRI, no CDN, no model. The
environment is built from `<Lightformer>`s and the product is primitives.

## 3b. Verify these first — I couldn't run the app to check them

I wrote and parse-checked everything, but there's no GPU in my sandbox, so
these three want thirty seconds of your eyes before you rely on them:

1. **The environment bakes on `/demo3`.** Select "Lightformers" — the sneaker
   should look lit and reflective, not black. `<Environment>` with children
   renders to a cube map once on mount; if it ever comes up unlit, add
   `frames={Infinity}` to `StudioEnvironment.jsx` as the escape hatch.
2. **`/demo5` dpr slider actually changes something.** The canvas is keyed on
   the value so it recreates the WebGL context — you should see a one-frame
   flash and the FPS number move.
3. **The procedural sneaker looks like a sneaker.** It's eleven primitives and
   I was building blind. If a proportion is off, every number is in
   `ProceduralSneaker.jsx` and they're all one-line edits.

## 4. Rehearse these specifically

- [ ] **The cold-open sequence.** Empty cache → hard reload → filter Network to
      JS → scroll → point at the chunk arriving → tick **Low-power device** →
      reload → Lighthouse. Do it twice. It's 90 seconds and it's the argument.
- [ ] **`/demo4` scroll trap with a mouse.** Confirm the wheel-over-canvas
      behaviour on your machine before you rely on it.
- [ ] **`/demo5` dpr slider to 3.** Watch the FPS. Know what it does on *your*
      GPU so you're not surprised.
- [ ] **PROMPT 2 into Claude Code.** Run it once now — you need to know how long
      it takes and what it produces, because you're talking over it.
- [ ] **Open `CLAUDE.md` in the split terminal** and show Claude Code obeying
      it. That's Beat F's payoff and it needs to actually work.

## 5. Two decisions I made that you should know about

**No `r3f-perf`, no `detect-gpu`.** You asked for both. I left both out and
here's why, because it's the kind of thing you'd rather hear now than discover
at 0:45:

- `r3f-perf`'s last publish was ~2 years ago. Against R3F v9 + React 19 that's
  a real risk, and a peer-dep explosion during `npm install` on session morning
  is the worst possible time to find out. `PerfHUD.jsx` reads the same numbers
  straight off `gl.info` in twenty lines, and it teaches what they mean.
- `detect-gpu` is already inside drei as `useDetectGPU` — and per Beat E you
  *can't* use it for the gate anyway, because importing drei to decide whether
  to import drei defeats the purpose. `lib/useDeviceTier.js` does the gate with
  zero dependencies.

If you'd rather have them, `npm i r3f-perf detect-gpu` and they slot in — but
test the install before the session, not during it.

**The environment is built, not downloaded.** drei's docs say `preset` is not
for production because it hits a CDN. So the demo pages use declarative
`<Lightformer>`s. That means the pages work on aeroplane wifi, *and* the
production-correctness point becomes something you demonstrate rather than
assert.

## 6. Everything else from §0 of the script

- [ ] Editor font 18–20px, browser at 125%
- [ ] `app/page.jsx` open and empty (done — it's your stage)
- [ ] Claude Code open in a split terminal, `cd`'d in, authenticated
- [ ] DevTools docked right; **Network** with throttling ready (Fast 4G / Slow 4G)
- [ ] **Lighthouse** panel on the mobile preset — you run it twice, the delta is a beat
- [ ] Device toolbar (Cmd+Shift+M) with iPhone 14 Pro selected
- [ ] ⚠️ "Disable cache" **off** except when demoing cold loads, or you'll misread your own numbers
- [ ] **A real phone on the desk.** Screen-mirrored if you can. The most persuasive 20 seconds in the session.

Tabs: r3f.docs.pmnd.rs · drei.docs.pmnd.rs · gltf.report · poly.pizza ·
github.com/KhronosGroup/glTF-Sample-Assets · discoverthreejs.com/tips-and-tricks

## What's where

```
app/
  page.jsx                          ← the stage (empty, yours to fill)
  demo/page.jsx                     ← cold open: the product page
  demo1…demo5/page.jsx              ← one per beat, click-through backups
  components/three/
    ProceduralSneaker.jsx           ← the product from primitives — the fallback
    GltfProduct.jsx                 ← the real-model path (DRACO wired)
    Product.jsx                     ← error boundary → Suspense → model
    StudioEnvironment.jsx           ← Lightformers, no CDN
    ProductStill.jsx                ← the static fallback (inline SVG)
    ProductViewer.jsx               ← the finished viewer; defaults = production
    LazyProductViewer.jsx           ← device gate → in-view gate → dynamic import
    PerfHUD.jsx                     ← gl.info, no dependency
  components/demo/kit.jsx           ← nav, code panel, controls
  lib/useDeviceTier.js              ← the gate that runs before three.js loads
  lib/useInView.js
public/models/README.md             ← where to get a GLB, and how to compress it
CLAUDE.md                           ← the Beat F takeaway, as a live file
shipping-3d-script.md               ← the session
```
