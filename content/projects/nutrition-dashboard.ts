import type { Project } from "@/content/types"

export const nutritionDashboard: Project = {
  id: "project-nutrition-dashboard",
  slug: "nutrition-dashboard",
  contentType: "project",
  title: "Nutrition Dashboard",
  summary:
    "A JSON-driven dashboard with ~50 routes used by 20+ dietitians to manage 60,000+ users: schema-generated tables with CRUD, filters and pagination, HRA-based follow-ups, reusable diet plans assigned by keyword, allergy-aware diets, a food library and payment links for expired memberships.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Web App", "Architecture"],
  tags: ["React.js", "JSON-driven UI", "Schema-driven tables", "Admin dashboard", "CRUD"],
  stack: ["React.js", "JavaScript", "Configuration-driven UI", "REST APIs"],
  featured: true,
  visual: { kind: "icon", icon: "layout-dashboard" },
  updatedAt: "2026-11-24",
  sections: {
    problem:
      "FITPASS dietitians coach tens of thousands of members. They need one tool to see each member's health answers, write and assign diet plans, manage the food library and follow up, across about 50 screens, without a developer building every list and form by hand.",
    challenge: `- Most screens are lists and forms over different APIs. Hand-building ~50 of them would mean the same table, filter and pagination code copied again and again.
- Writing a diet from scratch for every member doesn't scale for 20+ dietitians and 60,000+ users.
- Diets must respect each member's allergies, and members with an expired membership need a quick way to renew.`,
    contribution: `I built the dashboard and its JSON-driven UI.

**Schema-driven screens**

- JSON config → schema: each screen is described by a JSON config. The app turns it into a schema: columns, labels, formats, and which actions and filters are on.
- Schema + API response → table: the renderer combines the schema with the API response to build the table, so a new list is a config, not new code.
- Everything is a flag: actions (view, edit, delete, custom actions), filters, search and other features are switched on or off with \`true\` / \`false\` in the schema.
- CRUD and pagination built in: create, read, update and delete, plus server-side pagination, come from the same renderer on every screen.
- About 50 routes run on this setup.

**Dietitian workflows**

- HRA follow-up: members answer a health risk assessment (HRA). Dietitians see each member's answers in a follow-up flow and create the diet plan from that same screen.
- Reusable diet plans: diet plans are stored with a reference ID. Dietitians create custom diets once and assign them to any member through a keyword, so they don't have to write a diet manually each time.
- Allergy-aware diets: if a member has allergies, the diet given to them is adjusted to those allergies.
- Food library: add and edit foods with images, calories and nutrition details, which the diet plans use.
- Renewals: when a member's membership has expired, the dashboard generates a payment link for them.`,
    architecture: `\`\`\`text
JSON config ──► schema (columns · actions · filters · flags: true / false)
                    │
API response ───────┤
                    ▼
            Table renderer ──► CRUD · filters · search · pagination
                    │
                    ▼
        ~50 routes: members · HRA follow-up · diet plans · foods · payments

HRA answers ──► dietitian ──► diet plan (reference ID)
                                  ├─ reusable custom diet, assigned by keyword
                                  └─ adjusted for the member's allergies
Expired membership ──► payment link
\`\`\``,
    decisions: `- **Configuration over hand-built screens.** One renderer and one schema format for every list, so behaviour (actions, filters, pagination) is the same everywhere and a new screen is mostly config.
- Feature flags in the schema. Turning an action or filter on or off is a \`true\` / \`false\` change, not a code change.
- Diets as reusable templates. Reference-ID diet plans assigned by keyword replace writing the same diet again for every member.
- Work where the context is. Diet plans are created from the HRA follow-up screen, where the dietitian already sees the member's answers and allergies.`,
    tradeoffs: `- **Configuration-driven vs hand-built screens:** configuration makes new screens fast and consistent, but edge cases move into the renderer and the schema format.
- Schema validation: a broken config can break a whole screen, so configs need to be checked when they load.
- Reusable diets vs fully custom ones: templates save time and keep quality even, but each member still needs adjustments such as allergies.`,
    limitations: null,
    impact: "Used by 20+ dietitians to manage plans for 60,000+ users.",
    lessons: null,
  },
  relatedArticles: [],
  todos: [],
}
