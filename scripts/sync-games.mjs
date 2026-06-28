// scripts/sync-games.mjs
import { cp, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dest = join(root, 'public', 'games')

const SOURCES = [
  { slug: 'hexa-merge',  src: 'D:/htdocs/hexa_merge/hexa_merge_web' },
  { slug: 'sudoku',      src: 'D:/htdocs/sudoku/sudoku_clone/src' },
  { slug: 'number-drop', src: 'D:/htdocs/drop_merge/number_drop/frontend/dist' },
]

await rm(dest, { recursive: true, force: true })
await mkdir(dest, { recursive: true })

for (const { slug, src } of SOURCES) {
  if (!existsSync(src)) {
    console.error(`[sync-games] MISSING source: ${src}`)
    process.exitCode = 1
    continue
  }
  await cp(src, join(dest, slug), { recursive: true })
  console.log(`[sync-games] ${slug} <- ${src}`)
}
console.log('[sync-games] done')
