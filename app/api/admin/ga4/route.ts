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

    const { BetaAnalyticsDataClient } = await import("@google-analytics/data")
    const analyticsDataClient = new BetaAnalyticsDataClient({ credentials })
    const dateRange = [{ startDate, endDate: "today" }]
    const property = `properties/${propertyId}`

    const [overviewRes, topPagesRes, countriesRes, citiesRes, realtimeRes] = await Promise.all([
      analyticsDataClient.runReport({
        property,
        dateRanges: dateRange,
        metrics: [
          { name: "screenPageViews" },
          { name: "sessions" },
          { name: "activeUsers" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
        ],
      }),
      analyticsDataClient.runReport({
        property,
        dateRanges: dateRange,
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }),
      analyticsDataClient.runReport({
        property,
        dateRanges: dateRange,
        dimensions: [{ name: "country" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      }),
      analyticsDataClient.runReport({
        property,
        dateRanges: dateRange,
        dimensions: [{ name: "city" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      }),
      analyticsDataClient.runRealtimeReport({
        property,
        dimensions: [{ name: "unifiedScreenName" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 5,
      }),
    ])

    const rows = overviewRes[0]?.rows?.[0]?.metricValues ?? []
    const overview = {
      pageViews: parseInt(rows[0]?.value ?? "0"),
      sessions: parseInt(rows[1]?.value ?? "0"),
      activeUsers: parseInt(rows[2]?.value ?? "0"),
      bounceRate: parseFloat(rows[3]?.value ?? "0"),
      avgSessionDuration: parseFloat(rows[4]?.value ?? "0"),
    }

    const topPages = (topPagesRes[0]?.rows ?? []).map((row) => ({
      path: row.dimensionValues?.[0]?.value ?? "",
      views: parseInt(row.metricValues?.[0]?.value ?? "0"),
    }))

    const countries = (countriesRes[0]?.rows ?? []).map((row) => ({
      name: row.dimensionValues?.[0]?.value ?? "",
      sessions: parseInt(row.metricValues?.[0]?.value ?? "0"),
    }))

    const cities = (citiesRes[0]?.rows ?? []).map((row) => ({
      name: row.dimensionValues?.[0]?.value ?? "",
      sessions: parseInt(row.metricValues?.[0]?.value ?? "0"),
    }))

    const realtimeActiveUsers = (realtimeRes[0]?.rows ?? []).reduce(
      (sum, row) => sum + parseInt(row.metricValues?.[0]?.value ?? "0"), 0
    )
    const realtimePages = (realtimeRes[0]?.rows ?? []).map((row) => ({
      page: row.dimensionValues?.[0]?.value ?? "",
      users: parseInt(row.metricValues?.[0]?.value ?? "0"),
    }))

    return NextResponse.json({ overview, topPages, countries, cities, realtime: { activeUsers: realtimeActiveUsers, pages: realtimePages } })
  } catch (err: any) {
    console.error("GA4 error:", err)
    return NextResponse.json({ error: "GA4 fetch failed", detail: err?.message ?? String(err) }, { status: 500 })
  }
}
