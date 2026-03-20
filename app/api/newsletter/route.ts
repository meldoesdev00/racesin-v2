import { NextResponse } from "next/server"

const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY
const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (!KLAVIYO_API_KEY || !KLAVIYO_LIST_ID) {
      console.error("Missing Klaviyo env vars")
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
    }

    /* 1️⃣ Create / update profile */
    const profileRes = await fetch("https://a.klaviyo.com/api/profiles/", {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        revision: "2023-10-15",
      },
      body: JSON.stringify({
        data: {
          type: "profile",
          attributes: {
            email,
          },
        },
      }),
    })

    const profileJson = await profileRes.json()

    if (!profileRes.ok) {
      console.error("Profile create failed:", profileJson)
      return NextResponse.json({ error: "Profile creation failed" }, { status: 500 })
    }

    const profileId = profileJson.data.id

    /* 2️⃣ Subscribe profile to list */
    const subscribeRes = await fetch(
      `https://a.klaviyo.com/api/lists/${KLAVIYO_LIST_ID}/relationships/profiles/`,
      {
        method: "POST",
        headers: {
          Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          revision: "2023-10-15",
        },
        body: JSON.stringify({
          data: [
            {
              type: "profile",
              id: profileId,
            },
          ],
        }),
      }
    )

    if (!subscribeRes.ok) {
      const text = await subscribeRes.text()
      console.error("List subscribe failed:", text)
      return NextResponse.json({ error: "Subscription failed" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      code: "WELCOME10",
    })
  } catch (err) {
    console.error("Newsletter error:", err)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
