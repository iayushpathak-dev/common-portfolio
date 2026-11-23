import type { Project } from "@/content/types"

export const fitshop: Project = {
  id: "project-fitshop",
  slug: "fitshop",
  contentType: "project",
  title: "Fitshop",
  aka: "FITSHOP e-commerce",
  summary:
    "FITPASS's in-house fitness store on the Next.js App Router: server-rendered catalogue, a variant engine that maps option picks (colour, size, flavour) to the right SKU, a shared cart that merges single products and bundles, coupons, FitCash and one-tap Buy Now.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Web App", "Architecture"],
  tags: ["Next.js App Router", "E-commerce", "Server Components", "Server Actions", "Product Variants", "Cart"],
  stack: ["Next.js App Router", "React Server Components", "Server Actions", "React Context", "Route Handlers", "Tailwind CSS"],
  visual: { kind: "icon", icon: "shopping-bag" },
  updatedAt: "2026-11-23",
  sections: {
    problem:
      "FITPASS members buy supplements, gear and goodies alongside their memberships. One product can come in many variants (flavour × size, colour × size), products can be sold alone or inside bundles, and members pay with coupons and FitCash as well as money.",
    challenge: `- A product page shows **options** (colour, size, flavour), but the backend sells **variants**. The UI has to turn any combination of picks into exactly one variant, with its own price and stock.
- The cart holds single products **and** collections (bundles), and the same product can sit in both. Every "Add" button on every page has to know how many of that product are already in the cart.
- Prices, stock and identity must come from the server. The browser must never build the signed user header the shop APIs need.`,
    contribution: `I rebuilt FITSHOP on the App Router as its own route group inside the website:

- Server-rendered catalogue: shop home, categories (with filters), collections and product pages are Server Components. They fetch data on the server with the user's identity and return HTML. Unknown products show the not-found page.
- Server Actions for the session: login state lives in an encrypted cookie that is created, read and cleared through Server Actions (\`"use server"\`). Server Components read it to build the encrypted identity header for each shop API call, so tokens never reach client code.
- Variant engine: on the product page, each option type has its own picker (colour swatches, size boxes, tags) and defaults to its first value. Every change re-runs a matcher that finds the one variant matching **all** selected options, then updates price, MRP, discount and stock ("Only 3 left"). Each size box also shows its own price for the currently selected colour, so users see the price before they click.
- Smart Add button: a product with one variant goes straight to the cart. A product with several opens a variant picker (bottom sheet on mobile, modal on desktop) that loads variants on demand, with a +/− stepper per variant.
- Cart state for the whole shop: a client layout keeps the cart in React Context. After every change it normalises the server cart, flattening single items and bundle contents into a per-product quantity map and a per-variant list, so every Add button on every page shows the right count.
- Cart and checkout: totals (MRP vs selling price), coupon codes validated by the server, FitCash redemption, address selection, then a pending order with cart and bundle IDs, coupon and wallet details. The user is then redirected to payment and on to an order-status page.
- Buy Now: adds the selected variant with a \`buy_now\` action and goes straight to payment if the user already has an address. If not, it asks for one first.
- Safe mutations: a lock blocks double taps while a cart request is in flight, and server-side rules (out of stock, limits) come back as toast messages instead of failing silently.`,
    architecture: `\`\`\`text
Server Components (home · category · collection · product)
   │  read session cookie (Server Actions manage it)
   │  build encrypted identity header
   └──► Shop APIs ──► HTML with prices, stock, variants

Client layout (React Context: cart, variant picker, loading lock)
   ├─ Add / +/− buttons ──► BFF (/api/service, encrypted) ──► cart add / update
   │        └─ normalise cart ──► { productId → qty }, [variants in cart]
   ├─ Variant picker ──► product variants API (on demand)
   └─ Cart page ──► coupon check ──► FitCash ──► address
                  └─► pending order ──► payment ──► order status
\`\`\``,
    decisions: `- **Server Components for anything with a price.** Catalogue, product and stock data render on the server, so prices are never computed or trusted on the client.
- Server Actions for the session, the BFF for cart calls. Cookie writes stay in Server Actions. Cart, coupon and order calls go through the same encrypted BFF as the rest of the site, so the identity header is added in one place.
- Options vs variants. The UI works with what users understand (colour, size). One matcher converts their picks into the SKU the backend understands.
- Normalise the cart once, read it everywhere. Turning the server cart into a quantity map after each change keeps every button simple and consistent.
- Encrypted product and category URLs. IDs and filters travel encrypted in the URL instead of as raw query parameters.`,
    tradeoffs: `- **Server Components** send less JavaScript and keep data access on the server, but can't use state or effects; the cart, pickers and steppers need Client Components.
- Server Actions vs a BFF route for mutations: Server Actions remove hand-written endpoints, but they are still public HTTP endpoints. A single BFF route keeps encryption, identity and logging in one place, at the cost of one more layer.
- Client-side cart state: instant UI updates and one source of truth for every button, but the cart must be refetched and re-normalised after each change to stay in sync with the server.
- Matching variants on the client: fast and no extra requests, but it depends on consistent option naming from the catalogue data.`,
    limitations: null,
    impact: null,
    lessons: null,
  },
  relatedArticles: [],
  todos: [
    "Why FITSHOP was rebuilt (what was wrong with the previous version?).",
    "Any outcomes (orders, conversion, performance) you can share.",
  ],
}
