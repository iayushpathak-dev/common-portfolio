import type { Metadata } from "next";

import { Assistant } from "@/components/assistant/assistant";
import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";
import { GEMINI_MODEL } from "@/lib/model";
import { PORTFOLIO } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: PORTFOLIO.assistantPage.seoTitle,
  description: PORTFOLIO.assistantPage.seoDescription,
};

export default function AssistantPage() {
  return (
    <div className="flex h-dvh flex-col">
      <SiteHeader />
      <Assistant modelId={GEMINI_MODEL} online={Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY)} />
      <MobileNav />
    </div>
  );
}
