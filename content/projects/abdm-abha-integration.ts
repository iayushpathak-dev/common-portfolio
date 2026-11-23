import type { Project } from "@/content/types"

export const abdmAbhaIntegration: Project = {
  id: "project-abdm-abha-integration",
  slug: "abdm-abha-integration",
  contentType: "project",
  title: "ABHA Health ID Creation (ABDM)",
  aka: "ABDM integration",
  summary:
    "A web flow inside the FITPASS app where users create their ABHA, India's government health ID under the Ayushman Bharat Digital Mission (ABDM): Aadhaar OTP, mobile verification, choosing an ABHA address and viewing the ABHA card.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Web App", "Integrations"],
  tags: ["ABDM", "ABHA", "Government integration", "Aadhaar OTP", "WebView", "React.js"],
  stack: ["React 19", "Vite", "React Router 7", "Tailwind CSS", "MUI date picker", "crypto-js"],
  visual: { kind: "icon", icon: "shield" },
  updatedAt: "2026-11-24",
  sections: {
    problem:
      "ABHA (Ayushman Bharat Health Account) is a 14-digit health ID issued under India's Ayushman Bharat Digital Mission. With an ABHA number and an ABHA address (a handle like name@abdm), people can link their health records and share them with doctors and insurers with their consent. FITPASS wanted its members to create their ABHA without leaving the app.",
    challenge: `- The flow handles Aadhaar numbers and government OTPs, so nothing sensitive can be exposed in the browser.
- ABDM enrolment is a chain of steps (Aadhaar OTP, then enrolment, then an ABHA address), and each step needs the transaction details from the one before.
- It runs in the app's WebView, so it has to log the user in from the app and fit the app's screen (safe area, hidden nav).`,
    contribution: `I built the ABHA web app that the FITPASS app opens in a WebView. Routes:

| Route | What it does |
|---|---|
| \`/validate\` | Entry from the app. Reads the user token from the URL, logs the user in and checks if they already have an ABHA. If yes, it goes straight to the card. |
| \`/\` | Explains what ABHA is and why to create one |
| \`/create-abha-id\` | Aadhaar number in four 4-digit boxes (auto-moves between boxes) and a consent checkbox. Sends the Aadhaar OTP. |
| \`/otp-verify\` | 6-digit OTP (submits on its own when complete), masked Aadhaar, option to change the mobile number, then enrolment by Aadhaar |
| \`/enrol-address\` | Verifies the mobile with OTP if needed, shows suggested ABHA addresses or lets the user type their own, then creates it |
| \`/view-card\` | Shows the user's ABHA card |

How it works:

- Login from the app: the app passes an encoded token. \`/validate\` checks it with our backend and stores the user. Pages that need a user send people back to the start if there isn't one, and a 401 from any call does the same.
- Enrolment chain: after the Aadhaar OTP, the transaction ID, access token and public key from ABDM are kept and sent with each next step (enrol, mobile update, address suggestions, address creation).
- ABHA address rules: a custom address is checked before it is sent: 8 to 18 characters, letters and numbers, at most one dot or underscore, not at the start or end.
- No direct calls from the browser: every request goes through our proxy as one encrypted payload (URL, method, body), and the response comes back encrypted too. The browser never calls ABDM or our backend URLs directly.
- Fits the app: header colour and spacing follow the safe area the app passes in, and the nav can be hidden by a URL flag.`,
    architecture: `\`\`\`text
FITPASS app ──WebView──► /validate?token=…
                              │ check token, load user, has ABHA?
                 ┌────────────┴────────────┐
              no ABHA                   has ABHA
                 ▼                          ▼
   /  →  /create-abha-id            /view-card
          Aadhaar + consent ──► send OTP
                 ▼
          /otp-verify ──► enrol by Aadhaar (txn id, access token)
                 ▼
          /enrol-address ──► verify mobile (OTP) ──► suggestions / custom address
                 ▼
          /view-card (ABHA card)

Every call: browser ──encrypted payload──► our proxy ──► backend ──► ABDM
\`\`\``,
    decisions: `- **A separate small app** for ABHA, opened in a WebView, so the government flow can change without touching the main app.
- Our backend talks to ABDM, not the browser. The browser only sends encrypted requests to our proxy.
- Check before sending. Aadhaar length, OTP length and ABHA address rules are checked on the client, so users get errors instantly instead of after a failed ABDM call.
- Skip what's done. Users who already have an ABHA land on their card.`,
    tradeoffs: `- **WebView vs native:** one web flow for iOS and Android that updates without a release, but it depends on the WebView for keyboard and layout behaviour.
- Encryption in the browser: hides request details from casual inspection, but a key shipped in client code can be read, so the real protection is that ABDM calls and secrets stay on the server.
- localStorage for the session: keeps the flow alive across reloads, but stores user details on the device, so it should be cleared once the flow ends.`,
    limitations: null,
    impact: null,
    lessons: null,
  },
  relatedArticles: [],
  todos: [],
}
