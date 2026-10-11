import { HomeView } from "@/components/home/home-view";
import { PageShell } from "@/components/page-shell";

export default function HomePage() {
  return (
    <PageShell sidebar={false}>
      <HomeView />
    </PageShell>
  );
}
