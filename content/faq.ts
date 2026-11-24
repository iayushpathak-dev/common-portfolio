// Questions visitors and recruiters ask, with answers grounded only in published content
// (lib/portfolio.ts and content/projects). Each entry becomes one knowledge document for the
// assistant. `variants` are other ways people ask the same thing, so retrieval matches them. `href` is the page cited as the source.

export type FaqEntry = {
  id: string
  question: string
  variants: string[]
  answer: string
  href: string
  tags: string[]
}

export const FAQ_UPDATED_AT = "2026-11-24"

export const FAQ: FaqEntry[] = [
  {
    id: "who-is-ayush",
    question: "Who is Ayush Pathak?",
    variants: ["Tell me about yourself", "Introduce yourself", "Who are you?", "Give me a short summary of Ayush"],
    answer:
      "I'm Ayush Pathak, a Senior Frontend Engineer at FITPASS with 6+ years of experience building production React.js and Next.js applications. I work on frontend architecture, BFF and API integration, rendering strategy and performance. I'm based in Delhi NCR, India.",
    href: "/about",
    tags: ["About"],
  },
  {
    id: "current-role",
    question: "Where do you work now and what do you do there?",
    variants: ["What is your current job?", "Current company?", "Where do you work?", "What do you do at FITPASS?"],
    answer:
      "I've been a Senior Frontend Engineer at FITPASS since November 2022. I work on fitpass.co.in, Fitshop, Partner Studio (the web app corporate partners open inside their apps), B2B2C partner funnels, the Nutrition Dashboard, FitFeast chat and calls, marketing landing pages, the ABHA integration and the BFF layer. I also mentor two junior developers.",
    href: "/experience",
    tags: ["Experience", "FITPASS"],
  },
  {
    id: "years-experience",
    question: "How many years of experience do you have?",
    variants: ["Total experience?", "How many years have you worked as a developer?", "How long have you been at FITPASS?"],
    answer:
      "6+ years in total. I've been at FITPASS for 4+ years (since November 2022). Before that I worked at Elite Mindz, Enbake Consulting and Magic Software.",
    href: "/experience",
    tags: ["Experience"],
  },
  {
    id: "previous-companies",
    question: "Where did you work before FITPASS?",
    variants: ["Previous companies?", "What was your previous job?", "Career history"],
    answer:
      "Elite Mindz (Software Developer, Feb 2022 – Nov 2022), Enbake Consulting (Software Engineer, Mar 2021 – Dec 2021) and Magic Software (Digital Media Trainee, Jan 2020 – Feb 2021), where I built interactive EdTech modules with React.js and HTML5.",
    href: "/experience",
    tags: ["Experience"],
  },
  {
    id: "education",
    question: "What is your education?",
    variants: ["Which degree do you have?", "Where did you study?", "Qualification?"],
    answer:
      "Master of Computer Applications (MCA) from Graphic Era Deemed University, Dehradun, and Bachelor of Computer Applications (BCA) from Graphic Era Hill University, Bhimtal.",
    href: "/resume",
    tags: ["Education"],
  },
  {
    id: "tech-stack",
    question: "What is your main tech stack?",
    variants: ["Which technologies do you use?", "Skills?", "What languages and frameworks do you know?", "What are your key skills?"],
    answer:
      "React.js and Next.js (App Router and Pages Router) with JavaScript and TypeScript. For state: Zustand, React Query, Redux and Context. For styling: Tailwind CSS and Material UI. On the architecture side: SSR, SSG, ISR, CSR, Server Components, Server Actions, BFF with Route Handlers, REST and gRPC.",
    href: "/resume",
    tags: ["Skills"],
  },
  {
    id: "open-to-work",
    question: "Are you open to new opportunities?",
    variants: ["Are you looking for a job?", "Available for hire?", "Are you available to join a new team?", "Open to work?"],
    answer:
      "Yes, I'm open to full-time opportunities. The best way to reach me is through the contact links on this site (email, LinkedIn or WhatsApp).",
    href: "/about",
    tags: ["Hiring"],
  },
  {
    id: "contact",
    question: "How can I contact you?",
    variants: ["Email?", "LinkedIn?", "How can I hire you?", "How do I reach you?"],
    answer:
      "You can email me or reach me on LinkedIn or GitHub; the links are in the site header and on the About page. My resume is also available to download from the Resume page.",
    href: "/about",
    tags: ["Contact"],
  },
  {
    id: "best-project",
    question: "What is your most important project?",
    variants: ["Which project are you most proud of?", "Best project?", "What is your biggest project?"],
    answer:
      "Partner Studio is the biggest: the app 20+ corporate and insurance partners open inside their own apps, which I'm moving to a server-first Next.js 16 architecture with server-only login, Server Actions and a locked-down BFF. The B2B2C partner funnels are another one I'm proud of: I designed the config-driven system and built all 20 partner funnels on it.",
    href: "/projects/fitpass-corporate-pwa",
    tags: ["Projects"],
  },
  {
    id: "website",
    question: "What did you build on fitpass.co.in?",
    variants: ["Tell me about the FITPASS website", "What was your role on fitpass.co.in?", "fitpass.co.in architecture"],
    answer:
      "The website runs on the Next.js App Router with 200+ server-rendered routes. I built API-driven SEO (metadata, canonicals, JSON-LD, sitemaps), studio and city pages from a catch-all route, performance work for LCP and zero layout shift, multi-channel analytics (GA4, Meta Pixel, Segment, server-side Meta CAPI) and a containerised standalone deployment.",
    href: "/projects/fitpass-website-rendering",
    tags: ["Website", "SEO", "Performance"],
  },
  {
    id: "website-performance",
    question: "How fast is fitpass.co.in?",
    variants: ["Lighthouse score?", "Core Web Vitals?", "How is the website performance?"],
    answer:
      "On PageSpeed Insights (23 Nov 2026) the homepage passed Core Web Vitals for real users on both mobile and desktop: LCP 1.6 s, INP 110 ms and CLS 0 on mobile; LCP 1.3 s, INP 69 ms and CLS 0 on desktop. Lighthouse scored SEO 100, Best Practices 100 and Accessibility 96.",
    href: "/projects/fitpass-website-rendering",
    tags: ["Performance"],
  },
  {
    id: "rendering",
    question: "How do you decide between SSR, SSG, ISR and CSR?",
    variants: ["Which rendering strategy do you use?", "When do you use SSR vs SSG?"],
    answer:
      "I decide per page by how often the data changes and whether it depends on the user or location. On fitpass.co.in, studio, city and listing pages depend on location cookies, the logged-in user and backend data that changes often, so they render on the server per request. Static or incrementally regenerated pages are faster and cheaper, but they need a revalidation plan and can't depend on cookies.",
    href: "/projects/fitpass-website-rendering",
    tags: ["Next.js", "Rendering"],
  },
  {
    id: "bff",
    question: "What is the BFF layer you built?",
    variants: ["Backend for frontend?", "Why did you build a BFF?", "How does your API layer work?"],
    answer:
      "A Backend-for-Frontend in Next.js Route Handlers. The browser calls one /api/service route with a service name; a map of 200+ entries resolves it to the backend URL and the right headers. It filters legacy responses down to what the UI uses, adds per-corporate UI config, wraps third-party APIs (geocoding, reCAPTCHA, face scan, uploads) in our own response format, and turns website events into gRPC calls.",
    href: "/projects/backend-for-frontend",
    tags: ["BFF", "Architecture", "gRPC"],
  },
  {
    id: "grpc",
    question: "Have you worked with gRPC?",
    variants: ["gRPC experience?", "Where did you use gRPC?"],
    answer:
      "Yes. In the website's BFF, /api/grpc-service turns website events into calls to the event service (GeneralEvent.SendGeneralEvent). The event data goes into a protobuf Any field, the client is created from the .proto file at runtime, and the proto files ship with the standalone build.",
    href: "/projects/backend-for-frontend",
    tags: ["gRPC"],
  },
  {
    id: "partner-studio",
    question: "What is Partner Studio?",
    variants: ["What is the corporate partner app?", "Tell me about Partners Studio", "Corporate app inside partner apps"],
    answer:
      "Partner Studio is the FITPASS app that corporate and insurance partners open inside their own apps: gym bookings, QR check-in, doctor consultations, health checkups, face-scan health reports and membership upgrades. It's used by 20+ partners. The new version runs on Next.js 16 with server-only Auth.js login, Server Components for reads, Server Actions for writes and an allowlisted BFF.",
    href: "/projects/fitpass-corporate-pwa",
    tags: ["Partner Studio", "Next.js 16"],
  },
  {
    id: "server-actions",
    question: "How do you use Server Components and Server Actions?",
    variants: ["When do you use Server Actions?", "App Router data fetching approach"],
    answer:
      "In Partner Studio I use three rules: data needed when a page opens comes from Server Components calling the backend directly; every write is a Server Action that checks the session, validates inputs and returns { ok, message }; and only reads after the page opens (load more, search, filters) go through TanStack Query and the BFF.",
    href: "/projects/fitpass-corporate-pwa",
    tags: ["Next.js", "Server Actions"],
  },
  {
    id: "auth-security",
    question: "How do you handle authentication and security in your apps?",
    variants: ["How do you keep your apps secure?", "Auth approach?"],
    answer:
      "In Partner Studio, login happens only on the server with Auth.js: the backend token stays in an encrypted httpOnly cookie. proxy.js checks the session on every route, partner URLs must match the user's own partner, the BFF only runs allowlisted services with allowlisted params, and secrets live only in server-only files. I also keep a written security review with severity and owner for each issue.",
    href: "/projects/fitpass-corporate-pwa",
    tags: ["Security", "Auth"],
  },
  {
    id: "partner-funnels",
    question: "What are the B2B2C partner funnels?",
    variants: ["What is the corporate setup?", "Config-driven funnels", "How do partners sell memberships?"],
    answer:
      "Partner companies (employers, insurers, banks) offer FITPASS to their employees or customers through co-branded, multi-step landing pages. Every funnel is generated from shared steps and a per-partner JSON config: landing, plans, user details, OTP, goodies and add-ons, address, checkout, payment and thank-you. I designed the system and built all 20 partner funnels on it.",
    href: "/projects/configurable-corporate-journeys",
    tags: ["Config-driven UI", "B2B2C"],
  },
  {
    id: "config-driven-ui",
    question: "Have you built configuration-driven UIs?",
    variants: ["JSON-driven UI experience?", "Have you built schema-driven UIs?"],
    answer:
      "Yes, several. The B2B2C partner funnels are built from per-partner JSON config. The Nutrition Dashboard turns JSON config into a schema that, combined with the API response, renders tables with CRUD, filters and pagination across ~50 routes. The feedback app builds each campaign's multi-step form from backend config.",
    href: "/projects/nutrition-dashboard",
    tags: ["Config-driven UI"],
  },
  {
    id: "nutrition-dashboard",
    question: "What is the Nutrition Dashboard?",
    variants: ["Dietitian dashboard?", "Tell me about the dietitian tool"],
    answer:
      "A JSON-driven dashboard with ~50 routes used by 20+ dietitians to manage 60,000+ users. It has schema-generated tables with CRUD, filters and pagination, an HRA follow-up flow where dietitians create diets from the user's answers, reusable diet plans assigned by keyword, allergy-aware diets, a food library with images and calories, and payment links for expired memberships.",
    href: "/projects/nutrition-dashboard",
    tags: ["Dashboard"],
  },
  {
    id: "fitshop",
    question: "What did you build in Fitshop?",
    variants: ["Tell me about Fitshop", "E-commerce experience?", "Cart and variants logic"],
    answer:
      "Fitshop is FITPASS's fitness store on the App Router. I built the server-rendered catalogue, a variant engine that maps option picks (colour, size, flavour) to the right variant with its price and stock, a shared cart that merges single products and bundles, coupons, FitCash, address selection, Buy Now and the order-status page.",
    href: "/projects/fitshop",
    tags: ["E-commerce"],
  },
  {
    id: "liveness",
    question: "How does the liveness verification work?",
    variants: ["How does face verification work?", "QR attendance?", "Liveness check"],
    answer:
      "The browser grades every camera frame with TensorFlow Face Landmarks and MediaPipe for alignment, eyes, light and blur, captures the sharpest frame after 3 clear frames, and only then sends it to the Luxand photo liveness API, which gives the final verdict. QR check-in and bookings ask for the face check when the backend requires it, and the original request is replayed automatically after it passes.",
    href: "/projects/liveness-verification",
    tags: ["Computer Vision", "Liveness"],
  },
  {
    id: "fitfeast",
    question: "What is FitFeast and how did you use Agora?",
    variants: ["Agora integration?", "Dietitian chat and calls", "Tell me about FitFeast"],
    answer:
      "FitFeast is FITPASS's nutrition coaching inside a WebView: meal logging and food search plus a chat app with the user's dietitian. I built the chat on Agora Chat (token renewal, history paging, rich cards, media through S3 presigned uploads, presence) and voice/video calls on Agora RTC, with scheduled calls, call history and ratings.",
    href: "/projects/fitfeast-webview",
    tags: ["Agora", "Real-time"],
  },
  {
    id: "abha",
    question: "What is the ABHA integration?",
    variants: ["ABDM integration?", "Government health ID?", "What is ABHA?"],
    answer:
      "ABHA is India's 14-digit government health ID under the Ayushman Bharat Digital Mission. I built the web flow inside the FITPASS app where users create it: Aadhaar OTP, mobile verification, choosing an ABHA address and viewing the ABHA card. Every call goes through our proxy as an encrypted payload; the browser never calls ABDM directly.",
    href: "/projects/abdm-abha-integration",
    tags: ["Government integration"],
  },
  {
    id: "webview",
    question: "Have you built web pages that run inside native apps?",
    variants: ["WebView experience?", "Have you built pages for mobile apps?"],
    answer:
      "Yes. About 30 screens of the FITPASS iOS and Android apps are served from the web under /app/*, so they change without an app release. The app passes safe area, header and light/dark theme in the URL and the pages adapt. Partner Studio, FitFeast and the ABHA flow also run inside WebViews.",
    href: "/projects/native-app-webview-integration",
    tags: ["WebView", "Mobile"],
  },
  {
    id: "marketing-pages",
    question: "Have you built marketing landing pages?",
    variants: ["Landing pages experience?", "Conversion funnels?", "Pages for ad campaigns?"],
    answer:
      "Yes. I built the pages FITPASS ads and campaigns send people to: subscription offers, spin-the-wheel deals, Google and Facebook ad variants, CMS- and HTML-driven campaign pages and the SEO membership pages. They all end in one shared flow: OTP login, plan picker, payment and thank-you, with UTM and gclid kept through the funnel.",
    href: "/projects/marketing-landing-pages",
    tags: ["Landing pages"],
  },
  {
    id: "feedback-forms",
    question: "What is the feedback solution?",
    variants: ["Dynamic forms?", "Campaign feedback forms"],
    answer:
      "A multi-step feedback app where each form is built from JSON config that marketing fills in per campaign: text inputs, radios, single and multi-select, emoji sliders and follow-up questions. Users log in automatically from an encoded link, and answers are saved to localStorage so a reload doesn't lose them.",
    href: "/projects/feedback-solution",
    tags: ["Forms"],
  },
  {
    id: "analytics",
    question: "How do you handle analytics and tracking?",
    variants: ["How do you track user events?", "GA4 / Meta Pixel experience?"],
    answer:
      "On fitpass.co.in one tracking helper sends each event to GA4, Meta Pixel and Segment, keeps campaign attribution (UTM and gclid, captured in the request proxy) across the funnel, and sends server-side Meta Conversions API events with hashed user data.",
    href: "/projects/fitpass-website-rendering",
    tags: ["Analytics"],
  },
  {
    id: "deployment",
    question: "How are your apps deployed?",
    variants: ["Docker experience?", "How do you deploy?"],
    answer:
      "fitpass.co.in runs as a Next.js standalone build in Docker behind nginx and supervisor on Kubernetes, with a health check that holds nginx until Next.js is ready. Partner Studio has a multi-stage Docker image running as a non-root user and a health endpoint for Kubernetes probes that doesn't call the backend.",
    href: "/projects/fitpass-website-rendering",
    tags: ["DevOps"],
  },
  {
    id: "ai-work",
    question: "What AI work have you done?",
    variants: ["AI experience?", "Do you work with LLMs?", "Have you built AI features?"],
    answer:
      "I'm expanding into AI application engineering by building real features. This site's assistant uses retrieval-augmented generation (RAG) over my published content with source citations. At work I built in-browser face checks with TensorFlow and MediaPipe, and I use Claude Code daily with a maintained CLAUDE.md, plan-first changes and checks the agent runs itself.",
    href: "/projects/ai-portfolio-assistant",
    tags: ["AI"],
  },
  {
    id: "how-assistant-works",
    question: "How does this AI assistant work?",
    variants: ["Is this chatbot trained on your data?", "How does this chatbot work?", "Are you a real person?"],
    answer:
      "I'm an AI assistant, not Ayush himself. I answer from Ayush's published portfolio content using retrieval-augmented generation: your question is embedded, the closest parts of his projects, experience and articles are retrieved from a vector database, and the answer is written only from those parts, with links to the pages used.",
    href: "/projects/ai-portfolio-assistant",
    tags: ["AI", "RAG"],
  },
  {
    id: "claude-code",
    question: "How do you use AI coding tools like Claude Code?",
    variants: ["Do you use AI for coding?", "Claude Code workflow?"],
    answer:
      "I treat it like a teammate with context, not autocomplete. Each project has a CLAUDE.md with dated rules and decisions, changes start with a plan, and the agent runs lint, build, tests and mock-backend checks itself. I review every diff, especially for auth, payments and data access.",
    href: "/projects/claude-code-workflow",
    tags: ["AI tools"],
  },
  {
    id: "mentoring",
    question: "Do you have leadership or mentoring experience?",
    variants: ["Team lead experience?", "Do you mentor developers?"],
    answer:
      "I mentor two junior developers at FITPASS and work with cross-functional teams to ship features. Several systems I built are used by other teams too, such as the config-driven partner funnels and the Nutrition Dashboard.",
    href: "/experience",
    tags: ["Mentoring"],
  },
  {
    id: "typescript",
    question: "Do you use TypeScript?",
    variants: ["TypeScript experience?", "JS or TS?"],
    answer:
      "Yes. TypeScript is part of my core stack, and this portfolio is written in TypeScript. Some work projects are in JavaScript by team choice; Partner Studio's new version is JavaScript-only for now, with TypeScript planned to come back file by file.",
    href: "/resume",
    tags: ["TypeScript"],
  },
  {
    id: "testing",
    question: "How do you test your work?",
    variants: ["Testing approach?", "Do you write unit tests?"],
    answer:
      "This portfolio has 100+ Vitest tests that run in CI with lint, typecheck and build on every pull request. For server flows that unit tests can't cover well, such as auth cookies and Server Actions, I run the app against a mock backend and check real flows with curl.",
    href: "/projects/claude-code-workflow",
    tags: ["Testing"],
  },
]
