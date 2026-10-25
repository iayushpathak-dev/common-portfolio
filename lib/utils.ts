export { cn } from "cn"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** "2026-10-18" → "Oct 18, 2026", independent of the server's locale and time zone. */
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return `${MONTHS[m - 1]} ${d}, ${y}`
}
