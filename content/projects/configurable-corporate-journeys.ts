import type { Project } from "@/content/types"

export const configurableCorporateJourneys: Project = {
  id: "project-configurable-corporate-journeys",
  slug: "configurable-corporate-journeys",
  contentType: "project",
  title: "Config-Driven B2B2C Partner Membership Funnels",
  aka: "Corporate partner landing pages",
  summary:
    "Multi-step, co-branded landing pages through which partner companies' employees and customers buy FITPASS memberships (B2B2C). Every funnel is generated from shared steps and a per-partner JSON config. I built the system and all 20 partner funnels running on it.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Web App", "Architecture", "Integrations"],
  tags: ["Configuration-driven UI", "B2B2C", "Multi-step funnel", "Corporate", "Next.js"],
  stack: ["Next.js App Router", "React.js", "React Context", "Route Handlers", "CMS APIs", "Tailwind CSS"],
  featured: true,
  visual: { kind: "icon", icon: "settings" },
  updatedAt: "2026-11-23",
  sections: {
    problem:
      "FITPASS sells memberships to people through partner companies: employers, insurers and banks offer FITPASS to their employees or customers at partner prices. Each partner needs its own branded page where its users can verify they belong to the partner, pick a plan and pay.",
    challenge:
      "Every partner wants its own branding, plans, prices, eligibility check and sometimes free goodies or add-ons, and new partners keep signing up. Building each funnel as a separate page would mean 20 copies of the same checkout, each drifting and breaking on its own.",
    contribution: `I designed the funnel system and built all 20 partner funnels on it, inside the marketing website:

- One funnel, many partners: each partner is a JSON config with branding, copy, which steps to show, eligibility rules, plan settings and API settings. A dynamic \`corporate/[corporate_name]\` route and shared templates render the right funnel from it.
- Multi-step purchase flow: landing offer → plans → user details → OTP verification → goodies and add-ons → delivery address → checkout → payment → thank-you. Steps can be switched on or off per partner. For example, goodies and address only appear when a partner's plan includes a physical kit.
- Shared funnel state: a context carries the partner, selected plan, verified user, add-ons and address across every step and page, so users can move back and forth without losing data.
- Plans from the CMS: partner plans and prices come from a CMS endpoint, so the business team can change them without a deploy.
- Pricing transparency: a benefit breakdown sheet shows MRP, partner discount and the final price. A "discount locked" step shows the partner price until the user verifies they belong to the partner.
- Address and checkout: saved-address selection, a new-address form with city autocomplete, and an order summary before payment.
- Reusable sections: hero banners, plan cards, comparisons, FAQs and testimonials are shared building blocks, so a new partner page is assembled rather than coded.`,
    architecture: `\`\`\`text
Partner config (JSON)          CMS (partner plans and prices)
        │                                  │
        ▼                                  ▼
corporate/[corporate_name] ──► shared step templates
        │
        │   Funnel context: partner · plan · user · add-ons · address
        ▼
landing → plans → user details → OTP → goodies/add-ons → address
        → checkout → payment → thank-you
        │
        ▼
BFF (Route Handlers): adds partner identity, calls order and payment APIs
\`\`\``,
    decisions: `- **Configuration over new pages:** a new partner is a config entry plus content, not a new route with copied components.
- Steps as building blocks: OTP, plans, add-ons, address and payment are separate steps that a config switches on or off, instead of one big form with conditions everywhere.
- Prices from the CMS, structure from config: commercial data changes often and lives in the CMS. Funnel shape changes rarely and lives in reviewed, versioned config.
- Verify before you show the deal: partner prices unlock only after the user proves they belong to the partner (OTP), which protects partner-only pricing.
- Partner identity added on the server: partner IDs and credentials are attached in the BFF, never in the browser.`,
    tradeoffs: `- **Config-driven vs hand-built pages:** config makes new partners fast and keeps checkout behaviour identical everywhere, but a partner that needs something truly custom either stretches the config schema or needs an escape hatch.
- Config in code vs in a CMS: config in the repo is reviewed and versioned; config in a CMS changes without a deploy but needs validation so a bad entry can't break a live funnel.
- Multi-step vs single-page checkout: steps keep each screen simple on mobile and let partners skip steps, but every extra step is a place where users can drop off.`,
    limitations: null,
    impact:
      "20 B2B2C partner funnels (employers, insurers and banks) run on the shared steps and config. I designed the system and built every one of them.",
    lessons: null,
  },
  relatedArticles: [],
  todos: [],
}
