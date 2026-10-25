import { createHash } from "node:crypto"

import { EMBEDDING_FINGERPRINT, RAG_CONFIG } from "@/lib/rag/config"
import type { Chunk, KnowledgeDocument } from "@/lib/rag/types"

type Options = { maxChars?: number; overlapChars?: number }

/** Splits Markdown into sections at "## " headings, ignoring headings inside code fences. */
export function splitSections(markdown: string): { heading: string; body: string }[] {
  const sections: { heading: string; lines: string[] }[] = [{ heading: "", lines: [] }]
  let inFence = false

  for (const line of markdown.replace(/\r\n/g, "\n").split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    const heading = !inFence && /^##\s+(.+)/.exec(line)
    if (heading) sections.push({ heading: heading[1].trim(), lines: [] })
    else sections[sections.length - 1].lines.push(line)
  }

  return sections
    .map((s) => ({ heading: s.heading, body: s.lines.join("\n").trim() }))
    .filter((s) => s.body.length > 0)
}

/** Paragraphs separated by blank lines; a fenced code block always stays one paragraph. */
export function splitParagraphs(text: string): string[] {
  const paragraphs: string[] = []
  let current: string[] = []
  let inFence = false

  for (const line of text.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    if (!inFence && line.trim() === "") {
      if (current.length) paragraphs.push(current.join("\n"))
      current = []
    } else {
      current.push(line)
    }
  }
  if (current.length) paragraphs.push(current.join("\n"))
  return paragraphs
}

/** Splits an oversized paragraph on line boundaries (or hard-cuts a single very long line). */
function splitLong(paragraph: string, maxChars: number): string[] {
  const pieces: string[] = []
  let current = ""
  for (const line of paragraph.split("\n")) {
    for (let i = 0; i < Math.max(line.length, 1); i += maxChars) {
      const part = line.slice(i, i + maxChars)
      if (current && current.length + part.length + 1 > maxChars) {
        pieces.push(current)
        current = ""
      }
      current = current ? `${current}\n${part}` : part
    }
  }
  if (current) pieces.push(current)
  return pieces
}

/** Groups paragraphs into bodies of at most maxChars, repeating a short tail paragraph as overlap. */
export function packParagraphs(paragraphs: string[], maxChars: number, overlapChars: number): string[] {
  const units = paragraphs.flatMap((p) => (p.length > maxChars ? splitLong(p, maxChars) : [p]))
  const bodies: string[] = []
  let current: string[] = []
  let size = 0

  for (const unit of units) {
    if (current.length && size + unit.length + 2 > maxChars) {
      bodies.push(current.join("\n\n"))
      const tail = current[current.length - 1]
      // Overlap: carry the last paragraph forward when it's short, so context isn't cut mid-thought.
      current = tail.length <= overlapChars && tail.length + unit.length + 2 <= maxChars ? [tail] : []
      size = current.reduce((n, p) => n + p.length + 2, 0)
    }
    current.push(unit)
    size += unit.length + 2
  }
  if (current.length) bodies.push(current.join("\n\n"))
  return bodies
}

export function hashChunk(parts: string[]) {
  return createHash("sha256").update([EMBEDDING_FINGERPRINT, ...parts].join("\u0000")).digest("hex")
}

/**
 * Splits a document into chunks with deterministic IDs ("<documentId>:<index>"). Each chunk's
 * text starts with the document title and section heading, so it makes sense on its own.
 */
export function chunkDocument(doc: KnowledgeDocument, options: Options = {}): Chunk[] {
  const maxChars = options.maxChars ?? RAG_CONFIG.chunking.maxChars
  const overlapChars = options.overlapChars ?? RAG_CONFIG.chunking.overlapChars

  const chunks: Chunk[] = []
  for (const section of splitSections(doc.text)) {
    for (const body of packParagraphs(splitParagraphs(section.body), maxChars, overlapChars)) {
      const index = chunks.length
      const header = section.heading ? [doc.title, `Section: ${section.heading}`] : [doc.title]
      const text = [...header, "", body].join("\n")
      const hash = hashChunk([text, doc.url, doc.publicationStatus, doc.contentType, doc.tags.join(",")])
      chunks.push({
        id: `${doc.id}:${index}`,
        text,
        metadata: {
          documentId: doc.id,
          title: doc.title,
          url: doc.url,
          contentType: doc.contentType,
          section: section.heading,
          tags: doc.tags,
          publicationStatus: doc.publicationStatus,
          updatedAt: doc.updatedAt,
          chunkIndex: index,
          hash,
          text,
        },
      })
    }
  }
  return chunks
}
