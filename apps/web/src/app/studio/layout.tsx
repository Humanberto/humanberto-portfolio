import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { LivingBackground } from "@/components/living-background";
import { LauncherGate } from "@/components/site/launcher-gate";

export default function StudioMarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <LivingBackground />
      <Nav />
      <div className="relative z-10">{children}</div>
      <Footer />
      <LauncherGate />
    </>
  );
}
