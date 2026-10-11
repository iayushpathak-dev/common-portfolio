import { PORTFOLIO } from "@/lib/portfolio"

const { pages } = PORTFOLIO

export type NavPage = (typeof pages)[keyof typeof pages]

/** Header links; the AI Assistant pill is rendered separately. */
export const headerLinks = [pages.home, pages.about, pages.projects, pages.experience, pages.blog]

/** Tablet icon rail. */
export const railLinks = [pages.assistant, pages.about, pages.projects, pages.experience, pages.blog, pages.resume]

/** Mobile bottom bar; everything else goes in its "More" sheet. */
export const bottomLinks = [pages.home, pages.projects, pages.assistant, pages.experience]
export const moreLinks = [pages.about, pages.blog, pages.resume]

/**
 * Home and AI Assistant share "/". The assistant represents that page, so Home is never
 * highlighted.
 */
export function isActive(page: NavPage, pathname: string) {
  if (page === pages.home) return false
  return page.href === "/" ? pathname === "/" : pathname.startsWith(page.href)
}

/** Link that opens the AI assistant and asks it the given question in a new chat. */
export function askAssistantHref(question: string) {
  return `${pages.assistant.href}?ask=${encodeURIComponent(question)}`
}
