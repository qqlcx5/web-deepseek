/// <reference lib="dom" />

/**
 * IndexedDB 存储层
 *
 * 使用原生 IndexedDB API 封装数据库操作。
 * 整个 AppData 以单个 JSON 对象存储在 appData store 中。
 *
 * 数据库：cherry-studio-web，版本 1
 * Object Store：appData（主键 id）
 */

import type { AppData } from '@/types';

// ============================================================================
// 常量
// ============================================================================

/** 数据库名称 */
const DB_NAME = 'cherry-studio-web';

/** 数据库版本 */
const DB_VERSION = 1;

/** Object Store 名称 */
const STORE_NAME = 'appData';

/** appData 在 store 中的固定主键 */
const DATA_KEY = 'current';

// ============================================================================
// 数据库连接
// ============================================================================

let dbInstance: IDBDatabase | null = null;

/**
 * 打开数据库连接。
 * 如果是首次创建或版本升级，会自动创建 appData object store。
 */
function openDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`无法打开 IndexedDB 数据库：${request.error?.message || '未知错误'}`));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 如果 appData store 不存在则创建
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 将 IDBRequest 转换为 Promise。
 */
function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error(`IndexedDB 操作失败：${request.error?.message || '未知错误'}`));
  });
}

// ============================================================================
// 公开 API
// ============================================================================

/**
 * 保存 AppData 到数据库。
 * 如果已有数据则覆盖。
 *
 * @param data - 要保存的应用数据
 */
export async function saveAppData(data: AppData): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  // 使用固定主键存储整个 AppData
  await promisify(store.put({ id: DATA_KEY, ...data }));

  // 等待事务完成
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(new Error(`保存数据事务失败：${transaction.error?.message || '未知错误'}`));
  });
}

/**
 * 从数据库加载 AppData。
 *
 * @returns AppData 对象，如果数据库为空则返回 null
 */
export async function loadAppData(): Promise<AppData | null> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);

  const record = await promisify(store.get(DATA_KEY));

  if (!record) {
    return null;
  }

  // 去掉 id 字段，返回纯净的 AppData
  const { id: _id, ...appData } = record as { id: string } & AppData;
  return appData as AppData;
}

/**
 * 清空数据库中的所有数据。
 */
export async function clearAppData(): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  await promisify(store.clear());

  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(new Error(`清空数据事务失败：${transaction.error?.message || '未知错误'}`));
  });
}
