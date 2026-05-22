import fs from 'fs'
import path from 'path'
import { EMPTY_DB } from './defaults'
import { nextId } from './ids'
import type { LosDatabase } from './types'

export { nextId }

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'los-db.json')

function ensureDb(): LosDatabase {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(EMPTY_DB, null, 2), 'utf-8')
    return structuredClone(EMPTY_DB)
  }
  const raw = fs.readFileSync(DB_FILE, 'utf-8')
  return { ...EMPTY_DB, ...JSON.parse(raw) } as LosDatabase
}

export function readDb(): LosDatabase {
  return ensureDb()
}

export function writeDb(db: LosDatabase): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8')
}
