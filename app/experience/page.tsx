import type { Metadata } from "next";
import { Briefcase } from "lucide-react";

import { ExperienceTimeline } from "@/components/experience-timeline";
import { PageShell } from "@/components/page-shell";
import { card, PageIntro } from "@/components/page-ui";
import { PORTFOLIO } from "@/lib/portfolio";

const { experiencePage: copy } = PORTFOLIO;

export const metadata: Metadata = {
  title: copy.seoTitle,
  description: copy.seoDescription,
};

export default function ExperiencePage() {
  return (
    <PageShell className="flex max-w-6xl flex-col gap-4">
      <PageIntro icon={Briefcase} title={copy.title} subtitle={copy.subtitle} description={copy.description} />
      <section className={card}>
        <ExperienceTimeline
          technologiesTitle={copy.technologiesTitle}
          responsibilitiesTitle={copy.responsibilitiesTitle}
          educationTitle={copy.educationTitle}
        />
      </section>
    </PageShell>
  );
}
