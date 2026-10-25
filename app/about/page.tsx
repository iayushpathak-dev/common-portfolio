import { BookOpen, Briefcase, Building, CircleCheck, Heart, MapPin, Quote, Rocket, Sparkles, UserRound } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { card, SectionTitle } from "@/components/page-ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EvidenceBadge } from "@/components/content/content-badges";
import { PORTFOLIO } from "@/lib/portfolio";
import { pageMetadata } from "@/lib/seo";

const { profile, experience, aiJourney, aboutPage: copy, resumePage, hero } = PORTFOLIO;

export const metadata = pageMetadata({
  title: copy.seoTitle,
  description: copy.seoDescription,
  path: "/about",
});

export default function AboutPage() {
  return (
    <PageShell>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-4">
          <AboutHero />
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <section className={card}>
              <SectionTitle icon={BookOpen}>{copy.storyTitle}</SectionTitle>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/85">
                {copy.story.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
            <TileSection title={copy.whatIDoTitle} icon={Rocket} items={copy.whatIDo} />
          </div>
          <LearningJourney />
          <TileSection title={copy.valuesTitle} icon={Heart} items={copy.values} />
        </div>

        <aside className="flex flex-col gap-4">
          <QuickFacts />
          <figure className={card}>
            <Quote className="size-7 text-success" />
            <blockquote className="mt-2 text-sm leading-relaxed">&ldquo;{profile.quote}&rdquo;</blockquote>
            <figcaption className="mt-3 text-right text-sm text-muted-foreground">— {profile.name}</figcaption>
          </figure>
        </aside>
      </div>
    </PageShell>
  );
}

function AboutHero() {
  return (
    <section className="rounded-2xl border bg-linear-to-br from-hero-from to-hero-to p-5 lg:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary dark:text-blue-300">{copy.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight lg:text-3xl 2xl:text-4xl">
            {hero.greeting} {profile.firstName} <span aria-hidden="true">{hero.wave}</span>
          </h1>
          <p className="mt-1 text-foreground/85 lg:text-lg">{profile.role}</p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/80 2xl:text-base">{copy.intro}</p>
        </div>
        <Avatar className="size-16 shrink-0 ring-4 ring-violet-400/30 sm:size-24 2xl:size-32">
          <AvatarImage src={profile.avatar} alt={profile.name} />
          <AvatarFallback className="bg-linear-to-br from-blue-500 to-violet-500 text-lg font-semibold text-white sm:text-3xl">
            {profile.initials}
          </AvatarFallback>
        </Avatar>
      </div>
      <ul className="mt-5 flex flex-wrap gap-2 text-sm">
        <li className="flex items-center gap-2 rounded-lg border bg-card/60 px-3 py-1.5">
          <MapPin className="size-4 text-blue-500 dark:text-blue-300" /> {profile.location}
        </li>
        <li className="flex items-center gap-2 rounded-lg border bg-card/60 px-3 py-1.5">
          <Briefcase className="size-4 text-violet-500 dark:text-violet-300" /> {copy.experienceChip}
        </li>
        <li className="flex items-center gap-2 rounded-lg border bg-card/60 px-3 py-1.5">
          <span className="size-2 rounded-full bg-success" /> {copy.availability}
        </li>
      </ul>
    </section>
  );
}

function TileSection({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: readonly { title: string; text: string; icon: React.ComponentType<{ className?: string }> }[];
}) {
  return (
    <section className={card}>
      <SectionTitle icon={icon}>{title}</SectionTitle>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="flex flex-col items-center gap-2 rounded-xl border bg-background/40 p-3 text-center">
            <item.icon className="size-7 text-violet-500 dark:text-violet-300" />
            <h3 className="text-sm font-medium">{item.title}</h3>
            <p className="text-xs text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LearningJourney() {
  return (
    <section className={card}>
      <SectionTitle icon={Sparkles}>{copy.aiTitle}</SectionTitle>
      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {aiJourney.map(({ topic, status }) => (
          <li key={topic} className="flex flex-col gap-1.5 rounded-xl border bg-background/40 p-3">
            <span className="text-sm font-medium">{topic}</span>
            <EvidenceBadge label={status} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function QuickFacts() {
  const current = experience[0];
  const rows = [
    { icon: Briefcase, label: resumePage.quickInfo.experience, value: profile.totalExperience },
    { icon: UserRound, label: resumePage.quickInfo.role, value: current.role },
    { icon: Building, label: resumePage.quickInfo.company, value: current.company },
    { icon: MapPin, label: resumePage.quickInfo.location, value: profile.location },
    { icon: CircleCheck, label: copy.availableForLabel, value: copy.availableFor },
  ];

  return (
    <section className={card}>
      <SectionTitle icon={UserRound}>{copy.quickFactsTitle}</SectionTitle>
      <dl className="flex flex-col gap-3">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon className="size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-sm">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
