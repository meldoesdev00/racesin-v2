import ContactForm from "@/components/ContactForm.client"

export const metadata = {
  title: "Contact Us - Racesin Motorsport",
}

export default function ContactPage() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-[1000px] px-4 sm:px-6 py-16">
        <h1 className="text-4xl font-semibold mb-6">Contact Us</h1>

        <p className="text-neutral-600 mb-8">Have a question or need support? Send us a message and we'll get back to you shortly.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <ContactForm />
          </div>

          <div className="rounded-xl bg-neutral-50 p-6">
            <h3 className="text-lg font-semibold mb-3">Contact Details</h3>
            <p className="text-sm text-neutral-700">Email: romet@racesin.com or kevin@racesin.com</p>
            <p className="text-sm text-neutral-700 mt-2">Phone: +372 565 8880</p>

            <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Company Details</h3>
            <p className="text-sm text-neutral-700">Racesin Management OÜ</p>
            <p className="text-sm text-neutral-700 mt-2">Registry Code:	17208696</p>
            <p className="text-sm text-neutral-700 mt-2">J. Sütiste tee 58-56, 13420 Tallinn</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
