# 13 - utils（工具与辅助模块）

> 路径: `src/utils/`
> 依赖: `types`

---

## 任务清单

### token-counter.ts

- [ ] T13-1 实现 `estimateTokens(text: string): number` — 中文按 1.5 字符/token，英文按 4 字符/token
- [ ] T13-2 实现 `estimateContextPercent(messages: Message[], contextLength: number): number` — 累加所有消息 token / contextLength × 100，上限 100

### format.ts

- [ ] T13-3 实现 `formatTime(iso: string): string` — ISO → "HH:MM" 格式
- [ ] T13-4 实现 `formatFileSize(bytes: number): string` — < 1KB → "1 KB"，< 1MB → "XX KB"，≥ 1MB → "X.X MB"
- [ ] T13-5 实现 `formatDate(iso: string): string` — ISO → "今天" / "昨天" / "MM-DD"

### cn.ts（CSS 类名合并）

- [ ] T13-6 实现 `cn(...classes: (string | undefined | false | null)[]): string` — 过滤 falsy 值，空格拼接

### 验证

- [ ] T13-7 `estimateTokens` 中英文混合文本测试
- [ ] T13-8 `formatFileSize` 边界值测试（0 / 1023 / 1024 / 1048576）
- [ ] T13-9 `tsc --noEmit` 类型检查通过
