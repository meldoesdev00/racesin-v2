import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/adminAuth"

export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const propertyId = process.env.GA4_PROPERTY_ID
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON

  if (!propertyId || !serviceAccountJson) {
    return NextResponse.json({ error: "GA4 not configured" }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const days = searchParams.get("days") ?? "28"
  const startDate = `${days}daysAgo`

  try {
    const credentials = JSON.parse(
      Buffer.from(serviceAccountJson, "base64").toString("utf-8")
    )

    const access_token = await getAccessToken(credentials)
    const property = `properties/${propertyId}`
    const baseUrl = "https://analyticsdata.googleapis.com/v1beta"
    const headers = {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    }

    const dateRanges = [{ startDate, endDate: "today" }]

    const [overviewRes, topPagesRes, countriesRes, citiesRes, realtimeRes] = await Promise.all([
      gaFetch(`${baseUrl}/${property}:runReport`, headers, { dateRanges, metrics: [{ name: "screenPageViews" }, { name: "sessions" }, { name: "activeUsers" }, { name: "bounceRate" }, { name: "averageSessionDuration" }] }),
      gaFetch(`${baseUrl}/${property}:runReport`, headers, { dateRanges, dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }], orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: 10 }),
      gaFetch(`${baseUrl}/${property}:runReport`, headers, { dateRanges, dimensions: [{ name: "country" }], metrics: [{ name: "sessions" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 10 }),
      gaFetch(`${baseUrl}/${property}:runReport`, headers, { dateRanges, dimensions: [{ name: "city" }], metrics: [{ name: "sessions" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 10 }),
      gaFetch(`${baseUrl}/${property}:runRealtimeReport`, headers, { dimensions: [{ name: "unifiedScreenName" }], metrics: [{ name: "activeUsers" }], limit: 5 }),
    ])

    const rows = overviewRes.rows?.[0]?.metricValues ?? []
    const overview = {
      pageViews:  parseInt(rows[0]?.value ?? "0"),
      sessions:   parseInt(rows[1]?.value ?? "0"),
      activeUsers: parseInt(rows[2]?.value ?? "0"),
      bounceRate:  parseFloat(rows[3]?.value ?? "0"),
      avgSessionDuration: parseFloat(rows[4]?.value ?? "0"),
    }

    const topPages = (topPagesRes.rows ?? []).map((r: any) => ({
      path: r.dimensionValues?.[0]?.value ?? "",
      views: parseInt(r.metricValues?.[0]?.value ?? "0"),
    }))
    const countries = (countriesRes.rows ?? []).map((r: any) => ({
      name: r.dimensionValues?.[0]?.value ?? "",
      sessions: parseInt(r.metricValues?.[0]?.value ?? "0"),
    }))
    const cities = (citiesRes.rows ?? []).map((r: any) => ({
      name: r.dimensionValues?.[0]?.value ?? "",
      sessions: parseInt(r.metricValues?.[0]?.value ?? "0"),
    }))
    const realtimeActiveUsers = (realtimeRes.rows ?? []).reduce(
      (s: number, r: any) => s + parseInt(r.metricValues?.[0]?.value ?? "0"), 0
    )
    const realtimePages = (realtimeRes.rows ?? []).map((r: any) => ({
      page: r.dimensionValues?.[0]?.value ?? "",
      users: parseInt(r.metricValues?.[0]?.value ?? "0"),
    }))

    return NextResponse.json({ overview, topPages, countries, cities, realtime: { activeUsers: realtimeActiveUsers, pages: realtimePages } })
  } catch (err: any) {
    console.error("GA4 error:", err)
    return NextResponse.json({ error: "GA4 fetch failed", detail: err?.message ?? String(err) }, { status: 500 })
  }
}

async function gaFetch(url: string, headers: Record<string, string>, body: object) {
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) })
  return res.json()
}

function b64url(data: ArrayBuffer | Uint8Array | string) {
  if (typeof data === "string") return Buffer.from(data).toString("base64url")
  return Buffer.from(data instanceof Uint8Array ? data : new Uint8Array(data)).toString("base64url")
}

function pemToBuffer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s/g, "")
  const binary = atob(b64)
  const buf = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i)
  return buf.buffer
}

async function getAccessToken(credentials: { client_email: string; private_key: string }) {
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const payload = b64url(JSON.stringify({
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }))

  const signingInput = `${header}.${payload}`
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToBuffer(credentials.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const enc = new TextEncoder()
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(signingInput))
  const jwt = `${signingInput}.${b64url(sig)}`

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  })
  const data = await res.json()
  return data.access_token as string
}
