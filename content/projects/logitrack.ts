import type { Project } from "@/content/types"

export const logitrack: Project = {
  id: "project-logitrack",
  slug: "logitrack",
  contentType: "project",
  title: "LOGITRACK",
  summary: "An IoT dashboard for live shipment tracking, built with React.js, TypeScript and REST APIs.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "Enbake Consulting",
  period: "Mar 2021 – Dec 2021",
  categories: ["Web App"],
  tags: ["React.js", "TypeScript", "IoT", "Dashboards"],
  stack: ["React.js", "TypeScript", "REST APIs"],
  visual: { kind: "icon", icon: "truck" },
  updatedAt: "2026-10-18",
  sections: {
    problem: null,
    challenge:
      "Live tracking dashboards must keep data fresh without overloading the API or the browser, and stay readable when many shipments update at once.",
    contribution: "I built LOGITRACK's dashboard for live shipment tracking using React.js, TypeScript and REST APIs.",
    architecture: `\`\`\`text
IoT devices ──► backend ──► REST APIs ──► React + TypeScript dashboard (live shipment views)
\`\`\``,
    decisions: null,
    tradeoffs: `- **Polling vs push:** polling REST APIs is simple and cache-friendly; WebSockets or Server-Sent Events push updates instantly but add connection management.
- **Rendering many items:** virtualised lists and memoised rows keep large, frequently updating tables responsive.`,
    limitations: null,
    impact: null,
    lessons: null,
  },
  relatedArticles: [],
  todos: ["How live updates were fetched (polling interval, push).", "Main dashboard features, challenges and lessons learned."],
}
