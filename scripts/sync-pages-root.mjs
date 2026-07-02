import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))

const copies = [
  ['dist/assets', 'assets'],
  ['dist/media', 'media'],
]

for (const [from, to] of copies) {
  const source = join(root, from)
  const target = join(root, to)

  if (!existsSync(source)) {
    throw new Error(`Missing build output: ${from}`)
  }

  rmSync(target, { recursive: true, force: true })
  mkdirSync(dirname(target), { recursive: true })
  cpSync(source, target, { recursive: true })
}

cpSync(join(root, 'index.html'), join(root, 'dist/index.html'))
