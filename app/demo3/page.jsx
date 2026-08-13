"use client";

// BEAT C — staging and light. Backup for section 6 of the script.
// The "grey plastic in a car park" reveal is the first toggle.

import { useState } from "react";
import { ProductViewer } from "../components/three/ProductViewer";
import {
  Bar,
  Btn,
  Code,
  Frame,
  Label,
  Page,
  Say,
  Section,
  Toggle,
  Warn,
} from "../components/demo/kit";

const ENVIRONMENTS = {
  none: {
    label: "two lights",
    say: "This is the moment everybody hits. The geometry is correct, the materials are correct, and it looks like grey plastic in a car park. It is not a modelling problem — it's a reflection problem. There is nothing in the world for this surface to reflect.",
  },
  declarative: {
    label: "<Environment> + Lightformers",
    say: "Built, not downloaded. Six emissive planes rendered to a 256px cube map once, on mount. Zero network. Full control over where the highlights land — and it's how a lot of genuinely polished product pages do it.",
  },
  preset: {
    label: 'preset="city" (CDN)',
    say: "One line, and an HDRI — a photograph of a real place in every direction. Every reflective surface is now reflecting an actual room instead of nothing. This is the single highest-ratio line of code in 3D on the web. It is also a request to someone else's server. Read the warning.",
  },
};

export default function Demo3() {
  return (
    <Page time="0:24 – 0:32 · Beat C" title="Why your model looks like grey plastic">
      <Lighting />
      <Shadows />
      <StageNotes />
    </Page>
  );
}

// ------------------------------------------------------------------ C1

function Lighting() {
  const [env, setEnv] = useState("none");
  const [compare, setCompare] = useState(false);

  return (
    <Section n="C1" title="Environment maps — one line, most of the difference">
      <Bar>
        {Object.entries(ENVIRONMENTS).map(([key, v]) => (
          <Btn key={key} active={env === key} onClick={() => setEnv(key)}>
            {v.label}
          </Btn>
        ))}
        <Toggle checked={compare} onChange={setCompare}>
          side by side
        </Toggle>
      </Bar>

      {compare ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Label>Before — two lights, no environment</Label>
            <Frame>
              <ProductViewer environment="none" shadows="contact" demand={false} />
            </Frame>
          </div>
          <div>
            <Label>After — a world to reflect</Label>
            <Frame>
              <ProductViewer
                environment="declarative"
                shadows="contact"
                demand={false}
              />
            </Frame>
          </div>
        </div>
      ) : (
        <Frame>
          <ProductViewer
            key={env}
            environment={env}
            shadows="contact"
            demand={false}
          />
        </Frame>
      )}

      <div className="mt-6">
        <Code
          highlight={env === "preset" ? 'preset="city"' : undefined}
        >
          {env === "none"
            ? `<ambientLight intensity={0.4} />
<directionalLight position={[5, 5, 5]} intensity={2.2} />`
            : env === "preset"
              ? `<Environment preset="city" />`
              : `<Environment resolution={256}>
  <Lightformer form="rect" intensity={3}   position={[0, 4, -6]}  scale={[12, 8, 1]} />
  <Lightformer form="rect" intensity={1.1} position={[-6, 1.5, 2]} scale={[10, 4, 1]} color="#bfdbfe" />
  <Lightformer form="rect" intensity={2.2} position={[5, 2.5, -3]} scale={[6, 4, 1]}  color="#fed7aa" />
</Environment>`}
        </Code>
      </div>

      <Say>{ENVIRONMENTS[env].say}</Say>

      {env === "preset" && (
        <Warn>
          <strong>Here&apos;s where you correct the internet.</strong> Every
          tutorial and every AI reaches for <code>preset</code>. drei&apos;s own
          documentation says, verbatim: “<em>preset property is not meant to be
          used in production environments and may fail as it relies on CDNs.</em>”
          That&apos;s a request to a GitHub-hosted HDRI on someone else&apos;s
          infrastructure, sitting on your users&apos; critical path. In
          production you self-host it — and an HDRI is a real download, 1–2MB
          for a 1K HDR, which for a lot of pages is bigger than the model.
        </Warn>
      )}

      {env === "preset" && (
        <div className="mt-4">
          <Label>The production version</Label>
          <Code highlight="suspend(city)">
            {`// npm i @pmndrs/assets
import { suspend } from "suspend-react";
const city = import("@pmndrs/assets/hdri/city.exr").then((m) => m.default);

<Environment files={suspend(city)} />   // dynamic import — not in your main bundle`}
          </Code>
        </div>
      )}
    </Section>
  );
}

