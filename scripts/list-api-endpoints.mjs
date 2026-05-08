import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const apiRoot = path.join(__dirname, '..', 'app', 'api')

/** @param {string} dir @param {string} rel */
function walk(dir, rel) {
  /** @type {string[]} */
  const out = []
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) {
      const nextRel = rel ? `${rel}/${name}` : name
      out.push(...walk(p, nextRel))
    } else if (name === 'route.ts' || name === 'route.js') {
      out.push(`/api/${rel.replace(/\\/g, '/')}`)
    }
  }
  return out
}

const endpoints = walk(apiRoot, '').sort()
for (const u of endpoints) console.log(u)
