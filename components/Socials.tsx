"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"

const slides = [
  {
    poster: "/ugc/1.png",
    video: "https://cdn.shopify.com/videos/c/o/v/1fed366ad47f47e7a39c8a96846f25e2.mp4",
    label: "Shop Loop Switch 2",
    href: "/products/switch",
  },
  {
    poster: "/ugc/2.png",
    video: "https://cdn.shopify.com/videos/c/o/v/74638a3b3d154323ac39bf42c4c76a45.mov",
    label: "Shop Loop Dream",
    href: "/products/dream",
  },
  {
    poster: "/ugc/3.png",
    video: "https://cdn.shopify.com/videos/c/o/v/23012d63576541bc9a65860bf3110643.mp4",
    label: "Shop Loop Quiet 2",
    href: "/products/quiet",
  },
]

export default function Sociaks() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(null)

  const scroll = (dir: "left" | "right") => {
    if (!trackRef.current) return
    const width = trackRef.current.clientWidth
    trackRef.current.scrollBy({
      left: dir === "left" ? -width : width,
      behavior: "smooth",
    })
  }

  return (
    <section className="bg-white py-8 sm:py-16 md:py-10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">

        {/* HEADER */}
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-3xl font-semibold">Worn by you</h2>

          <div className="hidden md:flex gap-3">
            <button onClick={() => scroll("left")} className="rounded-full border p-3">
              ←
            </button>
            <button onClick={() => scroll("right")} className="rounded-full border p-3">
              →
            </button>
          </div>
        </div>

        {/* SLIDER */}
        <div
          ref={trackRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2"
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="snap-start shrink-0 w-[220px] sm:w-[260px]"
            >
              <div className="relative aspect-[9/16] rounded-3xl bg-neutral-100 overflow-hidden">
                <Image
                  src={slide.poster}
                  alt=""
                  fill
                  className="object-contain"
                />

                {/* PLAY */}
                <button
                  onClick={() => setActive(i)}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="rounded-full bg-white p-4 shadow">
                    ▶
                  </div>
                </button>
              </div>

              <Link
                href={slide.href}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium"
              >
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {active !== null && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-6">
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setActive(null)}
              className="absolute -top-10 right-0 text-white text-xl"
            >
              ✕
            </button>

            <video
              src={slides[active].video}
              controls
              autoPlay
              className="w-full rounded-2xl"
            />
          </div>
        </div>
      )}
    </section>
  )
}
