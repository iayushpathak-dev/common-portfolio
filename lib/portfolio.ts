// Personal details and all site copy. Components only render what's here. Projects and
// articles live in content/ (see content/types.ts); both are indexed for the AI assistant.

import {
  Blocks,
  Building,
  Briefcase,
  Code,
  Database,
  Download,
  Ellipsis,
  FileText,
  FolderOpen,
  Globe,
  House,
  Info,
  Lightbulb,
  Mail,
  Newspaper,
  Smartphone,
  Sparkles,
  Timer,
  User,
  Users,
  Zap,
} from "lucide-react"

import { GithubIcon, LinkedinIcon, WhatsappIcon } from "@/components/brand-icons"

// Your WhatsApp number with country code, digits only (e.g. "919876543210").
const WHATSAPP_NUMBER = "917906190479"

const RESUME_URL = "/resume.pdf"

const CONTACT = {
  email: "ayushpathakhaldwani@gmail.com",
  phone: "+91 7906190479",
  github: "https://github.com/iayushpathak-dev",
  linkedin: "https://www.linkedin.com/in/dev-ayush-pathak",
  whatsapp: `https://wa.me/${WHATSAPP_NUMBER}`,
}

const PROMPTS = {
  fitpass: "What did you work on at FITPASS?",
  projects: "Tell me about your projects",
  skills: "What are your key skills?",
  about: "Tell me about yourself",
}

