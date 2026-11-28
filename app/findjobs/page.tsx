import { JobDashboard } from "@/components/findjobs/job-dashboard"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Find jobs — private",
  description: "Private job-search dashboard.",
  path: "/findjobs",
  noIndex: true,
})

export default function FindJobsPage() {
  return <JobDashboard />
}
