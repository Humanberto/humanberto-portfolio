import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { LivingBackground } from "@/components/living-background";
import { LauncherGate } from "@/components/site/launcher-gate";
import { SiteVisibilityProvider } from "@/components/site-visibility/provider";
import { getBootstrapVisibility } from "@/lib/site-visibility.server";

export default async function StudioMarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const visibility = await getBootstrapVisibility();

  return (
    <SiteVisibilityProvider value={visibility}>
      <LivingBackground />
      <Nav />
      <div className="relative z-10">{children}</div>
      <Footer />
      <LauncherGate />
    </SiteVisibilityProvider>
  );
}
