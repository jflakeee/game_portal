// scripts/sync-games.mjs
import { cp, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dest = join(root, 'public', 'games')

const SOURCES = [
  { slug: 'hexa-merge',  src: 'D:/htdocs/hexa_merge/hexa_merge_web', include: ['index.html', 'src'] },
  { slug: 'sudoku',      src: 'D:/htdocs/sudoku/sudoku_clone/src' },
  { slug: 'number-drop', src: 'D:/htdocs/drop_merge/number_drop/frontend/dist' },
]

await rm(dest, { recursive: true, force: true })
await mkdir(dest, { recursive: true })

for (const { slug, src, include } of SOURCES) {
  if (!existsSync(src)) {
    console.error(`[sync-games] MISSING source: ${src}`)
    process.exitCode = 1
    continue
  }
  if (include) {
    await mkdir(join(dest, slug), { recursive: true })
    for (const entry of include) {
      const entrySrc = join(src, entry)
      if (!existsSync(entrySrc)) {
        console.error(`[sync-games] MISSING include: ${entrySrc}`)
        process.exitCode = 1
        continue
      }
      await cp(entrySrc, join(dest, slug, entry), { recursive: true })
    }
    console.log(`[sync-games] ${slug} <- ${src} (${include.join(', ')})`)
  } else {
    await cp(src, join(dest, slug), { recursive: true })
    console.log(`[sync-games] ${slug} <- ${src}`)
  }
}
console.log('[sync-games] done')
