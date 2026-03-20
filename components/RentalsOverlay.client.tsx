"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { useEffect, useState } from "react"

import carImage from "../public/car.png"
import kartImage from "../public/kart.png"

export default function RentalsOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center
      bg-black/70 text-white backdrop-blur-lg px-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-8 text-3xl font-light hover:text-red-500"
      >
        ✕
      </button>

      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 sm:mb-6 select-none">
        Vehicles to rent
      </h2>

      <p className="text-sm sm:text-base mb-8 text-gray-300 text-center select-none leading-relaxed">
        Tap on the vehicle you would like
        <br className="block sm:hidden" />
        <span className="hidden sm:inline"> to rent for testing or racing.</span>
        <span className="block sm:hidden">to rent for testing or racing.</span>
      </p>

      <div
        className="flex gap-12 sm:gap-20 flex-wrap justify-center items-end"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CAR */}
        <div
          className="flex flex-col items-center group select-none cursor-pointer"
          onClick={() => {
            onClose()
            router.push("/rentals/suzuki-swift-v1600")
          }}
        >
          <div className="relative transition-transform duration-300 ease-out group-hover:scale-[1.03]">
            <Image
              src={carImage}
              alt="Rental Car"
              draggable={false}
              className="object-contain pointer-events-none w-[260px] sm:w-[320px] md:w-[380px]"
            />
          </div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg font-semibold tracking-wide">
            Suzuki Swift V1600
          </p>
        </div>

        {/* KART */}
        <div
          className="flex flex-col items-center group select-none cursor-pointer"
          onClick={() => {
            onClose()
            router.push("/rentals/rotax-dd2-tony-kart")
          }}
        >
          <div className="relative transition-transform duration-300 ease-out group-hover:scale-[1.03]">
            <Image
              src={kartImage}
              alt="Rental Kart"
              draggable={false}
              className="object-contain pointer-events-none w-[300px] sm:w-[380px] md:w-[460px]"
            />
          </div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg font-semibold tracking-wide">
            Rotax DD2 – Tony Kart
          </p>
        </div>
      </div>
    </div>
  )
}
