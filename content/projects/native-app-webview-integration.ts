import type { Project } from "@/content/types"

// Draft: hidden in production until the TODOs are answered and the status is "published".
export const nativeAppWebviewIntegration: Project = {
  id: "project-native-app-webview-integration",
  slug: "native-app-webview-integration",
  contentType: "project",
  title: "Native Mobile App WebView Integration",
  summary:
    "Web experiences embedded in the Fitpass native mobile app through WebViews.",
  publicationStatus: "draft",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Web App","Integrations"],
  tags: ["WebView","Mobile","Integrations"],
  stack: [],
  visual: { kind: "icon", icon: "app-window" },
  updatedAt: "2026-10-18",
  sections: {
    problem: null,
    challenge: null,
    contribution: null,
    architecture: null,
    decisions: null,
    tradeoffs: null,
    limitations: null,
    impact: null,
    lessons: null,
  },
  relatedArticles: [],
  todos: [
    "Which screens run in WebViews, and why WebViews were used for them.",
    "How the web and native layers communicate (bridge messages, deep links, auth tokens).",
    "Your contribution, challenges and outcomes.",
  ],
}
