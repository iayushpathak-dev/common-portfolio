import type { Metadata } from "next";

import { BlogBrowser } from "@/components/blog/blog-list";
import { PageShell } from "@/components/page-shell";
import { PORTFOLIO } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: PORTFOLIO.blogPage.seoTitle,
  description: PORTFOLIO.blogPage.seoDescription,
};

export default function BlogPage() {
  return (
    <PageShell>
      <BlogBrowser />
    </PageShell>
  );
}
