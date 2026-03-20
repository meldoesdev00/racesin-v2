"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

const slides = [
  {
    src: "/simulatorrentpic.jpg",
    title: "High-Quality\nSimulator Frames",
    subtitle:
      "We offer the highest quality sim-racing products — \nbuilt with precision, performance, and passion.",
    cta: "Shop Now",
    href: "/products",
  },
  {
    src: "/prebuiltsets.jpg",
    title: "Pre-Made Sets\nGrab and Drive",
    subtitle:
      "At Racesin, we craft high-quality sim racing and engineering products,\nblending precision, performance, and passion.",
    cta: "Shop Now",
    href: "/products",
  },
  {
    src: "/hero_simulatorrent.jpg",
    title: "Experience Sim-Racing\nWithout Owning Setup",
    subtitle:
      "With our simulator rent, you can have a high-quality sim racing setup for a day,\na weekend, or even longer.",
    cta: "Contact Us",
    href: "/contact",
  },
]

export default function HeroSlider() {
  const [[active, direction], setActive] = useState([0, 0])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const paginate = (dir: number) => {
    setActive(([prev]) => {
      const next = (prev + dir + slides.length) % slides.length
      return [next, dir]
    })
  }

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => paginate(1), 30000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [active])

  const swipeConfidenceThreshold = 5000
  const swipePower = (offset: number, velocity: number) =>
    Math.abs(offset) * velocity

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0.9,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0.9,
    }),
  }

  return (
    <section className="bg-white pt-6 sm:pt-8 md:pt-5">
      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="relative h-[68vh] sm:h-[75vh] md:h-[84vh] overflow-hidden rounded-[26px] md:rounded-[36px]">

          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={active}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 120, damping: 25, mass: 1.2 },
                opacity: { duration: 0.25 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              dragMomentum
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x)
                if (swipe < -swipeConfidenceThreshold) paginate(1)
                else if (swipe > swipeConfidenceThreshold) paginate(-1)
              }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              <Image
                src={slides[active].src}
                alt=""
                fill
                sizes="(min-width: 1600px) 1600px, 100vw"
                quality={100}
                className="object-cover"
                priority
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent" />

              <div className="relative z-10 flex h-full items-end">
                <div className="w-full p-5 pb-[16%] sm:p-10 sm:pb-14 md:p-16 md:pb-20 text-white">
                  <div className="max-w-2xl">

                    <motion.h1
                      key={slides[active].title}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="whitespace-pre-line text-4xl sm:text-3xl md:text-5xl font-semibold leading-tight"
                    >
                      {slides[active].title}
                    </motion.h1>

                    <motion.p
                      key={slides[active].subtitle}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="mt-4 text-base sm:text-base md:text-lg text-white/90"
                    >
                      {slides[active].subtitle}
                    </motion.p>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <Link
                        href={slides[active].href}
                        className="mt-6 inline-block rounded-full bg-white px-10 py-3.5 text-base font-medium text-black hover:bg-neutral-100 transition"
                      >
                        {slides[active].cta}
                      </Link>
                    </motion.div>

                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots — outside AnimatePresence so they don't get covered */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 pointer-events-auto">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive([i, i > active ? 1 : -1])}
                className={`h-2.5 rounded-full border-2 border-white transition-all duration-300 ${
                  i === active ? "w-6 bg-white" : "w-2.5 bg-transparent"
                }`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}