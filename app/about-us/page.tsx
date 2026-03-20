import Footer from "@/components/Footer"

export default function AboutUsPage() {
  return (
    <>
      <main role="main" id="main" className="anchor bg-white">

        {/* Section 1 - Centered Text */}
        <section className="w-full py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-left lg:text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-gray-900 leading-tight">
              Racesin Motorsport is more than just a name —{" "}
              <span className="hidden lg:inline"><br /></span>
              <strong>it's an attitude, a style, and a vision</strong> shaped by passion,
              dedication, and the love of racing.
            </h2>
          </div>
        </section>

        {/* Section 2 - Full Width Video */}
        <section className="w-full py-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative h-48 sm:h-64 lg:h-80 rounded-lg overflow-hidden">
              <iframe
                src="https://player.vimeo.com/video/1162238767?background=1&autoplay=1&muted=1&loop=1&playsinline=1&autopause=0&byline=0&title=0&portrait=0"
                className="absolute top-1/2 left-1/2 w-[260%] h-[260%] -translate-x-1/2 -translate-y-1/2"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                loading="eager"
                title="Racesin Motorsport Video"
              />
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="w-full py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-left lg:text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-gray-900 leading-tight">
              <strong>Racesin</strong> was born from a lifelong passion for racing,
              deeply rooted in the Reisin family's history.
            </h2>
          </div>
        </section>

        {/* Mobile Only Image */}
        <section className="w-full py-0 block lg:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative h-48 sm:h-64 rounded-lg overflow-hidden">
              <img
                src="/racesin_about_2.jpg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section className="w-full py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="relative h-64 lg:h-96 rounded-lg overflow-hidden order-2 lg:order-1">
                <img
                  src="/racesin_about_3.jpg"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-gray-900 leading-tight">
                  We believe racing is about{" "}
                  <strong>learning, teamwork, and constantly pushing limits</strong> together.
                  Whether it happens on a circuit, in a simulator, or through new technical ideas,
                  quality and authenticity always come first.
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7 */}
        <section className="w-full py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-gray-900 leading-tight">
                  At its core, Racesin is built by people who <strong>race, build and learn.</strong>
                </h2>
              </div>
              <div className="relative h-64 lg:h-96 rounded-lg overflow-hidden">
                <img
                  src="/racesin_about_4.jpg"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
       {/* <section className="w-full py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <a
              href="/products"
              className="inline-block rounded-full bg-black px-10 py-5 text-base font-medium text-white hover:bg-gray-800 transition"
            >
              Check out our products!
            </a>
          </div>
        </section> */}

      </main>

      <Footer />
    </>
  )
}
