import type { Project } from "@/content/types"

export const nativeAppWebviewIntegration: Project = {
  id: "project-native-app-webview-integration",
  slug: "native-app-webview-integration",
  contentType: "project",
  title: "Native Mobile App WebView Integration",
  summary:
    "About 30 screens of the FITPASS iOS and Android apps served from the web under /app/*, so they can change without an app-store release. The app passes safe area, header and light/dark theme in the URL, and the pages adapt. Includes a face-scan health check built on a third-party vitals tool.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Web App", "Integrations"],
  tags: ["WebView", "Mobile", "Next.js", "Safe area", "Dark mode", "Third-party integration"],
  stack: ["Next.js App Router", "React.js", "Tailwind CSS", "postMessage", "Watch Your Health face scan"],
  visual: { kind: "icon", icon: "app-window" },
  updatedAt: "2026-11-24",
  sections: {
    problem:
      "Some screens in the FITPASS mobile apps change often: policies, FAQs, referral and habit programmes, blogs, a yearly user wrap. Shipping a new app build to the App Store and Play Store for every change was slow, and users on old versions kept seeing old content.",
    challenge: `- The pages run inside native WebViews, so they have to look native: respect notches and home bars, show or hide their own header, and follow the app's light or dark theme.
- The same page can open in different apps and states, so layout can't be hard-coded.
- One screen embeds a third-party face-scan tool that needs the camera and returns health data.`,
    contribution: `I built these app screens on the web, under \`/app/*\` in the FITPASS website (about 30 routes):

- Driven by the app through the URL: the native app opens each page with query params, and the page adapts to them: safe area on or off, header on or off, light or dark theme, plus user details where needed. Nothing about the device is hard-coded.
- Per-route config: a config list sets, for each route, whether it handles the safe area and shows its own header, so a new screen is one entry.
- Native feel: fixed viewport without pinch zoom on app pages, safe-area padding where the app doesn't add it, and dark backgrounds when the app is in dark mode.
- Screens: about, blog (list, search, tags, details), terms and conditions, partner terms, privacy policy, fair use policy, restriction notice, safety steps, referral programme FAQ, habit-building FAQ with an earning roadmap, payment and the yearly **user wrap**.
- Update without a release: all of these change with a normal web deploy; the app always loads the latest version.

**Check Your Health Score (third-party integration)**

- \`/app/check-your-health-score\` embeds **Watch Your Health**, a third-party face-scan tool that reads vital signs from the phone's camera, in an iframe.
- Flow: home → camera permission → face scan → wellness report (score gauge and vitals) → priority focus areas.
- The scan result comes back with \`postMessage\`. The page listens only to the tool's origin, sends the scan data through our backend, and shows the report.
- Light and dark theme from the app apply to this flow too.
- This screen was later ported to the Next.js 16 Partner Studio app (vendor v3), with the scan submitted through a Server Action and user details taken from the server session.`,
    architecture: `\`\`\`text
FITPASS app (iOS / Android)
   └─ WebView ──► https://fitpass.co.in/app/<page>?theme=dark&…  (params from the app)
                       │
                       ├─ route config: safe_area · header · dark theme
                       ├─ policies · FAQs · blog · referral · habits · user wrap
                       └─ /app/check-your-health-score
                             iframe: Watch Your Health face scan
                               └─ postMessage (origin-checked) ──► our API ──► report
\`\`\``,
    decisions: `- **Web for screens that change often.** Content and simple flows ship with a web deploy instead of an app release.
- The app tells the page how to look. Safe area, header and theme come in the URL, so one page works in every app version and mode.
- Config per route, not code per route. Safe-area and header behaviour live in one list.
- Third-party tool in an iframe. The vendor's scanner stays isolated; only its result message crosses into our page, and only from its origin.`,
    tradeoffs: `- **WebView vs native screens:** instant updates and one codebase for iOS and Android, but slower first load and less access to device features than native.
- Settings in the URL: simple and stateless, but every param must be validated, and the URL is visible to anyone who copies it.
- Embedding a vendor tool: fast to add a complex feature, but its look, uptime and data format depend on the vendor.`,
    limitations: null,
    impact: null,
    lessons: null,
  },
  relatedArticles: [],
  todos: [],
}
