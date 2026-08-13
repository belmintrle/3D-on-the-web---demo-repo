"use client";

import { useEffect, useRef, useState } from "react";

// Beat E. Don't mount the canvas until it's nearly on screen.
// `rootMargin` starts it a beat early so it doesn't pop in as you arrive.
export function useInView({ rootMargin = "200px", once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || (once && inView)) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, once, inView]);

  return [ref, inView];
}
