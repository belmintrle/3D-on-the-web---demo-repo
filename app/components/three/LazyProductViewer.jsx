"use client";

// THE SHIPPING WRAPPER. Three gates, in this order, and the order matters:
//
//   1. Is this device allowed 3D at all?   -> runs first, imports nothing 3D
//   2. Is the viewer anywhere near screen? -> IntersectionObserver
//   3. Only then: fetch the chunk.         -> next/dynamic, ssr:false
//
// If a user on a cheap Android never scrolls to the viewer, this component
// downloads exactly zero bytes of three.js. That's the whole point.

import dynamic from "next/dynamic";
import { useDeviceTier } from "../../lib/useDeviceTier";
import { useInView } from "../../lib/useInView";
import { ProductStill } from "./ProductStill";

// ssr:false is not optional. There is no WebGL context on the server and
// three.js touches `window` on import — it will throw during SSR.
//
// `loading` is the static product at the same aspect ratio, so the box is
// never empty and the layout never shifts. The image is what gets measured
// as LCP; the 3D isn't racing it, it isn't in the race.
const ProductViewer = dynamic(() => import("./ProductViewer"), {
  ssr: false,
  loading: () => <ProductStill label="Loading viewer…" />,
});

export function LazyProductViewer({
  minTier = 2,
  force = null, // true/false to override the gate on the demo pages
  reduceMotion = false,
  className = "aspect-[4/3]",
  debug = false,
  ...viewerProps
}) {
  const [ref, inView] = useInView({ rootMargin: "200px" });
  const device = useDeviceTier();

  // device === null means "first render / server" — never guess, just show
  // the still. It's what we'd show anyway if the answer turns out to be no.
  const allowedByDevice = device ? device.tier >= minTier : false;
  const allowed = force === null ? allowedByDevice : force;

  const decision = !device
    ? "measuring device…"
    : !allowed
      ? `tier ${device.tier} → static image${
          device.reasons.length ? ` (${device.reasons.join(", ")})` : ""
        }`
      : !inView
        ? "in budget, waiting until it's on screen"
        : "loading the viewer";

  return (
    <div
      ref={ref}
      // Reserve the space. A canvas that appears later without a reserved box
      // is a CLS hit, and CLS is in the FE-10 audit.
      className={`relative w-full overflow-hidden rounded-xl border border-neutral-900 bg-neutral-900/40 ${className}`}
    >
      {allowed && inView ? (
        <ProductViewer {...viewerProps} spin={viewerProps.spin && !reduceMotion} />
      ) : (
        <ProductStill
          label={allowed ? "Waiting to scroll into view" : "Static fallback"}
        />
      )}

      {debug && (
        <span className="absolute right-3 top-3 rounded-md bg-neutral-950/80 px-2 py-1 font-mono text-[11px] text-neutral-400 backdrop-blur">
          {decision}
        </span>
      )}
    </div>
  );
}
