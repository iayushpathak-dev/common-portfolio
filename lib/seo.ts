import type { Metadata } from "next"

import { PORTFOLIO } from "@/lib/portfolio"
import { absoluteUrl } from "@/lib/site"

/** Title, description, canonical URL and Open Graph/Twitter tags for one page. */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  modifiedTime,
  noIndex = false,
}: {
  title: string
  description: string
  path: string
  type?: "website" | "article" | "profile"
  publishedTime?: string
  modifiedTime?: string
  noIndex?: boolean
}): Metadata {
  const url = absoluteUrl(path)
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: PORTFOLIO.profile.name,
      locale: "en_IN",
      type,
      ...(type === "article" ? { publishedTime, modifiedTime, authors: [PORTFOLIO.profile.name] } : {}),
    },
    twitter: { card: "summary", title, description },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}

/** Serialises JSON-LD safely for a <script> tag (escapes "<" so content can't close the tag). */
export function jsonLd(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") }
}
