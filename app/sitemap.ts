import type { MetadataRoute } from "next";

import { articleHref, projectHref, publishedArticles, publishedProjects } from "@/content";
import { absoluteUrl } from "@/lib/site";

// Only published content is listed; drafts and planned topics never appear here.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/about", "/projects", "/experience", "/blog", "/resume", "/assistant"].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.8,
  }));

  return [
    ...pages,
    ...publishedProjects().map((p) => ({ url: absoluteUrl(projectHref(p.slug)), lastModified: p.updatedAt, priority: 0.7 })),
    ...publishedArticles().map((a) => ({ url: absoluteUrl(articleHref(a.slug)), lastModified: a.updatedAt, priority: 0.7 })),
  ];
}
