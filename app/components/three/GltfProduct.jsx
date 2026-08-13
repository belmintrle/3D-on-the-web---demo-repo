"use client";

// THE REAL MODEL PATH.
//
// Nothing here runs unless you put a file at public/models/sneaker.glb.
// See public/models/README.md for where to get one in about two minutes.
// Until then every viewer in this project renders <ProceduralSneaker />, which
// is the point: the fallback is the default, not the afterthought.

import { useGLTF } from "@react-three/drei";

export const MODEL_PATH = "/models/sneaker.glb";

// The hosted DRACO decoder. Two honest notes you should say out loud:
//
//  1. This is a CDN dependency. Same class of problem as <Environment preset>.
//     For production, copy the decoder into /public/draco/ and point here.
//     `npx gltf-transform` and three/examples/jsm/libs/draco both ship it.
//  2. The decoder is ~200KB of WASM and decodes on the main thread by default.
//     On a heavy model you can trade 2MB of download for a 400ms main-thread
//     block, which looks better in the waterfall and feels worse to the user.
//     meshopt has a ~30KB decoder and is the safer default now. Measure.
const DRACO_PATH = "https://www.gstatic.com/draco/versioned/decoders/1.5.6/";

export function GltfProduct(props) {
  const { scene } = useGLTF(MODEL_PATH, DRACO_PATH);
  return <primitive object={scene} {...props} />;
}

// Start fetching before React gets to the component. Only useful once you've
// decided the model is definitely going to be needed — which, per Beat E, is
// after the viewer is in view, not on page load.
export function preloadProduct() {
  useGLTF.preload(MODEL_PATH, DRACO_PATH);
}
