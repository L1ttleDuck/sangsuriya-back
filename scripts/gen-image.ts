import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join } from 'path'

const svg = readFileSync(join(process.cwd(), 'public', 'gold-price.svg'))
await sharp(svg).png().toFile(join(process.cwd(), 'public', 'gold-price.png'))
console.log('Generated gold-price.png')
