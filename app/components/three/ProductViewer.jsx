"use client";

// THE VIEWER. This is the destination — everything Beats A–E build up to.
//
// It is deliberately prop-driven so the demo pages can turn each guardrail off
// and show you what it was doing. The DEFAULTS are the production settings:
// every prop below is already correct if you render <ProductViewer /> bare.

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  AdaptiveDpr,
  ContactShadows,
  Environment,
  OrbitControls,
  Preload,
  PresentationControls,
} from "@react-three/drei";
import { Product } from "./Product";
import { StudioEnvironment } from "./StudioEnvironment";
import { PerfProbe } from "./PerfHUD";

export function ProductViewer({
  // --- the guardrails (all default to the safe setting) ---
  dprCap = 1.5,
  demand = true,
  antialias = false,
  preload = true,
  adaptiveDpr = false,

  // --- the scene ---
  environment = "declarative", // "declarative" | "preset" | "none"
  shadows = "contact", // "contact" | "none"
  controls = "orbit", // "orbit" | "presentation" | "none"
  constrained = true,

  // --- the product ---
  useModel = false,
  colorway = "crimson",
  spin = false,

  onSample,
  className = "",
}) {
  // frameloop="demand" renders only when something asks it to, which is the
  // right default for a product that sits still. But two things genuinely need
  // a continuous loop, and turning demand on with either of them doesn't error
  // — it just silently doesn't animate, which is a miserable bug to find:
  //
  //   - auto-rotation, obviously
  //   - PresentationControls, whose snap-back is a spring. A spring needs
  //     frames after you let go, and there is nothing left to call invalidate()
  //
  // So the component works it out rather than trusting the prop.
  const needsContinuousLoop = spin || controls === "presentation";
  const frameloop = demand && !needsContinuousLoop ? "demand" : "always";

  return (
    <Canvas
      className={className}
      // A phone reports devicePixelRatio 3. Rendering WebGL at 3x is NINE
      // TIMES the pixels of 1x. You will not see it on a product viewer and
      // you will absolutely feel it. Biggest single win in this file.
      dpr={[1, dprCap]}
      gl={{ antialias, powerPreference: "high-performance" }}
      frameloop={frameloop}
      camera={{ position: [0.6, 0.8, 4.4], fov: 35 }}
      // Deliberately off. ContactShadows renders its own texture and doesn't
      // use the shadow-map system at all — enabling it here would cost you a
      // depth pass per light, every frame, for shadows nothing is reading.
      shadows={false}
    >
      {environment === "declarative" && <StudioEnvironment />}
      {/* The CDN version. Here so the demo can show it working and then show
          you the drei doc line that says not to ship it. */}
      {environment === "preset" && <Environment preset="city" />}
      {environment === "none" && (
        <>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={2.2} />
        </>
      )}

      <Suspense fallback={null}>
        <ProductStage
          controls={controls}
          constrained={constrained}
          useModel={useModel}
          colorway={colorway}
          // OrbitControls has autoRotate built in and it plays nicely with
          // damping, so let it own the spin when it's present. Otherwise the
          // model spins itself via useFrame. Never both, or it double-speeds.
          spin={controls !== "orbit" && spin}
        />
      </Suspense>

      {shadows === "contact" && (
        <ContactShadows
          position={[0, -0.46, 0]}
          opacity={0.62}
          scale={9}
          blur={2.4}
          far={2.4}
          resolution={512}
          // Bake it once when nothing is moving. A contact shadow re-rendering
          // every frame for a static product is money spent on nothing.
          frames={spin ? Infinity : 1}
        />
      )}

      {controls === "orbit" && (
        <OrbitControls
          // Tells drei's other components (Stage, Bounds) who owns the camera.
          // Without it they fight you and the camera jumps.
          makeDefault
          enableDamping
          dampingFactor={0.08}
          // Beat D: on touch, pan and zoom are how you steal the user's scroll
          // and pinch. Turn them off unless you have a reason.
          enableZoom={!constrained}
          enablePan={!constrained}
          // Stop the user zooming inside the mesh and seeing the back faces.
          minDistance={2.6}
          maxDistance={7}
          // Stop them looking at the sole from underneath.
          minPolarAngle={constrained ? Math.PI / 3.4 : 0}
          maxPolarAngle={constrained ? Math.PI / 1.95 : Math.PI}
          autoRotate={spin}
          autoRotateSpeed={0.8}
        />
      )}

      {/* Compiles shaders during the Suspense window instead of on the first
          frame the user actually looks at. Without it the scene loads, looks
          fine, then hitches for ~300ms the first time something appears. */}
      {preload && <Preload all />}

      {/* Drops resolution automatically when the framerate sags, restores it
          when things settle. Free insurance on unknown hardware. */}
      {adaptiveDpr && <AdaptiveDpr pixelated />}

      {onSample && <PerfProbe onSample={onSample} />}
    </Canvas>
  );
}

// PresentationControls has to wrap the model (it rotates the OBJECT), whereas
// OrbitControls sits beside it (it moves the CAMERA). That difference is the
// whole Beat D argument, so it's worth seeing in the tree.
function ProductStage({ controls, constrained, useModel, colorway, spin }) {
  const product = (
    <group position={[0, -0.45, 0]}>
      <Product useModel={useModel} colorway={colorway} spin={spin} />
    </group>
  );

  if (controls !== "presentation") return product;

  return (
    <PresentationControls
      // global={false} means only drags that START on the model rotate it.
      // Everything else falls through to the page, so your hero is not a
      // scroll trap.
      global={false}
      snap
      cursor
      speed={1.2}
      polar={constrained ? [-0.15, 0.35] : [-Math.PI / 2, Math.PI / 2]}
      azimuth={constrained ? [-0.7, 0.7] : [-Infinity, Infinity]}
      config={{ mass: 1, tension: 220, friction: 26 }}
    >
      {product}
    </PresentationControls>
  );
}

export default ProductViewer;
