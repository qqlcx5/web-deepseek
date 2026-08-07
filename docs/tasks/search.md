---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_c815d024929011f1bafa525400287e28
    ReservedCode1: V3ThCq1otxvw9kWmjzl7fE0EEKhOjyZtO5N0OY9t7AkH7rSgl6pMLXEOhrzKKx9HM1NXY8SQB6M8x8IXGkRWZIr4VyTsXrI7cfkvjViQ7uBLi4kzT4p/SETzh6eOIS5FDIO0wNj9X3YWqt8Pa1IYckp/zzX0wFdbWHffY+WzXj04ai8P3Tzrw0X50hs=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_c815d024929011f1bafa525400287e28
    ReservedCode2: V3ThCq1otxvw9kWmjzl7fE0EEKhOjyZtO5N0OY9t7AkH7rSgl6pMLXEOhrzKKx9HM1NXY8SQB6M8x8IXGkRWZIr4VyTsXrI7cfkvjViQ7uBLi4kzT4p/SETzh6eOIS5FDIO0wNj9X3YWqt8Pa1IYckp/zzX0wFdbWHffY+WzXj04ai8P3Tzrw0X50hs=
---

# 搜索 — 最小可执行任务清单

> 对应详细设计 §8  
> 目标：全局搜索、对话内搜索、高级筛选

## Pinia Store

- [ ] 创建 `useSearchStore`，定义 SearchState 类型和初始状态
- [ ] 实现 `search(req: SearchRequest)`：发起搜索请求 → `request.post('/api/search')`
- [ ] 实现 `loadMore()`：加载下一页搜索结果 → `request.get` 分页
- [ ] 实现 `clearResults()`：清空结果
- [ ] 实现对话内搜索导航：`navigateMatch('next' | 'prev')`，维护 currentMatchIndex
- [ ] 实现搜索建议：`fetchSuggestions(query)` 防抖 300ms → `request.get`
- [ ] 实现搜索历史管理：localStorage 持久化最近 20 条

## 组件

### SearchPage（全局搜索）— [ElInput + ElDrawer + ElSelect]
- [ ] 实现 SearchHeader：搜索输入框（自动聚焦，ElInput）+ scope 切换（全局/当前对话）
- [ ] 实现 AdvancedFilterButton → 展开 AdvancedFilterPanel
- [ ] 实现 AdvancedFilterPanel：DateRangePicker + ModelFilter 多选 + RoleFilter → ElSelect 多选
- [ ] 实现 SearchSuggestions：输入时显示历史搜索 + 实时建议
- [ ] 实现搜索结果统计：`"找到 42 条结果（0.3s）"`
- [ ] 实现 SearchResultCard：对话标题徽章（点击跳转）+ 高亮匹配片段 + 角色图标 + 时间戳 + "跳转到消息"按钮
- [ ] 实现关键词高亮：使用 `<mark>` 标签包裹匹配词
- [ ] 实现 LoadMore 按钮或无限滚动加载更多
- [ ] 实现空状态 → ElEmpty

### InConversationSearch（对话内搜索）— [ElInput + ElDrawer]
- [ ] 实现 SearchBar：Ctrl+F / Cmd+F 快捷键唤起 → ElDrawer / 浮层，含 ElInput
- [ ] 实现匹配计数显示：`"第 3/12 个匹配"`
- [ ] 实现导航按钮（ElButton）：上一条 / 下一条（Enter 下一条 / Shift+Enter 上一条）
- [ ] 实现消息列表内高亮定位：滚动到当前匹配消息并高亮关键词
- [ ] 实现关闭：Esc 键或点击关闭按钮

## API 层 — [hook-fetch: request]

- [ ] 封装 `POST /api/search` → `request.post`
- [ ] 封装 `GET /api/search/suggestions` → `request.get`（防抖）
- [ ] 封装搜索历史 → localStorage 读写
- [ ] 实现清除搜索历史（localStorage removeItem）

## 依赖接口

- 依赖 `useConversationStore`：对话列表（限定搜索范围）
- 依赖 `useMessageStore`：消息数据（对话内搜索定位）

## 技术选型

| 需求 | 选型 | 说明 |
|------|------|------|
| 搜索输入框 | Element Plus: `ElInput` | 搜索栏 + 实时建议 |
| 移动端搜索面板 | Element Plus: `ElDrawer` | 对话内搜索浮层 |
| 筛选控件 | Element Plus: `ElSelect` | 高级筛选多选 |
| 空状态 | Element Plus: `ElEmpty` | 无结果引导 |
| API 请求 | hook-fetch: `request` | `request.get/post(url, params)` |
| 状态管理 | Pinia `defineStore` | 搜索结果 + 历史管理 |
*（内容由AI生成，仅供参考）*
