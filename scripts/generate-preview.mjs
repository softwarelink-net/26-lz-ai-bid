import { createWriteStream, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const root = join(fileURLToPath(import.meta.url), '..', '..')
const out = join(root, 'docs/assets/dashboard-preview.png')
mkdirSync(dirname(out), { recursive: true })

const W = 1600
const H = 900

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}

function px(x, y) {
  if (y < 40) return [15, 23, 42]
  if (y < 96) return [255, 255, 255]
  if (x < 240) return [15, 23, 42]
  if (y > 120 && y < 260 && x > 270 && x < 1550) {
    const col = Math.floor((x - 270) / 330)
    const inCard = (x - 270) % 330 > 12 && (x - 270) % 330 < 310
    if (inCard) return col % 2 === 0 ? [241, 245, 249] : [236, 253, 245]
  }
  if (y > 280 && x > 270 && x < 1100) return [255, 255, 255]
  if (y > 280 && x > 1120) return [255, 255, 255]
  return [248, 250, 252]
}

const raw = Buffer.alloc((W * 3 + 1) * H)
for (let y = 0; y < H; y++) {
  const row = y * (W * 3 + 1)
  raw[row] = 0
  for (let x = 0; x < W; x++) {
    const [r, g, b] = px(x, y)
    const i = row + 1 + x * 3
    raw[i] = r
    raw[i + 1] = g
    raw[i + 2] = b
  }
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(W, 0)
ihdr.writeUInt32BE(H, 4)
ihdr[8] = 8
ihdr[9] = 2
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw)),
  chunk('IEND', Buffer.alloc(0)),
])

createWriteStream(out).end(png)
console.log(`wrote ${out}`)
