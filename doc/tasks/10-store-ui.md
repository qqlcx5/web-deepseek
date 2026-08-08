# 10 - store-ui（UI 交互态 Store）

> 路径: `src/stores/ui.ts`
> 依赖: 无

---

## 任务清单

### State — 布局

- [ ] T10-1 `sidebarOpen`（移动端侧栏抽屉）、`inspectorOpen`（移动端 Inspector 抽屉）
- [ ] T10-2 `inspectorVisible`（桌面端 Inspector 显隐）、`focusMode`
- [ ] T10-3 `online`（navigator.onLine）、`saving`

### State — 弹窗与 Toast

- [ ] T10-4 `modal`（'' | 'command' | 'model' | 'prompt'）、`commandQuery`
- [ ] T10-5 `toast`、`undoAction`

### State — 模型与工作区

- [ ] T10-6 `models`（ModelUI[]）、`selectedModel`
- [ ] T10-7 `activeWorkspaceId`

### State — 输入

- [ ] T10-8 `nearBottom`、`promptDraft`

### 常量数据

- [ ] T10-9 `workspaces` 列表（personal / product / content）
- [ ] T10-10 `promptPresets` 列表（技术评审 / 产品评审 / 简洁回答）
- [ ] T10-11 `commands` 列表（新建对话 / 切换模型 / 编辑提示词 / 专注模式 / 离线切换）

### Getters

- [ ] T10-12 `filteredCommands` — 按 commandQuery 过滤

### Actions — 布局

- [ ] T10-13 `toggleFocusMode()` — 切换 focusMode，联动 inspector 显隐
- [ ] T10-14 `toggleInspector()` — 桌面端切换 inspectorVisible，移动端切换 inspectorOpen
- [ ] T10-15 `closeInspector()` — 关闭所有形态的 Inspector
- [ ] T10-16 `closeDrawers()` — 关闭 sidebar + inspector 抽屉
- [ ] T10-17 `handleResize()` — 窗口 resize 时根据断点调整布局状态

### Actions — Toast

- [ ] T10-18 `showToast(message, undo?)` — 设置 toast，3.2s 后自动清除
- [ ] T10-19 `undo()` — 执行 undoAction 并清除 toast

### Actions — 模型与命令

- [ ] T10-20 `selectModel(model)` — 设置 selectedModel + 关闭弹窗 + showToast
- [ ] T10-21 `runCommand(cmd)` — switch action 分发到对应操作
- [ ] T10-22 `savePrompt()` — 关闭弹窗 + showToast

### 网络监听

- [ ] T10-23 注册 `window.addEventListener('online'/'offline')` 事件
- [ ] T10-24 online 事件 → online=true + showToast
- [ ] T10-25 offline 事件 → online=false

### 验证

- [ ] T10-26 测试 toggleFocusMode 联动 inspector 行为
- [ ] T10-27 测试 showToast 自动消失 + undo 功能
- [ ] T10-28 `tsc --noEmit` 类型检查通过
