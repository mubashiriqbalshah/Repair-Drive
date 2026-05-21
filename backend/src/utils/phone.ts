const PK_PREFIX = '+92'

export function normalizePkPhone(input: string): string | null {
  if (!input) return null
  const cleaned = input.replace(/[\s\-()]/g, '')

  if (/^\+923\d{9}$/.test(cleaned)) return cleaned
  if (/^00923\d{9}$/.test(cleaned)) return `+${cleaned.slice(2)}`
  if (/^923\d{9}$/.test(cleaned)) return `+${cleaned}`
  if (/^03\d{9}$/.test(cleaned)) return `${PK_PREFIX}${cleaned.slice(1)}`
  if (/^3\d{9}$/.test(cleaned)) return `${PK_PREFIX}${cleaned}`

  return null
}

export function isPkMobile(phone: string): boolean {
  return /^\+923\d{9}$/.test(phone)
}
