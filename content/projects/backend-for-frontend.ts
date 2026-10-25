import type { Project } from "@/content/types"

export const backendForFrontend: Project = {
  id: "project-backend-for-frontend",
  slug: "backend-for-frontend",
  contentType: "project",
  title: "Backend-for-Frontend Architecture",
  aka: "BFF layer",
  summary:
    "A Backend-for-Frontend built with Next.js Route Handlers that connects frontends to backend and external services, centralises common business logic and routes gRPC calls.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Architecture", "Integrations"],
  tags: ["Next.js", "Route Handlers", "BFF", "gRPC"],
  stack: ["Next.js Route Handlers", "TypeScript / JavaScript", "gRPC", "REST APIs"],
  featured: true,
  visual: { kind: "diagram", clients: ["Web", "PWA"], hub: "BFF (Route Handlers)", backend: "Services & gRPC" },
  updatedAt: "2026-10-18",
  sections: {
    problem: null,
    challenge:
      "Browsers can't call gRPC services directly, and several frontends need the same business rules. A BFF gives them one HTTP API shaped for the UI while it talks to backend and external services.",
    contribution:
      "I built the BFF layer with Next.js Route Handlers: it connects backend and external services, handles common business logic, and routes gRPC calls.",
    architecture: `\`\`\`text
Web app / PWA  ──HTTP/JSON──►  BFF (Next.js Route Handlers)
                                 ├─ shared business logic
                                 ├──gRPC──►  backend services
                                 └──HTTP──►  external services
\`\`\`

The frontends only know the BFF's HTTP API. Protocol details (gRPC) and service locations stay on the server.`,
    decisions: "Implementing the BFF with Next.js Route Handlers, so it is written in the same framework and language as the frontends it serves.",
    tradeoffs: `- **BFF in Next.js vs a separate service:** co-locating keeps types and deployments together; a separate service scales and deploys independently and can serve non-Next clients.
- **One BFF vs one per client:** a single BFF avoids duplicated logic; per-client BFFs (web, mobile) let each shape its own API but repeat shared rules.
- **Logic placement:** keep orchestration and response shaping in the BFF, but leave core domain rules in backend services so they have one owner.
- **Extra hop:** a BFF adds a network hop and another thing to monitor; caching and parallel upstream calls offset the latency.`,
    limitations: null,
    impact: null,
    lessons: null,
  },
  relatedArticles: [],
  todos: [
    "What problem led to introducing the BFF (for example, how frontends called services before)?",
    "Which business logic was centralised, and how gRPC clients were generated and managed.",
    "Any measured impact (fewer client requests, latency, simpler frontends) you can share.",
  ],
}
