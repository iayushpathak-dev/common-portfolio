import { useEffect, useRef } from "react"
import { sendGAEvent, sendGTMEvent } from "@next/third-parties/google"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

type EventParams = Record<string, string | number | boolean | null | undefined>

/** Sends one event to GA4 (gtag) and/or GTM (dataLayer), whichever is configured. */
export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === "undefined") return
  if (GA_ID) sendGAEvent("event", name, params)
  if (GTM_ID) sendGTMEvent({ event: name, ...params })
}

const SEARCH_DEBOUNCE_MS = 1000

/**
 * Reports what the user typed in a search box once they pause typing, using GA4's
 * recommended `search` event. Repeats of the same term and empty boxes are skipped.
 */
export function useTrackSearch(query: string, location: string, resultCount?: number) {
  const lastSent = useRef("")
  // Read the latest count when the timer fires without restarting the debounce on every change.
  const countRef = useRef(resultCount)
  useEffect(() => {
    countRef.current = resultCount
  })

  useEffect(() => {
    const term = query.trim()
    if (term === "") {
      lastSent.current = ""
      return
    }
    const timer = setTimeout(() => {
      if (term.toLowerCase() === lastSent.current) return
      lastSent.current = term.toLowerCase()
      trackEvent("search", { search_term: term, search_location: location, result_count: countRef.current })
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query, location])
}
