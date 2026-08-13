"use client";

// THE PRODUCT — whichever one we can actually deliver.
//
// Read the JSX at the bottom out loud on stream; it is the whole thesis of
// the session in five lines:
//
//   <ModelBoundary fallback={procedural}>      // it broke   -> primitives
//     <Suspense fallback={procedural}>         // it's slow  -> primitives
//       <GltfProduct />                        // it worked  -> the real thing
//     </Suspense>
//   </ModelBoundary>
//
// Note what the fallback ISN'T: a spinner. The user sees a product the entire
// time. A fallback that is a smaller version of the real thing beats a
// fallback that is a loading state, every time.

import { Component, Suspense } from "react";
import { GltfProduct } from "./GltfProduct";
import { ProceduralSneaker } from "./ProceduralSneaker";

// Suspense catches "still loading". It does not catch "404" or "that GLB is
// corrupt" — those throw, and an uncaught throw inside <Canvas> takes the
// whole canvas down and leaves a black rectangle. This is the difference
// between a graceful fallback and a broken page.
class ModelBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // Deliberately quiet in the UI, loud in the console. The user should not
    // find out that your model 404'd; you should.
    console.warn("[Product] model failed, falling back to primitives:", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function Product({
  useModel = false,
  colorway = "crimson",
  spin = false,
  ...props
}) {
  const fallback = (
    <ProceduralSneaker colorway={colorway} spin={spin} {...props} />
  );

  if (!useModel) return fallback;

  return (
    <ModelBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <GltfProduct {...props} />
      </Suspense>
    </ModelBoundary>
  );
}
