// Interview prep checklist for the /findjobs dashboard. Topics are fixed here; progress
// (done + notes) is stored per topic id, so renaming a topic keeps its progress.

export type PrepTopic = { id: string; group: string; title: string; hint: string }

export const PREP_TOPICS: readonly PrepTopic[] = [
  { id: "js-closures", group: "JavaScript", title: "Closures and scope", hint: "Explain with a counter or once() example." },
  { id: "js-event-loop", group: "JavaScript", title: "Event loop, microtasks and macrotasks", hint: "Order of setTimeout, Promise.then and await." },
  { id: "js-promises", group: "JavaScript", title: "Promises and async/await", hint: "Write Promise.all and Promise.race by hand." },
  { id: "js-this", group: "JavaScript", title: "this, call, apply and bind", hint: "Write your own bind." },
  { id: "js-prototypes", group: "JavaScript", title: "Prototypes and classes", hint: "How inheritance works under class syntax." },
  { id: "js-debounce", group: "JavaScript", title: "Debounce and throttle", hint: "Implement both from scratch." },
  { id: "js-polyfills", group: "JavaScript", title: "Polyfills: map, filter, reduce", hint: "Common machine-coding warm-up." },

  { id: "react-rendering", group: "React", title: "Rendering and reconciliation", hint: "When and why a component re-renders." },
  { id: "react-fiber", group: "React", title: "Fiber, scheduling and concurrent rendering", hint: "Lanes, time slicing, useTransition." },
  { id: "react-hooks", group: "React", title: "Hooks rules and custom hooks", hint: "useEffect cleanup, dependency arrays." },
  { id: "react-memo", group: "React", title: "memo, useMemo, useCallback", hint: "When they help and when they don't." },
  { id: "react-state", group: "React", title: "State management: Redux, Zustand, React Query", hint: "Client vs server vs URL state." },
  { id: "react-server", group: "React", title: "Server Components and Server Actions", hint: "What runs where, and why." },

  { id: "next-rendering", group: "Next.js", title: "SSR, SSG, ISR and CSR", hint: "Pick one per page and justify it." },
  { id: "next-caching", group: "Next.js", title: "Caching and revalidation", hint: "Cache Components, revalidateTag." },
  { id: "next-routing", group: "Next.js", title: "App Router, layouts and route handlers", hint: "proxy.js, parallel and intercepting routes." },

  { id: "dsa-arrays", group: "DSA", title: "Arrays and strings", hint: "Two pointers, sliding window." },
  { id: "dsa-hashmap", group: "DSA", title: "Hash maps and sets", hint: "Two sum, group anagrams, frequency counts." },
  { id: "dsa-stack-queue", group: "DSA", title: "Stacks and queues", hint: "Valid parentheses, next greater element." },
  { id: "dsa-linked-list", group: "DSA", title: "Linked lists", hint: "Reverse, detect cycle, merge two lists." },
  { id: "dsa-trees", group: "DSA", title: "Trees and recursion", hint: "DFS, BFS, height, level order." },
  { id: "dsa-binary-search", group: "DSA", title: "Binary search", hint: "Search in rotated array, first/last position." },
  { id: "dsa-sorting", group: "DSA", title: "Sorting basics", hint: "Merge sort, quick sort, time complexity." },

  { id: "fe-system-design", group: "System design", title: "Frontend system design", hint: "Design a news feed or an autocomplete." },
  { id: "fe-performance", group: "System design", title: "Performance and Core Web Vitals", hint: "LCP, INP, CLS and how to fix each." },
  { id: "fe-security", group: "System design", title: "Web security basics", hint: "XSS, CSRF, CORS, CSP, cookies." },
  { id: "fe-machine-coding", group: "System design", title: "Machine coding round", hint: "Build a todo, tabs, or infinite scroll in 60 minutes." },
]

export const PREP_TOPIC_IDS = new Set(PREP_TOPICS.map((t) => t.id))
