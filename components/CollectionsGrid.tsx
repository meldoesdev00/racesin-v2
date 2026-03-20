"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import RentalsOverlay from "./RentalsOverlay.client"

const collections = [
  {
    title: "All Products",
    href: "/products",
    image: "/allproducts.png",
    span: "lg:col-span-2 lg:row-span-2",
    headingSize: "text-2xl md:text-3xl",
  },
  {
    title: "Frames",
    href: "/products",
    image: "/apex.png",
    span: "lg:col-span-1 lg:row-span-1",
    headingSize: "text-2xl",
  },
  {
    title: "Rentals",
    href: "/rentals",
    image: "/kart_bg.jpg",
    span: "lg:col-span-1 lg:row-span-1",
    headingSize: "text-2xl",
  },
  {
    title: "Accessories",
    href: "/products",
    image: "/floormat.jpg",
    span: "lg:col-span-2 lg:row-span-1",
    headingSize: "text-2xl",
  },
]

export default function CollectionsGrid() {
  const [isRentalsOpen, setIsRentalsOpen] = useState(false)

  return (
    <>
      <section className="bg-white py-10 md:py-14">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 auto-rows-[220px] sm:auto-rows-[260px] gap-6 sm:gap-8">
            {collections.map((item) => {
              // 🔥 SPECIAL CASE: RENTALS
              if (item.title === "Rentals") {
                return (
                  <button
                    key={item.title}
                    onClick={() => setIsRentalsOpen(true)}
                    className={`group relative overflow-hidden rounded-[26px] md:rounded-[36px] bg-black text-left ${item.span}`}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-black/35 transition-opacity duration-500 group-hover:bg-black/20" />

                    <div className="absolute inset-0 flex items-end p-6 sm:p-8">
                      <p
                        className={`text-white font-semibold leading-tight ${item.headingSize}`}
                      >
                        {item.title}
                      </p>
                    </div>
                  </button>
                )
              }

              // ✅ NORMAL LINKS
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`group relative overflow-hidden rounded-[26px] md:rounded-[36px] bg-black ${item.span}`}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-black/35 transition-opacity duration-500 group-hover:bg-black/20" />

                  <div className="absolute inset-0 flex items-end p-6 sm:p-8">
                    <p
                      className={`text-white font-semibold leading-tight ${item.headingSize}`}
                    >
                      {item.title}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* 🔥 RENTALS OVERLAY */}
      <RentalsOverlay
        isOpen={isRentalsOpen}
        onClose={() => setIsRentalsOpen(false)}
      />
    </>
  )
}
