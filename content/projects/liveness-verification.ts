import type { Project } from "@/content/types"

export const livenessVerification: Project = {
  id: "project-liveness-verification",
  slug: "liveness-verification",
  contentType: "project",
  title: "Liveness Verification and QR Attendance",
  summary:
    "Face-based check-in for gym workouts inside partner apps: an in-browser face check (TensorFlow Face Landmarks + MediaPipe) that grades every camera frame for alignment, eyes, light and blur, captures the sharpest frame, then gets the final liveness verdict from the Luxand photo liveness API (anti-spoofing). QR check-in and bookings fall back to it whenever the backend asks for a face check.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["AI", "Web App"],
  tags: ["TensorFlow.js", "MediaPipe", "Face Landmarks", "Liveness", "QR Scanning", "Computer Vision"],
  stack: [
    "TensorFlow.js Face Landmarks Detection (MediaPipe runtime)",
    "MediaPipe Tasks Vision (FaceLandmarker, BlazeFace)",
    "Luxand photo liveness API",
    "html5-qrcode",
    "React.js",
    "getUserMedia / Canvas",
  ],
  visual: { kind: "icon", icon: "scan-face" },
  updatedAt: "2026-11-24",
  sections: {
    problem:
      "Corporate members check in at gyms by scanning a QR code with their phone. To stop one membership being shared, the backend can ask for a face check before a check-in or a booking, and members also add a verified profile photo. All of it has to run inside partner apps' WebViews on whatever phone the member has.",
    challenge: `- Phones range from flagships to low-end Androids, with different cameras, GPUs and lighting. Some GPUs (Adreno 8xx) break the GPU face model completely.
- The final liveness check (Luxand) is paid per call, so blurry, dark or empty photos must never reach it.
- The face check sits in the middle of other flows (check-in, booking, profile photo, onboarding, device replacement). When it passes, the user has to land back in the right flow with their original action completed.`,
    contribution: `I built the whole flow, from the camera to the check-in.

**Live face check in the browser**

- Face detection: TensorFlow Face Landmarks Detection on the MediaPipe runtime (refined landmarks, up to 2 faces), prewarmed before the camera opens.
- GPU fallback: the app reads the GPU name through WebGL. On GPUs known to fail (Adreno 8xx) it switches to MediaPipe Tasks \`FaceLandmarker\` on the CPU, with blink scores from blendshapes. A \`?face_cpu=\` flag forces either path for testing.
- Frame grading (every 250 ms) against a set of rules: face inside the oval, not too far or too close, looking straight (yaw), eyes open (landmark eye openness or blink score), brightness within range, and sharpness measured as the **variance of the Laplacian** on a fixed-size grayscale crop, so the score doesn't change with camera resolution.
- Multiple-face guard: a second, short-range BlazeFace detector scans the area around the face. Another face only counts after 3 frames in a row with enough confidence and size, so detector jitter doesn't block real users.
- Live guidance: each failed rule shows its own message ("Move a little closer", "Too dark", "Hold your phone steady"), with a short grace period so the oval doesn't flicker.
- Strict, then relaxed: strict thresholds for the first 10 seconds, then relaxed ones, so users in poor conditions can still finish. A 30-second timeout ends the scan.
- Auto-capture: once 3 frames in a row pass every rule, the **sharpest** of them is captured, with no "hold still" countdown.
- Camera tuning: front camera with continuous autofocus, exposure and white balance where the device supports it.
- Self-scheduling loop: the detection loop re-schedules itself after each pass instead of \`setInterval\`, so slow detector runs on low-end phones never overlap.

**Capture and liveness**

- The frame is cropped to the preview area and compressed. JPEG quality is lowered step by step, then the size, until it fits the upload limit, so the face stays sharp.
- Local gate before the paid call: the photo must contain exactly one sharp face before it is sent on.
- Final verdict from Luxand: the photo goes to the Luxand photo liveness API, which decides whether it is a real, live person or a spoof (a printed photo, a screen, a mask). The browser checks only make sure a good photo reaches it; Luxand makes the call. Its response is normalised into pass, fail or unknown, and raw spoof messages are replaced with friendly retry text.
- The verified photo is uploaded to the backend, which can reply with a conflict, a block or a retryable failure. Each has its own screen. Users get 2 retries before they are sent home.

**QR check-in, pass and flows**

- QR scan with \`html5-qrcode\` (one scan per open, scanner stopped cleanly). If the backend answers that a face check is required, the user goes straight to the face check.
- Show your pass: a time-stamped QR pass for the member.
- Resume after the check: before the face check, the flow saves where the user came from and the exact request (check-in or reservation). After a pass, that request is **replayed** automatically and the user lands on the right success screen. The same component serves 5 flows: booking, QR check-in, profile photo, onboarding photo and device replacement.
- One-device rule: a reusable \`useDeviceCheck\` gate registers the user's device and sends new or ineligible devices to device-replacement screens (which also use the face check).
- Support tooling: \`?face_debug=1\` shows the camera size and per-frame detector numbers under the oval, for debugging Android devices without remote devtools. Every step is tracked in Segment.`,
    architecture: `\`\`\`text
Check-in / booking ──► backend: "face check required" (403)
        │  save origin + request
        ▼
Camera (getUserMedia, continuous focus/exposure)
        │ every 250 ms (self-scheduled)
        ▼
Face Landmarks (TF.js + MediaPipe)  ── or ──  MediaPipe Tasks on CPU (Adreno 8xx)
        + BlazeFace second-face guard
        ▼
Rules: oval · distance · yaw · eyes · light · blur (Laplacian)
        │ strict 10 s → relaxed · guidance messages
        ▼
3 clear frames ──► capture sharpest ──► crop + compress
        ▼
Local gate (1 sharp face) ──► Luxand photo liveness (final verdict)
        ▼
Upload to backend ──► 200: replay saved request ──► success
                  └─► 409 conflict · 410 blocked · 400 retry (max 2)
\`\`\``,
    decisions: `- **Check quality locally, verify liveness with Luxand.** The browser rejects bad frames for free; Luxand, the paid anti-spoofing API, only sees photos likely to pass and gives the final yes or no.
- Pick the device's detector at runtime. Detecting the GPU and falling back to CPU fixed devices where the GPU model returned nothing, without slowing down everyone else.
- Capture the best frame, not the first. Waiting for 3 clear frames and sending the sharpest one avoids uploading a frame caught mid-movement.
- Strict first, relaxed later. Good photos by default, but nobody is stuck forever in bad light.
- The backend decides when a face check is needed. The UI reacts to a 403 on check-in or booking, so the rule can change without an app release.
- Replay instead of restart. Saving the original request means a member who passes the face check doesn't have to scan or book again.`,
    tradeoffs: `- **In-browser vs server-side face detection:** in-browser keeps video on the device and gives instant feedback, but depends on the phone's hardware and the model download.
- Landmark checks vs dedicated liveness services: landmark rules are cheap and private but can be fooled by a photo or video, so the final decision goes to Luxand, a dedicated anti-spoofing API that costs money per call.
- Relaxed thresholds: let more real users through in poor conditions, at the cost of slightly lower photo quality.`,
    limitations: null,
    impact: null,
    lessons: null,
  },
  relatedArticles: [],
  todos: [],
}
