import { PageShell } from "@/components/page-shell";
import { ResumeView } from "@/components/resume/resume-view";
import { PORTFOLIO } from "@/lib/portfolio";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: PORTFOLIO.resumePage.seoTitle,
  description: PORTFOLIO.resumePage.seoDescription,
  path: "/resume",
});

export default function ResumePage() {
  return (
    <PageShell>
      <ResumeView />
    </PageShell>
  );
}
