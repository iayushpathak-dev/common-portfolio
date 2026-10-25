import { articleHref, projectHref, publishedArticles, publishedProjects, type Article, type Project } from "@/content"
import { PORTFOLIO } from "@/lib/portfolio"
import { absoluteUrl } from "@/lib/site"
import type { KnowledgeDocument } from "@/lib/rag/types"

// Builds the knowledge base from published, public content only. Drafts, planned topics,
// TODO notes, phone numbers and environment variables never become documents.

/** Date the profile/resume facts in lib/portfolio.ts were last reviewed. Update it when they change. */
const PROFILE_UPDATED_AT = "2026-10-18"

const { profile, experience, skillGroups, education, aiJourney, aboutPage, projectsPage } = PORTFOLIO

function profileDocuments(): KnowledgeDocument[] {
  const base = { publicationStatus: "published" as const, updatedAt: PROFILE_UPDATED_AT }
  const current = experience[0]

  return [
    {
      ...base,
      id: "profile-about",
      title: `About ${profile.name}`,
      url: absoluteUrl("/about"),
      contentType: "profile",
      tags: ["About", "Profile"],
      categories: ["Profile"],
      text: [
        `${profile.name} is a ${profile.role} with ${profile.totalExperience.toLowerCase()} of experience, based in ${profile.location}.`,
        `Currently: ${current.role} at ${current.company} (${current.period}).`,
        profile.summary,
        ...aboutPage.story,
        `AI engineering (current learning, not professional experience): ${profile.aiFocus}`,
        `Contact: email ${profile.contact.email}, LinkedIn ${profile.contact.linkedin}, GitHub ${profile.contact.github}.`,
        `Open to: ${aboutPage.availableFor}.`,
      ].join("\n\n"),
    },
    ...experience.map((job, i) => ({
      ...base,
      id: `experience-${job.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title: `${job.role} at ${job.company}`,
      url: absoluteUrl("/experience"),
      contentType: "experience" as const,
      tags: [...job.technologies],
      categories: ["Experience"],
      text: [
        `${profile.name} worked as ${job.role} at ${job.company}, ${job.period} (${job.duration})${i === 0 ? ", the current role" : ""}.`,
        job.summary,
        ...job.highlights.map((h) => `- ${h}`),
        job.technologies.length > 0 ? `Technologies: ${job.technologies.join(", ")}.` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    })),
    {
      ...base,
      id: "profile-skills",
      title: `${profile.name}'s technical skills`,
      url: absoluteUrl("/resume"),
      contentType: "skills",
      tags: ["Skills"],
      categories: ["Resume"],
      text: skillGroups.map((g) => `${g.title}: ${g.items.join(", ")}.`).join("\n"),
    },
    {
      ...base,
      id: "profile-education",
      title: `${profile.name}'s education`,
      url: absoluteUrl("/resume"),
      contentType: "education",
      tags: ["Education"],
      categories: ["Resume"],
      text: education.map((e) => `${e.degree}, ${e.place}.`).join("\n"),
    },
    {
      ...base,
      id: "profile-ai-learning-journey",
      title: `${profile.name}'s AI engineering learning journey`,
      url: absoluteUrl("/about"),
      contentType: "learning",
      tags: ["AI Engineering", "Learning"],
      categories: ["Learning"],
      text: [
        profile.aiFocus,
        "Status of each topic (Hands-on Implementation = built in a real project such as this website; Learning Notes = studied, not yet implemented):",
        ...aiJourney.map(({ topic, status }) => `- ${topic}: ${status}`),
      ].join("\n"),
    },
  ]
}

export function projectDocument(project: Project): KnowledgeDocument {
  const sections = (Object.keys(projectsPage.sections) as (keyof Project["sections"])[])
    .filter((key) => project.sections[key])
    .map((key) =>
      key === "tradeoffs"
        ? `## ${projectsPage.sections[key]}\n\n(General engineering trade-offs, not a record of decisions made on this project.)\n\n${project.sections[key]}`
        : `## ${projectsPage.sections[key]}\n\n${project.sections[key]}`,
    )

  return {
    id: project.id,
    title: project.title,
    url: absoluteUrl(projectHref(project.slug)),
    contentType: "project",
    tags: project.tags,
    categories: project.categories,
    publicationStatus: project.publicationStatus,
    updatedAt: project.updatedAt,
    text: [
      `${project.title}${project.aka ? ` (${project.aka})` : ""}: ${project.summary}`,
      `Organisation: ${project.organization}${project.period ? `, ${project.period}` : ""}. Evidence: ${project.evidence}.`,
      project.stack.length > 0 ? `Technology stack: ${project.stack.join(", ")}.` : "",
      ...sections,
    ]
      .filter(Boolean)
      .join("\n\n"),
  }
}

export function articleDocument(article: Article): KnowledgeDocument {
  return {
    id: article.id,
    title: article.title,
    url: absoluteUrl(articleHref(article.slug)),
    contentType: "article",
    tags: article.tags,
    categories: [article.category],
    publicationStatus: article.publicationStatus,
    updatedAt: article.updatedAt,
    text: [
      `${article.title}. ${article.summary}`,
      `Label: ${article.learningStatus} (an article is not proof that something was implemented unless it says so).`,
      article.body,
    ].join("\n\n"),
  }
}

/** Every document the assistant may retrieve. Published content only. */
export function buildKnowledgeDocuments(): KnowledgeDocument[] {
  return [
    ...profileDocuments(),
    ...publishedProjects().map(projectDocument),
    ...publishedArticles().map(articleDocument),
  ].filter((d) => d.publicationStatus === "published")
}

/** Returns a reason when a document can't be indexed safely, or null when it's valid. */
export function documentProblem(doc: Partial<KnowledgeDocument>): string | null {
  if (!doc.id || !/^[a-z0-9][a-z0-9-]*$/.test(doc.id)) return "missing or invalid id"
  if (!doc.title?.trim()) return "missing title"
  if (!doc.url || !/^https?:\/\//.test(doc.url)) return "missing or relative url"
  if (!doc.text?.trim()) return "empty text"
  if (doc.publicationStatus !== "published") return `status is ${doc.publicationStatus ?? "missing"}`
  return null
}
