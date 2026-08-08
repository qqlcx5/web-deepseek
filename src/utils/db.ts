// ─── IndexedDB Persistence Module ─────────────────────────────────────────────
// Provides a lazy-singleton IndexedDB wrapper for persisting the entire
// `AppData` structure as a single record under the `appData` store.

import type { AppData } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const DB_NAME = 'cherry-studio-web'
const DB_VERSION = 1
const STORE_NAME = 'appData'
const RECORD_KEY = 'main'

// ─── Lazy singleton ───────────────────────────────────────────────────────────

let dbInstance: IDBDatabase | null = null
let dbOpenPromise: Promise<IDBDatabase> | null = null

/**
 * Open (or create) the IndexedDB database.
 *
 * Uses a lazy singleton pattern: the first call opens the connection,
 * subsequent calls return the cached instance.
 *
 * @returns A promise resolving to the open `IDBDatabase` instance.
 */
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
      resolve(dbInstance)
    }

    request.onerror = () => {
      dbOpenPromise = null
      reject(request.error ?? new Error('Failed to open IndexedDB'))
    }
  })

  return dbOpenPromise
}

/**
 * Persist the full `AppData` structure to IndexedDB.
 *
 * @param data The application data to save.
 * @throws If the IndexedDB write fails.
 */
export async function saveAppData(data: AppData): Promise<void> {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.put({ key: RECORD_KEY, data })

    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Failed to save app data'))
    tx.onabort = () => reject(tx.error ?? new Error('Transaction aborted'))
  })
}

/**
 * Load the persisted `AppData` from IndexedDB.
 *
 * @returns The stored `AppData`, or `null` if no data has been saved yet.
 * @throws If the IndexedDB read fails.
 */
export async function loadAppData(): Promise<AppData | null> {
  const db = await openDB()
  return new Promise<AppData | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(RECORD_KEY)

    request.onsuccess = () => {
      const result = request.result as { key: string; data: AppData } | undefined
      resolve(result?.data ?? null)
    }

    request.onerror = () => reject(request.error ?? new Error('Failed to load app data'))
  })
}

/**
 * Clear all persisted application data from IndexedDB.
 *
 * @throws If the IndexedDB clear operation fails.
 */
export async function clearAppData(): Promise<void> {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.clear()

    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Failed to clear app data'))
  })
}
