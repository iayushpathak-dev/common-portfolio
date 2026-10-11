import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import { ResumeView } from "@/components/resume/resume-view";
import { PORTFOLIO } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: PORTFOLIO.resumePage.seoTitle,
  description: PORTFOLIO.resumePage.seoDescription,
};

export default function ResumePage() {
  return (
    <PageShell>
      <ResumeView />
    </PageShell>
  );
}
