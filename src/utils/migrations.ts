// 版本迁移 — Orbit Chat

interface Migration {
  version: number
  migrate: (data: any) => any
}

const migrations: Migration[] = [
  {
    version: 1,
    migrate: (data: any) => {
      // v1: 移除 Cherry 兼容字段，确保 blocks 内联
      if (data.topics) {
        for (const topic of data.topics) {
          if (topic.messages) {
            for (const msg of topic.messages) {
              // 确保有 blocks 数组
              if (!msg.blocks) msg.blocks = []
              // 移除旧字段
              delete msg.content
              delete msg.reasoningContent
              delete msg.error
              delete msg.usage_old
            }
          }
        }
      }
      // 移除旧兼容区
      delete data.cherryData
      delete data.compatZone
      delete data.messageBlocks
      return data
    },
  },
]

export function migrateData(raw: any): any {
  let data = raw
  const currentVersion = data?.version ?? 0

  for (const m of migrations) {
    if (m.version > currentVersion) {
      data = m.migrate(data)
    }
  }

  return data
}

export function getCurrentVersion(): number {
  return migrations[migrations.length - 1]?.version ?? 1
}
