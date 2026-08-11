// Cherry Studio v5 持久化 —— localStorage + IndexedDB 分离（对齐 data-schema）
// - localStorage：language / modelscope_token / persist:cherry-studio（PersistRoot 整块）
// - IndexedDB（kv store）：topics / message_blocks / settings / translate_history 整表存

import type {
  CherryData, PersistRoot, DBTopic, MessageBlock, DBSetting, TranslateHistoryItem,
} from '@/types'

const DB_NAME = 'cherry-studio'
const DB_VERSION = 1
const STORE = 'kv'
const LS_PERSIST = 'persist:cherry-studio'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(key)
    req.onsuccess = () => resolve((req.result as T) ?? null)
    req.onerror = () => reject(req.error)
  })
}

async function idbSet(key: string, data: unknown): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(data, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadCherryData(): Promise<CherryData | null> {
  const persistRaw = localStorage.getItem(LS_PERSIST)
  if (!persistRaw) return null
  let persist: PersistRoot
  try {
    persist = JSON.parse(persistRaw) as PersistRoot
  } catch {
    return null
  }

  const language = localStorage.getItem('language') ?? ''
  const modelscope_token = localStorage.getItem('modelscope_token') ?? ''

  const [topics, message_blocks, settings, translate_history] = await Promise.all([
    idbGet<DBTopic[]>('topics'),
    idbGet<MessageBlock[]>('message_blocks'),
    idbGet<DBSetting[]>('settings'),
    idbGet<TranslateHistoryItem[]>('translate_history'),
  ])

  return {
    time: Date.now(),
    version: 5,
    localStorage: { language, modelscope_token, 'persist:cherry-studio': persist },
    indexedDB: {
      files: [],
      topics: topics ?? [],
      settings: settings ?? [],
      knowledge_notes: [],
      translate_history: translate_history ?? [],
      quick_phrases: [],
      message_blocks: message_blocks ?? [],
      translate_languages: [],
      notes_tree: [],
    },
  }
}

export async function saveCherryData(data: CherryData): Promise<void> {
  localStorage.setItem(LS_PERSIST, JSON.stringify(data.localStorage['persist:cherry-studio']))
  localStorage.setItem('language', data.localStorage.language)
  localStorage.setItem('modelscope_token', data.localStorage.modelscope_token)
  await Promise.all([
    idbSet('topics', data.indexedDB.topics),
    idbSet('message_blocks', data.indexedDB.message_blocks),
    idbSet('settings', data.indexedDB.settings),
    idbSet('translate_history', data.indexedDB.translate_history),
  ])
}

export async function deleteCherryData(): Promise<void> {
  localStorage.removeItem(LS_PERSIST)
  localStorage.removeItem('language')
  localStorage.removeItem('modelscope_token')
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
