// Single source of truth for everything the assistant "knows" about Ayush.
// The chat API serialises this into the model's instructions, so keep it factual.
// TODO: replace the placeholder links and fill in projects/skills with real details.

// TODO: your WhatsApp number with country code, digits only (e.g. "919876543210").
const WHATSAPP_NUMBER = ""

export const profile = {
  name: "Ayush Pathak",
  firstName: "Ayush",
  role: "Senior Frontend Developer",
  tagline:
    "I build scalable, high-performance web applications using React.js, Next.js and modern frontend technologies.",
  avatar: "/avatar.png",
  // Put your resume at public/resume.pdf
  resumeUrl: "/resume.pdf",
  links: {
    github: "https://github.com/",
    // TODO: your LinkedIn profile URL, e.g. "https://www.linkedin.com/in/your-handle/"
    linkedin: "https://www.linkedin.com/",
    whatsapp: `https://wa.me/${WHATSAPP_NUMBER}`,
    email: "mailto:ayushpathakhaldwani@gmail.com",
  },
}

export const experience = [
  {
    company: "Fitpass",
    role: "Senior Frontend Developer",
    highlights: [
      "PWA Development: migrated the Fitpass Consumer App to a Progressive Web App, significantly improving performance and user experience.",
      "BFF Architecture: designed and implemented a Backend-for-Frontend layer that simplified integration with multiple backend services.",
      "Corporate Integrations: built custom integrations for corporate clients, including authentication, access control and reporting modules.",
      "Performance Optimization: improved app loading speed, bundle size and overall performance.",
      "Team Collaboration: shipped features with cross-functional teams and mentored junior developers.",
    ],
  },
]

export const skills = {
  core: ["React.js", "Next.js", "TypeScript", "JavaScript"],
  architecture: ["Progressive Web Apps", "Backend-for-Frontend (BFF)", "Performance optimisation"],
  styling: ["Tailwind CSS", "shadcn/ui"],
  ai: ["Vercel AI SDK", "Gemini API"],
}

export const projects = [
  {
    name: "AI Portfolio Assistant",
    description:
      "This site: a portfolio you can chat with. Built with Next.js, Tailwind CSS, shadcn/ui, the Vercel AI SDK and Gemini, with answers grounded in portfolio data and optional Google Search.",
  },
]

export function portfolioContext() {
  return JSON.stringify({ profile, experience, skills, projects }, null, 2)
}
