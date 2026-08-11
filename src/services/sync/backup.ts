// ─── Sync Backup & Rollback ────────────────────────────────────────────────
// Versioned snapshot management: backup, list, restore, prune.

import type { RemoteTransport } from '@/services/remote/types'

function rand4(): string {
  return Math.random().toString(36).slice(2, 6)
}

function backupName(): string {
  return `data.backup-${Date.now()}-${rand4()}.json`
}

const BACKUP_PATTERN = /^data\.backup-\d+-[a-z0-9]+\.json$/

/**
 * Read current data.json from remote and save it as a timestamped backup.
 * Returns the backup filename or null if no data.json exists.
 */
export async function backupCurrent(transport: RemoteTransport): Promise<string | null> {
  try {
    const exists = await transport.hasData('data.json')
    if (!exists) return null

    const content = await transport.getText('data.json')
    const name = backupName()
    await transport.putText(name, content)
    return name
  } catch {
    return null
  }
}

/**
 * List all backup snapshots on the remote, sorted chronologically (oldest first).
 */
export async function listBackups(transport: RemoteTransport): Promise<string[]> {
  try {
    const files = await transport.listFiles()
    return files
      .map(f => f.path)
      .filter(name => BACKUP_PATTERN.test(name))
      .sort()
  } catch {
    return []
  }
}

/**
 * Retrieve a specific backup snapshot's raw JSON content.
 */
export async function restoreFromSnapshot(
  transport: RemoteTransport,
  snapshotName: string,
): Promise<string> {
  return transport.getText(snapshotName)
}

/**
 * Delete oldest backups exceeding max, keeping the most recent max backups.
 * Returns the names of deleted backups.
 */
export async function pruneBackups(
  transport: RemoteTransport,
  max = 10,
): Promise<string[]> {
  const backups = await listBackups(transport)
  if (backups.length <= max) return []

  const toDelete = backups.slice(0, backups.length - max)
  for (const name of toDelete) {
    try {
      await transport.remove(name)
    } catch {
      // Ignore individual removal failures — best effort pruning
    }
  }
  return toDelete
}
