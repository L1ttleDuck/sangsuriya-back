import sharp from 'sharp'
import { statSync } from 'node:fs'
import { join } from 'node:path'

const src = join(process.cwd(), 'public', 'imagemap.png')
const sizes = [240, 300, 460, 700, 1040]

for (const s of sizes) {
  const out = join(process.cwd(), 'public', 'gold-price', `${s}.png`)
  await sharp(src)
    .resize(s, s, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toFile(out)
  const stat = statSync(out)
  console.log(`gold-price/${s}.png (${s}x${s}) = ${(stat.size / 1024).toFixed(0)} KB`)
}

console.log('Done')
