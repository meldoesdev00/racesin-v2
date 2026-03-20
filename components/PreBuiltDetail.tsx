"use client"

import Image from "next/image"
import { useState } from "react"
import Footer from "./Footer"
import ContactDrawer from "./ContactDrawer"

type Product = {
  title: string
  descriptionHtml: string
  images: {
    nodes: {
      url: string
      altText?: string | null
    }[]
  }
}

export default function PreBuiltDetail({ product }: { product: Product }) {
  const [open, setOpen] = useState(false)

  const images = product.images?.nodes ?? []
  const mainImage = images[0]?.url

  return (
    <>
      <main className="w-full px-4 sm:px-6 lg:px-12 py-10 sm:py-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col lg:grid lg:grid-cols-[680px_1fr] gap-12 lg:gap-24 items-start">

            {/* GALLERY */}
            <section className="w-full">
              <div className="relative w-full aspect-square bg-neutral-100 rounded-3xl overflow-hidden max-w-full lg:max-w-[640px] mx-auto">
                {mainImage ? (
                  <Image
                    src={mainImage}
                    alt={product.title}
                    fill
                    sizes="(min-width: 1024px) 640px, 100vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-neutral-400">
                    No image available
                  </div>
                )}
              </div>
            </section>

            {/* INFO */}
            <section className="w-full max-w-[520px] min-w-0 lg:pt-16">
              <h1 className="text-4xl lg:text-5xl font-semibold leading-tight">
                {product.title}
              </h1>

              <div
                className="mt-8 text-base text-neutral-700 leading-relaxed space-y-5"
                dangerouslySetInnerHTML={{
                  __html: product.descriptionHtml,
                }}
              />

              <button
                onClick={() => setOpen(true)}
                className="mt-12 px-8 py-4 rounded-full bg-black text-white hover:opacity-90 transition"
              >
                Contact Us
              </button>
            </section>

          </div>
        </div>
      </main>

      <Footer />

      <ContactDrawer
        isOpen={open}
        onClose={() => setOpen(false)}
        product={product.title}
      />
    </>
  )
}
