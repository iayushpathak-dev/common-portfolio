/** Canonical origin used for metadata, sitemap, structured data and RAG source links. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ayushpathak.co.in").replace(/\/+$/, "")

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
