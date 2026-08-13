"use client";

// Shared furniture for the backup demo pages. Same design system as the motion
// session, so nothing about the presentation is new on the day.
// Projector-first: big type, high contrast, nothing subtle.

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export const PAGES = [
  { href: "/demo", key: "0", label: "Cold open", note: "the finished page" },
  { href: "/demo1", key: "1", label: "Beat A", note: "the scene graph" },
  { href: "/demo2", key: "2", label: "Beat B", note: "the model & the bytes" },
  { href: "/demo3", key: "3", label: "Beat C", note: "staging & light" },
  { href: "/demo4", key: "4", label: "Beat D", note: "interaction" },
  { href: "/demo5", key: "5", label: "Beat E", note: "shipping it" },
];

// ---------------------------------------------------------------- navigation

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const page = PAGES.find((p) => p.key === e.key);
      if (page) router.push(page.href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-900 bg-neutral-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-6 py-3">
        {PAGES.map((p) => {
          const active = pathname === p.href;
          return (
            <Link
              key={p.href}
              href={p.href}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 ${
                active
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
              }`}
            >
              <span className="mr-2 opacity-50">{p.key}</span>
              {p.label}
            </Link>
          );
        })}
        <span className="ml-auto hidden text-xs text-neutral-600 sm:block">
          press 0–5
        </span>
      </div>
    </nav>
  );
}

export function Page({ title, time, children }) {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-neutral-950 px-6 pb-32 pt-10 text-neutral-100">
        <div className="mx-auto max-w-5xl">
          <header className="mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              {time}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
          </header>
          <div className="space-y-20">{children}</div>
        </div>
      </main>
    </>
  );
}

export function Section({ n, title, children }) {
  return (
    <section>
      <h2 className="mb-6 flex items-baseline gap-3 text-xl font-semibold tracking-tight">
        <span className="text-sm font-normal text-neutral-600">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

// The line to actually say.
export function Say({ children }) {
  return (
    <p className="mt-5 border-l-2 border-neutral-800 pl-4 text-[15px] leading-relaxed text-neutral-400">
      {children}
    </p>
  );
}

// A thing that will bite them. Louder than Say on purpose.
export function Warn({ children }) {
  return (
    <p className="mt-5 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-[15px] leading-relaxed text-amber-200/90">
      {children}
    </p>
  );
}

// ---------------------------------------------------------------- code panel

export function Code({ children, highlight }) {
  const text = String(children).trim();
  const parts = highlight ? text.split(highlight) : [text];

  return (
    <pre className="overflow-x-auto rounded-xl border border-neutral-900 bg-neutral-900/60 p-4 font-mono text-[13px] leading-relaxed text-neutral-300">
      <code>
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className="rounded bg-amber-400/15 px-1 py-0.5 text-amber-200">
                {highlight}
              </span>
            )}
          </span>
        ))}
      </code>
    </pre>
  );
}

// ----------------------------------------------------------------- controls

export function Bar({ children }) {
  return <div className="mb-6 flex flex-wrap items-center gap-2">{children}</div>;
}

export function Btn({ onClick, active, children, tone = "default" }) {
  const tones = {
    default: active
      ? "bg-neutral-100 text-neutral-900"
      : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800",
    primary: "bg-neutral-100 text-neutral-900 hover:bg-white",
    danger: "bg-red-950 text-red-200 hover:bg-red-900",
  };
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3.5 py-2 text-sm transition-colors duration-150 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

export function Toggle({ checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2 rounded-lg bg-neutral-900 px-3.5 py-2 text-sm text-neutral-300 transition-colors duration-150 hover:bg-neutral-800">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-neutral-100"
      />
      {children}
    </label>
  );
}

export function Slider({ label, value, onChange, min, max, step = 1, suffix = "" }) {
  return (
    <label className="flex items-center gap-3 rounded-lg bg-neutral-900 px-3.5 py-2 text-sm text-neutral-300">
      <span className="w-24 shrink-0 text-neutral-500">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-36 accent-neutral-100"
      />
      <span className="w-16 shrink-0 text-right font-mono text-xs text-neutral-400">
        {value}
        {suffix}
      </span>
    </label>
  );
}

export function Label({ children }) {
  return (
    <p className="mb-2 text-xs uppercase tracking-widest text-neutral-500">
      {children}
    </p>
  );
}

// A fixed-aspect box for anything that will later contain a canvas. Reserving
// the space is not decoration — a canvas that appears without it is a CLS hit,
// and CLS is in the FE-10 audit.
export function Frame({ children, className = "" }) {
  return (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-neutral-900 bg-neutral-900/40 ${className}`}
    >
      {children}
    </div>
  );
}

// ------------------------------------------------------------------- hooks

// Lives in app/lib so the production components never have to import from the
// demo kit. Re-exported here purely for convenience on the demo pages.
export { useInView } from "../../lib/useInView";

// Reads the OS setting. Beat E: no auto-rotation, no float, under reduce.
export function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}
