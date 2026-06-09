import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@humanberto/ui";
import { PublishedBuilderPage } from "@/components/page-builder/published-builder-page";
import { requireBootstrapPage } from "@/lib/site-visibility.server";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for humanberto.com and related products.",
};

export default async function PrivacyPage() {
  await requireBootstrapPage("page.privacy");
  const built = await PublishedBuilderPage({ pageId: "privacy" });
  if (built) return built;
  return (
    <div className="pt-32 pb-20">
      <Container className="max-w-3xl prose prose-invert prose-headings:font-display">
        <Link href="/" className="text-sm text-muted hover:text-fg no-underline">
          ← Home
        </Link>
        <h1 className="mt-8 font-display text-4xl font-light">Privacy Policy</h1>
        <p className="text-muted">Last updated: June 2026</p>

        <h2>Overview</h2>
        <p>
          Roberto Pocas Leitao (&quot;Humanberto&quot;) respects your privacy. This policy describes
          what we collect on humanberto.com and related product demos.
        </p>

        <h2>Information we collect</h2>
        <ul>
          <li>Contact details you submit (name, email) for demos, waitlists, or inquiries</li>
          <li>Account credentials for gated product access (stored securely via Supabase Auth)</li>
          <li>Research questionnaire responses you choose to provide</li>
          <li>Chat messages sent to the AI advocate (for service delivery and improvement)</li>
          <li>Standard analytics and server logs (IP, browser, pages visited)</li>
        </ul>

        <h2>How we use information</h2>
        <ul>
          <li>Provide and improve our portfolio, demos, and products</li>
          <li>Respond to inquiries and schedule follow-ups you request</li>
          <li>Secure access to private beta features</li>
          <li>Understand user needs for product research and development</li>
        </ul>

        <h2>Sharing</h2>
        <p>
          We do not sell personal data. We use infrastructure providers (e.g. Vercel, Supabase,
          email/LLM providers) who process data on our behalf under their terms.
        </p>

        <h2>Retention</h2>
        <p>
          We retain data as long as needed for the purposes above or as required by law. You may
          request deletion by emailing humanberto@gmail.com.
        </p>

        <h2>Contact</h2>
        <p>
          Privacy questions:{" "}
          <a href="mailto:humanberto@gmail.com" className="text-gold-bright">
            humanberto@gmail.com
          </a>
        </p>
      </Container>
    </div>
  );
}
