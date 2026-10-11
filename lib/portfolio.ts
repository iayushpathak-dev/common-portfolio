// Single source of truth for all portfolio content: personal details, the facts the AI
// assistant answers from, and every piece of copy shown on the site. Components only
// render what's here, so to change any text on the site, edit this file.
//
// TODO: fill in WHATSAPP_NUMBER, the LinkedIn/GitHub URLs, and add public/resume.pdf
// and public/avatar.png.

import {
  Atom,
  BookOpen,
  Blocks,
  Box,
  Briefcase,
  Code,
  Database,
  Download,
  Ellipsis,
  FileText,
  FolderOpen,
  Globe,
  GraduationCap,
  Handshake,
  House,
  Info,
  Layers,
  LayoutDashboard,
  Lightbulb,
  Mail,
  Newspaper,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  User,
  Users,
  Zap,
} from "lucide-react"

import { GithubIcon, LinkedinIcon, WhatsappIcon } from "@/components/brand-icons"

// Your WhatsApp number with country code, digits only (e.g. "919876543210").
const WHATSAPP_NUMBER = ""

const RESUME_URL = "/resume.pdf"

const CONTACT = {
  email: "ayushpathakhaldwani@gmail.com",
  github: "https://github.com/iayushpathak-dev",
  // e.g. "https://www.linkedin.com/in/your-handle/"
  linkedin: "https://www.linkedin.com/",
  whatsapp: `https://wa.me/${WHATSAPP_NUMBER}`,
}

const PROMPTS = {
  fitpass: "What did you work on at Fitpass?",
  projects: "Tell me about your projects",
  skills: "What are your key skills?",
  about: "Tell me about yourself",
}

