# Drop a `.glb` here

Everything in this project renders the **procedural** sneaker by default —
built from primitives in `app/components/three/ProceduralSneaker.jsx`. No
asset, no network request, nothing to 404 mid-session.

To switch to a real model, put a file here named **`sneaker.glb`** and turn on
the "Use real model" toggle on `/demo2`. That's it — the path is already wired
in `app/components/three/GltfProduct.jsx`.

## Where to get one in two minutes

| Source | Why |
|---|---|
| [Poly Pizza](https://poly.pizza) | Free, low-poly, mostly CC0. First stop. Search "shoe" or "sneaker". |
| [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) | The reference models. `DamagedHelmet.glb` is the classic default for an assignment — it's ~3.7MB and shows off PBR materials properly. |
| [Quaternius](https://quaternius.com) | CC0 stylised packs. Good for toy-like scenes. |
| [Kenney](https://kenney.nl) | CC0 game assets, includes 3D kits. |
| [Sketchfab](https://sketchfab.com) | Enormous. Filter by downloadable **and** check the licence per model — they are not uniform. |

Always take the **`.glb`** if it's offered. Not OBJ, not FBX. glTF is the
transmission format; it carries materials and animations and it's the only one
with a real compression story.

## Before you commit it

Drop it in [gltf.report](https://gltf.report) first. It'll tell you exactly
where the bytes are, and the answer is almost always the textures.

```bash
# the pipeline version
npx @gltf-transform/cli optimize in.glb sneaker.glb --texture-compress webp

# turn it into an addressable JSX component (for the configurator bonus)
npx gltfjsx sneaker.glb --transform
```

Budget for this session: **under 2MB transferred**. If your model is bigger
than that, resize the textures before you do anything clever with geometry
compression — it's free and it's usually the whole win.

## If the file is missing or broken

Nothing breaks. `Product.jsx` wraps the loader in an error boundary whose
fallback is the procedural sneaker, so a 404 degrades silently and the console
tells you why. That behaviour is the deliverable, not a convenience — go look
at it in `Product.jsx`.
