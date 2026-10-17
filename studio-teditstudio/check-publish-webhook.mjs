import {getCliClient} from 'sanity/cli'
import {randomUUID} from 'node:crypto'

// Run with the Sanity CLI to exercise publish notifications without editing live content.
const client = getCliClient({apiVersion: '2026-10-01'})
const id = `webhook-check-${randomUUID()}`
async function main() {
  const source = await client.getDocument('menuCatalogue')
  if (!source) throw new Error('Published menu catalogue is missing')
  try {
    await client.create({_id: id, _type: 'menuCatalogue', items: source.items})
    console.log('Created isolated webhook check document; published page content is unchanged.')
  } finally {
    await client.delete(id)
    console.log('Removed isolated check document. Check webhook logs for successful GitHub dispatches.')
  }
}
main().catch(() => {console.error(`Webhook check failed. Verify cleanup of ${id}.`); process.exitCode = 1})
