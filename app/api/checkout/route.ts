import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { error: "Checkout is currently disabled. Please contact us instead." },
    { status: 503 }
  )
}
