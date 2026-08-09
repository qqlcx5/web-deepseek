import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import type { AppData } from '@/types'
import { clearAppData, loadAppData, saveAppData } from '@/utils/db'
import { DEFAULT_SETTINGS } from '@/utils/data-import'

function createData(): AppData {
  return {
    version: 2,
    providers: [{
      id: 'provider-1',
      name: 'Provider',
      apiHost: 'https://api.example.com',
      models: [{ id: 'model-1', name: 'Model', enabled: true }],
      enabled: true,
    }],
    assistants: [{
      id: 'assistant-1',
      name: 'Assistant',
      prompt: '',
      enabled: true,
      isDefault: true,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    }],
    topics: [],
    settings: { ...DEFAULT_SETTINGS },
  }
}

describe('IndexedDB app data persistence', () => {
  beforeEach(async () => {
    await clearAppData()
  })

  it('saves and restores the normalized AppData record', async () => {
    const data = createData()

    await saveAppData(data)

    await expect(loadAppData()).resolves.toEqual(data)
  })

  it('clears the persisted record', async () => {
    await saveAppData(createData())

    await clearAppData()

    await expect(loadAppData()).resolves.toBeNull()
  })
})
