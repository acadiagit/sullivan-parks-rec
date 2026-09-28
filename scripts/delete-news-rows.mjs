// delete-news-rows.mjs
// Path: ~/coworker/parks/scripts/delete-news-rows.mjs
// Description: One-time cleanup — lists all rows in `content` with type='news',
//              asks for confirmation, then deletes them. Uses the service role
//              key from .env (bypasses RLS). Run from the project root:
//                node scripts/delete-news-rows.mjs
// ============================================================
import fs from 'node:fs'
import readline from 'node:readline/promises'
import { createClient } from '@supabase/supabase-js'

// Minimal .env reader (no extra dependency)
const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] })
)
const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) { console.error('Missing Supabase URL or service role key in .env'); process.exit(1) }
if (!url.includes('zkdfqpyoleacgwntmzgy')) { console.error(`Unexpected project: ${url} — stopping.`); process.exit(1) }

const supabase = createClient(url, key)

const { data: rows, error } = await supabase
  .from('content').select('id, title, status, created_at').eq('type', 'news')
if (error) { console.error('Read failed:', error.message); process.exit(1) }

if (rows.length === 0) { console.log('No news rows found — nothing to delete.'); process.exit(0) }
console.log(`Found ${rows.length} news row(s) in ${url}:\n`)
console.table(rows)

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const answer = await rl.question(`\nDelete these ${rows.length} row(s) permanently? Type "delete" to confirm: `)
rl.close()
if (answer.trim().toLowerCase() !== 'delete') { console.log('Cancelled — nothing deleted.'); process.exit(0) }

const { error: delErr } = await supabase.from('content').delete().eq('type', 'news')
if (delErr) { console.error('Delete failed:', delErr.message); process.exit(1) }

const { count } = await supabase
  .from('content').select('id', { count: 'exact', head: true }).eq('type', 'news')
console.log(`Done. News rows remaining: ${count ?? 'unknown'}`)
// end of file
