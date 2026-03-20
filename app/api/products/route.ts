import { getProducts } from "@/lib/getProducts"
import { NextResponse } from "next/server"

export async function GET() {
  const products = await getProducts()
  return NextResponse.json(products.slice(0, 6))
}

