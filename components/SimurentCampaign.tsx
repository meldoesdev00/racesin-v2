import Image from "next/image"
import Link from "next/link"

export default function SimurentCampaign() {
  return (
    <section className="bg-white py-10 md:py-14">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="rounded-[28px] bg-black overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">

            <div className="px-6 py-12 sm:px-8 md:px-16 md:py-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white max-w-xl">
                Want to experience simulator without owning your own rig?
              </h2>

              <p className="mt-6 max-w-xl text-base md:text-lg text-white/70 leading-relaxed">
                With our simulator rig rent, you can rent a high-quality sim racing setup for a day, a weekend, or even longer.
              </p>

              <Link
                href="/contact"
                className="mt-8 inline-flex w-full md:w-auto items-center justify-center rounded-full
                  bg-white px-8 py-4 text-base font-medium text-black
                  hover:bg-neutral-200 transition"
              >
                Contact Us
              </Link>
            </div>

            <div className="relative aspect-[1/1] md:aspect-[5/4] w-full">
              <Image
                src="/simulatorrentpic.jpg"
                alt="Simurent campaign"
                fill
                className="object-cover"
                priority
              />
              {/* blend left edge into black on desktop */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent md:block hidden" />
              {/* blend top edge into black on mobile */}
              <div className="absolute inset-0 bg-gradient-to-b from-black via-black/20 to-transparent md:hidden" />
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}