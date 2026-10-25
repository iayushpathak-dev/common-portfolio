import type { Project } from "@/content/types"

export const qtickets: Project = {
  id: "project-qtickets",
  slug: "qtickets",
  contentType: "project",
  title: "QTickets",
  summary:
    "A multi-region ticket booking platform for movies, events and sports, with seat selection, checkout, REST API integration and the Doha Bank payment gateway.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "Elite Mindz",
  period: "Feb 2022 – Nov 2022",
  categories: ["Web App", "Integrations"],
  tags: ["React.js", "REST APIs", "Payments", "Seat Selection"],
  stack: ["React.js", "REST APIs", "Doha Bank payment gateway"],
  visual: { kind: "icon", icon: "ticket" },
  updatedAt: "2026-10-18",
  sections: {
    problem: null,
    challenge:
      "Booking flows have to stay correct under pressure: seats can be taken by someone else mid-checkout, and payment redirects can fail or be abandoned.",
    contribution:
      "I built QTickets, including seat selection, checkout, REST API integration and the Doha Bank payment gateway integration.",
    architecture: `\`\`\`text
Browse ──► Seat map (select seats) ──► Checkout ──► Doha Bank gateway
                │                                       │
                └────────── REST APIs ◄─────────────────┘ (payment result)
\`\`\``,
    decisions: null,
    tradeoffs: `- **Seat holds:** temporarily reserving seats prevents double booking but needs expiry, otherwise abandoned checkouts block inventory.
- **Payment confirmation:** trusting the browser redirect is simple but unreliable; confirming with the server (callbacks or status checks) is the safe source of truth.
- **Multi-region:** currency, language and time zones should come from configuration rather than conditionals scattered in the UI.`,
    limitations: null,
    impact: null,
    lessons: null,
  },
  relatedArticles: [],
  todos: [
    "Which regions were supported, and what differed between them?",
    "How seat holds and payment failures were handled.",
    "Your role in the team, plus outcomes and lessons learned.",
  ],
}
