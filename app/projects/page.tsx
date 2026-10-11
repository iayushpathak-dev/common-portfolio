import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import { ProjectBrowser } from "@/components/projects/project-browser";
import { PORTFOLIO } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: PORTFOLIO.projectsPage.seoTitle,
  description: PORTFOLIO.projectsPage.seoDescription,
};

export default function ProjectsPage() {
  return (
    <PageShell>
      <ProjectBrowser />
    </PageShell>
  );
}
