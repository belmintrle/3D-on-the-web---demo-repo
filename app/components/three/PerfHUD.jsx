"use client";

// THE NUMBERS. Read straight off the WebGL renderer — `gl.info` is built into
// three.js and costs nothing. You do not need a dependency for this.
//
// (r3f-perf is the off-the-shelf version and it's good, but check its release
// date before you install it — as of this session it hadn't been published in
// about two years, which against R3F v9 and React 19 is a real gamble. Reading
// six numbers yourself is twenty lines and teaches you what they mean.)

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";

export const BUDGET = {
  calls: { good: 20, limit: 50, label: "Draw calls" },
  triangles: { good: 60000, limit: 150000, label: "Triangles" },
  textures: { good: 6, limit: 10, label: "Textures" },
  programs: { good: 8, limit: 15, label: "Programs" },
  fps: { good: 55, limit: 45, label: "FPS", higherIsBetter: true },
};

// Lives INSIDE <Canvas>. Samples twice a second — not every frame, because a
// HUD that re-renders 60x/second is measuring itself.
export function PerfProbe({ onSample, interval = 500 }) {
  const { gl } = useThree();
  const frames = useRef(0);
  const last = useRef(performance.now());

  useFrame(() => {
    frames.current += 1;
    const now = performance.now();
    const elapsed = now - last.current;
    if (elapsed < interval) return;

    onSample({
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
      programs: gl.info.programs?.length ?? 0,
      fps: Math.round((frames.current * 1000) / elapsed),
    });

    frames.current = 0;
    last.current = now;
  });

  return null;
}

function verdict(key, value) {
  const b = BUDGET[key];
  if (!b) return "ok";
  if (b.higherIsBetter) {
    if (value >= b.good) return "good";
    return value >= b.limit ? "ok" : "over";
  }
  if (value <= b.good) return "good";
  return value <= b.limit ? "ok" : "over";
}

const TONE = {
  good: "text-emerald-300",
  ok: "text-amber-300",
  over: "text-red-300",
};

// Lives OUTSIDE <Canvas>. Plain DOM.
export function PerfReadout({ sample, className = "" }) {
  if (!sample) {
    return (
      <div className={`font-mono text-xs text-neutral-600 ${className}`}>
        waiting for the first frame…
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3 ${className}`}>
      {Object.keys(BUDGET).map((key) => {
        const b = BUDGET[key];
        const value = sample[key] ?? 0;
        const state = verdict(key, value);
        return (
          <div key={key} className="flex items-baseline justify-between gap-3">
            <span className="text-xs text-neutral-500">{b.label}</span>
            <span className={`font-mono text-sm tabular-nums ${TONE[state]}`}>
              {value.toLocaleString()}
              <span className="ml-1.5 text-[10px] text-neutral-600">
                /{b.higherIsBetter ? "≥" : "≤"}
                {b.limit.toLocaleString()}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
