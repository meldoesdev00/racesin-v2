import { redirect } from "next/navigation"
import { getAdminSession } from "@/lib/adminAuth"

export const metadata = { title: "Admin — Racesin" }
export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
