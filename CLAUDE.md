# CLAUDE.md — 3D rules

The Beat F takeaway, live in the repo. Every prompt in this project inherits
it, which is the whole point: you write the spec once.

## Non-negotiable

- This project is JavaScript. Never generate .ts or .tsx files or type annotations.
- Target `@react-three/fiber` v9 and `@react-three/drei` v10 (React 19).
  Do not use v8 patterns. Check the docs before using any drei component you
  have not seen in this repo — drei reorganises constantly and your training
  data is behind.
- three.js renamed colour-space APIs in r152. It is `outputColorSpace` and
  `SRGBColorSpace`, never `outputEncoding` or `sRGBEncoding`.

## Loading — never negotiable either

- The Canvas is imported with `next/dynamic` and `ssr: false`. Always.
- The loading fallback is a static image at the same aspect ratio, never a
  spinner and never null.
- The canvas does not mount until it is in view (IntersectionObserver,
  ~200px rootMargin).
- Wrap it in a fixed aspect-ratio box. Reserve the space or you cause CLS.
- Suspense fallback is the procedural/low-poly product, not a loading state.
- Every model loader sits inside an error boundary whose fallback is the
  static product. Suspense does not catch a 404.

## Canvas defaults

- `dpr={[1, 1.5]}` — never uncapped.
- `gl={{ antialias: false, powerPreference: "high-performance" }}`
- `frameloop="demand"` unless something is genuinely always animating.
- `<Preload all />` so shaders compile behind the fallback.

## Scene

- Never `<Environment preset="…">` in shipped code — it is a CDN request on the
  critical path, and drei's own docs say not to use it in production. Use
  declarative `<Lightformer>` children, or self-host via `@pmndrs/assets` with
  a dynamic import.
- `<ContactShadows frames={1} />` for a static product. Not real shadow maps.
- `<Stage>` is fine to start with, but it defaults to the CDN environment and
  it moves the camera — pass `makeDefault` on controls if you use it.

## Interaction

- `<OrbitControls makeDefault enableDamping>` — always `makeDefault`.
- `enableZoom={false}` and `enablePan={false}` unless there is a stated reason.
  They steal the user's scroll and pinch on touch.
- Always set `minDistance` and `maxDistance`, and clamp `minPolarAngle` /
  `maxPolarAngle`.
- For a hero element prefer `<PresentationControls global={false} snap>` —
  it rotates the model, not the camera, and lets vertical drags scroll the page.
- `e.stopPropagation()` in every pointer handler.

## Degradation

- The device gate runs in the page, before anything 3D is imported. Do not gate
  on `useDetectGPU` from drei — importing drei to decide whether to import drei
  defeats the purpose. Use `lib/useDeviceTier.js`.
- `prefers-reduced-motion` disables auto-rotation and float.
- Respect `navigator.connection.saveData`.

## Budget

- Draw calls < 50. Triangles < 150k. Textures < 10. GLB transfer < 2MB.
- Do not add a dependency without saying what it costs. Check its last publish
  date first.

## Two this repo learned the hard way

- `useFrame` must never call `setState`. Mutate through a ref. And multiply by
  `delta`, or the animation runs at a different speed on a 120Hz display.
- Textures are stored uncompressed in GPU memory unless they are KTX2/Basis.
  A 2048² PNG can be 500KB on the wire and ~22MB in VRAM. Budget both numbers.
