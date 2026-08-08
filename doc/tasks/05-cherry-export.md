# 05 - cherry-export（数据导出模块）

> 路径: `src/utils/cherry-export.ts`
> 依赖: `types`, `db`

---

## 任务清单

### 引用完整性校验

- [ ] T05-1 实现 `validateReferences(data: AppData): string[]` — 校验 topic.assistantId 存在
- [ ] T05-2 校验 model.providerId 与所属 Provider.id 一致
- [ ] T05-3 校验 message.blocks 中的 block id 存在（如 cherryData 可查）
- [ ] T05-4 返回错误信息数组，空数组表示通过

### 反向构建

- [ ] T05-5 实现 `buildExportJSON(data: AppData, options?: ExportOptions): string` — 优先从 `data.cherryData` 原地更新字段
- [ ] T05-6 无 cherryData 时从业务视图构建完整 data.json 结构
- [ ] T05-7 `ExportOptions.includeApiKeys` 默认 false — 移除所有 `provider.apiKey`
- [ ] T05-8 序列化三层嵌套：`assistants` → JSON.stringify，`persist:cherry-studio` → JSON.stringify，外层 → JSON.stringify

### 下载

- [ ] T05-9 实现 `downloadJson(jsonStr: string, filename: string): void` — Blob + URL.createObjectURL + a.click + revoke

### 验证

- [ ] T05-10 导出后重新导入，数据一致
- [ ] T05-11 验证 apiKey 默认不导出
- [ ] T05-12 引用完整性校验能检测出孤儿 topic
- [ ] T05-13 `tsc --noEmit` 类型检查通过
