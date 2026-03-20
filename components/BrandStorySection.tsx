"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

export default function BrandStorySection() {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const [loadVideo, setLoadVideo] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadVideo(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: "300px", // laeb enne kui päriselt näha
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-white py-10 md:py-14">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div
          ref={sectionRef}
          className="relative overflow-hidden rounded-[28px] md:rounded-[36px]"
        >
          {/* VIDEO CONTAINER */}
          <div className="relative h-[52vh] sm:h-[60vh] md:h-[70vh] bg-black">

            {loadVideo && (
              <div className="absolute inset-0 overflow-hidden">
                <iframe
                  src="https://player.vimeo.com/video/1162238767?background=1&autoplay=1&muted=1&loop=1&playsinline=1&autopause=0&byline=0&title=0&portrait=0"
                  className="
                    absolute 
                    top-1/2 
                    left-1/2 
                    w-[177.78vh] 
                    h-[100vh] 
                    min-w-full 
                    min-h-full 
                    -translate-x-1/2 
                    -translate-y-1/2
                  "
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/50 pointer-events-none" />
          </div>

          {/* TEXT CONTENT */}
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="max-w-3xl px-6 text-white">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">
                What is Racesin Motorsport?
              </h2>

              <p className="text-sm sm:text-base md:text-lg text-white/90 leading-relaxed mb-8">
                Racesin Motorsport is more than just a name —  it's an attitude,<br />
                a style, and a vision shaped by passion, dedication, and the love of racing.
              </p>

              <Link
                href="/about-us"
                className="inline-block rounded-full bg-white px-10 py-3.5 text-base font-medium text-black hover:bg-neutral-100 transition"
              >
                Read more about us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
