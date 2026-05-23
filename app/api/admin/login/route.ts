import { NextResponse } from "next/server"
import { signAdminToken, ADMIN_COOKIE } from "@/lib/adminAuth"

export async function POST(req: Request) {
  const { username, password } = await req.json()

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const token = signAdminToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  })
  return res
}
