import {getCliClient} from 'sanity/cli'
const client = getCliClient({apiVersion:'2026-10-01'})
const before = await client.fetch('*[_id == "whyPage"][0]{_id,startingPrice}')
if (!before) throw new Error('Published Why Tedits document not found')
const result = await client.patch('whyPage').set({startingPrice:200}).commit()
console.log(JSON.stringify({document:result._id,startingPrice:result.startingPrice,previousStartingPrice:before.startingPrice}))
