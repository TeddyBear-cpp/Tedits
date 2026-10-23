import {getCliClient} from 'sanity/cli'

// Run with: pnpm exec sanity exec append-business-examples.mjs --with-user-token
// Append only the requested examples; preserve existing copy, order and drafts.
const client = getCliClient({apiVersion: '2026-10-01'})
const additions = ['soft play hire', 'an event planner', 'a photographer', 'accommodation',
  'a tour operator', 'a contractor', 'a landscaper', 'properties']
for (const id of ['whyPage', 'drafts.whyPage']) {
  const document = await client.getDocument(id)
  if (!document) {
    if (id === 'whyPage') throw new Error('Published Why Teditstudio document is missing')
    continue
  }
  const existing = document.businessExamples || []
  const businessExamples = [...new Set([...existing, ...additions])]
  if (businessExamples.length > 24) throw new Error('The business list exceeds the editor limit')
  if (businessExamples.length !== existing.length) {
    await client.patch(id).ifRevisionId(document._rev).set({businessExamples}).commit()
  }
  console.log(`${id}: ${businessExamples.length} rotating examples`)
}
