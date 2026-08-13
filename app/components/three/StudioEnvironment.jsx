"use client";

// THE ENVIRONMENT — built, not downloaded.
//
// Every tutorial (and every AI) reaches for <Environment preset="city" />.
// drei's own docs say, verbatim:
//
//   "preset property is not meant to be used in production environments and
//    may fail as it relies on CDNs."
//
// That preset is an HTTP request to an HDRI hosted on someone else's
// infrastructure, sitting on your users' critical path. In production you
// either self-host it (@pmndrs/assets + a dynamic import) or you do this:
// build the environment out of emissive planes and let drei render it to a
// cube map once, at 256px, on mount.
//
// Zero network. Full control over where the highlights land. It is also how a
// lot of the genuinely polished product pages do it — you are not settling.

import { Environment, Lightformer } from "@react-three/drei";

export function StudioEnvironment({ resolution = 256 }) {
  return (
    <Environment resolution={resolution}>
      {/* Key — the big soft box above and behind. This is the highlight that
          runs along the top of the product and does most of the work. */}
      <Lightformer
        form="rect"
        intensity={3}
        position={[0, 4, -6]}
        rotation={[0, 0, 0]}
        scale={[12, 8, 1]}
        color="#ffffff"
      />

      {/* Fill — cool, from the left, stops the shadow side going black */}
      <Lightformer
        form="rect"
        intensity={1.1}
        position={[-6, 1.5, 2]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[10, 4, 1]}
        color="#bfdbfe"
      />

      {/* Rim — warm, from the right and behind, separates the product from
          the background. This is the one people forget and it is the one that
          makes a render look photographed rather than rendered. */}
      <Lightformer
        form="rect"
        intensity={2.2}
        position={[5, 2.5, -3]}
        rotation={[0, -Math.PI / 3, 0]}
        scale={[6, 4, 1]}
        color="#fed7aa"
      />

      {/* Bounce — dim, from below, mimics light coming back off the floor */}
      <Lightformer
        form="rect"
        intensity={0.5}
        position={[0, -3, 1]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[10, 10, 1]}
        color="#ffffff"
      />

      {/* Two small strips read as specular streaks on anything glossy. Cheap
          detail, disproportionate payoff on a product shot. */}
      <Lightformer
        form="rect"
        intensity={4}
        position={[-2, 3, 3]}
        rotation={[Math.PI / 2.4, 0, 0]}
        scale={[3, 0.4, 1]}
      />
      <Lightformer
        form="rect"
        intensity={3}
        position={[2.5, 3, 2]}
        rotation={[Math.PI / 2.4, 0, 0]}
        scale={[2, 0.3, 1]}
      />
    </Environment>
  );
}
