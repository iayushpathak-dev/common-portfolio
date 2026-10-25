// Triggers a reindex of the AI assistant's knowledge base.
//
//   npm run rag:reindex                          # local dev server (http://localhost:3000)
//   npm run rag:reindex -- https://ayushpathak.co.in
//   npm run rag:reindex -- https://ayushpathak.co.in --status   # show the last run only
//
// Reads RAG_ADMIN_SECRET from the environment (or .env.local).

const args = process.argv.slice(2)
const statusOnly = args.includes("--status")
const base = (args.find((a) => !a.startsWith("--")) ?? process.env.RAG_REINDEX_URL ?? "http://localhost:3000").replace(/\/+$/, "")
const secret = process.env.RAG_ADMIN_SECRET

if (!secret) {
  console.error("RAG_ADMIN_SECRET is not set (add it to .env.local or the environment).")
  process.exit(1)
}

const res = await fetch(`${base}/api/rag/reindex`, {
  method: statusOnly ? "GET" : "POST",
  headers: { authorization: `Bearer ${secret}` },
})
const body = await res.text()
console.log(`${res.status} ${res.statusText}`)
try {
  console.log(JSON.stringify(JSON.parse(body), null, 2))
} catch {
  console.log(body.slice(0, 2000))
}
// 207 = partial success (some batches failed); treat as failure so CI notices.
process.exit(res.status === 200 ? 0 : 1)
