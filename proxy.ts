import { NextResponse, type NextRequest } from "next/server";

import { ARTICLES, hasPage, PROJECTS } from "@/content";

// Unknown slugs under /blog and /projects render on demand and stream, so a notFound() in the
// page would arrive after a 200 status. Checking here first returns a real 404 for unknown,
// draft (in production) and planned slugs.
const PUBLIC_PATHS = new Set([
  ...PROJECTS.filter(hasPage).map((p) => `/projects/${p.slug}`),
  ...ARTICLES.filter(hasPage).map((a) => `/blog/${a.slug}`),
]);

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/\/+$/, "");
  if (PUBLIC_PATHS.has(path)) return NextResponse.next();
  // A path with no matching route renders the not-found page with a 404 status.
  return NextResponse.rewrite(new URL("/_content-not-found", request.url));
}

export const config = {
  matcher: ["/blog/:slug", "/projects/:slug"],
};
