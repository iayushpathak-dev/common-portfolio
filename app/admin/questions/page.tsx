import { permanentRedirect } from "next/navigation"

// Moved to /userquestions.
export default function QuestionsAdminPage() {
  permanentRedirect("/userquestions")
}
