import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ - Racesin Motorsport",
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
