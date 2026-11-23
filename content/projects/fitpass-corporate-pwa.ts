import type { Project } from "@/content/types"

export const fitpassCorporatePwa: Project = {
  id: "project-fitpass-corporate-pwa",
  slug: "fitpass-corporate-pwa",
  contentType: "project",
  title: "Partner Studio",
  aka: "Partners Studio",
  summary:
    "The FITPASS app that corporate and insurance partners open inside their own apps: gym bookings, QR check-in, doctor consultations, health checkups, face-scan health reports and membership upgrades. Built on a server-first Next.js 16 architecture with server-only login, Server Actions and a locked-down BFF.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Web App", "Architecture"],
  tags: ["Next.js 16", "Server Components", "Server Actions", "Auth.js", "WebView", "BFF"],
  stack: [
    "Next.js 16 App Router",
    "React 19",
    "Server Components and Server Actions",
    "Auth.js v5",
    "TanStack Query",
    "Zustand",
    "Tailwind CSS 4",
    "TensorFlow.js and MediaPipe (face checks)",
    "Docker",
  ],
  featured: true,
  visual: { kind: "icon", icon: "smartphone" },
  updatedAt: "2026-11-24",
  sections: {
    problem:
      "Corporate and insurance partners give FITPASS to their employees and customers. Those users shouldn't have to install another app, so FITPASS runs as a web app inside each partner's own app (WebView) or browser. A signed link from the partner logs the user in, and the experience is scoped to that partner.",
    challenge: `- One codebase serves 20+ partners, each with its own entry route, branding and features, inside WebViews on old Android and iOS devices.
- The app covers a lot: fitness bookings, healthcare, face-based checks and payments.
- It handles tokens, partner identity and payments, so nothing sensitive can live in the browser, and no user may act as another user or another partner.`,
    contribution: `I designed the architecture and built the app.

**Features**

- Fitness: studio search, studio details and reviews, workout schedule, bookings, favourite studios, QR check-in and "Show your pass".
- Healthcare (Fitheal): doctor consultation (specialities, doctors, reviews, slot booking, my consultations) and health checkups (plans, providers, address with location search, slot booking, bookings), plus an electronic health record, health quizzes and an HRA.
- Identity and health checks: in-browser face [liveness verification](/projects/liveness-verification) with QR check-in, camera permission and device-eligibility screens, and a face-scan health report with vitals and priority focus areas.
- Membership upgrade: plans → order → complimentary goodies → checkout with coupons → payment, with order details, invoices, payment history and my orders.
- Profile: edit profile, email and mobile change with OTP, delivery addresses.

Nutrition coaching (FitFeast chat and calls on Agora) is a separate module: see [FitFeast WebView](/projects/fitfeast-webview).

**Architecture**

- Server-only login: the partner's link hits a route handler that signs the user in with Auth.js v5 (Credentials provider). The backend token and partner details stay inside an encrypted, httpOnly JWT cookie and never reach client code.
- Session check on every route: \`proxy.js\` sends logged-out users to a "not authorized" page and returns 401 for API calls. Every page and Server Action checks the session again, and partner URLs (\`/order/[corporate_name]\`) must match the user's own partner or they return 404.
- Three ways to reach the backend, each with one job:
  - Reads on page open come from Server Components calling the backend directly, so no API call shows up in the browser.
  - Writes are Server Actions that check the session, validate every input and return \`{ ok, message }\` for a toast.
  - Reads after the page opens (load more, search, filters) use TanStack Query through the app's own BFF.
- Locked-down BFF: \`/api/service\` only runs services marked as client-callable, only with their listed params. Partner headers are built on the server from the session, never taken from the request.
- Safe state: Zustand through a per-request store provider, so one user's data can't leak to another on the server. Flow state (cart session, last order, home route) lives in httpOnly cookies, not localStorage.
- Backend rules shown cleanly: any 412 from the backend opens a shared "precondition failed" screen built from the response, and backend HTML is sanitised before rendering.
- WebView-first UI: \`100dvh\` layouts, safe-area padding for notches, iOS keyboard handling with \`visualViewport\`, no rubber-band bounce, 16px inputs, screen transitions that respect reduced motion, and a browser target of Chrome 88+ and iOS Safari 14+.
- Operations: a health endpoint for Kubernetes probes that doesn't call the backend (a backend outage can't restart frontend pods), a multi-stage Docker image running as a non-root user, one image for every environment through runtime env vars, and a written security review with a severity and owner for each issue.`,
    architecture: `\`\`\`text
Partner app (WebView) ──signed link──► /verify-user (route handler)
                                         └─ Auth.js signIn ──► encrypted httpOnly JWT cookie

Request ──► proxy.js (session check)
   ├─ Server Components ──► callBackend()          reads on page open
   ├─ Server Actions ──────► validate ──► backend   writes, return { ok, message }
   └─ TanStack Query ──► /api/service (allowlist)  load more, search, filters
                              │
                 partner headers built on the server from the session
                              ▼
                         Fitpass APIs
\`\`\``,
    decisions: `- **Secrets and identity only on the server.** Tokens, partner headers and user identity come from the encrypted session, never from the browser or request params.
- No client-side encryption. A key shipped in the JS bundle can be read by anyone. HTTPS protects the network, and server-side payload encryption keeps its key on the server.
- One backend call per need. For example, the cart is viewed once per checkout, and actions end with a server \`redirect()\` so the page isn't re-rendered with extra calls.
- Shared screens, per-partner routes. Partners share the same screens; the partner in the session decides branding, entry route and which URLs are allowed.
- JavaScript over TypeScript, by team choice. TypeScript can come back file by file later.`,
    tradeoffs: `- **Server-first vs client-only SPA:** server rendering is faster to first content and keeps secrets off the device, but needs a running server and a session for every page, and works less well offline.
- Web app in a WebView vs native app: one web codebase that updates instantly inside every partner app, but less access to device APIs.
- Server Actions for writes: less hand-written API code, but they run one at a time per client and are still public endpoints, so each one checks the session and validates input.`,
    limitations: "Screens are being moved onto this architecture one by one, so a few still use static data until their APIs are ready.",
    impact: "Used by 20+ corporate and insurance partners.",
    lessons: null,
  },
  relatedArticles: [],
  todos: [],
}
