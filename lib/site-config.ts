import {
  Briefcase,
  Code,
  Database,
  FolderOpen,
  Globe,
  Info,
  Smartphone,
  Sparkles,
  Timer,
  Zap,
  type LucideIcon,
} from "lucide-react"

import type { ChatMode } from "@/lib/chat-modes"

export const navLinks = [
  { label: "Home", href: "#" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Blog", href: "#blog" },
]

export type Suggestion = {
  label: string
  shortLabel: string
  prompt: string
  icon: LucideIcon
}

export const suggestions: Suggestion[] = [
  {
    label: "What did you work on at Fitpass?",
    shortLabel: "Fitpass experience",
    prompt: "What did you work on at Fitpass?",
    icon: Briefcase,
  },
  {
    label: "Tell me about your projects",
    shortLabel: "My projects",
    prompt: "Tell me about your projects",
    icon: FolderOpen,
  },
  {
    label: "What are your key skills?",
    shortLabel: "Key skills",
    prompt: "What are your key skills?",
    icon: Zap,
  },
  {
    label: "Latest Next.js version?",
    shortLabel: "Latest Next.js",
    prompt: "What is the latest Next.js version and what's new in it?",
    icon: Info,
  },
  {
    label: "Compare React vs Vue",
    shortLabel: "React vs Vue",
    prompt: "Compare React vs Vue for a large production app",
    icon: Code,
  },
  {
    label: "How do you build PWAs?",
    shortLabel: "Build PWAs",
    prompt: "How do you build PWAs?",
    icon: Smartphone,
  },
]

export const relatedSections = [
  { title: "Fitpass Experience", subtitle: "View detailed experience", prompt: "What did you work on at Fitpass?", icon: Briefcase },
  { title: "Projects", subtitle: "Explore my work", prompt: "Tell me about your projects", icon: FolderOpen },
  { title: "Skills", subtitle: "Technical expertise", prompt: "What are your key skills?", icon: Timer },
  { title: "About Me", subtitle: "Know more about me", prompt: "Tell me about yourself", icon: Info },
]

export const modeOptions: {
  value: ChatMode
  label: string
  description: string
  icon: LucideIcon
  tone: string
}[] = [
  {
    value: "auto",
    label: "Auto",
    description: "AI chooses the best source",
    icon: Sparkles,
    tone: "bg-primary text-primary-foreground",
  },
  {
    value: "knowledge",
    label: "My Knowledge",
    description: "My experience, projects, skills",
    icon: Database,
    tone: "bg-success text-white",
  },
  {
    value: "web",
    label: "Web Search",
    description: "Latest technology information",
    icon: Globe,
    tone: "bg-blue-600 text-white",
  },
]