// ------------------------------------------------------------------ C2

function Shadows() {
  const [shadows, setShadows] = useState("contact");

  return (
    <Section n="C2" title="Shadows — the cheap one and the expensive one">
      <Bar>
        <Btn active={shadows === "none"} onClick={() => setShadows("none")}>
          none
        </Btn>
        <Btn active={shadows === "contact"} onClick={() => setShadows("contact")}>
          ContactShadows
        </Btn>
      </Bar>

      <Frame>
        <ProductViewer
          key={shadows}
          environment="declarative"
          shadows={shadows}
          demand={false}
        />
      </Frame>

      <div className="mt-6 overflow-hidden rounded-xl border border-neutral-900">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900/60 text-left text-xs uppercase tracking-widest text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-normal">Technique</th>
              <th className="px-4 py-3 font-normal">Cost</th>
              <th className="px-4 py-3 font-normal">Use when</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900 text-neutral-300">
            <tr>
              <td className="px-4 py-3 font-mono text-xs">&lt;ContactShadows /&gt;</td>
              <td className="px-4 py-3 text-emerald-300">
                cheap — one render to a texture
              </td>
              <td className="px-4 py-3 text-neutral-400">almost always</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs">
                &lt;AccumulativeShadows /&gt;
              </td>
              <td className="px-4 py-3 text-amber-300">
                expensive up front, free after
              </td>
              <td className="px-4 py-3 text-neutral-400">
                static scene, hero shot
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs">castShadow + shadow maps</td>
              <td className="px-4 py-3 text-red-300">per frame, per light</td>
              <td className="px-4 py-3 text-neutral-400">
                shadows that actually move
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Say>
        For a product on a floor, contact shadows are 95% of the perceived
        quality for a fraction of the cost. Real shadow maps mean every
        shadow-casting light re-renders the whole scene from the light&apos;s
        point of view, every frame. On a product viewer that is money spent on
        nothing.
      </Say>

      <Say>
        ⚡ And notice <code>frames={"{1}"}</code> in the source — the contact
        shadow is baked once and never recomputed while the product is still. A
        shadow re-rendering 60 times a second under a model that isn&apos;t
        moving is the most common wasted draw in an R3F scene.
      </Say>
    </Section>
  );
}

// ------------------------------------------------------------------ C3

function StageNotes() {
  return (
    <Section n="C3" title="<Stage> — a great start and a bad ending">
      <Code highlight="adjustCamera">
        {`<Stage intensity={0.5} environment="city" shadows="contact" adjustCamera>
  <Product />
</Stage>`}
      </Code>

      <Say>
        <code>&lt;Stage&gt;</code> is studio lighting, auto-centering,
        auto-framing and ground shadows in one component. For a product viewer
        it is close to correct out of the box and you should absolutely start
        here.
      </Say>

      <Say>
        <strong className="text-neutral-300">But know what it&apos;s doing</strong>
        , because it&apos;s opinionated. It <em>moves your camera</em> — that
        is <code>adjustCamera</code>, and if you&apos;re also driving the camera
        you&apos;ll fight it, so put <code>makeDefault</code> on your controls.
        It wraps your model in <code>&lt;Bounds&gt;</code> and rescales it. And
        its default <code>environment</code> is <code>&quot;city&quot;</code> —
        which means <code>&lt;Stage&gt;</code> quietly inherits the CDN problem
        from C1 unless you pass it something else.
      </Say>

      <Warn>
        That last one is worth a sentence on stream:{" "}
        <strong>
          <code>&lt;Stage&gt;</code> reaches for the CDN preset by default.
        </strong>{" "}
        If you take one thing from Beat C, it&apos;s that the convenient default
        in this ecosystem is very often a network request you didn&apos;t agree
        to.
      </Warn>

      <Say>
        The day you need the product 20% off-centre, you stop using Stage and
        compose <code>&lt;Environment&gt;</code> +{" "}
        <code>&lt;ContactShadows&gt;</code> + your own lights by hand — which is
        exactly what <code>ProductViewer.jsx</code> in this repo does, and it is
        about fifteen lines.
      </Say>
    </Section>
  );
}
