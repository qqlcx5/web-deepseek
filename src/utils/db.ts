// ─── IndexedDB Persistence ───────────────────────────────────────────────────

import type { AppData } from '@/types'

const DB_NAME = 'orbit-chat'
const DB_VERSION = 1
const STORE_NAME = 'appData'
const RECORD_KEY = 'main'

let dbInstance: IDBDatabase | null = null
let dbOpenPromise: Promise<IDBDatabase> | null = null

export function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance)
  if (dbOpenPromise) return dbOpenPromise

  dbOpenPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }
    request.onsuccess = () => {
      dbInstance = request.result
      dbInstance.onversionchange = () => {
        dbInstance?.close()
        dbInstance = null
        dbOpenPromise = null
      }
      resolve(dbInstance)
    }
    request.onerror = () => {
      dbOpenPromise = null
      reject(request.error ?? new Error('无法打开本地数据库'))
    }
  })

  return dbOpenPromise
}

export async function saveAppData(data: AppData): Promise<void> {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put({ key: RECORD_KEY, data })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('本地数据保存失败'))
    tx.onabort = () => reject(tx.error ?? new Error('本地数据保存被取消'))
  })
}

export async function loadAppData(): Promise<unknown | null> {
  const db = await openDB()
  return new Promise<unknown | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(RECORD_KEY)
    request.onsuccess = () => resolve((request.result as { data?: unknown } | undefined)?.data ?? null)
    request.onerror = () => reject(request.error ?? new Error('本地数据读取失败'))
  })
}

export async function clearAppData(): Promise<void> {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('本地数据清除失败'))
  })
}
