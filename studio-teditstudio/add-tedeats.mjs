import {readFile} from 'node:fs/promises'
import {getCliClient} from 'sanity/cli'

// pnpm exec sanity exec add-tedeats.mjs --with-user-token
// Create only this new project. Existing portfolio documents and drafts stay intact.
const documents = (await readFile(new URL('./seed.ndjson', import.meta.url), 'utf8'))
  .trim().split('\n').map(line => JSON.parse(line))
const document = documents.find(item => item._id === 'project-tedeats')
if (!document) throw new Error('Tedeats is missing from the checked-in project seed')
const client = getCliClient({apiVersion: '2026-10-01'})
const result = await client.createIfNotExists(document)
console.log(`Portfolio project ready: ${result.title} (${result.concept})`)
