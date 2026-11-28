import { Assistant } from "@/components/assistant/assistant";
import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";
import { activeModelLabel, isAssistantOnline } from "@/lib/model";
import { PORTFOLIO } from "@/lib/portfolio";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: PORTFOLIO.assistantPage.seoTitle,
  description: PORTFOLIO.assistantPage.seoDescription,
  path: "/assistant",
});

export default function AssistantPage() {
  return (
    <div className="flex h-dvh flex-col">
      <SiteHeader />
      <Assistant modelId={activeModelLabel()} online={isAssistantOnline()} />
      <MobileNav />
    </div>
  );
}
