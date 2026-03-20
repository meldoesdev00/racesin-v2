import { NextResponse } from "next/server"
import { Resend } from "resend"

const RESEND_API_KEY = process.env.RESEND_API_KEY
const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY
const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID
const CONTACT_TO = process.env.CONTACT_TO || "info@racesin.com"

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export async function POST(req: Request) {
  try {
    const { name, email, phone, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Send email using Resend if configured
    if (resend) {
      try {
        await resend.emails.send({
          from: `info@${process.env.NEXT_PUBLIC_EMAIL_DOMAIN || "racesin.com"}`,
          to: CONTACT_TO,
          subject: `New message from ${name}`,
          replyTo: email,
          text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "N/A"}\n\nMessage:\n${message}`,
        })
      } catch (err) {
        console.error("Resend send error:", err)
      }
    } else {
      console.warn("RESEND_API_KEY not configured; skipping sending email")
    }

    // Attempt to subscribe the email to Klaviyo list if credentials available
    if (KLAVIYO_API_KEY && KLAVIYO_LIST_ID) {
      try {
        const url = `https://a.klaviyo.com/api/v2/list/${KLAVIYO_LIST_ID}/members?api_key=${KLAVIYO_API_KEY}`
        const body = { profiles: [{ email, phone, name }] }
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })

        if (!resp.ok) {
          const text = await resp.text()
          console.error("Klaviyo subscribe failed:", resp.status, text)
        } else {
          const data = await resp.json()
          console.log("Klaviyo subscribe response:", data)
        }
      } catch (err) {
        console.error("Klaviyo error:", err)
      }
    } else {
      console.warn("Klaviyo not configured; skipping subscribe")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("Contact error:", error)
    return NextResponse.json(
      { error: "Failed to send message", details: message },
      { status: 500 }
    )
  }
}
