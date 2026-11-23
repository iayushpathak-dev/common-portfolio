import type { Project } from "@/content/types"

export const backendForFrontend: Project = {
  id: "project-backend-for-frontend",
  slug: "backend-for-frontend",
  contentType: "project",
  title: "Backend-for-Frontend Architecture",
  aka: "BFF layer",
  summary:
    "A Backend-for-Frontend built with Next.js Route Handlers in the FITPASS website: one service map for 200+ backend endpoints, responses from the old codebase filtered and reshaped for the UI, per-corporate UI config, third-party API routes with their own response shapes, and gRPC event tracking.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Architecture", "Integrations"],
  tags: ["Next.js", "Route Handlers", "BFF", "gRPC", "API design"],
  stack: ["Next.js Route Handlers", "JavaScript", "gRPC (@grpc/grpc-js, proto-loader)", "REST APIs"],
  featured: true,
  visual: { kind: "diagram", clients: ["Web", "Partner apps"], hub: "BFF (Route Handlers)", backend: "Services & gRPC" },
  updatedAt: "2026-11-24",
  sections: {
    problem:
      "The FITPASS website and partner apps talk to many backends: older PHP APIs, newer services, gRPC services and third-party APIs. Their responses were built for other clients, often carried more than the UI needed, and differed in shape from one API to the next.",
    challenge:
      "Browsers can't call gRPC, shouldn't see backend URLs or keys, and shouldn't have to deal with each API's quirks. Every corporate partner also needs its own UI behaviour from the same screens.",
    contribution: `I built the BFF layer in the website with Next.js Route Handlers:

- One service map: the browser sends a service name and params to \`/api/service\`. A map of 200+ entries resolves it to the backend URL, method, content type and the right headers (guest, logged-in, Fitshop or corporate), so pages never know where data comes from.
- Filtered responses from the old codebase: responses from the older APIs are filtered on the server, so the UI gets only the fields it uses instead of the full legacy payload.
- Per-corporate UI config: a custom config per corporate partner is added on top of the API data, so the same screens show the right branding, steps and options for each partner.
- Third-party API routes: dedicated routes for geocoding, place details, IP lookup, reCAPTCHA verification, face scan and file uploads. Keys stay on the server, and each route **reshapes the third-party response into our own format**, so the UI doesn't depend on any vendor's response shape.
- gRPC event tracking: \`/api/grpc-service\` turns website events into gRPC calls to the event service (\`GeneralEvent.SendGeneralEvent\`). The event data is packed into a protobuf \`Any\` field, the client is created from the \`.proto\` file at runtime, and the proto files are bundled into the standalone build.`,
    architecture: `\`\`\`text
Web / partner apps ──HTTP──► BFF (Next.js Route Handlers)
                               │
                               ├─ /api/service ── service map (200+)
                               │     ├─ headers per user type (guest · member · corporate)
                               │     ├─ filter legacy responses ──► only what the UI needs
                               │     └─ merge per-corporate UI config
                               │
                               ├─ third-party routes (geocode · IP · reCAPTCHA · face scan · files)
                               │     └─ keys on server, response reshaped to our format
                               │
                               └─ /api/grpc-service ──gRPC──► event service
                                                         (GeneralEvent, protobuf Any)
\`\`\`

The frontends only know the BFF's HTTP API. Backend URLs, keys, protocols and response quirks stay on the server.`,
    decisions: `- **Route Handlers in the same Next.js app,** so the BFF uses the same language and deploy as the frontend it serves.
- Shape responses for the UI. The BFF decides what the screen gets; legacy and third-party fields that the UI doesn't use never reach the browser.
- Config per partner, not code per partner. Partner differences live in config merged by the BFF.
- gRPC behind HTTP. The browser sends plain JSON; the BFF owns the protobuf contract.`,
    tradeoffs: `- **BFF in Next.js vs a separate service:** one deploy and one language, but BFF traffic and page traffic scale together.
- Filtering in the BFF vs fixing the backend: fast to ship and keeps old APIs untouched, but the mapping has to be updated when the backend changes.
- Extra hop: a BFF adds a network hop and another thing to monitor; smaller responses and server-side calls offset it.`,
    limitations: null,
    impact: null,
    lessons: null,
  },
  relatedArticles: [],
  todos: [],
}
