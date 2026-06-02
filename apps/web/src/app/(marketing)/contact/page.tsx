import type { Metadata } from "next";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Container,
  GradientText,
  SectionHeading,
} from "@humanberto/ui";
import { CalBooking } from "@/components/contact/cal-booking";
import { fitCheckHref, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name} - email, LinkedIn, or book an intro call.`,
};

export default function ContactPage() {
  return (
    <div className="pt-32 pb-10">
      <Container className="max-w-4xl">
        <Badge>Contact</Badge>
        <h1 className="mt-6 font-display text-4xl font-light leading-tight sm:text-5xl">
          Let&apos;s <GradientText>get this party started</GradientText>.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          Hiring, scoping a project, or just curious? Reach out directly, or let
          my AI advocate make the case first.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <ContactCard
            label="Email"
            value={site.email}
            href={`mailto:${site.email}`}
          />
          <ContactCard
            label="LinkedIn"
            value="Connect with me"
            href={site.linkedin}
          />
          <ContactCard
            label="Phone"
            value={site.phone}
            href={`tel:${site.phone.replace(/[^\d]/g, "")}`}
          />
        </div>

        <section className="mt-16">
          <SectionHeading
            eyebrow="Schedule"
            title="Grab a time that works"
          />
          <div className="mt-8">
            <CalBooking />
          </div>
        </section>

        <Card className="mt-12 p-8 text-center">
          <h2 className="font-display text-2xl font-light">
            Prefer to ask questions first?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            Not ready to book yet? Upload a job description for an honest fit
            score, or chat with my AI advocate first.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={fitCheckHref}>
              <Button>Score my fit</Button>
            </Link>
            <Link href="/chat">
              <Button variant="outline">Talk to my advocate</Button>
            </Link>
          </div>
        </Card>
      </Container>
    </div>
  );
}

function ContactCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="group">
      <Card className="h-full p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-faint">{label}</p>
        <p className="mt-3 text-lg text-fg group-hover:text-gold-bright">
          {value}
        </p>
      </Card>
    </a>
  );
}
