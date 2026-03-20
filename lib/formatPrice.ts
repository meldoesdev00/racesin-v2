export function formatPrice(amount: string | number) {
  const value = Number(amount)

  if (Number.isNaN(value)) {
    return String(amount)
  }

  return Math.round(value).toString()
}

export function formatEuro(amount: string | number) {
  const value = Number(amount)

  if (Number.isNaN(value)) {
    return `€${String(amount)}`
  }

  // Match screenshot style like "€40,00"
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

