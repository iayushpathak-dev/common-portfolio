import type { Project } from "@/content/types"

export const fitpassCorporatePwa: Project = {
  id: "project-fitpass-corporate-pwa",
  slug: "fitpass-corporate-pwa",
  contentType: "project",
  title: "Fitpass Corporate PWA",
  aka: "Partners Studio",
  summary:
    "Partners Studio, a React Progressive Web App used by 20+ corporate clients, with offline support powered by service workers.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Web App", "PWA"],
  tags: ["React.js", "PWA", "Service Workers", "Offline Support"],
  stack: ["React.js", "JavaScript", "Service Workers", "Web App Manifest"],
  featured: true,
  visual: { kind: "icon", icon: "smartphone" },
  updatedAt: "2026-10-18",
  sections: {
    problem: null,
    challenge:
      "Offline support means deciding what to cache, when to refresh it, and how to ship new versions without leaving users on stale code.",
    contribution:
      "I shipped Partners Studio as a React PWA, including the offline support built on service workers.",
    architecture: `The confirmed building blocks are a React single-page application, a service worker and the browser cache:

\`\`\`text
Browser
 ├─ React app (UI, routing, state)
 ├─ Service worker ──► Cache Storage (app shell and assets)
 └─ Network ───────► Fitpass APIs
\`\`\`

The service worker sits between the app and the network, so it can serve cached assets when the network fails.`,
    decisions: null,
    tradeoffs: `- **PWA vs native app:** a PWA ships through one web codebase and updates instantly, but has less access to device APIs and weaker install prompts on iOS.
- **Caching strategy:** cache-first is fast for static assets; network-first suits data that must be fresh; stale-while-revalidate balances both for semi-static data.
- **Service worker updates:** activating a new worker immediately can mix old and new assets in an open tab; waiting for all tabs to close is safer but slower to roll out.`,
    limitations: null,
    impact: "Used by 20+ corporate clients.",
    lessons: null,
  },
  relatedArticles: [],
  todos: [
    "What problem did Partners Studio solve, and why was a PWA chosen over a native app?",
    "Who uses Partners Studio day to day, and what are its main features?",
    "Which caching strategies and tooling (for example Workbox) were used?",
    "Any challenges, limitations or lessons learned worth sharing.",
  ],
}
