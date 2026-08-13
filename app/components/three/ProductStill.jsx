"use client";

// THE STATIC FALLBACK. Plain DOM, no WebGL, no three.js.
//
// This is what renders:
//   - as the next/dynamic loading state, before the 3D chunk arrives
//   - on a device useDetectGPU rates below tier 2
//   - when navigator.connection.saveData is on
//   - when the model fails outright
//
// It is deliberately the SAME ASPECT RATIO as the canvas that may replace it,
// so nothing shifts. This is drawn as inline SVG only so the starter has no
// binary assets — in your project, replace it with a real WebP export of your
// model at ~40KB and put width/height on it.

export function ProductStill({ label = "Static fallback", showLabel = true }) {
  return (
    <div className="relative h-full w-full">
      <svg
        viewBox="0 0 400 300"
        className="h-full w-full"
        role="img"
        aria-label="Product photograph"
      >
        <defs>
          <radialGradient id="ps-bg" cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="100%" stopColor="#0f0f11" />
          </radialGradient>
          <linearGradient id="ps-upper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>
          <linearGradient id="ps-sole" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fafafa" />
            <stop offset="100%" stopColor="#d4d4d8" />
          </linearGradient>
          <radialGradient id="ps-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="400" height="300" fill="url(#ps-bg)" />
        <ellipse cx="200" cy="228" rx="118" ry="16" fill="url(#ps-shadow)" />

        {/* upper */}
        <path
          d="M92 196 C88 168 96 146 118 138 C140 130 152 132 170 122
             C188 112 198 104 218 106 C244 109 258 126 268 148
             C276 166 288 176 300 182 L300 196 Z"
          fill="url(#ps-upper)"
        />
        {/* heel counter */}
        <path
          d="M92 196 C86 174 90 152 104 142 C112 136 122 138 126 148
             C131 160 128 180 130 196 Z"
          fill="#be123c"
        />
        {/* collar */}
        <path
          d="M104 142 C114 132 130 130 140 136 L134 148 C126 143 114 144 108 150 Z"
          fill="#fda4af"
        />
        {/* stripe */}
        <path
          d="M150 190 C168 170 190 154 218 146 L226 158 C200 167 180 182 165 197 Z"
          fill="#fda4af"
          opacity="0.92"
        />
        {/* laces */}
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={168 + i * 17}
            y={126 - i * 4}
            width="13"
            height="4"
            rx="2"
            fill="#fafafa"
            opacity="0.9"
            transform={`rotate(-14 ${174 + i * 17} ${128 - i * 4})`}
          />
        ))}
        {/* midsole */}
        <path
          d="M88 196 C86 208 92 216 108 218 L296 218 C306 216 310 208 306 196 Z"
          fill="url(#ps-sole)"
        />
        {/* outsole */}
        <path
          d="M90 218 L306 218 C308 226 302 231 292 231 L104 231 C94 231 88 226 90 218 Z"
          fill="#18181b"
        />
      </svg>

      {showLabel && (
        <span className="absolute bottom-3 left-3 rounded-md bg-neutral-950/75 px-2 py-1 font-mono text-[11px] text-neutral-400 backdrop-blur">
          {label}
        </span>
      )}
    </div>
  );
}
