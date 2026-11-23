import type { Project } from "@/content/types"

export const feedbackSolution: Project = {
  id: "project-feedback-solution",
  slug: "feedback-solution",
  contentType: "project",
  title: "Campaign-Driven Feedback Forms",
  aka: "Feedback Solution",
  summary:
    "A multi-step feedback app where every form is built from JSON config that the marketing team fills in per campaign: text inputs, radios, single and multi-select, emoji sliders and follow-up questions, with one-tap login from an encoded link and answers that survive a reload.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Web App", "Architecture"],
  tags: ["Configuration-driven UI", "Dynamic forms", "Multi-step", "Marketing campaigns", "React.js"],
  stack: ["React.js", "JavaScript", "JSON config → schema", "localStorage", "REST APIs"],
  visual: { kind: "icon", icon: "message-square" },
  updatedAt: "2026-11-24",
  sections: {
    problem:
      "Marketing runs feedback campaigns all the time, and each campaign asks different questions. Asking a developer to build a new form for every campaign was slow, and users had to log in before they could answer.",
    challenge: `- Every campaign has its own questions, question types, order and intro/outro screens, and marketing wants to change them without a release.
- Users open the form from a link, often on a phone, so login must be automatic and a reload mustn't wipe their answers.
- Some questions depend on earlier answers (pick an option → a follow-up input appears).`,
    contribution: `I built the feedback app so that a campaign is just data:

- Marketing owns the questions: the marketing team fills in questions and answers for each campaign in their dashboard. The app gets that campaign's config from the API.
- Config → our schema: the backend config is converted into the app's own form schema, and the whole form runs from that schema. If the backend format changes, only the converter changes.
- Field types: text inputs, radio buttons, single select, multi-select and an **emoji slider** for how the user feels.
- Conditional follow-ups: when a user picks certain options, the schema can show an extra input box for that choice.
- Multi-step flow: questions are split into steps with Next and Previous; the questions shown change with each step.
- Dynamic start and end screens: the intro and thank-you screens come from the backend as HTML, so each campaign has its own look and message.
- Auto login from the link: the campaign link carries an encoded user ID in the query string. The app logs the user in from it, so they only tap "Start".
- Answers that survive a reload: each answer is saved to localStorage as the user goes, so closing the tab or refreshing keeps their progress.`,
    architecture: `\`\`\`text
Marketing dashboard ──► campaign questions + answers
                              │
Link with encoded user id ──► auto login
                              │
                              ▼
API: campaign config ──► converter ──► form schema
                                          │
          start screen (HTML from backend)
                  ▼
          step 1 ⇄ step 2 ⇄ … ⇄ step N        (Next / Prev)
          inputs · radio · single/multi select · emoji slider
          + follow-up input when an option needs it
                  │  every answer saved to localStorage
                  ▼
          submit ──► end screen (HTML from backend)
\`\`\``,
    decisions: `- **Campaigns as data, not code.** Marketing changes questions in their dashboard; no developer or release needed.
- Our own schema between the API and the UI. The renderer only knows our schema, so backend config changes stay in one converter.
- Login from the link. An encoded user ID removes the login step that stopped people from answering.
- Save as you go. localStorage keeps the state, so long forms don't lose answers.`,
    tradeoffs: `- **Config-driven vs hand-built forms:** any campaign launches without code, but a truly new kind of question still needs a new field type in the renderer.
- HTML screens from the backend: fully flexible for marketing, but that HTML must be trusted or sanitised before it is shown.
- Login by encoded link: smooth for users, but the link works like a key, so it should expire and only open the feedback form.
- localStorage: simple and works offline, but stays on that device only and must be cleared after submit.`,
    limitations: null,
    impact: null,
    lessons: null,
  },
  relatedArticles: [],
  todos: [],
}
