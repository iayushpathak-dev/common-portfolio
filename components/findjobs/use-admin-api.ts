"use client"

import { useCallback } from "react"

// Requests from the /findjobs dashboard. The login sets an httpOnly cookie, which the browser
// sends automatically on same-origin requests, so no token is kept in JavaScript.

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

export type Call = <T>(path: string, init?: { method?: "GET" | "POST"; body?: unknown }) => Promise<T>

export function useJobApi(): Call {
  return useCallback(async <T,>(path: string, init: { method?: "GET" | "POST"; body?: unknown } = {}): Promise<T> => {
    const res = await fetch(path, {
      method: init.method ?? "GET",
      headers: { "Content-Type": "application/json" },
      body: init.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
      credentials: "same-origin",
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new ApiError(json.error ?? `Request failed (${res.status})`, res.status)
    return json as T
  }, [])
}
