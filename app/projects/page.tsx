import { PageShell } from "@/components/page-shell";
import { ProjectBrowser } from "@/components/projects/project-browser";
import { toProjectSummary, visibleProjects } from "@/content";
import { PORTFOLIO } from "@/lib/portfolio";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: PORTFOLIO.projectsPage.seoTitle,
  description: PORTFOLIO.projectsPage.seoDescription,
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <PageShell>
      <ProjectBrowser projects={visibleProjects().map(toProjectSummary)} />
    </PageShell>
  );
}
