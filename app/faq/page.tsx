'use client'

import { useEffect } from 'react'
import Footer from '@/components/Footer'

const productFaq = [
  {
    q: 'What’s included with this simulator rig?',
    a: 'Each simulator rig comes with the main frame and mounting points for your wheel, pedals, and seat.',
  },
  {
    q: 'Is this simulator compatible with my setup?',
    a: 'Most rigs are compatible with major brands like Logitech, Thrustmaster, and Fanatec.',
  },
  {
    q: 'How much space do I need for this simulator rig?',
    a: 'Most simulator rigs require a space of about 4–6 feet in length and 3–4 feet in width.',
  },
  {
    q: 'I weigh xxx kg. Will the rig support me?',
    a: 'Yes. The aluminum profiles we use are very rigid and far exceed typical human weight limits.',
  },
]


const ordersFaq = [
  {
    q: 'Can I order a seat outside of EU?',
    a: 'At this time, we do not offer shipping for seats outside the EU.',
  },
  {
    q: 'A product is out of stock. When will it be available?',
    a: 'Products become available again as soon as stock is refilled.',
  },
]

function FAQSection({
  id,
  title,
  items,
}: {
  id: string
  title: string
  items: { q: string; a: string }[]
}) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-black/10 bg-black/[0.02] px-8 py-12 sm:px-12 sm:py-16"
    >
      {/* CENTERED 2XL TITLE */}
      <h2 className="text-3xl font-semibold tracking-tight text-center mb-12">
        {title}
      </h2>

      <div className="divide-y divide-black/10">
        {items.map((item, i) => (
          <details key={i} className="group py-6">
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold ">
              <span>{item.q}</span>
              <span className="transition-transform duration-300 group-open:rotate-180 ">
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M1 1.5 6 6.5 11 1.5" />
                </svg>
              </span>
            </summary>

            <div className="mt-4 text-gray-600 leading-relaxed ">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

export default function FAQPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const section = params.get('section')
    if (!section) return

    const el = document.getElementById(section)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <>
      <div className="min-h-screen bg-white text-gray-900">
        <main className="max-w-4xl mx-auto px-6 py-20 space-y-20">

          {/* PAGE TITLE */}
          <header className="text-center">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Frequently Asked Questions
            </h1>
          </header>

          <FAQSection
            id="product"
            title="Product Questions"
            items={productFaq}
          />


          <FAQSection
            id="orders"
            title="Orders & Availability"
            items={ordersFaq}
          />

        </main>
      </div>

      <Footer />
    </>
  )
}
