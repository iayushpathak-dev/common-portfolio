"use client"

import { useSyncExternalStore } from "react"
import type { AssistantMessage } from "@/lib/chat-modes"

export type StoredChat = {
  id: string
  title: string
  messages: AssistantMessage[]
  updatedAt: number
}

const STORAGE_KEY = "ai-assistant-chats"
const MAX_CHATS = 20
const EMPTY: StoredChat[] = []

let cache: StoredChat[] | null = null
const listeners = new Set<() => void>()

function read(): StoredChat[] {
  if (cache) return cache
  try {
    cache = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as StoredChat[]
  } catch {
    cache = []
  }
  return cache
}

function write(chats: StoredChat[]) {
  cache = chats
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
  } catch {}
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useChatHistory() {
  return useSyncExternalStore(subscribe, read, () => EMPTY)
}

function titleFrom(messages: AssistantMessage[]) {
  const firstUser = messages.find((m) => m.role === "user")
  const text = firstUser?.parts.find((p) => p.type === "text")?.text ?? "New chat"
  return text.length > 40 ? `${text.slice(0, 40).trimEnd()}…` : text
}

export function saveChat(id: string, messages: AssistantMessage[]) {
  if (messages.length === 0) return
  const chat: StoredChat = { id, title: titleFrom(messages), messages, updatedAt: Date.now() }
  write([chat, ...read().filter((c) => c.id !== id)].slice(0, MAX_CHATS))
}

export function deleteChat(id: string) {
  write(read().filter((c) => c.id !== id))
}

export function timeAgo(timestamp: number) {
  const minutes = Math.round((Date.now() - timestamp) / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}
