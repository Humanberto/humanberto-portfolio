/**
 * Static site background — purple/gold gradients + gold dust texture.
 * The animated WebGL "living" scene is disabled for performance and consistency.
 */
export function LivingBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink"
    >
      <StaticBackdrop />
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
