import { getAdminSession } from "@/lib/adminAuth"
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/admin/AdminDashboard.client"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const authed = await getAdminSession()
  if (!authed) redirect("/admin/login")
  return <AdminDashboard />
}