export const PORTFOLIO = {
  /* ───────────── About you (also sent to the AI as its knowledge) ───────────── */
  profile: {
    name: "Ayush Pathak",
    firstName: "Ayush",
    initials: "AP",
    role: "Senior Frontend Developer",
    tagline:
      "I build scalable, high-performance web applications using React.js, Next.js and modern frontend technologies.",
    avatar: "/avatar.png",
    resumeUrl: RESUME_URL,
    location: "Delhi NCR, India",
    totalExperience: "6+ Years",
    contact: CONTACT,
    intro:
      "6+ years of experience building scalable, high-performance web applications using React.js, Next.js and modern frontend technologies. Passionate about creating great user experiences, solving complex problems and building impactful products.",
    summary:
      "Senior Frontend Developer with 6+ years of experience in designing and developing scalable, high-performance web applications. Expertise in React.js, Next.js, TypeScript and modern frontend technologies. Experienced in building product features from scratch, optimizing performance, creating architecture for complex user journeys and leading frontend development initiatives in cross-functional teams.",
    quote: "I believe in writing clean code, building scalable products and always learning new things.",
  },

  // TODO: verify these numbers; the AI repeats them as facts.
  highlights: [
    { value: "6+", label: "Years Experience", icon: Briefcase },
    { value: "7+", label: "Product Projects", icon: Box },
    { value: "1M+", label: "Users Impacted", icon: Users },
    { value: "2", label: "Junior Developers Mentored", icon: GraduationCap },
  ],

  // Most recent first. TODO: replace "Earlier Company" with the real name and check dates.
  experience: [
    {
      company: "Fitpass",
      role: "Senior Frontend Developer",
      period: "Mar 2020 – Present",
      duration: "6+ years",
      location: "Delhi NCR, India",
      summary:
        "Working on the Fitpass web platform and corporate PWA used by 1M+ users. Built scalable features, optimized performance and led frontend development for multiple products.",
      highlights: [
        "PWA Development: migrated the Fitpass Consumer App to a Progressive Web App, significantly improving performance and user experience.",
        "BFF Architecture: designed and implemented a Backend-for-Frontend layer that simplified integration with multiple backend services.",
        "Corporate Integrations: built a config-driven approach and custom integrations for corporate clients, including authentication, access control and reporting modules.",
        "Performance Optimization: improved app loading speed, bundle size and overall performance.",
        "Team Collaboration: shipped features with cross-functional teams and mentored 2+ junior developers.",
      ],
      technologies: ["React.js", "Next.js", "TypeScript", "Redux", "Zustand", "React Query", "BFF", "PWA", "Performance"],
    },
    {
      company: "Earlier Company",
      role: "Frontend Developer",
      period: "2018 – 2020",
      duration: "2 years",
      location: "Delhi NCR, India",
      summary: "Worked on web applications and product features using React.js and JavaScript.",
      highlights: [
        "Worked on web applications, product features and frontend development using React.js and JavaScript.",
        "Collaborated with backend teams to integrate APIs and build new features.",
      ],
      technologies: ["React.js", "JavaScript", "HTML", "CSS", "Git"],
    },
  ],

  skillGroups: [
    { title: "Frontend", items: ["React.js", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS"] },
    { title: "State Management", items: ["Redux", "Zustand", "React Query"] },
    { title: "Tools & Others", items: ["Git", "Docker", "CI/CD", "AWS (Basic)", "Jest", "Playwright"] },
    {
      title: "Architecture & Concepts",
      items: ["SSR / SSG / ISR", "Micro Frontends", "BFF Architecture", "Performance Optimization"],
    },
    { title: "Other Skills", items: ["REST APIs", "Web Vitals", "PWA", "System Design (Frontend)"] },
  ],

  education: [
    { degree: "BCA - Computer Science & Applications", place: "Uttarakhand, India", period: "2013 – 2016" },
  ],

  certifications: [
    { name: "Frontend Development (Self Learning)", status: "Ongoing" },
    { name: "React & Next.js Projects", status: "Completed" },
    { name: "JavaScript & TypeScript", status: "Completed" },
  ],

  // visual: how the card's image area is drawn (no screenshots yet).
  // githubUrl / caseStudyUrl are optional; without caseStudyUrl, "View Case Study" asks the AI.
  // TODO: verify project details; add screenshots and real links when available.
  projects: [
    {
      name: "Fitpass Corporate PWA",
      description:
        "A progressive web app used by multiple corporate clients inside their native apps (webviews). Configurable features per corporate with optimized performance and seamless user experience.",
      tags: ["Next.js", "React.js", "PWA"],
      categories: ["Web App", "PWA"],
      featured: true,
      visual: { kind: "icon", icon: Smartphone },
    },
    {
      name: "BFF & Config-driven Architecture",
      description:
        "Multi-tenant integration with a BFF layer in Next.js to filter and transform responses from a legacy backend into clean JSON config for different corporate clients.",
      tags: ["Next.js", "Architecture", "BFF"],
      categories: ["Architecture"],
      visual: { kind: "diagram", clients: ["Corporate App", "Config (JSON)"], hub: "BFF (Next.js)", backend: "Legacy Backend" },
    },
    {
      name: "Landing Pages & Marketing Website",
      description:
        "High-performance marketing website with SEO optimization, dynamic content and analytics integration.",
      tags: ["Next.js", "SEO", "Performance"],
      categories: ["Web App", "Performance"],
      visual: { kind: "icon", icon: Globe },
    },
    {
      name: "Internal Dashboard",
      description:
        "Internal dashboard for operations and business teams with real-time data, charts and reporting modules.",
      tags: ["React.js", "TypeScript", "Charts"],
      categories: ["Web App"],
      visual: { kind: "icon", icon: LayoutDashboard },
    },
    {
      name: "Performance Optimization",
      description:
        "Improved app loading speed, bundle size and Core Web Vitals through code splitting, caching and rendering optimizations.",
      tags: ["Performance", "Web Vitals", "React.js"],
      categories: ["Performance"],
      visual: { kind: "score", score: 95, label: "Performance" },
    },
    {
      name: "AI Portfolio Assistant",
      description:
        "This site: a portfolio you can chat with. Built with Next.js, Tailwind CSS, shadcn/ui, the Vercel AI SDK and Google's Gemma/Gemini models, with answers grounded in portfolio data and optional Google Search.",
      tags: ["Next.js", "AI SDK", "Tailwind CSS"],
      categories: ["Web App"],
      visual: { kind: "icon", icon: Sparkles },
      githubUrl: "https://github.com/iayushpathak-dev/common-portfolio",
    },
  ],

  // Articles aren't written yet: without a url, a post offers "Ask AI about this" instead.
  // TODO: add real articles and their url.
  posts: [
    {
      title: "React Performance Optimization: Practical Guide for Production Apps",
      date: "Oct 3, 2026",
      readMinutes: 8,
      excerpt:
        "Learn practical techniques to optimize React applications including memoization, code splitting, virtualization and real-world performance tips.",
      tags: ["React", "Performance", "Web Vitals"],
      categories: ["React", "Performance"],
      featured: true,
      icon: Atom,
    },
    {
      title: "Next.js Rendering Methods: SSR, SSG, ISR Explained",
      date: "Sep 28, 2026",
      readMinutes: 6,
      excerpt: "A complete guide to understand different rendering methods in Next.js, their use cases and best practices.",
      tags: ["Next.js", "SSR", "SSG", "ISR"],
      categories: ["Next.js"],
      icon: Code,
    },
    {
      title: "Frontend Architecture at Scale",
      date: "Sep 10, 2026",
      readMinutes: 7,
      excerpt:
        "Key learnings from building large frontend applications with micro frontends, BFF and modular architecture.",
      tags: ["Architecture", "Micro Frontends", "BFF"],
      categories: ["Architecture"],
      icon: Layers,
    },
    {
      title: "Using AI Tools in Frontend Development",
      date: "Aug 29, 2026",
      readMinutes: 5,
      excerpt: "How I use Claude and other AI tools to improve productivity, write better code and learn faster.",
      tags: ["AI", "Productivity", "Developer Tools"],
      categories: ["AI", "Career"],
      icon: Sparkles,
    },
  ],

  /* ───────────── Site copy ───────────── */
  seo: {
    title: "Ayush Pathak — Senior Frontend Developer",
    description:
      "I build scalable, high-performance web applications using React.js, Next.js and modern frontend technologies. Ask my AI assistant about my experience, projects and skills.",
  },

  // Every page of the site. Home is the AI assistant for now.
  pages: {
    home: { label: "Home", href: "/", icon: House },
    about: { label: "About", href: "/about", icon: User },
    projects: { label: "Projects", href: "/projects", icon: FolderOpen },
    experience: { label: "Experience", href: "/experience", icon: Briefcase },
    blog: { label: "Blog", href: "/blog", icon: Newspaper },
    resume: { label: "Resume", href: "/resume", icon: FileText },
    assistant: { label: "AI Assistant", href: "/", icon: Sparkles },
  },

  header: {
    menuTitle: "Menu",
  },

  mobileNav: {
    moreLabel: "More",
    moreIcon: Ellipsis,
  },

  hero: {
    greeting: "Hi, I'm",
    wave: "👋",
    intro: "Ask me anything about my experience, projects, skills or the latest in frontend development.",
  },

  // label: desktop chip, shortLabel: mobile grid, prompt: what gets sent to the assistant
  suggestions: [
    { label: PROMPTS.fitpass, shortLabel: "Fitpass experience", prompt: PROMPTS.fitpass, icon: Briefcase },
    { label: PROMPTS.projects, shortLabel: "My projects", prompt: PROMPTS.projects, icon: FolderOpen },
    { label: PROMPTS.skills, shortLabel: "Key skills", prompt: PROMPTS.skills, icon: Zap },
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
    { label: "How do you build PWAs?", shortLabel: "Build PWAs", prompt: "How do you build PWAs?", icon: Smartphone },
  ],

  sidebar: {
    newChat: "New Chat",
    recentChats: "Recent Chats",
    searchPlaceholder: "Search chats…",
    emptyHistory: "Your conversations will appear here.",
    noMatches: "No chats match.",
    assistantTitle: "AI Assistant",
    recommended: "(Recommended)",
    connectTitle: "Let's Connect",
    socials: [
      { label: "LinkedIn", href: CONTACT.linkedin, icon: LinkedinIcon },
      { label: "GitHub", href: CONTACT.github, icon: GithubIcon },
      { label: "Email", href: `mailto:${CONTACT.email}`, icon: Mail },
      { label: "WhatsApp", href: CONTACT.whatsapp, icon: WhatsappIcon },
    ],
  },

  // Source modes shown in the sidebar and composer. Keys match ChatMode.
  modes: {
    auto: { label: "Auto", description: "AI chooses the best source", icon: Sparkles },
    knowledge: { label: "My Knowledge", description: "My experience, projects, skills", icon: Database },
    web: { label: "Web Search", description: "Latest technology information", icon: Globe },
  },

  composer: {
    placeholder: "Ask me anything...",
    send: "Send",
    stop: "Stop",
    shortcutHint: "Ctrl + Enter to send",
  },

  chat: {
    searchUnavailable: "Web search limit reached, so this answer uses my portfolio data only.",
    genericError: "Something went wrong while answering. Please try again.",
    notConfigured: "The assistant isn't configured yet: set GOOGLE_GENERATIVE_AI_API_KEY in .env.local.",
    retry: "Retry",
  },

  insights: {
    sourcesTitle: "Sources Used",
    sources: {
      knowledge: { title: "Personal Knowledge", subtitle: "Information from my portfolio data" },
      web: { title: "Web Search", subtitle: "Latest information from internet" },
    },
    relatedTitle: "Related Sections",
    related: [
      { title: "Fitpass Experience", subtitle: "View detailed experience", prompt: PROMPTS.fitpass, icon: Briefcase },
      { title: "Projects", subtitle: "Explore my work", prompt: PROMPTS.projects, icon: FolderOpen },
      { title: "Skills", subtitle: "Technical expertise", prompt: PROMPTS.skills, icon: Timer },
      { title: "About Me", subtitle: "Know more about me", prompt: PROMPTS.about, icon: Info },
    ],
    quickActionsTitle: "Quick Actions",
    // Either an href (opens a link) or a prompt (asks the assistant).
    quickActions: [
      { label: "View My Resume", href: RESUME_URL, icon: Download },
      { label: "See Projects", prompt: PROMPTS.projects, icon: FolderOpen },
      { label: "Connect on LinkedIn", href: CONTACT.linkedin, icon: LinkedinIcon },
      { label: "View GitHub", href: CONTACT.github, icon: GithubIcon },
    ],
    modelTitle: "Currently Using",
    modelProvider: "Google AI via Vercel AI SDK",
    online: "Online",
    offline: "No API key",
    modelNote: "Auto-selects between my knowledge and web search based on your question.",
  },

  resumePage: {
    title: "Resume",
    seoTitle: "Resume — Ayush Pathak",
    seoDescription: "Resume of Ayush Pathak, Senior Frontend Developer: experience, skills, education and projects.",
    summaryTitle: "Professional Summary",
    highlightsTitle: "Key Highlights",
    skillsTitle: "Technical Skills",
    educationTitle: "Education",
    certificationsTitle: "Certifications",
    certificationsNote: "(Optional)",
    experienceTitle: "Professional Experience",
    keyTechnologies: "Key Technologies",
    actionsTitle: "Resume Actions",
    download: "Download Resume (PDF)",
    preview: "View Resume (Preview)",
    print: "Print Resume",
    lastUpdatedLabel: "Last Updated",
    lastUpdated: "October 2026",
    fileSizeLabel: "File Size",
    fileSize: "245 KB",
    quickInfoTitle: "Quick Info",
    quickInfo: {
      experience: "Experience",
      role: "Current Role",
      company: "Current Company",
      location: "Location",
    },
    connectTitle: "Let's Connect",
    connectText: "Open to new opportunities and interesting projects.",
    tabs: { summary: "Summary", skills: "Skills", experience: "Experience", education: "Education" },
  },

  aboutPage: {
    seoTitle: "About — Ayush Pathak",
    seoDescription: "About Ayush Pathak, Senior Frontend Developer: my story, what I do and what I value.",
    eyebrow: "About Me",
    intro:
      "I'm a frontend developer who enjoys building scalable, high-performance web applications using React.js, Next.js and modern technologies. I love solving real world problems, learning new tech and creating products that make an impact.",
    experienceChip: "6+ Years Experience",
    availability: "Open to Opportunities",
    storyTitle: "My Story",
    story: [
      "I started my career with a curiosity for how things work on the web. Over the years, I've worked on product applications, PWA platforms, corporate integrations and performance optimization, gaining hands-on experience in building scalable frontend systems.",
      "I enjoy working on complex problems, learning new technologies and collaborating with cross-functional teams to deliver high-quality products.",
    ],
    whatIDoTitle: "What I Do",
    whatIDo: [
      { title: "Build Products", text: "Develop scalable and maintainable frontend applications.", icon: Blocks },
      { title: "Solve Problems", text: "Turn complex requirements into simple and efficient solutions.", icon: Lightbulb },
      { title: "Collaborate", text: "Work with cross-functional teams to deliver great user experiences.", icon: Users },
      { title: "Learn & Improve", text: "Keep exploring new technologies and improve as a developer.", icon: TrendingUp },
    ],
    valuesTitle: "My Values",
    values: [
      { title: "Clean & Maintainable Code", text: "Write code that is easy to understand and scale.", icon: ShieldCheck },
      { title: "User Focused", text: "Always think from the end user's perspective.", icon: Target },
      { title: "Continuous Learning", text: "Keep learning and adapting to new technologies.", icon: BookOpen },
      { title: "Team Collaboration", text: "Believe in sharing knowledge and growing together.", icon: Handshake },
    ],
    quickFactsTitle: "Quick Facts",
    availableForLabel: "Available For",
    availableFor: "Full-time Opportunities",
  },

  blogPage: {
    seoTitle: "Blog — Ayush Pathak",
    seoDescription: "Thoughts, tutorials and learnings about frontend development, performance and architecture.",
    title: "Blog",
    subtitle: "Sharing what I learn",
    description: "Thoughts, tutorials and learnings about frontend development, performance, architecture and more.",
    searchPlaceholder: "Search articles...",
    allLabel: "All",
    categories: ["React", "Next.js", "Performance", "Architecture", "AI", "Career"],
    featuredLabel: "Featured",
    minRead: "min read",
    readArticle: "Read Article",
    askAi: "Ask AI about this",
    askPrompt: "Explain this topic from your experience:",
    empty: "No articles match your search.",
  },

  projectsPage: {
    seoTitle: "Projects — Ayush Pathak",
    seoDescription: "Selected frontend projects by Ayush Pathak: PWAs, architecture, dashboards and performance work.",
    title: "Projects",
    subtitle: "Product work that I'm proud of.",
    description:
      "A few selected projects that showcase my experience in building real world applications, solving complex problems and creating great user experiences.",
    allLabel: "All",
    filters: ["Web App", "PWA", "Architecture", "Performance"],
    featuredLabel: "Featured",
    caseStudy: "View Case Study",
    github: "GitHub",
    caseStudyPrompt: "Tell me about the project:",
    empty: "No projects in this category yet.",
  },

  experiencePage: {
    seoTitle: "Experience — Ayush Pathak",
    seoDescription: "Ayush Pathak's professional journey: roles, responsibilities and technologies.",
    title: "Experience",
    subtitle: "My professional journey and impact.",
    description:
      "6+ years of experience building web applications, working with amazing teams and contributing to impactful products.",
    responsibilitiesTitle: "Key Responsibilities",
    technologiesTitle: "Key Technologies",
    educationTitle: "Education",
  },
} as const

/** The factual part of the portfolio, serialised into the AI's instructions. */
export function portfolioContext() {
  const { profile, highlights, experience, skillGroups, education, certifications, projects } = PORTFOLIO
  return JSON.stringify(
    {
      profile,
      highlights: highlights.map(({ value, label }) => `${value} ${label}`),
      experience,
      skills: skillGroups,
      education,
      certifications,
      projects: projects.map(({ name, description, tags }) => ({ name, description, tags })),
    },
    null,
    2,
  )
}
