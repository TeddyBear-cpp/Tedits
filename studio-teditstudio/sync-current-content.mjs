import {readFile} from 'node:fs/promises'
import {getCliClient} from 'sanity/cli'

// Run with: pnpm exec sanity exec sync-current-content.mjs --with-user-token
// Add only missing documents and fields; keep existing edits and older projects.
const client = getCliClient({apiVersion: '2026-10-01'})
const seed = (await readFile(new URL('./seed.ndjson', import.meta.url), 'utf8'))
  .trim().split('\n').map(line => JSON.parse(line))

for (const id of ['project-aura', 'project-form-finish']) {
  const document = seed.find(item => item._id === id)
  if (!document) throw new Error(`${id} is missing from the checked-in seed`)
  const existing = await client.getDocument(id)
  if (existing) {
    console.log(`${id}: already present; kept existing content`)
    continue
  }
  const result = await client.createIfNotExists(document)
  console.log(`${id}: created ${result.title}`)
}

const why = await client.getDocument('whyPage')
if (!why) throw new Error('whyPage is missing; initialize it before syncing current content')
const defaults = {
  introQuestion: 'They hear your name. They look you up.\nWhat do they find?',
  benefitChapters: [
    {_key: 'search', _type: 'benefitChapter', tabLabel: 'Search', heading: 'Be found on Google.',
      body: 'Reach people already looking for what you offer. Clear pages about your services and where you work help search engines understand your business.'},
    {_key: 'answers', _type: 'benefitChapter', tabLabel: 'Answers', heading: 'Answers, all together.',
      body: 'Services, prices and FAQs in one easy place. People can find what they need and take the next step, without waiting for a reply in their DMs.'},
    {_key: 'trust', _type: 'benefitChapter', tabLabel: 'Trust', heading: 'Give them confidence.',
      body: 'Let your work, your story and genuine client feedback speak for you. Give someone a clearer sense of who they’re choosing before they get in touch.'},
  ],
  answerHeading: 'Better together.',
  answerBody: 'Social media starts the conversation. Your website gives that interest somewhere to go: a place to explore your business, find the details and get in touch. They work better together.',
}
const missing = Object.fromEntries(Object.entries(defaults).filter(([key]) => why[key] === undefined))
if (Object.keys(missing).length) {
  await client.patch('whyPage').ifRevisionId(why._rev).setIfMissing(missing).commit()
  console.log(`whyPage: added ${Object.keys(missing).join(', ')}`)
} else {
  console.log('whyPage: current fields already present; kept existing content')
}
