import { BlogBrowser } from "@/components/blog/blog-list";
import { PageShell } from "@/components/page-shell";
import { toArticleSummary, visibleArticles } from "@/content";
import { PORTFOLIO } from "@/lib/portfolio";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: PORTFOLIO.blogPage.seoTitle,
  description: PORTFOLIO.blogPage.seoDescription,
  path: "/blog",
});

export default function BlogPage() {
  return (
    <PageShell>
      <BlogBrowser articles={visibleArticles().map(toArticleSummary)} />
    </PageShell>
  );
}
