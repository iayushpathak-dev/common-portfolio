// Markdown files are imported as raw strings (see the turbopack rule in next.config.ts and
// the matching plugin in vitest.config.ts).
declare module "*.md" {
  const content: string
  export default content
}
