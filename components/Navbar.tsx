"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import RentalsOverlay from "@/components/RentalsOverlay.client"

const navItems = [
  { label: "About Us", href: "/about-us" },
  { label: "Our Products", href: "/products" },
  { label: "Pre-Built Set", href: "/pre-built-set" },
  { label: "Rentals", href: "overlay" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [rentalsOpen, setRentalsOpen] = useState(false)

  return (
    <>
      <header className="bg-white">
        <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 h-20 flex items-center">

          {/* LEFT */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 -ml-2"
              aria-label="Open menu"
            >
              <span className="block w-6 h-[2px] bg-black mb-1" />
              <span className="block w-6 h-[2px] bg-black mb-1" />
              <span className="block w-6 h-[2px] bg-black" />
            </button>

            <Link href="/" className="hidden lg:block">
              <Image
                src="/racesin-logo-black-desktop.svg"
                alt="Racesin Motorsport"
                width={200}
                height={40}
                priority
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* CENTER NAV (DESKTOP) */}
          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex gap-10 whitespace-nowrap">
            {navItems.map((item) =>
              item.href === "overlay" ? (
                <button
                  key={item.label}
                  onClick={() => setRentalsOpen(true)}
                  className="text-base font-medium hover:text-red-500 transition"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-base font-medium hover:text-red-500 transition"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* MOBILE LOGO */}
          <Link
            href="/"
            className="lg:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            aria-label="Home"
          >
            <Image
              src="/racesin-logo-black-desktop.svg"
              alt="Racesin Motorsport"
              width={48}
              height={48}
              priority
              className="h-9 w-auto"
            />
          </Link>


          {/* RIGHT SIDE (DESKTOP ONLY) */}
          <div className="ml-auto hidden lg:flex items-center gap-5">

            {/* Instagram */}
            <Link
              href="https://www.instagram.com/racesin_com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:opacity-60 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
              </svg>
            </Link>

            {/* TikTok */}
            <Link
              href="https://www.tiktok.com/@racesin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="hover:opacity-60 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 448 512"
                fill="currentColor"
                className="translate-y-[1px]"
              >
                <path d="M448 209.9a210.1 210.1 0 0 1-122.8-39.4v178.1a162.6 162.6 0 1 1-141.1-161.6v89.3a73.2 73.2 0 1 0 51.8 69.8V0h90.6a119.2 119.2 0 0 0 121.5 119.2v90.7Z" />
              </svg>
            </Link>

          </div>
        </div>
      </header>

      {/* MOBILE BACKDROP */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* MOBILE MENU */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 ${
          menuOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="rounded-t-3xl bg-white px-6 pt-6 pb-10 shadow-2xl relative">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute right-6 top-4 text-xl"
          >
            ✕
          </button>

          <nav className="mt-8 flex flex-col gap-6">
            {navItems.map((item) =>
              item.href === "overlay" ? (
                <button
                  key={item.label}
                  onClick={() => {
                    setMenuOpen(false)
                    setRentalsOpen(true)
                  }}
                  className="text-lg font-medium text-left"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-lg font-medium"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>
        </div>
      </div>

      <RentalsOverlay
        isOpen={rentalsOpen}
        onClose={() => setRentalsOpen(false)}
      />
    </>
  )
}