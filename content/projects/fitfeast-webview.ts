import type { Project } from "@/content/types"

export const fitfeastWebview: Project = {
  id: "project-fitfeast-webview",
  slug: "fitfeast-webview",
  contentType: "project",
  title: "FitFeast WebView with Agora Chat and Calls",
  aka: "FitFeast",
  summary:
    "FITPASS's nutrition coaching inside a WebView: meal logging and food search, plus a full chat app with the user's dietitian on Agora Chat (text, images, files, voice notes, video, rich cards) and voice/video calls on Agora RTC, with scheduled calls, call history and ratings.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Web App", "Integrations"],
  tags: ["Agora Chat", "Agora RTC", "WebView", "Real-time", "Video calls", "React.js"],
  stack: [
    "React 19 + TypeScript",
    "Agora Chat SDK (agora-chat)",
    "Agora RTC (agora-rtc-sdk-ng, agora-rtc-react)",
    "hls.js",
    "S3 presigned uploads",
    "MediaRecorder / getUserMedia",
    "Freshchat",
  ],
  featured: true,
  visual: { kind: "icon", icon: "message-circle" },
  updatedAt: "2026-11-24",
  sections: {
    problem:
      "FitFeast members get a personal dietitian. They log meals, follow a meal plan, chat with the dietitian and get on calls, all inside the FITPASS and partner apps through a WebView, without installing anything new.",
    challenge: `- Real-time chat and calls in a WebView: the connection has to survive tokens expiring, the app going to the background and flaky mobile networks.
- The chat is more than text: images, files, voice notes, videos and rich cards (meal plan updates, product cards, coach details, scheduled calls) all arrive as messages.
- Calls run through Agora alongside recording and transcription bots that join the same channel; users must never see those bots as participants.`,
    contribution: `I built the FitFeast web module and its Agora chat and calling integration.

**Routes**

| Route | What it does |
|---|---|
| \`/fitfeast\` | FitFeast home: day selector, meals for the day, calories and nutrients, log a meal, a short health questionnaire (mini HRA) and the profile sheet |
| \`/fitfeast/food-details/:food_id\` | Food details with nutrient values; add the food to a meal |
| \`/fitfeast/call-schedule\` | Pick a dietitian slot and schedule or cancel a call |
| \`/fitfeast/call-history\` | Past and upcoming calls with the dietitian |
| \`/fitfeast/rate-your-nutritionist\` | Rate the dietitian after a call |
| \`/fitfeast/chat\` | Support chat (Freshchat) |
| \`/fitfeast-chat\` | The Agora chat app with the user's dietitian, including voice and video calls |
| \`/fitfeast-chat/call-schedule\` | Schedule a call from inside the chat |

Supporting flows: food search with search history, mobile number verification by OTP before chat, and profile updates from a bottom sheet.

**Agora Chat**

- Session: the backend returns the user's Agora identity, the dietitian's identity and a chat token. The app opens one Agora connection per session and skips duplicate logins.
- Token lifecycle: the token is renewed when Agora warns it is about to expire. If it does expire, the app logs in again with a fresh token, so long sessions in the WebView don't drop.
- History: messages load page by page as the user scrolls up, from the same single-chat conversation that sending writes to.
- Rich messages: custom message types are rendered as cards: meal plan updated, product cards, coach assigned, coach details, call scheduled and general notifications, plus call events in the timeline.
- Media: images, files, voice notes (recorded in the browser with a recording overlay), camera captures and videos. Files upload straight to S3 with presigned URLs, and videos and call recordings play through HLS.
- Presence: the user publishes their own status and subscribes to the dietitian's, which the call flow uses.

**Agora RTC (voice and video calls)**

- Voice and video calls start from the chat. Each call uses a channel named after the call type and both participants, with an RTC token from the backend.
- Incoming calls arrive as custom chat messages that carry the channel, so the same code path handles calls in both directions.
- In-call controls: mute, camera on/off and device selection (cameras and microphones), plus join, leave and remote-user handling.
- Bot filter: Agora's recorder and the speech-to-text agent join calls with fixed UIDs; a blocklist hides them so only real people appear.
- Scheduled-call banner in the chat, call history and post-call rating.

I also wrote an internal doc mapping every Agora call in the codebase (Chat and RTC) to where each key and token comes from, which made debugging token and identity issues much faster.`,
    architecture: `\`\`\`text
FITPASS / partner app (WebView)
   │
   ├─ /fitfeast/*      meals · food search · call schedule · history · rating
   │        └──► FITPASS APIs (meals, dietitians, calls)
   │
   └─ /fitfeast-chat   chat app
            │  backend: user id, dietitian id, chat token
            ▼
       Agora Chat ──► text · custom cards · media (S3 presigned, HLS)
            │          token renew / re-login · presence
            │
            └─ call message ──► Agora RTC channel
                                (voice / video, RTC token from backend,
                                 recorder + STT bots filtered out)
\`\`\``,
    decisions: `- **Agora for chat and calls together.** One vendor for messaging, presence and RTC, so a call can start from a chat message and land back in the same timeline.
- Tokens always from the backend. The app never builds Agora tokens itself; it asks the backend, and renews or re-logs in on Agora's expiry events.
- Custom messages for business events. Meal plan updates, products and scheduled calls are typed messages rendered as cards, not plain text, so the chat stays the dietitian's main channel.
- Media off the chat server. Files go to S3 through presigned URLs, and the chat message carries only the link.
- Hide bots by UID. A small, explicit blocklist is simpler and safer than guessing which participants are real.`,
    tradeoffs: `- **Agora SDK vs building on WebSockets/WebRTC directly:** Agora handles delivery, presence and media servers, but ties the feature to a vendor and its token model.
- WebView vs native screens: one web codebase for the FITPASS app and every partner app, but camera, microphone and background behaviour depend on each WebView.
- Client-side history paging: fast and simple, but long conversations need careful scroll handling to keep the user's position.`,
    limitations: null,
    impact: null,
    lessons: null,
  },
  relatedArticles: [],
  todos: [],
}
