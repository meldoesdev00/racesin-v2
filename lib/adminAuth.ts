import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const SECRET = process.env.ADMIN_SECRET ?? "fallback-secret"
const COOKIE = "admin_session"

export function signAdminToken() {
  return jwt.sign({ admin: true }, SECRET, { expiresIn: "12h" })
}

export function verifyAdminToken(token: string): boolean {
  try {
    const payload = jwt.verify(token, SECRET) as { admin?: boolean }
    return payload.admin === true
  } catch {
    return false
  }
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE)?.value
  if (!token) return false
  return verifyAdminToken(token)
}

export { COOKIE as ADMIN_COOKIE }
