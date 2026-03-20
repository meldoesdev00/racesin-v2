import Link from "next/link"

const footerLinks = [
  {
    title: "Shop",
    links: [
      { label: "Best Sellers", href: "/products" },
      { label: "All Products", href: "/products" },
      { label: "Pre-Built Simulator", href: "/pre-built-set" },
      { label: "Frames", href: "/products" },
      { label: "Accessories", href: "/products" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Shipping", href: "/policies?section=shipping" },
      { label: "Returns", href: "/policies?section=returns" },
      { label: "Warranty", href: "/policies?section=warranty" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Terms & Conditions", href: "/policies?section=terms" },
      { label: "Privacy Policy", href: "/policies?section=privacy" },
      { label: "Cookies Policy", href: "/policies?section=cookies" },
      { label: "Returns & Refunds", href: "/policies?section=returns" },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-20 md:py-28">
        <nav
          suppressHydrationWarning
          className="grid grid-cols-2 gap-x-8 gap-y-14 sm:grid-cols-3 lg:grid-cols-4"
        >
          {footerLinks.map((block) => (
            <div key={block.title}>
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide">
                {block.title}
              </h3>

              <ul className="space-y-3">
                {block.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      suppressHydrationWarning
                      className="text-sm text-black/70 hover:text-black transition keychainify-checked"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  )
}
