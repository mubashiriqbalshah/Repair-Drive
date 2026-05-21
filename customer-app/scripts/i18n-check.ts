/**
 * Verify English and Urdu translation files have the same keys.
 *
 * Run: npm run i18n:check
 */

import en from '../src/i18n/en.json'
import ur from '../src/i18n/ur.json'

type Bag = Record<string, unknown>

function flatKeys(obj: Bag, prefix = ''): string[] {
  const keys: string[] = []
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...flatKeys(v as Bag, path))
    } else {
      keys.push(path)
    }
  }
  return keys
}

const enKeys = new Set(flatKeys(en as unknown as Bag))
const urKeys = new Set(flatKeys(ur as unknown as Bag))

const missingInUr = [...enKeys].filter((k) => !urKeys.has(k))
const missingInEn = [...urKeys].filter((k) => !enKeys.has(k))

let fail = 0

if (missingInUr.length) {
  console.log('❌ Keys present in en.json but missing in ur.json:')
  missingInUr.forEach((k) => console.log(`   - ${k}`))
  fail++
} else {
  console.log(`✓ All ${enKeys.size} English keys are in Urdu`)
}

if (missingInEn.length) {
  console.log('❌ Keys present in ur.json but missing in en.json:')
  missingInEn.forEach((k) => console.log(`   - ${k}`))
  fail++
} else {
  console.log(`✓ All ${urKeys.size} Urdu keys are in English`)
}

process.exit(fail > 0 ? 1 : 0)
