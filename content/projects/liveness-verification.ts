import type { Project } from "@/content/types"

export const livenessVerification: Project = {
  id: "project-liveness-verification",
  slug: "liveness-verification",
  contentType: "project",
  title: "Liveness Verification and QR Attendance",
  summary:
    "A browser-based liveness check using TensorFlow Face Landmarks Detection to verify users before booking, plus QR code scanning to record gym workout attendance.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["AI", "Web App"],
  tags: ["TensorFlow", "Face Landmarks", "QR Scanning", "Computer Vision"],
  stack: ["TensorFlow.js", "Face Landmarks Detection", "React.js", "Camera APIs"],
  visual: { kind: "icon", icon: "scan-face" },
  updatedAt: "2026-10-18",
  sections: {
    problem: null,
    challenge:
      "Running a face model in the browser means working within device performance limits, varying camera quality and lighting, and clear permission prompts.",
    contribution: `- Built a liveness verification flow using TensorFlow Face Landmarks Detection to verify users before booking.
- Implemented QR code scanning for gym workout attendance.`,
    architecture: `\`\`\`text
Camera stream ──► Face Landmarks Detection (TensorFlow, in the browser)
                    └─► liveness checks ──► verified ──► booking continues
Camera stream ──► QR decoder ──► attendance recorded
\`\`\``,
    decisions: null,
    tradeoffs: `- **In-browser vs server-side inference:** in-browser keeps video on the device and avoids server cost, but depends on the user's hardware and model download size.
- **Landmark-based checks vs dedicated liveness services:** landmark heuristics are cheap and private; commercial liveness APIs resist spoofing better but cost money and send images to a third party.
- **Spoofing:** simple checks can be fooled by videos or masks, so the risk level of the action should decide how strict verification must be.`,
    limitations: null,
    impact: null,
    lessons: null,
  },
  relatedArticles: [],
  todos: [
    "Which liveness checks were used (blinks, head turns, other landmark signals)?",
    "How performance on low-end devices was handled.",
    "Outcomes, limitations and lessons learned.",
  ],
}
