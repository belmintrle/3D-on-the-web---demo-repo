"use client";

import { useEffect, useState } from "react";

// DEVICE TIERING — and the reason this is hand-rolled rather than drei's
// useDetectGPU, which is the thing every tutorial reaches for.
//
// Here is the trap, and it's worth saying on stream because it is subtle and
// everybody walks into it:
//
//   import { useDetectGPU } from "@react-three/drei";   // <- in your PAGE
//   const gpu = useDetectGPU();
//   if (gpu.tier < 2) return <ProductStill />;          // "saved the bytes!"
//
// You did not save the bytes. To call that hook you imported drei, so drei —
// and three, and R3F — are already in the bundle you just shipped to the phone
// you were trying to protect. The gate has to run BEFORE anything 3D is
// imported, which means it cannot come from a 3D library.
//
// So: zero dependencies, a handful of browser signals, and it runs in the
// page. Once you've decided you ARE loading the scene, drei's useDetectGPU is
// the right tool to pick quality settings inside it — it's a much better
// benchmark than this. Two different jobs.
//
// Returns null on the server and on the first client render, because every
// signal below is browser-only and guessing would cause a hydration mismatch.

export function useDeviceTier() {
  const [tier, setTier] = useState(null);

  useEffect(() => {
    const nav = navigator;
    const reasons = [];

    // Explicit user request. Non-negotiable, overrides everything.
    const saveData = Boolean(nav.connection?.saveData);
    if (saveData) reasons.push("save-data is on");

    // Chromium-only, undefined elsewhere — treat undefined as "no signal",
    // never as "bad", or you downgrade every Safari user by accident.
    const memory = nav.deviceMemory;
    const cores = nav.hardwareConcurrency;
    const coarse =
      typeof matchMedia === "function" &&
      matchMedia("(pointer: coarse)").matches;
    const slowNetwork = ["slow-2g", "2g", "3g"].includes(
      nav.connection?.effectiveType
    );

    let score = 3;
    if (coarse) {
      score -= 1;
      reasons.push("touch device");
    }
    if (memory !== undefined && memory <= 4) {
      score -= 1;
      reasons.push(`${memory}GB memory`);
    }
    if (cores !== undefined && cores <= 4) {
      score -= 1;
      reasons.push(`${cores} cores`);
    }
    if (slowNetwork) {
      score -= 1;
      reasons.push(`${nav.connection.effectiveType} connection`);
    }
    if (saveData) score = 0;

    setTier({
      tier: Math.max(0, Math.min(3, score)),
      reasons,
      saveData,
      isTouch: coarse,
      memory,
      cores,
      effectiveType: nav.connection?.effectiveType,
    });
  }, []);

  return tier;
}
