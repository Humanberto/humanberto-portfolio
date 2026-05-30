"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LivingScene = dynamic(
  () => import("./scene").then((m) => m.LivingScene),
  { ssr: false },
);

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * The signature "living" background: a slow, thick deep-purple liquid with
 * suspended gold dust and organic gold circuit/lightning veins.
 *
 * Falls back to a static gold-dust gradient when the user prefers reduced
 * motion or WebGL is unavailable. Pauses rendering when the tab is hidden.
 */
export function LivingBackground({ intensity = 1 }: { intensity?: number }) {
  const [live, setLive] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const force = new URLSearchParams(window.location.search).has("forcebg");
    if (force || (!reduce && hasWebGL())) setLive(true);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink"
    >
      <StaticBackdrop />
      {live ? <LivingScene intensity={intensity} /> : null}
      {/* Readability scrim: deepens edges + top (under nav) so content stays legible. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,6,16,0.72) 0%, rgba(11,6,16,0.32) 18%, rgba(11,6,16,0.22) 50%, rgba(11,6,16,0.45) 100%)," +
            "radial-gradient(120% 80% at 50% 40%, transparent 55%, rgba(11,6,16,0.6) 100%)",
        }}
      />
    </div>
  );
}

/** Pure-CSS fallback / load-time backdrop. */
function StaticBackdrop() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(60% 50% at 20% 15%, rgba(123,63,228,0.22), transparent 70%)," +
          "radial-gradient(50% 45% at 85% 80%, rgba(201,162,39,0.16), transparent 70%)," +
          "radial-gradient(80% 70% at 50% 50%, rgba(42,14,69,0.5), transparent 80%)," +
          "#0b0610",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(rgba(244,228,166,0.9) 0.5px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />
    </div>
  );
}
