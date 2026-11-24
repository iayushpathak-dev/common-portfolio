import { QuestionsAdmin } from "@/components/admin/questions-admin"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Assistant questions — admin",
  description: "Review questions the assistant couldn't answer.",
  path: "/admin/questions",
  noIndex: true,
})

export default function QuestionsAdminPage() {
  return <QuestionsAdmin />
}