export const PORTFOLIO = {
  /* ───────────── About you (also sent to the AI as its knowledge) ───────────── */
  // Facts below come from public/resume.pdf; keep the two in sync.
  profile: {
    name: "Ayush Pathak",
    firstName: "Ayush",
    initials: "AP",
    role: "Senior Frontend Engineer",
    tagline:
      "I build production React.js and Next.js applications, with a focus on frontend architecture, performance and SEO.",
    avatar: "/avatar.webp",
    resumeUrl: RESUME_URL,
    // Not on the resume; shown on the site only.
    location: "Delhi NCR, India",
    totalExperience: "6+ Years",
    contact: CONTACT,
    intro:
      "6+ years of experience building production React.js and Next.js applications. Experienced in frontend architecture, BFF/API integration and SSR, SSG, ISR and CSR, focused on performance, SEO and shipping features to production.",
    summary:
      "Senior Frontend Engineer with 6+ years of experience building production React.js and Next.js applications. Experienced in frontend architecture, BFF/API integration, and SSR, SSG, ISR, and CSR. Focused on performance, SEO, and shipping features to production.",
    // Kept separate from the resume summary: this is current learning, not professional experience.
    aiFocus:
      "I'm expanding into AI application engineering by building real features: this site's assistant uses retrieval-augmented generation (RAG) over my published content, with source citations and controlled web search.",
    quote: "I believe in writing clean code, building scalable products and always learning new things.",
  },

  highlights: [
    { value: "6+", label: "Years Experience", icon: Briefcase },
    { value: "20+", label: "Corporate Clients on Partners Studio", icon: Building },
    { value: "60,000+", label: "Users on the Nutrition Dashboard", icon: Users },
    { value: "4", label: "Rendering Modes on fitpass.co.in (SSR, SSG, ISR, CSR)", icon: Blocks },
  ],

  // Most recent first. location is optional (the resume doesn't list one per job).
  experience: [
    {
      company: "FITPASS",
      role: "Senior Frontend Engineer",
      period: "Nov 2022 – Present",
      duration: "4+ years",
      location: "",
      summary:
        "Building the FITPASS web platform, membership platform, corporate partner web app and dietitian tools with React.js and Next.js.",
      highlights: [
        "fitpass.co.in: built on Next.js, using SSR, SSG, ISR or CSR based on SEO and performance needs, with webhook-triggered ISR so content updates go live without a full rebuild.",
        "BFF layer: built with Next.js Route Handlers to connect backend and external services, handle common business logic and route gRPC calls.",
        "FITSHOP: rebuilt the membership platform on the App Router using Server Components and Server Actions.",
        "Partner Studio: built the web app that 20+ corporate partners open inside their own apps, and moved it to a server-first Next.js 16 architecture.",
        "Nutrition Dashboard: built a JSON-driven UI used by 20+ dietitians to manage plans for 60,000+ users.",
        "Aghora integration: real-time data and user flows across dietitian chat, scheduled calls, audio calls and chat history migration.",
        "Liveness verification: built a flow using TensorFlow Face Landmarks Detection to verify users before booking, and implemented QR scanning for gym workout attendance.",
        // Confirmed by Ayush (Oct 2026); not yet on public/resume.pdf.
        "Mentoring: mentor two junior developers.",
      ],
      technologies: [
        "JavaScript",
        "React.js",
        "Next.js (Pages & App Router)",
        "Zustand",
        "React Query",
        "Tailwind CSS",
        "Material UI",
      ],
    },
    {
      company: "Elite Mindz",
      role: "Software Developer",
      period: "Feb 2022 – Nov 2022",
      duration: "10 months",
      location: "",
      summary:
        "Built QTickets, a multi-region ticket booking platform for movies, events, and sports, with seat selection, checkout, REST API integration, and the Doha Bank payment gateway.",
      highlights: [],
      technologies: ["React.js", "REST APIs", "Payment Gateway"],
    },
    {
      company: "Enbake Consulting",
      role: "Software Engineer",
      period: "Mar 2021 – Dec 2021",
      duration: "10 months",
      location: "",
      summary: "Built LOGITRACK, an IoT dashboard for live shipment tracking, using React.js, TypeScript, and REST APIs.",
      highlights: [],
      technologies: ["React.js", "TypeScript", "REST APIs"],
    },
    {
      company: "Magic Software",
      role: "Digital Media Trainee",
      period: "Jan 2020 – Feb 2021",
      duration: "1 year 2 months",
      location: "",
      summary:
        "Built interactive EdTech learning modules with React.js and HTML5, migrating content from Flash and improving accessibility.",
      highlights: [],
      technologies: ["React.js", "HTML5", "Accessibility"],
    },
  ],

  skillGroups: [
    { title: "Core Frontend", items: ["React.js", "Next.js", "JavaScript (ES6+)", "TypeScript", "HTML5", "CSS3"] },
    {
      title: "React & State Management",
      items: ["React Hooks", "Functional Components", "Redux", "Zustand", "React Query", "Context API"],
    },
    {
      title: "Architecture",
      items: ["Next.js App Router", "Pages Router", "SSR", "SSG", "ISR", "CSR", "Server Components", "Server Actions", "BFF"],
    },
    { title: "APIs & Integration", items: ["REST APIs", "API Integration", "gRPC", "Webhooks"] },
    { title: "UI", items: ["Tailwind CSS", "Material UI", "Responsive Design", "Reusable Components"] },
    {
      title: "Performance & Quality",
      items: ["Core Web Vitals", "Lighthouse", "SEO", "WCAG 2.1 AA", "Jest", "React Testing Library"],
    },
    { title: "AI & Computer Vision", items: ["TensorFlow", "Face Landmarks Detection"] },
    {
      title: "Engineering & AI Tools",
      items: ["Git", "GitHub", "CI/CD", "Agile/Scrum", "Claude Code", "Codex", "ChatGPT"],
    },
  ],

  // period is optional (not on the resume).
  education: [
    { degree: "Master of Computer Applications (MCA)", place: "Graphic Era Deemed University, Dehradun, India", period: "" },
    { degree: "Bachelor of Computer Applications (BCA)", place: "Graphic Era Hill University, Bhimtal, India", period: "" },
  ],

  // AI engineering is current learning. Each topic says how far it has gone, so the site never
  // presents a learning topic as professional experience.
  aiJourney: [
    { topic: "LLM integration and streaming chat UIs", status: "Hands-on Implementation" },
    { topic: "Retrieval-Augmented Generation (RAG)", status: "Hands-on Implementation" },
    { topic: "Embeddings and vector databases", status: "Hands-on Implementation" },
    { topic: "AI evaluation and observability", status: "Hands-on Implementation" },
    { topic: "Claude Code and AI-assisted engineering", status: "Hands-on Implementation" },
    { topic: "Tool calling and structured outputs", status: "Learning Notes" },
    { topic: "Generative UI and AI agents", status: "Learning Notes" },
  ],

  /* ───────────── Site copy ───────────── */
  seo: {
    title: "Ayush Pathak — Senior Frontend Engineer",
    description:
      "I build scalable, high-performance web applications using React.js, Next.js and modern frontend technologies. Ask my AI assistant about my experience, projects and skills.",
  },

  // Every page of the site.
  pages: {
    home: { label: "Home", href: "/", icon: House },
    about: { label: "About", href: "/about", icon: User },
    projects: { label: "Projects", href: "/projects", icon: FolderOpen },
    experience: { label: "Experience", href: "/experience", icon: Briefcase },
    blog: { label: "Blog", href: "/blog", icon: Newspaper },
    resume: { label: "Resume", href: "/resume", icon: FileText },
    assistant: { label: "AI Assistant", href: "/assistant", icon: Sparkles },
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
    { label: "How do you build apps that run inside WebViews?", shortLabel: "WebView apps", prompt: "How do you build web apps that run inside native app WebViews?", icon: Smartphone },
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
    privacyNote: "Questions the assistant can't answer are saved without personal details, so I can add answers later.",
  },

  chat: {
    searchUnavailable: "Web search limit reached, so this answer uses my portfolio data only.",
    genericError: "Something went wrong while answering. Please try again.",
    notConfigured: "The assistant isn't configured yet: set GOOGLE_GENERATIVE_AI_API_KEY in .env.local.",
    retry: "Retry",
    // Fixed replies: sent without calling the model.
    replies: {
      greeting:
        "Hi! I can answer questions about my experience, projects and articles, or about frontend and AI engineering. For example: *What did you build at FITPASS?* or *How does RAG work?*",
      outOfScope:
        "I'm the assistant on my portfolio, so I only answer questions about my work, projects and articles, or about frontend and AI engineering. Try asking about my experience at FITPASS, a project, or a topic like RAG or Next.js rendering.",
      blocked:
        "I can't change how I work or share my configuration. I'm happy to answer questions about my experience, projects and articles, or about frontend and AI engineering.",
      noContext:
        "I don't have published information about that, so I'd rather not guess. You can ask about my experience, projects or articles, or contact me directly on LinkedIn or by email.",
      knowledgeUnavailable:
        "My knowledge base is temporarily unavailable, so I can't answer questions about my work right now. Please try again in a minute.",
      rateLimited: "You're sending messages quickly. Please wait a minute and try again.",
      quota: "The AI provider's usage limit was reached. Please wait a minute and try again.",
      timeout: "The answer took too long. Please try again.",
      emptyAnswer: "I couldn't put an answer together that time. Please try again.",
    },
    routeLabels: {
      portfolio: "From my portfolio",
      web: "Web search",
      general: "General knowledge",
      none: "No matching information",
    },
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

  homePage: {
    availability: "Available for new opportunities",
    greeting: "Hi, I'm",
    headline: "I build web applications with React and Next.js, with a focus on frontend architecture, performance and maintainable code.",
    intro:
      "I've been doing frontend work for 6+ years, mostly on fitness and corporate products. At FITPASS I work on web applications, corporate user journeys, a partner web app that runs inside other apps, API integrations through a Next.js BFF layer, and reusable UI components. I've also built config-driven flows so different corporate clients get the features they need, and I mentor two junior developers.",
    // Hero stats. Kept separate from `highlights` (used on the resume page) and limited to
    // facts that don't depend on business numbers.
    stats: [
      { value: "6+", label: "Years in frontend", icon: Briefcase },
      { value: "4+", label: "Years at FITPASS", icon: Building },
      { value: "2", label: "Junior developers mentored", icon: Users },
      { value: "React · Next.js", label: "Core stack", icon: Code },
    ],
    handwrittenNote: "Frontend Engineer",
    viewWork: "View My Work",
    downloadResume: "Download Resume (PDF)",
    downloadResumeShort: "Download Resume",
    connect: "Let's Connect",
    techStack: ["React.js", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "React Query"],
    // Decorative code card next to the photo.
    codeLines: [
      "const developer = {",
      '  name: "Ayush",',
      '  role: "Frontend Engineer",',
      '  stack: ["React", "Next.js", "TypeScript"],',
      '  experience: "6+ years",',
      "}",
    ],
    whatIDo: [
      { title: "Frontend Architecture", text: "BFF layers, configuration-driven UIs and maintainable component systems.", icon: Blocks },
      { title: "Rendering & SEO", text: "Choosing SSR, SSG, ISR or CSR per page for speed and search.", icon: Lightbulb },
      { title: "Performance", text: "Core Web Vitals, Lighthouse and fast pages inside app WebViews.", icon: Zap },
      { title: "Mentoring", text: "Mentoring two junior developers and shipping with cross-functional teams.", icon: Users },
    ],
    featuredTitle: "Selected Engineering Work",
    featuredSubtitle: "Case studies with the problem, architecture and trade-offs",
    viewAllProjects: "View All Projects",
    featuredCount: 3,
    blogTitle: "Featured Articles",
    blogSubtitle: "Engineering notes and what I'm learning",
    viewAllPosts: "View All Articles",
    postsCount: 3,
    aiTitle: "My AI Engineering Journey",
    aiSubtitle: "What I've built so far, and what I'm still learning",
    aiCta: "Try the AI Assistant",
    contactTitle: "Let's work together",
    contactText:
      "I'm open to senior frontend and AI-focused frontend roles. The quickest way to reach me is LinkedIn or email.",
    contactEmail: "Email me",
    exploreTitle: "Explore",
    careerTitle: "Career Journey",
    viewAll: "View All",
  },

  assistantPage: {
    seoTitle: "AI Assistant — Ayush Pathak",
    seoDescription: "Chat with an AI assistant that answers questions about Ayush Pathak's experience, projects and skills.",
  },

  resumePage: {
    title: "Resume",
    seoTitle: "Resume — Ayush Pathak",
    seoDescription: "Resume of Ayush Pathak, Senior Frontend Engineer: experience, skills, education and projects.",
    summaryTitle: "Professional Summary",
    highlightsTitle: "Key Highlights",
    skillsTitle: "Technical Skills",
    educationTitle: "Education",
    experienceTitle: "Professional Experience",
    keyTechnologies: "Key Technologies",
    actionsTitle: "Resume Actions",
    download: "Download Resume (PDF)",
    preview: "View Resume (Preview)",
    print: "Print Resume",
    lastUpdatedLabel: "Last Updated",
    lastUpdated: "August 2026",
    fileSizeLabel: "File Size",
    fileSize: "272 KB",
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
    seoDescription:
      "About Ayush Pathak, Senior Frontend Engineer at FITPASS: the products I've worked on, the frontend architecture I've designed and what I'm learning now.",
    eyebrow: "About Me",
    intro:
      "Senior Frontend Engineer at FITPASS with 6+ years of frontend experience, mostly in React and Next.js. Most of my work is on product features with many moving parts: corporate journeys that differ from client to client, a BFF layer between the frontend and backend services, and public pages where SEO matters.",
    experienceChip: "6+ Years Experience",
    availability: "Open to Opportunities",
    storyTitle: "My Journey",
    story: [
      "I started in 2020 at Magic Software, converting legacy Flash learning modules into HTML, CSS, JavaScript and React. After that I built LOGITRACK, an IoT dashboard for live shipment tracking, at Enbake Consulting, and QTickets, a ticket booking platform for movies, events and sports, at Elite Mindz.",
      "I joined FITPASS in November 2022, 4 years ago. Since then I've worked on fitpass.co.in, FITSHOP (the membership platform), Partner Studio (the web app corporate partners open inside their apps), the Nutrition Dashboard used by dietitians, campaign-based landing pages, the feedback journey and Segment event tracking.",
      "The architecture work is the part I owned. I designed the config-driven setup for corporate journeys, so each client can have different features enabled through configuration instead of separate code. I also designed and built a BFF layer with Next.js Route Handlers that shapes backend responses into what the pages need. Alongside this, I mentor two junior developers.",
    ],
    aiTitle: "Currently Exploring",
    ai: [
      "I'm learning AI application engineering by building the assistant on this site. It's a personal project, not production AI work.",
      "What works today: my portfolio content is split into chunks, embedded with Gemini and stored in Upstash Vector. Each question is classified first, then answered from the closest matching chunks, with links to the sources. Questions about current tech can use Google Search instead, and the answer says so when search isn't available.",
      "Still in progress: tuning retrieval against an evaluation set of test questions. Tool calling and agents are topics I'm reading about, not building yet.",
    ],
    whatIDoTitle: "What I Work On",
    whatIDo: [
      { title: "Frontend Architecture", text: "Config-driven journeys for different corporate clients, and a Next.js BFF layer.", icon: Blocks },
      { title: "React & Next.js Products", text: "Customer-facing sites, dashboards and apps that run inside WebViews.", icon: Code },
      { title: "Corporate User Journeys", text: "Integration and feedback flows that change from one client to another.", icon: Building },
      { title: "Performance & Maintainability", text: "Picking SSR, SSG, ISR or CSR per page, and reusable components.", icon: Zap },
    ],
    approachTitle: "Engineering Approach",
    approach:
      "I try to write code the next developer can change without fear. In practice that means clear boundaries (the BFF keeps backend details out of components), configuration instead of copy-paste when clients need different things, and shared components instead of near-duplicates. Product requirements change often, so I prefer designs that can take a new client or flow without a rewrite. Day to day I work closely with backend developers and the product team.",
    quickFactsTitle: "Quick Facts",
    availableForLabel: "Available For",
    availableFor: "Full-time Opportunities",
  },

  blogPage: {
    seoTitle: "Blog — Ayush Pathak",
    seoDescription:
      "Technical articles and learning notes by Ayush Pathak on AI engineering, RAG, React, Next.js, frontend architecture and performance.",
    title: "Blog",
    subtitle: "Engineering notes and learning in public",
    description:
      "Each article is labelled: Professional Experience, Hands-on Implementation, Experiment or Learning Notes, so it's clear what I've built and what I'm studying.",
    searchPlaceholder: "Search articles...",
    allLabel: "All",
    noArticlesYet: "Articles are being reviewed and will appear here soon.",
    plannedTitle: "Planned topics",
    plannedSubtitle: "Articles I'm planning to write next.",
    relatedProjectsTitle: "Related projects",
    relatedArticlesTitle: "Related articles",
    referencesTitle: "References",
    backToBlog: "All articles",
    updatedLabel: "Updated",
    featuredLabel: "Featured",
    minRead: "min read",
    readArticle: "Read Article",
    askAi: "Ask AI about this",
    askPrompt: "Explain this topic from your experience:",
    empty: "No articles match your search.",
  },

  projectsPage: {
    seoTitle: "Projects — Ayush Pathak",
    seoDescription: "Selected frontend projects by Ayush Pathak: web apps, architecture, dashboards and performance work.",
    title: "Projects",
    subtitle: "Product work that I'm proud of.",
    description:
      "Case studies of work I've done professionally and on my own. Each one separates confirmed facts from general trade-offs.",
    allLabel: "All",
    filters: ["Web App", "Architecture", "Performance", "Integrations", "AI"],
    featuredLabel: "Featured",
    caseStudy: "View Case Study",
    askAi: "Ask AI",
    github: "GitHub",
    live: "Live site",
    caseStudyPrompt: "Tell me about the project:",
    empty: "No projects in this category yet.",
    backToProjects: "All projects",
    stackTitle: "Technology stack",
    sections: {
      problem: "Business or user problem",
      challenge: "Technical challenge",
      contribution: "My contribution",
      architecture: "Architecture and data flow",
      decisions: "Implementation decisions",
      tradeoffs: "Trade-offs and alternatives",
      limitations: "Challenges and limitations",
      impact: "Impact",
      lessons: "Lessons learned",
    },
    tradeoffsNote:
      "General engineering trade-offs for this kind of system. They are not a record of decisions made on this project unless stated above.",
    relatedArticlesTitle: "Related articles",
    todoTitle: "TODO before publishing (visible in development only)",
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

