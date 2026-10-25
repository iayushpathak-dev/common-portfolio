import { HomeView } from "@/components/home/home-view";
import { PageShell } from "@/components/page-shell";
import { PORTFOLIO } from "@/lib/portfolio";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

const { profile, seo, experience } = PORTFOLIO;

export const metadata = pageMetadata({ title: seo.title, description: seo.description, path: "/", type: "profile" });

export default function HomePage() {
  return (
    <PageShell sidebar={false}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "Person",
          name: profile.name,
          jobTitle: profile.role,
          url: absoluteUrl("/"),
          worksFor: { "@type": "Organization", name: experience[0].company },
          sameAs: [profile.contact.linkedin, profile.contact.github],
          knowsAbout: ["React.js", "Next.js", "TypeScript", "Frontend Architecture", "Performance Optimization", "RAG"],
        })}
      />
      <HomeView />
    </PageShell>
  );
}
