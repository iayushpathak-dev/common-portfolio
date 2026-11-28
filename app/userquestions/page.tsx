import { QuestionsAdmin } from "@/components/admin/questions-admin"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "User questions — private",
  description: "Review questions visitors asked that the assistant couldn't answer.",
  path: "/userquestions",
  noIndex: true,
})

export default function UserQuestionsPage() {
  return <QuestionsAdmin />
}
