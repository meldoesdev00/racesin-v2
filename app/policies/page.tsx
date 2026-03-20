'use client'

import { useEffect } from 'react'
import Footer from '@/components/Footer'

export default function PoliciesPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const section = params.get('section')
    if (!section) return

    const el = document.getElementById(section)
    if (!el) return

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [])

  return (
    <>
      <div className="min-h-screen bg-white text-gray-900">
        <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">

          {/* TERMS & CONDITIONS */}
          <article
            id="terms"
            className="rounded-2xl border border-black/10 bg-black/[0.02] p-8 sm:p-12 space-y-6 scroll-mt-28"
          >
            <header>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                Terms & Conditions
              </h1>
              <p className="text-sm text-gray-500">
                Last updated: 19 February 2026
              </p>
            </header>
            
            <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
              <h2 className="text-xl font-bold text-black uppercase">1. General Provisions</h2>
              <p>
                This website is operated by <strong>Racesin Management OÜ</strong> (Registry code: 17208696, J. Sütiste tee 58-56, 13420 Tallinn). By using this site, you agree to these terms. 
              </p>
              
              <h2 className="text-xl font-bold text-black uppercase pt-4">2. Pricing and Taxes</h2>
              <p>
                Racesin Management OÜ <strong>is not a VAT registered entity</strong> (mittemaksukohustuslane). All prices are final and no VAT is added or deductible. We reserve the right to adjust prices without prior notice.
              </p>

              <h2 className="text-xl font-bold text-black uppercase pt-4">3. Payments and Data Transfer</h2>
              <p>
                Racesin Management OÜ is the controller of personal data. We transfer personal data necessary for the execution of payments to the authorized processor <strong>Maksekeskus AS</strong> and/or <strong>Shopify Payments</strong>.
              </p>

              <h2 className="text-xl font-bold text-black uppercase pt-4">4. Safety and Liability Waiver</h2>
              <p>
                Our products (aluminum simulator rigs and accessories) are technical components that require proper assembly. <strong>Racesin Management OÜ is not liable</strong> for damages to third-party hardware (wheels, pedals, monitors) or personal injury resulting from incorrect or negligent assembly or exceeding the load capacity of the profiles.
              </p>

              <h2 className="text-xl font-bold text-black uppercase pt-4">5. Governing Law</h2>
              <p>
                All legal relations are governed by the laws of the <strong>Republic of Estonia</strong>. Disputes are settled in Harju County Court.
              </p>

              <h2 className="text-xl font-bold text-black uppercase pt-4">6. Contact</h2>
              <p>
                Phone: +372 565 8880<br />
                Emails: <strong>romet@racesin.com</strong> or <strong>kevin@racesin.com</strong>
              </p>
            </div>
          </article>


          {/* PRIVACY POLICY */}
          <article
            id="privacy"
            className="rounded-2xl border border-black/10 bg-black/[0.02] p-8 sm:p-12 space-y-6 scroll-mt-28"
          >
            <header>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                Privacy Policy (GDPR)
              </h1>
              <p className="text-sm text-gray-500">
                Last updated: 19 February 2026
              </p>
            </header>
            <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
              <p>We process your data according to the EU <strong>General Data Protection Regulation (GDPR)</strong>.</p>
              
              <h3 className="text-lg font-semibold text-black pt-4 uppercase">Data Usage</h3>
              <p>We collect data necessary to fulfill your order and provide support. Your data is stored securely and shared only with authorized partners (Shopify, Maksekeskus, Logistics partners).</p>

              <h3 className="text-lg font-semibold text-black pt-4 uppercase">Your Rights</h3>
              <p>You have the right to request access, rectification, or deletion of your data. You also have the right to appeal to the Estonian Data Protection Inspectorate (AKI).</p>
            </div>
          </article>


          {/* COOKIES POLICY */}
          <article
            id="cookies"
            className="rounded-2xl border border-black/10 bg-black/[0.02] p-8 sm:p-12 space-y-6 scroll-mt-28"
          >
            <header>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                Cookies Policy
              </h1>
              <p className="text-sm text-gray-500">
                Last updated: 19 February 2026
              </p>
            </header>
            <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
              <p>This website uses cookies to enhance your browsing experience and provide essential store functionality.</p>
              
              <h3 className="text-lg font-semibold text-black pt-4 uppercase">What are cookies?</h3>
              <p>Cookies are small text files stored on your device. We use <strong>Necessary Cookies</strong> (required for the shopping cart and secure login) and <strong>Analytical Cookies</strong> (to understand how visitors use our site).</p>

              <h3 className="text-lg font-semibold text-black pt-4 uppercase">Managing Cookies</h3>
              <p>Our store is hosted on Shopify, which uses cookies to track session data and performance. You can disable cookies in your browser settings, but please note that some parts of the store (like the checkout) may not function correctly without them.</p>
            </div>
          </article>


          {/* REFUND & RETURNS */}
          <article
            id="returns-refunds"
            className="rounded-2xl border border-black/10 bg-black/[0.02] p-8 sm:p-12 space-y-6 scroll-mt-28"
          >
            <header>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                Refund & Return Policy
              </h1>
              <p className="text-sm text-gray-500">
                Last updated: 19 February 2026
              </p>
            </header>
            <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
              <p>Consumers have a 14-day right of withdrawal from the contract under the Law of Obligations Act (VÕS).</p>
              
              <h3 className="text-lg font-semibold text-black pt-4 uppercase">Diminished Value</h3>
              <p>
                The product must be returned in its original condition. If the product has been used (e.g., aluminum profiles have been bolted together, leaving mechanical marks), <strong>the consumer is liable for the diminished value of the goods</strong>.
              </p>

              <h3 className="text-lg font-semibold text-black pt-4 uppercase">Return Shipping</h3>
              <p>The consumer bears the cost of returning the goods, unless the goods are defective or do not match the order.</p>

              <h3 className="text-lg font-semibold text-black pt-4 uppercase">Dispute Resolution</h3>
              <p>For complaints, visit the ODR platform: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="underline font-medium text-blue-600">https://ec.europa.eu/consumers/odr</a></p>
            </div>
          </article>


          {/* WARRANTY */}
          <article
            id="warranty"
            className="rounded-2xl border border-black/10 bg-black/[0.02] p-8 sm:p-12 space-y-6 scroll-mt-28"
          >
            <header>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                Warranty & Claims
              </h1>
              <p className="text-sm text-gray-500">
                Last updated: 19 February 2026
              </p>
            </header>
            <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-black uppercase">Statutory Guarantee</h3>
              <p>We are liable for manufacturing defects for 2 years from delivery. For the first year, it is presumed the defect existed at delivery.</p>
              
              <h3 className="text-lg font-semibold text-black pt-4 uppercase">Warranty Exclusions</h3>
              <p>The warranty does not apply if the defect is caused by incorrect assembly, exceeding torque limits, or structural modifications made by the user.</p>
            </div>
          </article>

        </main>
      </div>

      <Footer />
    </>
  )
}