# Shipping 3D — R3F product viewer starter

A product viewer you're allowed to deploy: lazy-loaded, fallback-first, capped,
and measurable. Built for the "3D on the Web" session — see
[`shipping-3d-script.md`](./shipping-3d-script.md) for the session itself and
[`SETUP.md`](./SETUP.md) for the dry-run checklist.

## Setup

```bash
npm install
npm run dev
```

`localhost:3000` is the empty stage. `/demo` is the cold open, and `/demo1`
through `/demo5` are click-through backups of every beat. Press **0–5** to jump
between them.

## What's actually interesting in here

| File | Why it's worth reading |
|---|---|
| `app/components/three/Product.jsx` | The fallback chain — error boundary → Suspense → real model, in five lines |
| `app/components/three/LazyProductViewer.jsx` | Three gates in the order that matters: device, visibility, then the chunk |
| `app/lib/useDeviceTier.js` | Why you *can't* gate on drei's `useDetectGPU` |
| `app/components/three/StudioEnvironment.jsx` | A studio environment with no CDN request |
| `app/components/three/PerfHUD.jsx` | Draw calls and triangles from `gl.info`, no dependency |
| `app/components/three/ProceduralSneaker.jsx` | The product, from primitives. Zero bytes. |
| `CLAUDE.md` | The rules, so you never write the spec again |

## No 3D asset required

Everything renders a sneaker built from primitives by default — no model, no
network request, nothing to 404. To use a real GLB, drop it at
`public/models/sneaker.glb` and flip the toggle on `/demo2`. See
[`public/models/README.md`](./public/models/README.md).

## Dependencies, and what they cost

```
three + @react-three/fiber + @react-three/drei   ~600–700KB gzipped
```

That's the entire JS budget of a typical page, spent before the product shows
up — which is why none of it is in the main bundle. Nothing else is installed:
`r3f-perf` hadn't been published in ~2 years as of writing (a real gamble
against R3F v9), and drei already ships `useDetectGPU`, so neither earns its
place. Reading six numbers off `gl.info` is twenty lines.

## Setup gotcha

`next.config.mjs` has `transpilePackages: ['three']`. Without it the build
fails somewhere inside `node_modules` with no useful clue. It is the single
most common R3F-in-Next.js issue.
