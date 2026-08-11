# 02 - 本地持久化（IndexedDB）

> 需求来源：§3 F-05, §7 持久化和版本迁移  
> 优先级：P0  
> 目标：AppData 存入 IndexedDB，支持启动恢复、防抖保存、版本迁移

## 任务清单

### 2.1 IndexedDB 封装

- [ ] 创建 `src/utils/db.ts`，封装 IndexedDB 操作（open/get/set/delete）
- [ ] database: `orbit-chat`，objectStore: `appData`，record key: `main`
- [ ] 提供 `loadAppData(): Promise<AppData | null>` 和 `saveAppData(data: AppData): Promise<void>`

### 2.2 保存策略

- [ ] 创建 `src/utils/saveQueue.ts`，实现串行 + 200ms 防抖保存
- [ ] 流式过程中仅在开始/批次/结束时触发保存（非每 token）
- [ ] 暴露保存状态：`idle | saving | error | done`

### 2.3 启动恢复

- [ ] 应用启动时调用 `loadAppData()` 恢复全部业务数据
- [ ] 无数据时使用默认种子数据（默认 Provider + 默认 Assistant）
- [ ] 恢复后设置 `activeTopicId` 为最近更新的 Topic

### 2.4 版本迁移

- [ ] 创建 `src/utils/migrations.ts`，定义 `Migration[]` 数组
- [ ] 迁移规则：按 `AppData.version` 顺序执行
- [ ] 旧数据含 `cherryData` / `compatZone` / `messageBlocks` 时删除，保留内嵌 `blocks[]`
- [ ] 迁移前保留原记录副本；失败时不覆盖

### 2.5 appStore 集成

- [ ] `src/stores/app.ts` 添加 `init()` action：loadAppData → 迁移 → 写入 store
- [ ] store 变更触发防抖保存（watch providers/assistants/topics/settings）
- [ ] 暴露 `saveStatus` ref 供顶栏显示

### 2.6 删除引用保护

- [ ] 删除 Provider 前检查 Assistant.model 引用
- [ ] 删除 Model 前检查 Assistant.model 引用
- [ ] 删除 Assistant 前检查 Topic.assistantId 引用
- [ ] 阻止删除并返回引用列表

## 验收

- 创建数据 → 刷新页面 → 数据一致
- 保存状态在顶栏可见
- 版本迁移不丢数据
