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
  Building,
  Briefcase,
  Code,
  Database,
  Download,
  Ellipsis,
  FileText,
  FolderOpen,
  Gauge,
  Globe,
  Handshake,
  House,
  Info,
  Layers,
  LayoutDashboard,
  Lightbulb,
  Mail,
  Newspaper,
  ScanFace,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  Ticket,
  Timer,
  TrendingUp,
  Truck,
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
    avatar: "/avatar.png",
    resumeUrl: RESUME_URL,
    // Not on the resume; shown on the site only.
    location: "Delhi NCR, India",
    totalExperience: "6+ Years",
    contact: CONTACT,
    intro:
      "6+ years of experience building production React.js and Next.js applications. Experienced in frontend architecture, BFF/API integration and SSR, SSG, ISR and CSR, focused on performance, SEO and shipping features to production.",
    summary:
      "Senior Frontend Engineer with 6+ years of experience building production React.js and Next.js applications. Experienced in frontend architecture, BFF/API integration, and SSR, SSG, ISR, and CSR. Focused on performance, SEO, and shipping features to production.",
    quote: "I believe in writing clean code, building scalable products and always learning new things.",
  },

  highlights: [
    { value: "6+", label: "Years Experience", icon: Briefcase },
    { value: "20+", label: "Corporate Clients on Partners Studio", icon: Building },
    { value: "60,000+", label: "Users on the Nutrition Dashboard", icon: Users },
    { value: "90+", label: "Lighthouse Scores on fitpass.co.in", icon: Gauge },
  ],

  // Most recent first. location is optional (the resume doesn't list one per job).
  experience: [
    {
      company: "FITPASS",
      role: "Senior Frontend Engineer",
      period: "Nov 2022 – Present",
      duration: "3+ years",
      location: "",
      summary:
        "Building the FITPASS web platform, membership platform, corporate PWA and dietitian tools with React.js and Next.js.",
      highlights: [
        "fitpass.co.in: built on Next.js, using SSR, SSG, ISR or CSR based on SEO and performance needs, with webhook-triggered ISR and Lighthouse scores in the 90s.",
        "BFF layer: built with Next.js Route Handlers to connect backend and external services, handle common business logic and route gRPC calls.",
        "FITSHOP: rebuilt the membership platform on the App Router using Server Components and Server Actions.",
        "Partners Studio: shipped a React PWA used by 20+ corporate clients, with offline support and service workers.",
        "Nutrition Dashboard: built a JSON-driven UI used by 20+ dietitians to manage plans for 60,000+ users.",
        "Aghora integration: real-time data and user flows across dietitian chat, scheduled calls, audio calls and chat history migration.",
        "Liveness verification: built a flow using TensorFlow Face Landmarks Detection to verify users before booking, and implemented QR scanning for gym workout attendance.",
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

  // visual: how the card's image area is drawn (no screenshots yet).
  // githubUrl / caseStudyUrl are optional; without caseStudyUrl, "View Case Study" asks the AI.
  projects: [
    {
      name: "Partners Studio",
      description:
        "A React PWA used by 20+ corporate clients, with offline support and service workers. Built at FITPASS.",
      tags: ["React.js", "PWA", "Service Workers"],
      categories: ["Web App", "PWA"],
      featured: true,
      visual: { kind: "icon", icon: Smartphone },
    },
    {
      name: "fitpass.co.in",
      description:
        "The FITPASS website on Next.js, using SSR, SSG, ISR or CSR per page based on SEO and performance needs, with webhook-triggered ISR and Lighthouse scores in the 90s.",
      tags: ["Next.js", "SEO", "ISR"],
      categories: ["Web App", "Performance"],
      visual: { kind: "score", score: 90, display: "90+", label: "Lighthouse" },
    },
    {
      name: "BFF Layer",
      description:
        "A Backend-for-Frontend built with Next.js Route Handlers that connects backend and external services, handles common business logic and routes gRPC calls.",
      tags: ["Next.js", "Route Handlers", "gRPC"],
      categories: ["Architecture"],
      visual: { kind: "diagram", clients: ["Web", "PWA"], hub: "BFF (Route Handlers)", backend: "Services & gRPC" },
    },
    {
      name: "FITSHOP",
      description:
        "The FITPASS membership platform, rebuilt on the Next.js App Router using Server Components and Server Actions.",
      tags: ["Next.js App Router", "Server Components", "Server Actions"],
      categories: ["Web App", "Architecture"],
      visual: { kind: "icon", icon: ShoppingBag },
    },
    {
      name: "Nutrition Dashboard",
      description:
        "A JSON-driven UI used by 20+ dietitians to manage plans for 60,000+ users, with Aghora integration for real-time dietitian chat, scheduled calls, audio calls and chat history migration.",
      tags: ["React.js", "JSON-driven UI", "Real-time"],
      categories: ["Web App"],
      visual: { kind: "icon", icon: LayoutDashboard },
    },
    {
      name: "Liveness Verification",
      description:
        "A flow using TensorFlow Face Landmarks Detection to verify users before booking, plus QR scanning for gym workout attendance.",
      tags: ["TensorFlow", "Face Landmarks", "QR Scanning"],
      categories: ["AI"],
      visual: { kind: "icon", icon: ScanFace },
    },
    {
      name: "QTickets",
      description:
        "A multi-region ticket booking platform for movies, events and sports, with seat selection, checkout, REST API integration and the Doha Bank payment gateway. Built at Elite Mindz.",
      tags: ["React.js", "REST APIs", "Payments"],
      categories: ["Web App"],
      visual: { kind: "icon", icon: Ticket },
    },
    {
      name: "LOGITRACK",
      description:
        "An IoT dashboard for live shipment tracking, built with React.js, TypeScript and REST APIs at Enbake Consulting.",
      tags: ["React.js", "TypeScript", "IoT"],
      categories: ["Web App"],
      visual: { kind: "icon", icon: Truck },
    },
    {
      name: "AI Portfolio Assistant",
      description:
        "This site: a portfolio you can chat with. Built with Next.js, Tailwind CSS, shadcn/ui, the Vercel AI SDK and Google's Gemma/Gemini models, with answers grounded in portfolio data and optional Google Search.",
      tags: ["Next.js", "AI SDK", "Tailwind CSS"],
      categories: ["Web App", "AI"],
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

  homePage: {
    availability: "Available for new opportunities",
    greeting: "Hi, I'm",
    intro:
      "I build production React.js and Next.js applications, with a focus on frontend architecture, performance and SEO. I enjoy solving complex problems and shipping products that deliver real user impact.",
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
      '  skills: ["React", "Next.js", "TypeScript"],',
      '  focus: "Scalable Products",',
      "  alwaysLearning: true,",
      "}",
    ],
    whatIDo: [
      { title: "Build Products", text: "Turn ideas into scalable web applications.", icon: Blocks },
      { title: "Solve Problems", text: "Design clean and efficient solutions.", icon: Lightbulb },
      { title: "Optimize Performance", text: "Focus on speed, SEO and Core Web Vitals.", icon: Zap },
      { title: "Collaborate", text: "Work with cross-functional teams to ship to production.", icon: Users },
    ],
    featuredTitle: "Featured Projects",
    featuredSubtitle: "Some of the products I've worked on",
    viewAllProjects: "View All Projects",
    featuredCount: 3,
    blogTitle: "Latest Blog Posts",
    blogSubtitle: "Thoughts, tutorials and learning notes",
    viewAllPosts: "View All Posts",
    postsCount: 3,
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
    seoDescription: "About Ayush Pathak, Senior Frontend Engineer: my story, what I do and what I value.",
    eyebrow: "About Me",
    intro:
      "I'm a frontend developer who enjoys building scalable, high-performance web applications using React.js, Next.js and modern technologies. I love solving real world problems, learning new tech and creating products that make an impact.",
    experienceChip: "6+ Years Experience",
    availability: "Open to Opportunities",
    storyTitle: "My Story",
    story: [
      "I started in 2020 at Magic Software, building interactive EdTech modules with React.js and HTML5. Since then I've built LOGITRACK, an IoT shipment-tracking dashboard, and QTickets, a multi-region ticket booking platform. At FITPASS I build fitpass.co.in, the BFF layer, FITSHOP, Partners Studio and the Nutrition Dashboard.",
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
    filters: ["Web App", "PWA", "Architecture", "Performance", "AI"],
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
  const { profile, highlights, experience, skillGroups, education, projects } = PORTFOLIO
  return JSON.stringify(
    {
      profile,
      highlights: highlights.map(({ value, label }) => `${value} ${label}`),
      experience,
      skills: skillGroups,
      education,
      projects: projects.map(({ name, description, tags }) => ({ name, description, tags })),
    },
    null,
    2,
  )
}
