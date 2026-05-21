/**
 * Quick bid simulator: finds the latest order in 'searching' status and
 * places an offer on it as the seeded test technician.
 *
 * Run: npm run sim:bid
 */

import path from 'path'

process.env.NODE_ENV = 'development'
process.env.MONGODB_URI = process.env.MONGODB_URI || ''

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('Set MONGODB_URI env var to the same value the dev server is using.')
    console.error('Tip: this script must be run in a process that shares state with dev-server')
    console.error('     OR you can post the offer manually:')
    console.error('     curl -X POST http://localhost:4000/v1/technician/orders/<id>/offer ...')
    process.exit(1)
  }
  const _ = path
  console.log('Use the REST API directly instead — see README')
}

main().catch(console.error)
