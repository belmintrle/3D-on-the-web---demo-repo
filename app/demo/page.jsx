"use client";

// THE COLD OPEN. A product page that happens to have 3D on it.
//
// Run it in this order — it takes about 90 seconds and it's the whole argument:
//   1. Empty cache + hard reload, Network tab filtered to JS. Nothing 3D.
//   2. Scroll to the viewer. NOW the chunk arrives. Point at it.
//   3. Hit "Low-power device". Same page, same code, static image.
//   4. Run Lighthouse on mobile.

import { useState } from "react";
import { LazyProductViewer } from "../components/three/LazyProductViewer";
import { COLORWAYS } from "../components/three/ProceduralSneaker";
import { Bar, Btn, Nav, Say, Toggle } from "../components/demo/kit";

const SIZES = ["7", "7.5", "8", "8.5", "9", "9.5", "10", "11", "12"];

export default function ColdOpen() {
  const [colorway, setColorway] = useState("crimson");
  const [size, setSize] = useState("9");
  const [lowPower, setLowPower] = useState(false);
  const [debug, setDebug] = useState(true);

  return (
    <>
      <Nav />

      <main className="min-h-screen bg-neutral-950 text-neutral-100">
        {/* ------------------------------------------------ the demo controls */}
        <div className="border-b border-neutral-900 bg-neutral-950/80 px-6 py-3">
          <div className="mx-auto max-w-5xl">
            <Bar>
              <Toggle checked={lowPower} onChange={setLowPower}>
                Low-power device
              </Toggle>
              <Toggle checked={debug} onChange={setDebug}>
                Show the decision
              </Toggle>
              <span className="ml-auto text-xs text-neutral-600">
                these two are stage props — not part of the page
              </span>
            </Bar>
          </div>
        </div>

        {/* ------------------------------------------------------ above the fold */}
        <section className="mx-auto max-w-5xl px-6 pb-24 pt-20">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            New this week
          </p>
          <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[1.05] tracking-tight">
            The one you can actually run in.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-400">
            Two numbers before you scroll. The Largest Contentful Paint on this
            page is about a second. The 3D model is four megabytes. Those two
            facts are supposed to be incompatible.
          </p>

          <div className="mt-10 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-neutral-800 px-4 py-1.5 text-neutral-400">
              0 bytes of three.js until you scroll
            </span>
            <span className="rounded-full border border-neutral-800 px-4 py-1.5 text-neutral-400">
              static image on low-power devices
            </span>
            <span className="rounded-full border border-neutral-800 px-4 py-1.5 text-neutral-400">
              dpr capped at 1.5
            </span>
          </div>

          <p className="mt-16 text-sm text-neutral-600">
            ↓ keep scrolling — watch the Network tab
          </p>
        </section>

        {/* ------------------------------------------------------ the viewer */}
        <section className="mx-auto grid max-w-5xl gap-12 px-6 pb-32 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <LazyProductViewer
              force={lowPower ? false : null}
              debug={debug}
              colorway={colorway}
              controls="presentation"
              spin={false}
              className="aspect-square"
            />
            <p className="mt-3 text-xs text-neutral-600">
              Drag the shoe. Vertical drags still scroll the page — that&apos;s
              PresentationControls, not OrbitControls.
            </p>
          </div>

          <div className="pt-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Trailhead Runner
            </h2>
            <p className="mt-2 text-2xl text-neutral-300">£139</p>

            <p className="mt-6 text-[15px] leading-relaxed text-neutral-400">
              Foam midsole, rubber outsole, and an upper that took eleven meshes
              and four materials. Ten draw calls, no textures, and it weighs
              nothing because it isn&apos;t a download — it&apos;s geometry.
            </p>

            <div className="mt-8">
              <p className="mb-3 text-xs uppercase tracking-widest text-neutral-500">
                Colour
              </p>
              <div className="flex gap-2">
                {Object.entries(COLORWAYS).map(([key, c]) => (
                  <button
                    key={key}
                    onClick={() => setColorway(key)}
                    aria-label={key}
                    aria-pressed={colorway === key}
                    className={`h-9 w-9 rounded-full border-2 transition-colors duration-150 ${
                      colorway === key
                        ? "border-neutral-100"
                        : "border-neutral-800 hover:border-neutral-600"
                    }`}
                    style={{ backgroundColor: c.upper }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-3 text-xs uppercase tracking-widest text-neutral-500">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <Btn key={s} active={size === s} onClick={() => setSize(s)}>
                    {s}
                  </Btn>
                ))}
              </div>
            </div>

            <button className="mt-10 w-full rounded-xl bg-neutral-100 px-6 py-4 text-[15px] font-medium text-neutral-900 transition-colors duration-150 hover:bg-white">
              Add to bag — UK {size}
            </button>

            <p className="mt-4 text-xs text-neutral-600">
              Free returns. The 3D is optional; the checkout is not.
            </p>
          </div>
        </section>

        {/* ------------------------------------------------------ the argument */}
        <section className="border-t border-neutral-900 bg-neutral-950 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-xl font-semibold tracking-tight">
              What just happened
            </h2>

            <Say>
              The model was never on the critical path. It is not in the main
              bundle — <code>next/dynamic</code> with{" "}
              <code>ssr: false</code>. It was not requested until you scrolled
              to it — IntersectionObserver with a 200px margin. And on a device
              we rated below tier 2 it is never requested at all.
            </Say>

            <Say>
              Tick <strong className="text-neutral-300">Low-power device</strong>{" "}
              and reload. Same URL, same code, no WebGL context, no three.js
              chunk. The user gets a photograph, instantly.{" "}
              <strong className="text-neutral-300">
                That is not a failure state — it is a decision.
              </strong>{" "}
              A fast static image beats a slow 3D one every single time.
            </Say>

            <Say>
              A 3D element is the highest-leverage thing you can put in a
              capstone — it&apos;s what makes a reviewer stop scrolling. It is
              also the fastest way to ship something that scores 34 on
              Lighthouse and takes nine seconds on the phone that reviewer is
              actually holding. Same feature. The difference is entirely in the
              loading strategy.
            </Say>
          </div>
        </section>
      </main>
    </>
  );
}
