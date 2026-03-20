import Image from "next/image"
import Link from "next/link"

export default function ImageOverlayBanner() {
  return (
    <section className="bg-white py-16 md:py-24">
      {/* SAME CONTAINER AS BRAND STORY */}
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[28px] md:rounded-[36px] bg-neutral-100">

          {/* IMAGE */}
          <div className="relative h-[320px] sm:h-[360px] md:h-[420px]">
            <Image
              src="/eventbanner.jpg"
              alt="Sim racing setup"
              fill
              priority
              className="object-cover"
            />

            {/* GRADIENT */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/35 to-transparent" />

            {/* CONTENT — ❗️EI OLE ENAM LISACONTAINERIT */}
            <div className="absolute inset-0 flex items-center">
              <div className="px-5 sm:px-6 text-white max-w-xl">
                <h2 className="text-3xl md:text-4xl font-semibold leading-tight mb-4">
                  Do you want simulator to your event?
                </h2>

                <p className="text-sm md:text-base text-white/85 mb-6">
                  Get contact with us and let's find solution what works for you.
                </p>

                <Link
                  href="/collections"
                  className="inline-flex items-center rounded-full bg-white px-8 py-3 text-sm font-medium text-black hover:bg-neutral-100 transition"
                >
                  Explore products
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
