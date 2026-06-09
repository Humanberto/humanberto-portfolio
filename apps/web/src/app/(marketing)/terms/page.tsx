import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@humanberto/ui";
import { PublishedBuilderPage } from "@/components/page-builder/published-builder-page";
import { requireBootstrapPage } from "@/lib/site-visibility.server";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for humanberto.com and related products by Roberto Pocas Leitao.",
};

export default async function TermsPage() {
  await requireBootstrapPage("page.terms");
  const built = await PublishedBuilderPage({ pageId: "terms" });
  if (built) return built;
  return (
    <div className="pt-32 pb-20">
      <Container className="max-w-3xl prose prose-invert prose-headings:font-display">
        <Link href="/" className="text-sm text-muted hover:text-fg no-underline">
          ← Home
        </Link>
        <h1 className="mt-8 font-display text-4xl font-light">Terms of Use</h1>
        <p className="text-muted">Last updated: June 2026</p>

        <h2>Agreement</h2>
        <p>
          By using humanberto.com and related products operated by Roberto Pocas Leitao
          (&quot;Humanberto,&quot; &quot;we,&quot; &quot;us&quot;), you agree to these terms. If you do not agree,
          do not use the services.
        </p>

        <h2>Proprietary software</h2>
        <p>
          Unless explicitly stated otherwise, all software, designs, copy, and assets are
          proprietary and confidential. You may not copy, reverse engineer, scrape, or
          redistribute our code or products without written permission.
        </p>

        <h2>Portfolio and demos</h2>
        <p>
          Case studies and demos are provided for evaluation only. Demo access does not
          grant a license to reproduce or commercialize our work.
        </p>

        <h2>AI advocate</h2>
        <p>
          The AI advocate provides informational responses based on configured facts. It is
          not professional, legal, medical, or hiring advice. Do not rely on it as a sole
          basis for decisions.
        </p>

        <h2>Acceptable use</h2>
        <p>
          You agree not to abuse, probe, or attempt unauthorized access to our systems; upload
          unlawful content; or use the services to harm others.
        </p>

        <h2>Disclaimer</h2>
        <p>
          Services are provided &quot;as is&quot; without warranties. We are not liable for indirect
          or consequential damages to the extent permitted by law.
        </p>

        <h2>Contact</h2>
        <p>
          Questions:{" "}
          <a href="mailto:humanberto@gmail.com" className="text-gold-bright">
            humanberto@gmail.com
          </a>
        </p>
      </Container>
    </div>
  );
}
